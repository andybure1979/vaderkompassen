# Native setup – v14.5.0 Release Candidate

- App-ID/bundle-ID: `se.vaderkompassen.app`.
- Version: `14.5.0`; iOS build `2`; Android versionCode `14500`.
- Production-build ska använda `VK_SUBSCRIPTION_MODE=disabled` och `VK_ADS_MODE=disabled` tills verkliga providers, backendverifiering och samtycke är klara.
- iOS archive kräver lokalt Apple Team/signing. Android release-AAB kräver `VK_ANDROID_KEYSTORE_PATH` och tillhörande lokala miljövariabler. Inget signingmaterial får committas.
- Kör releasekontrollerna och följ `RELEASE_CHECKLIST.md`, `STORE_SUBSCRIPTIONS.md` och `STORE_ASSETS.md`.

## Status och verktyg

Väderkompassen använder Capacitor 8.5.0 med Node 22+ och lokalt paketerade webbassets i `dist/`. Projektet använder iOS 15+, Xcode 26+, Swift Package Manager, Android minSdk 24, compile/target SDK 36 och Android Studio 2025.2.1+.

Installerade officiella plugins: App för livscykel/deeplinks, Browser för OAuth, Device för framtida diagnostik, Network för anslutningsstatus, Preferences för lätt lagring/Auth-adapter, Splash Screen och Status Bar. Inga köp- eller AdMob-plugins är installerade: bryggorna är tydliga stubbar tills plugin, produkter och backendverifiering är godkända.

## Miljöer

Kopiera aldrig riktiga hemligheter till Git. Utgå lokalt från `.env.development.example`, `.env.staging.example` eller `.env.production.example` och exportera värden i byggmiljön. Endast publika Supabase anon-nycklar får paketeras. `VK_NATIVE_DEV_SERVER` accepteras bara i `development` och bara för localhost/127.0.0.1. Production innehåller alltid lokala `dist/`-filer och ingen fjärrwebbplats.

- development: dev Worker/Supabase, `manual_test`, placeholders och debug.
- staging: staging Worker/Supabase, framtida Apple Sandbox/Play-test och placeholders.
- production: production Worker/Supabase, köp och annonser avstängda tills de aktiveras separat.

## Vanliga kommandon

```bash
npm ci
npm run build:web
npm run cap:sync
npm run cap:ios
npm run cap:android
npm run build:android:debug
npm run build:android:bundle
npm run version:check
```

`build:web` rensar `dist/`, kopierar endast tillåtna runtimefiler och paketerar Leaflet/Supabase lokalt. Dokumentation, tester, migrationer, `.env`, Git och `node_modules` följer inte med. Service worker används på webb/PWA men registreras inte inne i Capacitor, vilket undviker dubbla cachelager.

## Apple

1. Gå med i Apple Developer Program.
2. Registrera Bundle ID `se.vaderkompassen.app`.
3. Skapa appen i App Store Connect med version 14.5.0 och stigande buildnummer.
4. Installera Xcode 26 eller senare och öppna `ios/App/App.xcodeproj`.
5. Välj Andreas Apple Developer Team under Signing & Capabilities. Inga certifikat/provisioningprofiler ska läggas i Git.
6. Kontrollera iPhone/iPad, rotation, safe area, status bar, splash och den slutliga 1024×1024-ikonen.
7. Lägg `vaderkompassen://auth/callback` i Supabase Auth redirect allowlist. Konfigurera senare Universal Links och Associated Domains innan publikt OAuth-flöde.
8. Testa registrering, verifieringslänk, OAuth, lösenordsåterställning, bakgrund/återgång och externa kartlänkar på simulator och fysisk enhet.
9. När StoreKit-provider valts: skapa abonnemangsgrupp/produkt `se.vaderkompassen.premium.monthly`, avtal, skatt och bankuppgifter; testa Sandbox och backendverifiering innan `apple_native` aktiveras.
10. Skapa framtida AdMob iOS-app/testenheter innan någon AdMob-plugin aktiveras.
11. Välj Generic iOS Device, kör Product → Archive, Validate App och Distribute App till TestFlight.
12. Fyll i App Privacy, kontoborttagning, reviewkontakt och testkonto i App Store Connect.

