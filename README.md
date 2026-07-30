## Version 13.8.3 – regional snapshot och CPU-korrigering

Den här versionen minskar CPU-belastningen i `GET /v1/forecast`. Workern sparar prognosen både som komplett snapshot och som regionala del-snapshots. Prognosanrop läser bara de regioner användaren har valt i stället för hela databasen med 500 orter.

- Samma 500 orter och samma rankingmotor.
- Samma API-svar och högst 75 resultat per dag.
- Bakåtkompatibel reserv till komplett snapshot tills första nya uppdateringen har körts.
- Inga ändringar i appens design eller filterfunktion.

## Version 13.8.1 – kartzoom och UX-finputsning

500 prognosorter med bibehållna aktivitetsfilter.

# Väderkompassen för iPhone

Detta är en mobilanpassad PWA (Progressive Web App). Den öppnas i Safari och kan läggas på iPhones hemskärm.

## Publicera enklast

Appen måste ligga på en webbserver med HTTPS. Tre enkla alternativ:

### Netlify Drop
1. Packa upp zip-filen.
2. Gå till Netlify Drop på en dator.
3. Dra hela mappen `Vaderkompassen_iPhone` till sidan.
4. Netlify ger dig en webbadress.
5. Öppna adressen i Safari på iPhone.

### GitHub Pages
Ladda upp filerna till ett GitHub-repository och aktivera Pages under repository-inställningarna.

### Egen webbserver
Ladda upp samtliga filer till en katalog på din webbserver. Ingen Python eller databas behövs.

## Lägg till som app på iPhone

1. Öppna webbadressen i Safari.
2. Tryck på delningsknappen.
3. Välj **Lägg till på hemskärmen**.
4. Aktivera **Öppna som webbapp** om valet visas.
5. Tryck **Lägg till**.

## Funktioner

- Anpassad för iPhone-skärm och säkra skärmkanter.
- Jämför SMHI, Yr/MET Norway, DMI, ECMWF, ICON och GFS.
- Visar sju dagar, bästa platsen och en topplista.
- Sparar dina val av temperatur, regn, sol, vind och länder.
- Kan öppnas från hemskärmen som en fristående app.
- Appskalet fungerar offline, men en ny prognos kräver internet.

## Viktigt

`index.html` kan inte öppnas direkt från appen Filer med full funktion. Den behöver publiceras via HTTPS för att service worker och hemskärmsinstallation ska fungera korrekt.


## Version 5
- Marine API: våghöjd, vågperiod, dyning och havstemperatur
- Snödata: snödjup, nysnö och nollgradersnivå
- Specialiserade topplistor för kust/surf/båt/fiske och skidor


## Version 6
- ”Bäst väder” heter nu ”Sol och bad”
- Landsspecifik modellviktning:
  - Sverige: SMHI/MetCoOp 3,5×
  - Danmark: DMI 3,5×
  - Norge: Yr/MET Norway 3,5× när norska orter läggs till
- ECMWF väger 1,25× och övriga stödmodeller 1×
- Dominerande prognoskälla visas i resultatet


## Version 7
- Danmark uppdelat i Jylland, Fyn och Själland
- Interaktiv Leaflet-karta med färgmarkörer efter aktivitetspoäng
- Prognosanrop görs i grupper om 45 orter för att stödja större ortsregister
- Tydlig uppdateringsbanner och versionsparametrar för Safari/PWA
- Service worker kan aktivera ny version direkt

## Version 8
- Valbara prognoskällor i Inställningar
- Automatiskt läge använder alla källor och nationell viktning
- Eget val använder endast markerade källor med lika vikt
- Valet sparas lokalt på enheten
- Resultatet visar vilka källor som användes
- Säkerhetsindikatorn beräknas bara från aktiva källor
- Service worker och cache uppdaterade till v8

## Version 9
- Norge tillagt med Østlandet, Sørlandet, Vestlandet, Trøndelag och Nord-Norge
- Yr / MET Norway tillagt som valbar prognoskälla
- Snabbfilter för hela Sverige, hela Danmark och hela Norge
- Svenska regioner har landskapsfilter
- Danska och norska landsdelar har regionala underfilter
- Norska kust- och skidorter har havs- respektive snödata
- Cache och service worker uppdaterade till v9


## Version 10
- SMHI återinfört som separat prognoskälla via SMHI Open Data PMP3G.
- Automatläget prioriterar SMHI i Sverige, Yr/MET Norway i Norge och DMI i Danmark.
- SMHI hämtas endast för svenska orter; övriga källor fortsätter via Open-Meteo.
- Ikonvägar i manifest, HTML och service worker korrigerade för GitHub Pages.
- Cache och versionsparametrar uppdaterade till v10.


## Version 10.1
- Yr och DMI använder nu sina dedikerade Open-Meteo-endpoints.
- Källstatus visar exakt vilka prognoskällor som svarar eller saknas.


## Version 12.1

