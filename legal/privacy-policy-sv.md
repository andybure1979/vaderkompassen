# Integritetspolicy för Väderkompassen

Senast uppdaterad: 4 augusti 2026
Status: Utkast – juridisk granskning krävs före publicering.

## Ansvarig och kontakt

Personuppgiftsansvarig och juridisk aktör är **Privatperson Andreas Bure**. Organisationsnummer och postadress är **ej tillämpligt**. Frågor om integritet och begäran om registrerades rättigheter skickas till [support.vaderkompassen@gmail.com](mailto:support.vaderkompassen@gmail.com).

## Uppgifter som behandlas

- Konto: e-postadress, konto-ID, verifierings- och inloggningsstatus.
- Profil: frivilligt visningsnamn, roll, kontostatus och sparade appinställningar.
- Prenumeration: provider, produkt-ID, status, provperiod, periodslut och uppsägningsstatus. Fullständiga betalningskort hanteras inte av Väderkompassen.
- Teknisk drift: tidpunkter, felstatus, Worker-/snapshotversion, prestandamått, IP- och requestmetadata som Cloudflare normalt behandlar för leverans och säkerhet.
- Användning: valda aktiviteter, regioner och lokala inställningar. Free-inställningar ligger lokalt; Premium kan molnsynka inställningar.
- Kontoborttagning: en pseudonymiserad hash och minsta nödvändiga prenumerationsfakta kan behållas för revision och butikshantering. Pseudonymiserat betyder inte anonymt.

Appen läser inte enhetens GPS-position. Val av ort eller kartdestination är inte samma sak som insamling av exakt enhetsposition. Ingen separat analys- eller krasch-SDK finns i denna version. Nativeappen innehåller Google Mobile Ads/UMP-grunden, men produktionsannonser är avstängda tills samtycke och extern konfiguration är godkända.

## Ändamål och rättslig grund

- Konto och inloggning: fullgörande av avtal.
- Molnsynk: fullgörande av avtal.
- Premiumprenumeration och betalningsverifiering: fullgörande av avtal.
- Supportärenden: berättigat intresse.
- Tekniska loggar och säkerhetsloggar: berättigat intresse för drift, felsökning och säkerhet.
- Annons- och samtyckeshantering: samtycke när det krävs enligt tillämplig lagstiftning.

## Tjänsteleverantörer

- Supabase: autentisering, databas, profil och prenumerationsstatus.
- Cloudflare: API, cache, säkerhet och tekniska loggar.
- Open-Meteo, MET Norway och andra dokumenterade väderleverantörer: prognosdata för valda orter; inget appkonto behöver skickas.
- Apple och Google: inloggning när vald samt butiksköp när dessa senare har integrerats och verifierats. Butiksköp är inte aktiverade i nuvarande produktionskonfiguration.

Google AdMob och User Messaging Platform (UMP) är förberedda för native Free. När produktionsannonser aktiveras kan Google behandla IP-adress och ungefärlig plats, enhets-/annonsidentifierare när tillåtet, annonsvisningar och interaktioner samt krasch- och prestandadiagnostik. UMP begär samtycke där det krävs och användaren kan öppna **Annons- och integritetsinställningar** igen. Vid okänt eller felaktigt samtyckestillstånd visas ingen annons. Trial, Premium, VIP och Admin är reklamfria. Leverantörslista och internationella överföringar kräver juridisk granskning innan aktivering.

## Lagring, överföring och säkerhet

- Kontouppgifter sparas tills användaren raderar sitt konto eller begär radering.
- Molnsynkade uppgifter sparas tills kontot raderas.
- Supportärenden sparas i 24 månader efter avslutat ärende.
- Tekniska felloggar sparas i 30 dagar.
- Säkerhets- och auditloggar sparas i 12 månader.
- Prenumerationsuppgifter sparas så länge det krävs för att administrera prenumerationen och uppfylla tillämpliga bokförings- och avtalsrättsliga skyldigheter.
- Samtyckesinformation sparas enligt CMP-leverantörens hantering eller tills användaren ändrar sina val.

Leverantörer kan behandla data utanför Sverige/EES enligt sina avtal och tillämpliga skyddsåtgärder; detta ska verifieras juridiskt.

Kommunikation sker över HTTPS. Behörighetskontroller görs server-side och service-role-nycklar finns inte i klienten. Ingen metod kan ge absolut säkerhet.

## Dina rättigheter och kontoborttagning

Du kan, beroende på tillämplig lag, begära tillgång, rättelse, radering, begränsning, invända eller begära dataportabilitet. Radera normalt kontot via **Profil → Radera mitt konto**. Extern väg finns på kontoborttagningssidan. Identiteten verifieras innan extern permanent radering.

Radering av appkontot avslutar inte automatiskt en Apple- eller Google-prenumeration; den måste hanteras i respektive butik. Prenumerationsuppgifter kan behöva behållas så länge det krävs för att administrera prenumerationen och uppfylla tillämpliga bokförings- och avtalsrättsliga skyldigheter.

Du kan klaga till Integritetsskyddsmyndigheten (IMY) eller annan behörig tillsynsmyndighet.

## Ändringar

Policyn kan uppdateras när funktioner eller leverantörer ändras. Datumet ovan visar senaste uppdatering.
