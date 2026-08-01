-- Väderkompassen v14.2.0 – prenumerationsgrund och säker testprovperiod.
-- Idempotent migration. Ingen betalning eller butikstransaktion skapas här.

create extension if not exists pgcrypto;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('manual_test','apple','google','vip','admin')),
  provider_customer_id text,
  provider_subscription_id text,
  product_id text,
  status text not null check (status in ('free','trialing','active','cancelled','cancelled_active','grace_period','payment_issue','expired','revoked')),
  entitlement text not null default 'free' check (entitlement in ('free','premium')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_started_at timestamptz,
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  expires_at timestamptz,
  grace_period_ends_at timestamptz,
  purchase_token_hash text,
  environment text not null default 'test' check (environment in ('test','sandbox','production')),
  provider_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (trial_ends_at is null or trial_started_at is null or trial_ends_at > trial_started_at),
  check (current_period_ends_at is null or current_period_started_at is null or current_period_ends_at > current_period_started_at)
);

create unique index if not exists subscriptions_provider_identity_uidx
  on public.subscriptions(provider, provider_subscription_id)
  where provider_subscription_id is not null;
create unique index if not exists subscriptions_one_current_product_uidx
  on public.subscriptions(user_id, provider, coalesce(product_id,''))
  where status in ('trialing','active','cancelled_active','grace_period','payment_issue');
create index if not exists subscriptions_user_idx on public.subscriptions(user_id, updated_at desc);

create table if not exists public.trial_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  provider text not null check (provider in ('manual_test','apple','google')),
  trial_used_at timestamptz not null default now(),
  source text not null,
  created_at timestamptz not null default now(),
  primary key(user_id, product_id, provider)
);

create table if not exists public.subscription_audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('trial_started','cancellation_requested','test_subscription_ended','entitlement_changed','vip_granted','vip_revoked','provider_sync','verification_failed')),
  old_status text,
  new_status text,
  provider text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists subscription_audit_user_idx on public.subscription_audit_log(user_id, created_at desc);

alter table public.subscriptions enable row level security;
alter table public.trial_entitlements enable row level security;
alter table public.subscription_audit_log enable row level security;

drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions" on public.subscriptions for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users read own trial history" on public.trial_entitlements;
create policy "Users read own trial history" on public.trial_entitlements for select to authenticated using (user_id = auth.uid());
-- Ingen klientpolicy för insert/update/delete och ingen klientpolicy för auditloggen.

revoke all on public.subscriptions from anon, authenticated;
revoke all on public.trial_entitlements from anon, authenticated;
revoke all on public.subscription_audit_log from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.trial_entitlements to authenticated;

create or replace function public.get_user_entitlement(target_user_id uuid default auth.uid())
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requester uuid := auth.uid();
  admin_request boolean := false;
  admin_role text := 'free';
  sub public.subscriptions;
  used_trial boolean := false;
  has_subscription boolean := false;
  premium boolean := false;
  trial boolean := false;
  effective_status text := 'free';
