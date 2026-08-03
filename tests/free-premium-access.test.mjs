import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
const auth=readFileSync(new URL("../auth.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ads=readFileSync(new URL("../ads-provider.js",import.meta.url),"utf8");

test("Trial, Premium, VIP och Admin använder central Premium-entitlement",()=>{
  assert.match(auth,/\["trial", "premium", "vip", "admin"\]\.includes\(effectiveRole\(p\)\)/);
  assert.match(auth,/entitlement\.is_premium\|\|entitlement\.is_trial\|\|\["premium","vip","admin"\]\.includes\(entitlement\.role\)/);
  assert.match(auth,/if \(!hasPremiumAccess\(\)\) return false;/);
  assert.match(auth,/if \(!session\?\.user \|\| !hasPremiumAccess\(\) \|\| cloudSettingsRequested\) return;/);
});

test("Free visar bara dagens prognos och avslöjar inga kommande prognoser",()=>{
  assert.match(app,/hasPremiumUiAccess\(\)\?availableDays:availableDays\.slice\(0,1\)/);
  assert.match(html,/Premium visar resten av veckan/);
  assert.match(html,/Kommande prognoser förblir dolda\./);
  assert.match(html,/id="showPremiumWeek"[^>]*>Visa Premium</);
});

test("Free begränsas till en region medan Premium behåller flerval",()=>{
  assert.match(app,/if\(hasPremiumUiAccess\(\)\|\|normalized\.regions\.length<=1\)return normalized/);
  assert.match(app,/if\(!hasPremiumUiAccess\(\)&&selectedRegions\.length>1\)/);
  assert.match(app,/requestPremium\("multiRegion"\)/);
});

test("annonsplatser finns endast som lokala Free-platshållare",()=>{
  assert.match(html,/data-placement="main_bottom_banner"[^>]*aria-label="Annons">Annons</);
  assert.match(app,/ad\.dataset\.placement="ranking_inline_native"/);
  assert.match(app,/if\(!hasPremiumUiAccess\(\)&&i===2\)/);
  assert.match(app,/adProvider\(\)\?\.show\?\.\(\$\("mainBottomBanner"\)\)/);
  assert.match(ads,/if\(premium\)return new NoAdsProvider\(\)/);
  assert.match(ads,/return new WebPlaceholderAdProvider\(\)/);
});

test("Premiumdialogen visar endast den förenklade butiksjämförelsen",()=>{
  for(const text of ["Dagens prognos","En region åt gången","Standardutbud av platser","Ingen molnsynk","Reklam","Alla prognosdagar","Flera regioner","Utökat platsregister","Molnsynk","Reklamfritt"]){
    assert.match(html,new RegExp(text));
  }
  assert.doesNotMatch(html,/Fler aktiviteter|Personliga rekommendationer|AI-rekommendationer|appen lär sig/i);
});
