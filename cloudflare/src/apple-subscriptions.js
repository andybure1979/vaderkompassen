import {Buffer} from "node:buffer";
import {APPLE_ROOT_CA_DER_BASE64} from "./apple-root-certificates.js";

const Environment={SANDBOX:"Sandbox",PRODUCTION:"Production"};
const Status={ACTIVE:1,EXPIRED:2,BILLING_RETRY:3,BILLING_GRACE_PERIOD:4,REVOKED:5};
const AutoRenewStatus={OFF:0,ON:1};
const OfferDiscountType={FREE_TRIAL:"FREE_TRIAL"};
let appleLibraryPromise;
function appleLibrary(){return appleLibraryPromise||(appleLibraryPromise=import("@apple/app-store-server-library"))}

const PREMIUM_STATUSES=new Set(["trialing","active","cancelled_active","grace_period"]);
const REQUIRED_ENV_KEYS=["APPLE_IAP_KEY_ID","APPLE_IAP_ISSUER_ID","APPLE_IAP_PRIVATE_KEY","APPLE_BUNDLE_ID","APPLE_PRODUCT_ID","APPLE_ENVIRONMENT"];

function required(env,key){const value=String(env[key]||"").trim();if(!value)throw Object.assign(new Error(`Apple-konfiguration saknas: ${key}`),{status:503});return value}
export function configuredAppleEnvironment(env){
  const value=required(env,"APPLE_ENVIRONMENT");
  const target=value.toLowerCase()==="production"?Environment.PRODUCTION:value.toLowerCase()==="sandbox"?Environment.SANDBOX:null;
  if(!target)throw Object.assign(new Error("APPLE_ENVIRONMENT måste vara Production eller Sandbox"),{status:503});
  if(String(env.ENVIRONMENT||"production").toLowerCase()==="production"&&target!==Environment.PRODUCTION){
    throw Object.assign(new Error("Sandbox får aldrig användas i production"),{status:503});
  }
  return target;
}
export function appleConfigurationReady(env){
  const production=String(env.ENVIRONMENT||"").toLowerCase()==="production";
  return REQUIRED_ENV_KEYS.every(key=>String(env[key]||"").trim())
    &&(!production||String(env.APPLE_ENVIRONMENT||"").toLowerCase()==="production")
    &&(!production||Number.isSafeInteger(Number(env.APPLE_APP_ID)));
}

