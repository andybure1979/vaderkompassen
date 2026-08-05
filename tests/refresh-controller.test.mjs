import test from "node:test";
import assert from "node:assert/strict";
import refreshApi from "../refresh-controller.js";

test("pull-to-refresh startar en request längst upp och samordnar dubbla gester",async()=>{
  let calls=0,release;
  const controller=refreshApi.createRefreshController({refresh:()=>{calls++;return new Promise(resolve=>{release=resolve})}});
  assert.equal(controller.startPull(10,true),true);
  assert.ok(controller.movePull(150)>=64);
  const first=controller.endPull(),second=controller.request("pull");
  assert.equal(first,second);assert.equal(calls,0);
  await Promise.resolve();assert.equal(calls,1);
  release({status:"current"});await first;
});

test("pull ignoreras när vyn inte kan starta gesten",()=>{
  const controller=refreshApi.createRefreshController({refresh:()=>{throw new Error("ska inte köras")}});
  assert.equal(controller.startPull(10,false),false);
  assert.equal(controller.movePull(200),0);
  assert.equal(controller.endPull(),null);
});

test("resume under fem minuter gör inget men längre bakgrund startar exakt en kontroll",async()=>{
  let time=1000,calls=0;
  const controller=refreshApi.createRefreshController({now:()=>time,refresh:async reason=>{calls++;return reason}});
  controller.setActive(false);time+=299999;
  assert.equal(controller.setActive(true),null);assert.equal(calls,0);
  controller.setActive(false);time+=300000;
  const nativeResume=controller.setActive(true),duplicateVisibility=controller.setActive(true);
  assert.equal(duplicateVisibility,null);assert.equal(await nativeResume,"resume");assert.equal(calls,1);
});
