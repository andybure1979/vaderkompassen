# App Store Privacy – svarunderlag

Andreas måste verifiera och fylla i svaren manuellt i App Store Connect. Underlaget är granskat mot iOS v15.0.6; juridisk och portalbaserad slutgranskning är **MANUAL ACTION REQUIRED** innan AdMob aktiveras.

| Datatyp | Samlas in | Kopplad till användare | Tracking | Ändamål | Obligatorisk | Lagring/tredjepart |
|---|---|---|---|---|---|---|
| E-postadress | Ja för konto | Ja | Nej | Auth, konto, support | Frivillig tills konto skapas | Supabase; till kontoradering, exakta backups/loggtider ska verifieras |
| Användar-ID | Ja | Ja | Nej | Auth, profil, entitlement | Konto | Supabase |
| Visningsnamn | Om användaren anger | Ja | Nej | Profil | Frivillig | Supabase |
| Produktinteraktioner/inställningar | Ja för molnsynk | Ja | Nej | Appfunktion | Premium molnsynk frivillig | Supabase; Free lokalt |
| Köp-/prenumerationsstatus | Ja när aktiverat/test | Ja | Nej | Entitlement, support, revision | Premium | Supabase; Apple/Google vid framtida butiksköp |
| Diagnostik och requestmetadata | Ja | Kan indirekt kopplas | Nej | Drift, säkerhet | Tjänsteleverans | Cloudflare/Supabase; lagringstid ska fastställas |
| Krasch-/prestandadata | Kan behandlas av AdMob när aktivt | Normalt inte av appkonto; verifiera Googledeklaration | Beroende på konfiguration | Diagnostik | Free-annonser | Google Mobile Ads |
| Enhets-/annons-ID | Kan behandlas när AdMob är aktivt och tillåtet | Verifiera | Kan användas för tracking om personalisering/ATT tillåts | Reklam, mätning, fraud prevention | Free-annonser | Google Mobile Ads |
| Annonsdata och produktinteraktion | Kan behandlas när aktivt | Normalt inte av appkonto | Beroende på konfiguration | Reklam, mätning | Free-annonser | Google Mobile Ads |
| Exakt/ungefärlig enhetsplats | Nej | Nej | Nej | – | – | Appen läser inte GPS; manuellt valda orter är appinnehåll |
| Användarinnehåll | Endast visningsnamn/supportmejl | Ja | Nej | Profil/support | Frivillig | Supabase/e-postleverantör |

## SDK-/tjänsteinventering

- Capacitor 8: App, Browser, Device, Network, Preferences, SplashScreen, StatusBar. Device-plugin finns installerad men koden läser inte identifierare.
- Supabase JS: Auth, profil, entitlement och molnsynk.
- Cloudflare Worker: API, cache, drift- och säkerhetsmetadata.
- Leaflet/OpenStreetMap: kartvisning; externa tiles laddas i webbversionen.
- StoreKit och Google Play Billing är implementerade men blockerade för produktion tills respektive externa butikskonfiguration och testmatris är verifierad.
- Google Mobile Ads/UMP via `@capacitor-community/admob` 8.0.0: inbyggd men fail-closed i produktion. UMP styr om annonser får begäras; Premium initierar inte SDK:n om det kan undvikas.

Appens eget `PrivacyInfo.xcprivacy` anger ingen egen tracking/insamlad data och deklarerar UserDefaults reason `CA92.1`. Google Mobile Ads levererar eget privacy manifest i aktuell SDK. Kontrollera samtliga inbäddade manifests och faktisk AdMob-konfiguration i arkivet; portalens svar ska omfatta tredjeparts-SDK och serverbehandling. ATT begärs inte rutinmässigt i v15.0.6.
