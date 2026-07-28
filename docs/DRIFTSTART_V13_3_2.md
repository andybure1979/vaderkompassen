# Väderkompassen v13.3.2 – Supabase-nyckelfix

Denna version stöder både Supabase nya `sb_secret_...`-nycklar och äldre JWT-baserade `service_role`-nycklar.

Cloudflare secrets/variables:
- `SUPABASE_URL`: projektets URL, exempel `https://<project-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: antingen ny `sb_secret_...` eller äldre `service_role` JWT
- `ADMIN_TOKEN`: egen hemlig admin-token
- `ALLOWED_ORIGIN`: `https://andybure1979.github.io` eller `*` under test

Efter deploy:
1. Öppna `/health` och kontrollera version 13.3.2.
2. Öppna `/v1/verify`. Svaret visar `supabase.keyType` utan att exponera nyckeln.
3. Cron skapar därefter en snapshot. Vid fel visar API-svaret nu Supabase statuskod och felmeddelande.
