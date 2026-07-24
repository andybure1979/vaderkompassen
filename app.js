
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
  ["Skagen","Nordjylland","Jylland",57.7209,10.5839],["Aalborg","Nordjylland","Jylland",57.0488,9.9217],
  ["Løkken","Nordjylland","Jylland",57.37,9.714],["Klitmøller","Nordjylland","Jylland",57.043,8.486],
  ["Aarhus","Midtjylland","Jylland",56.1629,10.2039],["Esbjerg","Syddanmark","Jylland",55.4765,8.4594],
  ["Hvide Sande","Midtjylland","Jylland",56.004,8.129],["Billund","Syddanmark","Jylland",55.7284,9.1124],
  ["Odense","Fyn","Fyn",55.4038,10.4024],["København","Hovedstaden","Själland",55.6761,12.5683],
  ["Roskilde","Själland","Själland",55.6415,12.0803],["Næstved","Själland","Själland",55.2299,11.7609],
  ["Rønne/Bornholm","Bornholm","Själland",55.1009,14.7066],

  // Norge – Østlandet
  ["Oslo","Oslo","Østlandet",59.9139,10.7522],["Drammen","Buskerud","Østlandet",59.7439,10.2045],
  ["Lillehammer","Innlandet","Østlandet",61.1153,10.4662],["Hamar","Innlandet","Østlandet",60.7945,11.0679],
  ["Fredrikstad","Østfold","Østlandet",59.2181,10.9298],["Geilo","Buskerud","Østlandet",60.5333,8.2076],
  ["Trysil","Innlandet","Østlandet",61.3148,12.2637],["Hemsedal","Buskerud","Østlandet",60.8629,8.5534],

  // Norge – Sørlandet
  ["Kristiansand","Agder","Sørlandet",58.1467,7.9956],["Arendal","Agder","Sørlandet",58.4618,8.7724],
  ["Grimstad","Agder","Sørlandet",58.3405,8.5934],["Mandal","Agder","Sørlandet",58.0274,7.4534],

  // Norge – Vestlandet
  ["Stavanger","Rogaland","Vestlandet",58.9700,5.7331],["Haugesund","Rogaland","Vestlandet",59.4138,5.2680],
  ["Bergen","Vestland","Vestlandet",60.3913,5.3221],["Voss","Vestland","Vestlandet",60.6287,6.4147],
  ["Flåm","Vestland","Vestlandet",60.8622,7.1132],["Ålesund","Møre og Romsdal","Vestlandet",62.4722,6.1495],
  ["Molde","Møre og Romsdal","Vestlandet",62.7375,7.1607],["Kristiansund","Møre og Romsdal","Vestlandet",63.1103,7.7281],

  // Norge – Trøndelag
  ["Trondheim","Trøndelag","Trøndelag",63.4305,10.3951],["Røros","Trøndelag","Trøndelag",62.5748,11.3841],
  ["Steinkjer","Trøndelag","Trøndelag",64.0149,11.4954],["Oppdal","Trøndelag","Trøndelag",62.5943,9.6912],

  // Norge – Nord-Norge
  ["Bodø","Nordland","Nord-Norge",67.2804,14.4049],["Narvik","Nordland","Nord-Norge",68.4385,17.4272],
  ["Svolvær","Nordland","Nord-Norge",68.2343,14.5682],["Tromsø","Troms","Nord-Norge",69.6492,18.9553],
  ["Alta","Finnmark","Nord-Norge",69.9689,23.2716],["Hammerfest","Finnmark","Nord-Norge",70.6634,23.6821],
  ["Kirkenes","Finnmark","Nord-Norge",69.7269,30.0450]

];

const REGIONS = ["Södra Sverige","Mellansverige","Norra Sverige","Jylland","Fyn","Själland","Østlandet","Sørlandet","Vestlandet","Trøndelag","Nord-Norge"];
const COUNTRY_REGIONS={
  Sverige:["Södra Sverige","Mellansverige","Norra Sverige"],
  Danmark:["Jylland","Fyn","Själland"],
  Norge:["Østlandet","Sørlandet","Vestlandet","Trøndelag","Nord-Norge"]
};
const REGION_AREAS=Object.fromEntries(REGIONS.map(region=>[
  region,[...new Set(PLACES.filter(p=>p[2]===region).map(p=>p[1]))].sort((a,b)=>a.localeCompare(b,"sv"))
]));
const ALL_AREAS=[...new Set(PLACES.map(p=>p[1]))];
const ACTIVITIES = {
  general:{label:"Sol och bad",icon:"☀️"},
  coast:{label:"Kustväder",icon:"🏖️"},
  surf:{label:"Surfväder",icon:"🏄"},
  boat:{label:"Båtväder",icon:"⛵"},
  fishing:{label:"Fiskeväder",icon:"🎣"},
  cycling:{label:"Cykelväder",icon:"🚴"},
  hiking:{label:"Vandringsväder",icon:"🥾"},
  ski:{label:"Skidväder",icon:"⛷️"}
};
const MODELS = {
  "SMHI":{type:"smhi"},
  "Yr / MET Norway":{type:"openMeteo",model:"metno_nordic"},
  "DMI":{type:"openMeteo",model:"dmi_harmonie_arome_europe"},
  "ECMWF":{type:"openMeteo",model:"ecmwf_ifs025"},
  "ICON":{type:"openMeteo",model:"icon_seamless"},
  "GFS":{type:"openMeteo",model:"gfs_seamless"}
};
const DAILY = "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunshine_duration,wind_speed_10m_max";

