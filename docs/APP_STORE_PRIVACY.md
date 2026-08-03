# App Store Privacy – svarunderlag

Andreas måste verifiera och fylla i svaren manuellt i App Store Connect. Underlaget beskriver v14.5.0; ändra svaren om SDK:er eller funktioner ändras.

| Datatyp | Samlas in | Kopplad till användare | Tracking | Ändamål | Obligatorisk | Lagring/tredjepart |
|---|---|---|---|---|---|---|
| E-postadress | Ja för konto | Ja | Nej | Auth, konto, support | Frivillig tills konto skapas | Supabase; till kontoradering, exakta backups/loggtider ska verifieras |
| Användar-ID | Ja | Ja | Nej | Auth, profil, entitlement | Konto | Supabase |
| Visningsnamn | Om användaren anger | Ja | Nej | Profil | Frivillig | Supabase |
| Produktinteraktioner/inställningar | Ja för molnsynk | Ja | Nej | Appfunktion | Premium molnsynk frivillig | Supabase; Free lokalt |
| Köp-/prenumerationsstatus | Ja när aktiverat/test | Ja | Nej | Entitlement, support, revision | Premium | Supabase; Apple/Google vid framtida butiksköp |
| Diagnostik och requestmetadata | Ja | Kan indirekt kopplas | Nej | Drift, säkerhet | Tjänsteleverans | Cloudflare/Supabase; lagringstid ska fastställas |
| Kraschdata | Nej | Nej | Nej | – | – | Ingen krasch-SDK |
| Enhets-/annons-ID | Nej i RC | Nej | Nej | – | – | AdMob ej aktivt |
| Exakt/ungefärlig enhetsplats | Nej | Nej | Nej | – | – | Appen läser inte GPS; manuellt valda orter är appinnehåll |
| Användarinnehåll | Endast visningsnamn/supportmejl | Ja | Nej | Profil/support | Frivillig | Supabase/e-postleverantör |

## SDK-/tjänsteinventering

- Capacitor 8: App, Browser, Device, Network, Preferences, SplashScreen, StatusBar. Device-plugin finns installerad men koden läser inte identifierare.
- Supabase JS: Auth, profil, entitlement och molnsynk.
- Cloudflare Worker: API, cache, drift- och säkerhetsmetadata.
- Leaflet/OpenStreetMap: kartvisning; externa tiles laddas i webbversionen.
- StoreKit/Google Play Billing: inte integrerade/aktiva i RC.
- AdMob: ingen plugin och ingen initiering i RC.

Appens `PrivacyInfo.xcprivacy` anger ingen tracking/insamlad data genom appmanifestet och deklarerar UserDefaults reason `CA92.1`. Capacitor och CapacitorCordova 8.5.0 innehåller egna privacy manifests utan tracking, insamlade datatyper eller Required Reason APIs. Kontrollera samtliga inbäddade manifests igen i det arkiverade bygget. Portalens svar ska omfatta serverbehandling även om appmanifestet inte gör det.
