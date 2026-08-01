import test from "node:test";
import assert from "node:assert/strict";
import worker,{canonicalForecastUrl,normalizeForecastRequest} from "../cloudflare/src/index.js";

class MemoryCache{
  constructor(){this.items=new Map()}
  async match(request){const response=this.items.get(request.url);return response?.clone()}
  async put(request,response){this.items.set(request.url,response.clone())}
}
const env={SUPABASE_URL:"https://supabase.test",SUPABASE_SERVICE_ROLE_KEY:"test-key",ALLOWED_ORIGIN:"*",APP_VERSION:"14.1.0a"};
const rows=Array.from({length:80},(_,index)=>({day:"2026-08-01",place:`Plats ${index}`,area:"Skåne",region:"Södra Sverige",confidence:80,temp:20,rain:0,risk:0,sun:8,wind:3,serverScores:{general:index}}));
const shard={payload:{ok:true,version:"14.1.0a",generatedAt:"2026-08-01T00:00:00Z",activeDate:"2026-08-01",dailyResults:{"2026-08-01":rows},meta:{}},source_status:[]};

function setup({delay=0,failSnapshot=false}={}){
  const calls={head:0,snapshot:0};globalThis.caches={default:new MemoryCache()};
  globalThis.fetch=async input=>{
    const url=new URL(String(input));
    if(url.searchParams.get("select")==="generated_at"){
      calls.head++;return new Response(JSON.stringify([{generated_at:"2026-08-01T00:00:00Z"}]),{status:200});
    }
    calls.snapshot++;if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    if(failSnapshot)return new Response(JSON.stringify({message:"fel"}),{status:500});
    return new Response(JSON.stringify([shard]),{status:200});
  };
  const pending=[],ctx={waitUntil(promise){pending.push(promise)}};
  return {calls,pending,ctx};
}
const request=query=>new Request(`https://worker.test/v1/forecast?${query}`);

test("normaliserar ordning, dubbletter, endpoint och irrelevanta områden",()=>{
  const a=normalizeForecastRequest(new URL("https://worker.test/forecast?areas=Småland,Skåne,Skåne&regions=Södra%20Sverige,Södra%20Sverige&activity=general&okänd=1"));
  const b=normalizeForecastRequest(new URL("https://worker.test/v1/forecast?activity=general&regions=Södra%20Sverige&areas=Skåne,Småland"));
  assert.deepEqual(a,b);
  assert.equal(canonicalForecastUrl("https://worker.test",a).toString(),canonicalForecastUrl("https://worker.test",b).toString());
  const irrelevant=normalizeForecastRequest(new URL("https://worker.test/v1/forecast?regions=Mellansverige&areas=Skåne&activity=okänd"));
  assert.deepEqual(irrelevant,{activity:"general",regions:["Mellansverige"],areas:[]});
});

test("första identiska request är MISS och nästa HIT utan Supabase",async()=>{
  const state=setup(),first=await worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige&areas=Sk%C3%A5ne"),env,state.ctx);
  assert.equal(first.headers.get("X-Vaderkompassen-Cache"),"MISS");await Promise.all(state.pending);
  const before={...state.calls},second=await worker.fetch(request("areas=Sk%C3%A5ne&regions=S%C3%B6dra%20Sverige&activity=general"),env,state.ctx);
  assert.equal(second.headers.get("X-Vaderkompassen-Cache"),"HIT");assert.deepEqual(state.calls,before);
});

test("samtidiga identiska cachemissar delar ett Supabase-flöde men egna Response",async()=>{
  const state=setup({delay:10}),req=request("activity=general&regions=S%C3%B6dra%20Sverige");
  const [a,b]=await Promise.all([worker.fetch(req,env,state.ctx),worker.fetch(req,env,state.ctx)]);
  assert.notEqual(a,b);assert.equal(state.calls.head,1);assert.equal(state.calls.snapshot,1);
  assert.deepEqual([a.headers.get("X-Vaderkompassen-Coalesced"),b.headers.get("X-Vaderkompassen-Coalesced")].sort(),["false","true"]);
  assert.equal(await a.text(),await b.text());
});

test("olika requests coalescas inte",async()=>{
  const state=setup({delay:5});
  await Promise.all([worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige"),env,state.ctx),worker.fetch(request("activity=general&regions=Mellansverige"),env,state.ctx)]);
  assert.equal(state.calls.head,2);assert.equal(state.calls.snapshot,2);
});

test("Supabase-fel cachelagras inte och inflight rensas",async()=>{
  const failed=setup({failSnapshot:true}),req=request("activity=general&regions=S%C3%B6dra%20Sverige");
  const originalError=console.error;console.error=()=>{};
  try{assert.equal((await worker.fetch(req,env,failed.ctx)).status,500)}finally{console.error=originalError}
  const retry=setup();const response=await worker.fetch(req,env,retry.ctx);
  assert.equal(response.status,200);assert.equal(retry.calls.head,1);assert.equal(retry.calls.snapshot,1);
});

test("ranking och max 75 rader per dag behålls",async()=>{
  const state=setup(),response=await worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige"),env,state.ctx),body=await response.json();
  const result=body.dailyResults["2026-08-01"];
  assert.equal(result.length,75);assert.equal(result[0].serverScores.general,79);assert.equal(result.at(-1).serverScores.general,5);
  assert.equal(body.rankingEngine,"cloud-v5-edge-cache-coalescing");
  assert.deepEqual(Object.keys(body.meta.performance).sort(),["cache","coalesced","filterMs","headQueryMs","mergeMs","parseMs","responseTextMs","rowsMatched","rowsRead","rowsReturned","serializationMs","shards","sliceMs","snapshotQueryMs","sortMs","totalMs"].sort());
  assert.ok(Number.isFinite(body.meta.performance.serializationMs));assert.ok(body.meta.performance.totalMs>=body.meta.performance.serializationMs);
});
