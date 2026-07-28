import { PLACES } from './places.js';

const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...extra}});
const cors=env=>({"access-control-allow-origin":env.ALLOWED_ORIGIN||"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization,x-admin-token"});
const supabaseKeyType=env=>String(env.SUPABASE_SERVICE_ROLE_KEY||'').startsWith('sb_secret_')?'secret':'legacy-service-role';
const sbHeaders=env=>{
  const key=String(env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
  const headers={apikey:key,"content-type":"application/json"};
  // Nya sb_secret-nycklar är inte JWT och ska inte skickas som Bearer-token.
  if(!key.startsWith('sb_secret_'))headers.authorization=`Bearer ${key}`;
  return headers;
};

async function sb(env,path,init={}){
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)throw new Error("Supabase secrets saknas");
  const base=String(env.SUPABASE_URL).trim().replace(/\/+$/,'');
  const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...sbHeaders(env),...(init.headers||{})}});
  const text=await r.text();let body=null;try{body=text?JSON.parse(text):null}catch{body=text}
  if(!r.ok){const detail=typeof body==='string'?body:JSON.stringify(body);throw new Error(`Supabase ${r.status} (${supabaseKeyType(env)}): ${detail}`);}
  return body;
}
function authorized(req,env){const h=req.headers.get("x-admin-token")||req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");return Boolean(env.ADMIN_TOKEN&&h===env.ADMIN_TOKEN)}
const chunks=(a,n)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n));
const finite=v=>Number.isFinite(Number(v))?Number(v):null;

async function fetchWeatherBatch(batch){
  const q=new URLSearchParams({
    latitude:batch.map(p=>p[3]).join(','),longitude:batch.map(p=>p[4]).join(','),
    daily:'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration,wind_speed_10m_max,wind_direction_10m_dominant,snowfall_sum',
    hourly:'snow_depth,freezing_level_height',timezone:'auto',forecast_days:'7',wind_speed_unit:'ms'
  });
  const r=await fetch(`https://api.open-meteo.com/v1/forecast?${q}`,{headers:{accept:'application/json'}});
  if(!r.ok)throw new Error(`Open-Meteo HTTP ${r.status}`);
  const payload=await r.json();
  const list=Array.isArray(payload)?payload:[payload];
  return list.flatMap((data,i)=>{
    const p=batch[i]; if(!p||!data?.daily?.time)return [];
    return data.daily.time.map((day,d)=>{
      const hourlyTimes=data.hourly?.time||[];
      const dayPrefix=`${day}T`; const idxs=[];
      hourlyTimes.forEach((t,idx)=>{if(String(t).startsWith(dayPrefix))idxs.push(idx)});
      const snowDepth=Math.max(0,...idxs.map(idx=>finite(data.hourly?.snow_depth?.[idx])||0));
      const freezingVals=idxs.map(idx=>finite(data.hourly?.freezing_level_height?.[idx])).filter(Number.isFinite);
      return {day,place:p[0],area:p[1],region:p[2],lat:p[3],lon:p[4],
        temp:finite(data.daily.temperature_2m_max?.[d]),min:finite(data.daily.temperature_2m_min?.[d]),
        rain:finite(data.daily.precipitation_sum?.[d]),risk:finite(data.daily.precipitation_probability_max?.[d]),
        sun:finite(data.daily.sunshine_duration?.[d])!=null?finite(data.daily.sunshine_duration[d])/3600:null,
        wind:finite(data.daily.wind_speed_10m_max?.[d]),windDirection:finite(data.daily.wind_direction_10m_dominant?.[d]),
        models:1,usedSources:['Open-Meteo'],primarySource:'Open-Meteo',confidence:82,
        waveHeight:null,waveDirection:null,wavePeriod:null,swellHeight:null,swellDirection:null,swellPeriod:null,seaTemp:null,
        snowDepth:snowDepth||null,newSnow:finite(data.daily.snowfall_sum?.[d]),
        freezingLevel:freezingVals.length?freezingVals.reduce((a,b)=>a+b,0)/freezingVals.length:null,
        hasMarine:false,hasSnow:Boolean(snowDepth||finite(data.daily.snowfall_sum?.[d]))};
    });
  });
}

