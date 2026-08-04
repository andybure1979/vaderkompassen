# Appikoner – verifiering v15.0.6

## Verifierat i repot

- iOS: `AppIcon-512@2x.png` är 1024 × 1024 px och saknar alfa/transparens.
- Android legacy launcher finns för mdpi–xxxhdpi i förväntade storlekar 48–192 px.
- Android adaptive icon finns med separat foreground och background från API 26.
- Android monochrome är deklarerad från API 33 och använder foreground-resursen.
- Webbikonerna är 180, 192 och 512 px och saknar alfa.
- Inga dubblettfiler med ` 2`/` 3` eller ogiltiga Android-resursnamn finns i källresurserna.

## Manuell kontroll före publicering

- Granska 1024-originalet i 100 % och 400 % zoom för pixlar, halo, bandning och oavsiktlig text.
- Kontrollera adaptive icon mot Androids safe zone på rund, squircle och fyrkantig mask.
- Skapa/exportera en separat Play Store-ikon, 512 × 512 px enligt Play Consoles aktuella krav; använd inte en launcherfil utan visuell kontroll.
- Granska monochrome på ljust och mörkt tema. Nuvarande återanvändning av foreground är tekniskt giltig men måste visuellt godkännas.
- Säkerställ att inga äldre varumärkesvarianter laddas upp i portalernas assetbibliotek.
- Play feature graphic och faktiska store-assets hanteras enligt `docs/STORE_ASSETS.md`.

Status: **BLOCKED** tills visuell originalgranskning och separat Play Store-export är godkända.
