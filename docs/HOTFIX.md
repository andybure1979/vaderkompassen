# Hotfix – Väderkompassen

1. Skapa `codex/v15.0.1-<kort-fel>` från aktuell produktions-`main`.
2. Begränsa ändringen till den blockerande rättningen. Ändra inte poäng, ranking eller produktmodell.
3. Uppdatera publik version till 15.0.1 och öka iOS build samt Android versionCode.
4. Kör syntax, `npm test`, platsvalidering, versionssynk, production-config, security, compliance och webbbuild.
5. Synka nativeprojekten. Kör iOS simulator/osignerad kontroll och Android debug/release/AAB där verktyg och signing finns.
6. Verifiera staging med Free, Premium, Auth, kontoborttagning, cache och relevant felfall.
7. Skapa en liten PR med rotorsak, risk, tester och rollbacksteg. Kräv godkännande före merge.
8. Publicera först TestFlight och Google Internal Testing när hotfixen påverkar nativekod; kontrollera därefter produktion.
9. Uppdatera CHANGELOG, butiksnotiser vid användarpåverkan och driftinformationen.
10. Gör efteranalys med upptäckt, tidslinje, påverkan, varför tester missade felet och förebyggande åtgärd.

Lägg aldrig certifikat, provisioning profiles, keystore, lösenord, tokens eller providerpayload i Git.
