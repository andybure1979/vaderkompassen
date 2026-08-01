-- Väderkompassen v14.3.1 – flytta forecast-filtrering/ranking från Worker CPU till PostgreSQL.
-- Kör efter 20260801_1430_admin_console.sql. Ändrar inte poängmodeller eller snapshotdata.

create or replace function public.get_ranked_forecast(
  p_activity text,
  p_regions text[] default array[]::text[],
  p_areas text[] default array[]::text[],
  p_places text[] default array[]::text[],
  p_limit integer default 75,
  p_version text default '14.3.1'
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
with latest as (
  select max(generated_at) as latest_generated_at from public.forecast_snapshots where activity='all'
), shards as (
  select s.payload,s.source_status,s.generated_at
  from public.forecast_snapshots s,latest l
  where s.activity='region' and s.generated_at=l.latest_generated_at
    and (cardinality(coalesce(p_regions,array[]::text[]))=0 or s.regions ?| p_regions)
), expanded as (
  select d.key as forecast_day,r.value as row_data,s.generated_at,s.payload,s.source_status,
    case when (r.value->'serverScores'->>p_activity)~'^-?[0-9]+([.][0-9]+)?$'
      then (r.value->'serverScores'->>p_activity)::numeric else null end as score
  from shards s
  cross join lateral jsonb_each(s.payload->'dailyResults') d
  cross join lateral jsonb_array_elements(d.value) r
  where (cardinality(coalesce(p_areas,array[]::text[]))=0 or r.value->>'area'=any(p_areas))
    and (cardinality(coalesce(p_places,array[]::text[]))=0 or r.value->>'place'=any(p_places))
), ranked as (
  select *,row_number() over(partition by forecast_day order by score desc nulls last,coalesce((row_data->>'confidence')::numeric,0) desc) as rank_position
  from expanded where score is not null
), days as (
  select forecast_day,jsonb_agg(
    (row_data - array['serverScores','internal','stale','fallbackFrom','offshoreDirection'])||jsonb_build_object('serverScore',score)
    order by score desc,coalesce((row_data->>'confidence')::numeric,0) desc
  ) as result_rows
  from ranked where rank_position<=least(greatest(coalesce(p_limit,75),1),75) group by forecast_day
), first_shard as (
  select * from shards limit 1
)
select case when exists(select 1 from days) then jsonb_build_object(
  'ok',true,'version',p_version,'generatedAt',(select generated_at from first_shard),
  'activeDate',(select min(forecast_day) from days),'dailyResults',(select jsonb_object_agg(forecast_day,result_rows) from days),
  'sourceStatus',coalesce((select source_status from first_shard),'[]'::jsonb),
  'meta',jsonb_build_object('performance',jsonb_build_object('databaseRanked',true,'rowsReturned',(select coalesce(sum(jsonb_array_length(result_rows)),0) from days))),
  'activity',p_activity,'rankingEngine','cloud-v6-performance-2','resultLimitPerDay',75
) else null end;
$$;

revoke all on function public.get_ranked_forecast(text,text[],text[],text[],integer,text) from public,anon,authenticated;
grant execute on function public.get_ranked_forecast(text,text[],text[],text[],integer,text) to service_role;

comment on function public.get_ranked_forecast(text,text[],text[],text[],integer,text) is
  'Returnerar färdigfiltrerad och färdigrankad forecast från lagrade serverScores. Endast Worker service_role.';
