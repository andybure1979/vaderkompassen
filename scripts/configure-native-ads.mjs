import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const platform=process.env.CAPACITOR_PLATFORM_NAME||process.argv[2]||"";
const environment=process.env.VK_ENVIRONMENT||"production";
const mode=process.env.VK_ADS_MODE||(environment==="staging"?"test":environment==="development"?"placeholder":"disabled");
const enabled=process.env.VK_ADS_ENABLED?process.env.VK_ADS_ENABLED==="true":environment==="staging";
const nativeAdsEnabled=enabled&&(mode==="test"||mode==="production");

if(platform!=="ios")process.exit(0);

const packagePath=resolve(root,"ios/App/CapApp-SPM/Package.swift");
const plistPath=resolve(root,"ios/App/App/Info.plist");
const resolvedPath=resolve(root,"ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved");
let swift=await readFile(packagePath,"utf8");
let plist=await readFile(plistPath,"utf8");
const packageDependency='        .package(name: "CapacitorCommunityAdmob", path: "../../../node_modules/@capacitor-community/admob"),\n';
const targetDependency='                .product(name: "CapacitorCommunityAdmob", package: "CapacitorCommunityAdmob"),\n';
const gadEntry=/\s*<key>GADApplicationIdentifier<\/key>\s*<string>[^<]*<\/string>/;

if(!nativeAdsEnabled){
  swift=swift.replace(packageDependency,"").replace(targetDependency,"");
  plist=plist.replace(gadEntry,"");
  const resolved=JSON.parse(await readFile(resolvedPath,"utf8"));
  resolved.pins=resolved.pins.filter(pin=>!String(pin.identity).startsWith("swift-package-manager-google-"));
  await writeFile(resolvedPath,`${JSON.stringify(resolved,null,2)}\n`);
}else{
  if(!swift.includes("CapacitorCommunityAdmob"))throw new Error("Capacitor sync saknar AdMob-pluginen för uttryckligt annonsläge");
  const appId=mode==="test"?"ca-app-pub-3940256099942544~1458002511":process.env.VK_ADMOB_IOS_APP_ID;
  if(!appId)throw new Error("Aktiverat iOS-annonsläge saknar app-ID");
  const entry=`\n\t<key>GADApplicationIdentifier</key>\n\t<string>${appId}</string>`;
  plist=gadEntry.test(plist)?plist.replace(gadEntry,entry):plist.replace("\n</dict>",`${entry}\n</dict>`);
}

await writeFile(packagePath,swift);
await writeFile(plistPath,plist);
console.log(nativeAdsEnabled?`iOS AdMob aktiverat för ${mode}.`:"iOS AdMob/UMP bortkopplat för annonsfri build.");
