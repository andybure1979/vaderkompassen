## v14.4.4 – Robust snapshot-hämtning

Snapshotjobbet begränsar samtidiga Open-Meteo-anrop, försöker om tillfälliga 429-/5xx-fel med deterministisk fördröjning och respekterar `Retry-After`. Data- och formatfel isoleras genom en begränsad batchdelning utan att förstärka rate limiting. Om publiceringsspärren stoppar en körning sparas de faktiska leverantörsfelen i diagnostiken.

Poäng, ranking, prognosfält, design, Auth och Premiumlogik är oförändrade. Ingen Supabase-migration krävs.

## v14.4.3 – 1 000 verifierade platser

Samtliga 500 Premiumplatser är nu källgranskade mot GeoNames officiella landregister och aktiverade. Registret innehåller därmed 500 Freeplatser och 500 Premiumplatser. Namn, GeoNames-ID och koordinater har verifierats; objekttyp, aktivitetskategorier, kommunetiketter och tydliga områdesfel har normaliserats. Homonymer behålls som separata verkliga platser och särskiljs geografiskt.

Poäng, ranking, prognosalgoritmer, design, Auth och Premiumlogik är oförändrade. Ingen Supabase-migration krävs. Efter Worker-deploy måste en ny snapshot verifieras med exakt 1 000 tillgängliga platser innan releasen betraktas som färdig.

## v14.4.2 – Snapshot-säkerhet

Cronjobbet läser nu uttryckligen den senaste kompletta `activity=all`-snapshoten som fallback. En körning med noll färska platser eller ofullständig täckning stoppas före publicering, så en fungerande prognos inte längre kan ersättas av en snapshot med bara ett fåtal platser. Batchfel rapporteras per faktisk batch med leverantörens felsvar.

Poäng, ranking, aktivitetsmodeller, platsåtkomst och UI är oförändrade.

## v14.4.1 – Utökat Premiumplatsregister

Platsregistret har en central, validerad modell med 500 oförändrade Free-platser och 500 nya Premiumkandidater från Sverige, Norge och Danmark. Stoppregeln är strikt: endast 47 nya poster är aktiverade i första leveransen; övriga ligger avstängda med tydlig granskningsstatus tills område, kategori eller dubblettstatus är verifierad.

Free får dagens prognos för standardutbudet. Trial, Premium, VIP, Admin och aktivt uppsagda abonnemang får dessutom det aktiverade utökade registret. Workern verifierar entitlement och separerar cache med `access=free|premium`. Poäng, rankingformler och väderalgoritmer är oförändrade. Kör `npm run validate:places`; full modell och granskningsrapport finns i `docs/PLACE_REGISTRY.md`.

## v14.4.0 – Native appgrund

Webbappen kan nu paketeras lokalt i officiella Capacitor 8-projekt för iOS och Android. Versionen innehåller reproducerbar `dist/`-build, tre miljöer, native plattforms-/livscykelbrygga, Supabase deeplink/Auth-lagring, kartnavigation, säkra köp- och annonsstubbar, kontoborttagning, CI och versionskontroll. Riktiga köp, produktionsannonser och butikspublicering är inte aktiverade. Se `docs/NATIVE_SETUP.md`.

## v14.3.7 – Tydligare kontofel

Skapa konto, inloggning och lösenordsåterställning validerar nu uppgifterna lokalt och visar svenska, användaranpassade fel i stället för råa Supabase-meddelanden. Kontodialogens design och autentiseringsmodell är oförändrade.

## v14.3.6 – Scalability

Prognos-API:t använder versionsmärkta snapshots, ETag/304, stale-while-revalidate och färdigbyggda rankingar per aktivitet, region och prognosdag. Cronjobbet publicerar rankingversionen atomiskt: en halvfärdig version blir aldrig läsbar. Request-pathen läser små, försorterade kandidatlistor och behåller den äldre snapshotvägen som kompatibilitetsreserv.

