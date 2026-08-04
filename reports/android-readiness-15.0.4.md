# Android readiness – v15.0.4

Datum: 2026-08-04

## Teknisk status

- Toolchain: JDK/Javac 21.0.12, Gradle Wrapper 8.14.3, AGP 8.13.0 och Kotlin 2.0.21 fungerar tillsammans.
- Android SDK: Platform 36/36.1, Build Tools 36.0.0, Platform Tools, Command-line Tools och emulatorbinär finns. API 37 är installerat men används inte som target.
- Projekt: Capacitor Android 8.5.0, `applicationId`/`namespace` `se.vaderkompassen.app`, minSdk 24, compile/target 36.
- Release: versionName 15.0.4 och versionCode 15004. iOS är oförändrat på 15.0.3 build 5; Worker är oförändrad på 15.0.2.
- Debug APK: byggd, cirka 5,1 MB, `android/app/build/outputs/apk/debug/app-debug.apk`.
- Osignerad Release APK: byggd med lint, cirka 4,0 MB, `android/app/build/outputs/apk/release/app-release-unsigned.apk`.
- Osignerad Release AAB för strukturkontroll: byggd, cirka 3,7 MB, `android/app/build/outputs/bundle/release/app-release.aab`; `jarsigner` bekräftar att den är osignerad.
- Signerad AAB: MANUAL ACTION REQUIRED. Det avsedda kommandot stoppar tydligt när privat upload-signering saknas.

## Manifest, assets och säkerhet

- Merged Release-manifest visar version 15.0.4/15004, minSdk 24, target 36 och endast INTERNET, ACCESS_NETWORK_STATE, Billing samt bibliotekens signaturskyddade receiver-permission.
- Launch activity är enda avsiktligt exporterade appkomponenten. Auth-callback är avgränsad till `vaderkompassen://auth/callback`; FileProvider och Billing-aktiviteter är inte exporterade.
- Production APK innehåller `production`, `google_native` och `adsMode=disabled`; ingen localhost eller `manual_test` hittades.
- Google Play Billing 9.1.0 kompilerar efter att ett ogiltigt `setIncludeSuspendedSubscriptions`-anrop tagits bort. Suspenderad/expired/revoked status fortsätter att hämtas och verifieras server-side via Developer API/RTDN.
- R8/minify och resource shrinking är fortsatt avstängda under release freeze för att undvika oprövad Auth/Billing/Capacitor-regression.
- Adaptive launcher icons finns för v26 och monochrome-lager för v33. Play-ikonen `icon-512.png` är 512×512 utan alpha. Launcher foreground är korrekt densitetsresurs med alpha. Splashassets är RGB och högsta porträttasset är 1280×1920.
- Ingen keystore, signinglösenord, service account-fil, service-role, farlig permission eller cleartextkonfiguration får finnas i Git. Upload-signering läses endast från privat Gradle-konfiguration/miljö.

## Auth, Billing och livscykel

- Supabase måste tillåta exakt `vaderkompassen://auth/callback` plus separat PWA-redirect. Registrering, verifieringsmail, login/logout, reset, OAuth, session expiry och fysisk callback återstår enhetstest.
- Befintlig nativegräns pausar polling i bakgrunden, hanterar resume/nätverksbyte och återanvänder forecast/coalescing. Process recreation, Android back och dubbel callback återstår manuell emulator/enhetstest.
- ProductDetails, lokaliserat pris, base plan/offer, köp, user cancelled, pending, backendverifiering, acknowledgement, restore/sync och manage finns i kod. Verkliga Play-resultat kräver licenstestare och Play-installerad Internal Testing-build.
- Premium ges aldrig av klientens köpstatus; central serververifierad entitlement är sanningskälla.

## Manuella blockerare

- Emulator: BLOCKED för körtest eftersom ingen systemimage är installerad och ingen emulator är startad. Installera API 36-image i Android Studio.
- Fysisk enhet: MANUAL ACTION REQUIRED eftersom ingen adb-enhet är ansluten.
- Signerad AAB: MANUAL ACTION REQUIRED tills upload key och fyra privata `VADERKOMPASSEN_UPLOAD_*`-värden finns lokalt.
- Internal Testing: MANUAL ACTION REQUIRED tills Play App Signing, app, testlista, produkt/base plan/offer, signerad AAB, Data Safety/IARC och release notes är konfigurerade.
- Google Billing: BLOCKED för godkännande tills Play Console/Internal Testing, Developer API, servicekonto och RTDN har verifierats.
- AdMob är inte aktiverat och inga test- eller produktionsannonser initieras.

## Kända risker

- Command-line Tools rapporterar att SDK XML v4 är nyare än den parser de använder. Builden passerar, men verktygen bör uppdateras i Android Studio före butiksladdning.
- Capacitors genererade Cordova-modul använder `flatDir`; detta är en Gradle-varning men ingen buildblockerare.
- Monochrome-ikonen återanvänder befintligt foreground-lager och bör granskas visuellt på Android 13+.
- Edge-to-edge, systemfält, tangentbord, TalkBack, stor text, telefon/surfplatta, kartappar, offline och back-navigation kräver emulator/fysisk enhet.
- Topo GPS förblir avstängt eftersom verifierat dokumenterat URL-format saknas; Google Maps och HTTPS-webbfallback behålls.

## Automatiska kontroller

- `npm ci`: godkänd med befintlig lockfil; endast rotversionen ändrades från 15.0.3 till 15.0.4.
- JavaScript-syntax: godkänd.
- Tester: 106/106 godkända.
- Versionssynk, production-config, webbbygge och Capacitor Android-sync: godkända.
- Debug `assembleDebug`: godkänd.
- Release `assembleRelease` inklusive lint vital: godkänd.
- Osignerad `bundleRelease` för AAB-strukturkontroll: godkänd.
- Det publika `android:bundle:release`: förväntat stopp vid `verifyReleaseSigning` eftersom privata upload-uppgifter saknas.
- Release- och Androidsäkerhetskontroller samt `git diff --check`: godkända.
- Ingen diff finns i iOS, Worker/backend, poäng-, ranking-, platsregister- eller navigationslogik.

## Slutsats

Källprojektet är buildbart för Debug och osignerad Release, production-assets och manifest är verifierade och signingflödet failar säkert utan hemligheter. v15.0.4 är inte READY för Google Play förrän signerad AAB och hela Internal Testing-/Billingmatrisen har genomförts. Ingen commit, push, deploy eller Play-uppladdning ingår i denna rapport.
