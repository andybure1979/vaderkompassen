# Slutlig release-rapport – Väderkompassen v15.0.0

Datum: 2026-08-03
Samlad status: **BLOCKED**

Ingen commit, push, deploy eller butikspublicering har gjorts. Poäng, ranking, prognosmodeller och design är oförändrade.

## 1. Releasebas — READY

Gren `codex/v15.0.0-production-release` skapades från commit `66989a7` (`Merge korrekt totalt platsantal`). Vid start var `main` och `origin/main` identiska. Otrackade dubbletter med ` 2` i namnet flyttades återställningsbart till `/tmp/vaderkompassen-duplicates-vmhcwW` och ingår inte i diffen.

## 2. Ändrade filer — READY

Ändringarna är begränsade till versionsmetadata, native buildnummer, releasekontroller, butikstexter, juridiska/supportsidor och release-/driftdokumentation. `docs/ROLLBACK.md`, `docs/HOTFIX.md`, `docs/MONITORING.md`, `docs/RELEASE_FREEZE.md`, GitHub release notes och denna rapport har skapats. Ingen migration ingår.

## 3. Versionssynk — READY

Alla kontrollerade versioner är 15.0.0: package/package-lock, frontend, service worker-cache `vaderkompassen-v15-0-0`, Worker/wrangler, Cloudflare-paket, iOS marketing version och Android versionName. iOS build är 3 och Android versionCode 15000. `npm run check:versions` passerar.

## 4. Platsantal — READY

- Registrerade/aktiverade: 1 000/1 000; avstängda: 0; review pending: 0.
- Access: 500 Free och 500 Premium.
- Länder: Sverige 650, Norge 187, Danmark 163.
- Regioner: Fyn 20, Jylland 106, Mellansverige 217, Nord-Norge 40, Norra Sverige 167, Själland 37, Södra Sverige 266, Sørlandet 17, Trøndelag 18, Vestlandet 46, Østlandet 66.
- Områden: Agder 17, Akershus 9, Blekinge 14, Bohuslän 27, Bornholm 3, Buskerud 8, Dalarna 40, Dalsland 14, Finnmark 12, Fyn 20, Gotland 16, Gästrikland 10, Halland 21, Hovedstaden 13, Hälsingland 18, Härjedalen 15, Innlandet 21, Jämtland 24, Lappland 41, Medelpad 10, Midtjylland 37, Møre og Romsdal 12, Nordjylland 33, Nordland 17, Norrbotten 21, Närke 13, Oslo 1, Rogaland 11, Själland 21, Skåne 54, Småland 57, Svalbard 2, Syddanmark 36, Södermanland 29, Telemark 11, Troms 9, Trøndelag 18, Uppland 42, Vestfold 10, Vestland 23, Värmland 30, Västerbotten 19, Västergötland 50, Västmanland 25, Ångermanland 19, Öland 13, Östergötland 28, Østfold 6.
- Kategorier: boat 102, cinema 500, coast 83, cycling 360, fishing 299, general 818, hiking 34, indoorPool 500, skiing 17, surf 20.
- placeType: city 101, coast 21, fishing_water 180, protected_area 2, town 695, village 1.
- reviewStatus: verified 1 000.

Valideringen kontrollerar unika ID:n, koordinater, land/region/område, accessTier, kust/marine och verifierade surfspots.

## 5. Snapshotstatus — MANUAL ACTION REQUIRED

Publik `/v1/verify` visade snapshot 1369, version `snapshot-20260803T060157639Z`, genererad 2026-08-03 06:01:57 UTC: requested 1 000, fresh 1 000, fallback 0, available 1 000, failed batches 0. Kodtesterna verifierar att noll färska platser, ofullständig fallback och ofullständig täckning stoppas. Tre schemalagda produktionskörningar i följd har inte kunnat styrkas utan autentiserad körhistorik.

## 6. Leverantörsstatus — MANUAL ACTION REQUIRED

Senaste snapshoten visar inga leverantörs- eller batchfel och använder Open-Meteo-konfigurationen i Workern. Workers Paid-plan och avsedd leverantörskapacitet måste bekräftas i Cloudflare-kontot; inga kontoinställningar ändrades.

## 7. Free-status — READY i automatiska tester

Free får dag 1, en region, lokala inställningar, Free-platser och lokala annonsplatshållare. Manipulerad `access=premium` utan giltig session ger inte Premiumplatser. Full enhetsmatris återstår manuellt.

