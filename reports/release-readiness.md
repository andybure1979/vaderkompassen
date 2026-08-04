# Väderkompassen v15.0.0 – Release readiness

Samlad status: **BLOCKED för TestFlight, Google Internal Testing och publik produktion**.

| Område | Status | Bevis/nästa steg |
|---|---|---|
| Releasebas | READY | `codex/v15.0.0-production-release` utgår från `66989a7`; `main` och `origin/main` var identiska. |
| Webb, Worker och versioner | READY lokalt | 15.0.0, iOS build 3, Android versionCode 15000; webbbuild, versionssynk och Worker dry-run passerar. |
| Produktions-Worker | MANUAL ACTION REQUIRED | Produktion kör fortfarande 14.5.0 tills en senare godkänd deploy sker. Ingen deploy ingår i denna granskning. |
| Snapshot och 1 000 platser | MANUAL ACTION REQUIRED | Snapshot 1369 täcker 1 000/1 000, 0 fallback och 0 batchfel. Tre schemalagda körningar i följd måste verifieras med Admin/Cloudflare-historik. |
| StoreKit/Play Billing | BLOCKED | Native providers, restore/manage, backendverifiering och servernotiser saknas. |
| AdMob och samtycke | BLOCKED | Endast lokala platshållare finns; AdMob-ID:n, SDK och CMP saknas. |
| Nativebyggen/signering | BLOCKED | Full Xcode är inte installerad/vald och lokal Java Runtime saknas. Signering och signerade paket måste göras externt. |
| Juridik och portaler | MANUAL ACTION REQUIRED | HTTPS-sidor svarar 200, men nya texter måste publiceras, juridiskt granskas och portalformulär fyllas i. |
| Butiksassets och reviewkonton | MANUAL ACTION REQUIRED | Skärmbilder, Play feature graphic, signing och separata reviewkonton återstår. |

## Kontroller 2026-08-03

- `npm ci`: godkänd; 150 paket installerades från befintlig lockfil.
- `npm test`: **88/88** godkända.
- `validate:places`: **500 Free + 500 Premium = 1 000 aktiva**.
- `check:versions`, `check:production-config`, `security:release-check`, `build:web`, `git diff --check`: godkända.
- `cap sync ios/android`: godkänd. iOS plist och privacy manifest: godkända.
- `check:store-compliance`: 5 complete, 14 manual action required, 5 blocked; releasen stoppas korrekt.
- Begränsat varmt produktionstest: 10/10 svar, p50 61 ms, p95/p99 85 ms, 10 cache HIT, 0 Supabase-anrop, 26 928 byte i genomsnitt.
- Free-region: 75 av 218 rader, 36 841 byte över nätet, Cache HIT, 0 Supabase-anrop. `If-None-Match` gav 304.
- Android debug/release/AAB: BLOCKED av saknad Java Runtime.
- iOS simulator/archive: BLOCKED av saknad full Xcode.

Den fullständiga 32-punktsrapporten finns i `docs/RELEASE_REPORT_15.0.0.md`.
