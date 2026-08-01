-- Väderkompassen v14.3.0 – säker adminvy och administrativa entitlements.
-- Kör efter 20260801_1420_subscription_foundation.sql. Idempotent och utan destruktiva datamigreringar.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists account_status text not null default 'active',
  add column if not exists account_status_reason text,
  add column if not exists account_status_updated_at timestamptz,
  add column if not exists account_status_updated_by uuid references auth.users(id) on delete set null;

do $$ begin
  alter table public.profiles add constraint profiles_account_status_check
    check (account_status in ('active','suspended','blocked'));
exception when duplicate_object then null; end $$;

create index if not exists profiles_account_status_idx on public.profiles(account_status);

create or replace function public.protect_profile_access_fields()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid()=old.id and not public.is_current_user_admin() then
    new.role:=old.role; new.trial_ends_at:=old.trial_ends_at; new.subscription_status:=old.subscription_status;
    new.subscription_provider:=old.subscription_provider; new.subscription_expires_at:=old.subscription_expires_at;
    new.account_status:=old.account_status; new.account_status_reason:=old.account_status_reason;
    new.account_status_updated_at:=old.account_status_updated_at; new.account_status_updated_by:=old.account_status_updated_by;
  end if;
  new.updated_at:=now(); return new;
end $$;

create table if not exists public.admin_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement text not null check (entitlement in ('vip','premium')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  granted_by uuid not null references auth.users(id) on delete restrict,
  revoked_by uuid references auth.users(id) on delete set null,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at)
);
create unique index if not exists admin_entitlements_one_active_idx
  on public.admin_entitlements(user_id) where revoked_at is null;
create index if not exists admin_entitlements_expiry_idx
  on public.admin_entitlements(expires_at) where revoked_at is null;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  reason text not null,
  ip_hash text,
  user_agent_summary text,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_created_idx on public.admin_audit_log(created_at desc);
create index if not exists admin_audit_target_idx on public.admin_audit_log(target_user_id,created_at desc);
create index if not exists admin_audit_action_idx on public.admin_audit_log(action,created_at desc);

