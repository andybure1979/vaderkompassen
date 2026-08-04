# iOS setup – v15.0.3

## Projektstatus

- Xcodeprojekt: `ios/App/App.xcodeproj`, scheme `App`, Swift Package Manager.
- Bundle ID: `se.vaderkompassen.app`; display name: Väderkompassen.
- iOS 15+, Swift 5, iPhone. iPad är avsiktligt inte en target innan layouten är separat godkänd.
- Marketing version 15.0.3, build 5.
- StoreKit 2 finns, men App Store Server API/Sandbox måste fortfarande verifieras enligt `STOREKIT.md`.

## Verktyg och reproducerbar build

1. Installera full Xcode från App Store, öppna den en gång och acceptera licensen.
2. Installera en iOS Simulator runtime i Xcode → Settings → Platforms.
3. Kontrollera `xcode-select -p`. Vid behov kör Andreas själv `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.
4. Kör `npm ci`, `npm run check:ios-toolchain` och `npm run ios:sync`.
5. Kör `npm run ios:build:simulator` och `npm run ios:build:release-check`.
6. Öppna med `npm run ios:open`. Projektet använder SPM; CocoaPods behövs inte.

Release-sync bygger alltid production-assets med `apple_native`. Ingen localhost, `manual_test`, testannons eller stagingendpoint tillåts av releasekontrollerna.

## Signing och fysisk iPhone

I Xcode: välj target App → Signing & Capabilities, välj Andreas Team och behåll Automatically manage signing. Kontrollera bundle-ID. Anslut och lita på telefonen, välj den som destination och kör. Certifikat, provisioning profiles, enhets-ID, `.p12`, `.p8` och Apple-lösenord får aldrig läggas i Git.

In-App Purchase kräver ingen privat entitlementfil i repot. Lägg inte till Push, Background Modes, Keychain Sharing, Associated Domains eller Sign in with Apple innan motsvarande funktion faktiskt används. Deeplink använder URL-schemat `vaderkompassen://auth/callback`.

## Supabase Auth

Lägg exakt `vaderkompassen://auth/callback` i Supabase Auth Redirect URLs för relevant miljö. Testa registrering, verifieringsmail, login/logout, lösenordsreset, extern Browser-återgång, session persistence/expiry och att callback inte startar dubbla prognos- eller entitlementsynkar.

## Simulator och StoreKit

Ingen lokal `.storekit`-fil är committad. Skapa den vid behov i Xcode och välj den endast i en lokal Debug-scheme. Det är ett UI-/livscykeltest, aldrig bevis för riktig App Store-verifiering. Riktigt Sandboxköp kräver App Store Connect-produkten och servercredentials.

## Archive och Validate

1. Kör `npm run ios:sync`, `npm run check:production-config`, `npm run security:ios-release-check` och `npm run ios:archive-check`.
2. Välj Any iOS Device (arm64) och Product → Archive.
3. Öppna Organizer → Validate App. Lös alla blockerande signing-, ikon-, privacy- och capabilityfel.
4. Först efter separat godkännande: Distribute App → App Store Connect → Upload.

Senare CI kan använda App Store Connect API key och GitHub Environment-secrets eller `match`. Ingen CI-signering eller uppladdning är aktiverad nu.
