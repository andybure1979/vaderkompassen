# Väderkompassen v13.1.1 – driftstart

## 1. Kör migrationen
Kör `supabase/migrations/20260726_1311_backend.sql` i Supabase SQL Editor.

## 2. Cloudflare-konfiguration
Worker-projektets root directory ska vara `cloudflare`.

- Build command: `npm install`
- Deploy command: `npm run deploy`

Lägg följande som krypterade secrets i Cloudflare:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_TOKEN`

`ADMIN_TOKEN` ska vara en lång slumpmässig sträng. Lägg aldrig nycklarna i GitHub.

## 3. Testa
- `/health` – grundstatus
- `/v1/status` – databas- och körstatus
- `/v1/forecast` – senaste snapshot, eller 404 innan första snapshot sparats

## 4. Administratörssida
Öppna `admin/index.html` via samma webbhosting som appen. Sidan visar API-status och senaste Worker-körningar.

## 5. Cron
`wrangler.toml` kör Worker var 30:e minut. I v13.1.1 registrerar cron körstatus och rensar snapshots äldre än 14 dagar.

## Viktigt om prognosmotorn
Appen fortsätter tills vidare att räkna prognoser lokalt när molnet saknar snapshot. Worker-API:t och databasen är nu klara för central prognosberäkning. Själva fullständiga serverportningen av alla aktivitets-, havs-, snö- och modellviktningsberäkningar görs i nästa backendetapp, så att nuvarande resultat inte försämras genom en förenklad servermodell.