Free begär och tar emot endast dagens prognos. Trial, Premium, VIP och Admin begär fortsatt alla prognosdagar. Frontend kontrollerar ny data var 30:e minut för Free och var 15:e minut för Premium, pausar i bakgrunden och använder `If-None-Match` för att undvika identiska payloads.

Kör `supabase/migrations/20260801_1436_prebuilt_forecast_rankings.sql` före Worker-deploy. `npm run deploy:production` använder uttryckligen rootkonfigurationens `cloudflare/src/index.js` och verifierar därefter att publik `WorkerVersion` är 14.3.6. Lasttestet körs med `npm run loadtest -- --base=https://... --users=100,500,1000,5000 --mode=warm`; kall cache kräver en separat `LOAD_TEST_TOKEN`-secret och `VK_LOAD_TEST_TOKEN` lokalt.

## v14.3.5 – Enkel Free/Premium

Free visar dagens prognos, låter användaren välja en region åt gången och sparar inställningar lokalt. Premiumåtkomst – Trial, Premium, VIP och Admin – visar alla prognosdagar, jämför flera regioner, synkar inställningar mellan enheter och är reklamfri. Alla användare har samma kategorier, väderdata, prognoskvalitet, poäng, ranking, karta, faktaboxar, detaljvyer, navigation och rekommendationstexter.

Webbversionen förbereder två reklamplatser för Free utan att hämta extern reklam: `ranking_inline_native` efter plats 3 i topplistan och `main_bottom_banner` längst ned i huvudvyn. De visas endast som tydligt märkta platshållare med texten ”Annons”. Ingen Supabase-migration krävs.

## v14.3.4 – Vattentemperatur i aktivitetsfakta

Sol och bad, Kustväder, Surfväder och Fiskeväder visar vattentemperatur i både vinnarkort och topplista när prognosfältet finns. Visningen använder `waterTemperature` och kan läsa `seaTemp` som kompatibilitetsfallback. Saknas båda visas ingen tom fakta. Kortdesign, poäng och ranking är oförändrade.

## v14.3.3 – Tydlig adminvy och rättad användardetalj

Adminpanelen använder nu samma solida systembakgrund som övriga dialoger. Ny frontend- och service-worker-version bryter den tidigare CSS-cachen. `admin_get_user_detail()` använder entydigt kvalificerade kolumn- och parameterreferenser, så en Admin kan öppna användardetaljer utan PostgreSQL-felet `target_user_id is ambiguous`. Kör `supabase/migrations/20260801_1433_admin_user_detail_fix.sql` efter Adminmigrationen.

## v14.3.2 – Åtkomlig Premiumstatus

Alla inloggade konton med aktiv kontostatus kan öppna Premiumdialogen från profilen. Free-konton som får starta provperiod ser “Prova Premium gratis i 3 dagar”; Admin, VIP, aktiva, uppsagda, utgångna och redan använda triallägen ser “Visa Premiumstatus”. Prenumerationsmodell, betalningsbegränsningar och backend är oförändrade.

## v14.3.1 – Worker runtime-fix

Forecast-cachemissar använder den service-role-skyddade Supabase-funktionen `get_ranked_forecast()` för filtrering och sortering av befintliga `serverScores`. Workern tar därför emot högst 75 färdigrankade resultat per dag i stället för hela regionala JSON-snapshots. Cronbygget använder fasta batcher utan rekursiva nätverksförsök, så externa API-fel kan inte förbruka hela Workers Free-budgeten på 50 subrequests.

Kör `supabase/migrations/20260801_1431_forecast_runtime_limits.sql` före Worker v14.3.1. Poäng, rankingregler, kartlogik och vädermodeller är oförändrade.

## v14.3.0 – Adminvy

Adminanvändare får en mobil- och desktopanpassad administrationspanel för systemöversikt, paginerad användarsökning, abonnemangsstatus, separata VIP-entitlements, kontostatus, interna anteckningar, driftkontroll och revisionshistorik. UI-kontrollen kompletteras alltid av Admin-verifiering i SECURITY DEFINER-RPC:er och Worker-endpointen.

