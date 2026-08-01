import test from "node:test";
import assert from "node:assert/strict";
import cloudRequests from "../cloud-request.js";

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
