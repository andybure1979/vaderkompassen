import {execFileSync} from "node:child_process";
import fs from "node:fs";
const failures=[],warnings=[];
const run=(command,args=[])=>{try{return execFileSync(command,args,{encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim()}catch(error){failures.push(`${command} ${args.join(" ")}: ${String(error.stderr||error.message).trim()}`);return ""}};
if(process.platform!=="darwin")failures.push("iOS-build kräver macOS.");
const developer=run("xcode-select",["-p"]);if(developer&&!/Xcode\.app\/Contents\/Developer$/.test(developer))failures.push(`xcode-select pekar inte på full Xcode: ${developer}`);
const version=run("xcodebuild",["-version"]);if(version&&!/^Xcode\s+(\d+)/.test(version))failures.push("Xcode-versionen kunde inte läsas.");
const simctl=run("xcrun",["simctl","list","runtimes","available"]);if(!/iOS/i.test(simctl))failures.push("Ingen tillgänglig iOS Simulator runtime hittades. Installera i Xcode → Settings → Components.");
if(!fs.existsSync(new URL("../ios/App/App.xcodeproj/project.pbxproj",import.meta.url)))failures.push("iOS Xcode-projektet saknas.");
const pkg=JSON.parse(fs.readFileSync(new URL("../package.json",import.meta.url),"utf8"));if(pkg.dependencies?.["@capacitor/ios"]!=="8.5.0")failures.push("Förväntad Capacitor iOS 8.5.0 saknas.");
if(failures.length){console.error("iOS toolchain BLOCKED");failures.forEach(item=>console.error(`- ${item}`));console.error("Välj vid behov full Xcode manuellt: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer");process.exitCode=1}
else{console.log(`iOS toolchain OK: ${version.replace(/\n/g,", ")}; ${developer}`);warnings.forEach(item=>console.warn(`MANUAL ACTION REQUIRED: ${item}`))}