## 8. Premiumstatus — MANUAL ACTION REQUIRED

Central entitlement ger Trial, active, cancelled_active, VIP och Admin Premiumåtkomst; expired/revoked/ogiltig åtkomst blir Free. Automatiken verifierar dagar, regioner, platsåtkomst och reklamfrihet. Produktionstest med verklig Premiumsession och flera enheter återstår.

## 9. Apple-köpstatus — BLOCKED

StoreKit-provider, produktdata/pris, köp, restore, manage subscription, backendverifiering och App Store Server Notifications V2 saknas. Klienten kan inte själv sätta Premium och fabricerar inget Apple-köp.

## 10. Google-köpstatus — BLOCKED

Play Billing, base plan/offer, köp, restore/sync, manage subscription, backendverifiering, RTDN och Google Play Developer API saknas. Klienten fabricerar inget Google-köp.

## 11. Annonsstatus — BLOCKED

Endast `main_bottom_banner` och `ranking_inline_native` finns som lokala, märkta Free-platshållare. Ingen extern annons hämtas. AdMob app-/unit-ID:n, native plugin och CMP för EES/UK saknas; produktionsannonser ska därför förbli avstängda.

## 12. Auth-status — MANUAL ACTION REQUIRED

Automatiska tester täcker svensk felhantering, dubbelklicksskydd, sessionbaserad entitlement och att tokens/service-role inte exponeras. Registrering, verifieringsmejl, OAuth, reset, deeplinks, session expiry och blockerade konton måste testas end-to-end i varje produktionsklient.

## 13. Kontoborttagning — MANUAL ACTION REQUIRED

Kod och migration innehåller självbetjäning med ny autentisering, lokal rensning och minimal pseudonymiserad audit. Den externa HTTPS-sidan svarar 200 och förklarar att butiksköp hanteras separat. Produktionstest av hela raderingskedjan och juridisk granskning återstår.

## 14. Adminstatus — MANUAL ACTION REQUIRED

Tester verifierar serverkontroller, RLS, audit, VIP som separat entitlement, reason och skydd mot självlåsning. Admin kan inte fabricera butiksköp eller läsa hemligheter. Sökning, användardetalj, VIP, audit och health måste verifieras manuellt i production; sista-Admin-skyddet bör ingå i testet.

## 15. Worker-prestanda — READY för begränsad Free-verifiering

Varmt test med 10 samtidiga requests: 10/10 lyckade, p50 61 ms, p95/p99 85 ms, 10 HIT, 0 Supabase-anrop och 26 928 byte i genomsnitt. Ett Free-regionsvar gav 75/218 rader, 36 841 nätverksbyte, HIT, 0 Supabase-anrop och ETag; efterföljande request gav 304. Kall cache kräver separat load-test-token. Premiumscenarier kräver giltig användarsession. Faktisk Cloudflare CPU/coalescing och Workers Paid måste verifieras i dashboard.

## 16. iOS-build — BLOCKED

`cap sync ios`, Info.plist och PrivacyInfo.xcprivacy passerar. Projektet har bundle ID `se.vaderkompassen.app`, version 15.0.0/build 3 och target iOS 15. Simulatorbuild, osignerad build och archive kan inte köras eftersom endast Command Line Tools är vald; full Xcode och signing-team saknas.

## 17. Android-build — BLOCKED

`cap sync android` passerar. Projektet har applicationId `se.vaderkompassen.app`, versionName 15.0.0/versionCode 15000, minSdk 24 och target/compile SDK 36. Debug-, release- och AAB-build kan inte starta eftersom lokal Java Runtime saknas. Privat keystore ska förbli utanför Git.

## 18. Webbbuild — READY

`npm run build:web` byggde 19 tillåtna production-assets i `dist/`. Service worker och cache är 15.0.0, production-konfigurationen har explicita endpoints/CORS och köp/annonser är fail-closed. Deploy har inte gjorts.

## 19. Juridiska sidor — MANUAL ACTION REQUIRED

Support, privacy, terms och delete-account svarade HTTP 200 över HTTPS. Lokala v15-texter beskriver faktisk funktion och är markerade som juridiska utkast där relevant. De uppdaterade sidorna måste publiceras och granskas juridiskt före release.

## 20. Butiksmaterial — MANUAL ACTION REQUIRED

Beskrivningar, What's New och review notes finns på svenska. Skärmbilder, visuell ikongranskning, Play feature graphic och slutlig tecken-/portalgranskning återstår. Inga obestyrkta prognosgarantier eller personaliseringspåståenden har införts.

