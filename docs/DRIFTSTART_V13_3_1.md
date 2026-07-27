# Väderkompassen v13.3.1 – korrigerad Cloudflare-publicering

## Vad som rättats

Repositoryts rotfil `wrangler.jsonc` pekar nu på den riktiga Worker-koden:

`cloudflare/src/index.js`

Samma Cloudflare-projekt publicerar därför både webbappen och API-endpointsen. Cron körs var 30:e minut.

## Cloudflare-hemligheter

Kontrollera under Worker → Settings → Variables and Secrets att följande finns:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_TOKEN`

De ska vara satta på Worker-projektet `vaderkompassen`.

## Kontroll efter deployment

Öppna:

- `/health`
- `/v1/status`
- `/v1/verify`
- `/v1/forecast`

`/v1/verify` ska ge `ok: true` när minst en snapshot har skapats.

Om ingen snapshot finns ännu: kör `/v1/admin/run` som POST med `x-admin-token`, eller invänta nästa Cron-körning.

I appen kan statusen bredvid versionsnumret tryckas för att visa den exakta felorsaken.
