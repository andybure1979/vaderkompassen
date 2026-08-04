# Google Play Data Safety – svarunderlag

Andreas måste fylla i och godkänna formuläret manuellt i Play Console. Juridisk och portalbaserad slutgranskning är **MANUAL ACTION REQUIRED** före produktionsannonser.

| Datatyp | Collected | Shared | Purpose | Required/optional | Ephemeral | Krypterad | Radering | Källa |
|---|---|---|---|---|---|---|---|---|
| E-post | Yes för konto | Service provider | Account management, app functionality | Konto frivilligt | No | In transit | Ja | Supabase Auth |
| User ID | Yes | Service provider | Account, security | Konto | No | In transit | Ja | Supabase |
| Visningsnamn | If provided | Service provider | Personalization av profil, inte rekommendationer | Optional | No | In transit | Ja | Supabase |
| App activity/inställningar | Premium cloud sync | Service provider | App functionality | Optional | No | In transit | Ja | Supabase |
| Purchase/subscription status | När test/butik aktiv | Apple/Google/service provider | Entitlement, fraud prevention | Premium | No | In transit | Konto kan raderas; minimal revision kan behållas | Supabase/butik |
| Diagnostics/request metadata | Yes | Service provider | Security, diagnostics | Service operation | Delvis | In transit | Enligt fastställd loggrutin | Cloudflare/Supabase |
| Precise/approximate device location | No | No | – | – | – | – | – | Ingen location permission |
| Device/advertising ID | Kan behandlas när AdMob aktiveras | Google enligt portaldefinition | Advertising, analytics, fraud prevention | Free-annonser | Verifiera | In transit | Enligt Google/val | Google Mobile Ads |
| App interactions/advertising data | Kan behandlas när aktivt | Google | Advertising, analytics | Free-annonser | Verifiera | In transit | Enligt Google/val | Google Mobile Ads |
| Crash/performance diagnostics | Kan behandlas när aktivt | Google | Diagnostics | Free-annonser | Verifiera | In transit | Enligt Google | Google Mobile Ads |

Extern kontoborttagnings-URL att ange efter publicering: `https://andybure1979.github.io/vaderkompassen/public/delete-account/`.

Android permissions: `INTERNET` för API/Auth/karta och `ACCESS_NETWORK_STATE` för begriplig offlinehantering. Ingen plats, kamera, mikrofon, kontakter, foton eller bred lagringsåtkomst begärs. Kontrollera merged manifest efter varje SDK-ändring.

v15.0.5 innehåller Google Mobile Ads och UMP via Capacitor-plugin men production är fail-closed. När annonser aktiveras ska Play Console deklarera att appen innehåller annonser samt SDK:ns faktiska datahantering. Ingen platsbehörighet läggs till; ungefärlig plats kan ändå härledas från IP av Google. UMP-val kan ändras via appens integritetsinställning. Trial/Premium/VIP/Admin är reklamfria.
