# iOS readiness – v15.0.3

Datum: 2026-08-03

## Tekniskt i repo

- Capacitor/iOS 8.5.0, Xcodeprojekt + Swift Package Manager, iOS 15 och Swift 5.
- Bundle-ID `se.vaderkompassen.app`, iPhone-target, version 15.0.3, build 5.
- Production-sync med `apple_native`; localhost/manual_test/testannonser stoppas av kontroller.
- Toolchain-, simulator-, osignerad device/release-, archive- och signing-/secretkontroller.
- Info.plist med callback, HTTPS-only och export-complianceflagga; privacy manifest med UserDefaults CA92.1.
- 1024×1024 App Store-ikon utan alpha och 2732×2732 splashassets.

## Verifiering 2026-08-03

- `npm ci`: godkänd med befintlig `package-lock.json`.
- Automatiska tester: 103/103 godkända.
- Versionssynk, produktionskonfiguration, webbbygge och Capacitor-sync: godkända.
- Info.plist och PrivacyInfo.xcprivacy: giltiga plist-filer.
- Release- och iOS-secretskontroller: godkända; inga privata Apple-nycklar eller breda ATS-undantag hittades.
- Xcode 26.6 (build 17F113) hittades via fullständig Xcode-installation.
- Simulatorbygge: godkänt för generisk iOS Simulator.
- Osignerat device/release-bygge: godkänt för generisk iOS-enhet; Xcodes Store-valideringssteg passerade för den osignerade appen.
- Archive-konfiguration: godkänd för Bundle-ID `se.vaderkompassen.app`, version 15.0.3, build 5, iOS 15 och automatisk signering.
- `npm audit --omit=dev`: kunde inte genomföras eftersom npm-registret inte var nåbart från körmiljön (`ENOTFOUND registry.npmjs.org`).

Källkoden kompilerar därmed för både simulator och iPhone Release. Ett signerat `.xcarchive`, App Store Connect Validate och installation på fysisk enhet återstår som manuella Apple-steg.

## Externa steg

- Andreas väljer Apple Team och Automatically manage signing i Xcode.
- Fysisk iPhone, StoreKit Sandbox, Archive, Validate och manuell TestFlight-upload måste genomföras.
- TestFlight är inte READY förrän build 5 processats och installerats av intern testare.

Topo GPS-länk är fortsatt avstängd eftersom något verifierat URL-schema inte finns dokumenterat. Apple Maps och Google Maps använder HTTPS-länkar. Ingen lokal `.storekit`-konfiguration har committats; App Store Connect/Sandbox är sanningskällan för sluttesterna.

Ingen certifikat-, provisioning-, `.p12`-, `.p8`- eller Apple-kontodata ska committas. Ingen commit, push, deploy, Archive-upload eller TestFlight-publicering ingår i denna implementation.
