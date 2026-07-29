import { PLACES } from './places.js';

const COAST_PLACES = new Set([
  'Malmö','Ystad','Simrishamn','Helsingborg','Båstad','Halmstad','Varberg','Falkenberg','Göteborg','Strömstad','Uddevalla','Smögen',
  'Kalmar','Västervik','Karlskrona','Ronneby','Borgholm','Färjestaden','Visby','Fårösund','Nyköping','Stockholm','Norrtälje','Gävle',
  'Hudiksvall','Söderhamn','Sundsvall','Härnösand','Örnsköldsvik','Umeå','Skellefteå','Luleå','Piteå','Haparanda',
  'Skagen','Løkken','Klitmøller','Esbjerg','Hvide Sande','København','Rønne/Bornholm','Fredrikstad','Kristiansand','Arendal',
  'Stavanger','Haugesund','Bergen','Ålesund','Molde','Kristiansund','Trondheim','Bodø','Narvik','Svolvær','Tromsø','Hammerfest'
]);
const SURF_PROFILES = {
  'Varberg':{spotName:'Apelviken',offshore:90},'Falkenberg':{spotName:'Olofsbo',offshore:90},'Halmstad':{spotName:'Ringenäs',offshore:90},
  'Båstad':{spotName:'Mellbystrand',offshore:90},'Höganäs':{spotName:'Viken',offshore:120},'Ystad':{spotName:'Kåseberga',offshore:330},
  'Skanör':{spotName:'Höllviken',offshore:90},'Klitmøller':{spotName:'Klitmøller',offshore:90},'Løkken':{spotName:'Løkken',offshore:90},
  'Hvide Sande':{spotName:'Hvide Sande',offshore:90},'Blåvand':{spotName:'Blåvand',offshore:90},'Skagen':{spotName:'Skagen',offshore:180},
  'Esbjerg':{spotName:'Fanø',offshore:90},'Stavanger':{spotName:'Jæren',offshore:90},'Haugesund':{spotName:'Karmøy',offshore:90},
  'Bergen':{spotName:'Øygarden',offshore:90},'Kristiansand':{spotName:'Lista',offshore:30},'Mandal':{spotName:'Lista',offshore:30},
  'Svolvær':{spotName:'Unstad',offshore:120},'Bodø':{spotName:'Mørkved',offshore:120}
};
const SURF_PLACES = new Set(Object.keys(SURF_PROFILES));

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

async function fetchWeatherBatch(batch,attempt=0){
  const q=new URLSearchParams({
    latitude:batch.map(p=>p[3]).join(','),longitude:batch.map(p=>p[4]).join(','),
    daily:'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration,wind_speed_10m_max,wind_direction_10m_dominant,snowfall_sum',
    hourly:'snow_depth,freezing_level_height',timezone:'auto',forecast_days:'7',wind_speed_unit:'ms'
  });
  try{
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?${q}`,{headers:{accept:'application/json'}});
    if(!r.ok)throw new Error(`Open-Meteo HTTP ${r.status}`);
    const payload=await r.json();
    const list=Array.isArray(payload)?payload:[payload];
    if(list.length!==batch.length)throw new Error(`Open-Meteo returnerade ${list.length}/${batch.length} orter`);
    return list.flatMap((data,i)=>{
      const p=batch[i]; if(!p||!data?.daily?.time)return [];
      return data.daily.time.map((day,d)=>{
        const hourlyTimes=data.hourly?.time||[],dayPrefix=`${day}T`,idxs=[];
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
          hasMarine:false,hasSnow:Boolean(snowDepth||finite(data.daily.snowfall_sum?.[d])),stale:false};
      });
    });
  }catch(error){
    if(attempt<2){await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));return fetchWeatherBatch(batch,attempt+1)}
    throw error;
  }
}


async function fetchMarineBatch(batch,attempt=0){
  const q=new URLSearchParams({
    latitude:batch.map(p=>p[3]).join(','),longitude:batch.map(p=>p[4]).join(','),
    daily:'wave_height_max,wave_direction_dominant,wave_period_max,swell_wave_height_max,swell_wave_direction_dominant,swell_wave_period_max',
    hourly:'sea_surface_temperature',timezone:'auto',forecast_days:'7',cell_selection:'sea'
  });
  try{
    const r=await fetch(`https://marine-api.open-meteo.com/v1/marine?${q}`,{headers:{accept:'application/json'}});
    if(!r.ok)throw new Error(`Marine API HTTP ${r.status}`);
    const payload=await r.json(),list=Array.isArray(payload)?payload:[payload];
    if(list.length!==batch.length)throw new Error(`Marine API returnerade ${list.length}/${batch.length} orter`);
    return list.flatMap((data,i)=>{
      const p=batch[i]; if(!p||!data?.daily?.time)return [];
      return data.daily.time.map((day,d)=>{
        const vals=(data.hourly?.time||[]).map((t,idx)=>String(t).startsWith(`${day}T`)?finite(data.hourly?.sea_surface_temperature?.[idx]):null).filter(Number.isFinite);
        return {day,place:p[0],waveHeight:finite(data.daily.wave_height_max?.[d]),waveDirection:finite(data.daily.wave_direction_dominant?.[d]),
          wavePeriod:finite(data.daily.wave_period_max?.[d]),swellHeight:finite(data.daily.swell_wave_height_max?.[d]),
          swellDirection:finite(data.daily.swell_wave_direction_dominant?.[d]),swellPeriod:finite(data.daily.swell_wave_period_max?.[d]),
          seaTemp:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
      });
    });
  }catch(error){
    if(attempt<2){await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));return fetchMarineBatch(batch,attempt+1)}
    return [];
  }
}

