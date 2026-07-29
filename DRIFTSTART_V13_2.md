# Driftstart Väderkompassen v13.2

1. Kör Supabase-migrationerna i nummerordning.
2. Kontrollera Cloudflare-secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN`.
3. Cloudflare-projektets root directory ska vara `cloudflare`.
4. Deploy command: `npm run deploy`.
5. Testa `/health` och `/v1/status`.
6. Starta första prognosen med POST `/v1/admin/run` och header `x-admin-token: DIN_ADMIN_TOKEN`, eller invänta nästa 30-minuters-Cron.
7. Kontrollera att `/v1/forecast?activity=general` returnerar `dailyResults`.

Service role-nyckeln och ADMIN_TOKEN får aldrig läggas i GitHub eller klientens config.js.
