# Android setup – v15.0.4

## Verktyg

Installera Android Studio, JDK 21 och följande via SDK Manager: Android SDK Platform 36, Build Tools 36.0.0, Platform Tools, Command-line Tools och Android Emulator. En API 36-systemimage behövs för emulator. API 37 får vara installerat men projektet ska fortsatt kompilera och targeta 36.

Sätt `JAVA_HOME` till JDK 21 och `ANDROID_SDK_ROOT` eller `ANDROID_HOME` till Android SDK. Android Studio kan skriva den lokala SDK-sökvägen i `android/local.properties`; filen får inte committas. Kontrollera miljön med:

```bash
npm ci
npm run check:android-toolchain
npm run android:sync
npm run android:build:debug
npm run android:build:release-check
```

`android:sync` bygger alltid paketerade production-assets med `google_native`. Lokal live reload är separat och får bara använda `VK_ENVIRONMENT=development` samt en explicit localhost-adress. Releasekontrollen avvisar localhost, `manual_test` och annan prenumerationsprovider.

## Android Studio och emulator

Kör `npm run android:open`, låt Gradle Sync slutföras och välj en API 36-telefon. Testa appstart, forecast, Free/Premium-UI, login/logout, callback, karta, profil, support/legal, offline, resume och systemets bakåtknapp. Kontrollera både gestnavigation, treknappsnavigation, tangentbord, stor text och olika skärmstorlekar. Billing kan inte slutverifieras i en lokalt installerad APK; använd Internal Testing.

## Fysisk enhet

Aktivera Developer Options och USB debugging, anslut enheten, godkänn RSA-dialogen och kontrollera `adb devices`. Kör `npm run android:install:debug`. Testa deeplink med `adb shell am start -a android.intent.action.VIEW -d 'vaderkompassen://auth/callback' se.vaderkompassen.app` utan att dokumentera enhets-ID.

Supabase Auth måste tillåta exakt `vaderkompassen://auth/callback` för registreringsverifiering, lösenordsåterställning och OAuth. Webbadressen ska ligga kvar separat för PWA. Capacitors `singleTask`-activity och gemensamma callbackhantering förhindrar dubbla appinstanser; verifiera ändå att callback inte startar dubbla prognos- eller entitlementsynkar.

## Release och AAB

`npm run android:build:release-check` bygger en osignerad Release APK för källkontroll. Konfigurera därefter upload key enligt `ANDROID_SIGNING.md` och kör `npm run android:bundle:release`. Signerad AAB hamnar i `android/app/build/outputs/bundle/release/app-release.aab` och får aldrig committas.

Projektidentitet: `se.vaderkompassen.app`, minSdk 24, compile/target SDK 36, versionName 15.0.4 och versionCode 15004. R8/resource shrinking är avstängt under release freeze tills Auth, Billing och Capacitor har testats via Internal Testing.
