# Google Play Internal Testing – v15.0.4

Status: **MANUAL ACTION REQUIRED**. Markera inte releasen READY förrän hela listan är verifierad.

1. Öppna/skapa Play Console-appen med package name `se.vaderkompassen.app`.
2. Aktivera Play App Signing och registrera upload certificate.
3. Skapa Internal Testing-track och en testlista med godkända Google-konton.
4. Skapa/aktivera `premium_monthly`, base plan `monthly` och eventuellt offer `premium_trial_3_days`.
5. Bygg signerad AAB med `npm run android:bundle:release` och ladda upp den manuellt.
6. Kontrollera att Play accepterar versionName 15.0.4/versionCode 15004, target 36 och package name.
7. Fyll svenska release notes, policyuppgifter, Data Safety, IARC, kontoborttagnings-URL och eventuella varningar.
8. Publicera till intern test, öppna testlänken på Androidenheten och installera från Google Play.
9. Verifiera login, forecast, Free/Premium, deeplink, karta, profil och kontoborttagning.
10. Verifiera ProductDetails/lokaliserat pris, köp, user cancelled, pending, backendverifiering, acknowledgement, restore, manage subscription, cancelled-active, renewal, grace, account hold, expired, revoke/refund och installation på ny enhet.

READY kräver accepterad signerad AAB, Play-installerad testbuild, fungerande testkonto och att Billingprodukten kan hämtas. Lokal debuginstallation är inte bevis för Google Billing.
