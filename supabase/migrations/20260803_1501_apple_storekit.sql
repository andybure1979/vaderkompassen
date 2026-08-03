-- Väderkompassen v15.0.1 – verifierade Apple StoreKit 2-abonnemang.
-- Kör efter 20260801_1420_subscription_foundation.sql och adminmigrationerna.

alter table public.subscriptions
  add column if not exists provider_transaction_id text,
  add column if not exists web_order_line_item_id text,
  add column if not exists app_account_token uuid,
  add column if not exists ownership_type text,
  add column if not exists provider_signed_at timestamptz,
  add column if not exists last_provider_event_at timestamptz;

create unique index if not exists subscriptions_apple_transaction_uidx
  on public.subscriptions(provider,provider_transaction_id)
  where provider='apple' and provider_transaction_id is not null;
create index if not exists subscriptions_apple_account_token_idx
  on public.subscriptions(app_account_token)
  where provider='apple';

create table if not exists public.apple_notification_events (
  notification_uuid uuid primary key,
  notification_type text not null,
  subtype text,
  environment text not null check (environment in ('sandbox','production')),
  original_transaction_id text,
  signed_at timestamptz,
  payload_hash text not null,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.apple_notification_events enable row level security;
revoke all on public.apple_notification_events from public,anon,authenticated;

create or replace function public.sync_apple_subscription(
  p_user_id uuid,
  p_original_transaction_id text,
  p_transaction_id text,
  p_web_order_line_item_id text,
  p_app_account_token uuid,
  p_product_id text,
  p_status text,
  p_entitlement text,
  p_environment text,
  p_current_period_ends_at timestamptz,
  p_grace_period_ends_at timestamptz,
  p_cancel_at_period_end boolean,
  p_trial boolean,
  p_ownership_type text,
  p_signed_at timestamptz,
  p_provider_payload jsonb
) returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  existing public.subscriptions;
  saved public.subscriptions;
  previous_status text;
begin
  if p_user_id is null or not exists(select 1 from auth.users u where u.id=p_user_id) then raise exception 'Apple-användaren saknas'; end if;
  if nullif(trim(p_original_transaction_id),'') is null then raise exception 'Apple originalTransactionId saknas'; end if;
  if nullif(trim(p_product_id),'') is null then raise exception 'Apple productId saknas'; end if;
  if p_status not in ('trialing','active','cancelled_active','grace_period','payment_issue','expired','revoked') then raise exception 'Ogiltig Apple-status'; end if;
  if p_entitlement not in ('free','premium') then raise exception 'Ogiltig entitlement'; end if;
  if p_environment not in ('sandbox','production') then raise exception 'Ogiltig Apple-miljö'; end if;
  if p_app_account_token is not null and p_app_account_token<>p_user_id then raise exception 'Apple appAccountToken matchar inte användaren'; end if;

  select * into existing from public.subscriptions s
   where s.provider='apple' and s.provider_subscription_id=p_original_transaction_id
   for update;
  if found and existing.user_id<>p_user_id then raise exception 'Apple-prenumerationen tillhör ett annat konto'; end if;
  previous_status:=existing.status;

  if existing.id is null then
    insert into public.subscriptions(
      user_id,provider,provider_subscription_id,provider_transaction_id,web_order_line_item_id,app_account_token,product_id,status,entitlement,
      trial_started_at,trial_ends_at,current_period_ends_at,grace_period_ends_at,cancel_at_period_end,cancelled_at,expires_at,
      environment,ownership_type,provider_signed_at,last_provider_event_at,purchase_token_hash,provider_payload
    ) values(
      p_user_id,'apple',p_original_transaction_id,p_transaction_id,p_web_order_line_item_id,p_app_account_token,p_product_id,p_status,p_entitlement,
      case when p_trial then now() end,case when p_trial then p_current_period_ends_at end,p_current_period_ends_at,p_grace_period_ends_at,p_cancel_at_period_end,
      case when p_cancel_at_period_end then now() end,case when p_status in ('expired','revoked') then coalesce(p_current_period_ends_at,now()) end,
      p_environment,p_ownership_type,p_signed_at,now(),encode(digest(coalesce(p_transaction_id,p_original_transaction_id),'sha256'),'hex'),coalesce(p_provider_payload,'{}'::jsonb)
    ) returning * into saved;
  else
    update public.subscriptions set
      provider_transaction_id=p_transaction_id,web_order_line_item_id=p_web_order_line_item_id,
      app_account_token=coalesce(p_app_account_token,app_account_token),product_id=p_product_id,status=p_status,entitlement=p_entitlement,
      trial_started_at=case when p_trial then coalesce(trial_started_at,now()) else trial_started_at end,
      trial_ends_at=case when p_trial then p_current_period_ends_at else trial_ends_at end,
      current_period_ends_at=p_current_period_ends_at,grace_period_ends_at=p_grace_period_ends_at,
      cancel_at_period_end=p_cancel_at_period_end,cancelled_at=case when p_cancel_at_period_end then coalesce(cancelled_at,now()) else null end,
      expires_at=case when p_status in ('expired','revoked') then coalesce(p_current_period_ends_at,now()) else null end,
      environment=p_environment,ownership_type=p_ownership_type,provider_signed_at=p_signed_at,last_provider_event_at=now(),
      purchase_token_hash=encode(digest(coalesce(p_transaction_id,p_original_transaction_id),'sha256'),'hex'),
      provider_payload=coalesce(p_provider_payload,'{}'::jsonb),updated_at=now()
    where id=existing.id returning * into saved;
  end if;

  if p_trial then
    insert into public.trial_entitlements(user_id,product_id,provider,trial_used_at,source)
      values(p_user_id,p_product_id,'apple',coalesce(saved.trial_started_at,now()),'app_store_server_api')
      on conflict do nothing;
  end if;
  if previous_status is distinct from saved.status or existing.id is null then
    insert into public.subscription_audit_log(user_id,subscription_id,event_type,old_status,new_status,provider,details)
      values(p_user_id,saved.id,'provider_sync',previous_status,saved.status,'apple',
        jsonb_build_object('environment',p_environment,'product_id',p_product_id,'transaction_hash',saved.purchase_token_hash));
  end if;
  return to_jsonb(saved)-'provider_payload'-'purchase_token_hash';
end;
$$;

revoke all on function public.sync_apple_subscription(uuid,text,text,text,uuid,text,text,text,text,timestamptz,timestamptz,boolean,boolean,text,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.sync_apple_subscription(uuid,text,text,text,uuid,text,text,text,text,timestamptz,timestamptz,boolean,boolean,text,timestamptz,jsonb) to service_role;

comment on table public.apple_notification_events is 'Idempotenslogg för verifierade App Store Server Notifications V2; rå JWS sparas inte.';
comment on function public.sync_apple_subscription is 'Skriver endast serververifierad Apple-status och kan endast anropas med service role.';
