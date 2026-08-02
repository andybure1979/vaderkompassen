import {readFile,writeFile,mkdir} from "node:fs/promises";
import vm from "node:vm";

const candidateFile=process.argv[2];
if(!candidateFile)throw new Error("Ange CSV-filen med de 500 granskade kandidaterna.");
const appSource=await readFile(new URL("../app.js",import.meta.url),"utf8");
const end=appSource.indexOf("function activityPlaces"),hasInlineLegacy=/const PLACES\s*=\s*\[/.test(appSource.slice(0,end));
let legacy=null;
if(hasInlineLegacy){const context={};vm.createContext(context);vm.runInContext(`${appSource.slice(0,end)}\n;globalThis.__legacy={PLACES,MARINE_COORDS,SKI_PLACES,BATH_PLACES,SURF_PLACES,BOAT_PLACES,FISHING_PLACES,CYCLING_PLACES,HIKING_PLACES};`,context);legacy=context.__legacy}
const slug=value=>String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const countryFor=region=>["Jylland","Fyn","Själland"].includes(region)?["Danmark","DK"]:["Østlandet","Sørlandet","Vestlandet","Trøndelag","Nord-Norge"].includes(region)?["Norge","NO"]:["Sverige","SE"];
const legacyCategories=name=>{
  const categories=["general","cinema","indoorPool"];
  if(legacy.MARINE_COORDS[name])categories.push("coast");
  for(const [category,set] of [["surf",legacy.SURF_PLACES],["boat",legacy.BOAT_PLACES],["fishing",legacy.FISHING_PLACES],["cycling",legacy.CYCLING_PLACES],["hiking",legacy.HIKING_PLACES],["skiing",legacy.SKI_PLACES]])if(set.has(name))categories.push(category);
  return [...new Set(categories)];
};
const free=legacy?legacy.PLACES.map(([name,area,region,latitude,longitude])=>{
  const [country,countryCode]=countryFor(region),categories=legacyCategories(name),marine=Boolean(legacy.MARINE_COORDS[name]||legacy.SURF_PLACES.has(name));
  return {id:`free-${countryCode.toLowerCase()}-${slug(name)}`,name,country,countryCode,region,area,municipality:null,latitude,longitude,placeType:"town",categories,marine,coastal:marine,freshwater:false,surfSpot:categories.includes("surf"),skiArea:categories.includes("skiing"),hikingArea:categories.includes("hiking"),protectedArea:null,priority:3,popularity:50,source:"legacy-v14.4.0",reviewStatus:"verified",enabled:true,accessTier:"free"};
}):JSON.parse(await readFile(new URL("../data/places.json",import.meta.url),"utf8")).filter(place=>place.accessTier==="free");

function parseCsv(text){
  const rows=[];let row=[],field="",quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=""}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field=""}else field+=c}
  if(field||row.length){row.push(field);rows.push(row)}const headers=rows.shift();return rows.map(values=>Object.fromEntries(headers.map((key,index)=>[key,values[index]??""])));
}
const candidates=parseCsv(await readFile(candidateFile,"utf8"));
if(candidates.length!==500)throw new Error(`Förväntade 500 kandidater, fick ${candidates.length}`);
const freeNames=new Set(free.map(place=>place.name.toLocaleLowerCase("sv"))),counts=new Map();
for(const row of candidates)counts.set(row.name.toLocaleLowerCase("sv"),(counts.get(row.name.toLocaleLowerCase("sv"))||0)+1);
const allowedTypes=new Set(["city","town","village","resort","coast","lake","river","harbour","fishing_water","hiking_area","mountain","surf_spot","ski_area","protected_area","destination"]);
const premium=candidates.map(row=>{
  let placeType=allowedTypes.has(row.placeType)?row.placeType:"destination";
  const normalized=row.name.toLocaleLowerCase("sv"),duplicate=freeNames.has(normalized)||counts.get(normalized)>1,distance=Number(row.areaReferenceKm);
  let categories=[];
  if(["city","town","village","resort"].includes(placeType))categories=["general","cycling"];
  else if(["lake","river","fishing_water"].includes(placeType))categories=["fishing"];
  else if(["coast","harbour"].includes(placeType))categories=["general","cycling","coast","boat","fishing"];
  else if(["hiking_area","mountain","protected_area"].includes(placeType))categories=["hiking"];
  else if(placeType==="surf_spot")categories=["surf","coast"];
  else if(placeType==="ski_area")categories=["skiing","hiking"];
  const categoryCertain=!['destination','mountain'].includes(placeType)&&categories.length>0;
  const areaCertain=Number.isFinite(distance)&&distance<=8;
  const reviewStatus=duplicate?"duplicate_review_required":!categoryCertain?"category_review_required":!areaCertain?"area_review_required":"coordinate_verified";
  const marine=["coast","harbour","surf_spot"].includes(placeType),freshwater=["lake","river","fishing_water"].includes(placeType);
  return {id:row.id,name:row.name,country:row.country,countryCode:row.countryCode,region:row.region,area:row.area,municipality:row.areaReference||null,latitude:Number(row.latitude),longitude:Number(row.longitude),placeType,categories,marine,coastal:marine,freshwater,surfSpot:placeType==="surf_spot",skiArea:placeType==="ski_area",hikingArea:["hiking_area","mountain","protected_area"].includes(placeType),protectedArea:placeType==="protected_area"?row.name:null,priority:placeType==="destination"?1:2,popularity:20,source:row.source,reviewStatus,enabled:reviewStatus==="coordinate_verified",accessTier:"premium",areaReference:row.areaReference||null};
});
await mkdir(new URL("../data/",import.meta.url),{recursive:true});
await writeFile(new URL("../data/places.json",import.meta.url),`${JSON.stringify([...free,...premium],null,2)}\n`);
console.log(`Importerade ${free.length} Free och ${premium.length} Premium-kandidater (${premium.filter(p=>p.enabled).length} aktiverade).`);
