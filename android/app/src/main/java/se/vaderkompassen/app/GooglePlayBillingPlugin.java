package se.vaderkompassen.app;

import android.content.Intent;
import android.net.Uri;
import androidx.annotation.NonNull;
import com.android.billingclient.api.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.*;

@CapacitorPlugin(name = "VaderkompassenPurchases")
public class GooglePlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {
  private BillingClient client;
  private PluginCall purchaseCall;
  private boolean connecting;

  private BillingClient billing() {
    if (client == null) client = BillingClient.newBuilder(getContext())
      .setListener(this)
      .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().enablePrepaidPlans().build())
      .build();
    return client;
  }

  private void ready(PluginCall call, Runnable action) {
    if (billing().isReady()) { action.run(); return; }
    if (connecting) { call.reject("Google Play Billing ansluter. Försök igen.", "BILLING_CONNECTING"); return; }
    connecting = true;
    billing().startConnection(new BillingClientStateListener() {
      @Override public void onBillingSetupFinished(@NonNull BillingResult result) {
        connecting = false;
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) action.run();
        else rejectResult(call, result, "Google Play Billing är inte tillgängligt.");
      }
      @Override public void onBillingServiceDisconnected() { connecting = false; }
    });
  }

  @PluginMethod public void initialize(PluginCall call) { ready(call, () -> call.resolve(new JSObject().put("available", true))); }
  @PluginMethod public void isAvailable(PluginCall call) { ready(call, () -> call.resolve(new JSObject().put("available", true))); }

  private void queryProduct(PluginCall call, java.util.function.Consumer<ProductDetails> success) {
    String productId = call.getString("productId", "").trim();
    if (productId.isEmpty()) { call.reject("Premiumprodukten saknar produkt-ID.", "PRODUCT_ID_MISSING"); return; }
    QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
      .setProductId(productId).setProductType(BillingClient.ProductType.SUBS).build();
    billing().queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(Collections.singletonList(product)).build(),
      (result, detailsResult) -> {
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) { rejectResult(call, result, "Produktdata kunde inte hämtas."); return; }
        ProductDetails found = detailsResult.getProductDetailsList().stream().filter(p -> productId.equals(p.getProductId())).findFirst().orElse(null);
        if (found == null) call.reject("Premiumprodukten finns inte i Google Play.", "PRODUCT_UNAVAILABLE"); else success.accept(found);
      });
  }

  private ProductDetails.SubscriptionOfferDetails chooseOffer(ProductDetails product, String basePlanId, String offerId) {
    List<ProductDetails.SubscriptionOfferDetails> offers = product.getSubscriptionOfferDetails();
    if (offers == null) return null;
    ProductDetails.SubscriptionOfferDetails base = null;
    for (ProductDetails.SubscriptionOfferDetails offer : offers) {
      if (!basePlanId.equals(offer.getBasePlanId())) continue;
      if (offerId != null && !offerId.isEmpty() && offerId.equals(offer.getOfferId())) return offer;
      if (offer.getOfferId() == null) base = offer;
    }
    return base;
  }

  private JSObject productJson(ProductDetails product, String basePlanId, String trialOfferId) {
    JSObject out = new JSObject().put("id", product.getProductId()).put("displayName", product.getName()).put("description", product.getDescription());
    ProductDetails.SubscriptionOfferDetails selected = chooseOffer(product, basePlanId, trialOfferId);
    ProductDetails.SubscriptionOfferDetails base = chooseOffer(product, basePlanId, null);
    if (selected == null) selected = base;
    if (selected != null) {
      List<ProductDetails.PricingPhase> phases = selected.getPricingPhases().getPricingPhaseList();
      ProductDetails.PricingPhase regular = phases.isEmpty() ? null : phases.get(phases.size() - 1);
      if (regular != null) out.put("displayPrice", regular.getFormattedPrice()).put("currencyCode", regular.getPriceCurrencyCode())
        .put("billingPeriod", regular.getBillingPeriod()).put("priceAmountMicros", regular.getPriceAmountMicros());
      out.put("basePlanId", selected.getBasePlanId()).put("offerId", selected.getOfferId()).put("offerToken", selected.getOfferToken());
      if (selected.getOfferId() != null && phases.size() > 1) {
        ProductDetails.PricingPhase intro = phases.get(0);
        out.put("introductoryOffer", new JSObject().put("displayPrice", intro.getFormattedPrice()).put("period", intro.getBillingPeriod())
          .put("recurrenceMode", intro.getRecurrenceMode()).put("billingCycleCount", intro.getBillingCycleCount()));
      }
    }
    return out;
  }

  @PluginMethod public void getProducts(PluginCall call) {
    ready(call, () -> queryProduct(call, product -> call.resolve(new JSObject().put("products", new JSArray(Collections.singletonList(
      productJson(product, call.getString("basePlanId", "monthly"), call.getString("trialOfferId", ""))))))));
  }

  @PluginMethod public void startSubscription(PluginCall call) {
    if (purchaseCall != null) { call.reject("Ett köp pågår redan.", "PURCHASE_IN_PROGRESS"); return; }
    ready(call, () -> queryProduct(call, product -> {
      ProductDetails.SubscriptionOfferDetails offer = chooseOffer(product, call.getString("basePlanId", "monthly"), call.getString("offerId", ""));
      if (offer == null) offer = chooseOffer(product, call.getString("basePlanId", "monthly"), null);
      if (offer == null) { call.reject("Den valda basplanen finns inte i Google Play.", "BASE_PLAN_UNAVAILABLE"); return; }
      BillingFlowParams.ProductDetailsParams detail = BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(product).setOfferToken(offer.getOfferToken()).build();
      BillingFlowParams.Builder params = BillingFlowParams.newBuilder().setProductDetailsParamsList(Collections.singletonList(detail));
      String account = call.getString("obfuscatedAccountId", ""); if (!account.isEmpty()) params.setObfuscatedAccountId(account);
      purchaseCall = call;
      BillingResult result = billing().launchBillingFlow(getActivity(), params.build());
      if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) { purchaseCall = null; rejectResult(call, result, "Google Play kunde inte starta köpet."); }
    }));
  }

  private JSObject purchaseJson(Purchase purchase) {
    return new JSObject().put("productIds", new JSArray(purchase.getProducts())).put("purchaseToken", purchase.getPurchaseToken())
      .put("purchaseState", purchase.getPurchaseState()).put("acknowledged", purchase.isAcknowledged()).put("autoRenewing", purchase.isAutoRenewing());
  }

  private void queryPurchases(PluginCall call) {
    billing().queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build(),
      (result, purchases) -> {
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) { rejectResult(call, result, "Google Play-köp kunde inte hämtas."); return; }
        JSArray values = new JSArray(); for (Purchase purchase : purchases) values.put(purchaseJson(purchase));
        call.resolve(new JSObject().put("purchases", values));
      });
  }
  @PluginMethod public void getSubscriptionStatus(PluginCall call) { ready(call, () -> queryPurchases(call)); }
  @PluginMethod public void restorePurchases(PluginCall call) { ready(call, () -> queryPurchases(call)); }
  @PluginMethod public void syncPurchases(PluginCall call) { ready(call, () -> queryPurchases(call)); }

  @PluginMethod public void acknowledgePurchase(PluginCall call) {
    String token = call.getString("purchaseToken", "");
    if (token.isEmpty()) { call.reject("Köpet saknar verifieringstoken.", "TOKEN_MISSING"); return; }
    ready(call, () -> billing().acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(token).build(), result -> {
      if (result.getResponseCode() == BillingClient.BillingResponseCode.OK || result.getResponseCode() == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED)
        call.resolve(new JSObject().put("acknowledged", true));
      else rejectResult(call, result, "Google Play kunde inte bekräfta köpet.");
    }));
  }

  @PluginMethod public void openManageSubscription(PluginCall call) {
    String productId = call.getString("productId", "premium_monthly");
    Uri uri = Uri.parse("https://play.google.com/store/account/subscriptions?sku=" + Uri.encode(productId) + "&package=" + Uri.encode(getContext().getPackageName()));
    getActivity().startActivity(new Intent(Intent.ACTION_VIEW, uri)); call.resolve();
  }
  @PluginMethod public void dispose(PluginCall call) { if (client != null) client.endConnection(); client = null; call.resolve(); }

  @Override public void onPurchasesUpdated(@NonNull BillingResult result, List<Purchase> purchases) {
    PluginCall call = purchaseCall; purchaseCall = null; if (call == null) return;
    if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) { call.reject("Köpet avbröts.", "PURCHASE_CANCELLED"); return; }
    if (result.getResponseCode() == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) { call.resolve(new JSObject().put("alreadyOwned", true)); return; }
    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || purchases == null) { rejectResult(call, result, "Google Play kunde inte slutföra köpet."); return; }
    JSArray values = new JSArray(); boolean pending = false;
    for (Purchase purchase : purchases) { values.put(purchaseJson(purchase)); pending |= purchase.getPurchaseState() == Purchase.PurchaseState.PENDING; }
    call.resolve(new JSObject().put("pending", pending).put("purchases", values));
  }

  private void rejectResult(PluginCall call, BillingResult result, String message) {
    call.reject(message, "PLAY_BILLING_" + result.getResponseCode());
  }
}
