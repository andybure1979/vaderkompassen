# Native appikoner och splash

`icon-512.png` är användbar som visuell referens men är inte tillräcklig som slutlig App Store-master. De genererade Capacitorbilderna i `ios/` och `android/` är därför endast debugplatshållare och får inte användas för butikspublicering.

Ta fram före TestFlight/Google Internal Testing:

- en ogenomskinlig 1024×1024 PNG-master med befintlig Väderkompassen-identitet och utan transparent kant,
- en Android adaptive foreground-master med säker marginal,
- en enkel Android monochrome-version,
- en splash-master på minst 2732×2732 med samma bakgrund som appen.

Lägg masterfilerna här och generera sedan plattformsstorlekar med ett verifierat assetverktyg. Ingen notisikon behövs i v14.4.0.
