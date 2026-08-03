# StoreKit 2 och Apple-prenumerationer – v15.0.1

Status: **BLOCKED för App Store-publicering** tills App Store Connect, Worker-hemligheter, Supabase-migration, full Xcode-build och Sandbox-test är verifierade. Koden aktiverar inte Premium från ett lokalt kvitto; Workern och Apples servrar är sanningskälla.

## Arkitektur

1. iOS hämtar produkten `se.vaderkompassen.premium.monthly` med StoreKit 2 och visar Apples lokaliserade pris, period och introduktionserbjudande.
2. Vid köp skickas användarens Supabase-UUID som StoreKit `appAccountToken`.
3. Native-koden verifierar StoreKit-transaktionen lokalt och skickar dess signerade JWS till Workern endast som transaktionsreferens.
4. Workern hämtar aktuell status från App Store Server API och verifierar Apples signerade transaktions- och förnyelsedata med Apples publika rotcertifikat.
5. Endast den service-role-skyddade RPC:n `sync_apple_subscription()` får skriva providerstatus. Frontend laddar sedan om central entitlement från `get_user_entitlement()`.
6. App Store Server Notifications V2 går till `/v1/subscriptions/apple/notifications`. Varje notifiering verifieras, aktuell status hämtas åter från Apple och händelsens UUID dedupliceras.

Rå JWS, privat Apple-nyckel och fulla providerpayloads lagras inte i klienten eller databasen. VIP och Admin fortsätter vara separata administrativa entitlements och fabricerar aldrig Apple-köp.

## Statusmappning

- Aktiv kostnadsfri introduktionsperiod → `trialing`.
- Aktiv och automatisk förnyelse på → `active`.
- Aktiv till periodslut men automatisk förnyelse av → `cancelled_active`.
- Giltig billing grace period → `grace_period`.
- Billing retry utan giltig grace, utgången eller återkallad/återbetald → ingen Premiumåtkomst.

## App Store Connect

1. Skapa en abonnemangsgrupp och auto-renewable subscription med produkt-ID `se.vaderkompassen.premium.monthly` för bundle-ID `se.vaderkompassen.app`.
2. Fyll pris, lokalisering, granskningsbild och eventuellt introduktionserbjudande.
3. Skapa en In-App Purchase-nyckel och registrera Notifications V2-URL:en.
4. Sätt Worker-variablerna `APPLE_ENVIRONMENT=Sandbox` i test respektive `Production` i produktion, `APPLE_BUNDLE_ID`, `APPLE_PRODUCT_ID` och numeriskt `APPLE_APP_ID`.
5. Sätt Worker-hemligheterna `APPLE_IAP_KEY_ID`, `APPLE_IAP_ISSUER_ID` och `APPLE_IAP_PRIVATE_KEY`. De får aldrig läggas i Git eller frontend.
6. Kör `supabase/migrations/20260803_1501_apple_storekit.sql` och därefter `npm run cap:ios:storekit`.

Production-Worker vägrar Sandbox-konfiguration. iOS-köpvägen ska inte aktiveras i en distribuerad build innan alla steg är verifierade.

## Obligatoriska Sandbox-tester

- Nytt köp och introduktionsperiod.
- Pending/Ask to Buy utan förtida Premium.
- Återställ köp efter ominstallation och på en andra enhet.
- Automatisk förnyelse, uppsägning med åtkomst till periodslut och utgång.
- Billing retry och grace period.
- Refund/revoke som tar bort åtkomst.
- Dubbletter och omkastad ordning på Notifications V2.
- Fel produkt, fel bundle/app-ID, fel `appAccountToken` och ogiltig JWS ska nekas.
- Trial, Premium, VIP och Admin ska fortsätta ge samma Premiumfunktioner; Free ska förbli Free.

## Hantera och återställ

“Återställ köp” använder `AppStore.sync()` och synkar därefter serverstatus. “Hantera abonnemang” öppnar Apples officiella prenumerationsvy. Ingen lokal flagga kan ge Premium.

Officiella referenser: [StoreKit](https://developer.apple.com/documentation/storekit), [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi), [App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications) och [Apples officiella Node-bibliotek](https://github.com/apple/app-store-server-library-node).
