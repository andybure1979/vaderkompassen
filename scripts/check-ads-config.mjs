import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=file=>readFile(new URL(`../${file}`,import.meta.url),"utf8");
const [environment,build,provider,manifest,plist]=await Promise.all([read("environment.js"),read("scripts/build-web.mjs"),read("ads-provider.js"),read("android/app/src/main/AndroidManifest.xml"),read("ios/App/App/Info.plist")]);
assert.match(environment,/name:"production"[^\n]+adsMode:"disabled",adsEnabled:false/);
assert.match(build,/name==="production"&&adsMode==="test"/);
assert.match(build,/Produktionsannonser saknar fullständig verifierad konfiguration/);
for(const id of ["2435281174","3986624511","9214589741","2247696110"])assert.ok(build.includes(id),`Officiellt test-ID saknas: ${id}`);
assert.match(provider,/requestConsentInfo/);assert.match(provider,/canRequestAds/);assert.match(provider,/if\(!consent\.canRequestAds\)throw/);
assert.match(manifest,/\$\{admobAppId\}/);assert.match(manifest,/android:enabled="\$\{admobEnabled\}"/);assert.match(plist,/\$\(VK_ADMOB_IOS_APP_ID\)/);
console.log("AdMob/CMP-konfiguration OK: production fail-closed, staging använder officiella test-ID:n och UMP föregår annonser.");
