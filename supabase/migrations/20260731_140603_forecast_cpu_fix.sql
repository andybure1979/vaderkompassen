-- v14.0.6.3 Forecast CPU Fix
-- Snabbar upp filtrering av regionala JSONB-shards för /v1/forecast.

create index if not exists forecast_snapshots_regions_gin_idx
  on public.forecast_snapshots using gin (regions jsonb_path_ops);

analyze public.forecast_snapshots;