async function buildSnapshot(){
  const batches=chunks(PLACES,35); const settled=await Promise.allSettled(batches.map(fetchWeatherBatch));
  const rows=settled.filter(x=>x.status==='fulfilled').flatMap(x=>x.value);
  const failures=settled.filter(x=>x.status==='rejected').map(x=>x.reason?.message||'Okänt fel');
  if(!rows.length)throw new Error(`Ingen prognos kunde hämtas: ${failures.join(' · ')}`);
  const dailyResults={}; for(const row of rows)(dailyResults[row.day]||=[]).push(row);
  const days=Object.keys(dailyResults).sort();
  return {ok:true,version:'13.3.2',generatedAt:new Date().toISOString(),activeDate:days[0]||null,dailyResults,
    sourceStatus:[{name:'Open-Meteo',ok:failures.length<batches.length,rows:rows.length,error:failures.join(' · ')}],
    meta:{placesRequested:PLACES.length,placesUpdated:new Set(rows.map(r=>r.place)).size,days:days.length,batches:batches.length,failedBatches:failures.length}};
}
async function saveBuiltSnapshot(env,snapshot){
  const row={activity:'all',regions:[],areas:[],payload:snapshot,source_status:snapshot.sourceStatus,generated_at:snapshot.generatedAt};
  await sb(env,'forecast_snapshots',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(row)});
}
async function latestSnapshot(env,url){
  const requested=url.searchParams.get('activity')||'all';
  const q=new URLSearchParams({select:'payload,generated_at,source_status,activity,regions,areas',order:'generated_at.desc',limit:'1'});
  q.set('activity',`in.(${requested},all)`);
  const rows=await sb(env,`forecast_snapshots?${q}`); if(!rows?.length)return null;
  return {...rows[0].payload,generatedAt:rows[0].generated_at,sourceStatus:rows[0].source_status||[],activity:rows[0].activity};
}
async function status(env){
  const [snapshots,runs]=await Promise.all([
    sb(env,'forecast_snapshots?select=id,generated_at,activity,payload&order=generated_at.desc&limit=1'),
    sb(env,'worker_runs?select=started_at,finished_at,status,message,details&order=started_at.desc&limit=10')
  ]);
  const latest=snapshots?.[0]||null;
  return {ok:true,service:'Väderkompassen API',version:env.APP_VERSION||'13.3.2',time:new Date().toISOString(),
    latestSnapshot:latest?{id:latest.id,generated_at:latest.generated_at,activity:latest.activity,meta:latest.payload?.meta||null}:null,recentRuns:runs||[]};
}
async function saveSnapshot(req,env){
  const body=await req.json(); if(!body?.dailyResults||typeof body.dailyResults!=="object")return json({ok:false,error:"dailyResults krävs"},400,cors(env));
  await saveBuiltSnapshot(env,body); return json({ok:true,generatedAt:body.generatedAt||new Date().toISOString()},201,cors(env));
}
async function recordRun(env,statusValue,message,details={},startedAt=new Date().toISOString()){
  try{await sb(env,'worker_runs',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:statusValue,message,details,started_at:startedAt,finished_at:new Date().toISOString()})})}catch(e){console.error(e)}
}
async function runUpdate(env,reason='scheduled'){
  const startedAt=new Date().toISOString(),started=Date.now();
  try{
    const snapshot=await buildSnapshot(); await saveBuiltSnapshot(env,snapshot);
    const cutoff=new Date(Date.now()-14*864e5).toISOString();
    await sb(env,`forecast_snapshots?generated_at=lt.${encodeURIComponent(cutoff)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    await recordRun(env,'success',`Prognosen uppdaterades (${reason})`,{durationMs:Date.now()-started,...snapshot.meta},startedAt);
    return snapshot.meta;
  }catch(e){await recordRun(env,'error',e.message,{durationMs:Date.now()-started,reason},startedAt);throw e}
}

export default {
  async fetch(req,env){
    const c=cors(env); if(req.method==='OPTIONS')return new Response(null,{status:204,headers:c}); const url=new URL(req.url);
    try{
      if(url.pathname==='/'||url.pathname==='/health')return json({ok:true,service:'Väderkompassen API',version:env.APP_VERSION||'13.3.2',time:new Date().toISOString()},200,c);
      if((url.pathname==='/v1/status'||url.pathname==='/status')&&req.method==='GET')return json(await status(env),200,c);
      if(url.pathname==='/v1/verify'&&req.method==='GET'){
        const state=await status(env);
        return json({ok:Boolean(state.latestSnapshot),worker:true,database:true,forecast:Boolean(state.latestSnapshot),version:state.version,time:state.time,latestSnapshot:state.latestSnapshot,supabase:{configured:Boolean(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY),keyType:supabaseKeyType(env),host:(()=>{try{return new URL(env.SUPABASE_URL).host}catch{return null}})()}},state.latestSnapshot?200:503,c);
      }
      if((url.pathname==='/v1/forecast'||url.pathname==='/forecast')&&req.method==='GET'){
        const data=await latestSnapshot(env,url);return data?json(data,200,{...c,'cache-control':'public, max-age=300'}):json({ok:false,error:'Ingen molnprognos sparad ännu'},404,c);
      }
      if(url.pathname==='/v1/admin/snapshot'&&req.method==='POST')return authorized(req,env)?saveSnapshot(req,env):json({ok:false,error:'Obehörig'},401,c);
      if((url.pathname==='/v1/admin/run'||url.pathname==='/admin/update')&&req.method==='POST'){
        if(!authorized(req,env))return json({ok:false,error:'Obehörig'},401,c); const meta=await runUpdate(env,'manual');return json({ok:true,meta},200,c);
      }
      return json({ok:false,error:'Endpoint saknas'},404,c);
    }catch(e){console.error(e);return json({ok:false,error:e.message},500,c)}
  },
  async scheduled(_event,env,ctx){ctx.waitUntil(runUpdate(env,'cron'));}
};