create table if not exists public.admin_user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  note text not null check (char_length(note) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists admin_user_notes_user_idx on public.admin_user_notes(user_id,created_at desc);

alter table public.admin_entitlements enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.admin_user_notes enable row level security;
revoke all on public.admin_entitlements from public, anon, authenticated;
revoke all on public.admin_audit_log from public, anon, authenticated;
revoke all on public.admin_user_notes from public, anon, authenticated;

create or replace function public.is_current_user_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((select p.role='admin' and p.account_status='active' from public.profiles p where p.id=auth.uid()),false);
$$;
revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

create or replace function public.admin_get_dashboard_summary()
returns jsonb language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare result jsonb; latest_snapshot timestamptz; migration_version text := '20260801_1430';
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  select max(generated_at) into latest_snapshot from public.forecast_snapshots;
  select jsonb_build_object(
    'server_time',now(),'database_version',migration_version,
    'users',jsonb_build_object(
      'total',(select count(*) from public.profiles),
      'new_24h',(select count(*) from public.profiles where created_at>=now()-interval '24 hours'),
      'new_7d',(select count(*) from public.profiles where created_at>=now()-interval '7 days'),
      'active',null,
      'admins',(select count(*) from public.profiles where role='admin'),
      'vip',(select count(distinct user_id) from public.admin_entitlements where entitlement='vip' and revoked_at is null and (expires_at is null or expires_at>now()))
    ),
    'subscriptions',jsonb_build_object(
      'free',(select count(*) from public.profiles p where not exists(select 1 from public.subscriptions s where s.user_id=p.id and s.status in ('trialing','active','cancelled_active','grace_period','payment_issue'))),
      'trialing',(select count(*) from public.subscriptions where status='trialing'),
      'active',(select count(*) from public.subscriptions where status='active'),
      'cancelled_active',(select count(*) from public.subscriptions where status='cancelled_active'),
      'grace_period',(select count(*) from public.subscriptions where status='grace_period'),
      'payment_issue',(select count(*) from public.subscriptions where status='payment_issue'),
      'expired',(select count(*) from public.subscriptions where status='expired'),
      'manual_test',(select count(*) from public.subscriptions where provider='manual_test'),
      'apple',(select count(*) from public.subscriptions where provider='apple'),
      'google',(select count(*) from public.subscriptions where provider='google')
    ),
    'operations',jsonb_build_object('latest_snapshot',latest_snapshot,'active_users',null,'cache_hit_rate',null,'cpu_errors_24h',null)
  ) into result;
  return result;
end $$;

drop function if exists public.admin_search_users(text);
create or replace function public.admin_search_users(search_text text,page_size integer default 25,page_offset integer default 0)
returns table(user_id uuid,email text,display_name text,role text,created_at timestamptz,last_sign_in_at timestamptz,
  subscription_status text,provider text,is_premium boolean,trial_used boolean,current_period_ends_at timestamptz,account_status text,total_count bigint)
language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare q text:=trim(coalesce(search_text,'')); lim integer:=least(greatest(coalesce(page_size,25),1),25); off integer:=greatest(coalesce(page_offset,0),0);
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if char_length(q)<2 or char_length(q)>200 then raise exception 'Söktexten måste vara 2–200 tecken'; end if;
  return query
  with matches as (
    select p.id,coalesce(p.email,u.email) mail,p.display_name,p.role,p.created_at,u.last_sign_in_at,p.account_status
    from public.profiles p join auth.users u on u.id=p.id
    where coalesce(p.email,u.email,'') ilike '%'||q||'%' or coalesce(p.display_name,'') ilike '%'||q||'%'
       or p.id::text ilike '%'||q||'%' or coalesce(u.raw_app_meta_data->>'provider','') ilike '%'||q||'%'
  ), counted as (select m.*,count(*) over() total from matches m order by m.created_at desc limit lim offset off)
  select c.id,c.mail,c.display_name,c.role,c.created_at,c.last_sign_in_at,
    coalesce(s.status,'free'),s.provider,
    (c.role in ('admin','vip') or ae.id is not null or (s.entitlement='premium' and s.status in ('trialing','active','cancelled_active','grace_period') and coalesce(s.current_period_ends_at,s.trial_ends_at,s.grace_period_ends_at,'infinity')>now())),
    exists(select 1 from public.trial_entitlements t where t.user_id=c.id),s.current_period_ends_at,c.account_status,c.total
  from counted c
  left join lateral(select * from public.subscriptions x where x.user_id=c.id order by x.updated_at desc limit 1)s on true
  left join lateral(select e.id from public.admin_entitlements e where e.user_id=c.id and e.revoked_at is null and (e.expires_at is null or e.expires_at>now()) limit 1)ae on true;
end $$;

create or replace function public.admin_get_user_detail(target_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare result jsonb;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  select jsonb_build_object(
    'account',jsonb_build_object('user_id',p.id,'email',coalesce(p.email,u.email),'display_name',p.display_name,'created_at',p.created_at,'last_sign_in_at',u.last_sign_in_at,'role',p.role,'account_status',p.account_status,'account_status_reason',p.account_status_reason),
    'subscription',(select to_jsonb(s)-'provider_payload'-'purchase_token_hash'-'provider_customer_id'-'provider_subscription_id' from public.subscriptions s where s.user_id=p.id order by s.updated_at desc limit 1),
    'entitlement',(select to_jsonb(e) from public.admin_entitlements e where e.user_id=p.id and e.revoked_at is null order by e.created_at desc limit 1),
    'trial_used',exists(select 1 from public.trial_entitlements t where t.user_id=p.id),
    'settings',jsonb_build_object('activity',p.app_settings->>'activity','regions',p.app_settings->'regions','settings_updated_at',p.settings_updated_at),
    'history',(select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc),'[]'::jsonb) from (select log.id,log.action,log.entity_type,log.reason,log.created_at from public.admin_audit_log log where log.target_user_id=p.id order by log.created_at desc limit 20)a),
    'notes',(select coalesce(jsonb_agg(to_jsonb(n) order by n.created_at desc),'[]'::jsonb) from (select id,note,created_by,created_at,updated_at from public.admin_user_notes where user_id=p.id order by created_at desc limit 20)n)
  ) into result from public.profiles p join auth.users u on u.id=p.id where p.id=admin_get_user_detail.target_user_id;
  if result is null then raise exception 'Användaren saknas'; end if;
  return result;
end $$;

