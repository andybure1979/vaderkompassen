# Väderkompassen

Väderkompassen är en beslutsapp som hjälper användaren att svara på frågan **”Vart ska jag åka idag?”** utifrån aktivitet, område och väderprognos.

## Stabil bas

Version **13.10.12** är den verifierade stabila slutversionen av 13-serien. Den löste bland annat kartans zoomåterställning, uppdatering av topplistan efter ändrade inställningar och tidigare lagringsproblem.

## v14.0.0 – Identity & Platform

Denna version bygger direkt på den testade main för 13.10.12 och lägger till kontoinfrastruktur utan att ändra väder-, ranking-, kart- eller inställningslogiken.

### Nytt

- Supabase Auth med e-post/lösenord.
- Förberedda knappar för Google och Apple OAuth.
- Profilsida och utloggning.
- Tre dagars Premium-provperiod för nya konton.
- Roller: Free, Trial, Premium, VIP och Admin.
- Adminfunktion för att söka användare och ändra roller.
- Databasmigration med Row Level Security.
- Appen fungerar fortsatt utan inloggning när Supabase inte är konfigurerat.

### Ingår inte ännu

- Betalningar och butiksköp.
- Molnsynkronisering av inställningar och favoriter.
- Annonser.
- Premiumlåsning av funktioner.

## Installation av v14.0.0

Se [`docs/DRIFTSTART_V14_0_0.md`](docs/DRIFTSTART_V14_0_0.md).

## Versionsprincip

Projektet utvecklas enligt principen **en version = ett tydligt problem eller mål**. Varje ny version ska utgå från senast godkända GitHub-main och undvika orelaterade ändringar.

## Roadmap

- **14.0.0:** Konton, profil, roller och säker databasgrund.
- **14.0.1:** Molnsynkronisering av användarinställningar.
- **14.0.2:** Premium- och behörighetsramverk.
- **14.0.3:** Betalningar via App Store och Google Play.
