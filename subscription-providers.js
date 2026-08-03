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
  class GoogleSubscriptionProvider extends NativeSubscriptionProvider{constructor(client,config){super(client,"Google Play","google",config)}}
  function createProvider(config={},client=null){
    const mode=String(config.subscriptionMode||"disabled");
    if(mode==="manual_test")return new ManualTestSubscriptionProvider(client);
    if(mode==="apple_native")return new AppleSubscriptionProvider(client,config);
    if(mode==="google_native")return new GoogleSubscriptionProvider(client,config);
    return new SubscriptionProvider(client);
  }
  const api={PRODUCT_IDS,SubscriptionProvider,ManualTestSubscriptionProvider,AppleSubscriptionProvider,GoogleSubscriptionProvider,createProvider};
  root.VK_SUBSCRIPTIONS=Object.freeze(api);
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
