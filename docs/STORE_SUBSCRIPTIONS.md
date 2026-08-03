# Butikskonfiguration för prenumerationer

Centrala produkt-ID:n i `subscription-providers.js`:

- Apple: `se.vaderkompassen.premium.monthly`
- Google: `premium_monthly`
- Internt test (inte butik): `premium_monthly_test`

## Apple – manuellt

Skapa Subscription Group och månadsprodukt med exakt ID, lokalisering, pris och eventuell tre dagars introduktionsperiod. Konfigurera App Store Server Notifications V2 till verifierad backend, sandbox-testare samt Agreements, Tax and Banking. Implementera StoreKit 2-plugin, transaktionsverifiering och idempotent serversynk. Testa köp, renewal, cancellation, billing retry, refund, restore och konto-/butiksseparation.

## Google – manuellt

Skapa subscription med exakt ID, base plan, eventuell trial/offer, priser och länder. Konfigurera Google Play Billing, Play Developer API, RTDN, säker backendverifiering, licenstestare och betalningsprofil. Testa samma livscykler som ovan.

Production mode får inte aktiveras innan portalprodukter, native SDK, backendverifiering och notiser fungerar. Pris i UI ska komma från butikens signerade produktdata, aldrig från den planerade 29-kronorsreferensen.
