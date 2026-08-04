# Produktionsövervakning – Väderkompassen 15.0.0

Övervakningen använder befintlig Cloudflare-, Supabase- och admintelemetri. v15.0.0 inför inget nytt stort observabilitysystem.

| Signal | Varning | Kritisk | Åtgärd |
|---|---:|---:|---|
| Snapshotålder | över 90 min | över 150 min | kontrollera cron, provider och senaste friska snapshot |
| Snapshot coverage | under 100 % enabled | publiceringsförsök under 100 % | stoppa publicering, läs batch-/providerdiagnostik |
| Snapshotfel i följd | 2 | 3 | incident, kontrollera kvot och fallback |
| Worker 5xx | över 1 %/15 min | över 5 %/5 min | rollbackbedömning och logggranskning |
| Worker CPU | över 70 % av plangräns | över 90 % | analysera cachemiss/request-path |
| Forecast totalMs | över 1 s p95 | över 3 s p95 | kontrollera cache och Supabase |
| Cache hit-rate | under 70 % | under 40 % | kontrollera cachekey/invalidering |
| Providerfel | återkommande batchfel | full outage | använd frisk fallback; publicera inte ofullständigt |
| Supabase/Auth-fel | tydlig ökning | login/forecast blockerat | kontrollera status, nycklar och RLS |
| Köpverifieringsfel | ett verifierat fel | återkommande/entitlement-risk | stoppa nya köp; ändra inte befintlig rättighet |
| Annonsfel | återkommande initiering | samtycke saknas | stäng annonser med feature flag |
| Kontoborttagning | ett bekräftat backendfel | systematiskt fel | prioritera säker hotfix och manuell supportväg |

Efter lansering kontrolleras WorkerVersion, snapshotVersion, coverage, cache, 5xx och Auth minst dagligen första veckan. Appkrascher följs i butikernas rapporter tills en godkänd crash-SDK eventuellt införs senare.
