# StoreKit readiness – v15.0.1

Datum: 2026-08-03

## Resultat

Implementation finns för StoreKit 2, App Store Server API, App Store Server Notifications V2 och serverstyrd entitlement. Den är **inte godkänd för App Store-publicering** innan externa Apple- och Supabase-steg samt verkliga Sandbox-tester är genomförda.

- Tester: 94/94 godkända.
- Versionssynk: godkänd för webb, Worker och iOS 15.0.1; Android oförändrad på 15.0.0.
- Webbbygge och Capacitor iOS-sync: godkända.
- Swift-parser: godkänd.
- Full Xcode-build: blockerad eftersom endast Command Line Tools finns lokalt.
- Worker dry-run: godkänd, 1 537,49 KiB / gzip 216,25 KiB.
- Produktionsberoenden: 0 kända npm-sårbarheter.
- Utvecklingsberoenden: 3 måttliga varningar i Capacitor CLI → xcode → uuid. Automatisk åtgärd kräver brytande Capacitor-nedgradering och har inte körts.
- Store compliance: stoppar korrekt på Apple-konfiguration, Sandbox, signing och övriga kvarvarande butikskrav.

## Säkerhetsgräns

Klientens StoreKit-JWS används endast för att hitta transaktionen. Workern hämtar aktuell status från Apple och verifierar Apples JWS innan en service-role-skyddad RPC uppdaterar prenumerationen. Rå JWS och privata Apple-nycklar lagras inte. Fel produkt, fel miljö, fel app-ID/bundle-ID och koppling till annan användare nekas. Production kan inte konfigureras mot Sandbox.

## Externa blockerare

1. Skapa och godkänn produkten `se.vaderkompassen.premium.monthly` i App Store Connect.
2. Kör `20260803_1501_apple_storekit.sql` i testmiljön.
3. Sätt In-App Purchase-nyckel, issuer ID, private key och numeriskt Apple App-ID i Cloudflare.
4. Registrera Notifications V2-URL och verifiera ett signerat testmeddelande.
5. Bygg och typkontrollera i full Xcode med rätt signing.
6. Genomför hela Sandbox-matrisen i `docs/STOREKIT.md`.

Ingen commit, push, migration eller deploy har gjorts i denna verifiering.
