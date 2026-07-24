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


## Version 11

- Versionsnumret visas diskret längst ned på sidan.
- App-, CSS- och service worker-versioner synkroniserade till v11.
- PWA-cachen uppdaterad så att den nya versionen laddas korrekt.
- Prognosanrop har en tidsgräns och ett automatiskt återförsök vid tillfälliga nätverks- eller serverfel.
- SMHI, Yr/DMI och stödmodeller rapporterar tydligare fel per källa utan att stoppa övriga fungerande prognoser.
- Webbläsarcache kring prognos-API:erna kringgås så att användaren får aktuell källstatus.
