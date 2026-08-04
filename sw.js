const CACHE="vaderkompassen-v15-0-3";
const ASSETS=["./","index.html","styles.css?v=15.0.3","environment.js?v=15.0.3","native-platform.js?v=15.0.3","config.js?v=15.0.3","place-registry.js?v=15.0.3","fishing-score.js?v=15.0.3","navigation.js?v=15.0.3","cloud-request.js?v=15.0.3","subscription-providers.js?v=15.0.3","ads-provider.js?v=15.0.3","auth.js?v=15.0.3","admin.js?v=15.0.3","app.js?v=15.0.3","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("message",e=>{if(e.data?.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.hostname.includes("open-meteo.com")||url.hostname.includes("smhi.se")||url.hostname.includes("workers.dev"))return;
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
