
const PLACES = [
  // Södra Sverige
  ["Malmö","Skåne","Södra Sverige",55.605,13.0038],["Ystad","Skåne","Södra Sverige",55.4295,13.8204],
  ["Simrishamn","Skåne","Södra Sverige",55.5565,14.3504],["Kristianstad","Skåne","Södra Sverige",56.0294,14.1567],
  ["Helsingborg","Skåne","Södra Sverige",56.0465,12.6945],["Båstad","Skåne","Södra Sverige",56.4269,12.8534],
  ["Halmstad","Halland","Södra Sverige",56.6745,12.8578],["Varberg","Halland","Södra Sverige",57.1056,12.2508],
  ["Falkenberg","Halland","Södra Sverige",56.9055,12.4912],["Göteborg","Västergötland","Södra Sverige",57.7089,11.9746],
  ["Borås","Västergötland","Södra Sverige",57.721,12.9401],["Strömstad","Bohuslän","Södra Sverige",58.939,11.171],
  ["Uddevalla","Bohuslän","Södra Sverige",58.3498,11.9384],["Smögen","Bohuslän","Södra Sverige",58.3559,11.2242],
  ["Jönköping","Småland","Södra Sverige",57.7826,14.1618],["Växjö","Småland","Södra Sverige",56.8777,14.8091],
  ["Kalmar","Småland","Södra Sverige",56.6634,16.3568],["Västervik","Småland","Södra Sverige",57.7584,16.6373],
  ["Karlskrona","Blekinge","Södra Sverige",56.1612,15.5869],["Ronneby","Blekinge","Södra Sverige",56.209,15.276],
  ["Borgholm","Öland","Södra Sverige",56.8793,16.6563],["Färjestaden","Öland","Södra Sverige",56.6499,16.4681],
  ["Visby","Gotland","Södra Sverige",57.6348,18.2948],["Fårösund","Gotland","Södra Sverige",57.8635,19.0554],

  // Mellansverige
  ["Linköping","Östergötland","Mellansverige",58.4108,15.6214],["Norrköping","Östergötland","Mellansverige",58.5877,16.1924],
  ["Motala","Östergötland","Mellansverige",58.5371,15.0365],["Nyköping","Södermanland","Mellansverige",58.753,17.0079],
  ["Eskilstuna","Södermanland","Mellansverige",59.3712,16.5098],["Stockholm","Uppland","Mellansverige",59.3293,18.0686],
  ["Uppsala","Uppland","Mellansverige",59.8586,17.6389],["Norrtälje","Uppland","Mellansverige",59.758,18.705],
  ["Västerås","Västmanland","Mellansverige",59.6099,16.5448],["Sala","Västmanland","Mellansverige",59.9199,16.6066],
  ["Örebro","Närke","Mellansverige",59.2753,15.2134],["Askersund","Närke","Mellansverige",58.8799,14.902],
  ["Karlstad","Värmland","Mellansverige",59.3793,13.5036],["Arvika","Värmland","Mellansverige",59.6553,12.5852],
  ["Falun","Dalarna","Mellansverige",60.6065,15.6355],["Mora","Dalarna","Mellansverige",61.0049,14.537],
  ["Sälen","Dalarna","Mellansverige",61.156,13.266],["Borlänge","Dalarna","Mellansverige",60.4858,15.4371],
  ["Gävle","Gästrikland","Mellansverige",60.6749,17.1413],["Sandviken","Gästrikland","Mellansverige",60.6167,16.7667],

  // Norra Sverige
  ["Hudiksvall","Hälsingland","Norra Sverige",61.7274,17.1056],["Söderhamn","Hälsingland","Norra Sverige",61.3037,17.0592],
  ["Sundsvall","Medelpad","Norra Sverige",62.3908,17.3069],["Härnösand","Ångermanland","Norra Sverige",62.6323,17.9379],
  ["Örnsköldsvik","Ångermanland","Norra Sverige",63.2909,18.7153],["Östersund","Jämtland","Norra Sverige",63.1792,14.6357],
  ["Åre","Jämtland","Norra Sverige",63.3983,13.0802],["Sveg","Härjedalen","Norra Sverige",62.0348,14.3658],
  ["Funäsdalen","Härjedalen","Norra Sverige",62.5467,12.5426],["Vemdalen","Härjedalen","Norra Sverige",62.449,13.862],
  ["Umeå","Västerbotten","Norra Sverige",63.8258,20.263],["Skellefteå","Västerbotten","Norra Sverige",64.7507,20.9528],
  ["Luleå","Norrbotten","Norra Sverige",65.5848,22.1567],["Piteå","Norrbotten","Norra Sverige",65.3172,21.4794],
  ["Haparanda","Norrbotten","Norra Sverige",65.8355,24.1368],["Kiruna","Lappland","Norra Sverige",67.8558,20.2253],
  ["Gällivare","Lappland","Norra Sverige",67.1339,20.6528],["Abisko","Lappland","Norra Sverige",68.3495,18.8312],
  ["Arvidsjaur","Lappland","Norra Sverige",65.5903,19.1668],["Hemavan","Lappland","Norra Sverige",65.819,15.086],

  // Danmark
  ["Skagen","Danmark","Danmark",57.7209,10.5839],["Aalborg","Danmark","Danmark",57.0488,9.9217],
  ["Løkken","Danmark","Danmark",57.37,9.714],["Klitmøller","Danmark","Danmark",57.043,8.486],
  ["Aarhus","Danmark","Danmark",56.1629,10.2039],["Esbjerg","Danmark","Danmark",55.4765,8.4594],
  ["Hvide Sande","Danmark","Danmark",56.004,8.129],["Billund","Danmark","Danmark",55.7284,9.1124],
  ["Odense","Danmark","Danmark",55.4038,10.4024],["København","Danmark","Danmark",55.6761,12.5683],
  ["Roskilde","Danmark","Danmark",55.6415,12.0803],["Næstved","Danmark","Danmark",55.2299,11.7609],
  ["Rønne/Bornholm","Danmark","Danmark",55.1009,14.7066]
];

