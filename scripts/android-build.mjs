import {execFileSync} from "node:child_process";
import {existsSync,readFileSync,statSync} from "node:fs";
import path from "node:path";

const mode=process.argv[2]||"debug",root=new URL("../",import.meta.url).pathname,gradle=path.join(root,"android/gradlew");
const environmentText=readFileSync(path.join(root,"dist/environment.js"),"utf8");
const match=environmentText.match(/Object\.freeze\((\{.*\})\)/s),environment=match?JSON.parse(match[1]):null;
if(!environment||environment.name!=="production"||environment.subscriptionMode!=="google_native"||/manual_test|localhost|127\.0\.0\.1/i.test(environmentText))throw new Error("Android-builden innehåller inte rena google_native production-assets.");
const tasks={debug:["assembleDebug"],release:["assembleRelease"],bundle:["verifyReleaseSigning","bundleRelease"]};
if(!tasks[mode])throw new Error(`Okänt Android-buildläge: ${mode}`);
execFileSync(gradle,tasks[mode],{cwd:path.join(root,"android"),stdio:"inherit"});
if(mode==="bundle"){
  const aab=path.join(root,"android/app/build/outputs/bundle/release/app-release.aab");
  if(!existsSync(aab))throw new Error("Signerad AAB skapades inte på förväntad plats.");
  execFileSync("jarsigner",["-verify","-strict",aab],{stdio:"inherit"});
  console.log(`Signerad AAB: ${aab} (${statSync(aab).size} bytes)`);
}
