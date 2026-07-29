# Driftstart v13.6.2

Denna version åtgärdar CPU-tidsfelet i `GET /v1/forecast`.

## Ändring

- Prognos-API:t bygger inte längre både `dailyResults` och en duplicerad `rankedResults`.
- Högst rankade 75 orter per dag returneras för vald aktivitet och valt geografiskt filter.
- Samtliga 500 orter finns fortsatt i den centrala snapshoten och deltar i rangordningen.
- Mapp- och driftstruktur är oförändrad från main(17).

## Driftsättning

1. Driftsätt Cloudflare Workern från `cloudflare/`.
2. Publicera frontendfilerna från repositoryroten.
3. Kontrollera `/v1/verify`.
4. Öppna appen och prova en bred sökning, exempelvis vandring i Mellansverige och Södra Sverige.