create or replace function public.admin_grant_vip(target_user_id uuid,expires_at timestamptz default null,reason text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); entitlement_id uuid;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if char_length(trim(coalesce(reason,'')))<3 or char_length(reason)>500 then raise exception 'Anledning krävs (3–500 tecken)'; end if;
  if expires_at is not null and expires_at<=now() then raise exception 'Slutdatum måste ligga i framtiden'; end if;
  perform 1 from public.profiles where id=target_user_id for update; if not found then raise exception 'Användaren saknas'; end if;
  update public.admin_entitlements set revoked_at=now(),revoked_by=actor,updated_at=now() where user_id=target_user_id and revoked_at is null;
  insert into public.admin_entitlements(user_id,entitlement,expires_at,granted_by,reason) values(target_user_id,'vip',expires_at,actor,trim(reason)) returning id into entitlement_id;
  insert into public.admin_audit_log(actor_user_id,target_user_id,action,entity_type,entity_id,new_value,reason)
    values(actor,target_user_id,'vip_granted','admin_entitlement',entitlement_id::text,jsonb_build_object('entitlement','vip','expires_at',expires_at),trim(reason));
  return public.admin_get_user_detail(target_user_id);
end $$;

create or replace function public.admin_revoke_vip(target_user_id uuid,reason text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); old_row public.admin_entitlements;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if char_length(trim(coalesce(reason,'')))<3 or char_length(reason)>500 then raise exception 'Anledning krävs (3–500 tecken)'; end if;
  select * into old_row from public.admin_entitlements where user_id=target_user_id and revoked_at is null order by created_at desc limit 1 for update;
  if not found then raise exception 'Aktiv administrativ entitlement saknas'; end if;
  update public.admin_entitlements set revoked_at=now(),revoked_by=actor,updated_at=now() where id=old_row.id;
  update public.profiles set role='free',updated_at=now() where id=target_user_id and role='vip';
  insert into public.admin_audit_log(actor_user_id,target_user_id,action,entity_type,entity_id,old_value,reason)
    values(actor,target_user_id,'vip_revoked','admin_entitlement',old_row.id::text,to_jsonb(old_row)-'reason',trim(reason));
  return public.admin_get_user_detail(target_user_id);
end $$;

drop function if exists public.admin_set_user_role(uuid,text);
create or replace function public.admin_set_user_role(target_user_id uuid,new_role text,reason text,confirmation text default '')
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); old_role text; admin_count bigint;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if new_role not in ('free','vip','admin') then raise exception 'Ogiltig administrativ roll'; end if;
  if char_length(trim(coalesce(reason,'')))<3 or char_length(reason)>500 then raise exception 'Anledning krävs (3–500 tecken)'; end if;
  if new_role='admin' and confirmation<>'GE ADMIN' then raise exception 'Bekräftelsen GE ADMIN krävs'; end if;
  select role into old_role from public.profiles where id=target_user_id for update; if not found then raise exception 'Användaren saknas'; end if;
  select count(*) into admin_count from public.profiles where role='admin' and account_status='active';
  if old_role='admin' and new_role<>'admin' and (target_user_id=actor or admin_count<=1) then raise exception 'Du kan inte ta bort din egen eller den sista aktiva Admin-rollen'; end if;
  update public.profiles set role=new_role,updated_at=now() where id=target_user_id;
  insert into public.admin_audit_log(actor_user_id,target_user_id,action,entity_type,entity_id,old_value,new_value,reason)
    values(actor,target_user_id,'role_changed','profile',target_user_id::text,jsonb_build_object('role',old_role),jsonb_build_object('role',new_role),trim(reason));
  return public.admin_get_user_detail(target_user_id);
end $$;

create or replace function public.admin_set_account_status(target_user_id uuid,new_status text,reason text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); old_status text;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if new_status not in ('active','suspended','blocked') then raise exception 'Ogiltig kontostatus'; end if;
  if char_length(trim(coalesce(reason,'')))<3 or char_length(reason)>500 then raise exception 'Anledning krävs (3–500 tecken)'; end if;
  select account_status into old_status from public.profiles where id=target_user_id for update; if not found then raise exception 'Användaren saknas'; end if;
  if target_user_id=actor and new_status<>'active' then raise exception 'Admin kan inte blockera sitt eget konto'; end if;
  update public.profiles set account_status=new_status,account_status_reason=case when new_status='active' then null else trim(reason) end,account_status_updated_at=now(),account_status_updated_by=actor,updated_at=now() where id=target_user_id;
  insert into public.admin_audit_log(actor_user_id,target_user_id,action,entity_type,entity_id,old_value,new_value,reason)
    values(actor,target_user_id,case new_status when 'blocked' then 'account_blocked' when 'suspended' then 'account_suspended' else 'account_reactivated' end,'profile',target_user_id::text,jsonb_build_object('status',old_status),jsonb_build_object('status',new_status),trim(reason));
  return public.admin_get_user_detail(target_user_id);
