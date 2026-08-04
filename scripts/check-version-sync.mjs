import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url),pkg=JSON.parse(await readFile(new URL("package.json",root),"utf8")),version=pkg.version;
const checks=[["index.html",`Väderkompassen v${version}`],["sw.js",`v${version.replaceAll(".","-")}`],["wrangler.jsonc",`\"APP_VERSION\": \"15.0.2\"`],["cloudflare/package.json",`\"version\": \"15.0.2\"`],["cloudflare/wrangler.toml",`APP_VERSION = \"15.0.2\"`],["capacitor.config.ts",`appId:\"se.vaderkompassen.app\"`],["ios/App/App.xcodeproj/project.pbxproj","MARKETING_VERSION = 15.0.6;"],["ios/App/App.xcodeproj/project.pbxproj","CURRENT_PROJECT_VERSION = 7;"],["android/app/build.gradle",`versionName \"${version}\"`],["android/app/build.gradle","versionCode 15006"]];
for(const [file,needle] of checks){const content=await readFile(new URL(file,root),"utf8");assert.ok(content.includes(needle),`${file} är inte synkad med ${version}`)}
console.log(`Versionssynk verifierad för ${version}.`);
