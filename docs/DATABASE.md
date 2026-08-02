# Databas – prenumerationer

## v14.3.6 – färdigbyggda forecast-rankingar

Kör `supabase/migrations/20260801_1436_prebuilt_forecast_rankings.sql` före Worker 14.3.6. Tabellen `forecast_ranking_versions` styr atomisk publicering och `forecast_rankings` lagrar försorterade kandidatlistor. Båda har RLS, saknar åtkomst för `anon` och `authenticated` och används endast av Worker service role. Endast senaste kompletta rankingversionen behålls.

## v14.3.1 – Forecast runtime

Kör `supabase/migrations/20260801_1431_forecast_runtime_limits.sql` efter adminmigrationen. Funktionen `get_ranked_forecast()` får endast köras av `service_role`; `anon` och `authenticated` saknar EXECUTE.

Funktionen använder redan lagrade `serverScores`, filtrerar regioner/områden/aktivitetsplatser och begränsar resultatet till 75 per dag. Den skapar inga nya poäng och ändrar ingen snapshotdata.

## v14.3.0

Kör `supabase/migrations/20260801_1430_admin_console.sql` efter `20260801_1420_subscription_foundation.sql`.

Migrationen lägger till kontostatus i `profiles` samt tabellerna `admin_entitlements`, `admin_audit_log` och `admin_user_notes`. Ingen av tabellerna har direkt åtkomst för `anon` eller `authenticated`; all adminåtkomst går genom validerande SECURITY DEFINER-RPC:er med fast `search_path`.

Viktiga RPC:er är `admin_get_dashboard_summary`, `admin_search_users`, `admin_get_user_detail`, `admin_grant_vip`, `admin_revoke_vip`, `admin_set_user_role`, `admin_set_account_status`, `admin_add_user_note` och `admin_list_audit`. `is_current_user_admin()` utgår endast från `auth.uid()` och betrodd profilstatus.

Administrativa entitlements ger åtkomst utan att skapa en rad med provider `apple` eller `google`. Fullständiga providerpayloads, köpidentifierare och autentiseringshemligheter returneras inte till adminvyn.

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
## v14.4.0 – kontoborttagning

Kör `supabase/migrations/20260802_1440_account_deletion.sql`. RPC:n `delete_own_account(text)` kräver nylig autentisering och exakt bekräftelse, blockerar Admin-konton och raderar authanvändaren med kaskaderande persondata. En privat RLS-skyddad revisionspost behåller endast hashat subject/providerreferens och minsta abonnemangsfakta som krävs för butik/revision; den avslutar aldrig en butiksprenumeration.
