import { PLACES,ENABLED_PLACES } from './place-registry.js';
import '../../fishing-score.js';

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
const PLACE_BY_ID=new Map(ENABLED_PLACES.map(place=>[place.id,place]));
const PLACE_BY_NAME=new Map(ENABLED_PLACES.map(place=>[place.name,place]));
const PLACE_NAME_COUNTS=new Map();
for(const place of ENABLED_PLACES)PLACE_NAME_COUNTS.set(place.name,(PLACE_NAME_COUNTS.get(place.name)||0)+1);
for(const place of ENABLED_PLACES){if(place.coastal)COAST_PLACES.add(place.name);if(place.surfSpot)SURF_PLACES.add(place.name)}

const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...extra}});
const now=()=>performance.now();
const allowedOrigin=(req,env)=>{
  const allowed=String(env.ALLOWED_ORIGINS||env.ALLOWED_ORIGIN||"https://andybure1979.github.io").split(',').map(value=>value.trim()).filter(Boolean);
  const origin=req?.headers?.get('origin');return origin&&allowed.includes(origin)?origin:allowed[0];
};
const cors=(env,req)=>({"access-control-allow-origin":allowedOrigin(req,env),"vary":"Origin","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization,x-admin-token,x-load-test-token,if-none-match","access-control-expose-headers":"etag,x-vaderkompassen-snapshot-version,x-vaderkompassen-worker-version,x-vaderkompassen-cache,x-vaderkompassen-rows-read,x-vaderkompassen-rows-returned,x-vaderkompassen-response-bytes,x-vaderkompassen-total-ms,x-vaderkompassen-worker-cpu-approx-ms,x-vaderkompassen-supabase-calls","X-Vaderkompassen-Worker-Version":env.APP_VERSION||"14.5.0"});
const supabaseKeyType=env=>String(env.SUPABASE_SERVICE_ROLE_KEY||'').startsWith('sb_secret_')?'secret':'legacy-service-role';
const sbHeaders=env=>{
  const key=String(env.SUPABASE_SERVICE_ROLE_KEY||'').trim();
  const headers={apikey:key,"content-type":"application/json"};
  // Nya sb_secret-nycklar är inte JWT och ska inte skickas som Bearer-token.
  if(!key.startsWith('sb_secret_'))headers.authorization=`Bearer ${key}`;
  return headers;
};

async function sb(env,path,init={},timing=null){
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)throw new Error("Supabase secrets saknas");
  const base=String(env.SUPABASE_URL).trim().replace(/\/+$/,'');
  const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...sbHeaders(env),...(init.headers||{})}});
  const textStarted=now(),text=await r.text();
  if(timing)timing.responseTextMs+=(now()-textStarted);
  if(timing)timing.supabaseBytes+=text.length;
  const parseStarted=now();let body=null;try{body=text?JSON.parse(text):null}catch{body=text}
  if(timing)timing.parseMs+=(now()-parseStarted);
  if(!r.ok){const detail=typeof body==='string'?body:JSON.stringify(body);throw new Error(`Supabase ${r.status} (${supabaseKeyType(env)}): ${detail}`);}
  return body;
}
function authorized(req,env){const h=req.headers.get("x-admin-token")||req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");return Boolean(env.ADMIN_TOKEN&&h===env.ADMIN_TOKEN)}
const adminHealthCooldown=new Map();
async function authenticatedAdmin(req,env){
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"").trim();
  if(!token)throw Object.assign(new Error("Adminsession saknas"),{status:401});
  const base=String(env.SUPABASE_URL||'').trim().replace(/\/+$/,'');
  const authResponse=await fetch(`${base}/auth/v1/user`,{headers:{apikey:String(env.SUPABASE_SERVICE_ROLE_KEY||''),authorization:`Bearer ${token}`}});
  if(!authResponse.ok)throw Object.assign(new Error("Ogiltig eller utgången session"),{status:401});
  const user=await authResponse.json();
  const profiles=await sb(env,`profiles?id=eq.${encodeURIComponent(user.id)}&select=id,role,account_status&limit=1`);
  const profile=profiles?.[0];
  if(profile?.role!=="admin"||profile?.account_status!=="active")throw Object.assign(new Error("Endast Admin"),{status:403});
  return profile;
}
async function resolveForecastAccess(req,env,requestedAccess){
  if(requestedAccess!=="premium")return "free";
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"").trim();
  if(!token)throw Object.assign(new Error("Premiumsession krävs för det utökade platsregistret"),{status:401});
  const base=String(env.SUPABASE_URL||"").trim().replace(/\/+$/,'');
  const authResponse=await fetch(`${base}/auth/v1/user`,{headers:{apikey:String(env.SUPABASE_SERVICE_ROLE_KEY||""),authorization:`Bearer ${token}`}});
  if(!authResponse.ok)throw Object.assign(new Error("Ogiltig eller utgången Premiumsession"),{status:401});
  const entitlement=await sb(env,"rpc/get_user_entitlement",{method:"POST",headers:{authorization:`Bearer ${token}`},body:"{}"});
  const value=Array.isArray(entitlement)?entitlement[0]:entitlement;
  if(value?.is_premium!==true)throw Object.assign(new Error("Premiumåtkomst krävs för det utökade platsregistret"),{status:403});
  return "premium";
}
async function adminHealth(req,env){
  const admin=await authenticatedAdmin(req,env),last=adminHealthCooldown.get(admin.id)||0,current=Date.now();
  if(current-last<10000)throw Object.assign(new Error("Hälsokontrollen kan köras högst var tionde sekund"),{status:429});
  adminHealthCooldown.set(admin.id,current);
  const started=performance.now();
  const latest=await sb(env,'forecast_snapshots?select=id,generated_at,region&order=generated_at.desc&limit=1');
  const responseMs=Math.round((performance.now()-started)*10)/10,row=latest?.[0]||null;
  const generated=row?.generated_at||null,ageMinutes=generated?Math.max(0,Math.round((Date.now()-new Date(generated).getTime())/60000)):null;
  try{await sb(env,'admin_audit_log',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({actor_user_id:admin.id,action:'admin_health_check',entity_type:'worker',reason:'Manuell hälsokontroll från adminvyn',new_value:{ok:Boolean(row),responseMs}})});}catch(error){console.warn('Kunde inte logga admin health:',error.message)}
  return {ok:Boolean(row),checkedAt:new Date().toISOString(),workerVersion:env.APP_VERSION||'14.5.0',environment:env.ENVIRONMENT||'production',buildId:env.BUILD_ID||null,forecast:{status:row?'ok':'warning',responseMs,cache:null,rowsRead:row?1:0,rowsReturned:row?1:0},snapshot:{status:row&&ageMinutes<=90?'ok':row?'warning':'error',generatedAt:generated,ageMinutes,shards:null},supabase:{status:'ok'},auth:{status:'ok'},subscriptions:{status:'ok'}};
}
const chunks=(a,n)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n));
const finite=v=>Number.isFinite(Number(v))?Number(v):null;
const WEATHER_CONCURRENCY=2;
const WEATHER_RETRY_DELAYS_MS=[500,1500];
const WEATHER_RATE_LIMIT_DELAY_MS=61000;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export function snapshotPlaceId(row){
  if(row?.placeId&&PLACE_BY_ID.has(row.placeId))return row.placeId;
  if(row?.place&&PLACE_NAME_COUNTS.get(row.place)===1)return PLACE_BY_NAME.get(row.place)?.id||null;
  return null;
}

