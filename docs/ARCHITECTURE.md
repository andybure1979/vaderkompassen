# Arkitektur

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
