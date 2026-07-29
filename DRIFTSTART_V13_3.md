# Väderkompassen v13.3 – verifiering

Efter publicering kan följande adresser testas:

- `/health` – Worker svarar.
- `/v1/status` – Supabase och senaste körningar.
- `/v1/verify` – samlad verifiering. HTTP 200 betyder att Worker, databas och minst en prognossnapshot fungerar. HTTP 503 betyder att Worker och databas svarar men att prognos saknas.

I appens sidfot visas:

- **☁️ Moln** – aktuell data kom från Worker/Supabase.
- **📱 Lokal reserv** – appen beräknade prognosen lokalt.
- **Molncache/Lokal cache** – en sparad prognos visas.
- **Kontrollerar…** – kontroll pågår.
