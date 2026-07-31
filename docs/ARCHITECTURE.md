# Arkitektur

## Premium och åtkomst

Premiumåtkomsten hanteras centralt i `auth.js`:

- `hasPremiumAccess()` – om användaren har full åtkomst.
- `canAccess(feature)` – kontrollerar en namngiven Premium-funktion.
- `requirePremium(feature)` – öppnar Premium-dialogen när åtkomst saknas.

Rollerna är `free`, `trial`, `premium`, `vip` och `admin`.

## Provperiod och prenumeration

V14.0.5 använder skyddade Supabase RPC-funktioner:

- `start_premium_trial()` startar kontots enda tre dagar långa provperiod.
- `cancel_premium_subscription()` avslutar automatisk förnyelse men behåller åtkomsten till periodens slut.

`trial_used_at` är den permanenta spärren mot en andra provperiod. Efter en avslutad, ej uppsagd provperiod behandlar klientens centrala åtkomstmodell kontot som Premium. Fram till att App Store och Google Play ansluts används `subscription_provider = manual`; ingen faktisk betalning genomförs.

## Dokumentation

Aktuell dokumentation finns endast i:

- `ARCHITECTURE.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `SETUP.md`
