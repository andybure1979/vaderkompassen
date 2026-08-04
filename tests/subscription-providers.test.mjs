import test from "node:test";
import assert from "node:assert/strict";
import subscriptions from "../subscription-providers.js";

const clientFor=(handler)=>({rpc:handler});

test("manual_test använder endast säkra RPC-anrop",async()=>{
  const calls=[],provider=subscriptions.createProvider({subscriptionMode:"manual_test"},clientFor(async name=>{calls.push(name);return {data:name.startsWith("cancel")?{provider:"manual_test",subscription_status:"cancelled_active",is_premium:true,cancel_at_period_end:true}:{provider:"manual_test",subscription_status:"trialing",is_premium:true},error:null}}));
  const started=await provider.startSubscription(),cancelled=await provider.cancelAtPeriodEnd();
  assert.equal(started.subscription_status,"trialing");
  assert.deepEqual(cancelled,{provider:"manual_test",subscription_status:"cancelled_active",is_premium:true,cancel_at_period_end:true});
  assert.deepEqual(calls,["start_manual_test_trial","cancel_manual_test_subscription"]);
});

test("Google har central produktkonfiguration och kräver Android native",async()=>{
  const provider=subscriptions.createProvider({subscriptionMode:"google_native"});
  assert.equal(subscriptions.GOOGLE_PLAY_CONFIG.basePlanId,"monthly");
  await assert.rejects(provider.startSubscription(),/inloggad|Android|native/);
});

test("Google acknowledge sker först efter backendverifiering",async()=>{
  const previousNative=globalThis.VK_NATIVE,previousFetch=globalThis.fetch,order=[];
  globalThis.VK_NATIVE={isNativePlatform:()=>true,getRuntimePlatform:()=>"android",purchase:async(method)=>{order.push(method);if(method==="startSubscription")return {purchases:[{purchaseToken:"secret-token",purchaseState:1,acknowledged:false}]};return {acknowledged:true}}};
  globalThis.fetch=async()=>{order.push("backend");return new Response(JSON.stringify({ok:true,verified:true,acknowledgementRequired:true,entitlement:{provider:"google",is_premium:true}}),{status:200,headers:{"content-type":"application/json"}})};
  const client={auth:{getSession:async()=>({data:{session:{access_token:"user-token",user:{id:"11111111-1111-4111-8111-111111111111"}}}})}};
  try{const result=await subscriptions.createProvider({subscriptionMode:"google_native",apiBaseUrl:"https://worker.test"},client).startSubscription();assert.equal(result.is_premium,true);assert.deepEqual(order,["startSubscription","backend","acknowledgePurchase"])}
  finally{globalThis.VK_NATIVE=previousNative;globalThis.fetch=previousFetch}
});

test("Apple skickar StoreKit-transaktionen till backend och använder serverns entitlement",async()=>{
  const previousNative=globalThis.VK_NATIVE,previousFetch=globalThis.fetch,calls=[];
  globalThis.VK_NATIVE={isNativePlatform:()=>true,purchase:async(method,args)=>{calls.push({method,args});return method==="getProducts"?{products:[{id:args.productId,displayPrice:"29 kr"}]}:{transactions:[{signedTransactionInfo:"header.payload.signature"}]}}};
  globalThis.fetch=async(_url,init)=>{calls.push({backend:JSON.parse(init.body),authorization:init.headers.authorization});return new Response(JSON.stringify({ok:true,entitlement:{provider:"apple",is_premium:true,subscription_status:"active"}}),{status:200,headers:{"content-type":"application/json"}})};
  const client={auth:{getSession:async()=>({data:{session:{access_token:"user-token",user:{id:"11111111-1111-4111-8111-111111111111"}}}})}};
  try{
    const provider=subscriptions.createProvider({subscriptionMode:"apple_native",apiBaseUrl:"https://worker.test",apiTimeoutMs:1000},client);
    assert.equal((await provider.getProducts()).products[0].displayPrice,"29 kr");
    const result=await provider.startSubscription();
    assert.equal(result.is_premium,true);
    assert.equal(calls.find(x=>x.method==="startSubscription").args.appAccountToken,"11111111-1111-4111-8111-111111111111");
    assert.equal(calls.find(x=>x.backend).authorization,"Bearer user-token");
  }finally{globalThis.VK_NATIVE=previousNative;globalThis.fetch=previousFetch}
});

test("webbläsaren väljer inte butik utifrån user-agent",()=>{
  const provider=subscriptions.createProvider({subscriptionMode:"disabled"});
  assert.equal(provider.constructor.name,"SubscriptionProvider");
});