function providerError(message,{status=null,retryAfterMs=null}={}){
  const error=new Error(message);error.status=status;error.retryAfterMs=retryAfterMs;
  error.retryable=status===429||status>=500;return error;
}
function retryAfterMs(response){
  const value=response.headers.get('retry-after');if(!value)return null;
  const seconds=Number(value);if(Number.isFinite(seconds))return Math.max(0,Math.min(120000,seconds*1000));
  const date=Date.parse(value);return Number.isFinite(date)?Math.max(0,Math.min(120000,date-Date.now())):null;
}
function weatherRetryDelayMs(error,attempt){
  if(error.status===429)return Math.max(error.retryAfterMs||0,WEATHER_RATE_LIMIT_DELAY_MS);
  return error.retryAfterMs??WEATHER_RETRY_DELAYS_MS[attempt];
}

async function fetchWeatherBatch(batch){
  const q=new URLSearchParams({
    latitude:batch.map(p=>p[3]).join(','),longitude:batch.map(p=>p[4]).join(','),
    daily:'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration,cloud_cover_mean,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,snowfall_sum',
    hourly:'snow_depth,freezing_level_height',timezone:'auto',forecast_days:'7',wind_speed_unit:'ms'
  });
  try{
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?${q}`,{headers:{accept:'application/json'}});
    if(!r.ok){const detail=(await r.text()).slice(0,240).replace(/\s+/g,' ');throw providerError(`Open-Meteo HTTP ${r.status}${detail?`: ${detail}`:''}`,{status:r.status,retryAfterMs:retryAfterMs(r)})}
    const payload=await r.json();
    const list=Array.isArray(payload)?payload:[payload];
    if(list.length!==batch.length)throw providerError(`Open-Meteo returnerade ${list.length}/${batch.length} orter`);
    return list.flatMap((data,i)=>{
      const p=batch[i]; if(!p||!data?.daily?.time)return [];
      return data.daily.time.map((day,d)=>{
        const hourlyTimes=data.hourly?.time||[],dayPrefix=`${day}T`,idxs=[];
        hourlyTimes.forEach((t,idx)=>{if(String(t).startsWith(dayPrefix))idxs.push(idx)});
        const snowDepth=Math.max(0,...idxs.map(idx=>finite(data.hourly?.snow_depth?.[idx])||0));
        const freezingVals=idxs.map(idx=>finite(data.hourly?.freezing_level_height?.[idx])).filter(Number.isFinite);
        const metadata=PLACE_BY_ID.get(p[5])||PLACE_BY_NAME.get(p[0]);
        return {day,place:p[0],placeId:p[5],accessTier:p[6]||metadata?.accessTier||"free",categories:metadata?.categories||[],area:p[1],region:p[2],lat:p[3],lon:p[4],
          temp:finite(data.daily.temperature_2m_max?.[d]),min:finite(data.daily.temperature_2m_min?.[d]),
          rain:finite(data.daily.precipitation_sum?.[d]),risk:finite(data.daily.precipitation_probability_max?.[d]),
          sun:finite(data.daily.sunshine_duration?.[d])!=null?finite(data.daily.sunshine_duration[d])/3600:null,
          cloudCover:finite(data.daily.cloud_cover_mean?.[d]),wind:finite(data.daily.wind_speed_10m_max?.[d]),windGust:finite(data.daily.wind_gusts_10m_max?.[d]),windDirection:finite(data.daily.wind_direction_10m_dominant?.[d]),
          models:1,usedSources:['Open-Meteo'],primarySource:'Open-Meteo',confidence:82,
          waveHeight:null,waveDirection:null,wavePeriod:null,swellHeight:null,swellDirection:null,swellPeriod:null,seaTemp:null,
          snowDepth:snowDepth||null,newSnow:finite(data.daily.snowfall_sum?.[d]),
          freezingLevel:freezingVals.length?freezingVals.reduce((a,b)=>a+b,0)/freezingVals.length:null,
          hasMarine:false,hasSnow:Boolean(snowDepth||finite(data.daily.snowfall_sum?.[d])),stale:false};
      });
    });
  }catch(error){throw error}
}


async function fetchMarineBatch(batch){
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
          seaTemp:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null,waterTemperature:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};
      });
    });
  }catch{return []}
}

async function fetchAdaptive(batch,batchIndex,{allowSplit=true}={}){
  let lastError=null,attempts=0;
  for(let attempt=0;attempt<=WEATHER_RETRY_DELAYS_MS.length;attempt++){
    try{attempts++;return {batchIndex,rows:await fetchWeatherBatch(batch),failures:[],error:null,attempts}}
    catch(error){
      lastError=error;
      if(!error.retryable||attempt===WEATHER_RETRY_DELAYS_MS.length)break;
      await wait(weatherRetryDelayMs(error,attempt));
    }
  }
  // Format- och datafel kan orsakas av en enskild plats. Dela då batchen en gång
  // så att övriga platser fortfarande kan hämtas. Dela aldrig 429/5xx eftersom
  // fler anrop skulle förstärka leverantörens belastning.
  if(allowSplit&&!lastError?.retryable&&batch.length>1){
    const middle=Math.ceil(batch.length/2),parts=[];
    parts.push(await fetchAdaptive(batch.slice(0,middle),`${batchIndex+1}a`,{allowSplit:false}));
    parts.push(await fetchAdaptive(batch.slice(middle),`${batchIndex+1}b`,{allowSplit:false}));
    const rows=parts.flatMap(part=>part.rows),failures=parts.flatMap(part=>part.failures),errors=parts.filter(part=>part.error).map(part=>part.error);
    return {batchIndex,rows,failures,error:errors.length?errors.join(' · '):null,attempts:parts.reduce((sum,part)=>sum+(part.attempts||1),0)};
  }
  const message=lastError?.message||'Okänt Open-Meteo-fel';
  return {batchIndex,rows:[],failures:batch.map(place=>({place:place[0],error:message})),error:message,attempts};
}
async function mapLimit(items,limit,fn){
  const out=new Array(items.length);let cursor=0;
  async function runner(){while(cursor<items.length){const i=cursor++;out[i]=await fn(items[i],i)}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},runner));return out;
}
async function previousSnapshot(env){
  try{
    const query=new URLSearchParams({select:'payload,generated_at',activity:'eq.all','payload->meta->>placesAvailable':'gte.500',order:'generated_at.desc',limit:'1'});
    const rows=await sb(env,`forecast_snapshots?${query}`);
    return rows?.[0]?.payload||null;
  }catch{return null}
}
export function assertSnapshotPublishable({requestedPlaces,freshPlaces,availablePlaces}){
  if(freshPlaces===0)throw new Error(`Snapshot stoppad: inga färska platser av ${requestedPlaces}`);
  if(availablePlaces<requestedPlaces)throw new Error(`Snapshot stoppad: endast ${availablePlaces}/${requestedPlaces} platser tillgängliga efter fallback`);
  return true;
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
    case 'fishing': return globalThis.VK_FISHING.score(r).score;
    case 'cycling': return .30*bell(temp,19,11)+.35*dry+.15*sunny+.20*bell(wind,2.5,5);
    case 'hiking': return .30*bell(temp,17,12)+.35*dry+.15*sunny+.20*bell(wind,3,6);
    case 'ski': return .32*(Number.isFinite(r.snowDepth)?clamp(r.snowDepth/80*100):0)+.25*(Number.isFinite(r.newSnow)?clamp(r.newSnow/15*100):0)+.18*bell(temp,-3,12)+.15*bell(wind,3,7)+.10*(Number.isFinite(r.freezingLevel)?clamp(100-r.freezingLevel/18):50);
    default:return .30*bell(temp,24,13)+.25*dry+.22*sunny+.13*bell(wind,2.5,6)+5.5;
  }
}
const ACTIVITIES=['general','coast','surf','boat','fishing','cycling','hiking','ski'];
const FORECAST_ACTIVITIES=new Set([...ACTIVITIES,'cinema','indoorPool']);
const FORECAST_REGIONS=new Set(PLACES.map(place=>place[2]));
const FORECAST_ROWS_PER_DAY=75;
export const FORECAST_ROW_FIELDS=['day','place','placeId','accessTier','area','region','lat','lon','temp','min','rain','risk','sun','cloudCover','wind','windGust','windDirection','models','usedSources','primarySource','confidence','waveHeight','waveDirection','wavePeriod','swellHeight','swellDirection','swellPeriod','seaTemp','waterTemperature','snowDepth','newSnow','freezingLevel','hasMarine','hasSnow','spotName','thunderRisk'];
export function compactForecastRow(row,score){
  const compact={};
  for(const field of FORECAST_ROW_FIELDS){
    const value=row[field];
    if(value!==null&&value!==undefined)compact[field]=value;
  }
  if(Number.isFinite(score))compact.serverScore=score;
  return compact;
}
const snapshotVersionFor=generatedAt=>`snapshot-${String(generatedAt||'').replace(/[^0-9A-Za-z]/g,'')}`;
const AREA_REGIONS=new Map();
for(const place of PLACES){
  const regions=AREA_REGIONS.get(place[1])||new Set();regions.add(place[2]);AREA_REGIONS.set(place[1],regions);
}
const inflightForecastRequests=new Map();
const uniqueSorted=values=>[...new Set(values.map(value=>String(value).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'sv'));
export function normalizeForecastRequest(url){
  const rawActivity=String(url.searchParams.get('activity')||'general').trim();
  const activity=FORECAST_ACTIVITIES.has(rawActivity)?rawActivity:'general';
  const regions=uniqueSorted((url.searchParams.get('regions')||'').split(',')).filter(region=>FORECAST_REGIONS.has(region));
  const regionSet=regions.length?new Set(regions):null;
  const areas=uniqueSorted((url.searchParams.get('areas')||'').split(',')).filter(area=>{
    const mapped=AREA_REGIONS.get(area);if(!mapped)return false;
    return !regionSet||[...mapped].some(region=>regionSet.has(region));
  });
  const days=url.searchParams.get('days')==='all'?'all':'1',requestedAccess=url.searchParams.get('access')==='premium'?'premium':'free';
  return {activity,regions,areas,days,requestedAccess,access:'free'};
}
export function canonicalForecastUrl(origin,normalized){
  const url=new URL('/v1/forecast',origin),params=new URLSearchParams();
  params.set('activity',normalized.activity);
  params.set('days',normalized.days==='all'?'all':'1');
  params.set('access',normalized.access==='premium'?'premium':'free');
  if(normalized.regions.length)params.set('regions',normalized.regions.join(','));
  if(normalized.areas.length)params.set('areas',normalized.areas.join(','));
  url.search=params.toString();return url;
}
function addServerScores(row){
  const serverScores=Object.fromEntries(ACTIVITIES.map(a=>[a,Math.round(serverScore(row,a))]));
  return {...row,serverScores};
}
function requestedScore(row,activity){
  const prepared=row.serverScores?.[activity];
  return {sortScore:Number.isFinite(prepared)?prepared:serverScore(row,activity),responseScore:Number.isFinite(prepared)?prepared:null};
}
function activityCategory(activity){return activity==='ski'?'skiing':activity}
function rowMatchesActivity(row,activity){
  const categories=row.categories||PLACE_BY_ID.get(row.placeId)?.categories||PLACE_BY_NAME.get(row.place)?.categories||[];
  return categories.includes(activityCategory(activity));
}
function rowMatchesAccess(row,access){const tier=row.accessTier||PLACE_BY_ID.get(row.placeId)?.accessTier||PLACE_BY_NAME.get(row.place)?.accessTier||"free";return tier!=="premium"||access==="premium"}
function allowedPlaceNames(normalized){
  const accessible=ENABLED_PLACES.filter(place=>place.accessTier!=="premium"||normalized.access==="premium"),category=activityCategory(normalized.activity),specialized=accessible.filter(place=>place.categories.includes(category));
  return (specialized.length?specialized:accessible).map(place=>place.name);
}
function buildPrecomputedRankings(snapshot){
  const records=[];
  for(const [forecastDay,rows] of Object.entries(snapshot.dailyResults||{})){
    const byRegion=new Map();
    for(const row of rows||[]){
      if(!row?.region)continue;
      const regional=byRegion.get(row.region)||[];regional.push(row);byRegion.set(row.region,regional);
    }
    for(const [region,regional] of byRegion){
      for(const activity of FORECAST_ACTIVITIES){
        const specialized=regional.filter(row=>rowMatchesActivity(row,activity)),pool=specialized.length?specialized:regional;
        const ranked=pool.map(row=>({row,...requestedScore(row,activity)}))
          .sort((a,b)=>b.sortScore-a.sortScore||(b.row.confidence||0)-(a.row.confidence||0))
          .map(({row,sortScore,responseScore})=>({rankSortScore:sortScore,row:compactForecastRow(row,responseScore)}));
        records.push({snapshot_version:snapshot.snapshotVersion,generated_at:snapshot.generatedAt,forecast_day:forecastDay,activity,region,ranked_rows:ranked});
      }
    }
  }
  return records;
}
const rankingStore={
  async write(env,snapshot){
    const records=buildPrecomputedRankings(snapshot);
    await sb(env,'forecast_ranking_versions',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({snapshot_version:snapshot.snapshotVersion,generated_at:snapshot.generatedAt,active_date:snapshot.activeDate,status:'building'})});
    for(const batch of chunks(records,30)){
      await sb(env,'forecast_rankings',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(batch)});
    }
    await sb(env,`forecast_ranking_versions?snapshot_version=eq.${encodeURIComponent(snapshot.snapshotVersion)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:'ready',completed_at:new Date().toISOString()})});
    await sb(env,`forecast_rankings?snapshot_version=neq.${encodeURIComponent(snapshot.snapshotVersion)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    await sb(env,`forecast_ranking_versions?snapshot_version=neq.${encodeURIComponent(snapshot.snapshotVersion)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    return records.length;
  },
  async read(env,normalized,performanceMetrics){
    const headQ=new URLSearchParams({select:'snapshot_version,generated_at,active_date',status:'eq.ready',order:'generated_at.desc',limit:'1'});
    const headStarted=now(),heads=await sb(env,`forecast_ranking_versions?${headQ}`,{},performanceMetrics);
    performanceMetrics.headQueryMs+=now()-headStarted;performanceMetrics.supabaseCalls++;
    if(!heads?.length)return null;
    const head=heads[0],query=new URLSearchParams({select:'snapshot_version,generated_at,forecast_day,region,ranked_rows',snapshot_version:`eq.${head.snapshot_version}`,activity:`eq.${normalized.activity}`,order:'forecast_day.asc,region.asc'});
    if(normalized.days==='1')query.set('forecast_day',`eq.${head.active_date}`);
    if(normalized.regions.length)query.set('or',`(${normalized.regions.map(region=>`region.eq.${region}`).join(',')})`);
    const queryStarted=now(),records=await sb(env,`forecast_rankings?${query}`,{},performanceMetrics);
    performanceMetrics.snapshotQueryMs+=now()-queryStarted;performanceMetrics.supabaseCalls++;
    if(!records?.length)return null;
    const areaSet=normalized.areas.length?new Set(normalized.areas):null,dailyResults={};
    const placeSet=normalized.activity==='coast'?COAST_PLACES:normalized.activity==='surf'?SURF_PLACES:null;
    for(const record of records){
      const candidates=dailyResults[record.forecast_day]||(dailyResults[record.forecast_day]=[]);
      for(const entry of record.ranked_rows||[]){
        performanceMetrics.rowsRead++;
        if(rowMatchesAccess(entry.row,normalized.access)&&(!areaSet||areaSet.has(entry.row?.area))&&(!placeSet||placeSet.has(entry.row?.place)))candidates.push(entry);
      }
    }
    for(const day of Object.keys(dailyResults)){
      const candidates=dailyResults[day];performanceMetrics.rowsMatched+=candidates.length;
      const sortStarted=now();candidates.sort((a,b)=>b.rankSortScore-a.rankSortScore||(b.row?.confidence||0)-(a.row?.confidence||0));performanceMetrics.sortMs+=now()-sortStarted;
      dailyResults[day]=candidates.slice(0,FORECAST_ROWS_PER_DAY).map(entry=>entry.row);
      performanceMetrics.rowsReturned+=dailyResults[day].length;
      if(!dailyResults[day].length)delete dailyResults[day];
    }
    return {ok:true,version:env.APP_VERSION||'14.5.0',workerVersion:env.APP_VERSION||'14.5.0',snapshotVersion:head.snapshot_version,generatedAt:head.generated_at,
      activeDate:Object.keys(dailyResults).sort()[0]||null,dailyResults,
      meta:{performance:performanceMetrics},activity:normalized.activity,rankingEngine:'cloud-v7-prebuilt',resultLimitPerDay:FORECAST_ROWS_PER_DAY};
  }
};
async function buildSnapshot(env){
  const previous=await previousSnapshot(env),batches=chunks(PLACES,30);
  const parts=await mapLimit(batches,WEATHER_CONCURRENCY,(batch,index)=>fetchAdaptive(batch,index));
  let freshRows=parts.flatMap(x=>x.rows);const failures=parts.flatMap(x=>x.failures),failedParts=parts.filter(part=>part.error);
  const marinePlaces=PLACES.filter(p=>PLACE_BY_ID.get(p[5])?.marine===true);
  const marineParts=await mapLimit(chunks(marinePlaces,30),3,b=>fetchMarineBatch(b));
  const marineMap=new Map(marineParts.flat().map(m=>[`${m.day}|${m.place}`,m]));
  freshRows=freshRows.map(row=>{const m=marineMap.get(`${row.day}|${row.place}`);return m?{...row,...m,hasMarine:Number.isFinite(m.waveHeight)||Number.isFinite(m.seaTemp),spotName:SURF_PROFILES[row.place]?.spotName||null,offshoreDirection:SURF_PROFILES[row.place]?.offshore??null}:row});
  if(!freshRows.length&&!previous?.dailyResults)throw new Error(`Ingen prognos kunde hämtas: ${failures.map(x=>x.error).join(' · ')}`);
  const freshPlaces=new Set(freshRows.map(snapshotPlaceId).filter(Boolean));
  const missingPlaceIds=new Set(PLACES.filter(place=>!freshPlaces.has(place[5])).map(place=>place[5]));
  const fallbackRows=[];
  if(previous?.dailyResults&&missingPlaceIds.size){
    for(const rows of Object.values(previous.dailyResults))for(const row of rows||[]){
      const placeId=snapshotPlaceId(row);
      if(placeId&&missingPlaceIds.has(placeId))fallbackRows.push({...row,placeId,stale:true,fallbackFrom:previous.generatedAt||null});
    }
  }
  const rows=[...freshRows,...fallbackRows].map(addServerScores),dailyResults={};
  for(const row of rows)(dailyResults[row.day]||=[]).push(row);
  const days=Object.keys(dailyResults).sort(),availablePlaces=new Set(rows.map(snapshotPlaceId).filter(Boolean));
  try{assertSnapshotPublishable({requestedPlaces:PLACES.length,freshPlaces:freshPlaces.size,availablePlaces:availablePlaces.size})}
  catch(error){
    error.details={placesRequested:PLACES.length,placesFresh:freshPlaces.size,placesFallback:availablePlaces.size-freshPlaces.size,placesAvailable:availablePlaces.size,
      failedBatches:failedParts.length,failedBatchIndexes:failedParts.map(part=>part.batchIndex+1),failedPlaces:failures.map(x=>x.place),
      providerErrors:failedParts.map(part=>({batch:part.batchIndex+1,error:part.error,attempts:part.attempts||1}))};
    console.error('Snapshotleverantörsfel',JSON.stringify(error.details));throw error;
  }
  const generatedAt=new Date().toISOString();
  return {ok:true,version:env.APP_VERSION||'14.5.0',workerVersion:env.APP_VERSION||'14.5.0',snapshotVersion:snapshotVersionFor(generatedAt),generatedAt,activeDate:days[0]||null,dailyResults,
    sourceStatus:[{name:'Open-Meteo',ok:freshPlaces.size>0,rows:freshRows.length,error:failedParts.map(part=>`Batch ${part.batchIndex+1}: ${part.error}`).join(' · ')}],
    meta:{placesRequested:PLACES.length,placesUpdated:freshPlaces.size,placesFresh:freshPlaces.size,placesFallback:availablePlaces.size-freshPlaces.size,placesAvailable:availablePlaces.size,days:days.length,batches:batches.length,failedBatches:failedParts.length,failedBatchIndexes:failedParts.map(part=>part.batchIndex+1),failedPlaces:failures.map(x=>x.place)}};
}
function regionalSnapshotRows(snapshot){
  const byRegion=new Map();
  for(const [day,rows] of Object.entries(snapshot.dailyResults||{})){
    for(const row of rows||[]){
      if(!row?.region)continue;
      let payload=byRegion.get(row.region);
      if(!payload){
        payload={ok:snapshot.ok!==false,version:snapshot.version,workerVersion:snapshot.workerVersion,snapshotVersion:snapshot.snapshotVersion,generatedAt:snapshot.generatedAt,activeDate:snapshot.activeDate,dailyResults:{},meta:snapshot.meta||{}};
        byRegion.set(row.region,payload);
      }
      (payload.dailyResults[day]||=[]).push(row);
    }
  }
  return [...byRegion.entries()].map(([region,payload])=>({
    activity:'region',regions:[region],areas:[],payload,source_status:snapshot.sourceStatus,generated_at:snapshot.generatedAt
  }));
}
async function saveBuiltSnapshot(env,snapshot){
  // Behåll en komplett snapshot för verifiering, historik och bakåtkompatibilitet.
  // Regionala del-snapshots gör prognosanrop betydligt lättare eftersom bara valda regioner läses.
  const rows=[
    {activity:'all',regions:[],areas:[],payload:snapshot,source_status:snapshot.sourceStatus,generated_at:snapshot.generatedAt},
    ...regionalSnapshotRows(snapshot)
  ];
  await sb(env,'forecast_snapshots',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(rows)});
  snapshot.meta.prebuiltRankings=await rankingStore.write(env,snapshot);
}
function responseMeta(meta,performance){
  const compact={};
  for(const field of ['placesRequested','placesUpdated','placesFresh','placesFallback','placesAvailable']){
    if(meta?.[field]!==null&&meta?.[field]!==undefined)compact[field]=meta[field];
  }
  compact.performance=performance;
  return compact;
}
async function latestSnapshot(env,normalized,performanceMetrics){
  const requested=normalized.activity,regionValues=normalized.regions;
  const areas=normalized.areas.length?new Set(normalized.areas):null;

  // Hämta först endast tidsstämpeln för senaste kompletta körningen. Ingen stor JSON laddas här.
  const headQ=new URLSearchParams({select:'generated_at',activity:'eq.all',order:'generated_at.desc',limit:'1'});
  const headStarted=now();
  const heads=await sb(env,`forecast_snapshots?${headQ}`,{},performanceMetrics);performanceMetrics.supabaseCalls++;
  performanceMetrics.headQueryMs=now()-headStarted;
  if(!heads?.length)return null;
  const generatedAt=heads[0].generated_at;

  // Läs därefter enbart de regionala delarna som användaren valt.
  const shardQ=new URLSearchParams({select:'payload,source_status',activity:'eq.region',generated_at:`eq.${generatedAt}`});
  // Filtrera regionala del-snapshots i PostgREST/Supabase i stället för i Workern.
  // Varje shard innehåller en JSONB-array med exakt en region. `cs` motsvarar JSONB-operatorn @>.
  if(regionValues.length){
    const clauses=regionValues.map(region=>`regions.cs.${JSON.stringify([region])}`);
    shardQ.set('or',`(${clauses.join(',')})`);
  }
  const queryStarted=now();
  let storedRows=await sb(env,`forecast_snapshots?${shardQ}`,{},performanceMetrics);performanceMetrics.supabaseCalls++;
  performanceMetrics.snapshotQueryMs=now()-queryStarted;

  // Bakåtkompatibel reserv innan första 13.9.0-snapshoten har skapats.
  if(!storedRows?.length){
    const fallbackQ=new URLSearchParams({select:'payload,source_status',activity:'eq.all',order:'generated_at.desc',limit:'1'});
    const fallbackStarted=now();
    storedRows=await sb(env,`forecast_snapshots?${fallbackQ}`,{},performanceMetrics);performanceMetrics.supabaseCalls++;
    performanceMetrics.snapshotQueryMs+=now()-fallbackStarted;
  }
  if(!storedRows?.length)return null;

  const coastOnly=requested==='coast',surfOnly=requested==='surf';
  const mergedResults={},dailyResults={};
  let payloadMeta=null,sourceStatus=[];
  const mergeStarted=now();
  for(const stored of storedRows){
    const payload=stored.payload||{};
    payloadMeta ||= payload.meta||{};
    if(!sourceStatus.length)sourceStatus=stored.source_status||payload.sourceStatus||[];
    for(const [day,source] of Object.entries(payload.dailyResults||{})){
      if(!Array.isArray(source)||!source.length)continue;
      performanceMetrics.rowsRead+=source.length;
      (mergedResults[day]||(mergedResults[day]=[])).push(...source);
    }
  }
  performanceMetrics.mergeMs=now()-mergeStarted;
  const filterStarted=now();
  const requestedDays=Object.keys(mergedResults).sort();
  const allowedDays=normalized.days==='1'?new Set(requestedDays.slice(0,1)):null;
  for(const [day,source] of Object.entries(mergedResults)){
    if(allowedDays&&!allowedDays.has(day))continue;
    const filtered=source.filter(r=>{
      if(!rowMatchesAccess(r,normalized.access))return false;
      if(areas&&!areas.has(r.area))return false;
      if(coastOnly&&!COAST_PLACES.has(r.place))return false;
      if(surfOnly&&!SURF_PLACES.has(r.place))return false;
      return true;
    });
    const specialized=filtered.filter(row=>rowMatchesActivity(row,requested)),selected=specialized.length?specialized:filtered;
    if(selected.length){dailyResults[day]=selected;performanceMetrics.rowsMatched+=selected.length;}
  }
  performanceMetrics.filterMs=now()-filterStarted;
  for(const day of Object.keys(dailyResults)){
    const filtered=dailyResults[day];
    // Läs eller beräkna poängen exakt en gång per matchad rad före sorteringen.
    const decorated=filtered.map(row=>({row,...requestedScore(row,requested)}));
    const sortStarted=now();
    decorated.sort((a,b)=>b.sortScore-a.sortScore||(b.row.confidence||0)-(a.row.confidence||0));
    performanceMetrics.sortMs+=now()-sortStarted;
    const sliceStarted=now();
    const selected=decorated.slice(0,FORECAST_ROWS_PER_DAY);
    performanceMetrics.sliceMs+=now()-sliceStarted;
    const compactStarted=now();
    dailyResults[day]=selected.map(({row,responseScore})=>compactForecastRow(row,responseScore));
    performanceMetrics.compactMs+=now()-compactStarted;
    performanceMetrics.rowsReturned+=dailyResults[day].length;
    if(!dailyResults[day].length)delete dailyResults[day];
  }
  performanceMetrics.shards=storedRows.length;
  const firstPayload=storedRows[0].payload||{};
  return {ok:firstPayload.ok!==false,version:env.APP_VERSION||firstPayload.version||'14.5.0',workerVersion:env.APP_VERSION||'14.5.0',
    snapshotVersion:firstPayload.snapshotVersion||snapshotVersionFor(generatedAt),generatedAt,
    activeDate:firstPayload.activeDate||Object.keys(dailyResults).sort()[0]||null,dailyResults,
    sourceStatus,meta:responseMeta(payloadMeta,performanceMetrics),activity:requested,
    rankingEngine:'cloud-v6-performance-2',resultLimitPerDay:FORECAST_ROWS_PER_DAY};
}
function forecastResponse(result,cacheState,coalesced){
  const headers=new Headers(result.headers);
  headers.set('X-Vaderkompassen-Cache',cacheState);
  headers.set('X-Vaderkompassen-Coalesced',String(coalesced));
  headers.set('cache-control','public, max-age=300, stale-while-revalidate=600');
  if(cacheState==='HIT'||cacheState==='STALE'){
    headers.set('X-Vaderkompassen-Supabase-Calls','0');headers.set('X-Vaderkompassen-Worker-CPU-Approx-Ms','0');
  }
  return new Response(result.body,{status:result.status,headers});
}
function cacheStorageResponse(result){
  const headers=new Headers(result.headers);headers.set('cache-control','public, max-age=900');
  return new Response(result.body,{status:result.status,headers});
}
function notModifiedResponse(result,cacheState,coalesced){
  const headers=new Headers(result.headers);
  headers.delete('content-length');headers.delete('content-type');
  headers.set('X-Vaderkompassen-Cache',cacheState);headers.set('X-Vaderkompassen-Coalesced',String(coalesced));
  headers.set('cache-control','public, max-age=300, stale-while-revalidate=600');
  if(cacheState==='HIT'||cacheState==='STALE'){
    headers.set('X-Vaderkompassen-Supabase-Calls','0');headers.set('X-Vaderkompassen-Worker-CPU-Approx-Ms','0');
  }
  return new Response(null,{status:304,headers});
}
function matchesEtag(req,result){return Boolean(result.headers?.etag&&req.headers.get('if-none-match')===result.headers.etag)}
function stableHash(value){let hash=2166136261;for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(36)}
function resultEtag(snapshotVersion,canonicalUrl){return `W/"${stableHash(`${snapshotVersion}|${canonicalUrl}`)}"`}
function payloadForDays(payload,days){
  if(days!=='1'||!payload?.dailyResults)return payload;
  const first=Object.keys(payload.dailyResults).sort()[0];
  return {...payload,activeDate:first||payload.activeDate,dailyResults:first?{[first]:payload.dailyResults[first]}:{}};
}
async function databaseRankedForecast(env,normalized,c){
  if(!ACTIVITIES.includes(normalized.activity))return null;
  const base=String(env.SUPABASE_URL||'').trim().replace(/\/+$/,'');
  if(!base||!env.SUPABASE_SERVICE_ROLE_KEY)return null;
  const response=await fetch(`${base}/rest/v1/rpc/get_ranked_forecast`,{
    method:'POST',headers:{...sbHeaders(env),accept:'application/json'},
    body:JSON.stringify({p_activity:normalized.activity,p_regions:normalized.regions,p_areas:normalized.areas,
      p_places:allowedPlaceNames(normalized),
      p_limit:FORECAST_ROWS_PER_DAY,p_version:env.APP_VERSION||'14.5.0'})
  });
  const rawBody=await response.text();
  if(response.status===404||response.status===400&&/get_ranked_forecast|schema cache/i.test(rawBody))return null;
  if(!response.ok)throw new Error(`Supabase ranking ${response.status}: ${rawBody.slice(0,300)}`);
  if(!rawBody||rawBody==='null')return {body:JSON.stringify({ok:false,error:'Ingen molnprognos sparad ännu'}),status:404,headers:{...JSON_HEADERS,...c}};
  const parsed=payloadForDays(JSON.parse(rawBody),normalized.days),snapshotVersion=parsed.snapshotVersion||snapshotVersionFor(parsed.generatedAt);
  parsed.snapshotVersion=snapshotVersion;parsed.workerVersion=env.APP_VERSION||'14.5.0';parsed.version=env.APP_VERSION||'14.5.0';
  const body=JSON.stringify(parsed);
  return {body,status:200,snapshotVersion,headers:{...JSON_HEADERS,...c,'cache-control':'public, max-age=300, stale-while-revalidate=600','X-Vaderkompassen-Database-Ranked':'true','X-Vaderkompassen-Response-Bytes':String(body.length),'X-Vaderkompassen-Supabase-Calls':'1'}};
}
async function buildForecastResult(env,normalized,c,totalStarted){
  const performanceMetrics={cache:'miss',coalesced:false,headQueryMs:0,snapshotQueryMs:0,responseTextMs:0,parseMs:0,mergeMs:0,filterMs:0,sortMs:0,sliceMs:0,compactMs:0,serializationMs:0,totalMs:0,workerCpuApproxMs:0,supabaseCalls:0,supabaseBytes:0,responseBytes:0,fieldsPerRowApprox:FORECAST_ROW_FIELDS.length+1,shards:0,rowsRead:0,rowsMatched:0,rowsReturned:0};
  let data=null;
  try{data=await rankingStore.read(env,normalized,performanceMetrics)}catch(error){if(!/forecast_ranking|schema cache|404|400/i.test(error.message))throw error}
  if(!data){
    const ranked=await databaseRankedForecast(env,normalized,c);
    if(ranked){ranked.headers={...ranked.headers,'X-Vaderkompassen-Total-Ms':(now()-totalStarted).toFixed(3),'X-Vaderkompassen-Worker-CPU-Approx-Ms':'0'};return ranked}
    data=await latestSnapshot(env,normalized,performanceMetrics);
  }
  const status=data?200:404;
  const payload=data||{ok:false,error:'Ingen molnprognos sparad ännu'};
  const serializationStarted=now();
  let body=JSON.stringify(payload);
  performanceMetrics.serializationMs=now()-serializationStarted;
  performanceMetrics.workerCpuApproxMs=performanceMetrics.parseMs+performanceMetrics.mergeMs+performanceMetrics.filterMs+performanceMetrics.sortMs+performanceMetrics.sliceMs+performanceMetrics.compactMs+performanceMetrics.serializationMs;
  performanceMetrics.totalMs=now()-totalStarted;
  body=body.replace('"serializationMs":0',`"serializationMs":${performanceMetrics.serializationMs.toFixed(3)}`)
    .replace('"totalMs":0',`"totalMs":${performanceMetrics.totalMs.toFixed(3)}`);
  if(status===200){
    for(let attempt=0;attempt<2;attempt++){
      performanceMetrics.responseBytes=body.length;
      body=body.replace(/"responseBytes":\d+/,`"responseBytes":${performanceMetrics.responseBytes}`);
    }
  }
  const snapshotVersion=payload.snapshotVersion||snapshotVersionFor(payload.generatedAt);
  return {body,status,snapshotVersion,headers:{...JSON_HEADERS,...c,'cache-control':status===200?'public, max-age=300, stale-while-revalidate=600':'no-store',
    'X-Vaderkompassen-Rows-Read':String(performanceMetrics.rowsRead),'X-Vaderkompassen-Rows-Returned':String(performanceMetrics.rowsReturned),
    'X-Vaderkompassen-Response-Bytes':String(performanceMetrics.responseBytes),'X-Vaderkompassen-Supabase-Calls':String(performanceMetrics.supabaseCalls),
    'X-Vaderkompassen-Total-Ms':performanceMetrics.totalMs.toFixed(3),'X-Vaderkompassen-Worker-CPU-Approx-Ms':performanceMetrics.workerCpuApproxMs.toFixed(3)}};
}
const forecastCacheKeys=new Set();
async function buildCacheableForecast(env,normalized,c,totalStarted,canonicalUrl){
  const result=await buildForecastResult(env,normalized,c,totalStarted),snapshotVersion=result.snapshotVersion||'unknown';
  result.headers={...result.headers,etag:resultEtag(snapshotVersion,canonicalUrl),'X-Vaderkompassen-Snapshot-Version':snapshotVersion,'X-Vaderkompassen-Worker-Version':env.APP_VERSION||'14.5.0','X-Vaderkompassen-Cached-At':new Date().toISOString()};
  return result;
}
async function invalidateForecastCache(){
  if(!globalThis.caches?.default||!forecastCacheKeys.size)return 0;
  const keys=[...forecastCacheKeys];forecastCacheKeys.clear();
  const deleted=await Promise.all(keys.map(url=>caches.default.delete(new Request(url))));
  return deleted.filter(Boolean).length;
}
function sharedForecastBuild(key,builder){
  let promise=inflightForecastRequests.get(key),coalesced=Boolean(promise);
  if(!promise){
    promise=(async()=>{try{return await builder()}finally{if(inflightForecastRequests.get(key)===promise)inflightForecastRequests.delete(key)}})();
    inflightForecastRequests.set(key,promise);
  }
  return {promise,coalesced};
}
async function forecast(req,env,ctx,url,c){
  const totalStarted=now(),normalized=normalizeForecastRequest(url);
  normalized.access=await resolveForecastAccess(req,env,normalized.requestedAccess);
  if(normalized.access!=="premium")normalized.days="1";
  const canonicalUrl=canonicalForecastUrl(url.origin,normalized);
  const cacheRequest=new Request(canonicalUrl,{method:'GET'}),cache=caches.default;
  const bypass=Boolean(env.LOAD_TEST_TOKEN&&req.headers.get('x-load-test-token')===env.LOAD_TEST_TOKEN);
  const cached=bypass?null:await cache.match(cacheRequest);
  if(cached){
    const cachedAt=new Date(cached.headers.get('X-Vaderkompassen-Cached-At')||0).getTime(),ageMs=Math.max(0,Date.now()-cachedAt);
    const cachedResult={body:cached.body,status:cached.status,headers:Object.fromEntries(cached.headers)};
    cachedResult.headers['x-vaderkompassen-total-ms']=(now()-totalStarted).toFixed(3);
    if(ageMs>300000){
      const refresh=sharedForecastBuild(canonicalUrl.toString(),()=>buildCacheableForecast(env,normalized,c,now(),canonicalUrl));
      if(!refresh.coalesced)ctx.waitUntil(refresh.promise.then(fresh=>cache.put(cacheRequest,cacheStorageResponse(fresh))));
      return matchesEtag(req,cachedResult)?notModifiedResponse(cachedResult,'STALE',refresh.coalesced):forecastResponse(cachedResult,'STALE',refresh.coalesced);
    }
    return matchesEtag(req,cachedResult)?notModifiedResponse(cachedResult,'HIT',false):forecastResponse(cachedResult,'HIT',false);
  }
  const key=canonicalUrl.toString();
  const shared=sharedForecastBuild(key,()=>buildCacheableForecast(env,normalized,c,totalStarted,canonicalUrl)),coalesced=shared.coalesced;
  const result=await shared.promise;
  const cacheState=bypass?'BYPASS':'MISS';
  const response=matchesEtag(req,result)?notModifiedResponse(result,cacheState,coalesced):forecastResponse(result,cacheState,coalesced);
  if(result.status===200&&!coalesced&&!bypass){forecastCacheKeys.add(canonicalUrl.toString());ctx.waitUntil(cache.put(cacheRequest,cacheStorageResponse(result)))}
  return response;
}
async function status(env){
  const [snapshots,runs]=await Promise.all([
    sb(env,'forecast_snapshots?select=id,generated_at,activity,payload&activity=eq.all&order=generated_at.desc&limit=1'),
    sb(env,'worker_runs?select=started_at,finished_at,status,message,details&order=started_at.desc&limit=10')
  ]);
  const latest=snapshots?.[0]||null;
  return {ok:true,service:'Väderkompassen API',version:env.APP_VERSION||'14.5.0',workerVersion:env.APP_VERSION||'14.5.0',time:new Date().toISOString(),
    latestSnapshot:latest?{id:latest.id,generated_at:latest.generated_at,activity:latest.activity,meta:latest.payload?.meta||null}:null,recentRuns:runs||[]};
}
async function saveSnapshot(req,env,c){
  const body=await req.json(); if(!body?.dailyResults||typeof body.dailyResults!=="object")return json({ok:false,error:"dailyResults krävs"},400,c);
  await saveBuiltSnapshot(env,body); return json({ok:true,generatedAt:body.generatedAt||new Date().toISOString()},201,c);
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
    const snapshot=await buildSnapshot(env); await saveBuiltSnapshot(env,snapshot);snapshot.meta.invalidatedCacheEntries=await invalidateForecastCache();
    const cutoff=new Date(Date.now()-14*864e5).toISOString();
    await sb(env,`forecast_snapshots?generated_at=lt.${encodeURIComponent(cutoff)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    await recordRun(env,'success',`Prognosen uppdaterades (${reason})`,{durationMs:Date.now()-started,...snapshot.meta},startedAt);
    return snapshot.meta;
  }catch(e){await recordRun(env,'error',e.message,{durationMs:Date.now()-started,reason,...(e.details||{})},startedAt);throw e}
}

export default {
  async fetch(req,env,ctx){
    const c=cors(env,req); if(req.method==='OPTIONS')return new Response(null,{status:204,headers:c}); const url=new URL(req.url);
    try{
      if(url.pathname==='/'||url.pathname==='/health')return json({ok:true,service:'Väderkompassen API',version:env.APP_VERSION||'14.5.0',workerVersion:env.APP_VERSION||'14.5.0',time:new Date().toISOString()},200,c);
      if((url.pathname==='/v1/status'||url.pathname==='/status')&&req.method==='GET'){
        await authenticatedAdmin(req,env);
        return json(await status(env),200,c);
      }
      if(url.pathname==='/v1/verify'&&req.method==='GET'){
        const state=await status(env);
        return json({ok:Boolean(state.latestSnapshot),worker:true,database:true,forecast:Boolean(state.latestSnapshot),version:state.version,time:state.time,latestSnapshot:state.latestSnapshot,supabase:{configured:Boolean(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY),keyType:supabaseKeyType(env),host:(()=>{try{return new URL(env.SUPABASE_URL).host}catch{return null}})()}},state.latestSnapshot?200:503,c);
      }
      if((url.pathname==='/v1/forecast'||url.pathname==='/forecast')&&req.method==='GET'){
        return await forecast(req,env,ctx,url,c);
      }
      if(url.pathname.startsWith('/v1/subscriptions/')&&req.method==='POST'){
        if(!authorized(req,env))return json({ok:false,error:'Obehörig'},401,c);
        return json({ok:false,error:'Provider verification not configured',provider:url.pathname.includes('/apple/')?'apple':url.pathname.includes('/google/')?'google':'unknown'},501,c);
      }
      if(url.pathname==='/v1/admin/health'&&req.method==='GET')return json(await adminHealth(req,env),200,c);
      if(url.pathname==='/v1/admin/snapshot'&&req.method==='POST')return authorized(req,env)?saveSnapshot(req,env,c):json({ok:false,error:'Obehörig'},401,c);
      if((url.pathname==='/v1/admin/run'||url.pathname==='/admin/update')&&req.method==='POST'){
        if(!authorized(req,env))return json({ok:false,error:'Obehörig'},401,c); const meta=await runUpdate(env,'manual');return json({ok:true,meta},200,c);
      }
      return json({ok:false,error:'Endpoint saknas'},404,c);
    }catch(e){if(!e.status||e.status>=500)console.error(e);return json({ok:false,error:e.message},e.status||500,c)}
  },
  async scheduled(_event,env,ctx){ctx.waitUntil(runUpdate(env,'cron'));}
};
