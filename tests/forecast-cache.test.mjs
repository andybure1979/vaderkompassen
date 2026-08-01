import test from "node:test";
import assert from "node:assert/strict";
import worker,{canonicalForecastUrl,compactForecastRow,FORECAST_ROW_FIELDS,normalizeForecastRequest} from "../cloudflare/src/index.js";

class MemoryCache{
  constructor(){this.items=new Map();this.puts=0}
  async match(request){const response=this.items.get(request.url);return response?.clone()}
  async put(request,response){this.puts++;this.items.set(request.url,response.clone())}
}
const env={SUPABASE_URL:"https://supabase.test",SUPABASE_SERVICE_ROLE_KEY:"test-key",ALLOWED_ORIGIN:"*",APP_VERSION:"14.3.1"};
const rows=Array.from({length:80},(_,index)=>({day:"2026-08-01",place:["Varberg","Falkenberg","Halmstad"][index%3],area:"Skåne",region:"Södra Sverige",lat:55.6,lon:13,temp:20,min:12,rain:0,risk:0,sun:8,cloudCover:50,wind:3,windGust:5,windDirection:180,models:1,usedSources:["Open-Meteo"],primarySource:"Open-Meteo",confidence:80,serverScores:{general:index,fishing:80-index,surf:index,hiking:index,ski:index},internal:"ska bort"}));
const shard={payload:{ok:true,version:"14.3.1",generatedAt:"2026-08-01T00:00:00Z",activeDate:"2026-08-01",dailyResults:{"2026-08-01":rows},meta:{}},source_status:[]};

