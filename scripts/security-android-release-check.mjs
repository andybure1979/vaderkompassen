import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import path from "node:path";

const root=new URL("../",import.meta.url).pathname;
const files=execFileSync("git",["ls-files"],{cwd:root,encoding:"utf8"}).trim().split("\n").filter(Boolean);
const forbiddenFiles=files.filter(file=>/(^|\/)(google-services\.json|[^/]+\.(jks|keystore|p12|aab))$/i.test(file));
const textFiles=files.filter(file=>/\.(js|mjs|ts|java|gradle|xml|json|md|properties|yml|yaml|toml|html|css)$/i.test(file));
const findings=[];
for(const file of textFiles){
  const text=readFileSync(path.join(root,file),"utf8");
  if(/usesCleartextTraffic\s*=\s*["']true/i.test(text))findings.push(`${file}: cleartext traffic`);
  if(/android\.permission\.(ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|CAMERA|RECORD_AUDIO|READ_CONTACTS|WRITE_EXTERNAL_STORAGE|MANAGE_EXTERNAL_STORAGE)/.test(text))findings.push(`${file}: farlig Androidpermission`);
  if(/BEGIN (RSA |EC )?PRIVATE KEY|service_role\s*[:=]\s*["'][A-Za-z0-9_-]{20,}/i.test(text))findings.push(`${file}: privat nyckel/service-role`);
}
const gradle=readFileSync(path.join(root,"android/app/build.gradle"),"utf8"),manifest=readFileSync(path.join(root,"android/app/src/main/AndroidManifest.xml"),"utf8");
if(!/versionName "15\.0\.4"/.test(gradle)||!/versionCode 15004/.test(gradle))findings.push("Androidversionen är inte 15.0.4/15004");
if(!/applicationId "se\.vaderkompassen\.app"/.test(gradle)||!/namespace = "se\.vaderkompassen\.app"/.test(gradle))findings.push("applicationId/namespace är inkonsekvent");
if(!/android:scheme="vaderkompassen" android:host="auth" android:path="\/callback"/.test(manifest))findings.push("Auth-deeplink saknas");
if(forbiddenFiles.length)findings.push(`privata/genererade filer spåras: ${forbiddenFiles.join(", ")}`);
if(findings.length){console.error("Android release security BLOCKED\n- "+findings.join("\n- "));process.exit(1)}
console.log(`Android release security OK: ${files.length} spårade filer; inga signinghemligheter, farliga permissions, cleartextundantag eller service-role-värden hittades.`);
