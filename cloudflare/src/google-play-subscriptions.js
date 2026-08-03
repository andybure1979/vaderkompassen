const STATES={PENDING:"SUBSCRIPTION_STATE_PENDING",ACTIVE:"SUBSCRIPTION_STATE_ACTIVE",PAUSED:"SUBSCRIPTION_STATE_PAUSED",GRACE:"SUBSCRIPTION_STATE_IN_GRACE_PERIOD",HOLD:"SUBSCRIPTION_STATE_ON_HOLD",CANCELED:"SUBSCRIPTION_STATE_CANCELED",EXPIRED:"SUBSCRIPTION_STATE_EXPIRED",PENDING_CANCELED:"SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED"};
let googleTokenCache=null;
const required=(env,key)=>{const value=String(env[key]||"").trim();if(!value)throw Object.assign(new Error(`Google Play-konfiguration saknas: ${key}`),{status:503});return value};
const b64url=value=>btoa(String.fromCharCode(...new Uint8Array(value))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
const textB64url=value=>b64url(new TextEncoder().encode(value));
const pemBytes=pem=>Uint8Array.from(atob(pem.replace(/-----[^-]+-----|\s/g,"")),c=>c.charCodeAt(0));
export const GOOGLE_PLAY_CONFIG=Object.freeze({productId:"premium_monthly",basePlanId:"monthly",trialOfferId:"premium_trial_3_days",packageName:"se.vaderkompassen.app"});

export function googleConfigurationReady(env){
  const keys=["GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL","GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY","GOOGLE_PLAY_PACKAGE_NAME","GOOGLE_PLAY_PRODUCT_ID","GOOGLE_PLAY_ENVIRONMENT"];
  const production=String(env.ENVIRONMENT||"").toLowerCase()==="production";
  return keys.every(key=>String(env[key]||"").trim())&&(!production||String(env.GOOGLE_PLAY_ENVIRONMENT).toLowerCase()==="production");
}
export function validateGoogleRequest(env,{packageName,productId}){
  if(packageName!==required(env,"GOOGLE_PLAY_PACKAGE_NAME")||packageName!==GOOGLE_PLAY_CONFIG.packageName)throw Object.assign(new Error("Felaktigt Android package name"),{status:400});
  if(productId!==required(env,"GOOGLE_PLAY_PRODUCT_ID")||productId!==GOOGLE_PLAY_CONFIG.productId)throw Object.assign(new Error("Google Play-produkten är inte tillåten"),{status:400});
  if(String(env.ENVIRONMENT||"").toLowerCase()==="production"&&required(env,"GOOGLE_PLAY_ENVIRONMENT").toLowerCase()!=="production")throw Object.assign(new Error("Google Play-testmiljö får inte användas i production"),{status:503});
}
async function accessToken(env){
  if(googleTokenCache?.expiresAt>Date.now()+60000)return googleTokenCache.value;
  const now=Math.floor(Date.now()/1000),header=textB64url(JSON.stringify({alg:"RS256",typ:"JWT"})),payload=textB64url(JSON.stringify({
    iss:required(env,"GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL"),scope:"https://www.googleapis.com/auth/androidpublisher",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3300
  }));
  const key=await crypto.subtle.importKey("pkcs8",pemBytes(required(env,"GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY")),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const signature=b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,new TextEncoder().encode(`${header}.${payload}`)));
  const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:`${header}.${payload}.${signature}`})});
  const data=await response.json().catch(()=>null);if(!response.ok||!data?.access_token)throw Object.assign(new Error("Google Play-autentisering misslyckades"),{status:502});
  googleTokenCache={value:data.access_token,expiresAt:Date.now()+Number(data.expires_in||3000)*1000};return data.access_token;
}
export async function getGoogleSubscription(env,purchaseToken){
  const packageName=required(env,"GOOGLE_PLAY_PACKAGE_NAME"),token=String(purchaseToken||"");if(!token||token.length>4096)throw Object.assign(new Error("Google Play purchase token saknas eller är ogiltig"),{status:400});
  const url=`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(token)}`;
  const response=await fetch(url,{headers:{authorization:`Bearer ${await accessToken(env)}`}}),data=await response.json().catch(()=>null);
  if(!response.ok)throw Object.assign(new Error(response.status===404?"Google Play kunde inte verifiera köpet":"Google Play Developer API är tillfälligt otillgängligt"),{status:response.status===404?422:502});
  return data;
}
const ms=value=>{const time=Date.parse(String(value||""));return Number.isFinite(time)?time:0};
export function resolveGoogleState(data,nowMs=Date.now(),notificationType=null){
  const lines=Array.isArray(data?.lineItems)?data.lineItems:[],line=lines.slice().sort((a,b)=>ms(b.expiryTime)-ms(a.expiryTime))[0]||{};
  const expiry=ms(line.expiryTime),state=data?.subscriptionState,autoRenew=Boolean(line.autoRenewingPlan?.autoRenewEnabled),offerId=line.offerDetails?.offerId||null;
  let status="expired",premium=false;
  if(notificationType===12)status="revoked";
  else if(state===STATES.ACTIVE&&expiry>nowMs){status=offerId===GOOGLE_PLAY_CONFIG.trialOfferId?"trialing":autoRenew?"active":"cancelled_active";premium=true}
  else if(state===STATES.GRACE&&expiry>nowMs){status="grace_period";premium=true}
  else if(state===STATES.CANCELED&&expiry>nowMs){status="cancelled_active";premium=true}
  else if(state===STATES.HOLD)status="payment_issue";
  else if(state===STATES.PAUSED||state===STATES.PENDING)status="payment_issue";
  else if(state===STATES.PENDING_CANCELED)status="expired";
  return {status,entitlement:premium?"premium":"free",isPremium:premium,isTrial:status==="trialing",cancelAtPeriodEnd:status==="cancelled_active",
    currentPeriodStartedAt:data?.startTime||null,currentPeriodEndsAt:line.expiryTime||null,basePlanId:line.offerDetails?.basePlanId||null,offerId,
    autoRenewEnabled:autoRenew,acknowledgementRequired:data?.acknowledgementState==="ACKNOWLEDGEMENT_STATE_PENDING",linkedPurchaseToken:data?.linkedPurchaseToken||null,
    externalAccountHash:data?.externalAccountIdentifiers?.obfuscatedExternalAccountId||null,subscriptionState:state||null};
}
export function googleSubscriptionRow(state,userId,tokenHash,source,payload){
  return {p_user_id:userId,p_purchase_token_hash:tokenHash,p_linked_purchase_token_hash:state.linkedPurchaseToken||null,p_product_id:GOOGLE_PLAY_CONFIG.productId,
    p_base_plan_id:state.basePlanId,p_offer_id:state.offerId,p_status:state.status,p_entitlement:state.entitlement,p_environment:state.environment||"production",
    p_current_period_started_at:state.currentPeriodStartedAt,p_current_period_ends_at:state.currentPeriodEndsAt,p_cancel_at_period_end:state.cancelAtPeriodEnd,
    p_trial:state.isTrial,p_acknowledgement_state:state.acknowledgementRequired?"pending":"acknowledged",p_source:source,
    p_provider_payload:{subscriptionState:state.subscriptionState,autoRenewEnabled:state.autoRenewEnabled,basePlanId:state.basePlanId,offerId:state.offerId,...payload}};
}
export async function verifyPubSubIdentity(req,env){
  const header=String(req.headers.get("authorization")||""),jwt=header.startsWith("Bearer ")?header.slice(7):"";if(!jwt)throw Object.assign(new Error("RTDN saknar verifierad Pub/Sub-identitet"),{status:401});
  const response=await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(jwt)}`),claims=await response.json().catch(()=>null);
  if(!response.ok||claims?.aud!==required(env,"GOOGLE_RTDN_AUDIENCE")||claims?.email!==required(env,"GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL")||String(claims?.email_verified)!=="true")throw Object.assign(new Error("RTDN-identiteten kunde inte verifieras"),{status:401});
  return claims;
}
export function decodeRtdn(body){
  try{const message=body?.message,id=String(message?.messageId||"");const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(String(message?.data||"")),c=>c.charCodeAt(0))));
    if(!id||data.packageName!==GOOGLE_PLAY_CONFIG.packageName||!data.subscriptionNotification?.purchaseToken)throw new Error();
    return {messageId:id,eventTimeMillis:data.eventTimeMillis||null,notificationType:Number(data.subscriptionNotification.notificationType),purchaseToken:data.subscriptionNotification.purchaseToken};
  }catch{throw Object.assign(new Error("RTDN-payloaden är ogiltig"),{status:400})}
}
