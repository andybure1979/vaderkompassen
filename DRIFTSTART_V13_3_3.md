# Väderkompassen 13.3.3

- Lokal cache triggar omedelbar molnkontroll vid start.
- Moln-API anrop undantas från service worker-cache.
- Open-Meteo delas i mindre batcher om 20 platser.
- Varje misslyckad batch försöks om två gånger.
- `/v1/verify` visar täckningsdata i senaste snapshot.
