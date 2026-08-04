import {execFileSync} from "node:child_process";
let output="";try{output=execFileSync("xcodebuild",["-project","ios/App/App.xcodeproj","-scheme","App","-configuration","Release","-showBuildSettings"],{encoding:"utf8",stdio:["ignore","pipe","pipe"]})}catch(error){console.error(`Archive check BLOCKED: ${String(error.stderr||error.message).trim()}`);process.exit(1)}
const checks=[
  [/PRODUCT_BUNDLE_IDENTIFIER = se\.vaderkompassen\.app/,"Bundle ID"],[/MARKETING_VERSION = 15\.0\.3/,"Marketing version"],[/CURRENT_PROJECT_VERSION = 5/,"buildnummer"],[/IPHONEOS_DEPLOYMENT_TARGET = 15\.0/,"deployment target"],[/CODE_SIGN_STYLE = Automatic/,"automatisk signing"]
];
const failed=checks.filter(([pattern])=>!pattern.test(output)).map(([,label])=>label);if(failed.length){console.error(`Archive check BLOCKED: ${failed.join(", ")}`);process.exitCode=1}else console.log("Archive-konfiguration OK. Riktig Archive/Validate kräver lokalt Apple Team och signing.");
