# AdMob och samtycke (CMP) – v15.0.5

## Annonsfri första productionrelease

iOS 15.0.6 build 8 byggs utan Capacitor AdMob-pluginen, Google Mobile Ads SDK och UMP när `VK_ADS_MODE=disabled`. Capacitors `capacitor:sync:after`-hook tar då bort native AdMob-beroendet och `GADApplicationIdentifier` från productionprojektet. Inget test- eller produktions-App-ID paketeras. Free och Premium är båda annonsfria.

Development/staging kan fortsatt använda pluginen med `VK_ADS_MODE=test` och `VK_ADS_ENABLED=true`. Då används endast Googles officiella test-App-ID och test-annons-ID:n. Ett senare produktionsinförande kräver separat godkännande och riktiga ID:n.

Väderkompassen använder `@capacitor-community/admob` 8.0.0 som Capacitor-brygga till Google Mobile Ads SDK och Google User Messaging Platform (UMP). Produktionsannonser är **BLOCKED** och fail-closed tills riktiga plattformsspecifika ID:n, publicerade CMP-meddelanden och butikernas deklarationer är verifierade.

## Runtimeflöde

Central `AdsController` väntar på ett verifierat `vk:access-changed` innan en provider väljs. Free/expired/revoked kan använda annonser. Trial, aktiv eller uppsagd-men-fortsatt Premium, grace med åtkomst, VIP och Admin använder `NoAdsProvider`; annonsobjekt förstörs direkt vid uppgradering.

Native Free begär aktuell UMP-information. Om formulär krävs visas det. AdMob initieras först när UMP returnerar `canRequestAds=true`. Vid timeout, nätverksfel, okänt samtycke eller saknad konfiguration visas ingen annons; väderfunktionerna fortsätter. Annonsrequesten använder icke-personanpassat läge när status inte uttryckligen är `OBTAINED`. UMP, inte en egen samtyckesboolean, är sanningskälla.

Webb kan visa en lokal, ospårande platshållare endast i uttryckligt `placeholder`-läge. Production är `disabled` som standard. Testläge får bara användas utanför production.

## Placeringar

- `main_bottom_banner`: adaptiv native-banner längst ned, högst en aktiv instans.
- `ranking_inline_native`: kontraktet och positionen efter resultat tre finns kvar. Plugin 8.0.0 saknar verifierat native-ad-API, så nativeappen visar ingen inlineannons. **MANUAL ACTION REQUIRED** innan placeringen kan aktiveras; ingen falsk nativeannons används.

## Barn, tracking och innehåll

Appen är inte särskilt riktad till barn. `tagForUnderAgeOfConsent` är inte satt som en påhittad ålderspolicy. Slutlig ålderspolicy kräver juridisk bedömning. ATT begärs inte rutinmässigt; första releasen ska kunna använda kontextuella/icke-personanpassade annonser utan trackingtillstånd. Maximal annonsinnehållsklassificering och leverantörsval ska sättas konservativt i AdMob och granskas manuellt.

Google Mobile Ads kan behandla bland annat IP-adress/ungefärlig plats, enhets- och annonsidentifierare när tillåtet, annonsinteraktioner samt krasch- och prestandadiagnostik. Väderkompassen loggar endast providerstatus, samtyckesstatus, placementstatus och säker felkod – aldrig advertising ID, auth-token eller samtyckessträng.

**MANUAL ACTION REQUIRED:** juridisk granskning, AdMob Privacy & Messaging, App Store Privacy, Play Data Safety/Ads och den fullständiga aktuella SKAdNetwork-listan måste verifieras före produktionsannonser.
