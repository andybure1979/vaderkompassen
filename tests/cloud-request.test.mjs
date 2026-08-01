import test from "node:test";
import assert from "node:assert/strict";
import cloudRequests from "../cloud-request.js";

test("bygger stabil request key med trimning, unika värden och svensk sortering",()=>{
  const a=cloudRequests.createRequestKey("https://worker.test/",{activity:" fishing ",regions:["Södra Sverige","Mellansverige","Södra Sverige"],areas:[" Skåne ","Småland"]});
  const b=cloudRequests.createRequestKey("https://worker.test",{activity:"fishing",regions:["Mellansverige","Södra Sverige"],areas:["Småland","Skåne"]});
  assert.equal(a,b);
  assert.equal(a,"https://worker.test/v1/forecast?activity=fishing&regions=Mellansverige%2CS%C3%B6dra+Sverige&areas=Sk%C3%A5ne%2CSm%C3%A5land");
});

test("återanvänder ett pågående Promise för identisk URL",async()=>{
  const manager=cloudRequests.createManager();let calls=0;
  const task=async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,5));return "ok"};
  const [a,b]=await Promise.all([manager.run("/same",task),manager.run("/same",task)]);
  assert.equal(a,"ok");assert.equal(b,"ok");assert.equal(calls,1);
});

test("aborterar föregående anrop när URL:n ändras",async()=>{
  const manager=cloudRequests.createManager();let firstAborted=false;
  const first=manager.run("/first",signal=>new Promise((resolve,reject)=>{
    signal.addEventListener("abort",()=>{firstAborted=true;reject(new DOMException("Aborted","AbortError"))},{once:true});
  }));
  const second=manager.run("/second",async()=>"new");
  await assert.rejects(first,error=>error.name==="AbortError");
  assert.equal(await second,"new");assert.equal(firstAborted,true);
});

test("rensar avslutade anrop så nästa försök kan köras",async()=>{
  const manager=cloudRequests.createManager();let calls=0;
  await assert.rejects(manager.run("/retry",async()=>{calls++;throw new Error("fel")}));
  assert.equal(await manager.run("/retry",async()=>{calls++;return "ok"}),"ok");
  assert.equal(calls,2);
});

test("ett äldre finally rensar inte ett nyare aktivt anrop",async()=>{
  const manager=cloudRequests.createManager();let calls=0,releaseSecond;
  const first=manager.run("/first",signal=>new Promise((resolve,reject)=>{
    signal.addEventListener("abort",()=>setTimeout(()=>reject(new DOMException("Aborted","AbortError")),5),{once:true});
  }));
  const second=manager.run("/second",()=>{calls++;return new Promise(resolve=>{releaseSecond=resolve})});
  await assert.rejects(first,error=>error.name==="AbortError");
  const reused=manager.run("/second",()=>{calls++;return "fel"});
  assert.equal(reused,second);assert.equal(calls,1);
  releaseSecond("ny");assert.equal(await reused,"ny");
});
