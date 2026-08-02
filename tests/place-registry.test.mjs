import test from "node:test";
import assert from "node:assert/strict";
import {PLACE_REGISTRY,getAccessiblePlaces,getPlaceDisplayName} from "../cloudflare/src/place-registry.js";

test("registret bevarar 500 Free och importerar 300/100/100 Premium",()=>{
  const free=PLACE_REGISTRY.filter(place=>place.accessTier==="free"),premium=PLACE_REGISTRY.filter(place=>place.accessTier==="premium");
  assert.equal(free.length,500);assert.equal(premium.length,500);
  assert.deepEqual(Object.fromEntries(["SE","NO","DK"].map(code=>[code,premium.filter(place=>place.countryCode===code).length])),{SE:300,NO:100,DK:100});
});

test("central entitlement ger rätt aktiva platsurval",()=>{
  const freeCount=getAccessiblePlaces(PLACE_REGISTRY,{role:"free"}).length,premiumCount=getAccessiblePlaces(PLACE_REGISTRY,{role:"premium"}).length;
  assert.equal(freeCount,500);assert.equal(premiumCount,547);
  for(const role of ["trial","premium","vip","admin"])assert.equal(getAccessiblePlaces(PLACE_REGISTRY,{role}).length,premiumCount);
  assert.equal(getAccessiblePlaces(PLACE_REGISTRY,{role:"expired"}).length,freeCount);
  assert.equal(getAccessiblePlaces(PLACE_REGISTRY,{role:"cancelled_active",current_period_ends_at:"2999-01-01"}).length,premiumCount);
  assert.equal(getAccessiblePlaces(PLACE_REGISTRY,{role:"cancelled_active",current_period_ends_at:"2000-01-01"}).length,freeCount);
});

test("blockerande granskning är avstängd och lika namn förtydligas",()=>{
  const blockers=PLACE_REGISTRY.filter(place=>["area_review_required","category_review_required","duplicate_review_required"].includes(place.reviewStatus));
  assert.ok(blockers.length>0);assert.ok(blockers.every(place=>place.enabled===false));
  const duplicate=PLACE_REGISTRY.find(place=>PLACE_REGISTRY.some(other=>other.id!==place.id&&other.name.toLocaleLowerCase("sv")===place.name.toLocaleLowerCase("sv")));
  assert.ok(duplicate);assert.notEqual(getPlaceDisplayName(duplicate),duplicate.name);
});

test("marine flaggas bara på kustposter och säkra surfspots",()=>{
  assert.ok(PLACE_REGISTRY.filter(place=>place.enabled&&place.marine).every(place=>place.coastal));
  assert.ok(PLACE_REGISTRY.filter(place=>place.surfSpot).every(place=>place.marine&&place.coastal&&place.categories.includes("surf")));
  assert.ok(PLACE_REGISTRY.filter(place=>place.freshwater).every(place=>!place.marine));
});
