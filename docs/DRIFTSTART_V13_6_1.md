# Väderkompassen v13.6.1

## Korrigering

Versionen rättar cron-körningen för 500 orter.

- Väderbatchar: 18 orter per anrop (28 initiala batcher för 500 orter).
- Marinbatchar: 18 platser per anrop.
- Lägre samtidighet för marindata.
- Tydligare felmeddelande om loggning till `worker_runs` misslyckas.

Detta håller den normala körningen tydligt under Cloudflare Workers gräns för externa anrop.

Efter driftsättning: kör `POST /v1/admin/run` och kontrollera `/v1/verify`. Målet är `placesAvailable: 500`, `placesFresh: 500` och `failedBatches: 0`.
