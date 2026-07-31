-- Väderkompassen v14.0.5 – frivillig engångsprovperiod och automatisk övergång till Premium
-- Kör efter 20260731_1403_profile_cloud_sync.sql.

alter table public.profiles alter column role set default 'free';
alter table public.profiles alter column trial_ends_at drop not null;
alter table public.profiles alter column trial_ends_at drop default;

alter table public.profiles
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_used_at timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false;

-- De äldre automatiska testprovperioderna återställs. Användaren kan därefter själv starta sin enda provperiod.
update public.profiles
set role = 'free',
    trial_ends_at = null,
    trial_started_at = null,
    trial_used_at = null,
    subscription_status = 'inactive',
    subscription_provider = null,
    subscription_expires_at = null,
    cancel_at_period_end = false,
    updated_at = now()
where role = 'trial'
  and subscription_status = 'inactive'
  and subscription_provider is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role, trial_ends_at, last_login_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    'free',
    null,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.start_premium_trial()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then raise exception 'Du måste vara inloggad'; end if;

  select * into result from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'Profilen saknas'; end if;
  if result.trial_used_at is not null then raise exception 'Provperioden har redan använts'; end if;
  if result.role in ('premium','vip','admin') then raise exception 'Kontot har redan Premium-åtkomst'; end if;

  update public.profiles
  set role = 'trial',
      trial_started_at = now(),
      trial_used_at = now(),
      trial_ends_at = now() + interval '3 days',
      subscription_status = 'active',
      subscription_provider = 'manual',
      subscription_expires_at = now() + interval '3 days',
      cancel_at_period_end = false,
      updated_at = now()
  where id = auth.uid()
  returning * into result;
  return result;
end;
$$;

grant execute on function public.start_premium_trial() to authenticated;

create or replace function public.cancel_premium_subscription()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then raise exception 'Du måste vara inloggad'; end if;

  update public.profiles
  set subscription_status = 'cancelled',
      cancel_at_period_end = true,
      updated_at = now()
  where id = auth.uid() and role in ('trial','premium')
  returning * into result;

  if not found then raise exception 'Det finns ingen aktiv prenumeration att avsluta'; end if;
  return result;
end;
$$;

grant execute on function public.cancel_premium_subscription() to authenticated;

-- Hindra vanliga profiluppdateringar från att ändra de nya åtkomstfälten.
create or replace function public.protect_profile_access_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ) then
    new.role := old.role;
    new.trial_ends_at := old.trial_ends_at;
    new.trial_started_at := old.trial_started_at;
    new.trial_used_at := old.trial_used_at;
    new.subscription_status := old.subscription_status;
    new.subscription_provider := old.subscription_provider;
    new.subscription_expires_at := old.subscription_expires_at;
    new.cancel_at_period_end := old.cancel_at_period_end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