## 21. Reviewkonton — MANUAL ACTION REQUIRED

Instruktion finns i `docs/REVIEW_ACCOUNT.md`, men Free- och Premium sandbox-konton måste skapas externt och läggas endast i respektive portal. Lösenord finns inte i Git; reviewkontot ska inte vara Admin.

## 22. Releasekontroller — BLOCKED som helhet

`npm ci`, 88/88 tester, platsvalidering, versionssynk, production-config, webbbuild, native sync, plist-lint och `git diff --check` passerar. `check:store-compliance` rapporterar 5 complete, 14 manual action required och 5 blocked. Native builds passerar inte på nuvarande maskin.

## 23. Säkerhetskontroll — READY för repo

`security:release-check` kontrollerade 213 releasefiler utan privata nycklar, signingfiler eller testlösenord. `node_modules` är inte versionshanterad, package-lock ändrar endast rootversionen och inga ` 2`-filer ingår. Externa Cloudflare/Supabase-secrets måste verifieras manuellt utan export.

## 24. Rollbackplan — READY

`docs/ROLLBACK.md` beskriver Worker/webb-rollback, bevarande av frisk snapshot, kompensationsmigrationer, feature flags och hur köp/annonser hålls avstängda. Ingen destruktiv databaserollback föreslås.

## 25. Övervakningsplan — READY som dokumentation

`docs/MONITORING.md` definierar varningar för snapshotålder över 90 minuter, coverage under 100 %, upprepade snapshotfel, Worker 5xx/CPU/latens/cache, Supabase/Auth, köp, annonser och kontoborttagning. Inget nytt observabilitysystem har lagts till.

## 26. Manuella steg för Andreas — MANUAL ACTION REQUIRED

Installera/välj full Xcode och JDK 21; konfigurera signing lokalt; implementera och sandboxverifiera StoreKit/Play Billing plus servernotiser; konfigurera AdMob/CMP; juridiskt granska och publicera sidor; fyll App Privacy/Data Safety/IARC; skapa assets/reviewkonton; verifiera tre snapshotkörningar och Workers Paid; genomför faktisk enhetsmatris. Först därefter kan en separat order om commit/deploy/paketering ges.

## 27. Blockerare för TestFlight — BLOCKED

Full Xcode/archive/signing saknas. StoreKit restore/manage och backendverifiering saknas. Juridik, App Privacy/age rating, skärmbilder och reviewkonto är inte slutgodkända.

## 28. Blockerare för Google Internal Testing — BLOCKED

Java/Android releasebuild och signerad AAB saknas. Play Billing/backend/RTDN saknas. Data Safety/IARC, feature graphic, skärmbilder och reviewkonto återstår.

## 29. Blockerare för App Store-produktion — BLOCKED

Apple-köpflödet, restore/manage, serververifiering/notiser, signerad build, juridisk granskning, portaldeklarationer, assets, reviewkonto och full enhetsmatris saknas. Produktions-Worker är fortfarande 14.5.0 eftersom deploy uttryckligen inte är tillåten ännu.

## 30. Blockerare för Google Play-produktion — BLOCKED

Play Billing/backend/RTDN, signerad AAB, CMP/AdMob, juridisk granskning, Data Safety/IARC, assets/reviewkonto och full enhetsmatris saknas. Produktions-Worker är fortfarande 14.5.0.

## 31. Kända risker — BLOCKED/MANUAL ACTION REQUIRED

Störst risk är ofullständiga köp- och annonskedjor. Därutöver återstår autentiserade Premium/admin-/delete-tester, tre snapshots i följd, kall cache/Premiumlast, verklig CPU/dashboarddata, externa portalinställningar, signing, fysisk enhet och juridisk granskning. npm rapporterar även en deprecation för `uuid@7.0.3` samt tre ej godkända dependency-install scripts; detta bör granskas separat utan versionsuppgradering i release freeze.

## 32. Git diff — READY för granskning, inte stagead

Diffen innehåller endast releaseversion, native buildnummer, releasekontroller, release-/driftdokumentation, butikstexter och juridiska/supportsidor. `package-lock.json` ändrar endast 14.5.0 till 15.0.0 på rootnivå. Inga migrations-, poäng-, ranking-, aktivitets-, design-, Auth- eller entitlementlogikändringar ingår. Arbetsytan är avsiktligt ocommitad och ostagead för godkännande.
