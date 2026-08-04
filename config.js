/* Väderkompassen v15.0.3 – publik klientkonfiguration.
   Ange endast den publika Worker-adressen här. Lägg aldrig Supabase service-nycklar i appen. */
const environment=window.VK_ENVIRONMENT||{};
window.VK_CONFIG = Object.freeze({
  environment: environment.name||"production",
  debug: Boolean(environment.debug),
  // Explicit internt testläge. Ingen debitering eller butikstransaktion sker.
  subscriptionMode: environment.subscriptionMode||"disabled",
  adsMode: environment.adsMode||"placeholder",
  apiBaseUrl: environment.apiBaseUrl||"https://vaderkompassen.andreas-bure.workers.dev",
  apiTimeoutMs: 10000,
  preferCloud: true,
  allowLocalFallback: true,
  supabaseUrl: environment.supabaseUrl||"https://buyeqmczjatsyylvayti.supabase.co",
  supabaseAnonKey: environment.supabaseAnonKey||"sb_publishable_PGja4NB-UnrwVCsYAqKTMQ_svTB1Fow",
  supportUrl: environment.supportUrl||"https://andybure1979.github.io/vaderkompassen/public/support/",
  privacyPolicyUrl: environment.privacyPolicyUrl||"https://andybure1979.github.io/vaderkompassen/public/privacy/",
  termsUrl: environment.termsUrl||"https://andybure1979.github.io/vaderkompassen/public/terms/",
  accountDeletionUrl: environment.accountDeletionUrl||"https://andybure1979.github.io/vaderkompassen/public/delete-account/"
});
