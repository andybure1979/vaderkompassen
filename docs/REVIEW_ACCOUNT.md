# Granskningskonto och reviewflöde

Lagra aldrig credentials i Git eller butikstextfilerna.

1. Skapa ett dedikerat Free-konto i produktions- eller godkänd reviewmiljö och verifiera e-post.
2. Skapa ett separat Premium/sandboxkonto genom Apple sandbox eller Google license testing när butiksprodukterna fungerar. Tilldela inte falsk Apple-/Googleprenumeration i databasen.
3. Adminbehörighet behövs inte för granskning. Använd aldrig Andreas adminkonto.
4. Lägg användarnamn/lösenord endast i portalens skyddade review-fält och rotera efter granskning.

Granskaren ska kunna testa login, Free, Apple Sandbox-Premium, hantera/återställ köp, kartnavigation och Profil → Radera mitt konto. Review notes ska ange att nätverk krävs och att kartapp öppnas externt. iOS v15.0.3 får inte skickas innan Archive/Validate, App Store Server API, Notifications V2 och Sandbox-matris är verifierade.

Android v15.0.4 får inte skickas innan signerad AAB accepterats i Internal Testing och testkontot kan hämta Google Play-produkten, köpa, återställa och öppna prenumerationshantering. Lägg aldrig testkontots lösenord i Git eller review notes som committas.
