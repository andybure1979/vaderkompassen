# TestFlight-checklista – v15.0.3

Status: **MANUAL ACTION REQUIRED**. READY får endast sättas när Archive och Validate lyckats, build 5 laddats upp och processats samt en intern testare har installerat den.

## App Store Connect

- [ ] App finns med bundle-ID `se.vaderkompassen.app`.
- [ ] Agreements, Tax and Banking är klara för prenumerationer.
- [ ] Rätt användare/roller, intern testgrupp och senare extern grupp finns.
- [ ] App Privacy, export compliance, åldersklassificering, reviewinfo och testkonto är ifyllda.
- [ ] Beta-beskrivning och feedback-e-post är angivna utan credentials i Git.
- [ ] StoreKit-produkt, pris, abonnemangsgrupp och Sandboxkonto är aktiva.

## Build

- [ ] `npm run ios:archive-check`, Archive och Validate App lyckas.
- [ ] Build 5 laddas upp manuellt från Organizer.
- [ ] Builden processas utan blockerande varningar.
- [ ] Intern testare kan installera och starta appen.

## Testmatris

- [ ] Appstart, forecast, offlinefel, bakgrund/resume och nätverksbyte.
- [ ] Free: idag/en region; Premium: alla dagar/flera regioner.
- [ ] Registrering, verifieringsmail, login/logout, reset, deeplink och sessionsåterställning.
- [ ] StoreKit Sandbox: produkt/pris, köp, avbrott, pending, restore, manage, cancel, grace, expired, revoked och ny enhet.
- [ ] Karta och externa kartappar utan krasch.
- [ ] Profil, support/legal och kontoborttagning.
- [ ] VoiceOver, större text, fokus, touchytor, kontrast och textklippning på stödda iPhone-storlekar.

Extern TestFlight kräver dessutom Beta App Review och får inte startas innan intern testning är godkänd.
