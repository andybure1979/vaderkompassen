# Driftstart Väderkompassen v13.8.3

## Ändring
Korrigerar Supabase-frågan för regionala snapshots. Kolumnen `regions` är JSONB och filtreras nu säkert i Workern efter att endast de små regionala raderna för senaste körningen har hämtats.

## Driftsättning
1. Driftsätt Cloudflare Workern från `cloudflare/`.
2. Kör `POST /v1/admin/run` med `x-admin-token` eller invänta nästa cron-körning.
3. Kontrollera `/v1/verify`.
4. Publicera frontendfilerna om sidfot/cacheversion ska visa 13.8.3.

Ingen Supabase-migrering krävs.
