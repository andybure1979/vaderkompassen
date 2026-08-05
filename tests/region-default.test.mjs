import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const settingsBootstrap=app.split("let dailyResults=")[0];
const regions=["Södra Sverige","Mellansverige","Norra Sverige","Jylland","Fyn","Själland","Østlandet","Sørlandet","Vestlandet","Trøndelag","Nord-Norge"];
const places=regions.map((region,index)=>({name:`Plats ${index}`,region,area:`Område ${index}`,enabled:true}));

function boot(storedValue){
  const values=new Map();
  if(storedValue!==undefined)values.set("vk-settings",storedValue);
  const localStorage={
    get length(){return values.size},
    key:index=>[...values.keys()][index]??null,
    getItem:key=>values.has(key)?values.get(key):null,
    setItem:(key,value)=>values.set(key,String(value)),
    removeItem:key=>values.delete(key)
  };
  const listeners={};
  const context={console,localStorage,VK_PLACE_REGISTRY:{places,placeTuple:place=>[place.name,place.area,place.region]}};
  context.window=context;
  context.addEventListener=(name,listener)=>{listeners[name]=listener};
  vm.createContext(context);
  vm.runInContext(`${settingsBootstrap}\nglobalThis.__settings=settings;globalThis.__normalizeSettings=normalizeSettings;`,context);
  return context;
}

test("ren installation och tom lagring väljer endast Mellansverige",()=>{
  for(const stored of [undefined,"",JSON.stringify({})]){
    const {__settings}=boot(stored);
    assert.deepEqual([...__settings.regions],["Mellansverige"]);
    assert.deepEqual([...__settings.areas],["Område 1"]);
  }
});

test("tomt, trasigt eller ogiltigt regionvärde faller tillbaka till Mellansverige",()=>{
  for(const stored of ["{trasig",JSON.stringify({regions:[]}),JSON.stringify({regions:["Okänd region"],areas:["Område 0"]})]){
    assert.deepEqual([...boot(stored).__settings.regions],["Mellansverige"]);
  }
});

test("giltiga sparade enkel- och flervalsregioner bevaras",()=>{
  const single=boot(JSON.stringify({regions:["Södra Sverige"],areas:["Område 0"]})).__settings;
  assert.deepEqual([...single.regions],["Södra Sverige"]);
  assert.deepEqual([...single.areas],["Område 0"]);

  const multiple=boot(JSON.stringify({regions:["Södra Sverige","Norra Sverige"],areas:["Område 0","Område 2"]})).__settings;
  assert.deepEqual([...multiple.regions],["Södra Sverige","Norra Sverige"]);
  assert.deepEqual([...multiple.areas],["Område 0","Område 2"]);
});

test("normalisering av saknade regioner använder samma säkra fallback",()=>{
  const {__normalizeSettings}=boot(undefined);
  assert.deepEqual([...__normalizeSettings({regions:null,areas:null}).regions],["Mellansverige"]);
  assert.deepEqual([...__normalizeSettings({regions:[],areas:[]}).regions],["Mellansverige"]);
});