## Google Play

1. Installera Android Studio 2025.2.1+ med SDK 36 och JDK 21.
2. Skapa Play Console-app med package name `se.vaderkompassen.app` och aktivera Play App Signing.
3. Öppna katalogen `android/` i Android Studio och testa telefon samt surfplatta.
4. Lägg `vaderkompassen://auth/callback` i Supabase redirect allowlist. Lägg senare till verifierad Android App Link när webbdomän och `assetlinks.json` finns.
5. Skapa upload key lokalt och sätt `VK_ANDROID_KEYSTORE_PATH`, `VK_ANDROID_KEYSTORE_PASSWORD`, `VK_ANDROID_KEY_ALIAS`, `VK_ANDROID_KEY_PASSWORD`. Keystore och lösenord får aldrig läggas i Git.
6. Kör `npm run build:android:bundle`; resultatet får laddas upp till Internal Testing först efter ikon-, Auth- och dataskyddskontroll.
7. Skapa senare abonnemangsprodukten `premium_monthly`, licenstestare och backendverifiering/RTDN innan `google_native` aktiveras.
8. Skapa framtida AdMob Android-app och endast officiella testannonsenheter före pluginaktivering.
9. Fyll i Data safety: konto/e-post, appinställningar och prenumerationsstatus; ingen plats, kamera eller fillagringsbehörighet används.

## Supabase

1. Kör `supabase/migrations/20260802_1440_account_deletion.sql`.
2. Lägg till `vaderkompassen://auth/callback` som tillåten redirect-URL i development/staging/production.
3. Kontrollera Site URL och webredirect separat så PWA-flödet fortsätter fungera.
4. Kontrollera Apple/Google Auth-provider och respektive callbackinställningar.
5. Testa `delete_own_account('RADERA')` efter ny inloggning. Funktionen kräver inloggning inom 15 minuter, raderar auth/profil och behåller endast pseudonymiserad minimal butiksrevision.
6. Kontoborttagning avslutar aldrig Apple/Google-abonnemang; användaren informeras om separat butikshantering.
7. Backendverifiering är fortsatt enda sanningskälla för framtida köp-entitlement.

## Cloudflare

1. Kontrollera production Worker URL och att `/health` visar 14.4.0 efter framtida deploy.
2. Native WebView-anrop kan sakna vanlig webb-Origin. Verifiera CORS mot verkliga iOS-/Androidbyggen; bredda aldrig till osäkra adminanrop.
3. Använd Workers Paid för snapshot/ranking-cronens CPU-marginal.
4. Behåll service-role och övriga Worker-secrets endast i Cloudflare.

## CI och GitHub Environments

Workflows bygger web/Worker, Android debug och osignerad iOS simulator. Skapa GitHub Environments `development`, `staging`, `production`. Framtida secrets kan omfatta publika miljövärden, Android signing och Apple/App Store Connect-credentials, men produktionsupload är inte aktiverad i v14.5.0.

## Kvar före butiksdistribution

- Full Xcode 26-build, simulator och fysisk iOS-enhet.
- Android Studio/SDK 36/JDK-build och fysisk Android-enhet.
- Slutliga högupplösta Väderkompassen-ikoner/splash; nuvarande nativebilder är debugplatshållare.
- Verifierade Universal/App Links för publikt flöde.
- Val, säkerhetsgranskning och sandbox-test av köpplugin samt serververifiering.
- Val och test av AdMob-plugin/testannonser; inga annonser initieras nu.
- Butiksavtal, privacy/data safety, screenshots, texter, reviewkonto och signering.