const MARINE_COORDS = {
  "Malmö":[55.58,12.93],"Ystad":[55.40,13.84],"Simrishamn":[55.55,14.39],"Helsingborg":[56.04,12.64],
  "Båstad":[56.43,12.78],"Halmstad":[56.65,12.78],"Varberg":[57.10,12.15],"Falkenberg":[56.88,12.39],
  "Göteborg":[57.67,11.83],"Strömstad":[58.94,11.08],"Uddevalla":[58.32,11.80],"Smögen":[58.35,11.16],
  "Kalmar":[56.66,16.43],"Västervik":[57.76,16.72],"Karlskrona":[56.13,15.63],"Ronneby":[56.16,15.33],
  "Borgholm":[56.88,16.72],"Färjestaden":[56.65,16.51],"Visby":[57.64,18.34],"Fårösund":[57.87,19.10],
  "Nyköping":[58.74,17.08],"Stockholm":[59.33,18.20],"Norrtälje":[59.75,18.82],"Gävle":[60.68,17.24],
  "Hudiksvall":[61.73,17.19],"Söderhamn":[61.30,17.16],"Sundsvall":[62.39,17.42],"Härnösand":[62.63,18.05],
  "Örnsköldsvik":[63.29,18.82],"Umeå":[63.77,20.40],"Skellefteå":[64.72,21.05],"Luleå":[65.56,22.28],
  "Piteå":[65.28,21.57],"Haparanda":[65.82,24.18],
  "Skagen":[57.74,10.66],"Aalborg":[57.08,10.10],"Løkken":[57.37,9.62],"Klitmøller":[57.04,8.40],
  "Aarhus":[56.16,10.33],"Esbjerg":[55.47,8.35],"Hvide Sande":[56.00,8.05],"Odense":[55.39,10.53],
  "København":[55.68,12.68],"Roskilde":[55.65,12.02],"Næstved":[55.20,11.67],"Rønne/Bornholm":[55.10,14.78],
  "Oslo":[59.88,10.73],"Fredrikstad":[59.17,10.92],"Kristiansand":[58.10,8.00],"Arendal":[58.42,8.82],
  "Stavanger":[58.97,5.63],"Haugesund":[59.40,5.20],"Bergen":[60.39,5.20],"Ålesund":[62.47,6.05],
  "Molde":[62.74,7.08],"Kristiansund":[63.11,7.62],"Trondheim":[63.45,10.30],"Bodø":[67.28,14.30],
  "Narvik":[68.43,17.30],"Svolvær":[68.23,14.45],"Tromsø":[69.65,18.82],"Hammerfest":[70.66,23.55]
};
const SKI_PLACES = new Set(["Sälen","Åre","Sveg","Funäsdalen","Vemdalen","Kiruna","Gällivare","Abisko","Arvidsjaur","Hemavan","Geilo","Trysil","Hemsedal","Voss","Røros","Oppdal","Narvik"]);
const MARINE_DAILY = "wave_height_max,wave_period_max,swell_wave_height_max,swell_wave_period_max";
const MARINE_HOURLY = "sea_surface_temperature";
const SNOW_DAILY = "snowfall_sum";
const SNOW_HOURLY = "snow_depth,freezing_level_height";


