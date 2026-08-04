# App Store-checklista – v15.0.6

## Appinformation

- [ ] Namn, underrubrik, promotional text, beskrivning, keywords och kategori är inlagda per språk.
- [ ] Copyright och ansvarig juridisk aktör är fastställda.
- [ ] Support-, marketing- och privacy-URL svarar över HTTPS utan inloggning.
- [ ] Kontaktperson och telefon/e-post i App Store Connect är aktuella.
- [ ] Version 15.0.6, build 7 och bundle ID `se.vaderkompassen.app` stämmer.

## Privacy, juridik och köp

- [ ] Integritetspolicy och villkor är juridiskt godkända och publicerade.
- [ ] App Privacy är ifylld mot `docs/APP_STORE_PRIVACY.md` och den faktiska releasebinären.
- [ ] Age Rating är ifylld enligt `docs/AGE_RATING.md`, inklusive reklam och digitala köp.
- [ ] Premiumprodukt, pris, period, automatisk förnyelse, restore/manage och Sandbox är verifierade.
- [ ] App Store Server API/Notifications V2 är konfigurerade och testade.
- [ ] AdMob/CMP och eventuellt ATT-beteende matchar deklarationerna.

## Assets och review

- [ ] 1024-ikon och alla skärmbilder är visuellt godkända.
- [ ] iPad-assets lämnas inte utan godkänt iPad-target/layoutstöd.
- [ ] 30-sekunders preview använder licensierat material.
- [ ] Release Notes och Review Notes är inlagda.
- [ ] Free-, Premium- och Admin-testkonto fungerar; hemligheter ligger bara i portalen.
- [ ] Kontoborttagning fungerar i appen och extern URL.

## Build

- [ ] Archive, Validate App och upload från rätt commit lyckas.
- [ ] Export compliance, privacy manifests, signing och entitlements är granskade.
- [ ] TestFlight-installation på fysisk iPhone passerar releasechecklistan.

Publicering är blockerad tills alla punkter är verifierade.
