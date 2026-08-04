import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [pkg,capacitor,native,auth,app,ads,html,gitignore,migration,storekit,mainView,googleBilling]=await Promise.all([
  read("package.json").then(JSON.parse),read("capacitor.config.ts"),read("native-platform.js"),read("auth.js"),read("app.js"),read("ads-provider.js"),read("index.html"),read(".gitignore"),read("supabase/migrations/20260802_1440_account_deletion.sql"),read("ios/App/App/VaderkompassenPurchasesPlugin.swift"),read("ios/App/App/MainViewController.swift"),read("android/app/src/main/java/se/vaderkompassen/app/GooglePlayBillingPlugin.java")
]);

test("Capacitor 8 och officiella plugins är exakt låsta",()=>{
  assert.equal(pkg.dependencies["@capacitor/core"],"8.5.0");
  assert.equal(pkg.devDependencies["@capacitor/cli"],"8.5.0");
  for(const name of ["ios","android","app","browser","device","network","preferences","splash-screen","status-bar"]){
    const version=pkg.dependencies[`@capacitor/${name}`];assert.match(version,/^8\.\d+\.\d+$/);assert.doesNotMatch(version,/[~^*]/);
  }
});

test("Android använder Play Billing och acknowledge efter separat verifiering",()=>{
  assert.match(googleBilling,/queryProductDetailsAsync/);assert.match(googleBilling,/enablePendingPurchases/);assert.match(googleBilling,/setObfuscatedAccountId/);
  assert.match(googleBilling,/queryPurchasesAsync/);assert.match(googleBilling,/acknowledgePurchase/);assert.doesNotMatch(googleBilling,/Log\.|System\.out/);
});

test("native-konfiguration paketerar dist och tillåter bara explicit lokal devserver",()=>{
  assert.match(capacitor,/appId:"se\.vaderkompassen\.app"/);
  assert.match(capacitor,/webDir:"dist"/);
  assert.match(capacitor,/environment==="development"/);
  assert.match(capacitor,/localhost\|127/);
  assert.doesNotMatch(capacitor,/github\.io/);
});

test("plattform, livscykel, nätverk och Preferences går genom gemensam nativegräns",()=>{
  assert.match(native,/getRuntimePlatform/);assert.match(native,/isNativePlatform/);assert.match(native,/isWebPlatform/);
  assert.match(native,/appStateChange/);assert.match(native,/networkStatusChange/);assert.match(native,/appUrlOpen/);
  assert.match(native,/plugin\("Preferences"\)/);assert.match(app,/vk:native-app-state/);
  assert.match(app,/!window\.VK_NATIVE\?\.isNativePlatform/);
});

test("native Auth använder deeplink, extern Browser och persistent adapter",()=>{
  assert.match(native,/vaderkompassen:\/\/auth\/callback/);
  assert.match(auth,/exchangeCodeForSession/);assert.match(auth,/setSession/);
  assert.match(auth,/skipBrowserRedirect:Boolean\(native\)/);assert.match(auth,/window\.VK_NATIVE\.openAuth/);
  assert.match(auth,/storage: window\.VK_NATIVE\?\.storage/);
});

test("iOS använder StoreKit 2 och central fail-closed annonsprovider",()=>{
  assert.match(native,/VaderkompassenPurchases/);
  assert.match(storekit,/import StoreKit/);assert.match(storekit,/Product\.products/);assert.match(storekit,/\.appAccountToken\(token\)/);
  assert.match(storekit,/AppStore\.sync/);assert.match(storekit,/showManageSubscriptions/);assert.match(storekit,/jwsRepresentation/);
  assert.match(mainView,/registerPluginInstance\(VaderkompassenPurchasesPlugin\(\)\)/);
  assert.match(ads,/class AdMobProvider/);assert.match(ads,/async requestConsent\(\)/);
  assert.match(ads,/if\(!consent\.canRequestAds\)throw/);
  assert.match(html,/ads-provider\.js\?v=15\.0\.5/);
});

test("kontoborttagning kräver nylig auth och behåller minimal butiksrevision",()=>{
  assert.match(auth,/delete_own_account/);assert.match(auth,/Skriv RADERA/);
  assert.match(migration,/recent_sign_in < now\(\)-interval '15 minutes'/);
  assert.match(migration,/delete from auth\.users/);
  assert.match(migration,/provider_subscription_hash/);
  assert.match(migration,/revoke all on table public\.account_deletion_audit from public, anon, authenticated/);
  assert.doesNotMatch(migration,/service.role/i);
});

test("native signinghemligheter och genererade filer ignoreras",()=>{
  for(const pattern of ["*.jks","*.keystore","*.p12","*.mobileprovision","android/local.properties","dist/"])assert.ok(gitignore.includes(pattern));
});
