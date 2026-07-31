# Väderkompassen v13.10.12

## Syfte

Denna version åtgärdar två sammanhängande stabilitetsfel utan andra funktionsändringar:

1. Kartan återställdes med `fitBounds()` efter att användaren nypzoomat eller panorerat.
2. En pågående prognoshämtning kunde blockera eller skriva över uppdateringen efter nya inställningar.

## Ändringar

- Kartans markörer och popup-data renderas separat från automatisk anpassning av kartvyn.
- Kartvyn anpassas bara vid första visningen eller när valda regioner/områden ändras.
- Kvarvarande `pointer-events:none` för Leaflets map- och tile-pane är borttagen.
- Prognoshämtningar använder generationsnummer. Endast den senaste generationen får uppdatera UI, cache och status.
- Sparade inställningar startar alltid en ny hämtning och gamla svar ignoreras.

## Test på iPhone/PWA

1. Välj exempelvis Södra Sverige och Mellansverige och spara.
2. Kontrollera att topplistan börjar uppdateras direkt utan ytterligare knapptryckning.
3. Öppna kartan, nypzooma in och släpp.
4. Vänta på eventuell bakgrundsuppdatering och kontrollera att kartan behåller zoom och position.
5. Ändra regionval igen och kontrollera att kartan då anpassas en gång till det nya urvalet.
