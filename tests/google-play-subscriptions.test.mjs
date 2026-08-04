import test from "node:test";
import assert from "node:assert/strict";
import {GOOGLE_PLAY_CONFIG,googleConfigurationReady,resolveGoogleState,validateGoogleRequest} from "../cloudflare/src/google-play-subscriptions.js";
const line=(expiry,auto=true,offerId=null)=>({productId:"premium_monthly",expiryTime:expiry,autoRenewingPlan:{autoRenewEnabled:auto},offerDetails:{basePlanId:"monthly",offerId}});
const future=new Date(Date.now()+86400000).toISOString(),past=new Date(Date.now()-86400000).toISOString();
test("Google-status mappas fail-closed",()=>{
  assert.equal(resolveGoogleState({subscriptionState:"SUBSCRIPTION_STATE_ACTIVE",lineItems:[line(future,true)]}).status,"active");
  assert.equal(resolveGoogleState({subscriptionState:"SUBSCRIPTION_STATE_ACTIVE",lineItems:[line(future,true,GOOGLE_PLAY_CONFIG.trialOfferId)]}).status,"trialing");
  assert.equal(resolveGoogleState({subscriptionState:"SUBSCRIPTION_STATE_CANCELED",lineItems:[line(future,false)]}).status,"cancelled_active");
  assert.equal(resolveGoogleState({subscriptionState:"SUBSCRIPTION_STATE_IN_GRACE_PERIOD",lineItems:[line(future,false)]}).status,"grace_period");
  assert.equal(resolveGoogleState({subscriptionState:"SUBSCRIPTION_STATE_ON_HOLD",lineItems:[line(future,false)]}).isPremium,false);
  assert.equal(resolveGoogleState({subscriptionState:"SUBSCRIPTION_STATE_EXPIRED",lineItems:[line(past,false)]}).status,"expired");
  assert.equal(resolveGoogleState({subscriptionState:"SUBSCRIPTION_STATE_ACTIVE",lineItems:[line(future,true)]},Date.now(),12).status,"revoked");
});
test("production kräver productionkonfiguration och allowlist",()=>{
  const env={ENVIRONMENT:"production",GOOGLE_PLAY_ENVIRONMENT:"Production",GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL:"svc@example.test",GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY:"key",GOOGLE_PLAY_PACKAGE_NAME:GOOGLE_PLAY_CONFIG.packageName,GOOGLE_PLAY_PRODUCT_ID:GOOGLE_PLAY_CONFIG.productId};
  assert.equal(googleConfigurationReady(env),true);assert.doesNotThrow(()=>validateGoogleRequest(env,{packageName:GOOGLE_PLAY_CONFIG.packageName,productId:GOOGLE_PLAY_CONFIG.productId}));
  assert.throws(()=>validateGoogleRequest(env,{packageName:"evil.app",productId:GOOGLE_PLAY_CONFIG.productId}));assert.equal(googleConfigurationReady({...env,GOOGLE_PLAY_ENVIRONMENT:"Test"}),false);
});
