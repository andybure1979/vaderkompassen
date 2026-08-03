# Butiksbilder och skärmbildsplan

## Inventering

| Asset | Befintligt | Status/krav |
|---|---|---|
| iOS App Store-ikon | `ios/.../AppIcon-512@2x.png` (1024×1024, utan alpha verifierat) | Manuell visuell kontroll; ingen transparens tillåten |
| Android adaptive icon | foreground/background och mipmap-varianter | Finns; kontrollera safe area på riktiga launchers |
| Android monochrome icon | Saknas | Bedöm/ta fram för themed icons |
| Splash | iOS/Android-varianter finns | Kontrollera beskärning och kontrast på enheter |
| Play high-res icon | Kandidat `icon-512.png` (512×512, utan alpha verifierat) | Får inte antas visuellt godkänd; kontrollera mot portalens aktuella krav |
| Play feature graphic | Saknas | Skapa/godkänn 1024×500 |
| Promo-assets | Saknas | Endast om portalen kräver |

PWA-ikoner ska inte automatiskt användas som slutliga butiksikoner utan kontroll av källupplösning, kanter, transparens och safe area.

## Skärmbilder

Ta minst: start/aktivitetsval, dagens bästa, topplista, karta, faktaboxar, Fiske, Vandring eller Surf samt Free/Premium-jämförelse. Skapa uppsättningar i de aktuella iPhone-/iPad- och Android-format som portalerna begär vid uppladdning.

Regler: inga personuppgifter, riktiga mejladresser, debugtexter, fel, missvisande testannonser eller obestyrkta påståenden. Alla bilder ska visa samma version, språk och konsekvent exempeldata. Ett reproducerbart demoläge är inte implementerat; produktion får aldrig använda demodata. Skärmbilder och grafiskt material är **manual action required**.
