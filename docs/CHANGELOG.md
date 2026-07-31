# Ändringslogg

## 14.0.6

- Kustväder använder nu en ljus pastellrosa aktivitetsprofil.
- Ny kategori: Bioväder med egen pastellvinröd färg, ikon och poängmodell.
- Ny kategori: Badhusväder med en mörkare pastellvinröd färg, ikon och poängmodell.
- Beslutsförklaringar och aktivitetsväljare har uppdaterats.
- Ingen Supabase-migration krävs.

## 14.0.5.1

- Rättar att bekräftelsen för provperioden inte ändrade kontots status.
- Skyddstriggern tillåter nu kontrollerade åtkomständringar via säkerhetsdefinierade RPC-funktioner.
- Aktiveringsknappen visar pågående status och tydliga felmeddelanden.
- Ny migration: `20260731_140501_trial_activation_fix.sql`.

## 14.0.5

- Nya konton börjar som Gratis utan automatisk provperiod.
- Användaren kan själv starta en tre dagar lång Premium-provperiod.
- Provperioden kan endast användas en gång per konto.
- Aktiv provperiod övergår automatiskt till Premium om förnyelsen inte avslutas.
- Möjlighet att avsluta automatisk förnyelse under provperioden.
- Tydligare abonnemangsstatus och villkor i profil- och Premium-dialogen.
- Ny migration: `20260731_1405_subscription_trial_flow.sql`.

## 14.0.4

- Gemensam Premium-behörighetskontroll för Free, Trial, Premium, VIP och Admin.
- Premium-sida med priset 29 kr/månad.
- Förberett gränssnitt för framtida App Store- och Google Play-betalningar.

## 14.0.3

- Visningsnamn i profilen.
- Molnsynk av användarens inställningar.
