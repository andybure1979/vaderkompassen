import test from "node:test";
import assert from "node:assert/strict";
import {assertSnapshotPublishable} from "../cloudflare/src/index.js";

test("full snapshot med färska platser får publiceras",()=>{
  assert.equal(assertSnapshotPublishable({requestedPlaces:1000,freshPlaces:990,availablePlaces:1000}),true);
});

test("noll färska platser stoppar publicering även med fallback",()=>{
  assert.throws(()=>assertSnapshotPublishable({requestedPlaces:1000,freshPlaces:0,availablePlaces:1000}),/inga färska platser/);
});

test("ofullständig fallback stoppar publicering",()=>{
  assert.throws(()=>assertSnapshotPublishable({requestedPlaces:1000,freshPlaces:990,availablePlaces:999}),/999\/1000/);
});
