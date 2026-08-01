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

test("Apple och Google är tydliga native-stubbar",async()=>{
  for(const mode of ["apple_native","google_native"]){
    const provider=subscriptions.createProvider({subscriptionMode:mode});
    await assert.rejects(provider.startSubscription(),/inte tillgänglig i webbversionen/);
    await assert.rejects(provider.restorePurchases(),/inte tillgänglig i webbversionen/);
  }
});

test("webbläsaren väljer inte butik utifrån user-agent",()=>{
  const provider=subscriptions.createProvider({subscriptionMode:"disabled"});
  assert.equal(provider.constructor.name,"SubscriptionProvider");
});
