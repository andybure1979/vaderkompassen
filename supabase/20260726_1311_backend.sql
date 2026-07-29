create extension if not exists pgcrypto;

create table if not exists public.forecast_snapshots (
  id bigint generated always as identity primary key,
  activity text not null default 'all',
  regions jsonb not null default '[]'::jsonb,
  areas jsonb not null default '[]'::jsonb,
  payload jsonb not null,
  source_status jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.forecast_snapshots add column if not exists activity text not null default 'all';
alter table public.forecast_snapshots add column if not exists regions jsonb not null default '[]'::jsonb;
alter table public.forecast_snapshots add column if not exists areas jsonb not null default '[]'::jsonb;
alter table public.forecast_snapshots add column if not exists payload jsonb;
alter table public.forecast_snapshots add column if not exists source_status jsonb not null default '[]'::jsonb;
alter table public.forecast_snapshots add column if not exists generated_at timestamptz not null default now();
alter table public.forecast_snapshots add column if not exists created_at timestamptz not null default now();

create index if not exists forecast_snapshots_activity_generated_idx on public.forecast_snapshots(activity, generated_at desc);

create table if not exists public.worker_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('success','error','running')),
  message text,
  details jsonb not null default '{}'::jsonb
);
create index if not exists worker_runs_started_idx on public.worker_runs(started_at desc);

alter table public.forecast_snapshots enable row level security;
alter table public.worker_runs enable row level security;

drop policy if exists "Forecasts are public" on public.forecast_snapshots;
create policy "Forecasts are public" on public.forecast_snapshots for select using (true);
-- worker_runs saknar publik policy och kan därför endast läsas via Worker med service role.
