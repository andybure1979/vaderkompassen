# Installation och drift

## Väderkompassen v14.3.1

1. Kör SQL-migrationerna i ordningen nedan.
2. Publicera hela projektet till GitHub.
3. Kontrollera att webbplatsen visar `Väderkompassen v14.3.1` i sidfoten.
4. Testa Admin-behörighet, användarsökning, VIP, audit och Worker-hälsa enligt checklistan nedan.

## Manuella databassteg

Kör migrationerna i Supabase SQL Editor i följande ordning:

1. `supabase/migrations/20260730_1400_identity_platform.sql`
2. `supabase/migrations/20260731_1403_profile_cloud_sync.sql`
3. `supabase/migrations/20260731_1405_subscription_trial_flow.sql`
4. `supabase/migrations/20260731_140501_trial_activation_fix.sql`
5. `supabase/migrations/20260801_1420_subscription_foundation.sql`
6. `supabase/migrations/20260801_1430_admin_console.sql`
7. `supabase/migrations/20260801_1431_forecast_runtime_limits.sql`

Den nya migrationen återställer äldre, automatiskt skapade testprovperioder till Gratis. Dessa användare kan därefter själva starta sin enda provperiod.

## Adminvy i v14.3.0

Det första Admin-kontot ska redan ha `profiles.role = 'admin'` från identitetsinstallationen. Kontrollera rollen manuellt i Supabase innan adminvyn används; migrationen gör aldrig någon användare till Admin automatiskt. Logga in med kontot, öppna profilen och välj **Öppna adminpanel**.

`GET /v1/admin/health` skickar användarens kortlivade Supabase access-token som bearer-token. Workern verifierar token och kontrollerar aktiv Admin-roll mot Supabase. `SUPABASE_SERVICE_ROLE_KEY` stannar som Worker-secret och får aldrig läggas i `config.js`, dokumentation eller frontend.

Efter deploy, kontrollera:

1. Free, Premium och VIP ser ingen adminlänk och får fel vid direkt RPC-anrop.
2. Admin kan öppna panelen, söka med minst två tecken och paginera.
3. Permanent och tidsbegränsad VIP ger Premium via `admin_entitlements`; återkallning tar bort den.
4. Rolländring kräver anledning, och `GE ADMIN` krävs för ny Admin.
5. Sista Admin, självlåsning och egen blockering stoppas av backend.
6. Suspend/block/reactivate och intern anteckning skapar auditposter.
7. Hälsokontrollen kräver bearer-token och begränsas till ett anrop per tio sekunder.
8. Prognoser, ranking, karta, Auth, Premium, molnsynk och Performance 2.0 fungerar oförändrat.

Apple-/Googleverifiering, provider-synk, Cloudflare Logs API, tillförlitligt antal aktiva användare, cache-hit-rate, CPU-fel och CSV-export är inte anslutna i v14.3.0. Adminvyn visar inte påhittade värden för dessa funktioner.

## Worker runtime-test i v14.3.1

1. Kör `20260801_1431_forecast_runtime_limits.sql` före Worker-deploy.
2. Deploya Workern och kontrollera att `/health` visar `14.3.1`.
3. Kör Fiskeväder för Mellansverige med samtliga landskap och kontrollera headern `X-Vaderkompassen-Database-Ranked: true` vid cachemiss.
4. Upprepa anropet och kontrollera `X-Vaderkompassen-Cache: HIT`.
5. Kör cron manuellt och kontrollera att snapshot sparas även om en extern väderbatch misslyckas.
6. Kontrollera Cloudflare-loggarna för frånvaro av `exceededCpu` och `Too many subrequests`.

## Äldre Premiumfält

- Nya konton börjar som `free`.
- Provperioden startas via ett skyddat Supabase RPC-anrop.
- `trial_used_at` gör att en andra provperiod inte kan aktiveras.
- `cancel_at_period_end` anger att automatisk förnyelse har avslutats.
- Under provperioden behålls Premium-åtkomst till slutdatumet även efter uppsägning.
- De äldre profilfälten används endast för bakåtkompatibel migrering. V14.2.0 konverterar aldrig en intern trial automatiskt till betald Premium.

## Testläge och betalningsbegränsning i v14.2.0

- Webbtest aktiveras uttryckligen med `subscriptionMode: "manual_test"` i `config.js`.
- Kör migrationen `20260801_1420_subscription_foundation.sql` innan frontend publiceras.
- Starta testtrial från profilvyn och kontrollera `get_user_entitlement()` i Supabase.
- Avsluta via “Avsluta vid periodens slut”; status ska bli `cancelled_active` medan `is_premium` är sann till slutdatumet.
- Efter serverns slutdatum ska entitlement bli Free utan cron och utan automatisk konvertering.
- Ingen verklig debitering sker och inga betaluppgifter eller fiktiva butikskvitton lagras.
- Apple/Google kräver senare native iOS/Android, riktiga produkt-ID:n och butikshämtat pris.

Framtida servermiljö behöver Apple issuer/key-id/private key/bundle-id samt Google service account/Play package-id och Pub/Sub-verifiering. Dessa hemligheter får aldrig läggas i frontend eller Git.

## Stabil Cloudflare-deploy i v14.0.6.2

1. Använd Node.js 22 eller senare (`nvm use` läser `.nvmrc`).
2. Kör `npm install` från projektroten.
3. Ange `npm run deploy` som deploy command i Cloudflare.
4. Använd inte `npx wrangler deploy`, eftersom det kan hämta en annan Wrangler-version än den som projektet är testat mot.


## Forecast CPU Fix i v14.0.6.3

Kör migrationen `supabase/migrations/20260731_140603_forecast_cpu_fix.sql` i Supabase SQL Editor efter tidigare migrationer. Deploya därefter Workern med `npm run deploy`. Kontrollera `/v1/forecast` med flera regioner och verifiera att svaret innehåller `meta.performance`.


## Intelligent textsystem i v14.0.8

Ingen databasändring krävs. Publicera projektet och kontrollera att rekommendationerna varierar mellan orter, dagar och aktiviteter utan att rankningen förändras.

## Faktaboxar och cache i v14.0.9

Ingen databasändring krävs. Publicera projektet och kontrollera att topplistans kort visar 4–12 relevanta värden med högst fyra per rad. Kontrollera även att en tidigare installerad app får v14.0.9 och ersätter service-worker-cachen från v14.0.8.

## V13-stil i topplistan i v14.0.10

Ingen databasändring krävs. Publicera projektet och kontrollera att alla tio kategorier finns kvar med sina färger, att topplistans värden visas kompakt utan boxramar och att huvudpoängkortets större faktaboxar är oförändrade.

## Synkroniserade faktavärden i v14.0.11

Ingen databasändring krävs. Kontrollera för flera kategorier att vinnarkortet och första kortet i topplistan visar samma värden i samma ordning, med olika presentation men utan ändrad poäng eller ranking.

## V13-topplistans faktauppsättning i v14.0.12

Ingen databasändring krävs. Kontrollera att grundvärdena och specialvärdena följer V13-referensens topplistekort och visas identiskt i vinnarkort och topplista.

## Förbättrad Fiskevädermodell i v14.0.13

Ingen databasändring krävs. Kör `npm test`, publicera frontend och Worker samtidigt och verifiera att inlandsplatser inte filtreras bort när kustplatser har marina data.
