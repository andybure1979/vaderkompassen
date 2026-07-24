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
- Jämför DMI, ECMWF, ICON, GFS och MET Norway.
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
