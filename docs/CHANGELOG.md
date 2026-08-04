# Ändringslogg

## 15.0.4 – Native Android, signering och Google Play Internal Testing

- Synkroniserar frontend/Android till 15.0.4 och versionCode 15004; iOS stannar på 15.0.3 build 5 och Worker på 15.0.2.
- Lägger till JDK/SDK/adb/Gradle-toolchainkontroll samt reproducerbara debug-, osignerade release- och signerade AAB-kommandon.
- Stödjer upload-signering via privat Gradle-konfiguration eller miljö utan keystore/lösenord i Git.
- Verifierar manifest, minimala permissions, production-assets, deeplink, Billingkontrakt, ikoner och Android release-säkerhet.
- Dokumenterar Android Studio, emulator, fysisk enhet, Play App Signing, Data Safety och Internal Testing.
- Ändrar inte Billinglogik, StoreKit, väder, poäng, ranking, snapshots, cache, Premium eller design.

## 15.0.3 – Native iOS, Xcode och TestFlight

- Synkroniserar frontend/iOS till 15.0.3 och höjer iOS build från 4 till 5; Worker och Android stannar på 15.0.2.
- Lägger till toolchain-, simulator-, osignerad release-, archive- och iOS-säkerhetskontroller.
- Förbereder automatiskt signing utan att committa Team, certifikat, profiler eller privata nycklar.
- Verifierar Info.plist, callback, privacy manifest, ikon och production-assets samt dokumenterar Archive/Validate/TestFlight.
- Begränsar target till iPhone tills iPad-layout har godkänts separat.
- Ändrar inte StoreKit-logik, Android, väder, poäng, ranking, snapshots, cache eller design.

## 15.0.2 – Google Play Billing och Premium för Android

- Integrerar officiella Google Play Billing Library 9.1.0 via en avgränsad nativebrygga.
- Implementerar ProductDetails, base plan/offer, pending, restore/sync, manage och acknowledgement efter serververifiering.
- Verifierar subscriptions med Google Play Developer API och synkar RTDN idempotent genom central entitlement.
- Lagrar endast tokenhash och håller service account utanför klient och Git.
- Kräver manuell Play Console-, Google Cloud-, Supabase- och Internal Testing-konfiguration före produktion.
- Ändrar inte Apple, UI-design, väder, poäng, ranking, snapshots eller cache.

## 15.0.1 – Apple StoreKit och Premium för iOS

- Implementerar StoreKit 2 för lokaliserad produktinformation, köp, pending/cancel, restore och Apples officiella hanteringsvy.
- Använder App Store Server API och verifierade Apple-JWS som sanningskälla för Premium.
- Tar emot och deduplicerar App Store Server Notifications V2.
- Kopplar Apple-status till central entitlement via en service-role-skyddad Supabase-RPC utan att lagra rå JWS.
- Behåller VIP/Admin som separata administrativa entitlements och ändrar inte Android, reklam, UI, poäng, ranking eller prognoser.
- Är blockerad för App Store-publicering tills extern Apple-konfiguration, migration, Xcode-build och Sandbox-test är klara.

## 15.0.0 – Första publika produktionsversionen

- Fryser funktionaliteten för första publika webb-, iOS- och Androidreleasen.
- Synkroniserar webb, Worker, Capacitor, iOS och Android till version 15.0.0 med separata stigande buildnummer.
- Verifierar 1 000 aktiva platser: 500 Free och 500 Premium, samtliga källgranskade.
- Bekräftar att senaste produktionssnapshoten täcker 1 000/1 000 platser utan fallback eller batchfel.
- Lägger till release-, rollback-, hotfix- och övervakningsplaner samt GitHub release notes.
- Behåller fail-closed för riktiga köp och annonser. StoreKit/Play Billing, backendverifiering, restore/manage, AdMob/CMP, signing och juridisk granskning är blockerare före butikspublicering.
- Ändrar inte poäng, ranking, prognosalgoritmer, aktiviteter eller design och kräver ingen Supabase-migration.

