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
  class NativeUnavailableProvider extends SubscriptionProvider{
    constructor(client,name){super(client);this.name=name}
    unavailable(){throw new Error(`${this.name}-integrationen är inte tillgänglig i webbversionen.`)}
    async startSubscription(){return this.unavailable()}
    async restorePurchases(){return this.unavailable()}
    async openManageSubscription(){return this.unavailable()}
    async syncPurchases(){return this.unavailable()}
  }
  class AppleSubscriptionProvider extends NativeUnavailableProvider{constructor(client){super(client,"Apple")}}
  class GoogleSubscriptionProvider extends NativeUnavailableProvider{constructor(client){super(client,"Google Play")}}
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
