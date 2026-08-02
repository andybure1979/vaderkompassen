/* Väderkompassen v14.4.0 – publik klientkonfiguration.
   Ange endast den publika Worker-adressen här. Lägg aldrig Supabase service-nycklar i appen. */
const environment=window.VK_ENVIRONMENT||{};
window.VK_CONFIG = Object.freeze({
  environment: environment.name||"production",
  debug: Boolean(environment.debug),
  // Explicit internt testläge. Ingen debitering eller butikstransaktion sker.
  subscriptionMode: environment.subscriptionMode||"manual_test",
  adsMode: environment.adsMode||"placeholder",
  apiBaseUrl: environment.apiBaseUrl||"https://vaderkompassen.andreas-bure.workers.dev",
  apiTimeoutMs: 10000,
  preferCloud: true,
  allowLocalFallback: true,
  supabaseUrl: environment.supabaseUrl||"https://buyeqmczjatsyylvayti.supabase.co",
  supabaseAnonKey: environment.supabaseAnonKey||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eWVxbWN6amF0c3l5bHZheXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMjQ3NjcsImV4cCI6MjEwMDYwMDc2N30.zHetxZBpflhP5or3eVa_9ZBnQ62OmQiiSi8VCTbWOwg"
});
