import test from "node:test";
import assert from "node:assert/strict";
import worker,{canonicalForecastUrl,compactForecastRow,FORECAST_ROW_FIELDS,normalizeForecastRequest} from "../cloudflare/src/index.js";

class MemoryCache{
  constructor(){this.items=new Map();this.puts=0}
  async match(request){const response=this.items.get(request.url);return response?.clone()}
  async put(request,response){this.puts++;this.items.set(request.url,response.clone())}
  async delete(request){return this.items.delete(request.url)}
}
const env={SUPABASE_URL:"https://supabase.test",SUPABASE_SERVICE_ROLE_KEY:"test-key",ALLOWED_ORIGIN:"*",APP_VERSION:"14.4.1"};
const rows=Array.from({length:80},(_,index)=>({day:"2026-08-01",place:["Varberg","Falkenberg","Halmstad"][index%3],area:"Skåne",region:"Södra Sverige",lat:55.6,lon:13,temp:20,min:12,rain:0,risk:0,sun:8,cloudCover:50,wind:3,windGust:5,windDirection:180,models:1,usedSources:["Open-Meteo"],primarySource:"Open-Meteo",confidence:80,serverScores:{general:index,fishing:80-index,surf:index,hiking:index,ski:index},internal:"ska bort"}));
const shard={payload:{ok:true,version:"14.4.1",workerVersion:"14.4.1",snapshotVersion:"snapshot-20260801T000000Z",generatedAt:"2026-08-01T00:00:00Z",activeDate:"2026-08-01",dailyResults:{"2026-08-01":rows},meta:{}},source_status:[]};

function setup({delay=0,failSnapshot=false,rankedBody=null,prebuiltRecords=null,shardValue=shard,premium=false}={}){
  const calls={head:0,snapshot:0,ranked:0,prebuilt:0,summary:0};globalThis.caches={default:new MemoryCache()};
  globalThis.fetch=async input=>{
    const url=new URL(String(input));
    if(url.pathname.endsWith("/auth/v1/user"))return premium?new Response(JSON.stringify({id:"premium-user"}),{status:200}):new Response("{}",{status:401});
    if(url.pathname.endsWith("/rest/v1/rpc/get_user_entitlement"))return new Response(JSON.stringify({is_premium:premium}),{status:200});
    if(url.pathname.endsWith("/forecast_ranking_versions")){
      calls.prebuilt++;
      return prebuiltRecords?new Response(JSON.stringify([{snapshot_version:"snapshot-20260801",generated_at:"2026-08-01T00:00:00Z",active_date:"2026-08-01"}]),{status:200}):new Response(JSON.stringify({message:"forecast_ranking_versions missing"}),{status:404});
    }
    if(url.pathname.endsWith("/forecast_rankings")){
      calls.prebuilt++;
      if(!prebuiltRecords)return new Response(JSON.stringify({message:"forecast_rankings missing"}),{status:404});
      const dayFilter=String(url.searchParams.get("forecast_day")||"").replace(/^eq\./,"");
      return new Response(JSON.stringify(dayFilter?prebuiltRecords.filter(record=>record.forecast_day===dayFilter):prebuiltRecords),{status:200});
    }
    if(url.pathname.endsWith("/forecast_snapshots")&&url.searchParams.get("select")==="meta:payload->meta"){
      calls.summary++;
      return new Response(JSON.stringify([{meta:{placesRequested:1000,placesFresh:809,placesFallback:21,placesAvailable:830}}]),{status:200});
    }
    if(url.pathname.endsWith("/rpc/get_ranked_forecast")){
      calls.ranked++;
      return rankedBody?new Response(JSON.stringify(rankedBody),{status:200}):new Response(JSON.stringify({message:"function missing"}),{status:404});
    }
    if(url.searchParams.get("select")==="generated_at"){
      calls.head++;return new Response(JSON.stringify([{generated_at:"2026-08-01T00:00:00Z"}]),{status:200});
    }
    calls.snapshot++;if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
    if(failSnapshot)return new Response(JSON.stringify({message:"fel"}),{status:500});
    return new Response(JSON.stringify([shardValue]),{status:200});
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
  assert.deepEqual(irrelevant,{activity:"general",regions:["Mellansverige"],areas:[],days:"1",requestedAccess:"free",access:"free"});
});

test("första identiska request är MISS och nästa HIT utan Supabase",async()=>{
  const state=setup(),first=await worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige&areas=Sk%C3%A5ne"),env,state.ctx);
  assert.equal(first.headers.get("X-Vaderkompassen-Cache"),"MISS");await Promise.all(state.pending);
  const before={...state.calls},second=await worker.fetch(request("areas=Sk%C3%A5ne&regions=S%C3%B6dra%20Sverige&activity=general"),env,state.ctx);
  assert.equal(second.headers.get("X-Vaderkompassen-Cache"),"HIT");assert.deepEqual(state.calls,before);
});

test("ETag ger 304 utan ny Supabase-fråga",async()=>{
  const state=setup(),first=await worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige"),env,state.ctx);
  await Promise.all(state.pending);const etag=first.headers.get("ETag"),before={...state.calls};
  const conditional=new Request(request("activity=general&regions=S%C3%B6dra%20Sverige"),{headers:{"If-None-Match":etag}});
  const second=await worker.fetch(conditional,env,state.ctx);
  assert.equal(second.status,304);assert.equal(await second.text(),"");assert.deepEqual(state.calls,before);
  assert.equal(second.headers.get("X-Vaderkompassen-Snapshot-Version"),"snapshot-20260801T000000Z");
});

