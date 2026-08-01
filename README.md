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
