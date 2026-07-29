# Väderkompassen v13.5.0

## Ny aktivitetslogik
- Sol och bad använder alla prognosorter och rankas enbart på meteorologisk rådata.
- Kustväder visar endast definierade kustorter.
- Surfväder visar endast surfspots och väger våghöjd, vågperiod, frånlandsvind och dyning.
- Cloudflare Workern hämtar marindata från Open-Meteo Marine API och sparar den i snapshoten.

## Driftsättning
Publicera hela repot. Deploya därefter Cloudflare Workern och kör `/v1/admin/run` en gång med `x-admin-token`.
