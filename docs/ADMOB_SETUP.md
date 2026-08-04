# AdMob – manuell konfiguration

Produktionsannonser är avstängda tills samtliga steg är klara.

1. Öppna/skapa AdMob-konto och kontrollera betalningsprofil och Policy Center.
2. Lägg till iOS- och Androidappen med bundle/package `se.vaderkompassen.app`.
3. Skapa separata app-ID:n per plattform.
4. Skapa separata banner-enheter för `main_bottom_banner` per plattform.
5. Skapa native-enheter för `ranking_inline_native`, men aktivera dem inte innan en säker nativebrygga finns.
6. Länka apparna till App Store/Google Play när butiksposterna finns.
7. Under Privacy & messaging: skapa och publicera GDPR-meddelande för EES/Storbritannien, bedöm amerikanska delstatsmeddelanden, ange publicerad integritetspolicy, välj leverantörer och verifiera privacy-options-länken.
8. Testa geografiskt UMP-flöde i TestFlight och Google Internal Testing med officiella testannonser. Lägg aldrig test device-ID i Git.
9. iOS: sätt `VK_ADMOB_IOS_APP_ID` som Xcode build setting och bygg webbdelen med `VK_ADMOB_IOS_*`. Kontrollera aktuell fullständig SKAdNetwork-lista, SDK privacy manifests och App Privacy-svar.
10. Android: sätt `VADERKOMPASSEN_ADMOB_ANDROID_APP_ID` i lokal `~/.gradle/gradle.properties` eller CI-secret och bygg webbdelen med `VK_ADMOB_ANDROID_*`. Kontrollera merged manifest, Ads-deklaration, Data Safety och IARC.

Runtime-ID:n levereras till webbbygget via:

- `VK_ADS_ENABLED=true`, `VK_ADS_MODE=test|production`
- `VK_ADMOB_IOS_APP_ID`, `VK_ADMOB_IOS_BANNER_ID`, `VK_ADMOB_IOS_NATIVE_ID`
- `VK_ADMOB_ANDROID_APP_ID`, `VK_ADMOB_ANDROID_BANNER_ID`, `VK_ADMOB_ANDROID_NATIVE_ID`

Productionbygget faller aldrig tillbaka till test-ID. Ett productionläge med ofullständig konfiguration stoppar webbbygget. Riktiga ID:n ska ligga i CI-/butikskonfiguration, inte hårdkodas.