test("Free får en dag medan Premium får samtliga dagar",async()=>{
  const secondRows=rows.map(row=>({...row,day:"2026-08-02"})),twoDayShard={...shard,payload:{...shard.payload,dailyResults:{"2026-08-01":rows,"2026-08-02":secondRows}}};
  const freeState=setup({shardValue:twoDayShard}),free=await worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige&days=all"),env,freeState.ctx),freeBody=await free.json();
  const premiumState=setup({shardValue:twoDayShard,premium:true}),premiumRequest=new Request(request("activity=general&regions=S%C3%B6dra%20Sverige&days=all&access=premium"),{headers:{Authorization:"Bearer valid"}}),premiumResponse=await worker.fetch(premiumRequest,env,premiumState.ctx),premiumBody=await premiumResponse.json();
  assert.deepEqual(Object.keys(freeBody.dailyResults),["2026-08-01"]);assert.equal(Object.keys(premiumBody.dailyResults).length,2);
  assert.ok(Number(free.headers.get("X-Vaderkompassen-Response-Bytes"))<Number(premiumResponse.headers.get("X-Vaderkompassen-Response-Bytes")));
});

test("manipulerad access=premium utan giltig session ger inga Premiumplatser",async()=>{
  const state=setup(),response=await worker.fetch(request("activity=general&access=premium&days=all"),env,state.ctx);
  assert.equal(response.status,401);assert.match((await response.json()).error,/Premiumsession/);assert.equal(state.calls.snapshot,0);
});

test("förbyggd ranking undviker legacy-RPC och regional JSON-expansion",async()=>{
  const rankedRows=[...rows].sort((a,b)=>b.serverScores.general-a.serverScores.general||b.confidence-a.confidence).map(row=>({rankSortScore:row.serverScores.general,row:compactForecastRow(row,row.serverScores.general)}));
  const records=[{snapshot_version:"snapshot-20260801",generated_at:"2026-08-01T00:00:00Z",forecast_day:"2026-08-01",region:"Södra Sverige",ranked_rows:rankedRows}];
  const state=setup({prebuiltRecords:records}),response=await worker.fetch(request("activity=general&regions=S%C3%B6dra%20Sverige&days=1"),env,state.ctx),body=await response.json();
  assert.equal(body.rankingEngine,"cloud-v7-prebuilt");assert.equal(body.dailyResults["2026-08-01"].length,75);
  assert.equal(state.calls.ranked,0);assert.equal(state.calls.head,0);assert.equal(state.calls.snapshot,0);assert.equal(state.calls.prebuilt,2);assert.equal(state.calls.summary,1);
  assert.equal(response.headers.get("X-Vaderkompassen-Supabase-Calls"),"3");
  assert.deepEqual({requested:body.meta.placesRequested,fresh:body.meta.placesFresh,fallback:body.meta.placesFallback,available:body.meta.placesAvailable},{requested:1000,fresh:809,fallback:21,available:830});
});

test("legacy-RPC får ett serverbestämt platsurval och går direkt till cache",async()=>{
  const ranked={ok:true,version:"14.4.1",generatedAt:"2026-08-01T00:00:00Z",dailyResults:{"2026-08-01":[{place:"Falun",serverScore:91}]},meta:{performance:{databaseRanked:true}}};
  const state=setup({rankedBody:ranked}),response=await worker.fetch(request("activity=fishing&regions=Mellansverige&areas=Dalarna"),state.env||env,state.ctx);
  assert.equal(response.status,200);assert.equal(response.headers.get("X-Vaderkompassen-Database-Ranked"),"true");
  const body=await response.json();assert.deepEqual(body.dailyResults,ranked.dailyResults);assert.equal(body.workerVersion,"14.4.1");assert.ok(body.snapshotVersion);
  assert.equal(state.calls.ranked,1);assert.equal(state.calls.head,0);assert.equal(state.calls.snapshot,0);
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

test("stale-träffar svarar direkt och samordnar en enda bakgrundsuppdatering",async()=>{
  const state=setup({delay:10}),req=request("activity=general&regions=S%C3%B6dra%20Sverige"),normalized=normalizeForecastRequest(new URL(req.url));
  const cacheKey=new Request(canonicalForecastUrl("https://worker.test",normalized));
  await globalThis.caches.default.put(cacheKey,new Response(JSON.stringify({ok:true,dailyResults:{"2026-08-01":[{place:"Cache"}]}}),{headers:{"content-type":"application/json","X-Vaderkompassen-Cached-At":new Date(Date.now()-360000).toISOString(),ETag:'W/"old"'}}));
  const responses=await Promise.all(Array.from({length:5},()=>worker.fetch(req,env,state.ctx)));
  assert.equal(responses.every(response=>response.headers.get("X-Vaderkompassen-Cache")==="STALE"),true);
  await Promise.all(state.pending);assert.equal(state.calls.head,1);assert.equal(state.calls.snapshot,1);
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
  assert.equal(response.headers.get("X-Vaderkompassen-Worker-Version"),"14.4.1");
  assert.deepEqual(Object.keys(body.meta.performance).sort(),["cache","coalesced","compactMs","fieldsPerRowApprox","filterMs","headQueryMs","mergeMs","parseMs","responseBytes","responseTextMs","rowsMatched","rowsRead","rowsReturned","serializationMs","shards","sliceMs","snapshotQueryMs","sortMs","supabaseBytes","supabaseCalls","totalMs","workerCpuApproxMs"].sort());
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

test("Apple-synk failar stängt när serverkonfigurationen saknas",async()=>{
  const state=setup(),url="https://worker.test/v1/subscriptions/apple/sync";
  const response=await worker.fetch(new Request(url,{method:"POST",headers:{"content-type":"application/json"},body:"{}"}),env,state.ctx);
  assert.equal(response.status,503);assert.match((await response.json()).error,/inte konfigurerad/);
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
