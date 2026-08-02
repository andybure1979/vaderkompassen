import test from "node:test";
import assert from "node:assert/strict";
import {assertSnapshotPublishable} from "../cloudflare/src/index.js";

test("full snapshot med färska platser får publiceras",()=>{
  assert.equal(assertSnapshotPublishable({requestedPlaces:547,freshPlaces:520,availablePlaces:547}),true);
});

test("noll färska platser stoppar publicering även med fallback",()=>{
  assert.throws(()=>assertSnapshotPublishable({requestedPlaces:547,freshPlaces:0,availablePlaces:547}),/inga färska platser/);
});

test("ofullständig fallback stoppar publicering",()=>{
  assert.throws(()=>assertSnapshotPublishable({requestedPlaces:547,freshPlaces:500,availablePlaces:546}),/546\/547/);
});
