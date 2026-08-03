# Release checklist v15.0.2

Markera inte externa steg som klara utan bevis.

## Kod

- [ ] `npm ci`, tester, syntax, versionssynk och build godkända
- [ ] `check:store-compliance`, `check:production-config`, `security:release-check` granskade
- [ ] Inga secrets, debugfunktioner eller blockerande TODO

## Backend/Auth

- [ ] Migrationer verifierade i staging och production
- [ ] Worker 15.0.0 deployad; cache och komplett 1 000-platssnapshot verifierade
- [ ] Entitlement: Free, Trial, Premium, cancelled_active, expired, VIP och Admin
- [ ] Registrering, verifieringsmejl, login/logout, reset, deeplink
- [ ] Kontoborttagning i app och publicerad extern URL

## Premium och reklam

- [ ] Google Play-produkt/base plan/offer, servicekonto och `subscriptionsv2.get` verifierade
- [ ] RTDN Pub/Sub OIDC, idempotens och Developer API-återhämtning verifierade
- [ ] `20260803_1502_google_play_billing.sql` körd och RLS/RPC-behörighet verifierad
- [ ] App Store Server API och Notifications V2 verifierade med rätt miljö, bundle/app-ID och produkt
- [ ] `20260803_1501_apple_storekit.sql` körd och RLS/RPC-behörighet verifierad
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
