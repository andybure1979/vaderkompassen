# Väderkompassen v13.6.0

## Nytt
- Utökat från 300 till 500 prognosorter i Sverige, Danmark och Norge.
- Befintliga aktivitetsfilter och rankningsmotorer är oförändrade.
- Molnstatus visar nu täckning mot 500 orter efter att en ny snapshot har skapats.

## Driftsättning
1. Publicera hela frontendmappen på GitHub Pages.
2. Driftsätt Cloudflare Worker eftersom `cloudflare/src/places.js` har ändrats.
3. Kör `POST /v1/admin/run` med `x-admin-token`.
4. Kontrollera `/v1/verify`. Målet är `placesRequested: 500` och `placesAvailable: 500`.
