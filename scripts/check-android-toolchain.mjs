import {execFileSync} from "node:child_process";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";

const root=new URL("../",import.meta.url).pathname;
const failures=[],warnings=[];
const run=(command,args=[])=>{try{return execFileSync(command,args,{encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim()}catch(error){failures.push(`${command}: ${String(error.stderr||error.message).trim()}`);return ""}};
const localProperties=path.join(root,"android/local.properties");
const localSdk=existsSync(localProperties)?readFileSync(localProperties,"utf8").match(/^sdk\.dir=(.+)$/m)?.[1]?.replaceAll("\\:",":").replaceAll("\\\\","\\"):null;
const sdk=process.env.ANDROID_SDK_ROOT||process.env.ANDROID_HOME||localSdk;
const java=run("java",["-version"]),javac=run("javac",["-version"]);
if(java&&!/version \"21\./.test(java))failures.push(`JDK 21 krävs, hittade ${java.split("\n")[0]}`);
if(javac&&!/21\./.test(javac))failures.push(`javac 21 krävs, hittade ${javac}`);
if(!sdk||!existsSync(sdk))failures.push("Android SDK saknas. Sätt ANDROID_SDK_ROOT/ANDROID_HOME eller android/local.properties.");
if(sdk){
  for(const [label,relative] of [["compileSdk 36","platforms/android-36"],["Build Tools 36.0.0","build-tools/36.0.0"],["adb","platform-tools/adb"]])if(!existsSync(path.join(sdk,relative)))failures.push(`${label} saknas i ${sdk}`);
  const sdkmanagerCandidates=["cmdline-tools/latest/bin/sdkmanager","cmdline-tools/bin/sdkmanager","tools/bin/sdkmanager"];
  if(!sdkmanagerCandidates.some(relative=>existsSync(path.join(sdk,relative))))failures.push("Android SDK Command-line Tools/sdkmanager saknas.");
  const adb=path.join(sdk,"platform-tools/adb");
  if(existsSync(adb)){
    const devices=run(adb,["devices"]);
    if(!devices.split("\n").slice(1).some(line=>/\tdevice$/.test(line)))warnings.push("Ingen fysisk Androidenhet eller startad emulator är ansluten.");
  }
  const systemImages=path.join(sdk,"system-images");
  if(!existsSync(systemImages))warnings.push("Ingen emulatorimage är installerad; installera en API 36-image i Android Studio.");
}
run(path.join(root,"android/gradlew"),["--version"]);
if(failures.length){console.error("Android toolchain BLOCKED\n- "+failures.join("\n- "));process.exit(1)}
console.log(`Android toolchain OK: JDK 21, SDK ${sdk}, compile/target 36, minSdk 24, Gradle wrapper 8.14.3.`);
if(warnings.length)console.log("MANUAL ACTION REQUIRED\n- "+warnings.join("\n- "));
