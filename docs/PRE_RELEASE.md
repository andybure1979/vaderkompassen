# Pre-release – v15.0.6 Android RC (versionCode 15008)

## Kod och reproducerbarhet

- [x] Inga hemligheter eller genererade binärer är spårade; en sedan tidigare lokal iOS-projektändring ligger kvar utanför Android-RC:n.
- [x] `npm ci`, 126 tester, versionskontroll, webbbygg, native sync samt debug-, release- och AAB-build passerar.
- [x] Worker ligger kvar på 15.0.2 och ingen Worker-/väder-/ranking-/Premium-/Auth-logik har ändrats.
- [x] Signerad Android-AAB och dess SHA-256 är verifierade lokalt; commit dokumenteras efter skapande.

## Publiceringsunderlag

- [ ] Jurist har godkänt privacy, villkor, ansvarig aktör, adress, lagval, lagringstider och rättsliga grunder.
- [ ] Samtliga publika URL:er svarar och motsvarar repots godkända text.
- [ ] Apple/Google privacy, ålder, reklam och köpformulär matchar aktuell binär.
- [ ] Assets, metadata, testkonton, supportberedskap och release notes är godkända.
- [ ] Play Billing, servernotiser och signing är produktionsverifierade. AdMob/CMP är avstängda i den annonsfria första releasen.

## Regression

- [ ] Free/Premium/Admin, Auth, kartnavigation, offline, topplista och detaljvy är smoke-testade.
- [ ] Fiske, surf och skidväder visar oförändrade poäng/ranking och relevanta fakta.
- [ ] Rollback- och incidentplan är bemannad.

Aktuell Androidstatus: **READY FOR GOOGLE PLAY PRODUCTION** avseende lokala blockerande kontroller. Signerad AAB 15.0.6/15008 är verifierad. Uppladdning, Play App Signing, produkt/base plan/trial, köpflöden och aktuell Internal Testing-build kräver fortsatt manuell verifiering i Play Console.