async function fetchAdaptive(batch,depth=0){
  try{return {rows:await fetchWeatherBatch(batch),failures:[]}}
  catch(error){
    if(batch.length===1)return {rows:[],failures:[{place:batch[0][0],error:error.message}]};
    const mid=Math.ceil(batch.length/2);
    await new Promise(resolve=>setTimeout(resolve,250*(depth+1)));
    const [a,b]=await Promise.all([fetchAdaptive(batch.slice(0,mid),depth+1),fetchAdaptive(batch.slice(mid),depth+1)]);
    return {rows:[...a.rows,...b.rows],failures:[...a.failures,...b.failures]};
  }
}
async function mapLimit(items,limit,fn){
  const out=new Array(items.length);let cursor=0;
  async function runner(){while(cursor<items.length){const i=cursor++;out[i]=await fn(items[i],i)}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},runner));return out;
}
async function previousSnapshot(env){
  try{
    const rows=await sb(env,'forecast_snapshots?select=payload,generated_at&order=generated_at.desc&limit=1');
    return rows?.[0]?.payload||null;
  }catch{return null}
}
const clamp=n=>Math.max(0,Math.min(100,n));
const bell=(value,target,width)=>clamp(100-Math.abs(value-target)*(100/width));
const angleDiff=(a,b)=>Math.abs(((a-b+540)%360)-180);
function offshoreScore(r){const p=SURF_PROFILES[r.place];if(!p||!Number.isFinite(r.windDirection))return 0;const alignment=clamp(100-angleDiff(r.windDirection,p.offshore)/90*100);const strength=bell(r.wind??0,4.5,7);return alignment*(.65+.35*strength/100);}
function serverScore(r,activity='general'){
  const temp=r.temp??0,rain=r.rain??0,risk=r.risk??0,sun=r.sun??0,wind=r.wind??0;
  const dry=clamp(100-rain*18-risk*.45),sunny=clamp(sun/12*100);
  switch(activity){
    case 'general': return .34*bell(temp,25,15)+.30*dry+.24*sunny+.12*bell(wind,2.5,7);
    case 'coast': return .20*bell(temp,22,12)+.20*dry+.18*sunny+.14*bell(wind,5,6)+.18*(Number.isFinite(r.seaTemp)?bell(r.seaTemp,20,10):45)+.10*(Number.isFinite(r.waveHeight)?bell(r.waveHeight,.6,1.5):45);
    case 'surf': {const wave=Number.isFinite(r.waveHeight)?clamp((r.waveHeight-.3)/2.7*100):0;const period=Number.isFinite(r.wavePeriod)?clamp((r.wavePeriod-4)/10*100):0;const swell=Number.isFinite(r.swellHeight)?clamp((r.swellHeight-.2)/2.8*100):0;return .38*wave+.27*period+.25*offshoreScore(r)+.10*swell;}
    case 'boat': return .16*bell(temp,19,13)+.24*dry+.10*sunny+.30*bell(wind,4,5)+.20*(Number.isFinite(r.waveHeight)?clamp(100-r.waveHeight*45):0);
    case 'fishing': return .18*bell(temp,16,14)+.25*dry+.10*sunny+.27*bell(wind,3.5,5)+.20*(Number.isFinite(r.waveHeight)?bell(r.waveHeight,.5,1.5):50);
    case 'cycling': return .30*bell(temp,19,11)+.35*dry+.15*sunny+.20*bell(wind,2.5,5);
    case 'hiking': return .30*bell(temp,17,12)+.35*dry+.15*sunny+.20*bell(wind,3,6);
    case 'ski': return .32*(Number.isFinite(r.snowDepth)?clamp(r.snowDepth/80*100):0)+.25*(Number.isFinite(r.newSnow)?clamp(r.newSnow/15*100):0)+.18*bell(temp,-3,12)+.15*bell(wind,3,7)+.10*(Number.isFinite(r.freezingLevel)?clamp(100-r.freezingLevel/18):50);
    default:return .30*bell(temp,24,13)+.25*dry+.22*sunny+.13*bell(wind,2.5,6)+5.5;
  }
}
const ACTIVITIES=['general','coast','surf','boat','fishing','cycling','hiking','ski'];
function addServerScores(row){
  const serverScores=Object.fromEntries(ACTIVITIES.map(a=>[a,Math.round(serverScore(row,a))]));
  return {...row,serverScores};
}
async function buildSnapshot(env){
  const previous=await previousSnapshot(env),batches=chunks(PLACES,18);
  const parts=await mapLimit(batches,5,b=>fetchAdaptive(b));
  let freshRows=parts.flatMap(x=>x.rows);const failures=parts.flatMap(x=>x.failures);
  const marinePlaces=PLACES.filter(p=>COAST_PLACES.has(p[0])||SURF_PLACES.has(p[0]));
  const marineParts=await mapLimit(chunks(marinePlaces,18),3,b=>fetchMarineBatch(b));
  const marineMap=new Map(marineParts.flat().map(m=>[`${m.day}|${m.place}`,m]));
  freshRows=freshRows.map(row=>{const m=marineMap.get(`${row.day}|${row.place}`);return m?{...row,...m,hasMarine:Number.isFinite(m.waveHeight)||Number.isFinite(m.seaTemp),spotName:SURF_PROFILES[row.place]?.spotName||null,offshoreDirection:SURF_PROFILES[row.place]?.offshore??null}:row});
  if(!freshRows.length&&!previous?.dailyResults)throw new Error(`Ingen prognos kunde hämtas: ${failures.map(x=>x.error).join(' · ')}`);
  const freshPlaces=new Set(freshRows.map(r=>r.place)),missing=PLACES.filter(p=>!freshPlaces.has(p[0])).map(p=>p[0]);
  const fallbackRows=[];
  if(previous?.dailyResults&&missing.length){
    const missingSet=new Set(missing);
    for(const rows of Object.values(previous.dailyResults))for(const row of rows||[])if(missingSet.has(row.place))fallbackRows.push({...row,stale:true,fallbackFrom:previous.generatedAt||null});
  }
  const rows=[...freshRows,...fallbackRows].map(addServerScores),dailyResults={};
  for(const row of rows)(dailyResults[row.day]||=[]).push(row);
  const days=Object.keys(dailyResults).sort(),availablePlaces=new Set(rows.map(r=>r.place));
  return {ok:true,version:'13.8.0',generatedAt:new Date().toISOString(),activeDate:days[0]||null,dailyResults,
    sourceStatus:[{name:'Open-Meteo',ok:freshPlaces.size>0,rows:freshRows.length,error:failures.map(x=>`${x.place}: ${x.error}`).join(' · ')}],
    meta:{placesRequested:PLACES.length,placesUpdated:freshPlaces.size,placesFresh:freshPlaces.size,placesFallback:availablePlaces.size-freshPlaces.size,placesAvailable:availablePlaces.size,days:days.length,batches:batches.length,failedBatches:failures.length,failedPlaces:failures.map(x=>x.place)}};
}
async function saveBuiltSnapshot(env,snapshot){
  const row={activity:'all',regions:[],areas:[],payload:snapshot,source_status:snapshot.sourceStatus,generated_at:snapshot.generatedAt};
  await sb(env,'forecast_snapshots',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(row)});
}
const FORECAST_ROWS_PER_DAY=75;
async function latestSnapshot(env,url){
  const requested=url.searchParams.get('activity')||'general';
  const q=new URLSearchParams({select:'payload,generated_at,source_status',order:'generated_at.desc',limit:'1'});
  q.set('activity','in.(all)');
  const rows=await sb(env,`forecast_snapshots?${q}`); if(!rows?.length)return null;
  const stored=rows[0],payload=stored.payload||{};
  const regionValues=(url.searchParams.get('regions')||'').split(',').filter(Boolean);
  const areaValues=(url.searchParams.get('areas')||'').split(',').filter(Boolean);
  const regions=regionValues.length?new Set(regionValues):null;
  const areas=areaValues.length?new Set(areaValues):null;
  const coastOnly=requested==='coast',surfOnly=requested==='surf';
  const dailyResults={};
  for(const day in (payload.dailyResults||{})){
    const source=payload.dailyResults[day];
    if(!Array.isArray(source)||!source.length)continue;
    const filtered=[];
    for(let i=0;i<source.length;i++){
      const r=source[i];
      if(regions&&!regions.has(r.region))continue;
      if(areas&&!areas.has(r.area))continue;
      if(coastOnly&&!COAST_PLACES.has(r.place))continue;
      if(surfOnly&&!SURF_PLACES.has(r.place))continue;
      filtered.push(r);
    }
    if(!filtered.length)continue;
    filtered.sort((a,b)=>(b.serverScores?.[requested]??serverScore(b,requested))-(a.serverScores?.[requested]??serverScore(a,requested))||(b.confidence||0)-(a.confidence||0));
    dailyResults[day]=filtered.slice(0,FORECAST_ROWS_PER_DAY);
  }
  return {ok:payload.ok!==false,version:payload.version||'13.8.0',generatedAt:stored.generated_at||payload.generatedAt,
    activeDate:payload.activeDate||Object.keys(dailyResults).sort()[0]||null,dailyResults,
    sourceStatus:stored.source_status||payload.sourceStatus||[],meta:payload.meta||{},activity:requested,
    rankingEngine:'cloud-v2',resultLimitPerDay:FORECAST_ROWS_PER_DAY};
}
async function status(env){
  const [snapshots,runs]=await Promise.all([
    sb(env,'forecast_snapshots?select=id,generated_at,activity,payload&order=generated_at.desc&limit=1'),
    sb(env,'worker_runs?select=started_at,finished_at,status,message,details&order=started_at.desc&limit=10')
  ]);
  const latest=snapshots?.[0]||null;
  return {ok:true,service:'Väderkompassen API',version:env.APP_VERSION||'13.8.0',time:new Date().toISOString(),
    latestSnapshot:latest?{id:latest.id,generated_at:latest.generated_at,activity:latest.activity,meta:latest.payload?.meta||null}:null,recentRuns:runs||[]};
}
async function saveSnapshot(req,env){
  const body=await req.json(); if(!body?.dailyResults||typeof body.dailyResults!=="object")return json({ok:false,error:"dailyResults krävs"},400,cors(env));
  await saveBuiltSnapshot(env,body); return json({ok:true,generatedAt:body.generatedAt||new Date().toISOString()},201,cors(env));
}
async function recordRun(env,statusValue,message,details={},startedAt=new Date().toISOString()){
  try{
    await sb(env,'worker_runs',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:statusValue,message,details,started_at:startedAt,finished_at:new Date().toISOString()})});
  }catch(e){
    console.error('Kunde inte skriva worker_runs:',e?.message||String(e));
  }
}
async function runUpdate(env,reason='scheduled'){
  const startedAt=new Date().toISOString(),started=Date.now();
  try{
    const snapshot=await buildSnapshot(env); await saveBuiltSnapshot(env,snapshot);
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
      if(url.pathname==='/'||url.pathname==='/health')return json({ok:true,service:'Väderkompassen API',version:env.APP_VERSION||'13.8.0',time:new Date().toISOString()},200,c);
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
