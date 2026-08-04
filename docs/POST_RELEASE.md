# Post-release

## Direkt efter publicering

- [ ] Installera butiksversionen som ny användare och som uppgraderande användare.
- [ ] Verifiera version/build, API/Worker-version, forecast, karta och kontoflöde.
- [ ] Testa ett riktigt Free-flöde och ett kontrollerat Premiumköp, restore och manage.
- [ ] Kontrollera att Premium/Admin inte initierar eller visar reklam och att Free följer CMP-val.
- [ ] Kontrollera App Store Server Notifications V2 och Google RTDN utan att logga råa tokens.
- [ ] Bekräfta att support-, privacy-, terms- och delete-account-länkar fungerar från butik och app.

## Första 72 timmarna

- [ ] Följ Worker/Supabase-fel, authfel, köpverifiering, annonsfel, krascher och supportärenden.
- [ ] Jämför signaler mot baseline och dokumentera incidenter.
- [ ] Svara på butiksfeedback sakligt; ändra inte metadata eller juridik utan versionsstyrning.
- [ ] Aktivera rollback enligt `docs/ROLLBACK.md` vid dataskada, auth-/köpfel eller allvarlig regression.

Ingen rå persondata, kvitto-/purchase token eller hemlighet får kopieras till publika issues eller loggrapporter.
