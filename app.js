
const PLACES = [
 ["Strömstad","Sverige",58.939,11.171],["Göteborg","Sverige",57.7089,11.9746],
 ["Varberg","Sverige",57.1056,12.2508],["Halmstad","Sverige",56.6745,12.8578],
 ["Båstad","Sverige",56.4269,12.8534],["Helsingborg","Sverige",56.0465,12.6945],
 ["Malmö","Sverige",55.605,13.0038],["Ystad","Sverige",55.4295,13.8204],
 ["Simrishamn","Sverige",55.5565,14.3504],["Kristianstad","Sverige",56.0294,14.1567],
 ["Karlskrona","Sverige",56.1612,15.5869],["Kalmar","Sverige",56.6634,16.3568],
 ["Öland/Borgholm","Sverige",56.8793,16.6563],["Västervik","Sverige",57.7584,16.6373],
 ["Jönköping","Sverige",57.7826,14.1618],["Växjö","Sverige",56.8777,14.8091],
 ["Borås","Sverige",57.721,12.9401],["Linköping","Sverige",58.4108,15.6214],
 ["Norrköping","Sverige",58.5877,16.1924],["Visby","Sverige",57.6348,18.2948],
 ["Skagen","Danmark",57.7209,10.5839],["Aalborg","Danmark",57.0488,9.9217],
 ["Aarhus","Danmark",56.1629,10.2039],["Esbjerg","Danmark",55.4765,8.4594],
 ["Billund","Danmark",55.7284,9.1124],["Odense","Danmark",55.4038,10.4024],
 ["København","Danmark",55.6761,12.5683],["Roskilde","Danmark",55.6415,12.0803],
 ["Næstved","Danmark",55.2299,11.7609],["Rønne/Bornholm","Danmark",55.1009,14.7066]
];

const MODELS = {
  "DMI":"dmi_harmonie_arome_europe",
  "ECMWF":"ecmwf_ifs025",
  "ICON":"icon_seamless",
  "GFS":"gfs_seamless",
  "MET Norway":"metno_nordic"
};
const DAILY = "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration,wind_speed_10m_max";
let settings = JSON.parse(localStorage.getItem("vk-settings") || '{"temp":22,"rain":3,"sun":2,"wind":1.5,"sweden":true,"denmark":true}');
let dailyResults = {};
let activeDate = null;

const $ = id => document.getElementById(id);
const clamp = n => Math.max(0, Math.min(100, n));
const mean = a => {
  const b = a.filter(Number.isFinite);
  return b.length ? b.reduce((x,y)=>x+y,0)/b.length : null;
};
const std = a => {
  const b=a.filter(Number.isFinite); if(b.length<2) return 0;
  const m=mean(b); return Math.sqrt(b.reduce((s,x)=>s+(x-m)**2,0)/(b.length-1));
};
const fmt = (n,d=1) => Number.isFinite(n) ? n.toFixed(d) : "–";

function score(r){
  const tempScore = Number.isFinite(r.temp) ? clamp(100-Math.abs(r.temp-settings.temp)*7) : 50;
  const rainScore = clamp(100-(r.rain||0)*18-(r.risk||0)*0.45);
  const windScore = clamp(100-Math.max(0,(r.wind||0)-3)*10);
  const sunScore = clamp((r.sun||0)/12*100);
  return (tempScore + rainScore*settings.rain + windScore*settings.wind + sunScore*settings.sun) /
         (1+settings.rain+settings.wind+settings.sun);
}

