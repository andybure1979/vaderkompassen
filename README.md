# Väderkompassen

Väderkompassen är en mobilanpassad PWA som hjälper användaren att välja **vart man ska åka idag** utifrån aktivitet, område och väderprognos.

## Aktuell version

**v13.10.12**

## Versionshistorik

### v13.10.12 – stabil kartvy och säker uppdatering efter inställningar

- Kartans markörer kan uppdateras utan att `fitBounds()` återställer en zoom eller panorering som användaren själv gjort.
- Automatisk kartanpassning sker bara första gången och när valet av regioner eller områden faktiskt ändras.
- Tar bort kvarvarande CSS som blockerade pekhändelser i kartans map- och tile-lager.
- Varje prognoshämtning får ett generationsnummer. Sena svar från äldre inställningar ignoreras och kan inte skriva över topplistan eller cachen.
- När inställningarna sparas startas alltid en ny prognoshämtning för de nya valen, även om en äldre hämtning fortfarande pågår.
- Ingen annan funktionalitet ändrad.

### v13.10.11 – återställd kartzoom

- Återställer nypzoom, dubbeltryckszoom, mushjulszoom och panorering i Leaflet-kartan.
- Tar bort en CSS-regel som gav kartans tile- och map-panes egna pekhändelser och kunde blockera touchgester i Safari.
- Kartans interaktionshanterare aktiveras på nytt efter att en dold karta har öppnats och storleken räknats om.
- Ingen annan funktionalitet ändrad.

### v13.10.10 – lagringsfix och automatisk återhämtning

- Grundorsaken till inställningsfelet åtgärdad: beständig punktcache kunde fylla Safaris `localStorage` till cirka 10 MB.
- Punktprognoser hålls nu endast i minnet under den aktuella sessionen och skrivs inte längre till `localStorage`.
- Gamla punktcacher och äldre vädercacheversioner rensas automatiskt vid appstart.
- Om inställningssparning träffar `QuotaExceededError` rensas endast appens cache, varefter sparningen försöks igen automatiskt.
- Användarens `vk-settings` bevaras alltid vid cache-rensning.
- Ingen annan funktionalitet ändrad.

### v13.10.9 – diagnostik för inställningssparning
- Visar det faktiska JavaScript-felets namn och meddelande när sparning misslyckas.
- Visar ungefärlig användning av webbläsarens lokala lagring.
- Ingen annan funktion eller sparlogik ändrad.

### v13.10.8 – stabil sparning av inställningar

- Sparknappen använder nu formulärets ordinarie `submit`-flöde.
- Valda länder, regioner och områden läses direkt från områdesrutorna.
- Automatiskt källäge sparar alltid samtliga tillgängliga prognoskällor.
- Sparningen verifieras i `localStorage` innan dialogen stängs.
- Felmeddelanden visas intill sparknappen så att de syns direkt.
- Inställningsdialogen stängs efter bekräftad sparning och prognosen uppdateras därefter.
- PWA-cache och versionsparametrar uppdaterade till 13.10.8.

### v13.10.7 – tidigare försök till inställningsfix

- Formulärets submit-flöde infördes.
- Förbättrad avläsning av valda områden.
- Problemet kvarstod i test och versionen ersätts av v13.10.8.

### v13.10.6 – klickbart vinnarkort och ren detaljvy

- Hela vinnarkortet öppnar detaljsidan.
- Knappen **Visa detaljsida** togs bort.
- Detaljsidan visar endast den ort som användaren valt.
- Tillbaka-navigeringen behåller topplistan och tidigare val.

### v13.10.5 – inställningsdialog och regionval

- Regiongrupper och delval synkroniserades.
- Knappar i inställningsdialogen fick explicit knapptyp.
- Minst ett område måste vara valt innan sparning.

### v13.10.4 – tillbaka till topplistan

- Återgång från detaljsidan visar topplistan med kartan stängd.
- Dag, aktivitet, filter och scrollposition bevaras.

### v13.10.3 – detaljnavigering

- Navigation mellan topplista och detaljsida infördes.
- Appens val och position återställs vid tillbaka-navigering.

## Kända problem

### Öppna

- v13.10.12 behöver verifieras på den publicerade iPhone/PWA-versionen: behållen nypzoom efter släpp samt automatisk topplisteuppdatering efter sparade inställningar.

### Lösta

- Kartans zoom kunde blockeras på touch-enheter av felaktig pekhändelsehantering i kartans lager.
- Full `localStorage` blockerade sparning av inställningar (`QuotaExceededError`).
- Vinnaren låg kvar ovanför vald ort på detaljsidan.
- Vinnarkortet krävde en separat knapp för att öppna detaljsidan.
- Tillbaka från detaljsidan kunde lämna kartan öppen.

## Roadmap

### v14.0 – Identity & Platform

- Supabase Auth
- Apple- och Google-inloggning
- E-post/lösenord
- Profil och roller
- Adminfunktioner

### v14.1 – Prenumerationer

- Tre dagars Premium-provperiod
- Premium 29 kr/månad
- VIP-roll

### v14.2 – Annonser

- Diskreta annonser för Free-användare
- Annonsfritt för Premium och VIP

### v14.3 – Publicering

- Förberedelser för appbutiker och produktionsdrift

## Installation

Appen ska publiceras via HTTPS, exempelvis GitHub Pages, Cloudflare Pages eller motsvarande. Öppna den publicerade adressen i Safari på iPhone och välj **Lägg till på hemskärmen**.
