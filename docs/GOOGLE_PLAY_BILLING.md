# Google Play Billing – v15.0.2

Status: **MANUAL ACTION REQUIRED** för Internal Testing och **BLOCKED** för produktion tills Play Console-produkt, licenstestare, servicekonto, RTDN och signerad Androidbuild har verifierats. Repot innehåller det tekniska flödet men skapar inga externa resurser.

## Implementerat i repot

- Egen Capacitor-nativebrygga mot officiella Google Play Billing Library 9.1.0.
- ProductDetails, base plans, offers/trial, lokaliserat pris, pending, purchase updates, restore/sync och officiell hanteringslänk.
- Produkt `premium_monthly`, base plan `monthly`, planerat trial offer `premium_trial_3_days`.
- Backendverifiering med `purchases.subscriptionsv2.get` och service account OAuth.
- Klienten ger aldrig Premium. Central entitlement uppdateras endast genom service-role-RPC efter verifiering.
- Acknowledgement sker i Android först efter lyckad backendverifiering; redan acknowledged köp hoppas över.
- RTDN verifierar Pub/Sub OIDC-identitet, deduplicerar `messageId` och hämtar alltid aktuell status från Developer API.
- Purchase token lagras eller loggas aldrig i klartext; databasen använder SHA-256-hash. `obfuscatedAccountId` är SHA-256 av Supabase user ID, aldrig e-post.

## Play Console – Andreas gör manuellt

1. Skapa/verifiera appen med package name `se.vaderkompassen.app`.
2. Skapa subscription `premium_monthly`, base plan `monthly` och vid beslut trial offer `premium_trial_3_days` med tre dagar.
3. Ange priser/länder, aktivera produkten och kontrollera tillgänglighet för rätt build.
4. Lägg till licenstestare och publicera signerad build till Internal Testing.
5. Testa produktdata, köp, avbrott, pending, already owned, restore, förnyelse, uppsägning, grace, account hold, pause, expired och revoke/refund.

UI visar trial endast när Billing returnerar ett giltigt offer. Priset kommer alltid från Play och hårdkodas inte.

## Google Cloud och RTDN – Andreas gör manuellt

1. Välj ett godkänt Google Cloud-projekt och aktivera Google Play Android Developer API.
2. Skapa ett servicekonto och ge minsta nödvändiga prenumerationsrättigheter i Play Console.
3. Skapa Pub/Sub-topic och push-subscription; ge Google Play rätt att publicera.
4. Sätt RTDN-topic i Play Console och push-URL till `POST /v1/subscriptions/google/rtdn`.
5. Konfigurera Pub/Sub push authentication med separat servicekonto och exakt audience.
6. Skicka testmeddelande och verifiera 200 samt idempotens för duplicerad `messageId`.

## Cloudflare-hemligheter

Lägg endast i Worker secret store: `GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_RTDN_AUDIENCE`, `GOOGLE_RTDN_SERVICE_ACCOUNT_EMAIL`.

Icke-hemliga productionvariabler ligger i Wrangler: `GOOGLE_PLAY_ENVIRONMENT=Production`, `GOOGLE_PLAY_PACKAGE_NAME=se.vaderkompassen.app`, `GOOGLE_PLAY_PRODUCT_ID=premium_monthly`. Production vägrar testmiljö.

## Supabase och endpoints

Kör `supabase/migrations/20260803_1502_google_play_billing.sql` efter v15.0.1. Endpoints är `POST /v1/subscriptions/google/verify` för inloggad klient och `POST /v1/subscriptions/google/rtdn` för autentiserad Pub/Sub. Direkt klientskrivning till subscriptions, audit och notification events är förbjuden.

## Kvarvarande testgräns

Lokala tester kan verifiera mapping, säkerhetskontrakt, SQL, JavaScript, Worker-bundle och Androidkompilering. Verklig ProductDetails, debitering, licensstatus, acknowledgement mot Play, Developer API-svar och RTDN kan bara godkännas med ovanstående externa resurser.

Officiella referenser: [Billing 9.1 release notes](https://developer.android.com/google/play/billing/release-notes), [integrationsguide](https://developer.android.com/google/play/billing/integrate), [backend](https://developer.android.com/google/play/billing/backend), [subscriptionsv2.get](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2/get) och [RTDN](https://developer.android.com/google/play/billing/rtdn-reference).
