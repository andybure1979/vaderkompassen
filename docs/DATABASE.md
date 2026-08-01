# Databas – prenumerationer

## v14.2.0

Kör `supabase/migrations/20260801_1420_subscription_foundation.sql` efter tidigare identitets- och trialmigrationer.

`subscriptions` innehåller providerstatus, entitlement och giltighetsperioder. `trial_entitlements` registrerar permanent att en intern trial har använts. `subscription_audit_log` kan bara skrivas av skyddade backendfunktioner.

Vanliga användare har endast SELECT på egna subscription- och trialrader. De saknar INSERT, UPDATE och DELETE. Statusändringar sker via:

- `get_user_entitlement(uuid)`
- `start_manual_test_trial()`
- `cancel_manual_test_subscription()`
- `end_manual_test_subscription_now(uuid)` – endast Admin

Migrationen är idempotent. Äldre `manual`-trial/Premium migreras till `manual_test` med befintligt slutdatum och blir aldrig verifierat Apple-/Google-Premium. Gamla profilfält raderas inte.

Providerpayload och köpidentifierare får senare bara skrivas av service role eller en verifierande backend. Köp-token ska endast sparas som hash.