async function fetchModel(label, model, places){
  const params = new URLSearchParams({
    latitude: places.map(p=>p[2]).join(","),
    longitude: places.map(p=>p[3]).join(","),
    daily: DAILY, timezone:"auto", forecast_days:"7", models:model, wind_speed_unit:"ms"
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if(!res.ok) throw new Error(`${label}: ${res.status}`);
  let data = await res.json(); if(!Array.isArray(data)) data=[data];
  const rows=[];
  data.forEach((item,pi)=>{
    const d=item.daily||{};
    (d.time||[]).forEach((day,i)=>rows.push({
      place:places[pi][0], country:places[pi][1], lat:places[pi][2], lon:places[pi][3],
      day, model:label,
      temp:Number.isFinite(Number(d.temperature_2m_max?.[i])) ? Number(d.temperature_2m_max[i]) : null,
      min:Number.isFinite(Number(d.temperature_2m_min?.[i])) ? Number(d.temperature_2m_min[i]) : null,
      rain:Number.isFinite(Number(d.precipitation_sum?.[i])) ? Number(d.precipitation_sum[i]) : null,
      risk:Number.isFinite(Number(d.precipitation_probability_max?.[i])) ? Number(d.precipitation_probability_max[i]) : null,
      sun:Number.isFinite(Number(d.sunshine_duration?.[i])) ? Number(d.sunshine_duration[i])/3600 : null,
      wind:Number.isFinite(Number(d.wind_speed_10m_max?.[i])) ? Number(d.wind_speed_10m_max[i]) : null
    }));
  });
  return rows;
}

async function load(){
  const places=PLACES.filter(p=>(settings.sweden&&p[1]==="Sverige")||(settings.denmark&&p[1]==="Danmark"));
  if(!places.length){ showError("Välj minst ett land i inställningarna."); return; }
  showStatus("Hämtar prognoser från fem modeller…");
  try{
    const settled=await Promise.allSettled(Object.entries(MODELS).map(([l,m])=>fetchModel(l,m,places)));
    const rows=settled.filter(x=>x.status==="fulfilled").flatMap(x=>x.value);
    const ok=settled.filter(x=>x.status==="fulfilled").length;
    if(!rows.length) throw new Error("Ingen väderkälla svarade.");
    dailyResults=aggregate(rows);
    activeDate=Object.keys(dailyResults).sort()[0];
    $("modelCount").textContent=`${ok} prognosmodeller`;
    $("statusCard").classList.add("hidden");
    renderTabs(); renderDay();
  }catch(e){ showError(`${e.message} Kontrollera internetanslutningen.`); }
}

function aggregate(rows){
  const groups={};
  rows.forEach(r=>{
    const key=`${r.day}|${r.place}`;
    (groups[key] ||= []).push(r);
  });
  const result={};
  Object.values(groups).forEach(g=>{
    const first=g[0];
    const item={
      day:first.day, place:first.place, country:first.country, lat:first.lat, lon:first.lon,
      temp:mean(g.map(x=>x.temp)), min:mean(g.map(x=>x.min)), rain:mean(g.map(x=>x.rain)),
      risk:mean(g.map(x=>x.risk)), sun:mean(g.map(x=>x.sun)), wind:mean(g.map(x=>x.wind)),
      models:g.length
    };
    item.score=Math.round(mean(g.map(x=>score(x))));
    item.confidence=Math.round(clamp(100-std(g.map(x=>x.temp))*5-std(g.map(x=>x.rain))*9-std(g.map(x=>x.wind))*4));
    (result[item.day] ||= []).push(item);
  });
  Object.values(result).forEach(a=>a.sort((x,y)=>y.score-x.score || y.confidence-x.confidence));
  return result;
}

function renderTabs(){
  const nav=$("dayTabs"); nav.innerHTML="";
  Object.keys(dailyResults).sort().forEach((day,i)=>{
    const d=new Date(day+"T12:00:00");
    const b=document.createElement("button");
    b.innerHTML=`${i===0?"Idag":d.toLocaleDateString("sv-SE",{weekday:"short"})}<small>${d.toLocaleDateString("sv-SE",{day:"numeric",month:"numeric"})}</small>`;
    b.className=day===activeDate?"active":"";
    b.onclick=()=>{activeDate=day; renderTabs(); renderDay();};
    nav.appendChild(b);
  });
}

function renderDay(){
  const list=dailyResults[activeDate]||[]; if(!list.length) return;
  const best=list[0];
  $("bestPlace").textContent=`${best.place}, ${best.country}`;
  $("bestSummary").textContent=best.score>=82?"Utmärkt utflyktsväder":best.score>=68?"Bra väder":best.score>=52?"Okej väder":"Osäkert väder";
  $("bestScore").textContent=best.score;
  $("bestTemp").textContent=`${fmt(best.temp,0)}°`;
  $("bestRain").textContent=`${fmt(best.rain)} mm`;
  $("bestSun").textContent=`${fmt(best.sun)} h`;
  $("bestConfidence").textContent=`${best.confidence}%`;
  $("mapLink").href=`https://maps.apple.com/?q=${encodeURIComponent(best.place)}&ll=${best.lat},${best.lon}`;
  ["hero","metrics","mapLink"].forEach(id=>$(id).classList.remove("hidden"));

  const ranking=$("ranking"); ranking.innerHTML="";
  list.slice(0,10).forEach((r,i)=>{
    const card=$("rankTemplate").content.cloneNode(true);
    card.querySelector(".rank-number").textContent=i+1;
    card.querySelector("h3").textContent=`${r.place}, ${r.country}`;
    card.querySelector("p").textContent=r.score>=82?"Utmärkt":r.score>=68?"Bra":r.score>=52?"Okej":"Svagt";
    card.querySelector(".mini-metrics").innerHTML=
      `<span>🌡️ Högst ${fmt(r.temp,0)}°</span><span>🌧️ ${fmt(r.rain)} mm</span><span>☀️ ${fmt(r.sun)} h</span><span>🎯 ${r.confidence}%</span>`;
    card.querySelector(".rank-score").textContent=r.score;
    ranking.appendChild(card);
  });
}

function showStatus(text){ $("status").textContent=text; $("statusCard").classList.remove("hidden","error"); }
function showError(text){ $("status").textContent=text; $("statusCard").classList.remove("hidden"); $("statusCard").classList.add("error"); $("statusCard").querySelector(".spinner").style.display="none"; }

function syncSettingsToForm(){
  $("tempTarget").value=settings.temp; $("tempOut").textContent=`${settings.temp} °C`;
  $("rainWeight").value=settings.rain; $("sunWeight").value=settings.sun; $("windWeight").value=settings.wind;
  $("sweden").checked=settings.sweden; $("denmark").checked=settings.denmark;
}
$("settingsBtn").onclick=()=>{syncSettingsToForm(); $("settingsDialog").showModal();};
$("tempTarget").oninput=e=>$("tempOut").textContent=`${e.target.value} °C`;
$("saveSettings").onclick=e=>{
  e.preventDefault();
  settings={temp:+$("tempTarget").value,rain:+$("rainWeight").value,sun:+$("sunWeight").value,wind:+$("windWeight").value,sweden:$("sweden").checked,denmark:$("denmark").checked};
  localStorage.setItem("vk-settings",JSON.stringify(settings));
  $("settingsDialog").close(); load();
};

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
load();