VIP och kostnadsfri Premium är administrativa entitlements och aldrig betalprenumerationer. Adminvyn kan inte fabricera Apple-/Googleköp, tokens eller kvitton. Statistik utan säker datakälla visas som “Data är inte tillgänglig ännu.” Kör `supabase/migrations/20260801_1430_admin_console.sql` efter v14.2.0-migrationen före publicering.

## v14.2.0 – Prenumerationsgrund

Premiumstatus är nu en separat Supabase-domän med serverberäknad entitlement, permanent trialhistorik, strikt RLS och auditlogg. Webbversionens explicita `manual_test`-provider kan starta en enda tre dagar lång testprovperiod och säga upp den till periodens slut. Den blir aldrig automatiskt betald och ingen verklig debitering, kvitto- eller kortlagring sker.

Apple- och Google-providergränssnitt finns som tydliga native-stubbar. Planerat pris är 29 kr/månad, men verkliga produkter, priser, köp, återställning, backendverifiering och servernotiser ansluts senare i iOS-/Android-apparna. Kör migrationen `supabase/migrations/20260801_1420_subscription_foundation.sql` före publicering.

## v14.1.0 – Performance 2.0

Performance 2.0 samlar den kanoniska forecast-cachen, request coalescing, säkra frontend-aborter och den kompakta payloaden i en slutversion. Den publicerade Worker-versionen kan verifieras i JSON-svaret och headern `X-Vaderkompassen-Worker-Version`; rankingmotorn identifieras som `cloud-v6-performance-2`.

Samma logiska urval använder samma cache- och requestnyckel oavsett parameterordning. Cacheträffar går förbi Supabase och all bearbetning, samtidiga cachemissar delar en färdigserialiserad body och frontend återanvänder identiska hämtningar utan att äldre `finally` kan påverka ett nyare UI-läge. Poäng, ranking, max 75 resultat, karta, texter, Auth och Premium är oförändrade. Ingen Supabase-migration krävs.

## v14.1.0c – Kompaktare prognossvar

`/v1/forecast` skickar nu en uttrycklig, frontend-verifierad uppsättning radfält och endast den efterfrågade aktivitetens `serverScore`. Saknade marina, snö- och specialvärden utelämnas, medan giltiga värden som `0` och `false` bevaras. Topplista, vinnarkort, detaljsida, karta, navigation, faktaboxar och rekommendationstexter behåller de fält de faktiskt använder.

Poängen hämtas en gång per rad före sortering. Först efter `slice(0, 75)` byggs kompakta svarsrader, och samma JSON-sträng används av Response, request coalescing och Cache API. Frontend kan fortsatt läsa äldre `serverScores`, och diagnostiken redovisar ungefärliga teckenmängder för Supabase- och API-svar. Snapshotformat, poäng och ranking är oförändrade. Ingen Supabase-migration krävs.

## v14.1.0b – Säkrare samordning av prognosanrop

Frontend bygger en stabil request-nyckel av aktivitet, regioner och områden. Identiska pågående hämtningar återanvänds, medan ett ändrat urval avbryter den äldre hämtningen utan användarfel eller inaktuell UI-uppdatering. Lokal referensjämförelse och befintligt generationsskydd gör att ett äldre `finally` aldrig får rensa promise, controller eller laddningsstatus för ett nyare anrop.

Cloudflare Workern fortsätter att samordna samtidiga identiska cachemissar via den kanoniska Cache API-nyckeln. Det delade resultatet är en färdigserialiserad sträng med status och headers; varje väntande request bygger en egen `Response`. Poäng, ranking, snapshotformat och gränsen på 75 resultat per dag är oförändrade. Ingen Supabase-migration krävs.

## v14.1.0a – Edge-cache och samordnade prognosanrop

`/v1/forecast` normaliserar aktivitet, regioner och områden innan en kanonisk cache-nyckel byggs. Färdiga 200-svar cachelagras i Cloudflare Cache API i 300 sekunder, och samtidiga identiska cachemissar delar ett enda Supabase-flöde utan att dela förbrukningsbara `Response.body`-objekt.

