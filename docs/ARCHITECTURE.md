# Arkitektur

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
