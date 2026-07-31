-- Väderkompassen v14.0.3 – personlig profil och molnsynk

alter table public.profiles
  add column if not exists app_settings jsonb not null default '{}'::jsonb,
  add column if not exists settings_updated_at timestamptz;

comment on column public.profiles.app_settings is
  'Användarens Väderkompassen-inställningar, inklusive aktivitet, regioner, områden och prognosval.';
comment on column public.profiles.settings_updated_at is
  'Tidpunkt då användarens molnsynkade inställningar senast sparades.';
