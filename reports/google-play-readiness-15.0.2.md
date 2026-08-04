# Google Play readiness – v15.0.2

Datum: 2026-08-03

## Repoimplementation

- Officiell Play Billing Library 9.1.0 via egen Capacitor Java-brygga; ingen tredjepartsplugin.
- Central produkt `premium_monthly`, base plan `monthly`, valfritt trial offer `premium_trial_3_days`.
- ProductDetails och lokaliserat pris, pending/cancel/already-owned, restore/sync, manage och acknowledgement.
- Klientacknowledgement sker först efter lyckad backendverifiering.
- Worker OAuth med service account och `purchases.subscriptionsv2.get`.
- RTDN med verifierad Pub/Sub OIDC, idempotent message ID och ny Developer API-hämtning.
- Service-role-only Supabase-RPC, RLS och endast SHA-256-hash av purchase/linked token.
- Apple, Free/Premium-regler, design, väder, poäng, ranking, snapshot och cache är oförändrade.

## Lokal verifiering

- JavaScript-syntax: godkänd.
- Tester: 100/100 godkända.
- Version 15.0.2: synkroniserad; iOS ligger avsiktligt kvar på 15.0.1 build 4.
- Webbuild och Capacitor Android-sync: godkända.
- Worker dry-run: godkänd.
- Production-config och secret scan: godkända.
- Android debug/release/AAB: ej körbara lokalt eftersom JDK och Android SDK saknas. Detta är en miljöblockerare, inte ett godkänt buildresultat.

## Externt – MANUAL ACTION REQUIRED

Andreas måste skapa/aktivera Play Console-produkt, base plan/offer, licenstestare och Internal Testing-build; aktivera Developer API; skapa servicekonto och minsta behörighet; skapa Pub/Sub/RTDN och push-OIDC; sätt Worker-secrets; köra Supabase-migrationen samt genomföra hela köp- och livscykelmatrisen.

## Stoppläge

Versionen är **BLOCKED för Internal Testing tills Androidbuild kan kompileras i korrekt JDK/SDK-miljö**, och **BLOCKED för produktion** tills alla externa resurser och riktiga Google Play-tester är verifierade. Ingen commit, push, migration eller deploy ingår i implementationen.