- Versionsnumret visas diskret längst ned på sidan.
- App-, CSS- och service worker-versioner synkroniserade till v12.1.
- PWA-cachen uppdaterad så att den nya versionen laddas korrekt.
- Prognosanrop har en tidsgräns och ett automatiskt återförsök vid tillfälliga nätverks- eller serverfel.
- SMHI, Yr/DMI och stödmodeller rapporterar tydligare fel per källa utan att stoppa övriga fungerande prognoser.
- Webbläsarcache kring prognos-API:erna kringgås så att användaren får aktuell källstatus.


## Version 12.2
- Surfprognosen visar dominant vågriktning.
- Surfpoängen premierar högre vågor samt starkare vind som blåser från land mot hav.
- Frånlandsvind beräknas individuellt per kustort utifrån ortens och havspunktens koordinater.


## v12.2.2
- Hårda tidsgränser per väderkälla.
- Källor laddas oberoende och kan inte blockera hela appen.
- Kortare och begränsad backoff vid HTTP 429.
- Havs- och snödata har separata tidsgränser.


## v12.2.6
- Rätt versionsmärkning i sidfot, resurser och PWA-cache.
- Områdesbalanserat ortsurval: minst en prognosort per valt område.
- Upp till 24 svenska SMHI-orter och 18 MET Norway-orter per land.
- Lägre parallellitet för MET Norway för stabilitet utan att minska täckningen till 1–3 orter.


## v12.2.6
- Visar senast sparade väderdata direkt vid sidladdning.
- Siduppdatering utlöser inte längre ett nytt liveanrop när giltig cache finns.
- Försöker uppdatera väderdata i bakgrunden var 30:e minut medan appen är aktiv.
- Misslyckad bakgrundsuppdatering behåller den senast fungerande prognosen.
- Ny hämtning sker direkt endast första gången eller när inställningarna ändras och ingen matchande cache finns.


## v12.2.8
- Alla valda orter hämtas åter från de nationella punktkällorna.
- 30-minuterscachen behålls och sidladdning visar sparad prognos direkt.
- Full uppdatering körs med högst fyra samtidiga punktanrop per källa.
- Status visar uppdaterade prognosorter i förhållande till antal valda orter.
- Havs- och snödata hämtas för alla relevanta valda orter.


## v12.2.8
- Alla valda orter hämtas i en kontrollerad bakgrundskö.
- Varje lyckad ort sparas separat, så partiella uppdateringar inte går förlorade.
- Tidigare sparad punktprognos används om en enskild ort tillfälligt misslyckas.
- 30-minuterscachen och direkt visning av senast fungerande resultat behålls.


## v12.2.9

- Kategorispecifika ortprofiler: varje aktivitet prioriterar destinationer som faktiskt passar aktiviteten.
- Sol och bad visar badorter vid kust, sjöar och populära badområden.
- Surf visar utpekade surfspots, båt och fiske visar vattennära destinationer.
- Cykling prioriterar cykelvänliga resmål och vandring prioriterar fjäll- och naturområden.
- Alla valda orter kan fortfarande hämtas och cachas; filtreringen sker i resultatlistan.
- Sol- och badpoängen väger nu även in badvänlig temperatur, sol, regn, vind och tillgänglig vattentemperatur.

## v13.1.0 – molnförberedd grund

- Valfri central prognos-API via `config.js`.
- Automatisk lokal reservmotor om molnet saknar data eller är otillgängligt.
- Cloudflare Worker med hälsoendpoint, prognosendpoint, skyddad snapshot-inmatning och 30-minuters Cron.
- Supabase-schema för prognossnapshots, användarprofiler, prenumerationsstatus, favoriter och notisinställningar.
- Hemliga nycklar hålls helt utanför klientappen.
- PWA-cache och versionsnummer uppdaterade till 13.1.0.
- Se `docs/DRIFTSTART.md` för installation.


## v13.1 – aktiv molnkoppling
Cloudflare Worker finns i `cloudflare/`, Supabase-migration i `supabase/migrations/` och driftinstruktioner i `docs/DRIFTSTART_V13_1.md`.

## Version 13.1.1 – molnbackend
- Cloudflare Worker med `/health`, `/v1/status` och `/v1/forecast`.
- Skyddad snapshot-endpoint och manuell driftkörning.
- Supabase-tabeller för prognossnapshots och Worker-körlogg.
- Cron var 30:e minut med körlogg och automatisk städning.
- Intern driftstatussida under `admin/`.
- Lokal prognosmotor finns kvar som säker reserv tills hela beräkningsmotorn är serverporterad.

## Version 13.2.0 – aktiv molnprognos
- Cloudflare Cron hämtar sju dygns prognos för samtliga orter var 30:e minut.
- Prognosen sparas som en gemensam snapshot i Supabase.
- Appen hämtar molnprognosen och använder lokal motor som reserv.
- `/v1/status` visar senaste snapshot och körlogg.
- `/v1/admin/run` kan starta en manuell uppdatering med `ADMIN_TOKEN`.