## 14.5.0 – Store compliance och Release Candidate

### Implementerat

- Juridiska svenska utkast och publicerbara sidor för privacy, villkor, support och kontoborttagning.
- Tydliga Premiumupplysningar om prisets källa, period, provperiod, automatisk förnyelse, uppsägning och periodslut.
- Central compliancechecklista, production-config- och release-security-script.
- Apple App Privacy-, Google Data Safety-, Apple/IARC-åldersklassificerings-, asset-, reviewkonto-, subscription- och tillgänglighetsunderlag.
- Svensk Apple/Google-metadata och markerade strukturer för framtida engelska översättningar.
- Explicit Worker CORS-allowlist för produktionens webb- och native-origin.

### Verifierat lokalt

- Kontoborttagning använder säker RPC, skiljer appkonto från butikprenumeration och rensar lokal appdata.
- Androidmanifestet begär endast internet och nätverksstatus; iOS privacy manifest deklarerar ingen tracking.

### Manuella steg

- Juridisk granskning och publicering/verifiering av HTTPS-URL:er.
- Portalernas privacy/Data Safety/age rating, reviewkonto, skärmbilder, ikoner och signing.

### Blockerat före produktion

- Riktiga StoreKit/Play Billing-köp, restore/manage och backendverifiering.
- AdMob/samtycke, signerade builds samt godkända butiksbilder.

Ingen poäng-, ranking-, väder- eller aktivitetsmodell och ingen Supabase-migration ändras.

## 14.4.5 – Prognosuppdatering varje timme

- Ändrar snapshotjobbet från `*/30 * * * *` till `0 * * * *`.
- Hämtar därmed ny leverantörsprognos en gång per hel timme.
- Behåller frontendens befintliga ETag-/snapshotkontroller oförändrade.
- Ändrar inte poäng, ranking, prognosfält, UI, Auth eller Premium och kräver ingen migration.

## 14.4.4 – Robust snapshot-hämtning

- Begränsar Open-Meteo-hämtningen till två samtidiga batchar.
- Försöker om HTTP 429 och 5xx med deterministisk backoff och stöd för `Retry-After`.
- Delar data-/formatfel en gång för att isolera felaktiga delbatchar, men delar aldrig rate-limitfel.
- Sparar batchindex, felförklaring, antal försök och berörda platser i `worker_runs` när publicering stoppas.
- Behåller strikt krav på minst en färsk plats och full täckning för alla 1 000 platser.
- Ändrar inte poäng, ranking, prognosdata, design, Auth eller Premium och kräver ingen migration.

## 14.4.3 – 1 000 verifierade platser

- Aktiverar de återstående 453 källgranskade Premiumplatserna.
- Ger Premium totalt 500 utökade platser utöver Freeutbudets 500 platser.
- Verifierar samtliga GeoNames-ID:n, namn och koordinater mot officiella SE/NO/DK-register.
- Normaliserar 223 orter, två parker, vatten-/kusttyper, kommunetiketter och säkert identifierade områdesfel.
- Behåller verkliga homonymer som separata platser med geografisk särskiljning.
- Ändrar inte poäng, ranking, prognosalgoritmer, design, Auth eller Premiumlogik och kräver ingen migration.

## 14.4.2 – Snapshot-säkerhet

- Rättar fallbackfrågan till senaste kompletta `activity=all`-snapshot.
- Stoppar publicering när inga platser är färska eller när fallback inte ger full täckning.
- Räknar misslyckade batcher som batcher i stället för en rad per plats.
- Bevarar Open-Meteos HTTP-detalj och batchindex i diagnostiken.
- Ändrar inte prognos-, poäng- eller rankinglogik och kräver ingen migration.

## 14.4.1 – Utökat Premiumplatsregister

