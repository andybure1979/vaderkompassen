const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...extra}});
const cors=env=>({"access-control-allow-origin":env.ALLOWED_ORIGIN||"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization,x-admin-token"});
const sbHeaders=env=>({apikey:env.SUPABASE_SERVICE_ROLE_KEY,authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,"content-type":"application/json"});
async function sb(env,path,init={}){
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)throw new Error("Supabase secrets saknas");
  const r=await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`,{...init,headers:{...sbHeaders(env),...(init.headers||{})}});
  const text=await r.text(); let body=null; try{body=text?JSON.parse(text):null}catch{body=text}
  if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof body==='string'?body:JSON.stringify(body)}`);
  return body;
}
function authorized(req,env){const h=req.headers.get("x-admin-token")||req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");return Boolean(env.ADMIN_TOKEN&&h===env.ADMIN_TOKEN)}
async function latestSnapshot(env,url){
  const activity=url.searchParams.get("activity")||"";
  const q=new URLSearchParams({select:"payload,generated_at,source_status,activity,regions,areas",order:"generated_at.desc",limit:"1"});
  if(activity)q.set("activity",`eq.${activity}`);
  const rows=await sb(env,`forecast_snapshots?${q}`);
  if(!rows?.length)return null;
  return {...rows[0].payload,generatedAt:rows[0].generated_at,sourceStatus:rows[0].source_status||[],activity:rows[0].activity};
}
async function status(env){
  const [snapshots,runs]=await Promise.all([
    sb(env,"forecast_snapshots?select=id,generated_at,activity&order=generated_at.desc&limit=1"),
    sb(env,"worker_runs?select=started_at,finished_at,status,message,details&order=started_at.desc&limit=10")
  ]);
  return {ok:true,service:"Väderkompassen API",version:env.APP_VERSION||"13.1.1",time:new Date().toISOString(),latestSnapshot:snapshots?.[0]||null,recentRuns:runs||[]};
}
async function saveSnapshot(req,env){
  const body=await req.json();
  if(!body?.dailyResults||typeof body.dailyResults!=="object")return json({ok:false,error:"dailyResults krävs"},400,cors(env));
  const row={activity:body.activity||"all",regions:body.regions||[],areas:body.areas||[],payload:body,source_status:body.sourceStatus||[],generated_at:body.generatedAt||new Date().toISOString()};
  await sb(env,"forecast_snapshots",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(row)});
  return json({ok:true,generatedAt:row.generated_at},201,cors(env));
}
async function recordRun(env,statusValue,message,details={}){
  try{await sb(env,"worker_runs",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({status:statusValue,message,details,started_at:new Date().toISOString(),finished_at:new Date().toISOString()})})}catch(e){console.error(e)}
}
async function scheduled(env){
  const started=Date.now();
  try{
    const cutoff=new Date(Date.now()-14*864e5).toISOString();
    await sb(env,`forecast_snapshots?generated_at=lt.${encodeURIComponent(cutoff)}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
    await recordRun(env,"success","Schemalagd kontroll och städning klar",{durationMs:Date.now()-started});
  }catch(e){await recordRun(env,"error",e.message,{durationMs:Date.now()-started});throw e}
}
export default {
  async fetch(req,env){
    const c=cors(env); if(req.method==="OPTIONS")return new Response(null,{status:204,headers:c});
    const url=new URL(req.url);
    try{
      if(url.pathname==="/"||url.pathname==="/health")return json({ok:true,service:"Väderkompassen API",version:env.APP_VERSION||"13.1.1",time:new Date().toISOString()},200,c);
      if(url.pathname==="/v1/status"&&req.method==="GET")return json(await status(env),200,c);
      if(url.pathname==="/v1/forecast"&&req.method==="GET"){
        const data=await latestSnapshot(env,url); return data?json(data,200,{...c,"cache-control":"public, max-age=60"}):json({ok:false,error:"Ingen molnprognos sparad ännu"},404,c);
      }
      if(url.pathname==="/v1/admin/snapshot"&&req.method==="POST")return authorized(req,env)?saveSnapshot(req,env):json({ok:false,error:"Obehörig"},401,c);
      if(url.pathname==="/v1/admin/run"&&req.method==="POST"){
        if(!authorized(req,env))return json({ok:false,error:"Obehörig"},401,c); await scheduled(env); return json({ok:true},200,c);
      }
      return json({ok:false,error:"Endpoint saknas"},404,c);
    }catch(e){console.error(e);return json({ok:false,error:e.message},500,c)}
  },
  async scheduled(_event,env,ctx){ctx.waitUntil(scheduled(env));}
};