end $$;

create or replace function public.admin_add_user_note(target_user_id uuid,note_text text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); note_id uuid;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if char_length(trim(coalesce(note_text,'')))<1 or char_length(note_text)>1000 then raise exception 'Anteckningen måste vara 1–1000 tecken'; end if;
  insert into public.admin_user_notes(user_id,created_by,note) values(target_user_id,actor,trim(note_text)) returning id into note_id;
  insert into public.admin_audit_log(actor_user_id,target_user_id,action,entity_type,entity_id,new_value,reason)
    values(actor,target_user_id,'note_created','admin_user_note',note_id::text,jsonb_build_object('length',char_length(trim(note_text))),'Intern administrativ anteckning');
  return public.admin_get_user_detail(target_user_id);
end $$;

create or replace function public.admin_end_manual_test(target_user_id uuid,reason text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); sub public.subscriptions;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if char_length(trim(coalesce(reason,'')))<3 or char_length(reason)>500 then raise exception 'Anledning krävs (3–500 tecken)'; end if;
  select * into sub from public.subscriptions where user_id=target_user_id and provider='manual_test' and environment<>'production' and status in ('trialing','active','cancelled_active','grace_period','payment_issue') order by updated_at desc limit 1 for update;
  if not found then raise exception 'Aktiv manual_test-prenumeration i testmiljö saknas'; end if;
  update public.subscriptions set status='expired',entitlement='free',expires_at=now(),updated_at=now() where id=sub.id;
  insert into public.subscription_audit_log(user_id,subscription_id,actor_user_id,event_type,old_status,new_status,provider,details) values(target_user_id,sub.id,actor,'test_subscription_ended',sub.status,'expired','manual_test',jsonb_build_object('reason',trim(reason)));
  insert into public.admin_audit_log(actor_user_id,target_user_id,action,entity_type,entity_id,old_value,new_value,reason) values(actor,target_user_id,'manual_subscription_ended','subscription',sub.id::text,jsonb_build_object('status',sub.status),jsonb_build_object('status','expired'),trim(reason));
  return public.admin_get_user_detail(target_user_id);
end $$;

