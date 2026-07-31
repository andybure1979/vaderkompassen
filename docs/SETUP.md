# Installation och drift

## Väderkompassen v14.0.4

1. Publicera hela projektet till GitHub.
2. Kontrollera att webbplatsen visar `Väderkompassen v14.0.4` i sidfoten.
3. Testa registrering, inloggning, profil och Premium-dialog.

## Manuella databassteg

**Inga nya SQL-migrationer krävs för v14.0.4.**

Följande tidigare migrationer ska redan vara körda i Supabase, i denna ordning:

1. `supabase/migrations/20260730_1400_identity_platform.sql`
2. `supabase/migrations/20260731_1403_profile_cloud_sync.sql`

## Premium i v14.0.4

Premiumgrunden är aktiv men betalning är ännu inte ansluten. Priset visas som 29 kr/månad. Roller och åtkomst hanteras i `public.profiles`:

- `free`
- `trial`
- `premium`
- `vip`
- `admin`

Nya konton får tre dagars provperiod. `trial`, `premium`, `vip` och `admin` har Premium-behörighet.