begin
  if requester is null then raise exception 'Du måste vara inloggad'; end if;
  select coalesce(p.role,'free') into admin_role from public.profiles p where p.id = target_user_id;
  select exists(select 1 from public.profiles p where p.id = requester and p.role = 'admin') into admin_request;
  if target_user_id is distinct from requester and not admin_request then raise exception 'Obehörig'; end if;

  select * into sub from public.subscriptions s
   where s.user_id = target_user_id
   order by case s.status when 'active' then 1 when 'trialing' then 2 when 'cancelled_active' then 3 when 'grace_period' then 4 else 9 end,
            s.updated_at desc limit 1;
  has_subscription := found;
  select exists(select 1 from public.trial_entitlements t where t.user_id = target_user_id) into used_trial;

  if admin_role in ('admin','vip') then
    premium := true; effective_status := 'active';
  elsif has_subscription then
    trial := sub.status in ('trialing','cancelled_active') and sub.trial_ends_at > now();
    premium := sub.entitlement = 'premium' and (
      (sub.status in ('trialing','cancelled_active') and sub.trial_ends_at > now()) or
      (sub.status in ('active','cancelled_active') and (sub.current_period_ends_at is null or sub.current_period_ends_at > now())) or
      (sub.status = 'grace_period' and sub.grace_period_ends_at > now())
    ) and (sub.expires_at is null or sub.expires_at > now());
    effective_status := case when premium then sub.status else 'expired' end;
  end if;

  return jsonb_build_object(
    'role',case when admin_role in ('admin','vip') then admin_role else 'free' end,
    'subscription_status',effective_status,
    'provider',sub.provider,
    'is_premium',premium,
    'is_trial',trial,
    'trial_ends_at',sub.trial_ends_at,
    'current_period_ends_at',sub.current_period_ends_at,
    'cancel_at_period_end',coalesce(sub.cancel_at_period_end,false),
    'can_start_trial',not used_trial and not premium,
    'can_manage_subscription',premium and sub.provider is not null and admin_role not in ('admin','vip'),
    'entitlement_source',case when admin_role in ('admin','vip') then admin_role when premium then sub.provider else 'free' end,
    'server_time',now()
  );
end;
$$;

create or replace function public.start_manual_test_trial()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := auth.uid(); started timestamptz := now(); ending timestamptz := now() + interval '3 days'; sub_id uuid;
begin
  if uid is null then raise exception 'Du måste vara inloggad'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'Profilen saknas'; end if;
  if exists(select 1 from public.profiles where id=uid and role in ('vip','admin')) then raise exception 'Kontot har redan Premium-åtkomst'; end if;
  insert into public.trial_entitlements(user_id,product_id,provider,trial_used_at,source)
    values(uid,'premium_monthly_test','manual_test',started,'start_manual_test_trial')
    on conflict do nothing;
  if not found then raise exception 'Provperioden har redan använts'; end if;
  insert into public.subscriptions(user_id,provider,product_id,status,entitlement,trial_started_at,trial_ends_at,current_period_started_at,current_period_ends_at,environment)
    values(uid,'manual_test','premium_monthly_test','trialing','premium',started,ending,started,ending,'test') returning id into sub_id;
  insert into public.subscription_audit_log(user_id,subscription_id,actor_user_id,event_type,new_status,provider)
    values(uid,sub_id,uid,'trial_started','trialing','manual_test');
  return public.get_user_entitlement(uid);
end; $$;

create or replace function public.cancel_manual_test_subscription()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); sub public.subscriptions;
begin
  if uid is null then raise exception 'Du måste vara inloggad'; end if;
  select * into sub from public.subscriptions where user_id=uid and provider='manual_test'
    and status in ('trialing','active','cancelled_active') order by updated_at desc limit 1 for update;
  if not found then raise exception 'Det finns ingen aktiv testprenumeration att avsluta'; end if;
  if sub.status <> 'cancelled_active' then
    update public.subscriptions set status='cancelled_active',cancel_at_period_end=true,cancelled_at=now(),updated_at=now() where id=sub.id;
    insert into public.subscription_audit_log(user_id,subscription_id,actor_user_id,event_type,old_status,new_status,provider)
      values(uid,sub.id,uid,'cancellation_requested',sub.status,'cancelled_active','manual_test');
  end if;
  return public.get_user_entitlement(uid);
end; $$;

