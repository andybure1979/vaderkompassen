# Arkitektur

## Annonser och CMP i v15.0.5

`ads-provider.js` är enda runtimegränsen mot AdMob. Den väntar på central entitlement innan provider väljs, begär UMP-status och initierar Google Mobile Ads först när `canRequestAds` tillåter det. Premiumroller använder `NoAdsProvider`; en ändring under pågående laddning invalidiserar begäran och förstör placeringen. `ADS_CONFIG` är miljö- och plattformsspecifik samt avstängd som produktionsstandard. Worker, ranking och prognosflöde berörs inte.

## Google Play-prenumerationer i v15.0.2

Androids Capacitor-plugin använder Play Billing 9.1.0. Efter ett `PURCHASED`-resultat skickas token över autentiserad HTTPS till Workern; klienten ger ingen åtkomst. Workern kontrollerar användare, package/product, kontohash och aktuell `purchases.subscriptionsv2.get`, sparar endast tokenhash via service-role-RPC och returnerar central entitlement. Först därefter gör nativebryggan acknowledgement.

RTDN verifierar Pub/Sub OIDC och deduplicerar message ID, men payloaden är aldrig sanningskälla. Workern hämtar aktuell Google-status och mappar trial, active, cancelled_active, grace, payment issue, expired och revoked. Se `GOOGLE_PLAY_BILLING.md`.

## Apple-prenumerationer i v15.0.1

iOS använder StoreKit 2 för UI och köpdialog, men klienten kan inte själv ge Premium. En verifierad StoreKit-transaktion skickas som signerad referens till Workern. Workern hämtar aktuell prenumerationsstatus från App Store Server API, verifierar Apples signerade data mot Apples publika rotcertifikat och skriver status genom den service-role-skyddade `sync_apple_subscription()`-RPC:n. Central `get_user_entitlement()` avgör fortsatt åtkomsten.

App Store Server Notifications V2 verifieras och dedupliceras i `apple_notification_events`. Vid varje relevant händelse hämtas aktuell status på nytt från Apple, vilket gör flödet robust mot omkastad notifieringsordning, enhetsbyte, återbetalning, uppsägning och grace period. Rå JWS och Apple-hemligheter lagras inte i databasen eller klienten. Se `STOREKIT.md`.

## Store compliance-gräns i v15.0.0

Publika juridik- och supportsidor byggs in i native `dist/` och har stabila GitHub Pages-URL:er. Klientkonfigurationen exponerar endast publika endpoints och juridik-URL:er. Riktiga subscriptions är fail-closed: production använder `disabled` tills en native provider returnerar butiksproduktdata och backendverifiering finns. AdMob initieras inte i production innan plugin och samtycke är godkända.

Worker CORS använder explicit allowlist för GitHub Pages och native WebView-origins och svarar med `Vary: Origin`. Kontoborttagning fortsätter via security-definer-RPC utan service role i klienten. Compliance- och readinessstatus ligger separat från runtime och innehåller inga credentials.

## Timvis prognosuppdatering i v14.4.5

Cloudflare Workerns schemalagda snapshotjobb använder cron-uttrycket `0 * * * *` och hämtar ny leverantörsdata vid hel timme. Frontendens polling styr endast kontrollen av snapshot-ID och kan därför fortsätta med befintliga intervall utan att skapa fler Open-Meteo-anrop.

## Robust snapshot-hämtning i v14.4.4

Väderhämtningen kör högst två Open-Meteo-batchar samtidigt. Tillfälliga HTTP 429- och 5xx-svar försöks om med begränsad deterministisk backoff och leverantörens `Retry-After` när den finns. Ett data- eller formatfel kan dela batchen en gång för att rädda en frisk del, medan rate-limitfel aldrig skapar fler delanrop. Ett stoppat snapshotjobb sparar strukturerad leverantörsdiagnostik i `worker_runs`.

Publiceringsregeln från v14.4.2 är oförändrad: minst en plats måste vara färsk och alla 1 000 aktiva platser måste täckas av färsk data eller frisk fallback.

## Fullt platsregister i v14.4.3

Registerkällan innehåller 500 aktiva Freeplatser och 500 aktiva Premiumplatser. Alla Premiumobjekt har verifierade GeoNames-ID:n och koordinater samt aktivitet utifrån källans objekttyp. Frontend och Worker använder fortsatt samma genererade register, och serverentitlement avgör om endast Free eller samtliga 1 000 platser är tillgängliga. Snapshotens publiceringsspärr kräver full täckning för alla 1 000 aktiva platser.

## Snapshot-säkerhet i v14.4.2

Cronjobbet använder endast senaste kompletta `activity=all` som fallback. En ny snapshot måste innehålla minst en färsk plats och full täckning för samtliga aktiva registerplatser efter fallback. Annars avbryts publicering, rankingversion, cacheinvalidering och gallring; den tidigare fungerande snapshoten ligger kvar. Diagnostiken redovisar batchindex och verkligt antal misslyckade batcher.

## Platsregister och åtkomst i v14.4.1

`data/places.json` är registerkälla; `npm run places:build` genererar kompatibla assets för frontend och Worker. Frontend använder `getAccessiblePlaces()`, medan Workern alltid verifierar en begäran om `access=premium` mot Supabase-sessionen och den centrala entitlement-RPC:n. Free-svar innehåller aldrig Premiumrader och tvingas till en dag. Cache, inflight-coalescing och ETag använder åtkomstnivån som egen dimension.

Snapshoten innehåller endast `enabled=true`. Varje rad bär stabilt `placeId` och `accessTier`; aktivitetseligibilitet kommer från platsens kategorier före befintlig poängsortering. Marine API använder enbart registerflaggan `marine`. Modell, granskningsregler och importflöde beskrivs i `PLACE_REGISTRY.md`.

