# Ändringslogg

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