create or replace function public.end_manual_test_subscription_now(target_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := auth.uid(); sub public.subscriptions;
begin
  if actor is null or not exists(select 1 from public.profiles where id=actor and role='admin') then raise exception 'Endast Admin'; end if;
  select * into sub from public.subscriptions where user_id=target_user_id and provider='manual_test'
    and status in ('trialing','active','cancelled_active','grace_period','payment_issue') order by updated_at desc limit 1 for update;
  if not found then raise exception 'Aktiv testprenumeration saknas'; end if;
  update public.subscriptions set status='expired',entitlement='free',expires_at=now(),updated_at=now() where id=sub.id;
  insert into public.subscription_audit_log(user_id,subscription_id,actor_user_id,event_type,old_status,new_status,provider,details)
    values(target_user_id,sub.id,actor,'test_subscription_ended',sub.status,'expired','manual_test',jsonb_build_object('admin_action',true));
  return public.get_user_entitlement(target_user_id);
end; $$;

revoke all on function public.get_user_entitlement(uuid) from public, anon;
revoke all on function public.start_manual_test_trial() from public, anon;
revoke all on function public.cancel_manual_test_subscription() from public, anon;
revoke all on function public.end_manual_test_subscription_now(uuid) from public, anon;
grant execute on function public.get_user_entitlement(uuid) to authenticated;
grant execute on function public.start_manual_test_trial() to authenticated;
grant execute on function public.cancel_manual_test_subscription() to authenticated;
grant execute on function public.end_manual_test_subscription_now(uuid) to authenticated;

-- De gamla profilbaserade RPC:erna får inte längre ändra åtkomst efter migreringen.
revoke all on function public.start_premium_trial() from public, anon, authenticated;
revoke all on function public.cancel_premium_subscription() from public, anon, authenticated;

create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := auth.uid(); old_role text;
begin
  if actor is null or not exists(select 1 from public.profiles where id=actor and role='admin') then raise exception 'Endast Admin'; end if;
  if new_role not in ('free','vip','admin') then raise exception 'Administrativ roll måste vara free, vip eller admin'; end if;
  select role into old_role from public.profiles where id=target_user_id for update;
  if not found then raise exception 'Användaren saknas'; end if;
  update public.profiles set role=new_role,updated_at=now() where id=target_user_id;
  if old_role is distinct from new_role and (old_role='vip' or new_role='vip') then
    insert into public.subscription_audit_log(user_id,actor_user_id,event_type,old_status,new_status,provider,details)
      values(target_user_id,actor,case when new_role='vip' then 'vip_granted' else 'vip_revoked' end,old_role,new_role,'vip',jsonb_build_object('admin_action',true));
  end if;
end; $$;
revoke all on function public.admin_set_user_role(uuid,text) from public, anon;
grant execute on function public.admin_set_user_role(uuid,text) to authenticated;

-- Permanent trialhistorik och idempotent migrering från gamla profile-fält.
insert into public.trial_entitlements(user_id,product_id,provider,trial_used_at,source)
select p.id,'premium_monthly_test','manual_test',p.trial_used_at,'legacy_profile'
from public.profiles p where p.trial_used_at is not null
on conflict do nothing;

insert into public.subscriptions(user_id,provider,product_id,status,entitlement,trial_started_at,trial_ends_at,current_period_started_at,current_period_ends_at,cancel_at_period_end,cancelled_at,expires_at,environment)
select p.id,'manual_test','premium_monthly_test',
  case when coalesce(p.trial_ends_at,p.subscription_expires_at) > now() then case when p.cancel_at_period_end then 'cancelled_active' else 'trialing' end else 'expired' end,
  case when coalesce(p.trial_ends_at,p.subscription_expires_at) > now() then 'premium' else 'free' end,
  p.trial_started_at,p.trial_ends_at,p.trial_started_at,coalesce(p.subscription_expires_at,p.trial_ends_at),p.cancel_at_period_end,
  case when p.cancel_at_period_end then p.updated_at end,coalesce(p.subscription_expires_at,p.trial_ends_at),'test'
from public.profiles p
where p.subscription_provider='manual' and p.role in ('trial','premium')
  and not exists(select 1 from public.subscriptions s where s.user_id=p.id and s.provider='manual_test' and coalesce(s.product_id,'')='premium_monthly_test');

comment on table public.subscriptions is 'Serververifierad abonnemangsstatus. Klienten har endast läsrätt.';
comment on table public.trial_entitlements is 'Permanent spärr mot återanvänd intern testprovperiod.';
comment on table public.subscription_audit_log is 'Append-only auditlogg för abonnemangshändelser.';
