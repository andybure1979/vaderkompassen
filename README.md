# Väderkompassen

## Stabil Cloudflare-deploy (v14.0.6.2)

Projektet låser Wrangler till version `4.114.0` i rotens `package.json`. På så sätt hämtar deployen inte automatiskt en ny och potentiellt trasig version.

Krav: Node.js 22 eller senare. Rekommenderad version finns i `.nvmrc`.

Installera beroenden och skapa/uppdatera låsfilen:

```bash
npm install
```

Deploya därefter med:

```bash
npm run deploy
```

Cloudflares deploy command ska vara `npm run deploy`, inte `npx wrangler deploy`.

## Inomhusväder

Bioväder och Badhusväder ligger sist i aktivitetsväljaren och använder medvetet omvänd poängsättning: ju sämre utomhusväder, desto bättre betyg för inomhusaktiviteten.

