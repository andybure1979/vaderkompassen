# Installation och drift

## Väderkompassen v14.0.6.1

1. Kör SQL-migrationerna i ordningen nedan.
2. Publicera hela projektet till GitHub.
3. Kontrollera att webbplatsen visar `Väderkompassen v14.0.6.1` i sidfoten.
4. Testa registrering, inloggning, start av provperiod och avslutad automatisk förnyelse.

## Manuella databassteg

Kör migrationerna i Supabase SQL Editor i följande ordning:

1. `supabase/migrations/20260730_1400_identity_platform.sql`
2. `supabase/migrations/20260731_1403_profile_cloud_sync.sql`
3. `supabase/migrations/20260731_1405_subscription_trial_flow.sql`
4. `supabase/migrations/20260731_140501_trial_activation_fix.sql`

Den nya migrationen återställer äldre, automatiskt skapade testprovperioder till Gratis. Dessa användare kan därefter själva starta sin enda provperiod.

## Premium i v14.0.6.1

- Nya konton börjar som `free`.
- Provperioden startas via ett skyddat Supabase RPC-anrop.
- `trial_used_at` gör att en andra provperiod inte kan aktiveras.
- `cancel_at_period_end` anger att automatisk förnyelse har avslutats.
- Under provperioden behålls Premium-åtkomst till slutdatumet även efter uppsägning.
- Utan uppsägning behandlas kontot som Premium efter provperiodens slut.

Betalning är ännu inte ansluten till Apple App Store eller Google Play. Fältet `subscription_provider = manual` används tills butikskvitton blir sanningskälla. Ingen verklig debitering sker i denna version.

## Stabil Cloudflare-deploy i v14.0.6.2

1. Använd Node.js 22 eller senare (`nvm use` läser `.nvmrc`).
2. Kör `npm install` från projektroten.
3. Ange `npm run deploy` som deploy command i Cloudflare.
4. Använd inte `npx wrangler deploy`, eftersom det kan hämta en annan Wrangler-version än den som projektet är testat mot.


## Forecast CPU Fix i v14.0.6.3

Kör migrationen `supabase/migrations/20260731_140603_forecast_cpu_fix.sql` i Supabase SQL Editor efter tidigare migrationer. Deploya därefter Workern med `npm run deploy`. Kontrollera `/v1/forecast` med flera regioner och verifiera att svaret innehåller `meta.performance`.
