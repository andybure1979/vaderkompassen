-- Väderkompassen v15.0.2 – serververifierade Google Play-prenumerationer.
-- Purchase tokens lagras endast som SHA-256-hash. Kör efter v15.0.1-migrationen.

alter table public.subscriptions
  add column if not exists base_plan_id text,
  add column if not exists offer_id text,
  add column if not exists linked_purchase_token_hash text,
  add column if not exists acknowledgement_state text;

create unique index if not exists subscriptions_google_token_uidx on public.subscriptions(purchase_token_hash)
  where provider='google' and purchase_token_hash is not null;
create index if not exists subscriptions_google_linked_token_idx on public.subscriptions(linked_purchase_token_hash)
  where provider='google' and linked_purchase_token_hash is not null;

create table if not exists public.google_notification_events (
  message_id text primary key,
  notification_type integer not null,
  event_time timestamptz,
  purchase_token_hash text not null,
  user_id uuid references auth.users(id) on delete set null,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.google_notification_events enable row level security;
revoke all on public.google_notification_events from public,anon,authenticated;

create or replace function public.sync_google_subscription(
  p_user_id uuid,p_purchase_token_hash text,p_linked_purchase_token_hash text,p_product_id text,p_base_plan_id text,p_offer_id text,
  p_status text,p_entitlement text,p_environment text,p_current_period_started_at timestamptz,p_current_period_ends_at timestamptz,
  p_cancel_at_period_end boolean,p_trial boolean,p_acknowledgement_state text,p_source text,p_provider_payload jsonb
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare existing public.subscriptions;saved public.subscriptions;previous_status text;event_name text;
begin
  if p_user_id is null or not exists(select 1 from auth.users u where u.id=p_user_id) then raise exception 'Google-användaren saknas'; end if;
  if nullif(trim(p_purchase_token_hash),'') is null or length(p_purchase_token_hash)<>64 then raise exception 'Ogiltig tokenhash'; end if;
  if p_product_id<>'premium_monthly' then raise exception 'Google-produkt är inte tillåten'; end if;
  if p_status not in ('trialing','active','cancelled_active','grace_period','payment_issue','expired','revoked') then raise exception 'Ogiltig Google-status'; end if;
  if p_entitlement not in ('free','premium') or p_environment not in ('test','production') then raise exception 'Ogiltig Google-entitlement eller miljö'; end if;
  if p_acknowledgement_state not in ('pending','acknowledged') then raise exception 'Ogiltig acknowledgement-status'; end if;

  select * into existing from public.subscriptions s where s.provider='google' and
    (s.purchase_token_hash=p_purchase_token_hash or s.purchase_token_hash=p_linked_purchase_token_hash or s.linked_purchase_token_hash=p_purchase_token_hash)
    order by s.updated_at desc limit 1 for update;
  if found and existing.user_id<>p_user_id then raise exception 'Google-prenumerationen tillhör ett annat konto'; end if;
  previous_status:=existing.status;

  if existing.id is null then
    insert into public.subscriptions(user_id,provider,provider_subscription_id,product_id,base_plan_id,offer_id,purchase_token_hash,linked_purchase_token_hash,
      status,entitlement,trial_started_at,trial_ends_at,current_period_started_at,current_period_ends_at,cancel_at_period_end,cancelled_at,
      grace_period_ends_at,expires_at,environment,acknowledgement_state,last_provider_event_at,provider_payload)
    values(p_user_id,'google',p_purchase_token_hash,p_product_id,p_base_plan_id,p_offer_id,p_purchase_token_hash,p_linked_purchase_token_hash,p_status,p_entitlement,
      case when p_trial then now() end,case when p_trial then p_current_period_ends_at end,p_current_period_started_at,p_current_period_ends_at,p_cancel_at_period_end,
      case when p_cancel_at_period_end then now() end,case when p_status='grace_period' then p_current_period_ends_at end,
      case when p_status in ('expired','revoked') then coalesce(p_current_period_ends_at,now()) end,p_environment,p_acknowledgement_state,now(),coalesce(p_provider_payload,'{}'::jsonb))
    returning * into saved;
  else
    update public.subscriptions set provider_subscription_id=p_purchase_token_hash,product_id=p_product_id,base_plan_id=p_base_plan_id,offer_id=p_offer_id,
      purchase_token_hash=p_purchase_token_hash,linked_purchase_token_hash=p_linked_purchase_token_hash,status=p_status,entitlement=p_entitlement,
      trial_started_at=case when p_trial then coalesce(trial_started_at,now()) else trial_started_at end,
      trial_ends_at=case when p_trial then p_current_period_ends_at else trial_ends_at end,current_period_started_at=p_current_period_started_at,
      current_period_ends_at=p_current_period_ends_at,cancel_at_period_end=p_cancel_at_period_end,
      cancelled_at=case when p_cancel_at_period_end then coalesce(cancelled_at,now()) else null end,
      grace_period_ends_at=case when p_status='grace_period' then p_current_period_ends_at else null end,
      expires_at=case when p_status in ('expired','revoked') then coalesce(p_current_period_ends_at,now()) else null end,
      environment=p_environment,acknowledgement_state=p_acknowledgement_state,last_provider_event_at=now(),provider_payload=coalesce(p_provider_payload,'{}'::jsonb),updated_at=now()
    where id=existing.id returning * into saved;
  end if;
  if p_trial then insert into public.trial_entitlements(user_id,product_id,provider,trial_used_at,source)
    values(p_user_id,p_product_id,'google',coalesce(saved.trial_started_at,now()),'google_play_developer_api') on conflict do nothing; end if;
  if previous_status is distinct from saved.status or existing.id is null then
    event_name:=case saved.status when 'active' then 'google_subscription_renewed' when 'cancelled_active' then 'google_subscription_cancelled'
      when 'expired' then 'google_subscription_expired' when 'revoked' then 'google_subscription_revoked' when 'grace_period' then 'google_grace_period'
      when 'payment_issue' then 'google_payment_issue' else 'google_provider_sync' end;
    insert into public.subscription_audit_log(user_id,subscription_id,event_type,old_status,new_status,provider,details)
      values(p_user_id,saved.id,'provider_sync',previous_status,saved.status,'google',jsonb_build_object('google_event',event_name,'source',p_source,'token_hash',p_purchase_token_hash));
  end if;
  return to_jsonb(saved)-'provider_payload'-'purchase_token_hash'-'linked_purchase_token_hash';
end $$;

revoke all on function public.sync_google_subscription(uuid,text,text,text,text,text,text,text,text,timestamptz,timestamptz,boolean,boolean,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.sync_google_subscription(uuid,text,text,text,text,text,text,text,text,timestamptz,timestamptz,boolean,boolean,text,text,jsonb) to service_role;
comment on table public.google_notification_events is 'Idempotenslogg för verifierade Google Play RTDN; rå purchase token sparas inte.';
comment on function public.sync_google_subscription is 'Skriver endast serververifierad Google Play-status; service role-only.';
