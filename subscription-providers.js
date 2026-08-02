(function(root){
  "use strict";
  const PRODUCT_IDS=Object.freeze({manual_test:"premium_monthly_test",apple:"se.vaderkompassen.premium.monthly",google:"premium_monthly"});
  class SubscriptionProvider{
    constructor(client){this.client=client}
    async getProducts(){return []}
    async getSubscriptionStatus(){return null}
    async startSubscription(){throw new Error("Prenumerationsprovidern är inte konfigurerad.")}
    async restorePurchases(){throw new Error("Köpåterställning kräver native-appen.")}
    async openManageSubscription(){throw new Error("Prenumerationshantering kräver native-appen.")}
    async syncPurchases(){throw new Error("Köpsynk kräver native-appen.")}
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
    constructor(client,name,provider){super(client);this.name=name;this.provider=provider}
    async invoke(method,args={}){
      if(!root.VK_NATIVE?.isNativePlatform?.())throw new Error(`${this.name}-integrationen är inte tillgänglig i webbversionen.`);
      return root.VK_NATIVE.purchase(method,{provider:this.provider,...args});
    }
    async getProducts(){return this.invoke("getProducts")}
    async getSubscriptionStatus(){return this.invoke("getSubscriptionStatus")}
    async startSubscription(){return this.invoke("startSubscription",{productId:PRODUCT_IDS[this.provider]})}
    async restorePurchases(){return this.invoke("restorePurchases")}
    async openManageSubscription(){return this.invoke("openManageSubscription")}
    async syncPurchases(){return this.invoke("syncPurchases")}
  }
  class AppleSubscriptionProvider extends NativeSubscriptionProvider{constructor(client){super(client,"Apple","apple")}}
  class GoogleSubscriptionProvider extends NativeSubscriptionProvider{constructor(client){super(client,"Google Play","google")}}
  function createProvider(config={},client=null){
    const mode=String(config.subscriptionMode||"disabled");
    if(mode==="manual_test")return new ManualTestSubscriptionProvider(client);
    if(mode==="apple_native")return new AppleSubscriptionProvider(client);
    if(mode==="google_native")return new GoogleSubscriptionProvider(client);
    return new SubscriptionProvider(client);
  }
  const api={PRODUCT_IDS,SubscriptionProvider,ManualTestSubscriptionProvider,AppleSubscriptionProvider,GoogleSubscriptionProvider,createProvider};
  root.VK_SUBSCRIPTIONS=Object.freeze(api);
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
