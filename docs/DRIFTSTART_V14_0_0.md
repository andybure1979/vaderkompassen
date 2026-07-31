# Väderkompassen v14.0.0 – driftstart

## 1. Databas
Kör migrationen `supabase/migrations/20260730_1400_identity_platform.sql` i Supabase.

## 2. Publik klientkonfiguration
Fyll i följande i `config.js`:

- `supabaseUrl`: projektets URL
- `supabaseAnonKey`: projektets publika anon-nyckel

Lägg aldrig service-role-nyckeln i klienten.

## 3. Auth providers
Aktivera Email i Supabase Auth. Aktivera därefter Google och Apple och lägg in rätt OAuth-uppgifter samt redirect-URL för produktionsdomänen.

## 4. Första admin
Registrera ditt konto och kör sedan i Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'din@epost.se';
```

## 5. Funktioner i denna release

- E-post/lösenord, verifiering och lösenordsåterställning
- Google- och Apple-knappar via Supabase OAuth
- Tre dagars Premium-provperiod för nya konton
- Roller: Free, Trial, Premium, VIP och Admin
- Profilsida och åtkomststatus
- Dold adminpanel för sökning och rolländring
- Förberedd men ännu ej aktiv betalningsknapp

Betalning och reklam ingår inte i v14.0.0.