- Central platsmodell och genererade frontend-/Worker-assets från `data/places.json`.
- Bevarar 500 tidigare platser som Free och importerar exakt 500 Premiumkandidater: 300 SE, 100 NO och 100 DK.
- Aktiverar endast 47 kvalitetssäkrade kandidater; 453 osäkra poster är avstängda för område-, kategori- eller dubblettgranskning.
- Verifierar Premiumåtkomst server-side och skiljer Cache API/ETag på `access=free|premium`.
- Begränsar marin hämtning till `marine=true` och lägger till administrativ platsöversikt med filter och granskningsexport.
- Lägger till `npm run validate:places`; inga poäng-, ranking- eller prognosformler har ändrats och ingen Supabase-migration krävs.

## 14.4.0 – Native appgrund

### Färdigimplementerat

- Capacitor 8.5.0 med lokalt paketerad webbapp, officiella iOS-/Androidprojekt och exakt låsta plugins.
- Central development/staging/production-konfiguration, plattformsdetektering, livscykel, nätverksstatus, Preferences-lagring och service-worker-avgränsning.
- Native Auth callback `vaderkompassen://auth/callback`, extern OAuth Browser, kartnavigation och skyddad kontoborttagning.
- Separata buildnummer: iOS 1 och Android 14400; publik version 14.4.0.
- GitHub Actions för web/Worker, Android debug och osignerad iOS-simulator.

### Förberett men inte aktiverat

- Apple/Google köpgränssnitt med backend som framtida sanningskälla.
- AdMob-provider och placements; endast webb-/utvecklingsplaceholders kan visas.

### Manuella externa steg

- Kör kontoborttagningsmigrationen, lägg till Supabase redirect och konfigurera Apple/Google-konton, signing och GitHub Environments enligt `NATIVE_SETUP.md`.

### Kvarvarande blockerare

- Full Xcode 26 och Android Studio/SDK 36 saknas lokalt.
- Slutlig 1024×1024 ikon/splash-master, butikskonfiguration, sandboxverifierade köp och AdMob-plugin återstår.

## 14.3.7 – Tydligare kontofel

- Validerar e-postadress och lösenord lokalt före anrop till Supabase.
- Ersätter råa tekniska Auth-fel med begripliga svenska meddelanden.
- Fångar nätverksfel och förhindrar dubbla samtidiga kontoanrop.
- Ändrar inte kontodialogens visuella utformning eller Auth-modellen.

## 14.3.6 – Scalability

- Publicerar atomiska, färdigsorterade rankingar per aktivitet, region och dag i ett separat service-role-skyddat Supabase-lager.
- Undviker JSONB-expansion i normal request-path och behåller tidigare RPC/snapshot som övergångsreserv.
- Returnerar endast dagens prognos för Free och samtliga dagar för Trial, Premium, VIP och Admin.
- Inför centralt `snapshotVersion`, representationsspecifik ETag, 304-svar och stale-while-revalidate.
- Invaliderar kända lokala Cache API-nycklar när en ny snapshot publiceras.
- Pausar polling i bakgrunden; Free kontrollerar var 30:e minut och Premium var 15:e minut.
- Exponerar WorkerVersion, snapshotVersion, cacheläge, ETag, lästa/returnerade rader, payloadstorlek, total tid, CPU-approximation och antal Supabase-anrop.
- Root-deployen pekar uttryckligen på `wrangler.jsonc` och har en separat produktionsverifiering.
- Lägger till kontrollerat lasttest för 100, 500, 1 000 och 5 000 blandade användare.
- Poäng, rankingregler, väderfält, UI, texter, karta, Premium-entitlement, Auth och Admin är oförändrade.

## 14.3.5 – Enkel Free/Premium

