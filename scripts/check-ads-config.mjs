import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=file=>readFile(new URL(`../${file}`,import.meta.url),"utf8");
const [environment,build,provider,manifest,plist,swift,resolved,nativeHook,pkg]=await Promise.all([read("environment.js"),read("scripts/build-web.mjs"),read("ads-provider.js"),read("android/app/src/main/AndroidManifest.xml"),read("ios/App/App/Info.plist"),read("ios/App/CapApp-SPM/Package.swift"),read("ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved"),read("scripts/configure-native-ads.mjs"),read("package.json")]);
assert.match(environment,/name:"production"[^\n]+adsMode:"disabled",adsEnabled:false/);
assert.match(build,/name==="production"&&adsMode==="test"/);
assert.match(build,/Produktionsannonser saknar fullständig verifierad konfiguration/);
for(const id of ["2435281174","3986624511","9214589741","2247696110"])assert.ok(build.includes(id),`Officiellt test-ID saknas: ${id}`);
assert.match(provider,/requestConsentInfo/);assert.match(provider,/canRequestAds/);assert.match(provider,/if\(!consent\.canRequestAds\)throw/);assert.match(provider,/if\(!this\.config\?\.enabled\|\|this\.config\?\.mode==="disabled"\)return NoAdsProvider/);
assert.match(manifest,/\$\{admobAppId\}/);assert.match(manifest,/android:enabled="\$\{admobEnabled\}"/);
assert.doesNotMatch(plist,/GADApplicationIdentifier/);assert.doesNotMatch(swift,/CapacitorCommunityAdmob/);assert.doesNotMatch(resolved,/google-mobile-ads|google-user-messaging-platform/);
assert.match(nativeHook,/ca-app-pub-3940256099942544~1458002511/);assert.match(nativeHook,/mode==="test"/);assert.match(nativeHook,/plist\.replace\(gadEntry,""\)/);assert.match(pkg,/capacitor:sync:after/);
console.log("AdMob/CMP-konfiguration OK: iOS production länkar inte Mobile Ads/UMP, Android auto-init är avstängd utan ID och staging använder officiella test-ID:n.");
