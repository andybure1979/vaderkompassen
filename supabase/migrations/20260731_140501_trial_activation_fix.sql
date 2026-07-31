-- Väderkompassen v14.0.5.1 – rättar aktivering av Premium-provperiod
-- Kör efter 20260731_1405_subscription_trial_flow.sql.
--
-- Bakgrund: skyddstriggern återställde åtkomstfälten även när de ändrades via
-- den säkerhetsdefinierade RPC-funktionen start_premium_trial(). Därför gav RPC:n
-- inget fel men profilen förblev Gratis.

create or replace function public.protect_profile_access_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Direkta klientuppdateringar körs som rollen authenticated och får inte ändra
  -- åtkomstfälten. Säkerhetsdefinierade RPC-funktioner körs som funktionsägaren
  -- och får däremot göra kontrollerade ändringar.
  if current_user = 'authenticated'
     and auth.uid() = old.id
     and not exists (
       select 1 from public.profiles p
       where p.id = auth.uid() and p.role = 'admin'
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
