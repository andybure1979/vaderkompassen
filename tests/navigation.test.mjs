import test from "node:test";
import assert from "node:assert/strict";
import navigation from "../navigation.js";

const valid={lat:59.3293,lon:18.0686,label:"Stockholm"};

test("validerar koordinater och avvisar saknade eller ogiltiga värden",()=>{
  assert.deepEqual(navigation.coordinates(valid),{lat:59.3293,lon:18.0686});
  for(const place of [{},{lat:null,lon:18},{lat:91,lon:18},{lat:59,lon:-181}])assert.equal(navigation.coordinates(place),null);
});

test("bygger säkra destinationslänkar med koordinater",()=>{
  const google=new URL(navigation.buildGoogleMapsUrl(valid));
  assert.equal(google.origin+google.pathname,"https://www.google.com/maps/dir/");
  assert.equal(google.searchParams.get("api"),"1");
  assert.equal(google.searchParams.get("destination"),"59.3293,18.0686");
  const apple=new URL(navigation.buildAppleMapsUrl(valid));
  assert.equal(apple.origin+apple.pathname,"https://maps.apple.com/");
  assert.equal(apple.searchParams.get("daddr"),"59.3293,18.0686");
  assert.equal(apple.searchParams.get("q"),"Stockholm");
});

test("skapar inte en odokumenterad Topo GPS-länk",()=>{
  assert.equal(navigation.buildTopoGpsUrl(valid),null);
});
