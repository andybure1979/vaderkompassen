# Butiksskärmbilder för v15.0.6

Skärmbilderna ska tas från samma godkända releasebuild, med svenska respektive engelska apptexter, testdata utan personuppgifter och utan debugindikatorer. Visa inte prognoser som säkerhetsgaranti och fabricera inte köp, annonser eller recensioner.

## Bildserie

1. **Startsida:** vald aktivitet, region och tydlig vinnare. Rubrik: ”Hitta vädret som passar”.
2. **Prognos:** topplista och aktivitetsrelevanta faktaboxar. Rubrik: ”Jämför platser på sekunder”.
3. **Karta:** kartvyn med flera resultat, inga personliga positioner. Rubrik: ”Se alternativen på kartan”.
4. **Premium:** riktig Free/Premium-jämförelse med butikspris från testmiljön. Rubrik: ”Se resten av veckan”.
5. **Aktiviteter:** aktivitetsväljaren med flera kategorier. Rubrik: ”Väder för din aktivitet”.
6. **Molnsynk:** inloggad Premiumprofil och synkinformation, aldrig e-post eller token. Rubrik: ”Dina val på flera enheter”.
7. **Offline:** befintligt offline-/senast uppdaterad-läge. Rubrik: ”Senaste prognosen nära till hands”.
8. **Fiske:** fiskevyn med vind, molnighet, nederbörd och vattentemperatur när data finns. Rubrik: ”Planera fisket efter vädret”.
9. **Surf:** surfvyn med vågor, vind och vattentemperatur när data finns. Rubrik: ”Jämför surfvädret”.
10. **Vinter:** skidvyn med relevanta vinterfakta. Rubrik: ”Hitta bättre skidväder”.

## Enheter och leverans

| Plattform | Uppsättning | Krav |
|---|---|---|
| iPhone | 6,9 tum | Bilder 1–10 i högsta obligatoriska App Store-storlek |
| iPhone | 6,5 tum | Bilder 1–10 eller portalens tillåtna skalning från godkänd master |
| iPhone | 6,3 tum | Bilder 1–10, beskärning kontrollerad |
| iPhone | 5,5 tum | Bilder 1–10, text och kort får inte kapas |
| iPad | 13 tum | Ny tagning i riktig iPad-layout, inte uppskalad telefon |
| iPad | 11 tum | Ny tagning i riktig iPad-layout |
| Android | Telefon | Minst bilder 1–8; 9–10 rekommenderas |
| Android | Tablet | Riktig tablet-layout, liggande och stående efter Play-krav |

iOS-target är för närvarande endast iPhone (`TARGETED_DEVICE_FAMILY = 1`). iPad-bilder får därför inte levereras förrän iPad-stöd och layout har godkänts i en separat version. Kontrollera aktuella portalstorlekar vid uppladdning; butikskraven kan ändras.

## Kvalitetsgrind

- Samma statusrad, klockslag och testscenario inom varje serie.
- Inga mejladresser, testkontolösenord, koordinater som avslöjar person eller push-/systemnotiser.
- Ingen genomskinlig ram, enhetsmockup eller text som döljer UI.
- Kontrollera stavning, kontrast, safe areas och att reklambeteendet motsvarar entitlement.
- Exportera PNG/JPEG utan onödig komprimering och granska i 100 % zoom.

Status: **MANUAL ACTION REQUIRED** – faktiska skärmbilder är inte skapade i repot.
