import { performance } from "node:perf_hooks";

const args=Object.fromEntries(process.argv.slice(2).map(value=>{
  const [key,...rest]=value.replace(/^--/,"").split("=");return [key,rest.join("=")||true];
}));
const base=(args.base||process.env.VK_WORKER_URL||"http://127.0.0.1:8787").replace(/\/+$/,'');
const userCounts=String(args.users||"100,500,1000,5000").split(",").map(Number).filter(Number.isFinite);
const concurrency=Math.max(1,Number(args.concurrency)||50),mode=args.mode||"warm";
const loadTestToken=process.env.VK_LOAD_TEST_TOKEN||"";
const mockMode=Boolean(args.mock);
if(mode==="cold"&&!loadTestToken&&!mockMode)throw new Error("Cold-läge kräver VK_LOAD_TEST_TOKEN som matchar Worker-secret LOAD_TEST_TOKEN.");

const activities=["general","coast","surf","boat","fishing","cycling","hiking","ski","cinema","indoorPool"];
const regions=["Södra Sverige","Mellansverige","Norra Sverige","Jylland","Østlandet"];
let requestFetch=globalThis.fetch,pendingBackground=[];
if(mockMode){
  class MemoryCache{
    constructor(){this.items=new Map()}
    async match(request){return this.items.get(request.url)?.clone()}
    async put(request,response){this.items.set(request.url,response.clone())}
    async delete(request){return this.items.delete(request.url)}
  }
  globalThis.caches={default:new MemoryCache()};
  const {default:worker}=await import("../cloudflare/src/index.js");
  const generatedAt="2026-08-01T00:00:00Z",snapshotVersion="snapshot-20260801T000000Z";
  const days=Array.from({length:7},(_,index)=>`2026-08-${String(index+1).padStart(2,"0")}`);
  const records=regions.flatMap((region,regionIndex)=>days.map(day=>({snapshot_version:snapshotVersion,generated_at:generatedAt,forecast_day:day,region,
    ranked_rows:Array.from({length:80},(_,index)=>({rankSortScore:100-index,row:{day,place:`Plats ${regionIndex}-${index}`,area:`Område ${regionIndex}`,region,lat:60,lon:15,temp:20,min:12,rain:0,risk:0,sun:8,wind:3,confidence:82,serverScore:100-index}}))})));
  globalThis.fetch=async input=>{
    const url=new URL(String(input));
    if(url.pathname.endsWith("/forecast_ranking_versions"))return new Response(JSON.stringify([{snapshot_version:snapshotVersion,generated_at:generatedAt,active_date:"2026-08-01"}]),{status:200});
    if(url.pathname.endsWith("/forecast_rankings")){
      const dayFilter=String(url.searchParams.get("forecast_day")||"").replace(/^eq\./,"");
      return new Response(JSON.stringify(dayFilter?records.filter(record=>record.forecast_day===dayFilter):records),{status:200});
    }
    throw new Error(`Oväntat mockanrop: ${url}`);
  };
  const mockEnv={SUPABASE_URL:"https://supabase.test",SUPABASE_SERVICE_ROLE_KEY:"test-key",APP_VERSION:"14.3.7",ALLOWED_ORIGIN:"*",LOAD_TEST_TOKEN:"mock-token"};
  const mockCtx={waitUntil(promise){pendingBackground.push(promise)}};
  requestFetch=(url,init={})=>worker.fetch(new Request(url,init),mockEnv,mockCtx);
}
function profile(index,total){
  const ratio=index/Math.max(1,total);
  if(ratio<.7)return {activity:"general",regions:[regions[index%regions.length]],days:"1",kind:"Free"};
  if(ratio<.9)return {activity:activities[index%activities.length],regions:[regions[index%regions.length]],days:"1",kind:"Aktivitetsbyte"};
  return {activity:activities[index%activities.length],regions:[regions[index%regions.length],regions[(index+1)%regions.length]],days:"all",kind:"Premium"};
}
function requestUrl(item){
  const params=new URLSearchParams({activity:item.activity,regions:item.regions.join(","),days:item.days});
  return `${base}/v1/forecast?${params}`;
}
async function runPool(items,worker){
  let cursor=0;const output=new Array(items.length);
  async function runner(){while(cursor<items.length){const index=cursor++;output[index]=await worker(items[index],index)}}
  await Promise.all(Array.from({length:Math.min(concurrency,items.length)},runner));return output;
}
const percentile=(values,p)=>values.length?values[Math.min(values.length-1,Math.floor(values.length*p))]:0;
async function execute(users){
  const profiles=Array.from({length:users},(_,index)=>profile(index,users));
  if(mode==="warm"){
    for(const url of new Set(profiles.map(requestUrl))){await requestFetch(url,{headers:{accept:"application/json"}});await Promise.all(pendingBackground.splice(0))}
  }
  const started=performance.now();
  const results=await runPool(profiles,async item=>{
    const before=performance.now(),response=await requestFetch(requestUrl(item),{headers:{accept:"application/json",...(mode==="cold"?{"x-load-test-token":loadTestToken||"mock-token"}:{})}});
    const bytes=(await response.arrayBuffer()).byteLength;
    return {status:response.status,latency:performance.now()-before,bytes,cache:response.headers.get("x-vaderkompassen-cache")||"UNKNOWN",
      workerCpuApproxMs:Number(response.headers.get("x-vaderkompassen-worker-cpu-approx-ms"))||0,
      totalMs:Number(response.headers.get("x-vaderkompassen-total-ms"))||0,
      supabaseCalls:Number(response.headers.get("x-vaderkompassen-supabase-calls"))||0};
  });
  await Promise.all(pendingBackground.splice(0));
  const latencies=results.map(x=>x.latency).sort((a,b)=>a-b),bytes=results.reduce((sum,x)=>sum+x.bytes,0);
  const cacheCounts=Object.groupBy?Object.groupBy(results,x=>x.cache):results.reduce((groups,row)=>((groups[row.cache]||=[]).push(row),groups),{});
  return {users,mode,concurrency,durationMs:Math.round(performance.now()-started),success:results.filter(x=>x.status===200||x.status===304).length,
    latencyMs:{p50:Math.round(percentile(latencies,.5)),p95:Math.round(percentile(latencies,.95)),p99:Math.round(percentile(latencies,.99))},
    payload:{totalBytes:bytes,averageBytes:Math.round(bytes/results.length)},cache:Object.fromEntries(Object.entries(cacheCounts).map(([key,value])=>[key,value.length])),
    workerCpuApproxMs:Math.round(results.reduce((sum,x)=>sum+x.workerCpuApproxMs,0)*100)/100,
    workerTotalMs:Math.round(results.reduce((sum,x)=>sum+x.totalMs,0)*100)/100,
    supabaseCalls:results.reduce((sum,x)=>sum+x.supabaseCalls,0)};
}

const reports=[];
for(const users of userCounts)reports.push(await execute(users));
console.log(JSON.stringify({target:base,note:"Worker CPU är en synkron kodapproximation; faktisk CPU läses i Cloudflare Observability.",results:reports},null,2));
