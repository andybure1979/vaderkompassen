# Driftstart Väderkompassen v13.8.2

Den här versionen åtgärdar CPU-tidsfelet i `GET /v1/forecast`.

## Driftsättning

1. Driftsätt Cloudflare Workern från `cloudflare/`.
2. Publicera frontendfilerna.
3. Kör en manuell uppdatering via `POST /v1/admin/run` med `x-admin-token`.
4. Vänta tills uppdateringen är klar. Den skapar en komplett snapshot samt regionala del-snapshots.
5. Kontrollera `/v1/verify`.
6. Testa samma breda sökning som tidigare gav CPU-fel.

## Viktigt

Före den första nya snapshoten använder Workern den äldre kompletta snapshoten som reserv. Den fulla CPU-förbättringen gäller därför efter att en manuell körning eller nästa cron-körning har slutförts.
