import {cp,mkdir,readFile,rm,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
const files=["index.html","styles.css","place-registry.js","app.js","auth.js","admin.js","cloud-request.js","config.js","environment.js","native-platform.js","ads-provider.js","fishing-score.js","navigation.js","subscription-providers.js","manifest.webmanifest","sw.js","icon-180.png","icon-192.png","icon-512.png"];
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const file of files)await cp(resolve(root,file),resolve(dist,file));
for(const directory of ["support","privacy","terms","delete-account"])await cp(resolve(root,"public",directory),resolve(dist,directory),{recursive:true});
await cp(resolve(root,"public/legal.css"),resolve(dist,"legal.css"));
await mkdir(resolve(dist,"vendor/leaflet/images"),{recursive:true});
await cp(resolve(root,"node_modules/leaflet/dist/leaflet.css"),resolve(dist,"vendor/leaflet/leaflet.css"));
await cp(resolve(root,"node_modules/leaflet/dist/leaflet.js"),resolve(dist,"vendor/leaflet/leaflet.js"));
await cp(resolve(root,"node_modules/leaflet/dist/images"),resolve(dist,"vendor/leaflet/images"),{recursive:true});
await mkdir(resolve(dist,"vendor/supabase"),{recursive:true});
await cp(resolve(root,"node_modules/@supabase/supabase-js/dist/umd/supabase.js"),resolve(dist,"vendor/supabase/supabase.js"));
const name=process.env.VK_ENVIRONMENT||"production";
if(!["development","staging","production"].includes(name))throw new Error(`Ogiltig VK_ENVIRONMENT: ${name}`);
const publicConfig={name,debug:name==="development",apiBaseUrl:process.env.VK_PUBLIC_WORKER_URL||undefined,supabaseUrl:process.env.VK_PUBLIC_SUPABASE_URL||undefined,supabaseAnonKey:process.env.VK_PUBLIC_SUPABASE_ANON_KEY||undefined,subscriptionMode:process.env.VK_SUBSCRIPTION_MODE||(name==="development"?"manual_test":"disabled"),adsMode:process.env.VK_ADS_MODE||(name==="production"?"disabled":"placeholder")};
for(const key of Object.keys(publicConfig))if(publicConfig[key]===undefined)delete publicConfig[key];
await writeFile(resolve(dist,"environment.js"),`window.VK_ENVIRONMENT=Object.freeze(${JSON.stringify(publicConfig)});\n`);
const html=(await readFile(resolve(dist,"index.html"),"utf8"))
  .replace("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css","vendor/leaflet/leaflet.css")
  .replace("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js","vendor/leaflet/leaflet.js")
  .replace("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2","vendor/supabase/supabase.js");
if(!html.includes("environment.js")||!html.includes("native-platform.js")||/unpkg|jsdelivr/.test(html))throw new Error("Native index saknar lokal runtimegrund");
await writeFile(resolve(dist,"index.html"),html);
console.log(`Byggde ${files.length} tillåtna webbassets och lokala bibliotek i dist/ för ${name}.`);
