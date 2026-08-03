import test from "node:test";
import assert from "node:assert/strict";
import {assertSnapshotPublishable,snapshotPlaceId} from "../cloudflare/src/index.js";
import {readFile} from "node:fs/promises";

test("full snapshot med färska platser får publiceras",()=>{
  assert.equal(assertSnapshotPublishable({requestedPlaces:1000,freshPlaces:990,availablePlaces:1000}),true);
});

test("noll färska platser stoppar publicering även med fallback",()=>{
  assert.throws(()=>assertSnapshotPublishable({requestedPlaces:1000,freshPlaces:0,availablePlaces:1000}),/inga färska platser/);
});

test("ofullständig fallback stoppar publicering",()=>{
  assert.throws(()=>assertSnapshotPublishable({requestedPlaces:1000,freshPlaces:990,availablePlaces:999}),/999\/1000/);
});

test("snapshotplatser identifieras med placeId och tvetydiga äldre namn avvisas",()=>{
  assert.equal(snapshotPlaceId({placeId:"se-abborrtjarn-2727701",place:"Abborrtjärn"}),"se-abborrtjarn-2727701");
  assert.equal(snapshotPlaceId({place:"Abborrtjärn"}),null);
  assert.equal(snapshotPlaceId({place:"Stockholm"}),"free-se-stockholm");
});

test("snapshotflödet begränsar samtidighet och sparar leverantörsfel",async()=>{
  const source=await readFile(new URL("../cloudflare/src/index.js",import.meta.url),"utf8");
  assert.match(source,/const WEATHER_CONCURRENCY=2/);
  assert.match(source,/status===429\|\|status>=500/);
  assert.match(source,/WEATHER_RATE_LIMIT_DELAY_MS=61000/);
  assert.match(source,/weatherRetryDelayMs\(error,attempt\)/);
  assert.match(source,/new Set\(freshRows\.map\(snapshotPlaceId\)/);
  assert.match(source,/providerErrors:failedParts\.map/);
  assert.match(source,/\.\.\.\(e\.details\|\|\{\}\)/);
});
