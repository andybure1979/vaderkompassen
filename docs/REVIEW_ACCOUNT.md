# Granskningskonto och reviewflöde

Lagra aldrig credentials i Git eller butikstextfilerna.

1. Skapa ett dedikerat Free-konto i produktions- eller godkänd reviewmiljö och verifiera e-post.
2. Skapa ett separat Premium/sandboxkonto genom Apple sandbox eller Google license testing när butiksprodukterna fungerar. Tilldela inte falsk Apple-/Googleprenumeration i databasen.
3. Adminbehörighet behövs inte för granskning. Använd aldrig Andreas adminkonto.
4. Lägg användarnamn/lösenord endast i portalens skyddade review-fält och rotera efter granskning.

Granskaren ska kunna testa login, Free, Premium/sandbox, hantera/restore purchase, kartnavigation och Profil → Radera mitt konto. Review notes ska ange att nätverk krävs, att kartapp öppnas externt och att RC inte får skickas som betald subscription-build innan native provider och backendverifiering är klara.
