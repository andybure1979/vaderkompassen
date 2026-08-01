const CACHE="vaderkompassen-v14-1-0c";
const ASSETS=["./","index.html","styles.css?v=14.1.0c","config.js?v=14.1.0c","fishing-score.js?v=14.1.0c","navigation.js?v=14.1.0c","cloud-request.js?v=14.1.0c","auth.js?v=14.1.0c","app.js?v=14.1.0c","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("message",e=>{if(e.data?.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.hostname.includes("open-meteo.com")||url.hostname.includes("smhi.se")||url.hostname.includes("workers.dev"))return;
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