const defaults={
  temp:22,rain:3,sun:2,wind:1.5,regions:[...REGIONS],areas:[...ALL_AREAS],activity:"general",
  sourceMode:"auto",sources:Object.keys(MODELS)
};
let settings={...defaults,...JSON.parse(localStorage.getItem("vk-settings")||"{}")};
if(!Array.isArray(settings.regions)){ settings.regions=[...REGIONS]; }
if(!Array.isArray(settings.areas))settings.areas=[...ALL_AREAS];
if(settings.regions.includes("Danmark")){ settings.regions=settings.regions.filter(x=>x!=="Danmark").concat(["Jylland","Fyn","Själland"]); }
settings.regions=[...new Set(settings.regions.filter(x=>REGIONS.includes(x)))];
if(!settings.regions.length)settings.regions=[...REGIONS];
settings.areas=[...new Set(settings.areas.filter(x=>ALL_AREAS.includes(x)))];
if(!settings.areas.length)settings.areas=[...ALL_AREAS];
if(!["auto","manual"].includes(settings.sourceMode))settings.sourceMode="auto";
if(!Array.isArray(settings.sources))settings.sources=Object.keys(MODELS);
settings.sources=[...new Set(settings.sources.filter(x=>Object.hasOwn(MODELS,x)))];
if(!settings.sources.length)settings.sources=Object.keys(MODELS);

let dailyResults={}, activeDate=null, map=null, markerLayer=null;
const $=id=>document.getElementById(id);
const clamp=n=>Math.max(0,Math.min(100,n));
const mean=a=>{const b=a.filter(Number.isFinite);return b.length?b.reduce((x,y)=>x+y,0)/b.length:null};
const std=a=>{const b=a.filter(Number.isFinite);if(b.length<2)return 0;const m=mean(b);return Math.sqrt(b.reduce((s,x)=>s+(x-m)**2,0)/(b.length-1))};
const fmt=(n,d=1)=>Number.isFinite(n)?n.toFixed(d):"–";
const validNumber=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);

function countryFor(item){
  if(COUNTRY_REGIONS.Danmark.includes(item.region)) return "DK";
  if(COUNTRY_REGIONS.Norge.includes(item.region)) return "NO";
  return "SE";
}
function sourceWeight(model,item){
  if(settings.sourceMode==="manual")return 1;
  const country=countryFor(item);
  if(country==="SE" && model==="SMHI") return 3.5;
  if(country==="DK" && model==="DMI") return 3.5;
  if(country==="NO" && model==="Yr / MET Norway") return 3.5;
  if(model==="ECMWF") return 1.25;
  return 1;
}
function weightedMean(rows,key){
  const valid=rows.filter(r=>Number.isFinite(r[key]));
  if(!valid.length)return null;
  const total=valid.reduce((sum,r)=>sum+sourceWeight(r.model,r),0);
  return valid.reduce((sum,r)=>sum+r[key]*sourceWeight(r.model,r),0)/total;
}
function activeModelEntries(){
  const names=settings.sourceMode==="auto"?Object.keys(MODELS):settings.sources;
  return names.filter(name=>Object.hasOwn(MODELS,name)).map(name=>[name,MODELS[name]]);
}
function dominantSource(rows,item){
  const available=[...new Set(rows.filter(r=>Number.isFinite(r.temp)).map(r=>r.model))];
  if(!available.length)return "–";
  return available.sort((a,b)=>sourceWeight(b,item)-sourceWeight(a,item))[0];
}
function sourceLabel(){
  const names=activeModelEntries().map(([name])=>name);
  return settings.sourceMode==="auto"
    ? `Automatiskt · ${names.length} källor`
    : `Eget val · ${names.join(", ")}`;
}


const bell=(value,target,width)=>clamp(100-Math.abs(value-target)*(100/width));

