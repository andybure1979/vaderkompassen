# Tredjepartslicenser

Inventering för v15.0.6. Versions- och licenssanningen hämtas från `package-lock.json`, native SwiftPM/Gradle-resolving och respektive upstreamdistribution vid release.

## Direkta JavaScript-/nativeberoenden

| Komponent | Version | Licens |
|---|---:|---|
| Capacitor core/CLI/iOS/Android och officiella plugins | 8.x | MIT |
| @capacitor-community/admob | 8.0.0 | MIT |
| @supabase/supabase-js | 2.111.0 | MIT |
| @apple/app-store-server-library | 3.1.0 | MIT |
| Leaflet | 1.9.4 | BSD-2-Clause |
| TypeScript | 5.9.3 | Apache-2.0 |
| Wrangler | 4.114.0 | MIT OR Apache-2.0 |

## Native SDK:er och tjänster

- Google Mobile Ads SDK och Google User Messaging Platform: följ Googles SDK-villkor; de är inte öppenkällkodslicenser enbart för att wrappern är MIT.
- Google Play Billing Library: följer Google Play/Android SDK-villkor.
- Apple StoreKit, App Store Server API och systemramverk: följer Apple Developer Program License Agreement.
- Leaflet-kartdata/tiles: Leafletkod är BSD-2-Clause; OpenStreetMap-attribution måste fortsätta visas och tileleverantörens policy följas.
- Väderleverantörer: attribution och användningsvillkor ska verifieras mot varje dokumenterad källa före lansering.

## Efterlevnad

- Behåll copyright- och licenstexter för MIT/BSD/Apache-komponenter i distributionsunderlaget.
- LGPL-licensierade libvips-paket förekommer som valfria `sharp`-buildberoenden i utvecklingsverktyget; de ska inte antas ingå i appbinären. Kontrollera faktisk releaseartefakt.
- Generera en slutlig dependency report från release-lockfile, SwiftPM och Gradle och arkivera den med bygget.
- Ingen dependency får beskrivas som MIT enbart utifrån en wrapper om dess binära SDK har separata villkor.

Status: källinventeringen är genomförd, men slutlig binär license/notice-scan av signerade IPA/AAB är **MANUAL ACTION REQUIRED**.
