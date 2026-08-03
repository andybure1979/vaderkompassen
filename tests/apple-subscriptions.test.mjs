import test from "node:test";
import assert from "node:assert/strict";
import {appleConfigurationReady,configuredAppleEnvironment,decodeTransactionHint,resolveAppleState} from "../cloudflare/src/apple-subscriptions.js";

const future=Date.now()+86400000,past=Date.now()-86400000;
test("Apple-statusar mappas fail-closed till central entitlement",()=>{
  assert.equal(resolveAppleState(1,{expiresDate:future,offerDiscountType:"FREE_TRIAL"},{autoRenewStatus:1}).subscriptionStatus,"trialing");
  assert.equal(resolveAppleState(1,{expiresDate:future},{autoRenewStatus:1}).subscriptionStatus,"active");
  assert.equal(resolveAppleState(1,{expiresDate:future},{autoRenewStatus:0}).subscriptionStatus,"cancelled_active");
  assert.equal(resolveAppleState(4,{expiresDate:past},{gracePeriodExpiresDate:future}).subscriptionStatus,"grace_period");
  assert.equal(resolveAppleState(3,{expiresDate:past},{isInBillingRetryPeriod:true}).entitlement,"free");
  assert.equal(resolveAppleState(2,{expiresDate:past},{}).subscriptionStatus,"expired");
  assert.equal(resolveAppleState(5,{expiresDate:future,revocationDate:Date.now()},{}).subscriptionStatus,"revoked");
});

test("production kan inte växla till Apple Sandbox",()=>{
  assert.throws(()=>configuredAppleEnvironment({ENVIRONMENT:"production",APPLE_ENVIRONMENT:"Sandbox"}),/aldrig/);
  assert.equal(appleConfigurationReady({ENVIRONMENT:"production",APPLE_ENVIRONMENT:"Sandbox"}),false);
});

test("JWS används bara som hint före serververifiering",()=>{
  const payload=Buffer.from(JSON.stringify({originalTransactionId:"2000000000001"})).toString("base64url");
  assert.equal(decodeTransactionHint(`e30.${payload}.signature`).originalTransactionId,"2000000000001");
  assert.throws(()=>decodeTransactionHint("not-a-jws"),/ogiltigt format/);
});