Frontend återanvänder identiska pågående prognosanrop och avbryter ett äldre anrop när inställningar eller aktivitet ger en annan URL. Worker-svaret rapporterar cache och coalescing i headers samt detaljerade mätvärden för cachemissens beräkning. Root-kommandot `npm run deploy` använder `wrangler.jsonc` och `cloudflare/src/index.js`. Ingen Supabase-migration krävs.

## v14.0.14 – Välj karttjänst vid navigering

“Navigera till” öppnar nu en gemensam, tillgänglig valdialog för Google Maps, Apple Kartor och Topo GPS. Google och Apple får destinationens validerade koordinater. Topo GPS-alternativet visas inaktivt tills tjänstens koordinatformat för universal links har kunnat verifieras i officiell dokumentation.

Dialogen används för vinnaren, detaljvyn och kartans popup, fungerar med tangentbord och återställer fokus när den stängs. Ingen navigering startar innan användaren väljer tjänst. Ingen Supabase-migration krävs.

## v14.0.13 – Förbättrad modell för Fiskeväder

Fiskeväder använder en gemensam, datanormaliserad poängmodell i frontend och Cloudflare Worker. Modellen bedömer vindstyrka, vindriktning, nederbörd, moln/sol och lufttemperatur samt faktisk vattentemperatur och våghöjd när dessa finns. Saknad marin data ger inget konstgjort avdrag, och inlandsplatser behålls tillsammans med kustplatser.

Molnighet och vindbyar bevaras från prognoskällor som tillhandahåller värdena. Ingen Supabase-migration krävs. Andra aktiviteters poäng och ranking är oförändrade.

## v14.0.12 – Faktavärden från V13-topplistan

Vinnarkortet och topplistan visar nu samma faktauppsättning som topplistekorten i den visuella V13-referensen. Alla kategorier visar temperatur, regn, sol, vind och prognossäkerhet. Havs-, surf- och skidkategorier kompletteras med samma specialvärden som i referensen.

Poängmodell och ranking är oförändrade. Ingen Supabase-migration krävs.

## v14.0.11 – Synkroniserade faktavärden

Vinnarkortet och varje topplistekort hämtar nu sina prognosvärden från samma aktivitetsanpassade faktalista. Samma kategori visar därför samma fakta i båda vyerna; endast presentationen skiljer sig mellan stora boxar och kompakt V13-stil.

Poängmodell och ranking är oförändrade. Ingen Supabase-migration krävs.

## v14.0.10 – V13-stil i topplistan

Väderkompassen behåller alla tio nuvarande kategorier och deras färgprofiler. Topplistans prognosvärden visas åter i den kompakta, ramlösa V13-stilen med ikoner och korta värden som radbryts efter tillgänglig mobilbredd. De större aktivitetsanpassade faktaboxarna under huvudpoängkortet är oförändrade.

Poängmodell, ranking, karta, autentisering, Premium och Worker-API är oförändrade. Ingen Supabase-migration krävs.

## v14.0.9 – Aktivitetsanpassade faktaboxar

Topplistans kort visar nu 4–12 relevanta prognosvärden för den valda aktiviteten, med högst fyra boxar per rad. Boxarna saknar ramar och skuggor och är anpassade för mobilskärmar. Rekommendationstexten visas utan faktaboxar.

Service-worker-cachen och alla versionsmärkta frontendfiler har uppdaterats så att installerade appar hämtar den nya layouten. Poängmodell och ranking är oförändrade. Ingen Supabase-migration krävs.

## v14.0.8 – Intelligent textsystem

Rekommendationerna använder ett deterministiskt, aktivitetsspecifikt textbibliotek. Samma ort, datum och aktivitet får samma formulering vid omrendering, och den väderfaktor som väger tyngst för aktiviteten lyfts utan att poäng eller ranking ändras.

Bio och Badhus har en lättsam inomhuston. Texterna bygger bara på parametrar som finns i prognosunderlaget. Ingen Supabase-migration krävs.

Textsystemet skiljer mellan positiva bidrag, negativa bidrag och neutrala observationer. Vid låga totalpoäng förklaras de största begränsningarna före mindre styrkor.
