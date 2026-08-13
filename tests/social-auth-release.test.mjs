import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");

test("production visar inga Apple- eller Google-loginval",()=>{
  const html=read("index.html");
  assert.doesNotMatch(html,/appleLogin|googleLogin|Fortsätt med Apple|Fortsätt med Google/i);
});

test("production låser nya OAuth-inloggningar men behåller intern kompatibilitet",()=>{
  const auth=read("auth.js"),environment=read("environment.js"),build=read("scripts/build-web.mjs");
  assert.match(environment,/socialAuthEnabled:false/);
  assert.match(build,/socialAuthEnabled:name!=="production"/);
  assert.match(auth,/cfg\.name==="production"\|\|cfg\.socialAuthEnabled!==true/);
  assert.match(auth,/client\.auth\.signInWithOAuth/);
  assert.doesNotMatch(auth,/\$\("(?:appleLogin|googleLogin)"\)\?\.addEventListener/);
});