async function appleVerifier(env){
  const {SignedDataVerifier}=await appleLibrary();
  const environment=configuredAppleEnvironment(env),bundleId=required(env,"APPLE_BUNDLE_ID");
  const appAppleId=environment===Environment.PRODUCTION?Number(required(env,"APPLE_APP_ID")):undefined;
  if(environment===Environment.PRODUCTION&&!Number.isSafeInteger(appAppleId))throw Object.assign(new Error("APPLE_APP_ID måste vara ett heltal i production"),{status:503});
  return new SignedDataVerifier(APPLE_ROOT_CA_DER_BASE64.map(value=>Buffer.from(value,"base64")),true,environment,bundleId,appAppleId);
}
async function appleClient(env){
  const {AppStoreServerAPIClient}=await appleLibrary();
  return new AppStoreServerAPIClient(
    required(env,"APPLE_IAP_PRIVATE_KEY").replaceAll("\\n","\n"),required(env,"APPLE_IAP_KEY_ID"),required(env,"APPLE_IAP_ISSUER_ID"),
    required(env,"APPLE_BUNDLE_ID"),configuredAppleEnvironment(env)
  );
}
export function decodeTransactionHint(signedTransactionInfo){
  try{
    const parts=String(signedTransactionInfo||"").split(".");if(parts.length!==3)throw new Error();
    return JSON.parse(Buffer.from(parts[1],"base64url").toString("utf8"));
  }catch{throw Object.assign(new Error("Apple-transaktionen har ogiltigt format"),{status:400})}
}
const iso=value=>Number.isFinite(Number(value))?new Date(Number(value)).toISOString():null;
export function resolveAppleState(status,transaction={},renewal={},nowMs=Date.now()){
  const expiresAt=Number(transaction.expiresDate)||0,revoked=Boolean(transaction.revocationDate)||status===Status.REVOKED;
  let subscriptionStatus="expired";
  if(revoked)subscriptionStatus="revoked";
  else if(status===Status.BILLING_GRACE_PERIOD)subscriptionStatus="grace_period";
  else if(status===Status.BILLING_RETRY)subscriptionStatus="payment_issue";
  else if(status===Status.ACTIVE&&expiresAt>nowMs){
    const trial=transaction.offerDiscountType===OfferDiscountType.FREE_TRIAL;
    subscriptionStatus=trial?"trialing":renewal.autoRenewStatus===AutoRenewStatus.OFF?"cancelled_active":"active";
  }
  const graceEnds=Number(renewal.gracePeriodExpiresDate)||0;
  const premium=PREMIUM_STATUSES.has(subscriptionStatus)&&(
    subscriptionStatus!=="grace_period"||graceEnds>nowMs
  );
  if(subscriptionStatus==="grace_period"&&!premium)subscriptionStatus="expired";
  return {subscriptionStatus,entitlement:premium?"premium":"free",isPremium:premium,
    isTrial:subscriptionStatus==="trialing",cancelAtPeriodEnd:subscriptionStatus==="cancelled_active"||renewal.autoRenewStatus===AutoRenewStatus.OFF,
    currentPeriodEndsAt:iso(transaction.expiresDate),gracePeriodEndsAt:iso(renewal.gracePeriodExpiresDate),revokedAt:iso(transaction.revocationDate)};
}
function candidateItems(response){return (response?.data||[]).flatMap(group=>group?.lastTransactions||[])}
export async function fetchVerifiedAppleSubscription(env,transactionId){
  const productId=required(env,"APPLE_PRODUCT_ID"),verifier=await appleVerifier(env),client=await appleClient(env);
  const response=await client.getAllSubscriptionStatuses(String(transactionId));
  if(response?.environment!==configuredAppleEnvironment(env))throw Object.assign(new Error("Apple svarade från fel miljö"),{status:502});
  const verified=[];
  for(const item of candidateItems(response)){
    if(!item?.signedTransactionInfo)continue;
    const transaction=await verifier.verifyAndDecodeTransaction(item.signedTransactionInfo);
    const renewal=item.signedRenewalInfo?await verifier.verifyAndDecodeRenewalInfo(item.signedRenewalInfo):{};
    if(transaction.productId!==productId)continue;
    verified.push({item,transaction,renewal,state:resolveAppleState(item.status,transaction,renewal)});
  }
  if(!verified.length)throw Object.assign(new Error("Apple verifierade inte den konfigurerade Premiumprodukten"),{status:422});
  verified.sort((a,b)=>(Number(b.transaction.expiresDate)||0)-(Number(a.transaction.expiresDate)||0));
  const selected=verified[0],environment=configuredAppleEnvironment(env);
  return {
    provider:"apple",providerSubscriptionId:String(selected.transaction.originalTransactionId||selected.item.originalTransactionId||""),
    providerTransactionId:String(selected.transaction.transactionId||""),webOrderLineItemId:selected.transaction.webOrderLineItemId||null,
    appAccountToken:selected.transaction.appAccountToken||selected.renewal.appAccountToken||null,productId:selected.transaction.productId,
    environment:environment===Environment.PRODUCTION?"production":"sandbox",ownershipType:selected.transaction.inAppOwnershipType||null,
    purchasedAt:iso(selected.transaction.purchaseDate),signedAt:iso(selected.transaction.signedDate),...selected.state,
    providerPayload:{status:selected.item.status,autoRenewStatus:selected.renewal.autoRenewStatus??null,expirationIntent:selected.renewal.expirationIntent??null,
      offerType:selected.transaction.offerType??null,offerDiscountType:selected.transaction.offerDiscountType??null,transactionReason:selected.transaction.transactionReason??null}
  };
}
export async function verifyAppleNotification(env,signedPayload){
  const verifier=await appleVerifier(env);
  const notification=await verifier.verifyAndDecodeNotification(String(signedPayload||""));
  if(!notification.notificationUUID)throw Object.assign(new Error("Apple-notisen saknar notificationUUID"),{status:400});
  const signedTransaction=notification.data?.signedTransactionInfo;
  if(!signedTransaction)return {notification,subscription:null};
  const transaction=await verifier.verifyAndDecodeTransaction(signedTransaction);
  const subscription=await fetchVerifiedAppleSubscription(env,transaction.originalTransactionId||transaction.transactionId);
  return {notification,subscription};
}
export function appleSubscriptionRow(subscription,userId){
  if(!subscription?.providerSubscriptionId||!subscription?.productId)throw Object.assign(new Error("Verifierat Apple-svar saknar identitet"),{status:422});
  return {p_user_id:userId,p_original_transaction_id:subscription.providerSubscriptionId,p_transaction_id:subscription.providerTransactionId||null,
    p_web_order_line_item_id:subscription.webOrderLineItemId||null,p_app_account_token:subscription.appAccountToken||null,p_product_id:subscription.productId,
    p_status:subscription.subscriptionStatus,p_entitlement:subscription.entitlement,p_environment:subscription.environment,
    p_current_period_ends_at:subscription.currentPeriodEndsAt,p_grace_period_ends_at:subscription.gracePeriodEndsAt,
    p_cancel_at_period_end:subscription.cancelAtPeriodEnd,p_trial:subscription.isTrial,p_ownership_type:subscription.ownershipType,
    p_signed_at:subscription.signedAt,p_provider_payload:subscription.providerPayload};
}
