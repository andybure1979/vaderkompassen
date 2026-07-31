# Väderkompassen v13.10.11

## Syfte
Återställer zoom och panorering i Leaflet-kartan, främst på iPhone och andra touch-enheter.

## Ändring
- Kartans tile- och map-panes fångar inte längre egna pekhändelser.
- Leaflets zoom-, drag- och tangentbordsfunktioner aktiveras uttryckligen när kartan är redo.
- Interaktionerna aktiveras igen efter `invalidateSize()` när den dolda kartan öppnas.
- Ingen annan funktionalitet har ändrats.

## Kontroll efter publicering
1. Öppna topplistan och välj **Visa topplistan på karta**.
2. Kontrollera att kartan kan panorera med ett finger.
3. Kontrollera att nypzoom fungerar med två fingrar.
4. Kontrollera att knapparna `+` och `−` fungerar.
5. Dölj och öppna kartan igen och upprepa kontrollen.
