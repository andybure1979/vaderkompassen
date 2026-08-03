# Integritetspolicy för Väderkompassen

Senast uppdaterad: 2 augusti 2026
Status: Utkast – juridisk granskning krävs före publicering.

## Ansvarig och kontakt

Väderkompassen drivs av Andreas Bure. Frågor om integritet och begäran om registrerades rättigheter skickas till [andreas.bure@gmail.com](mailto:andreas.bure@gmail.com). Organisationsform, postadress och eventuell dataskyddskontakt ska fastställas före publik lansering.

## Uppgifter som behandlas

- Konto: e-postadress, konto-ID, verifierings- och inloggningsstatus.
- Profil: frivilligt visningsnamn, roll, kontostatus och sparade appinställningar.
- Prenumeration: provider, produkt-ID, status, provperiod, periodslut och uppsägningsstatus. Fullständiga betalningskort hanteras inte av Väderkompassen.
- Teknisk drift: tidpunkter, felstatus, Worker-/snapshotversion, prestandamått, IP- och requestmetadata som Cloudflare normalt behandlar för leverans och säkerhet.
- Användning: valda aktiviteter, regioner och lokala inställningar. Free-inställningar ligger lokalt; Premium kan molnsynka inställningar.
- Kontoborttagning: en pseudonymiserad hash och minsta nödvändiga prenumerationsfakta kan behållas för revision och butikshantering. Pseudonymiserat betyder inte anonymt.

Appen läser inte enhetens GPS-position. Val av ort eller kartdestination är inte samma sak som insamling av exakt enhetsposition. Ingen aktiv analys- eller krasch-SDK finns i denna version.

## Ändamål och rättslig grund

Uppgifter används för att skapa och skydda konto, leverera tjänsten, synka valda inställningar, hantera behörighet, förebygga missbruk, felsöka och uppfylla rättsliga skyldigheter. Exakt rättslig grund per behandling (avtal, berättigat intresse, samtycke eller rättslig förpliktelse) ska fastställas genom juridisk granskning innan produktion.

## Tjänsteleverantörer

- Supabase: autentisering, databas, profil och prenumerationsstatus.
- Cloudflare: API, cache, säkerhet och tekniska loggar.
- Open-Meteo, MET Norway och andra dokumenterade väderleverantörer: prognosdata för valda orter; inget appkonto behöver skickas.
- Apple och Google: inloggning när vald samt framtida butiksköp. Butiksköp är inte aktiverade i denna Release Candidate.

AdMob är inte aktivt. Free visar endast lokala annonsplatshållare. Om AdMob aktiveras senare krävs uppdaterad policy, butikernas datadeklarationer och tillämpligt samtyckesflöde innan produktionsannonser laddas.

## Lagring, överföring och säkerhet

Kontodata lagras tills kontot raderas eller så länge behandlingen annars behövs. Exakta lagringstider för driftloggar, revisionsdata och prenumerationsfakta är inte slutligt beslutade och måste fastställas före publicering. Leverantörer kan behandla data utanför Sverige/EES enligt sina avtal och tillämpliga skyddsåtgärder; detta ska verifieras juridiskt.

Kommunikation sker över HTTPS. Behörighetskontroller görs server-side och service-role-nycklar finns inte i klienten. Ingen metod kan ge absolut säkerhet.

## Dina rättigheter och kontoborttagning

Du kan, beroende på tillämplig lag, begära tillgång, rättelse, radering, begränsning, invända eller begära dataportabilitet. Radera normalt kontot via **Profil → Radera mitt konto**. Extern väg finns på kontoborttagningssidan. Identiteten verifieras innan extern permanent radering.

Radering av appkontot avslutar inte automatiskt en Apple- eller Google-prenumeration; den måste hanteras i respektive butik. Minimal revisions- och betalningsinformation kan behöva behållas enligt butikskrav eller lag. Slutlig lagringstid ska fastställas juridiskt.

Du kan klaga till Integritetsskyddsmyndigheten (IMY) eller annan behörig tillsynsmyndighet.

## Ändringar

Policyn kan uppdateras när funktioner eller leverantörer ändras. Datumet ovan visar senaste uppdatering.
