## v14.0.10 – V13-stil i topplistan

Väderkompassen behåller alla tio nuvarande kategorier och deras färgprofiler. Topplistans prognosvärden visas åter i den kompakta, ramlösa V13-stilen med ikoner och korta värden som radbryts efter tillgänglig mobilbredd. De större aktivitetsanpassade faktaboxarna under huvudpoängkortet är oförändrade.

Poängmodell, ranking, karta, autentisering, Premium och Worker-API är oförändrade. Ingen Supabase-migration krävs.

## v14.0.9 – Aktivitetsanpassade faktaboxar

Topplistans kort visar nu 4–12 relevanta prognosvärden för den valda aktiviteten, med högst fyra boxar per rad. Boxarna saknar ramar och skuggor och är anpassade för mobilskärmar. Rekommendationstexten visas utan faktaboxar.

Service-worker-cachen och alla versionsmärkta frontendfiler har uppdaterats så att installerade appar hämtar den nya layouten. Poängmodell och ranking är oförändrade. Ingen Supabase-migration krävs.

## v14.0.8 – Intelligent textsystem

Rekommendationerna använder ett deterministiskt, aktivitetsspecifikt textbibliotek. Samma ort, datum och aktivitet får samma formulering vid omrendering, och den väderfaktor som väger tyngst för aktiviteten lyfts utan att poäng eller ranking ändras.

Bio och Badhus har en lättsam inomhuston. Texterna bygger bara på parametrar som finns i prognosunderlaget. Ingen Supabase-migration krävs.

Textsystemet skiljer mellan positiva bidrag, negativa bidrag och neutrala observationer. Vid låga totalpoäng förklaras de största begränsningarna före mindre styrkor.