- Free visar endast dagens prognos och ett låst kort för resten av veckan.
- Free kan välja en region åt gången och använder endast lokala inställningar.
- Trial, Premium, VIP och Admin får alla prognosdagar, flera regioner, molnsynk och en reklamfri vy.
- Förbereder de lokala reklamplatserna `ranking_inline_native` och `main_bottom_banner` för Free utan extern reklamkod.
- Premiumdialogen jämför endast de fyra tydliga skillnaderna mellan Free och Premium.
- Alla kategorier, prognosfält, poängmodeller, rankingar, karta, fakta, detaljer, navigation och vädertexter är gemensamma och oförändrade.
- Ingen Supabase-migration krävs.

## 14.3.4 – Vattentemperatur i aktivitetsfakta

- Visar vattentemperatur för Sol och bad, Kustväder, Surfväder och Fiskeväder när data finns.
- Använder `waterTemperature` med `seaTemp` som kompatibilitetsfallback.
- Utelämnar faktan helt när prognosen saknar båda fälten.
- Behåller befintlig kortdesign, poängmodell och ranking.
- Uppdaterar frontend- och service-worker-cache till 14.3.4.

## 14.3.3 – Tydlig adminvy och rättad användardetalj

- Ger adminpanelen samma solida `--surface`-bakgrund som övriga systemdialoger.
- Bryter CSS- och service-worker-cachen med versionsnyckeln 14.3.3.
- Kvalificerar `target_user_id` i `admin_get_user_detail()` så användarkort kan öppnas utan ett tvetydigt kolumnfel.
- Lägger till en idempotent korrigeringsmigration för redan installerade Adminmiljöer.

## 14.3.2 – Åtkomlig Premiumstatus

- Rättar ett UI-villkor som dolde länken till Premiumdialogen för Admin, VIP och andra konton som inte kunde starta en ny trial.
- Visar “Prova Premium gratis i 3 dagar” endast när trial faktiskt kan startas.
- Visar annars “Visa Premiumstatus”, så aktuell entitlement och uppsägningsstatus alltid kan granskas.
- Blockerade eller pausade konton får fortsatt ingen Premiumåtgärd.

## 14.3.1 – Worker runtime-fix

- Flyttar filtrering och sortering av lagrade forecast-rader till en service-role-skyddad Supabase-RPC.
- Returnerar högst 75 färdigrankade rader per dag till Workern och minskar JSON-parse, merge, poängfallback och sortering i request-pathen.
- Bevarar lagrade `serverScores`, aktivitetsfilter, områdesfilter och kust-/surfplatsfilter.
- Ökar externa väderbatcher från 18 till 30 platser och tar bort rekursiva återförsök inom samma cron-invocation.
- En misslyckad batch återanvänder föregående snapshot i stället för att riskera Cloudflares subrequestgräns.
- Uppdaterar app, Worker och service-worker-cache till 14.3.1.

## 14.3.0 – Adminvy

- Ny fullskärmsadminvy med översikt, användarsökning, abonnemang, drift, revisionshistorik och systeminformation.
- Säker, paginerad serversökning och användardetalj utan tokens, hemligheter eller fullständiga providerpayloads.
- Separata permanenta eller tidsbegränsade VIP-entitlements som aldrig skapar Apple-/Googleköp.
- Skyddade och atomiskt loggade åtgärder för roll, VIP, kontostatus och interna anteckningar.
- Strikt RLS, fasta `search_path`, obligatorisk Admin-kontroll och skydd mot sista-admin/självlåsning.
- Bearer-skyddad Worker-hälsokontroll med tio sekunders begränsning och utan miljöhemligheter.
- Statistik utan pålitlig datakälla markeras uttryckligen som otillgänglig.

## 14.2.0 – Prenumerationsgrund

