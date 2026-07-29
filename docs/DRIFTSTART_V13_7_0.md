# Driftstart v13.7.0

## Innehåll

Väderkompassen har fått ett nytt pastellbaserat designsystem med tydligare fokus på beslutet: vart användaren ska åka.

- Samma API, ranking, filter och aktivitetsmotorer som v13.6.2.
- Ny färgpalett, typografi, filterknappar, dagens val och resultatkort.
- Aktiviteten färgar gränssnittet.
- Poängen och det mänskliga omdömet har högst visuell prioritet.
- Ingen extern bild används i gränssnittet.

## Driftsättning

1. Publicera hela repot med oförändrad mappstruktur.
2. Driftsätt Cloudflare Worker eftersom versionsnumret är uppdaterat.
3. Publicera frontendfilerna på GitHub Pages.
4. Öppna appen och välj **Uppdatera nu** om service workern visar en ny version.
5. Kontrollera att sidfoten visar **Väderkompassen v13.7.0**.
