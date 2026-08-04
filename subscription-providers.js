(function(root){
  "use strict";
  const GOOGLE_PLAY_CONFIG=Object.freeze({subscriptionProductId:"premium_monthly",basePlanId:"monthly",trialOfferId:"premium_trial_3_days",packageName:"se.vaderkompassen.app"});
  const PRODUCT_IDS=Object.freeze({manual_test:"premium_monthly_test",apple:"se.vaderkompassen.premium.monthly",google:GOOGLE_PLAY_CONFIG.subscriptionProductId});
  class SubscriptionProvider{
    constructor(client){this.client=client}
    async getProducts(){return []}
    async initialize(){return {available:false}}
    async isAvailable(){return false}
    async getSubscriptionStatus(){return null}
    async startSubscription(){throw new Error("Prenumerationsprovidern är inte konfigurerad.")}
    async restorePurchases(){throw new Error("Köpåterställning kräver native-appen.")}
    async openManageSubscription(){throw new Error("Prenumerationshantering kräver native-appen.")}
    async syncPurchases(){throw new Error("Köpsynk kräver native-appen.")}
    async dispose(){}
  }
  class ManualTestSubscriptionProvider extends SubscriptionProvider{
    async startSubscription(){return this.rpc("start_manual_test_trial")}
    async openManageSubscription(){return {provider:"manual_test",managedInternally:true}}
    async cancelAtPeriodEnd(){return this.rpc("cancel_manual_test_subscription")}
    async getSubscriptionStatus(){return this.rpc("get_user_entitlement")}
    async rpc(name,args){
      if(!this.client)throw new Error("Supabase är inte konfigurerat.");
      const {data,error}=await this.client.rpc(name,args);
      if(error)throw error;
      return Array.isArray(data)?data[0]:data;
    }
  }
  class NativeSubscriptionProvider extends SubscriptionProvider{
    constructor(client,name,provider,config={}){super(client);this.name=name;this.provider=provider;this.config=config}
    async session(){
      const {data}=await this.client?.auth?.getSession?.()||{};
      if(!data?.session?.access_token||!data?.session?.user?.id)throw new Error("Du måste vara inloggad för att hantera Premium.");
      return data.session;
    }
    async invoke(method,args={}){
      if(!root.VK_NATIVE?.isNativePlatform?.())throw new Error(`${this.name}-integrationen är inte tillgänglig i webbversionen.`);
      return root.VK_NATIVE.purchase(method,{provider:this.provider,...args});
    }
    async getProducts(){return this.invoke("getProducts",{productId:PRODUCT_IDS[this.provider]})}
    async syncBackend(nativeResult,source){
      if(nativeResult?.pending)return {pending:true};
      const transactions=(nativeResult?.transactions||[]).map(item=>item?.signedTransactionInfo).filter(Boolean);
      if(!transactions.length)throw new Error(source==="restore"?"Inga Apple-köp hittades att återställa.":"Apple returnerade ingen verifierbar transaktion.");
      const session=await this.session(),base=String(this.config.apiBaseUrl||"").replace(/\/+$/,'');
      if(!base)throw new Error("Backend för köpverifiering saknas.");
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Number(this.config.apiTimeoutMs)||10000);
      try{
        const response=await root.fetch(`${base}/v1/subscriptions/${this.provider}/sync`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},body:JSON.stringify({signedTransactions:transactions,source}),signal:controller.signal});
        const payload=await response.json().catch(()=>null);
        if(!response.ok||payload?.ok!==true)throw new Error(payload?.error||"Backend kunde inte verifiera Apple-köpet.");
        return payload.entitlement;
      }catch(error){if(error?.name==="AbortError")throw new Error("Verifieringen tog för lång tid. Försök igen.");throw error}
      finally{clearTimeout(timer)}
    }
    async getSubscriptionStatus(){
      const result=await this.invoke("getSubscriptionStatus",{productId:PRODUCT_IDS[this.provider]});
      return result?.transactions?.length?this.syncBackend(result,"status"):null;
    }
    async startSubscription(){
      const session=await this.session(),result=await this.invoke("startSubscription",{productId:PRODUCT_IDS[this.provider],appAccountToken:session.user.id});
      return this.syncBackend(result,"purchase");
    }
    async restorePurchases(){const result=await this.invoke("restorePurchases",{productId:PRODUCT_IDS[this.provider]});return this.syncBackend(result,"restore")}
    async openManageSubscription(){return this.invoke("openManageSubscription")}
    async syncPurchases(){const result=await this.invoke("syncPurchases",{productId:PRODUCT_IDS[this.provider]});return result?.transactions?.length?this.syncBackend(result,"sync"):null}
  }
  class AppleSubscriptionProvider extends NativeSubscriptionProvider{constructor(client,config){super(client,"Apple","apple",config)}}
  class GoogleSubscriptionProvider extends NativeSubscriptionProvider{
    constructor(client,config){super(client,"Google Play","google",config);this.purchasePending=false}
    ensureAndroid(){if(root.VK_NATIVE?.getRuntimePlatform?.()!=="android")throw new Error("Google Play-köp kräver Androidappen.")}
    async initialize(){this.ensureAndroid();return this.invoke("initialize")}
    async isAvailable(){try{return Boolean((await this.initialize())?.available)}catch{return false}}
    async getProducts(){this.ensureAndroid();return this.invoke("getProducts",{productId:GOOGLE_PLAY_CONFIG.subscriptionProductId,basePlanId:GOOGLE_PLAY_CONFIG.basePlanId,trialOfferId:GOOGLE_PLAY_CONFIG.trialOfferId})}
    async accountHash(userId){const bytes=new TextEncoder().encode(String(userId));return [...new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))].map(x=>x.toString(16).padStart(2,"0")).join("")}
    async verifyPurchases(nativeResult,source){
      if(nativeResult?.pending)return {pending:true};
      if(nativeResult?.alreadyOwned)return this.syncPurchases();
      const purchases=(nativeResult?.purchases||[]).filter(item=>item?.purchaseToken&&item?.purchaseState===1);
      if(!purchases.length)throw new Error(source==="restore"?"Inga aktiva Google Play-köp hittades.":"Google Play returnerade inget slutfört köp.");
      const session=await this.session(),base=String(this.config.apiBaseUrl||"").replace(/\/+$/,'');
      if(!base)throw new Error("Backend för köpverifiering saknas.");
      let entitlement=null;
      for(const purchase of purchases){
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Number(this.config.apiTimeoutMs)||10000);
        try{
          const response=await root.fetch(`${base}/v1/subscriptions/google/verify`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},body:JSON.stringify({productId:GOOGLE_PLAY_CONFIG.subscriptionProductId,packageName:GOOGLE_PLAY_CONFIG.packageName,purchaseToken:purchase.purchaseToken,source}),signal:controller.signal});
          const payload=await response.json().catch(()=>null);
          if(!response.ok||payload?.ok!==true)throw new Error(payload?.error||"Backend kunde inte verifiera Google Play-köpet.");
          entitlement=payload.entitlement;
          if(payload.verified&&payload.acknowledgementRequired&&!purchase.acknowledged)await this.invoke("acknowledgePurchase",{purchaseToken:purchase.purchaseToken});
        }catch(error){if(error?.name==="AbortError")throw new Error("Verifieringen tog för lång tid. Försök igen.");throw error}
        finally{clearTimeout(timer)}
      }
      return entitlement;
    }
    async getSubscriptionStatus(){this.ensureAndroid();const result=await this.invoke("getSubscriptionStatus",{productId:GOOGLE_PLAY_CONFIG.subscriptionProductId});return result?.purchases?.length?this.verifyPurchases(result,"status"):null}
    async startSubscription(){
      if(this.purchasePending)throw new Error("Ett köp pågår redan.");this.purchasePending=true;
      try{const session=await this.session(),result=await this.invoke("startSubscription",{productId:GOOGLE_PLAY_CONFIG.subscriptionProductId,basePlanId:GOOGLE_PLAY_CONFIG.basePlanId,offerId:GOOGLE_PLAY_CONFIG.trialOfferId,obfuscatedAccountId:await this.accountHash(session.user.id)});return this.verifyPurchases(result,"purchase")}
      finally{this.purchasePending=false}
    }
    async restorePurchases(){const result=await this.invoke("restorePurchases",{productId:GOOGLE_PLAY_CONFIG.subscriptionProductId});return this.verifyPurchases(result,"restore")}
    async syncPurchases(){const result=await this.invoke("syncPurchases",{productId:GOOGLE_PLAY_CONFIG.subscriptionProductId});return result?.purchases?.length?this.verifyPurchases(result,"sync"):null}
    async openManageSubscription(){return this.invoke("openManageSubscription",{productId:GOOGLE_PLAY_CONFIG.subscriptionProductId,packageName:GOOGLE_PLAY_CONFIG.packageName})}
    async dispose(){try{return await this.invoke("dispose")}catch{}}
  }
  function createProvider(config={},client=null){
    const mode=String(config.subscriptionMode||"disabled");
    if(mode==="manual_test")return new ManualTestSubscriptionProvider(client);
    if(mode==="apple_native")return new AppleSubscriptionProvider(client,config);
    if(mode==="google_native")return new GoogleSubscriptionProvider(client,config);
    return new SubscriptionProvider(client);
  }
  const api={PRODUCT_IDS,GOOGLE_PLAY_CONFIG,SubscriptionProvider,ManualTestSubscriptionProvider,AppleSubscriptionProvider,GoogleSubscriptionProvider,createProvider};
  root.VK_SUBSCRIPTIONS=Object.freeze(api);
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
