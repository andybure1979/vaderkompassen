import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=file=>readFile(new URL(`../${file}`,import.meta.url),"utf8");
const [config,pkg,html,auth,worker,wrangler,android,privacy]=await Promise.all([
  read("config/store-compliance.json").then(JSON.parse),read("package.json").then(JSON.parse),read("index.html"),read("auth.js"),read("cloudflare/src/index.js"),read("wrangler.jsonc"),read("android/app/src/main/AndroidManifest.xml"),read("ios/App/App/PrivacyInfo.xcprivacy")
]);

test("central compliancechecklista har alla obligatoriska statusposter",()=>{
  const required=["privacyPolicy","termsOfUse","supportPage","accountDeletionInApp","accountDeletionWeb","appPrivacyAnswers","googleDataSafetyAnswers","ageRatingApple","ageRatingGoogle","subscriptionDisclosure","restorePurchases","manageSubscription","testAccount","screenshots","appIcon","storeDescriptions","reviewNotes","iosBuild","androidBundle","signingConfigured","productionEndpoints","productionSecrets","adsConfigured","subscriptionsConfigured"];
  for(const key of required)assert.ok(config.items[key],key);
  for(const item of Object.values(config.items))assert.match(item.status,/^(complete|manual_action_required|blocked|not_applicable)$/);
  assert.equal(config.version,"15.0.5");
});

test("releasekontrollscript finns i npm och produktion fabricerar inte köp",()=>{
  for(const script of ["check:store-compliance","check:production-config","security:release-check"])assert.ok(pkg.scripts[script]);
  assert.match(auth,/Butiksköp är inte aktiverade/);
  assert.match(auth,/förnyas automatiskt/);
  assert.match(html,/Användarvillkor/);assert.match(html,/Integritetspolicy/);assert.match(html,/Hantera butikprenumeration/);
});

test("releasekonfiguration har explicit CORS och inga känsliga Androidpermissions",()=>{
  assert.match(wrangler,/"ALLOWED_ORIGINS":/);assert.doesNotMatch(wrangler,/"ALLOWED_ORIGINS":\s*"\*"/);
  assert.match(worker,/allowedOrigin/);
  for(const permission of ["ACCESS_FINE_LOCATION","ACCESS_COARSE_LOCATION","CAMERA","RECORD_AUDIO","READ_CONTACTS","READ_MEDIA_IMAGES","MANAGE_EXTERNAL_STORAGE"])assert.doesNotMatch(android,new RegExp(permission));
  assert.match(privacy,/NSPrivacyTracking<\/key><false/);
});
