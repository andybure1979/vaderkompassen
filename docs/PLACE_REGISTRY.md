# Platsregister v14.4.1

`data/places.json` är den enda redigerbara sanningskällan. `npm run places:build` skapar webbläsarasseten `place-registry.js` och Worker-modulen `cloudflare/src/place-registry.js`. De genererade filerna ska aldrig handredigeras.

## Modell

Varje post har stabilt `id`, namn, land/landskod, region, area, kommunreferens, koordinater, `placeType`, kategorier, vatten- och aktivitetsflaggor, prioritet/popularitet, källa, granskningsstatus, aktiveringsstatus och `accessTier`. Tillåtna `placeType` är `city`, `town`, `village`, `resort`, `coast`, `lake`, `river`, `harbour`, `fishing_water`, `hiking_area`, `mountain`, `surf_spot`, `ski_area`, `protected_area` och i sista hand `destination`.

De 500 tidigare platserna har stabila `free-{landskod}-{namn}`-ID:n eftersom den äldre implementationen saknade explicita ID:n. Namn, koordinater, area och region är oförändrade. De 500 nya kandidaterna använder sina GeoNames-baserade ID:n och `accessTier=premium`.

## Kvalitetsgrind

Statusarna är `verified`, `coordinate_verified`, `area_review_required`, `category_review_required`, `duplicate_review_required` och `disabled_pending_review`. En blockerande status kräver alltid `enabled=false`. Samma namn behåller unika ID:n och visas med kommunreferens eller area när förtydligande behövs.

Importen innehåller 300 svenska, 100 norska och 100 danska Premiumplatser. I v14.5.0 har samtliga 500 poster verifierats mot GeoNames officiella landdump: käll-ID, namn och koordinat måste matcha. Objekttyp och aktivitetskategorier följer GeoNames feature class/code, officiell admin2 används som kommunetikett när den finns och verkliga homonymer behålls med geografisk särskiljning. Alla 500 är `verified` och aktiva.

Kategorier har stramats åt vid import: sjöar och vattendrag får `fishing` men inte automatiskt `boat`; kust eller hamn får marina kategorier; breda destinationer får inte automatiskt bio eller badhus; surf och skidåkning kräver verifierad specialplats. Detta ändrar inte de gamla Free-kopplingarna.

## Åtkomst och drift

Free får aktiva Free-poster. Trial, Premium, VIP, Admin och giltig `cancelled_active` får dessutom aktiva Premium-poster. Workern verifierar bearer-session och `get_user_entitlement()` innan `access=premium` accepteras. Cache- och ETag-nyckeln innehåller `access=free|premium`; Free tvingas samtidigt till `days=1`.

Snapshotjobbet hämtar väder endast för aktiva registerposter. Marine API anropas endast när `marine=true`. `priority` och `popularity` är administrativa/presentationsfält och påverkar aldrig väderpoäng eller aktivitetsranking.

Kör `npm run validate:places` efter varje registerändring. Kommandot stoppar bygget vid fel antal, ogiltig modell, dubblett-ID, felaktiga koordinater, motsägande vattenflaggor eller aktiv blockerad post.
