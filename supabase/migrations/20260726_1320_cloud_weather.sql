-- Väderkompassen v13.2.0
-- Körs efter migrationen 20260726_1311_backend.sql.
create index if not exists forecast_snapshots_generated_idx
  on public.forecast_snapshots(generated_at desc);

create index if not exists worker_runs_status_started_idx
  on public.worker_runs(status, started_at desc);

comment on table public.forecast_snapshots is
  'Centralt beräknade prognossnapshots från Cloudflare Worker.';
comment on table public.worker_runs is
  'Driftlogg för schemalagda och manuella Worker-körningar.';