function activityScore(r){
  const temp=r.temp??0, rain=r.rain??0, risk=r.risk??0, sun=r.sun??0, wind=r.wind??0, min=r.min??0;
  const dry=clamp(100-rain*18-risk*.45), sunny=clamp(sun/12*100);
  switch(settings.activity){
    case "coast":{
      const sea=Number.isFinite(r.seaTemp)?bell(r.seaTemp,20,10):45;
      const waves=Number.isFinite(r.waveHeight)?bell(r.waveHeight,.6,1.5):45;
      return .20*bell(temp,22,12)+.20*dry+.18*sunny+.14*bell(wind,5,6)+.18*sea+.10*waves;
    }
    case "surf":{
      const wave=Number.isFinite(r.waveHeight)?bell(r.waveHeight,1.8,1.8):0;
      const period=Number.isFinite(r.wavePeriod)?bell(r.wavePeriod,9,7):0;
      const swell=Number.isFinite(r.swellHeight)?bell(r.swellHeight,1.5,1.7):0;
      return .12*bell(temp,18,14)+.08*dry+.10*bell(wind,9,8)+.38*wave+.18*period+.14*swell;
    }
    case "boat":{
      const waves=Number.isFinite(r.waveHeight)?clamp(100-r.waveHeight*45):0;
      return .16*bell(temp,19,13)+.24*dry+.10*sunny+.30*bell(wind,4,5)+.20*waves;
    }
    case "fishing":{
      const waves=Number.isFinite(r.waveHeight)?bell(r.waveHeight,.5,1.5):50;
      return .18*bell(temp,16,14)+.25*dry+.10*sunny+.27*bell(wind,3.5,5)+.20*waves;
    }
    case "cycling": return .30*bell(temp,19,11)+.35*dry+.15*sunny+.20*bell(wind,2.5,5);
    case "hiking": return .30*bell(temp,17,12)+.35*dry+.15*sunny+.20*bell(wind,3,6);
    case "ski":{
      const depth=Number.isFinite(r.snowDepth)?clamp(r.snowDepth/80*100):0;
      const fresh=Number.isFinite(r.newSnow)?clamp(r.newSnow/15*100):0;
      const cold=bell(temp,-3,12);
      const windScore=bell(wind,3,7);
      const freeze=Number.isFinite(r.freezingLevel)?clamp(100-r.freezingLevel/18):50;
      return .32*depth+.25*fresh+.18*cold+.15*windScore+.10*freeze;
    }
    default:{
      const tempScore=bell(temp,settings.temp,14);
      const windScore=clamp(100-Math.max(0,wind-3)*10);
      return (tempScore+dry*settings.rain+windScore*settings.wind+sunny*settings.sun)/(1+settings.rain+settings.wind+settings.sun);
    }
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
  REGIONS.forEach(region=>{
    const group=document.createElement("section");group.className="filter-region-group";
    const head=document.createElement("label");head.className="check region-check region-head";
    const ri=document.createElement("input");ri.type="checkbox";ri.value=region;ri.dataset.kind="region";
    ri.checked=settings.regions.includes(region);
    head.append(ri,document.createTextNode(" "+region));group.appendChild(head);
    const children=document.createElement("div");children.className="landscape-grid";
    REGION_AREAS[region].forEach(area=>{
      const l=document.createElement("label");l.className="check landscape-check";
      const i=document.createElement("input");i.type="checkbox";i.value=area;i.dataset.kind="area";i.dataset.region=region;
      i.checked=settings.areas.includes(area) && ri.checked;
      l.append(i,document.createTextNode(" "+area));children.appendChild(l);
    });
    ri.onchange=()=>children.querySelectorAll("input").forEach(i=>i.checked=ri.checked);
    group.appendChild(children);box.appendChild(group);
  });
}
function selectCountry(country){
  const target=new Set(COUNTRY_REGIONS[country]||[]);
  document.querySelectorAll('#regionChoices input[data-kind="region"]').forEach(i=>{
    i.checked=target.has(i.value);
    document.querySelectorAll(`#regionChoices input[data-kind="area"][data-region="${i.value}"]`).forEach(a=>a.checked=i.checked);
  });
}
function renderSourceChoices(){
  const box=$("sourceChoices");box.innerHTML="";
  Object.keys(MODELS).forEach(name=>{
    const l=document.createElement("label");l.className="check source-check";
    const i=document.createElement("input");i.type="checkbox";i.value=name;
    i.checked=settings.sources.includes(name);
    i.disabled=$("sourceMode").value==="auto";
    l.append(i,document.createTextNode(" "+name));box.appendChild(l);
  });
  $("sourceHint").textContent=$("sourceMode").value==="auto"
    ?"Alla källor används. Nationell källa prioriteras: SMHI i Sverige, Yr/MET Norway i Norge och DMI i Danmark."
    :"Endast markerade källor används och de väger lika.";
}

const BATCH_SIZE=45;
const chunks=(arr,size)=>Array.from({length:Math.ceil(arr.length/size)},(_,i)=>arr.slice(i*size,(i+1)*size));
async function fetchModelBatch(label,model,places){
  const params=new URLSearchParams({latitude:places.map(p=>p[3]).join(","),longitude:places.map(p=>p[4]).join(","),daily:DAILY,timezone:"auto",forecast_days:"7",models:model.model,wind_speed_unit:"ms"});
  const res=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if(!res.ok)throw new Error(`${label}: ${res.status}`);
  let data=await res.json();if(!Array.isArray(data))data=[data];
  const rows=[];
  data.forEach((item,pi)=>{const d=item.daily||{};(d.time||[]).forEach((day,i)=>rows.push({place:places[pi][0],area:places[pi][1],region:places[pi][2],lat:places[pi][3],lon:places[pi][4],day,model:label,temp:validNumber(d.temperature_2m_max?.[i]),min:validNumber(d.temperature_2m_min?.[i]),rain:validNumber(d.precipitation_sum?.[i]),risk:validNumber(d.precipitation_probability_max?.[i]),sun:validNumber(d.sunshine_duration?.[i])===null?null:validNumber(d.sunshine_duration?.[i])/3600,wind:validNumber(d.wind_speed_10m_max?.[i])}));});
  return rows;
}
async function fetchOpenMeteo(label,model,places){
  const results=await Promise.allSettled(chunks(places,BATCH_SIZE).map(batch=>fetchModelBatch(label,model,batch)));
  const rows=results.filter(x=>x.status==="fulfilled").flatMap(x=>x.value);
  if(!rows.length)throw new Error(`${label}: inga data`);
  return rows;
}

function smhiParameter(step,name){
  return validNumber((step.parameters||[]).find(p=>p.name===name)?.values?.[0]);
}
function smhiDayKey(iso){
  return new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Stockholm",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(iso));
}
async function fetchSmhiPlace(place){
  const [name,area,region,lat,lon]=place;
  const url=`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(6)}/lat/${lat.toFixed(6)}/data.json`;
  const res=await fetch(url);
  if(!res.ok)throw new Error(`SMHI ${name}: ${res.status}`);
  const data=await res.json(),days={};
  (data.timeSeries||[]).forEach(step=>{
    const day=smhiDayKey(step.validTime),hour=new Date(step.validTime).getUTCHours();
    const t=smhiParameter(step,"t"),precip=smhiParameter(step,"pmean")??smhiParameter(step,"pmedian"),wind=smhiParameter(step,"ws"),cloud=smhiParameter(step,"tcc_mean")??smhiParameter(step,"tcc"),pcat=smhiParameter(step,"pcat");
    const d=days[day]||={temps:[],rain:0,wetHours:0,sunHours:0,winds:[]};
    if(Number.isFinite(t))d.temps.push(t);
    if(Number.isFinite(precip))d.rain+=Math.max(0,precip);
    if((Number.isFinite(precip)&&precip>.05)||(Number.isFinite(pcat)&&pcat>0))d.wetHours++;
    if(Number.isFinite(wind))d.winds.push(wind);
    if(hour>=4&&hour<=20&&Number.isFinite(cloud))d.sunHours+=clamp(100-(cloud/8*100))/100;
  });
  return Object.entries(days).slice(0,7).map(([day,d])=>({
    place:name,area,region,lat,lon,day,model:"SMHI",
    temp:d.temps.length?Math.max(...d.temps):null,min:d.temps.length?Math.min(...d.temps):null,
    rain:d.rain,risk:clamp(d.wetHours/24*100),sun:d.sunHours,
    wind:d.winds.length?Math.max(...d.winds):null
  }));
}
async function fetchSmhi(places){
  const swedish=places.filter(p=>countryFor({region:p[2]})==="SE");
  if(!swedish.length)throw new Error("SMHI: inga svenska orter valda");
  const rows=[];
  for(const batch of chunks(swedish,8)){
    const result=await Promise.allSettled(batch.map(fetchSmhiPlace));
    rows.push(...result.filter(x=>x.status==="fulfilled").flatMap(x=>x.value));
  }
  if(!rows.length)throw new Error("SMHI: inga data");
  return rows;
}
async function fetchSource(label,source,places){
  return source.type==="smhi"?fetchSmhi(places):fetchOpenMeteo(label,source,places);
}

function hourlyDailyMean(times,values){
  const out={};
  (times||[]).forEach((t,i)=>{
    const day=String(t).slice(0,10),v=validNumber(values?.[i]);
    if(Number.isFinite(v))(out[day]||=[]).push(v);
  });
  return Object.fromEntries(Object.entries(out).map(([d,v])=>[d,mean(v)]));
}
function hourlyDailyMax(times,values){
  const out={};
  (times||[]).forEach((t,i)=>{
    const day=String(t).slice(0,10),v=validNumber(values?.[i]);
    if(Number.isFinite(v))out[day]=Math.max(out[day]??-Infinity,v);
  });
  return out;
}
async function fetchMarine(places){
  const marine=places.filter(p=>MARINE_COORDS[p[0]]);
  if(!marine.length)return [];
  const params=new URLSearchParams({
    latitude:marine.map(p=>MARINE_COORDS[p[0]][0]).join(","),
    longitude:marine.map(p=>MARINE_COORDS[p[0]][1]).join(","),
    daily:MARINE_DAILY,hourly:MARINE_HOURLY,timezone:"auto",forecast_days:"7",cell_selection:"sea"
  });
  const res=await fetch(`https://marine-api.open-meteo.com/v1/marine?${params}`);
  if(!res.ok)throw new Error(`Havsdata: ${res.status}`);
  let data=await res.json();if(!Array.isArray(data))data=[data];
  const rows=[];
  data.forEach((item,pi)=>{
    const p=marine[pi],d=item.daily||{},h=item.hourly||{};
    const seaByDay=hourlyDailyMean(h.time,h.sea_surface_temperature);
    (d.time||[]).forEach((day,i)=>rows.push({
      place:p[0],day,kind:"marine",
      waveHeight:validNumber(d.wave_height_max?.[i]),wavePeriod:validNumber(d.wave_period_max?.[i]),
      swellHeight:validNumber(d.swell_wave_height_max?.[i]),swellPeriod:validNumber(d.swell_wave_period_max?.[i]),
      seaTemp:validNumber(seaByDay[day])
    }));
  });
  return rows;
}
async function fetchSnow(places){
  const ski=places.filter(p=>SKI_PLACES.has(p[0]));
  if(!ski.length)return [];
  const params=new URLSearchParams({
    latitude:ski.map(p=>p[3]).join(","),longitude:ski.map(p=>p[4]).join(","),
    daily:SNOW_DAILY,hourly:SNOW_HOURLY,timezone:"auto",forecast_days:"7"
  });
  const res=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if(!res.ok)throw new Error(`Snödata: ${res.status}`);
  let data=await res.json();if(!Array.isArray(data))data=[data];
  const rows=[];
  data.forEach((item,pi)=>{
    const p=ski[pi],d=item.daily||{},h=item.hourly||{};
    const depthByDay=hourlyDailyMax(h.time,h.snow_depth);
    const freezeByDay=hourlyDailyMean(h.time,h.freezing_level_height);
    (d.time||[]).forEach((day,i)=>rows.push({
      place:p[0],day,kind:"snow",
      snowDepth:Number.isFinite(depthByDay[day])?depthByDay[day]*100:null,
      newSnow:validNumber(d.snowfall_sum?.[i]),freezingLevel:validNumber(freezeByDay[day])
    }));
  });
  return rows;
}

async function load(){
  const selected=new Set(settings.regions),selectedAreas=new Set(settings.areas);
  const places=PLACES.filter(p=>selected.has(p[2])&&selectedAreas.has(p[1]));
  if(!places.length){showError("Välj minst en region i inställningarna.");return}
  showStatus(`Hämtar väder, havsdata och snödata för ${places.length} orter…`);
  try{
    const selectedModels=activeModelEntries();
    if(!selectedModels.length)throw new Error("Välj minst en prognoskälla.");
    const weatherPromise=Promise.allSettled(selectedModels.map(([l,m])=>fetchSource(l,m,places)));
    const [settled,marineResult,snowResult]=await Promise.all([
      weatherPromise,fetchMarine(places).catch(()=>[]),fetchSnow(places).catch(()=>[])
    ]);
    const rows=settled.filter(x=>x.status==="fulfilled").flatMap(x=>x.value);
    const ok=settled.filter(x=>x.status==="fulfilled").length;
    if(!rows.length)throw new Error("Ingen väderkälla svarade.");
    dailyResults=aggregate(rows,marineResult,snowResult);activeDate=Object.keys(dailyResults).sort()[0];
    const marineCount=new Set(marineResult.map(x=>x.place)).size;
    const snowCount=new Set(snowResult.map(x=>x.place)).size;
    $("modelCount").textContent=`${sourceLabel()} · ${ok} svarade · ${places.length} orter`;
    $("statusCard").classList.add("hidden");renderTabs();renderActivities();renderDay();
  }catch(e){showError(`${e.message} Kontrollera internetanslutningen.`)}
}
function aggregate(rows,marineRows=[],snowRows=[]){
  const groups={};rows.forEach(r=>(groups[`${r.day}|${r.place}`]||=[]).push(r));
  const extras={};
  [...marineRows,...snowRows].forEach(r=>Object.assign(extras[`${r.day}|${r.place}`]||={},r));
  const result={};
  Object.values(groups).forEach(g=>{
    const valid=g.filter(x=>Number.isFinite(x.temp));if(!valid.length)return;
    const f=g[0],extra=extras[`${f.day}|${f.place}`]||{},item={
      day:f.day,place:f.place,area:f.area,region:f.region,lat:f.lat,lon:f.lon,
      temp:weightedMean(g,"temp"),min:weightedMean(g,"min"),rain:weightedMean(g,"rain"),
      risk:weightedMean(g,"risk"),sun:weightedMean(g,"sun"),wind:weightedMean(g,"wind"),models:valid.length,
      waveHeight:validNumber(extra.waveHeight),wavePeriod:validNumber(extra.wavePeriod),
      swellHeight:validNumber(extra.swellHeight),swellPeriod:validNumber(extra.swellPeriod),
      seaTemp:validNumber(extra.seaTemp),snowDepth:validNumber(extra.snowDepth),
      newSnow:validNumber(extra.newSnow),freezingLevel:validNumber(extra.freezingLevel)
    };
    item.usedSources=[...new Set(valid.map(x=>x.model))];
    item.primarySource=dominantSource(valid,item);
    item.hasMarine=Number.isFinite(item.waveHeight)||Number.isFinite(item.seaTemp);
    item.hasSnow=SKI_PLACES.has(item.place)&&(Number.isFinite(item.snowDepth)||Number.isFinite(item.newSnow));
    item.confidence=Math.round(clamp(100-std(g.map(x=>x.temp))*5-std(g.map(x=>x.rain))*9-std(g.map(x=>x.wind))*4));
    (result[item.day]||=[]).push(item);
  });return result;
}
function rankedList(){
  let list=(dailyResults[activeDate]||[]);
  if(["coast","surf","boat","fishing"].includes(settings.activity)){
    const specialized=list.filter(x=>x.hasMarine);if(specialized.length)list=specialized;
  }
  if(settings.activity==="ski"){
    const specialized=list.filter(x=>x.hasSnow);if(specialized.length)list=specialized;
  }
  list=list.map(x=>({...x,score:Math.round(activityScore(x))}));
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
function specialMetricHtml(r){
  if(["coast","surf","boat","fishing"].includes(settings.activity)){
    return `<span>🌊 ${fmt(r.waveHeight)} m</span><span>↔️ ${fmt(r.wavePeriod,0)} s</span><span>🏄 ${fmt(r.swellHeight)} m</span><span>🌡️ Hav ${fmt(r.seaTemp,0)}°</span>`;
  }
  if(settings.activity==="ski"){
    return `<span>❄️ ${fmt(r.snowDepth,0)} cm</span><span>🌨️ ${fmt(r.newSnow)} cm</span><span>🏔️ 0° ${fmt(r.freezingLevel,0)} m</span>`;
  }
  return "";
}
function scoreColor(score){return score>=80?"#16803c":score>=70?"#d6a700":score>=60?"#e67e22":"#c92a2a";}
function ensureMap(){
  if(map||!window.L)return;
  map=L.map("weatherMap",{zoomControl:true}).setView([60.2,15.4],5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; OpenStreetMap'}).addTo(map);
  markerLayer=L.layerGroup().addTo(map);
}
function renderMap(list){
  ensureMap();if(!map||!markerLayer)return;
  markerLayer.clearLayers();
  list.forEach(r=>{const color=scoreColor(r.score);const m=L.circleMarker([r.lat,r.lon],{radius:8,fillColor:color,color:"#fff",weight:2,fillOpacity:.92});m.bindPopup(`<strong>${r.place}</strong><br>${r.area} · ${r.region}<br><b>${r.score}/100</b> · ${activitySummary(r.score)}<br>🌡️ ${fmt(r.temp,0)}° · 🌧️ ${fmt(r.rain)} mm · 💨 ${fmt(r.wind)} m/s`);m.addTo(markerLayer);});
  if(list.length){const bounds=L.latLngBounds(list.map(r=>[r.lat,r.lon]));map.fitBounds(bounds,{padding:[24,24],maxZoom:7});}
}
function toggleMap(){const section=$("mapSection");section.classList.toggle("hidden");if(!section.classList.contains("hidden")){renderMap(rankedList());setTimeout(()=>map?.invalidateSize(),50);}}
function renderDay(){
  const list=rankedList();if(!list.length)return;
  if(!$("mapSection").classList.contains("hidden"))renderMap(list);
  const best=list[0],activity=ACTIVITIES[settings.activity];
  $("bestEyebrow").textContent=`BÄST ${activity.label.toUpperCase()}`;
  $("bestPlace").textContent=best.place;
  $("bestRegion").textContent=settings.sourceMode==="auto"
    ? `${best.area} · ${best.region} · Tyngst: ${best.primarySource}`
    : `${best.area} · ${best.region} · ${best.usedSources.length} valda källor`;
  $("bestSummary").textContent=activitySummary(best.score);
  $("bestScore").textContent=best.score;$("bestTemp").textContent=`${fmt(best.temp,0)}°`;
  $("bestRain").textContent=`${fmt(best.rain)} mm`;$("bestSun").textContent=`${fmt(best.sun)} h`;
  $("bestWind").textContent=`${fmt(best.wind)} m/s`;$("bestConfidence").textContent=`${best.confidence}%`;
  $("specialMetrics").innerHTML=specialMetricHtml(best);$("specialMetrics").classList.toggle("hidden",!$("specialMetrics").innerHTML);
  $("mapLink").href=`https://maps.apple.com/?q=${encodeURIComponent(best.place)}&ll=${best.lat},${best.lon}`;
  ["hero","metrics","mapLink"].forEach(id=>$(id).classList.remove("hidden"));
  const ranking=$("ranking");ranking.innerHTML="";
  list.slice(0,15).forEach((r,i)=>{
    const card=$("rankTemplate").content.cloneNode(true);
    card.querySelector(".rank-number").textContent=i+1;
    card.querySelector("h3").textContent=r.place;
    card.querySelector("p").textContent=settings.sourceMode==="auto"
      ? `${r.area} · ${r.region} · ${activitySummary(r.score)} · Tyngst: ${r.primarySource}`
      : `${r.area} · ${r.region} · ${activitySummary(r.score)} · ${r.usedSources.join(", ")}`;
    card.querySelector(".mini-metrics").innerHTML=`<span>🌡️ ${fmt(r.temp,0)}°</span><span>🌧️ ${fmt(r.rain)} mm</span><span>☀️ ${fmt(r.sun)} h</span><span>💨 ${fmt(r.wind)} m/s</span>${specialMetricHtml(r)}<span>🎯 ${r.confidence}%</span>`;
    card.querySelector(".rank-score").textContent=r.score;ranking.appendChild(card);
  });
}
function showStatus(t){$("status").textContent=t;$("statusCard").classList.remove("hidden","error");$("statusCard").querySelector(".spinner").style.display=""}
function showError(t){$("status").textContent=t;$("statusCard").classList.remove("hidden");$("statusCard").classList.add("error");$("statusCard").querySelector(".spinner").style.display="none"}
function syncSettings(){
  $("tempTarget").value=settings.temp;$("tempOut").textContent=`${settings.temp} °C`;
  $("rainWeight").value=settings.rain;$("sunWeight").value=settings.sun;$("windWeight").value=settings.wind;
  $("sourceMode").value=settings.sourceMode;renderRegionChoices();renderSourceChoices();
}
$("showMapBtn").onclick=toggleMap;
$("settingsBtn").onclick=()=>{syncSettings();$("settingsDialog").showModal()};
$("tempTarget").oninput=e=>$("tempOut").textContent=`${e.target.value} °C`;
$("sourceMode").onchange=renderSourceChoices;
$("selectAllRegions").onclick=e=>{e.preventDefault();document.querySelectorAll("#regionChoices input").forEach(x=>x.checked=true)};
$("clearRegions").onclick=e=>{e.preventDefault();document.querySelectorAll("#regionChoices input").forEach(x=>x.checked=false)};
$("filterSweden").onclick=e=>{e.preventDefault();selectCountry("Sverige")};
$("filterDenmark").onclick=e=>{e.preventDefault();selectCountry("Danmark")};
$("filterNorway").onclick=e=>{e.preventDefault();selectCountry("Norge")};
$("saveSettings").onclick=e=>{
  e.preventDefault();
  const sourceMode=$("sourceMode").value;
  const sources=[...document.querySelectorAll("#sourceChoices input:checked")].map(x=>x.value);
  if(sourceMode==="manual"&&!sources.length){
    $("sourceError").textContent="Välj minst en prognoskälla.";
    $("sourceError").classList.remove("hidden");
    return;
  }
  $("sourceError").classList.add("hidden");
  settings={...settings,temp:+$("tempTarget").value,rain:+$("rainWeight").value,
    sun:+$("sunWeight").value,wind:+$("windWeight").value,sourceMode,sources,
    regions:[...document.querySelectorAll('#regionChoices input[data-kind="region"]:checked')].map(x=>x.value),
    areas:[...document.querySelectorAll('#regionChoices input[data-kind="area"]:checked')].map(x=>x.value)};
  localStorage.setItem("vk-settings",JSON.stringify(settings));$("settingsDialog").close();load();
};
if("serviceWorker"in navigator)window.addEventListener("load",async()=>{
  const reg=await navigator.serviceWorker.register(`sw.js?v=10`);
  reg.update();
  reg.addEventListener("updatefound",()=>{const worker=reg.installing;worker?.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller){$("updateBanner").classList.remove("hidden");}})});
  navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload());
});
$("updateNow").onclick=()=>navigator.serviceWorker.getRegistration().then(r=>r?.waiting?.postMessage({type:"SKIP_WAITING"}));
renderActivities();load();
