# Väderkompassen v13.4.0

## Nytt
- Adaptiv Open-Meteo-hämtning: misslyckade batcher delas automatiskt ned till enskilda orter.
- Högst fem parallella hämtningar och tre försök per batch minskar tillfälliga fel.
- Saknade orter fylls med senaste fungerande molndata och markeras som reservdata.
- Molnstatus visar tillgängliga, färska och återanvända orter.
- Worker beräknar aktivitetspoäng och returnerar färdigrankade resultat via `rankedResults`.
- Appen använder serverrankningen men behåller lokal poängmotor som reserv.

## Kontroll efter driftsättning
1. Öppna `/v1/verify` och kontrollera version `13.4.0`.
2. Kör `/v1/admin/run` med admin-token.
3. Kontrollera `placesAvailable`, `placesFresh`, `placesFallback` och `failedPlaces`.
4. Ladda om PWA:n helt så att service worker-cache `v13-4-0` aktiveras.
