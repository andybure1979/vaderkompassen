-- Väderkompassen v14.3.6 – färdigbyggda rankingar utanför request-pathen.

create table if not exists public.forecast_ranking_versions (
  snapshot_version text primary key,
  generated_at timestamptz not null,
  active_date date not null,
  status text not null default 'building' check (status in ('building','ready')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.forecast_rankings (
  snapshot_version text not null,
  generated_at timestamptz not null,
  forecast_day date not null,
  activity text not null,
  region text not null,
  ranked_rows jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (snapshot_version, activity, region, forecast_day),
  constraint forecast_rankings_rows_array check (jsonb_typeof(ranked_rows) = 'array')
);

create index if not exists forecast_rankings_lookup_idx
  on public.forecast_rankings (activity, generated_at desc, forecast_day, region);

alter table public.forecast_rankings enable row level security;
alter table public.forecast_ranking_versions enable row level security;
revoke all on table public.forecast_rankings from public, anon, authenticated;
revoke all on table public.forecast_ranking_versions from public, anon, authenticated;
grant select, insert, update, delete on table public.forecast_rankings to service_role;
grant select, insert, update, delete on table public.forecast_ranking_versions to service_role;

comment on table public.forecast_rankings is
  'Endast Worker service_role. Innehåller senaste snapshotens försorterade kandidater per aktivitet, region och dag.';
comment on table public.forecast_ranking_versions is
  'Publiceringsmarkör som gör en rankingversion läsbar först när alla batcher är färdigskrivna.';
