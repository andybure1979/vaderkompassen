# Väderkompassen v14.5.0 – Release readiness

| Område | Status | Ansvarig/nästa steg | Miljö | TestFlight | Google Internal | Produktion |
|---|---|---|---|---|---|---|
| Kod, webbbuild, manifests | READY efter godkända tester | Codex/Andreas: verifiera slutrapport | Lokal | Nej | Nej | Nej |
| Privacy/villkor/support/delete-web | MANUAL ACTION REQUIRED | Andreas: juridisk granskning, publicera och verifiera HTTPS | Webb | Kan blockera review | Blockerar | Blockerar |
| Kontoborttagning i app | READY i kod | Andreas: end-to-end-test i production | Native/backend | Ja om ej testad | Ja om ej testad | Ja |
| App Privacy/Data Safety/age rating | MANUAL ACTION REQUIRED | Andreas fyller portalformulär; ange reklam korrekt | Portaler | Ja | Ja | Ja |
| StoreKit/Play Billing + backend | BLOCKED | Implementera/verifiera native providers, notiser och sandbox | Native/backend | Ja för subscription-review | Ja | Ja |
| Ads/samtycke | BLOCKED för riktiga annonser | Konfigurera CMP/AdMob och uppdatera deklarationer; placeholders tills dess | Native/portaler | Nej med placeholders | Kan blockera Free-affärsmodell | Ja |
| Signing/build | BLOCKED externt | Androidkontroll 2026-08-02 stoppad av saknad Java Runtime; iOS stoppad av saknad full Xcode. Andreas installerar JDK 21/Xcode och konfigurerar Apple Team/lokal keystore | Lokal/portaler | Ja | Ja | Ja |
| Ikoner/skärmbilder | MANUAL ACTION REQUIRED | Visuell kontroll, feature graphic, capture/godkänn | Portaler | Ja | Ja | Ja |
| Reviewkonton | MANUAL ACTION REQUIRED | Skapa Free och sandboxkonton; credentials endast i portal | Production/sandbox | Ja | Ja | Ja |
| Snapshot 1 000 platser | MANUAL ACTION REQUIRED | Kör/verifiera komplett snapshot efter deploy | Production | Funktionellt | Funktionellt | Ja |

Samlad status: **BLOCKED för publik produktion**. Kodunderlaget kan användas som RC för lokala osignerade kontroller, men ska inte beskrivas som butiksfärdigt innan blockerarna ovan är lösta.

## Lokal verifiering 2026-08-02

- 87/87 automatiska tester, JavaScript-syntax, versionssynk, platsvalidering, production-config och security check passerar.
- `npm ci`, production web build och `cap sync ios/android` passerar.
- iOS plist/privacy manifest är syntaktiskt giltiga. App Store-ikonen är 1024×1024 utan alpha; PWA/Play-kandidaten är 512×512 utan alpha.
- `check:store-compliance` returnerar avsiktligt exit 1 med fem blockerare.
- Android build kunde inte starta utan Java Runtime. iOS simulatorbuild kunde inte starta eftersom full Xcode inte är vald/installerad.
