import {execFileSync} from "node:child_process";
import {readFile} from "node:fs/promises";

const files=execFileSync("git",["ls-files","--cached","--others","--exclude-standard","-z"],{encoding:"utf8"})
  .split("\0")
  .filter(file=>file&&!/(^|\/)\S.* 2(?:\.|\/)/.test(file)),failures=[];
const forbiddenExtensions=/\.(jks|keystore|p12|pfx|mobileprovision|cer|der)$/i;
for(const file of files){
  if(forbiddenExtensions.test(file))failures.push(`Privat signingfil är spårad: ${file}`);
  if(/(^|\/)google-services\.json$|(^|\/)GoogleService-Info\.plist$/.test(file))failures.push(`Privat tjänstekonfiguration är spårad: ${file}`);
  if(/\.(png|jpg|jpeg|gif|jar|gradle-wrapper\.jar)$/i.test(file))continue;
  let text="";try{text=await readFile(file,"utf8")}catch{continue}
  if(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s<]/.test(text)&&!/SUPABASE_SERVICE_ROLE_KEY\s*=\s*<|env\.SUPABASE_SERVICE_ROLE_KEY/.test(text))failures.push(`Möjlig service-role-hemlighet: ${file}`);
  if(/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))failures.push(`Privat nyckel: ${file}`);
  if(/https?:\/\/[^\s"']+:[^\s"']+@/.test(text))failures.push(`Credentials i URL: ${file}`);
  if(file!=="scripts/security-release-check.mjs"&&/test(account|konto).*(password|lösenord)\s*[:=]/i.test(text))failures.push(`Möjligt testkontolösenord: ${file}`);
}
if(failures.length){console.error("Release security BLOCKED");for(const failure of failures)console.error(`- ${failure}`);process.exitCode=1}else console.log(`Release security OK: ${files.length} releasefiler kontrollerade; inga privata nycklar, signingfiler eller testlösenord hittades.`);
