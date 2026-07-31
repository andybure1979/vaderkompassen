# Arkitektur

## Premium och åtkomst

`auth.js` är den gemensamma åtkomstmodulen. `window.VK_AUTH` exponerar:

- `getAccessState()` – aktuell användare, profil, roll och behörighet.
- `hasPremiumAccess()` – om användaren har full åtkomst.
- `canAccess(feature)` – kontrollerar en namngiven Premium-funktion.
- `requirePremium(feature)` – returnerar `false` och öppnar Premium-dialogen när åtkomst saknas.

Premiumroller är `trial`, `premium`, `vip` och `admin`. Rollen `free` saknar Premium-åtkomst.

Betalningsleverantörer är ännu inte integrerade. Befintliga profilfält för leverantör, status och giltighet används senare för Apple och Google.
