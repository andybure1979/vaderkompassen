import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
const start=app.indexOf("function activityMetricItems");
const end=app.indexOf("function winnerMetricCards",start);
const metrics=app.slice(start,end);

test("bad, kust, surf och fiske visar vattentemperatur endast när data finns",()=>{
  assert.match(metrics,/Number\.isFinite\(r\.waterTemperature\)\?r\.waterTemperature:Number\.isFinite\(r\.seaTemp\)\?r\.seaTemp:null/);
  assert.match(metrics,/settings\.activity==="general"[\s\S]*?"vattentemperatur"/);
  assert.match(metrics,/settings\.activity==="surf"[\s\S]*?"vattentemperatur"/);
  assert.match(metrics,/settings\.activity==="coast"\?"vattentemperatur":"havstemperatur"/);
  assert.match(metrics,/if\(settings\.activity==="fishing"\)[\s\S]*?Number\.isFinite\(waterTemperature\)/);
  assert.equal((metrics.match(/add\("💧"/g)||[]).length,3);
  assert.match(metrics,/settings\.activity==="coast"\?"💧":"🌡️"/);
});
