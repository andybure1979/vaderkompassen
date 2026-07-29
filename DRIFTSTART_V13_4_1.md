# Väderkompassen v13.4.1

Frontend-korrigering efter v13.4.0.

- Kontrollerar alltid molnet direkt när appen startar, även om en molncache redan visas.
- Förhindrar att en äldre snapshot ligger kvar i upp till 30 minuter.
- Tar bort dubblerad text för uppdateringstid i den sparade statusraden.
- Ny cache- och service-worker-version för säker uppdatering på iPhone.

Efter publicering: öppna appen, stäng den helt och öppna igen. Statusen ska byta från cache till senaste molnsnapshot inom några sekunder.
