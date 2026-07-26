/* Väderkompassen v13.1 – publik klientkonfiguration.
   Ange endast den publika Worker-adressen här. Lägg aldrig Supabase service-nycklar i appen. */
window.VK_CONFIG = Object.freeze({
  apiBaseUrl: "https://vaderkompassen.andreas-bure.workers.dev",
  apiTimeoutMs: 10000,
  preferCloud: true,
  allowLocalFallback: true
});
