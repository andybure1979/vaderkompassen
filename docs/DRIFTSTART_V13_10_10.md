# Väderkompassen v13.10.10

## Syfte
Åtgärdar `QuotaExceededError` som blockerade sparning av inställningar när Safaris `localStorage` hade fyllts av prognoscache.

## Ändring
- Beständig punktcache har ersatts av sessionsbaserad minnescache.
- Gamla punktcacher och äldre vädercacheversioner rensas vid start.
- Vid full lagring rensas endast Väderkompassens cache och inställningarna sparas därefter på nytt automatiskt.
- `vk-settings` raderas aldrig av cache-rensningen.

## Kontroll efter publicering
1. Öppna appen och gå till Inställningar.
2. Ändra ett område och tryck Spara.
3. Kontrollera att dialogen stängs och att valet finns kvar efter omladdning.
4. Kontrollera att inget `QuotaExceededError` visas.