- Separat `subscriptions`-modell, permanent `trial_entitlements` och append-only `subscription_audit_log`.
- Serverbaserad `get_user_entitlement()` skiljer administrativ roll från abonnemangsstatus.
- Säker `manual_test`-trial startas en gång och blir aldrig automatiskt betald Premium.
- Uppsägning ger `cancelled_active` och behåller Premium till periodens slut.
- Strikt RLS hindrar klienten från att skriva status, provider, perioder, trialhistorik eller auditlogg.
- Provideradaptrar för Manual Test samt icke-funktionella Apple-/Google-native-stubbar.
- Profilen anger uttryckligen att webbversionen inte genomför någon verklig debitering.
- Idempotent migration bevarar Admin/VIP och flyttar äldre manuella testperioder utan att göra dem till betalda butiksköp.

## 14.1.0 – Performance 2.0

- Samlar edge-cache, normaliserade requestnycklar, Worker-coalescing, frontend-abort och kompakt forecast-payload i den slutliga 14.1.0-versionen.
- Märker Worker-svar med `X-Vaderkompassen-Worker-Version: 14.1.0` och rankingmotorn `cloud-v6-performance-2`.
- Root-deploy använder `wrangler.jsonc` och `cloudflare/src/index.js`; den alternativa Worker-konfigurationen använder samma källa relativt `cloudflare/`.
- Behåller poäng, ranking, vinnare, prognosdagar, max 75 resultat, UI, karta, navigation, Auth och Premium.
- Ingen Supabase-migration krävs.

## 14.1.0c

- Begränsar regionala Supabase-svar till redan använda `payload,source_status`.
- Bygger forecast-rader från en uttrycklig allowlist verifierad mot hela frontendens rendering och specialkategorier.
- Skickar endast vald aktivitets `serverScore` i stället för hela `serverScores`.
- Behåller frontendstöd för äldre svar med `serverScores` och lokalt beräknade resultat.
- Dekorerar varje rad med poäng en gång, sorterar, begränsar till 75 och kompakterar först därefter.
- Utelämnar saknade valfria fält men bevarar giltiga `0`, `false` och tomma strängar.
- Begränsar response-meta till ortantal och prestandamätning; `sourceStatus` tas endast från första användbara shard.
- Mäter ungefärliga teckenmängder som `supabaseBytes` och `responseBytes` samt tid för kompaktering.
- Behåller Cache API, request coalescing, snapshotformat, poängalgoritmer och rankinglogik.
- Ingen Supabase-migration krävs.

## 14.1.0b

- Bygger frontendens forecast-nyckel med stabil parameterordning, trimning, unika värden och svensk sortering.
- Återanvänder ett pågående Promise för samma logiska urval och avbryter en äldre hämtning när urvalet ändras.
- Skyddar cleanup med lokal referensjämförelse så att ett äldre `finally` inte kan rensa ett nyare aktivt anrop.
- Behåller `loadGeneration` som ägarskapsskydd för topplista, karta, lokal cache och laddningsstatus.
- Lägger till begränsad diagnostik för start, återanvändning, abort och avslut utan tokens eller payloads.
- Utökar samtidighetstesterna till fem separata läsbara `Response`-objekt, en cache-put, gemensamma fel och säker frontend-cleanup.
- Behåller poäng, ranking, aktivitetsmodeller, snapshotformat och max 75 resultat per dag.
- Ingen Supabase-migration krävs.

## 14.1.0a

- Normaliserar aktivitet, regioner och områden till en stabil `/v1/forecast`-nyckel.
- Cachelagrar lyckade forecast-svar i Cloudflare Cache API i 300 sekunder.
- Samordnar samtidiga identiska cachemissar till ett Supabase-flöde.
- Delar serialiserad JSON och metadata mellan väntande anrop; varje request får en egen `Response`.
- Minskar Supabase-select till `payload,source_status` för regionala snapshots.
- Redovisar HIT/MISS och coalescing i response-headers samt detaljerad prestandamätning i svarets metadata vid cachemiss.
- Frontend återanvänder identiska pågående anrop och avbryter äldre anrop när URL:n ändras.
- Behåller poäng, ranking och gränsen på 75 resultat per dag.
- Root-deploy använder `wrangler.jsonc` med `cloudflare/src/index.js` som Worker-källa.
- Ingen Supabase-migration krävs.

