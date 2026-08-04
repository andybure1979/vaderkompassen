import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");

test("Android releaseidentitet, SDK och buildnummer är synkade",()=>{
  const gradle=read("android/app/build.gradle");
  assert.match(gradle,/namespace = "se\.vaderkompassen\.app"/);assert.match(gradle,/applicationId "se\.vaderkompassen\.app"/);
  assert.match(gradle,/versionName "15\.0\.5"/);assert.match(gradle,/versionCode 15005/);
  const vars=read("android/variables.gradle");assert.match(vars,/minSdkVersion = 24/);assert.match(vars,/compileSdkVersion = 36/);assert.match(vars,/targetSdkVersion = 36/);
});
test("Androidmanifestet har endast nödvändiga permissions och avgränsad deeplink",()=>{
  const manifest=read("android/app/src/main/AndroidManifest.xml");
  assert.deepEqual([...manifest.matchAll(/uses-permission android:name="([^"]+)"/g)].map(m=>m[1]).sort(),["android.permission.ACCESS_NETWORK_STATE","android.permission.INTERNET"]);
  assert.match(manifest,/android:scheme="vaderkompassen" android:host="auth" android:path="\/callback"/);
  assert.doesNotMatch(manifest,/usesCleartextTraffic|ACCESS_FINE_LOCATION|CAMERA|RECORD_AUDIO/);
});
test("signering läses utanför Git och signerad bundle kräver komplett konfiguration",()=>{
  const gradle=read("android/app/build.gradle"),ignore=read("android/.gitignore"),scripts=read("package.json");
  assert.match(gradle,/VADERKOMPASSEN_UPLOAD_STORE_FILE/);assert.match(gradle,/verifyReleaseSigning/);
  assert.match(ignore,/\*\.jks/);assert.match(ignore,/google-services\.json/);
  assert.match(scripts,/security:android-release-check/);assert.match(scripts,/android:bundle:release/);
});