const REGIONS = ["Södra Sverige","Mellansverige","Norra Sverige","Danmark"];
const ACTIVITIES = {
  general:{label:"Bäst väder",icon:"☀️"},
  coast:{label:"Kustväder",icon:"🏖️"},
  surf:{label:"Surfväder",icon:"🏄"},
  boat:{label:"Båtväder",icon:"⛵"},
  fishing:{label:"Fiskeväder",icon:"🎣"},
  cycling:{label:"Cykelväder",icon:"🚴"},
  hiking:{label:"Vandringsväder",icon:"🥾"},
  ski:{label:"Skidväder",icon:"⛷️"}
};
const MODELS = {
  "DMI":"dmi_harmonie_arome_europe","ECMWF":"ecmwf_ifs025","ICON":"icon_seamless",
  "GFS":"gfs_seamless","MET Norway":"metno_nordic"
};
const DAILY = "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration,wind_speed_10m_max";

const defaults={temp:22,rain:3,sun:2,wind:1.5,regions:[...REGIONS],activity:"general"};
let settings={...defaults,...JSON.parse(localStorage.getItem("vk-settings")||"{}")};
if(!Array.isArray(settings.regions)){
  settings.regions=[...REGIONS];
  delete settings.landscapes;
}
let dailyResults={}, activeDate=null;
const $=id=>document.getElementById(id);
const clamp=n=>Math.max(0,Math.min(100,n));
const mean=a=>{const b=a.filter(Number.isFinite);return b.length?b.reduce((x,y)=>x+y,0)/b.length:null};
const std=a=>{const b=a.filter(Number.isFinite);if(b.length<2)return 0;const m=mean(b);return Math.sqrt(b.reduce((s,x)=>s+(x-m)**2,0)/(b.length-1))};
const fmt=(n,d=1)=>Number.isFinite(n)?n.toFixed(d):"–";
const validNumber=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);
const bell=(value,target,width)=>clamp(100-Math.abs(value-target)*(100/width));

