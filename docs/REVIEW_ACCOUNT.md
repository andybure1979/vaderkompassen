# Granskningskonto och reviewflöde

Lagra aldrig credentials i Git eller butikstextfilerna.

1. Skapa ett dedikerat Free-konto i produktions- eller godkänd reviewmiljö och verifiera e-post.
2. Skapa ett separat Premium/sandboxkonto genom Apple sandbox eller Google license testing när butiksprodukterna fungerar. Tilldela inte falsk Apple-/Googleprenumeration i databasen.
3. Adminbehörighet behövs inte för granskning. Använd aldrig Andreas adminkonto.
4. Lägg användarnamn/lösenord endast i portalens skyddade review-fält och rotera efter granskning.

Granskaren ska kunna testa login, Free, Apple Sandbox-Premium, hantera/återställ köp, kartnavigation och Profil → Radera mitt konto. Review notes ska ange att nätverk krävs och att kartapp öppnas externt. v15.0.1 får inte skickas innan App Store Server API, Notifications V2, migration och Sandbox-matris är verifierade.