create or replace function public.admin_extend_manual_test(target_user_id uuid,new_ends_at timestamptz,reason text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid:=auth.uid(); sub public.subscriptions;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  if char_length(trim(coalesce(reason,'')))<3 or char_length(reason)>500 then raise exception 'Anledning krävs (3–500 tecken)'; end if;
  if new_ends_at is null or new_ends_at<=now() or new_ends_at>now()+interval '90 days' then raise exception 'Testslut måste ligga inom 90 dagar'; end if;
  select * into sub from public.subscriptions where user_id=target_user_id and provider='manual_test' and environment<>'production' order by updated_at desc limit 1 for update;
  if not found then raise exception 'manual_test-prenumeration i testmiljö saknas'; end if;
  update public.subscriptions set status='trialing',entitlement='premium',trial_ends_at=new_ends_at,current_period_ends_at=new_ends_at,expires_at=null,cancel_at_period_end=false,updated_at=now() where id=sub.id;
  insert into public.admin_audit_log(actor_user_id,target_user_id,action,entity_type,entity_id,old_value,new_value,reason) values(actor,target_user_id,'test_status_simulated','subscription',sub.id::text,jsonb_build_object('ends_at',coalesce(sub.current_period_ends_at,sub.trial_ends_at)),jsonb_build_object('ends_at',new_ends_at,'status','trialing'),trim(reason));
  return public.admin_get_user_detail(target_user_id);
end $$;

create or replace function public.admin_list_audit(page_size integer default 25,page_offset integer default 0,action_filter text default null,target_filter uuid default null)
returns table(id uuid,actor_user_id uuid,target_user_id uuid,action text,entity_type text,reason text,created_at timestamptz,total_count bigint)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  return query select a.id,a.actor_user_id,a.target_user_id,a.action,a.entity_type,a.reason,a.created_at,count(*) over()
  from public.admin_audit_log a where (action_filter is null or a.action=action_filter) and (target_filter is null or a.target_user_id=target_filter)
  order by a.created_at desc limit least(greatest(coalesce(page_size,25),1),50) offset greatest(coalesce(page_offset,0),0);
end $$;

-- Adminåtkomst sker uteslutande genom de validerande RPC:erna.
do $$ declare fn text; begin
  foreach fn in array array['admin_get_dashboard_summary()','admin_search_users(text,integer,integer)','admin_get_user_detail(uuid)','admin_grant_vip(uuid,timestamptz,text)','admin_revoke_vip(uuid,text)','admin_set_user_role(uuid,text,text,text)','admin_set_account_status(uuid,text,text)','admin_add_user_note(uuid,text)','admin_end_manual_test(uuid,text)','admin_extend_manual_test(uuid,timestamptz,text)','admin_list_audit(integer,integer,text,uuid)'] loop
    execute 'revoke all on function public.'||fn||' from public, anon';
    execute 'grant execute on function public.'||fn||' to authenticated';
  end loop;
end $$;

-- Separata entitlements påverkar Premium, men är aldrig butiksköp.
create or replace function public.get_user_entitlement(target_user_id uuid default auth.uid())
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare requester uuid:=auth.uid(); user_role text:='free'; acct text:='active'; sub public.subscriptions; used_trial boolean:=false; premium boolean:=false; trial boolean:=false; effective_status text:='free'; admin_ent public.admin_entitlements;
begin
  if requester is null then raise exception 'Du måste vara inloggad'; end if;
  if target_user_id is distinct from requester and not public.is_current_user_admin() then raise exception 'Obehörig'; end if;
  select coalesce(role,'free'),account_status into user_role,acct from public.profiles where id=target_user_id;
  select * into admin_ent from public.admin_entitlements where user_id=target_user_id and revoked_at is null and starts_at<=now() and (expires_at is null or expires_at>now()) order by created_at desc limit 1;
  select * into sub from public.subscriptions where user_id=target_user_id order by case status when 'active' then 1 when 'trialing' then 2 when 'cancelled_active' then 3 when 'grace_period' then 4 else 9 end,updated_at desc limit 1;
  select exists(select 1 from public.trial_entitlements where user_id=target_user_id) into used_trial;
  if acct<>'active' then premium:=false; effective_status:=acct;
  elsif user_role='admin' or admin_ent.id is not null or user_role='vip' then premium:=true; effective_status:='active';
  elsif sub.id is not null then
    trial:=sub.status in ('trialing','cancelled_active') and sub.trial_ends_at>now();
    premium:=sub.entitlement='premium' and (((sub.status in ('trialing','cancelled_active')) and sub.trial_ends_at>now()) or (sub.status in ('active','cancelled_active') and (sub.current_period_ends_at is null or sub.current_period_ends_at>now())) or (sub.status='grace_period' and sub.grace_period_ends_at>now())) and (sub.expires_at is null or sub.expires_at>now());
    effective_status:=case when premium then sub.status else 'expired' end;
  end if;
  return jsonb_build_object('role',case when user_role='admin' then 'admin' when admin_ent.id is not null or user_role='vip' then 'vip' else 'free' end,'account_status',acct,'subscription_status',effective_status,'provider',sub.provider,'product_id',sub.product_id,'is_premium',premium,'is_trial',trial,'trial_ends_at',sub.trial_ends_at,'current_period_ends_at',sub.current_period_ends_at,'cancel_at_period_end',coalesce(sub.cancel_at_period_end,false),'can_start_trial',not used_trial and not premium and acct='active','can_manage_subscription',premium and sub.provider is not null and user_role<>'admin' and admin_ent.id is null,'entitlement_source',case when user_role='admin' then 'admin' when admin_ent.id is not null then 'admin_entitlement' when premium then sub.provider else 'free' end,'admin_entitlement_expires_at',admin_ent.expires_at,'server_time',now());
end $$;
revoke all on function public.get_user_entitlement(uuid) from public, anon;
grant execute on function public.get_user_entitlement(uuid) to authenticated;

-- Befintliga VIP-profiler behåller åtkomst utan att omvandlas till betalprenumeration.
insert into public.admin_entitlements(user_id,entitlement,granted_by,reason)
select p.id,'vip',p.id,'Migrerad befintlig VIP-roll' from public.profiles p where p.role='vip'
on conflict (user_id) where revoked_at is null do nothing;
