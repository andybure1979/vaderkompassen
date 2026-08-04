# Google Play Data Safety – svarunderlag

Andreas måste fylla i och godkänna formuläret manuellt i Play Console. Kryssa inte i AdMob-data innan SDK:n faktiskt aktiveras; uppdatera före aktivering.

| Datatyp | Collected | Shared | Purpose | Required/optional | Ephemeral | Krypterad | Radering | Källa |
|---|---|---|---|---|---|---|---|---|
| E-post | Yes för konto | Service provider | Account management, app functionality | Konto frivilligt | No | In transit | Ja | Supabase Auth |
| User ID | Yes | Service provider | Account, security | Konto | No | In transit | Ja | Supabase |
| Visningsnamn | If provided | Service provider | Personalization av profil, inte rekommendationer | Optional | No | In transit | Ja | Supabase |
| App activity/inställningar | Premium cloud sync | Service provider | App functionality | Optional | No | In transit | Ja | Supabase |
| Purchase/subscription status | När test/butik aktiv | Apple/Google/service provider | Entitlement, fraud prevention | Premium | No | In transit | Konto kan raderas; minimal revision kan behållas | Supabase/butik |
| Diagnostics/request metadata | Yes | Service provider | Security, diagnostics | Service operation | Delvis | In transit | Enligt fastställd loggrutin | Cloudflare/Supabase |
| Precise/approximate device location | No | No | – | – | – | – | – | Ingen location permission |
| Device/advertising ID | No currently | No | – | – | – | – | – | AdMob ej aktivt |

Extern kontoborttagnings-URL att ange efter publicering: `https://andybure1979.github.io/vaderkompassen/public/delete-account/`.

Android permissions: `INTERNET` för API/Auth/karta och `ACCESS_NETWORK_STATE` för begriplig offlinehantering. Ingen plats, kamera, mikrofon, kontakter, foton eller bred lagringsåtkomst begärs. Kontrollera merged manifest efter varje SDK-ändring.

v15.0.4 använder Capacitor App, Browser, Device, Network, Preferences, SplashScreen och StatusBar samt Google Play Billing 9.1.0. Device-plugin finns installerad men appkoden läser inte reklam-ID eller beständig enhetsidentifierare. Köpstatus och pseudonymiserat konto-ID behandlas för entitlement/fraud prevention; rå purchase token skickas krypterat till backend och lagras endast hashad. AdMob är inte aktiverat, så reklam- eller annonsidentifierardata ska inte deklareras förrän en riktig SDK/CMP införs.
