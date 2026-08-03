# Roadmap

## Klart

- **14.0.0** Identitet, autentisering, profiler och roller.
- **14.0.1–14.0.2** Stabil konto- och profilupplevelse.
- **14.0.3** Kontoprofil och molnsynk.
- **14.0.4** Premiumgrund och behörighetsmodell.
- **14.0.5** Frivillig engångsprovperiod och prenumerationsflöde.
- **14.0.5.1** Rättad aktivering av provperiod via Supabase RPC.
- **14.0.6** Nya aktivitetskategorier och uppdaterade färgprofiler.
- **14.0.6.1** Inomhusväder sist i listan med omvänd väderpoäng.

- **14.0.8** Intelligent textsystem med aktivitetsspecifika och varierade rekommendationer.
- **14.0.9** Mobilanpassade, aktivitetsrelevanta faktaboxar i topplistan.
- **14.0.10** Kompakt V13-stil för topplistans faktavärden med tio kategorier kvar.
- **14.0.11** Synkroniserade faktavärden mellan vinnarkort och topplista.
- **14.0.12** Faktauppsättning som matchar V13-topplistans visuella referens.
- **14.0.13** Förbättrad, datanormaliserad modell för Fiskeväder.
- **14.1.0** Performance 2.0 med edge-cache, samordnade prognosanrop, säkra frontend-aborter och kompakt forecast-payload.
- **14.2.0** Prenumerationsgrund med serverentitlement, korrekt uppsägning och testprovider utan debitering.
- **14.3.0** Säker Adminvy med separat VIP-entitlement, användaradministration, driftkontroll och revisionslogg.
- **14.3.1** Worker runtime-fix för 10 ms CPU och begränsat antal externa cron-anrop.
- **14.3.2** Åtkomlig Premiumstatus för Admin, VIP och befintliga prenumerationslägen.
- **14.3.3** Solid adminbakgrund, cachebrytning och rättad användardetalj-RPC.
- **14.3.4** Datavillkorad vattentemperatur i bad-, kust-, surf- och fiskekort.
- **14.3.5** Enkel Free/Premium-delning: idag och en region för Free, alla dagar och flera regioner för Premium samt molnsynk och reklamplatser efter entitlement.
- **14.3.6** Skalbar forecasttransport med endags-Free, färdigbyggda rankingar, snapshot-ID, ETag/304, SWR, adaptiv polling och lasttest.
- **14.4.0** Native appgrund med Capacitor 8, iOS/Android-projekt, native Auth/livscykel/navigation, säkra köp-/annonsstubbar, kontoborttagning och CI.
- **14.4.1** Centralt platsregister med 500 bevarade Free-platser, 500 Premiumkandidater, strikt kvalitetsgrind och serververifierad platsåtkomst.
- **14.4.2** Snapshot-säkerhet som förhindrar publicering av tomma eller ofullständiga prognoskörningar och rättar komplett fallback.
- **14.4.3** Fullt källgranskat register med 500 Freeplatser och 500 aktiva Premiumplatser.
- **14.4.4** Begränsad Open-Meteo-samtidighet, säker retry och komplett feldiagnostik för snapshotjobb.
- **14.4.5** Prognosens snapshotjobb körs en gång per hel timme för lägre leverantörs- och Workerbelastning.
- **14.5.0 RC** Store-compliancekod, juridik-/supportsidor, butiksunderlag och blockerande releasekontroller. Publik butiksproduktion väntar på juridik, signing, butiksköp, samtycke och assets.
- **15.0.0 release freeze** Endast blockerande fel, säkerhet, datakvalitet, compliance, bygg och riskfri prestanda får ändras. Inga nya aktiviteter, poängmodeller, datakällor, Premiumförmåner, adminfunktioner eller UI-koncept.
- **15.1.0 eller senare** Produktönskemål och större förbättringar tas först efter stabiliserad publik lansering.

## Nästa

- **14.2.x** Native iOS-/Android-gräns, butikskatalog och testmiljöer.
- **Senare** StoreKit 2, Google Play Billing, serververifiering, App Store Server Notifications V2 och Google RTDN.

- **14.0.7** Förklarade rekommendationer och mänskliga omdömen.
