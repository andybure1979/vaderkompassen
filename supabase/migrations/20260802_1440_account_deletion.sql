-- Väderkompassen v14.4.0 – säker, idempotent kontoborttagning.

create extension if not exists pgcrypto;

create table if not exists public.account_deletion_audit (
  id uuid primary key default gen_random_uuid(),
  deleted_at timestamptz not null default now(),
  subject_hash text not null,
  had_active_store_subscription boolean not null default false,
  retained_subscription_facts jsonb not null default '[]'::jsonb
);

alter table public.account_deletion_audit enable row level security;
revoke all on table public.account_deletion_audit from public, anon, authenticated;

create or replace function public.delete_own_account(confirmation_text text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  requester uuid := auth.uid();
  recent_sign_in timestamptz;
  requester_role text;
  retained jsonb := '[]'::jsonb;
  has_store_subscription boolean := false;
begin
  if requester is null then raise exception 'Du måste vara inloggad'; end if;
  if confirmation_text is distinct from 'RADERA' then raise exception 'Obligatorisk bekräftelse saknas'; end if;

  select u.last_sign_in_at into recent_sign_in from auth.users u where u.id=requester;
  if recent_sign_in is null or recent_sign_in < now()-interval '15 minutes' then
    raise exception 'Kontoborttagning kräver en nyligen verifierad inloggning';
  end if;
  select p.role into requester_role from public.profiles p where p.id=requester;
  if requester_role='admin' then raise exception 'Ett adminkonto måste först överlåtas och nedgraderas'; end if;

  select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
    'provider',s.provider,
    'provider_subscription_hash',case when s.provider_subscription_id is null then null else encode(digest(s.provider_subscription_id,'sha256'),'hex') end,
    'product_id',s.product_id,
    'status',s.status,
    'environment',s.environment,
    'period_ends_at',coalesce(s.current_period_ends_at,s.trial_ends_at,s.expires_at),
    'cancel_at_period_end',s.cancel_at_period_end
  ))),'[]'::jsonb),
  coalesce(bool_or(s.provider in ('apple','google') and s.status in ('trialing','active','cancelled_active','grace_period','payment_issue')),false)
  into retained,has_store_subscription
  from public.subscriptions s where s.user_id=requester;

  insert into public.account_deletion_audit(subject_hash,had_active_store_subscription,retained_subscription_facts)
  values(encode(digest(requester::text,'sha256'),'hex'),has_store_subscription,retained);

  delete from auth.users u where u.id=requester;
  if not found then raise exception 'Kontot kunde inte raderas'; end if;
  return jsonb_build_object('deleted',true,'store_subscription_requires_separate_management',has_store_subscription);
end;
$$;

revoke all on function public.delete_own_account(text) from public, anon;
grant execute on function public.delete_own_account(text) to authenticated;

comment on table public.account_deletion_audit is 'Minimal revisionspost utan e-post eller direkt användar-ID. Bevarar endast fakta som behövs för butikssubscription och revision.';
comment on function public.delete_own_account(text) is 'Raderar nyligen återautentiserad användares authkonto och kaskaderande persondata; butikssubscription avslutas inte.';