function setup({delay=0,failSnapshot=false,rankedBody=null}={}){
  const calls={head:0,snapshot:0,ranked:0};globalThis.caches={default:new MemoryCache()};
  globalThis.fetch=async input=>{
    const url=new URL(String(input));
    if(url.pathname.endsWith("/rpc/get_ranked_forecast")){
      calls.ranked++;
      return rankedBody?new Response(JSON.stringify(rankedBody),{status:200}):new Response(JSON.stringify({message:"function missing"}),{status:404});
    }
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

test("databasrankat svar går direkt till cache utan regional JSON-bearbetning",async()=>{
  const ranked={ok:true,version:"14.3.1",generatedAt:"2026-08-01T00:00:00Z",dailyResults:{"2026-08-01":[{place:"Falun",serverScore:91}]},meta:{performance:{databaseRanked:true}}};
  const state=setup({rankedBody:ranked}),response=await worker.fetch(request("activity=fishing&regions=Mellansverige&areas=Dalarna"),{...env,APP_VERSION:"14.3.1"},state.ctx);
  assert.equal(response.status,200);assert.equal(response.headers.get("X-Vaderkompassen-Database-Ranked"),"true");
  assert.deepEqual(await response.json(),ranked);assert.equal(state.calls.ranked,1);assert.equal(state.calls.head,0);assert.equal(state.calls.snapshot,0);
});

test("samtidiga identiska cachemissar delar ett Supabase-flöde men egna Response",async()=>{
  const state=setup({delay:10}),req=request("activity=general&regions=S%C3%B6dra%20Sverige");
  const [a,b]=await Promise.all([worker.fetch(req,env,state.ctx),worker.fetch(req,env,state.ctx)]);
  assert.notEqual(a,b);assert.equal(state.calls.head,1);assert.equal(state.calls.snapshot,1);
  assert.deepEqual([a.headers.get("X-Vaderkompassen-Coalesced"),b.headers.get("X-Vaderkompassen-Coalesced")].sort(),["false","true"]);
  assert.equal(await a.text(),await b.text());
});

test("fem samtidiga requests får fem läsbara Response och en enda cache-put",async()=>{
  const state=setup({delay:10}),req=request("activity=general&regions=S%C3%B6dra%20Sverige");
  const responses=await Promise.all(Array.from({length:5},()=>worker.fetch(req,env,state.ctx)));
  assert.equal(new Set(responses).size,5);assert.equal(state.calls.head,1);assert.equal(state.calls.snapshot,1);
  const bodies=await Promise.all(responses.map(response=>response.text()));
  assert.equal(new Set(bodies).size,1);
  await Promise.all(state.pending);assert.equal(globalThis.caches.default.puts,1);
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

test("samtidigt Supabase-fel delas, cachelagras inte och kan därefter återförsökas",async()=>{
  const failed=setup({delay:5,failSnapshot:true}),req=request("activity=general&regions=S%C3%B6dra%20Sverige");
  const originalError=console.error;console.error=()=>{};
  let responses;
  try{responses=await Promise.all([worker.fetch(req,env,failed.ctx),worker.fetch(req,env,failed.ctx)])}finally{console.error=originalError}
  assert.deepEqual(responses.map(response=>response.status),[500,500]);
  assert.equal(failed.calls.head,1);assert.equal(failed.calls.snapshot,1);assert.equal(globalThis.caches.default.puts,0);
  const retry=setup(),response=await worker.fetch(req,env,retry.ctx);
  assert.equal(response.status,200);assert.equal(retry.calls.snapshot,1);
});

test("ranking och max 75 rader per dag behålls",async()=>{
  const state=setup(),response=await worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige"),env,state.ctx),body=await response.json();
  const result=body.dailyResults["2026-08-01"];
  assert.equal(result.length,75);assert.equal(result[0].serverScore,79);assert.equal(result.at(-1).serverScore,5);
  assert.equal("serverScores" in result[0],false);assert.equal("internal" in result[0],false);
  assert.equal(body.rankingEngine,"cloud-v6-performance-2");
  assert.equal(response.headers.get("X-Vaderkompassen-Worker-Version"),"14.3.1");
  assert.deepEqual(Object.keys(body.meta.performance).sort(),["cache","coalesced","compactMs","fieldsPerRowApprox","filterMs","headQueryMs","mergeMs","parseMs","responseBytes","responseTextMs","rowsMatched","rowsRead","rowsReturned","serializationMs","shards","sliceMs","snapshotQueryMs","sortMs","supabaseBytes","totalMs"].sort());
  assert.ok(Number.isFinite(body.meta.performance.serializationMs));assert.ok(body.meta.performance.totalMs>=body.meta.performance.serializationMs);
  assert.ok(body.meta.performance.supabaseBytes>0);assert.ok(body.meta.performance.responseBytes>0);
});

test("allowlisten bevarar UI-fält och giltiga nollvärden men utelämnar null och interna fält",()=>{
  const source=Object.fromEntries(FORECAST_ROW_FIELDS.map(field=>[field,0]));
  Object.assign(source,{day:"2026-08-01",place:"Test",area:"Skåne",region:"Södra Sverige",waveHeight:null,internal:"hemligt",serverScores:{general:77}});
  const compact=compactForecastRow(source,77);
  assert.equal(compact.rain,0);assert.equal(compact.hasMarine,0);assert.equal(compact.serverScore,77);
  assert.equal("waveHeight" in compact,false);assert.equal("internal" in compact,false);assert.equal("serverScores" in compact,false);
});

for(const activity of ["general","fishing","surf","hiking","ski"]){
  test(`kompakt ${activity}-svar behåller ordning och vald poäng`,async()=>{
    const state=setup(),response=await worker.fetch(request(`activity=${activity}&regions=S%C3%B6dra%20Sverige`),env,state.ctx),body=await response.json();
    const result=body.dailyResults["2026-08-01"];
    assert.equal(result.length,75);
    const expected=[...rows].sort((a,b)=>b.serverScores[activity]-a.serverScores[activity]||b.confidence-a.confidence).slice(0,75);
    assert.deepEqual(result.map(row=>row.place),expected.map(row=>row.place));
    assert.deepEqual(result.map(row=>row.serverScore),expected.map(row=>row.serverScores[activity]));
  });
}

for(const activity of ["cinema","indoorPool"]){
  test(`${activity} behåller frontendfallback när snapshoten saknar förberedd poäng`,async()=>{
    const state=setup(),response=await worker.fetch(request(`activity=${activity}&regions=S%C3%B6dra%20Sverige`),env,state.ctx),body=await response.json();
    const result=body.dailyResults["2026-08-01"];
    assert.equal(result.length,75);assert.equal(result.every(row=>!("serverScore" in row)),true);
  });
}

test("providerverifieringsstubbar kräver admin-token och returnerar not configured",async()=>{
  const state=setup(),url="https://worker.test/v1/subscriptions/apple/verify";
  assert.equal((await worker.fetch(new Request(url,{method:"POST"}),env,state.ctx)).status,401);
  const protectedEnv={...env,ADMIN_TOKEN:"admin-test"};
  const response=await worker.fetch(new Request(url,{method:"POST",headers:{"x-admin-token":"admin-test"}}),protectedEnv,state.ctx);
  assert.equal(response.status,501);assert.deepEqual(await response.json(),{ok:false,error:"Provider verification not configured",provider:"apple"});
});

test("admin health kräver användarens bearer-session",async()=>{
  const state=setup(),response=await worker.fetch(new Request("https://worker.test/v1/admin/health"),env,state.ctx);
  assert.equal(response.status,401);
  assert.equal((await response.json()).error,"Adminsession saknas");
});

test("äldre driftstatus kräver också Admin-session",async()=>{
  const state=setup(),response=await worker.fetch(new Request("https://worker.test/v1/status"),env,state.ctx);
  assert.equal(response.status,401);
});
