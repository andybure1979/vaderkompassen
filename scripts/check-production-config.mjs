import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url),read=file=>readFile(new URL(file,root),"utf8");
const [config,environment,capacitor,wrangler,worker]=await Promise.all([read("config.js"),read("environment.js"),read("capacitor.config.ts"),read("wrangler.jsonc"),read("cloudflare/src/index.js")]);
const failures=[];const check=(condition,message)=>{if(!condition)failures.push(message)};
check(/subscriptionMode:\s*environment\.subscriptionMode\|\|"disabled"/.test(config),"Klientens fallback för subscriptionMode måste vara disabled.");
check(/adsMode:\s*environment\.adsMode\|\|"placeholder"/.test(config),"Produktionswebben ska använda placeholder tills samtycke/AdMob är klart.");
check(/name:"production",debug:false/.test(environment),"Publik environment.js ska vara production med debug=false.");
check(!/localhost|127\.0\.0\.1/.test(config),"config.js innehåller development-URL.");
check(/environment==="development"/.test(capacitor),"Native devserver får endast aktiveras explicit i development.");
check(/"ALLOWED_ORIGINS":/.test(wrangler)&&!/"ALLOWED_ORIGINS":\s*"\*"/.test(wrangler),"Worker ska ha explicit CORS-allowlist.");
check(/allowedOrigin/.test(worker),"Worker ska validera request origin mot allowlist.");
check(/https:\/\/vaderkompassen\.andreas-bure\.workers\.dev/.test(config),"Produktions-Worker saknas.");
if(failures.length){console.error("Production config BLOCKED");for(const failure of failures)console.error(`- ${failure}`);process.exitCode=1}else console.log("Production config OK: production-endpoints, debug=false, köp avstängda och explicit CORS.");