function activityScore(r){
  const temp=r.temp??0, rain=r.rain??0, risk=r.risk??0, sun=r.sun??0, wind=r.wind??0, min=r.min??0;
  const dry=clamp(100-rain*18-risk*.45), sunny=clamp(sun/12*100);
  switch(settings.activity){
    case "coast": return .28*bell(temp,22,12)+.28*dry+.24*sunny+.20*bell(wind,5,6);
    case "surf": return .12*bell(temp,18,14)+.18*dry+.15*sunny+.55*bell(wind,10,8);
    case "boat": return .20*bell(temp,19,13)+.30*dry+.15*sunny+.35*bell(wind,5,5);
    case "fishing": return .20*bell(temp,16,14)+.30*dry+.15*sunny+.35*bell(wind,3.5,5);
    case "cycling": return .30*bell(temp,19,11)+.35*dry+.15*sunny+.20*bell(wind,2.5,5);
    case "hiking": return .30*bell(temp,17,12)+.35*dry+.15*sunny+.20*bell(wind,3,6);
    case "ski":
      const cold=clamp(100-Math.abs(Math.min(temp,3)-(-3))*10);
      const freezing=clamp((3-min)*16);
      const precip=clamp(rain*16);
      return .38*cold+.27*freezing+.18*precip+.17*bell(wind,2,6);
    default:
      const tempScore=bell(temp,settings.temp,14);
      const windScore=clamp(100-Math.max(0,wind-3)*10);
      return (tempScore+dry*settings.rain+windScore*settings.wind+sunny*settings.sun)/(1+settings.rain+settings.wind+settings.sun);
  }
}
function activitySummary(score){
  if(score>=84)return "Utmärkta förhållanden";
  if(score>=70)return "Bra förhållanden";
  if(score>=55)return "Okej förhållanden";
  return "Mindre gynnsamt";
}
function renderActivities(){
  const box=$("activityChoices");box.innerHTML="";
  Object.entries(ACTIVITIES).forEach(([key,a])=>{
    const b=document.createElement("button");
    b.type="button";b.className="activity-chip"+(settings.activity===key?" active":"");
    b.innerHTML=`<span>${a.icon}</span>${a.label}`;
    b.onclick=()=>{settings.activity=key;localStorage.setItem("vk-settings",JSON.stringify(settings));renderActivities();renderDay();};
    box.appendChild(b);
  });
  $("activeActivity").textContent=`${ACTIVITIES[settings.activity].icon} ${ACTIVITIES[settings.activity].label}`;
}
function renderRegionChoices(){
  const box=$("regionChoices");box.innerHTML="";
  REGIONS.forEach(name=>{
    const l=document.createElement("label");l.className="check region-check";
    const i=document.createElement("input");i.type="checkbox";i.value=name;i.checked=settings.regions.includes(name);
    l.append(i,document.createTextNode(" "+name));box.appendChild(l);
  });
}
async function fetchModel(label,model,places){
  const params=new URLSearchParams({
    latitude:places.map(p=>p[3]).join(","),longitude:places.map(p=>p[4]).join(","),
    daily:DAILY,timezone:"auto",forecast_days:"7",models:model,wind_speed_unit:"ms"
  });
  const res=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if(!res.ok)throw new Error(`${label}: ${res.status}`);
  let data=await res.json();if(!Array.isArray(data))data=[data];
  const rows=[];
  data.forEach((item,pi)=>{
    const d=item.daily||{};
    (d.time||[]).forEach((day,i)=>rows.push({
      place:places[pi][0],area:places[pi][1],region:places[pi][2],lat:places[pi][3],lon:places[pi][4],day,model:label,
      temp:validNumber(d.temperature_2m_max?.[i]),min:validNumber(d.temperature_2m_min?.[i]),
      rain:validNumber(d.precipitation_sum?.[i]),risk:validNumber(d.precipitation_probability_max?.[i]),
      sun:validNumber(d.sunshine_duration?.[i])===null?null:validNumber(d.sunshine_duration?.[i])/3600,
      wind:validNumber(d.wind_speed_10m_max?.[i])
    }));
  });return rows;
}
async function load(){
  const selected=new Set(settings.regions);
  const places=PLACES.filter(p=>selected.has(p[2]));
  if(!places.length){showError("Välj minst en region i inställningarna.");return}
  showStatus(`Hämtar ${places.length} orter från fem prognosmodeller…`);
  try{
    const settled=await Promise.allSettled(Object.entries(MODELS).map(([l,m])=>fetchModel(l,m,places)));
    const rows=settled.filter(x=>x.status==="fulfilled").flatMap(x=>x.value);
    const ok=settled.filter(x=>x.status==="fulfilled").length;
    if(!rows.length)throw new Error("Ingen väderkälla svarade.");
    dailyResults=aggregate(rows);activeDate=Object.keys(dailyResults).sort()[0];
    $("modelCount").textContent=`${ok} prognosmodeller · ${places.length} orter`;
    $("statusCard").classList.add("hidden");renderTabs();renderActivities();renderDay();
  }catch(e){showError(`${e.message} Kontrollera internetanslutningen.`)}
}
function aggregate(rows){
  const groups={};rows.forEach(r=>(groups[`${r.day}|${r.place}`]||=[]).push(r));
  const result={};
  Object.values(groups).forEach(g=>{
    const valid=g.filter(x=>Number.isFinite(x.temp));if(!valid.length)return;
    const f=g[0],item={
      day:f.day,place:f.place,area:f.area,region:f.region,lat:f.lat,lon:f.lon,
      temp:mean(g.map(x=>x.temp)),min:mean(g.map(x=>x.min)),rain:mean(g.map(x=>x.rain)),
      risk:mean(g.map(x=>x.risk)),sun:mean(g.map(x=>x.sun)),wind:mean(g.map(x=>x.wind)),models:valid.length
    };
    item.confidence=Math.round(clamp(100-std(g.map(x=>x.temp))*5-std(g.map(x=>x.rain))*9-std(g.map(x=>x.wind))*4));
    (result[item.day]||=[]).push(item);
  });return result;
}
function rankedList(){
  const list=(dailyResults[activeDate]||[]).map(x=>({...x,score:Math.round(activityScore(x))}));
  return list.sort((a,b)=>b.score-a.score||b.confidence-a.confidence);
}
function renderTabs(){
  const nav=$("dayTabs");nav.innerHTML="";
  Object.keys(dailyResults).sort().forEach((day,i)=>{
    const d=new Date(day+"T12:00:00"),b=document.createElement("button");
    b.innerHTML=`${i===0?"Idag":d.toLocaleDateString("sv-SE",{weekday:"short"})}<small>${d.toLocaleDateString("sv-SE",{day:"numeric",month:"numeric"})}</small>`;
    b.className=day===activeDate?"active":"";b.onclick=()=>{activeDate=day;renderTabs();renderDay()};nav.appendChild(b);
  });
}
function renderDay(){
  const list=rankedList();if(!list.length)return;
  const best=list[0],activity=ACTIVITIES[settings.activity];
  $("bestEyebrow").textContent=`BÄST ${activity.label.toUpperCase()}`;
  $("bestPlace").textContent=best.place;
  $("bestRegion").textContent=`${best.area} · ${best.region}`;
  $("bestSummary").textContent=activitySummary(best.score);
  $("bestScore").textContent=best.score;$("bestTemp").textContent=`${fmt(best.temp,0)}°`;
  $("bestRain").textContent=`${fmt(best.rain)} mm`;$("bestSun").textContent=`${fmt(best.sun)} h`;
  $("bestWind").textContent=`${fmt(best.wind)} m/s`;$("bestConfidence").textContent=`${best.confidence}%`;
  $("mapLink").href=`https://maps.apple.com/?q=${encodeURIComponent(best.place)}&ll=${best.lat},${best.lon}`;
  ["hero","metrics","mapLink"].forEach(id=>$(id).classList.remove("hidden"));
  const ranking=$("ranking");ranking.innerHTML="";
  list.slice(0,15).forEach((r,i)=>{
    const card=$("rankTemplate").content.cloneNode(true);
    card.querySelector(".rank-number").textContent=i+1;
    card.querySelector("h3").textContent=r.place;
    card.querySelector("p").textContent=`${r.area} · ${r.region} · ${activitySummary(r.score)}`;
    card.querySelector(".mini-metrics").innerHTML=`<span>🌡️ ${fmt(r.temp,0)}°</span><span>🌧️ ${fmt(r.rain)} mm</span><span>☀️ ${fmt(r.sun)} h</span><span>💨 ${fmt(r.wind)} m/s</span><span>🎯 ${r.confidence}%</span>`;
    card.querySelector(".rank-score").textContent=r.score;ranking.appendChild(card);
  });
}
function showStatus(t){$("status").textContent=t;$("statusCard").classList.remove("hidden","error");$("statusCard").querySelector(".spinner").style.display=""}
function showError(t){$("status").textContent=t;$("statusCard").classList.remove("hidden");$("statusCard").classList.add("error");$("statusCard").querySelector(".spinner").style.display="none"}
function syncSettings(){
  $("tempTarget").value=settings.temp;$("tempOut").textContent=`${settings.temp} °C`;
  $("rainWeight").value=settings.rain;$("sunWeight").value=settings.sun;$("windWeight").value=settings.wind;renderRegionChoices();
}
$("settingsBtn").onclick=()=>{syncSettings();$("settingsDialog").showModal()};
$("tempTarget").oninput=e=>$("tempOut").textContent=`${e.target.value} °C`;
$("selectAllRegions").onclick=e=>{e.preventDefault();document.querySelectorAll("#regionChoices input").forEach(x=>x.checked=true)};
$("clearRegions").onclick=e=>{e.preventDefault();document.querySelectorAll("#regionChoices input").forEach(x=>x.checked=false)};
$("saveSettings").onclick=e=>{
  e.preventDefault();settings={...settings,temp:+$("tempTarget").value,rain:+$("rainWeight").value,
    sun:+$("sunWeight").value,wind:+$("windWeight").value,
    regions:[...document.querySelectorAll("#regionChoices input:checked")].map(x=>x.value)};
  localStorage.setItem("vk-settings",JSON.stringify(settings));$("settingsDialog").close();load();
};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
renderActivities();load();