## 14.0.14

- “Navigera till” öppnar en gemensam valdialog i stället för en karttjänst direkt.
- Google Maps och Apple Kartor öppnas med validerade latitud- och longitudvärden.
- Topo GPS visas inaktivt eftersom ett dokumenterat koordinatformat för tjänstens universal link ännu saknas.
- Dialogen kan stängas med kryss, Esc och tryck utanför samt återställer fokus till öppningsknappen.
- Vinnarkort, detaljvy och kartpopup använder samma navigeringsflöde.
- Ingen Supabase-migration krävs.

## 14.0.13

- Ny normaliserad fiskepoäng med vindstyrka, vindriktning, nederbörd, moln/sol och lufttemperatur.
- Faktisk vattentemperatur och våghöjd används endast när respektive data finns.
- Inlands-, fjäll-, älv- och kustfiskeplatser kan visas samtidigt.
- Bevarar faktisk molnighet och vindbyar från prognoskällorna.
- Gemensam fiskemodul används av frontend och Cloudflare Worker.
- Nya gemensamma scenariotester för fiskepoängen.
- Fiskevädrets texter och faktaboxar följer den nya faktorprioriteringen.
- Andra aktiviteters poäng och ranking är oförändrade.
- Ingen Supabase-migration krävs.

## 14.0.12

- Matchar faktauppsättningen i V13-referensens topplistekort.
- Alla kategorier visar temperatur, regn, sol, vind och prognossäkerhet.
- Kust, Båt och Fiske kompletteras med vågor, vågriktning, vågperiod, dyning och havstemperatur.
- Surf kompletteras med vågor, vågriktning, vågperiod, vindriktning och frånlandsvind.
- Skidor kompletteras med snödjup, nysnö och nollgradersnivå.
- Vinnarkortet och topplistan använder samma faktalista.
- Uppdaterar frontendresurser och service-worker-cache till v14.0.12.
- Poängmodell och ranking är oförändrade.
- Ingen Supabase-migration krävs.

## 14.0.11

- Vinnarkortet och topplistan använder samma aktivitetsanpassade faktalista.
- Samma kategori visar samma prognosvärden i båda vyerna.
- Vinnarkortet behåller stora boxar och topplistan behåller kompakt V13-stil.
- Uppdaterar frontendresurser och service-worker-cache till v14.0.11.
- Poängmodell och ranking är oförändrade.
- Ingen Supabase-migration krävs.

## 14.0.10

- Behåller samtliga tio aktivitetskategorier och deras befintliga färgprofiler.
- Återställer topplistans kompakta, ramlösa faktavisning från V13.
- Visar grundvärden samt relevanta havs-, surf- eller snövärden i ett flexibelt mobilflöde.
- Behåller de stora aktivitetsanpassade faktaboxarna under huvudpoängkortet.
- Uppdaterar frontendresurser och service-worker-cache till v14.0.10.
- Poängmodell och ranking är oförändrade.
- Ingen Supabase-migration krävs.

## 14.0.9

- Topplistans kort visar 4–12 aktivitetsrelevanta prognosvärden.
- Högst fyra faktaboxar visas per rad, med mobilanpassad storlek och läsbarhet.
- Faktaboxarnas ramar och skuggor är borttagna.
- Rekommendationstexten visas utan faktaboxar.
- Service-worker-cache och versionsmärkta frontendresurser är uppdaterade till v14.0.9.
- Poängmodell och ranking är oförändrade.
- Ingen Supabase-migration krävs.

## 14.0.8

