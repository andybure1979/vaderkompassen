import test from "node:test";
import assert from "node:assert/strict";
import refreshApi from "../refresh-controller.js";

test("pull-to-refresh startar en request längst upp och samordnar dubbla gester",async()=>{
  let calls=0,release;const events=[];
  const controller=refreshApi.createRefreshController({onEvent:event=>events.push(event.type),refresh:()=>{calls++;return new Promise(resolve=>{release=resolve})}});
  assert.equal(controller.startPull(10,true),true);
  assert.ok(controller.movePull(150)>=64);
  const first=controller.endPull(),second=controller.request("pull");
  assert.equal(first,second);assert.equal(calls,0);
  await Promise.resolve();assert.equal(calls,1);
  release({status:"current"});await first;
  assert.deepEqual(events,["pullStart","pullDistanceChanged","thresholdReached","refreshStarted","refreshUnchanged"]);
});

test("dragning under tröskeln startar inte refresh men rapporterar dragningen",()=>{
  let calls=0;const events=[];
  const controller=refreshApi.createRefreshController({onEvent:event=>events.push(event.type),refresh:()=>{calls++}});
  controller.startPull(20,true);assert.ok(controller.movePull(80)<64);assert.equal(controller.endPull(),null);
  assert.equal(calls,0);assert.deepEqual(events,["pullStart","pullDistanceChanged"]);
});

test("rapporterar ny, oförändrad och misslyckad refresh",async()=>{
  for(const [status,expected] of [["updated","refreshCompleted"],["current","refreshUnchanged"],["error","refreshFailed"]]){
    const events=[],controller=refreshApi.createRefreshController({onEvent:event=>events.push(event.type),refresh:async()=>({status})});
    await controller.request("manual");assert.deepEqual(events,["refreshStarted",expected]);
  }
  const events=[],controller=refreshApi.createRefreshController({onEvent:event=>events.push(event.type),refresh:async()=>{throw new Error("nätfel")}});
  await assert.rejects(controller.request("manual"),/nätfel/);assert.deepEqual(events,["refreshStarted","refreshFailed"]);
});

test("pull ignoreras när vyn inte kan starta gesten",()=>{
  const controller=refreshApi.createRefreshController({refresh:()=>{throw new Error("ska inte köras")}});
  assert.equal(controller.startPull(10,false),false);
  assert.equal(controller.movePull(200),0);
  assert.equal(controller.endPull(),null);
});

test("appen kopplar gesten till verklig scrollcontainer och blockerar karta och dialog",async()=>{
  const app=await import("node:fs/promises").then(fs=>fs.readFile(new URL("../app.js",import.meta.url),"utf8"));
  assert.match(app,/document\.scrollingElement\|\|document\.documentElement/);
  assert.match(app,/pullScrollContainer\.scrollTop>0/);
  assert.match(app,/dialog\[open\]/);assert.match(app,/#weatherMap,\.leaflet-container/);
  assert.match(app,/pullEventTarget\.addEventListener\("touchmove"[\s\S]*passive:false/);
  assert.match(app,/refreshButton\.onclick=\(\)=>forecastRefresh\.request\("manual"\)/);
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
