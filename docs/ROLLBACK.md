# Rollback – Väderkompassen 15.0.0

Rollback ska beslutas av releaseansvarig när en produktionseffekt är större än risken med återgång. Bevara alltid senaste friska snapshot och exportera aldrig hemligheter till logg eller Git.

## Worker

1. Identifiera senaste friska Cloudflare Worker-deployment med `wrangler deployments list`.
2. Rulla tillbaka via Cloudflare Deployments eller `wrangler rollback <version-id>`.
3. Verifiera `/health`, `WorkerVersion`, forecast, ETag/304 och aktuell snapshot innan incidenten stängs.
4. Kör inte ett manuellt snapshotjobb om leverantören eller täckningen är osäker.

## Webb/PWA

1. Revertera den felaktiga mergecommiten på en hotfixgren; skriv inte om `main`-historiken.
2. Kör webbbuild, tester och versionskontroll och merga den godkända reverten.
3. Verifiera GitHub Pages och service-worker-cache. En hotfix ska använda nytt patchnummer så klienter lämnar den felaktiga cachen.

## Snapshot och databas

- En ofullständig snapshot får aldrig publiceras. Publiceringsspärren ska lämnas aktiv.
- Behåll senaste friska `activity=all`-snapshot och dess färdiga rankingversion.
- Supabase-migrationer är framåtriktade. Revertera inte destruktivt i produktion; skapa en granskad kompensationsmigration.
- RLS-, audit- och entitlementmigrationer får inte tas bort under incident utan separat säkerhetsgranskning.

## Stäng köp eller annonser

- Sätt produktionens `subscriptionMode` till `disabled` om providerverifiering är osäker. Redan köpta entitlements hanteras server-side och får inte fabriceras eller raderas.
- Stäng annonsinitiering med `adsMode=disabled`. Premium ska fortsatt sakna annonsyta.
- Ändra feature flags i deploymentkonfigurationen, inte genom hemliga klientvärden.

Dokumentera tid, orsak, versioner, snapshot-ID, beslut, verifiering och uppföljning i incidentloggen.