- Inför ett deterministiskt textbibliotek med många varierade formuleringar.
- Varje aktivitet får ett eget språk och en tydligare personlighet.
- Rekommendationstexten lyfter automatiskt dagens starkaste väderfaktor.
- Samma ort, dag och aktivitet får stabil text vid omrendering, medan andra platser och dagar får variation.
- Formuleringar återanvänds inte på samma sida när biblioteket har lediga alternativ.
- Åska nämns endast när prognosen innehåller ett separat åskfält; nederbördsrisk tolkas inte som åska.
- Texturvalet skiljer mellan positiva bidrag, negativa bidrag och neutrala observationer utifrån totalpoängen.
- Låga betyg förklaras med de största avdragen i stället för den minst svaga positiva faktorn.
- Poängmodell och ranking är oförändrade.
- Ingen Supabase-migration krävs.

## 14.0.7

- Lägger till mänskliga kvalitetsomdömen bredvid poängen.
- Visar fyra tydliga väderorsaker för vinnaren, detaljsidan och varje topplistekort.
- Lägger till korta, naturliga rekommendationstexter utan att ändra rankning eller poängmodell.
- Bioväder och Badhusväder får egna lättsamma inomhusmotiveringar.
- Ingen Supabase-migration krävs.

## 14.0.6.3

- Filtrerar valda regioner direkt i Supabase/PostgREST innan regionala prognos-shards laddas till Workern.
- Återanvänder förberäknade `serverScores` och räknar bara om för äldre snapshots.
- Lägger till enkel prestandamätning för databasfråga, rankning och antal laddade shards.
- Ny GIN-indexmigration för `forecast_snapshots.regions`.
- Uppdaterade versionsnummer och cache till 14.0.6.3.

## 14.0.6.2

- Lade till `package.json` i projektroten.
- Låste Wrangler till `4.114.0`.
- Lade till `npm run deploy` och `npm run dev`.
- Lade till Node-krav och `.nvmrc` för Node 22.
- Synkroniserade Wrangler-versionen i `cloudflare/package.json`.
- Uppdaterade versionsnummer och cache till 14.0.6.2.

## 14.0.6.1

- Bioväder och Badhusväder ligger nu sist i aktivitetsväljaren.
- Båda inomhuskategorierna använder omvänd poängsättning och lyfter fram de platser som har sämst utomhusväder.
- Regn, blåst, kyla, mulet väder och åskrisk höjer inomhusbetyget.
- Beslutsförklaringarna har fått en lättsam ton som förklarar skämtet.
- Ingen Supabase-migration krävs.

## 14.0.6

- Kustväder använder nu en ljus pastellrosa aktivitetsprofil.
- Ny kategori: Bioväder med egen pastellvinröd färg, ikon och poängmodell.
- Ny kategori: Badhusväder med en mörkare pastellvinröd färg, ikon och poängmodell.
- Beslutsförklaringar och aktivitetsväljare har uppdaterats.
- Ingen Supabase-migration krävs.

## 14.0.5.1

- Rättar att bekräftelsen för provperioden inte ändrade kontots status.
- Skyddstriggern tillåter nu kontrollerade åtkomständringar via säkerhetsdefinierade RPC-funktioner.
- Aktiveringsknappen visar pågående status och tydliga felmeddelanden.
- Ny migration: `20260731_140501_trial_activation_fix.sql`.

## 14.0.5

- Nya konton börjar som Gratis utan automatisk provperiod.
- Användaren kan själv starta en tre dagar lång Premium-provperiod.
- Provperioden kan endast användas en gång per konto.
- Aktiv provperiod övergår automatiskt till Premium om förnyelsen inte avslutas.
- Möjlighet att avsluta automatisk förnyelse under provperioden.
- Tydligare abonnemangsstatus och villkor i profil- och Premium-dialogen.
- Ny migration: `20260731_1405_subscription_trial_flow.sql`.

## 14.0.4

- Gemensam Premium-behörighetskontroll för Free, Trial, Premium, VIP och Admin.
- Premium-sida med priset 29 kr/månad.
- Förberett gränssnitt för framtida App Store- och Google Play-betalningar.

## 14.0.3

- Visningsnamn i profilen.
- Molnsynk av användarens inställningar.
