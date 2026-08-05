import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";

const source=await readFile(new URL("../ads-provider.js",import.meta.url),"utf8");
const element=()=>({hidden:false,textContent:"",classList:{add(name){if(name==="hidden")this.owner.hidden=true},remove(name){if(name==="hidden")this.owner.hidden=false}},dataset:{}});
function load(plugin){
  const calls=[];
  const context={console,Capacitor:{getPlatform:()=>"android",Plugins:{AdMob:plugin?.(calls)}},VK_NATIVE:{isNativePlatform:()=>true}};
  context.globalThis=context;vm.runInNewContext(source,context);
  return {ads:context.VK_ADS,calls};
}
function fakePlugin(calls){return {
  async requestConsentInfo(){calls.push("consent");return {status:"NOT_REQUIRED",canRequestAds:true,privacyOptionsRequirementStatus:"NOT_REQUIRED"}},
  async initialize(){calls.push("initialize")},async showBanner(){calls.push("banner")},async hideBanner(){calls.push("hide")},async removeBanner(){calls.push("remove")}
}}
const config={enabled:true,mode:"test",android:{placements:{main_bottom_banner:"test-banner"}}};

test("annonsroller följer central entitlement",()=>{
  const {ads}=load(fakePlugin);
  assert.equal(ads.accessAllowsAds({resolved:true,role:"free",premium:false}),true);
  for(const role of ["trial","trialing","premium","active","cancelled_active","grace_period","vip","admin"]){
    assert.equal(ads.accessAllowsAds({resolved:true,role,premium:role!=="admin",admin:role==="admin"}),false,role);
  }
  assert.equal(ads.accessAllowsAds({resolved:false,role:"free"}),false);
});

test("AdMob initieras inte före entitlement eller UMP-beslut",async()=>{
  const {ads,calls}=load(fakePlugin),controller=ads.createController(config),el=element();el.classList.owner=el;
  await controller.showBanner("main_bottom_banner",el);
  assert.deepEqual(calls,[]);
  await controller.setAccess({resolved:true,role:"free",premium:false});
  assert.deepEqual(calls,["consent","initialize","banner"]);
});

test("disabled gör både Free och Premium helt annonsfria",async()=>{
  const {ads,calls}=load(fakePlugin),controller=ads.createController({...config,enabled:false,mode:"disabled"}),el=element();el.classList.owner=el;
  await controller.showBanner("main_bottom_banner",el);
  await controller.setAccess({resolved:true,role:"free",premium:false});
  assert.deepEqual(calls,[]);assert.equal(el.hidden,true);assert.equal(controller.getStatus().provider,"none");
  await controller.setAccess({resolved:true,role:"premium",premium:true});
  assert.deepEqual(calls,[]);assert.equal(el.hidden,true);
});

test("Premiumuppgradering förstör aktiv annons och lämnar ingen yta",async()=>{
  const {ads,calls}=load(fakePlugin),controller=ads.createController(config),el=element();el.classList.owner=el;
  await controller.showBanner("main_bottom_banner",el);
  await controller.setAccess({resolved:true,role:"free",premium:false});
  await controller.setAccess({resolved:true,role:"premium",premium:true});
  assert.equal(el.hidden,true);assert.ok(calls.includes("remove"));
});

test("Premium som anländer under CMP väntan stoppar den äldre annonsbegäran",async()=>{
  let releaseConsent;
  const {ads,calls}=load(calls=>({
    async requestConsentInfo(){calls.push("consent");return new Promise(resolve=>{releaseConsent=()=>resolve({status:"NOT_REQUIRED",canRequestAds:true,privacyOptionsRequirementStatus:"NOT_REQUIRED"})})},
    async initialize(){calls.push("initialize")},async showBanner(){calls.push("banner")},async removeBanner(){calls.push("remove")}
  }));
  const controller=ads.createController(config),el=element();el.classList.owner=el;
  await controller.showBanner("main_bottom_banner",el);
  const freeSync=controller.setAccess({resolved:true,role:"free",premium:false});
  await Promise.resolve();
  const premiumSync=controller.setAccess({resolved:true,role:"premium",premium:true});
  releaseConsent();await Promise.all([freeSync,premiumSync]);
  assert.equal(el.hidden,true);assert.equal(calls.includes("banner"),false);
});

test("CMP-fel är fail-closed och kärnflödet fortsätter",async()=>{
  const {ads,calls}=load(calls=>({async requestConsentInfo(){calls.push("consent");throw Object.assign(new Error("network"),{code:7})},async initialize(){calls.push("initialize")},async showBanner(){calls.push("banner")}}));
  const controller=ads.createController(config),el=element();el.classList.owner=el;
  await controller.showBanner("main_bottom_banner",el);
  await controller.setAccess({resolved:true,role:"free",premium:false});
  assert.deepEqual(calls,["consent"]);assert.equal(el.hidden,true);assert.equal(controller.getStatus().canRequestAds,false);
});
