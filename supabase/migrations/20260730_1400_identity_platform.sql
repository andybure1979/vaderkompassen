-- Väderkompassen v14.0.0 – Identity & Platform
-- Körs efter befintliga migrationer. All användaråtkomst styrs med RLS.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'trial' check (role in ('free','trial','premium','vip','admin')),
  trial_ends_at timestamptz not null default (now() + interval '3 days'),
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive','active','past_due','cancelled','expired')),
  subscription_provider text check (subscription_provider in ('apple','google','stripe','manual')),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_email_idx on public.profiles(lower(email));

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "Users can update own public profile fields" on public.profiles;
create policy "Users can update own public profile fields" on public.profiles
  for update to authenticated using (auth.uid() = id)
  with check (auth.uid() = id);

-- Hindrar vanliga användare från att ändra roll/abonnemang även om de uppdaterar sin egen rad.
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
    new.subscription_status := old.subscription_status;
    new.subscription_provider := old.subscription_provider;
    new.subscription_expires_at := old.subscription_expires_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_access_fields_trigger on public.profiles;
create trigger protect_profile_access_fields_trigger
before update on public.profiles
for each row execute function public.protect_profile_access_fields();

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
    'trial',
    now() + interval '3 days',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.admin_search_users(search_text text default '')
returns table (
  id uuid,
  email text,
  display_name text,
  role text,
  trial_ends_at timestamptz,
  subscription_status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Åtkomst nekad';
  end if;
  return query
  select p.id, coalesce(p.email, u.email), p.display_name, p.role, p.trial_ends_at,
         p.subscription_status, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where coalesce(search_text, '') = ''
     or coalesce(p.email, u.email, '') ilike '%' || search_text || '%'
     or coalesce(p.display_name, '') ilike '%' || search_text || '%'
  order by p.created_at desc
  limit 50;
end;
$$;

grant execute on function public.admin_search_users(text) to authenticated;

create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Åtkomst nekad';
  end if;
  if new_role not in ('free','trial','premium','vip','admin') then
    raise exception 'Ogiltig roll';
  end if;
  update public.profiles
  set role = new_role,
      trial_ends_at = case when new_role = 'trial' then greatest(coalesce(trial_ends_at, now()), now() + interval '3 days') else trial_ends_at end,
      updated_at = now()
  where id = target_user_id;
end;
$$;

grant execute on function public.admin_set_user_role(uuid,text) to authenticated;

-- Befintliga auth-användare får profil när migrationen införs.
insert into public.profiles (id, email, display_name, role, trial_ends_at, created_at)
select u.id, u.email,
       coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
       'trial', now() + interval '3 days', u.created_at
from auth.users u
on conflict (id) do nothing;

-- Första admin tilldelas manuellt i Supabase SQL Editor efter registrering:
-- update public.profiles set role = 'admin' where email = 'din@epost.se';
