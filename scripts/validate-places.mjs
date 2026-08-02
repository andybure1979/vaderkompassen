import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const places=JSON.parse(await readFile(new URL("../data/places.json",import.meta.url),"utf8"));
const allowedTypes=new Set(["city","town","village","resort","coast","lake","river","harbour","fishing_water","hiking_area","mountain","surf_spot","ski_area","protected_area","destination"]);
const allowedCategories=new Set(["general","fishing","hiking","surf","coast","boat","skiing","cinema","indoorPool","cycling"]);
const allowedReviews=new Set(["verified","coordinate_verified","area_review_required","category_review_required","duplicate_review_required","disabled_pending_review"]);
const allowedRegions=new Set(["Södra Sverige","Mellansverige","Norra Sverige","Jylland","Fyn","Själland","Østlandet","Sørlandet","Vestlandet","Trøndelag","Nord-Norge"]);
const ids=new Set(),premium=places.filter(place=>place.accessTier==="premium"),free=places.filter(place=>place.accessTier==="free");
assert.equal(free.length,500,"De befintliga Free-platserna ska vara exakt 500");assert.equal(premium.length,500,"De nya Premium-posterna ska vara exakt 500 före granskning");
assert.deepEqual(Object.fromEntries(["SE","NO","DK"].map(code=>[code,premium.filter(place=>place.countryCode===code).length])),{SE:300,NO:100,DK:100});
for(const place of places){
  assert.ok(place.id&&!ids.has(place.id),`Dubblett eller tomt id: ${place.id}`);ids.add(place.id);
  assert.ok(Number.isFinite(place.latitude)&&place.latitude>=54&&place.latitude<=80,`Ogiltig latitud: ${place.id}`);assert.ok(Number.isFinite(place.longitude)&&place.longitude>=4&&place.longitude<=32,`Ogiltig longitud: ${place.id}`);
  assert.ok(allowedRegions.has(place.region),`Ogiltig region: ${place.id}`);assert.ok(place.area,`Area saknas: ${place.id}`);assert.ok(["SE","NO","DK"].includes(place.countryCode),`Ogiltig landskod: ${place.id}`);
  assert.ok(allowedTypes.has(place.placeType),`Ogiltig placeType: ${place.id}`);assert.ok(place.categories.every(category=>allowedCategories.has(category)),`Ogiltig kategori: ${place.id}`);assert.ok(["free","premium"].includes(place.accessTier),`Ogiltig accessTier: ${place.id}`);assert.ok(allowedReviews.has(place.reviewStatus),`Ogiltig reviewStatus: ${place.id}`);
  assert.ok(!(place.enabled&&["area_review_required","category_review_required","duplicate_review_required","disabled_pending_review"].includes(place.reviewStatus)),`Blockerad post är aktiv: ${place.id}`);
  assert.ok(!(place.surfSpot&&(!place.marine||!place.coastal)),`Surfspot saknar marine/coastal: ${place.id}`);assert.ok(!(place.placeType==="coast"&&!place.coastal),`Kustpost saknar coastal: ${place.id}`);assert.ok(!(place.freshwater&&place.marine),`Motsägande vattenflaggor: ${place.id}`);
}
assert.ok(free.every(place=>place.accessTier==="free"));assert.ok(premium.every(place=>place.accessTier==="premium"));
console.log(`Platsregister OK: ${free.length} Free + ${premium.length} Premium-kandidater, ${premium.filter(place=>place.enabled).length} Premium aktiverade.`);
