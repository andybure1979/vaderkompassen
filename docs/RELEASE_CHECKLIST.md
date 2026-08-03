# Release checklist v14.5.0 RC

Markera inte externa steg som klara utan bevis.

## Kod

- [ ] `npm ci`, tester, syntax, versionssynk och build godkända
- [ ] `check:store-compliance`, `check:production-config`, `security:release-check` granskade
- [ ] Inga secrets, debugfunktioner eller blockerande TODO

## Backend/Auth

- [ ] Migrationer verifierade i staging och production
- [ ] Worker 14.5.0 deployad; cache och komplett 1 000-platssnapshot verifierade
- [ ] Entitlement: Free, Trial, Premium, cancelled_active, expired, VIP och Admin
- [ ] Registrering, verifieringsmejl, login/logout, reset, deeplink
- [ ] Kontoborttagning i app och publicerad extern URL

## Premium och reklam

- [ ] Sandboxköp, trial, restore, manage, renewal/cancel/refund verifierade
- [ ] Inga falska butiksköp; butikspris och intervall visas från produktdata
- [ ] Reklam endast Free; inga produktionsannonser i test; samtycke och placering godkända

## iOS

- [ ] Signing/team, bundle ID, buildnummer, archive
- [ ] Ikon, privacy manifest/answers, age rating, skärmbilder, review notes
- [ ] TestFlight genomfört

## Android

- [ ] Signing/keystore lokalt, package ID, target SDK, signerad AAB
- [ ] Merged permissions, Data Safety, IARC, account deletion URL
- [ ] Ikon/feature graphic/skärmbilder och Internal/Closed Testing

## Juridik

- [ ] Privacy, villkor, support och kontakt juridiskt granskade och publicerade på HTTPS
- [ ] Lagringstider, ansvarig aktör, lagval och prenumerationsvillkor fastställda
