/* Väderkompassen v14.3.1 – publik klientkonfiguration.
   Ange endast den publika Worker-adressen här. Lägg aldrig Supabase service-nycklar i appen. */
window.VK_CONFIG = Object.freeze({
  // Explicit internt testläge. Ingen debitering eller butikstransaktion sker.
  subscriptionMode: "manual_test",
  apiBaseUrl: "https://vaderkompassen.andreas-bure.workers.dev",
  apiTimeoutMs: 10000,
  preferCloud: true,
  allowLocalFallback: true,
  supabaseUrl: "https://buyeqmczjatsyylvayti.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eWVxbWN6amF0c3l5bHZheXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMjQ3NjcsImV4cCI6MjEwMDYwMDc2N30.zHetxZBpflhP5or3eVa_9ZBnQ62OmQiiSi8VCTbWOwg"
});