## Skalbar forecast-path i v14.3.6

Cronjobbet bygger först den kanoniska sjudagarssnapshoten och beräknar därefter kandidater per aktivitet, region och dag. `forecast_ranking_versions` markerar versionen som `building` tills samtliga rader i `forecast_rankings` är skrivna; endast `ready` läses av API:t. Båda tabellerna är privata för Worker service role.

Rankinglagret nås genom ett avgränsat `rankingStore` i Workern. Supabase är första implementationen, men läs-/skrivgränsen gör att samma objekt senare kan lagras i KV eller R2 utan förändring av forecastkontraktet.

`/v1/forecast` normaliserar även `days=1|all`. Free använder `1`, medan central entitlement låter Trial, Premium, VIP och Admin använda `all`. Svaret märks med snapshot-ID och representationsspecifik ETag. Cache API lagrar svaret i upp till 15 minuter, betraktar de första fem som färska och kan servera resterande tid stale medan en bakgrundsuppdatering sker. Kända cacheposter i cron-isolatet raderas vid publicering; andra datacenter konvergerar genom TTL/SWR.

Frontend sparar ETag per kanonisk request, skickar `If-None-Match` och behåller befintlig prognos vid 304. Polling körs endast när dokumentet är synligt.

## Forecast inom Workers Free-gränser i v14.3.1

Vid cachemiss anropar Workern `get_ranked_forecast()` med service role. PostgreSQL väljer senaste regionala shards, filtrerar och sorterar på snapshotens befintliga `serverScores`. Workern vidarebefordrar den kompakta JSON-strängen till Cache API utan att först läsa, slå samman och sortera hela regionala payloads.

Bakåtkompatibel Worker-bearbetning finns kvar för inomhuskategorier och under övergången innan migrationen är installerad. Cronjobbet använder högst en extern hämtning per fast batch; misslyckade batcher fylls från föregående snapshot.

## Admin i v14.3.0

`admin.js` visar adminvyn endast när `get_user_entitlement()` anger rollen `admin`. Det är UI-skydd; varje känslig databasfunktion verifierar dessutom `auth.uid()` genom `is_current_user_admin()`. Tabellerna `admin_entitlements`, `admin_audit_log` och `admin_user_notes` har RLS och saknar direkt klientåtkomst.

VIP/Premium för familj och vänner lagras i `admin_entitlements`, med valfritt serverkontrollerat slutdatum. Det skapar eller ändrar aldrig en Apple-/Googleprenumeration. Roll, entitlement och abonnemang är separata domäner. Alla administrativa ändringar kräver anledning och loggas atomiskt av RPC:n.

`GET /v1/admin/health` verifierar användarens Supabase-bearer-token och aktiva Admin-roll server-side. Workern använder sin service-role endast internt och returnerar inga nycklar eller miljövärden. Hälsokontrollen är begränsad per Admin i Worker-instansen.

Den äldre `/v1/status` är också Admin-skyddad. `Admin/index.html` innehåller inte längre en fristående oskyddad driftklient utan hänvisar till den integrerade adminpanelen.

## Premium och åtkomst i v14.2.0

Premiumåtkomsten hämtas från `get_user_entitlement()` och konsumeras centralt i `auth.js`:

- `hasPremiumAccess()` – om användaren har full åtkomst.
- `canAccess(feature)` – kontrollerar en namngiven Premium-funktion.
- `requirePremium(feature)` – öppnar Premium-dialogen när åtkomst saknas.

Administrativa roller är `free`, `vip` och `admin`. Trial/Premium är abonnemangsstatus, inte administrativa roller.

## Provperiod och prenumeration

Datamodellen består av:

- `subscriptions` – providerstatus och giltighetsperioder.
- `trial_entitlements` – permanent spärr mot en andra intern trial.
- `subscription_audit_log` – append-only händelselogg.

`start_manual_test_trial()` och `cancel_manual_test_subscription()` är atomiska SECURITY DEFINER-RPC:er. Uppsägning ger `cancelled_active`; serverns `now()` avgör när åtkomsten upphör. Manual Test blir aldrig ett betalt abonnemang.

`subscription-providers.js` definierar den framtida native-gränsen. Apple och Google är endast stubbar. Serverstubbar för verifiering returnerar `501 not configured` och kräver administrativ Worker-autentisering.

Förberedda sökvägar är `/v1/subscriptions/apple/verify`, `/v1/subscriptions/apple/notifications-v2`, `/v1/subscriptions/google/verify`, `/v1/subscriptions/google/rtdn` och `/v1/subscriptions/sync`. De utför ingen verifiering innan riktiga providercredentials och signaturkontroller har konfigurerats.

## Dokumentation

Aktuell dokumentation finns endast i:

- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `SETUP.md`
## Native arkitektur i v14.4.0

`scripts/build-web.mjs` skapar en allowlistad `dist/` och ersätter CDN-referenser med lokalt paketerade Leaflet/Supabase-filer. Capacitor bäddar in `dist/`; production har aldrig en fjärrserver som huvudapp. `native-platform.js` är enda gränsen för plattform, App/Browser/Network/Preferences, extern navigation och framtida köpbridge. Webb använder samma kärnfiler och service worker; native inaktiverar service worker och använder WebView/HTTP-cache.

Supabase-klienten får en asynkron Preferences-adapter i native och normal webblagring på webben. Auth återvänder via `vaderkompassen://auth/callback`; callback växlar PKCE-kod eller tokenpar till session. Native appState och Network dispatchar gemensamma events till befintlig forecast-coalescing så resume inte startar parallella loads.

SubscriptionProvider och AdProvider fabricerar inga köp eller annonser. Native bridge måste senare implementeras och backendverifiering förblir entitlement-sanningskälla.
