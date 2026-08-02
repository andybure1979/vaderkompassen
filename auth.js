(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const cfg = window.VK_CONFIG || {};
  const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase?.createClient);
  const client = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;

  let session = null;
  let profile = null;
  let entitlement = null;
  let pendingVerificationNotice = false;
  let cloudSettingsRequested = false;

  const PLANNED_PREMIUM_PRICE_SEK = 29;
  const subscriptionProvider = window.VK_SUBSCRIPTIONS?.createProvider(cfg, client);
  const entitlementProvider=()=>window.VK_SUBSCRIPTIONS?.createProvider({subscriptionMode:entitlement?.provider==="apple"?"apple_native":entitlement?.provider==="google"?"google_native":cfg.subscriptionMode},client);
  const PREMIUM_FEATURES = Object.freeze({
    forecastDays: "Alla prognosdagar",
    multiRegion: "Jämför flera regioner",
    cloudSync: "Molnsynk mellan enheter",
    adFree: "Reklamfritt"
  });

  const ROLE_LABELS = {
    free: ["GRATIS", "Gratis"],
    trial: ["TRIAL", "Provperiod"],
    premium: ["PREMIUM", "Premium"],
    vip: ["VIP", "VIP"],
    admin: ["ADMIN", "Admin"]
  };

  function setMessage(id, message = "", error = false) {
    const el = $(id);
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("hidden", !message);
    el.classList.toggle("error", Boolean(error));
  }

  function authErrorMessage(error, action = "konto") {
    const message = String(error?.message || error || "").trim();
    if (/rate limit|too many requests|over_email_send_rate_limit/i.test(message)) return "För många försök. Vänta en stund och försök igen.";
    if (/failed to fetch|fetch failed|network|load failed/i.test(message)) return "Det gick inte att ansluta. Kontrollera internetanslutningen och försök igen.";
    if (/invalid login credentials/i.test(message)) return "Fel e-postadress eller lösenord.";
    if (/email not confirmed/i.test(message)) return "E-postadressen är inte verifierad. Kontrollera din inkorg och öppna verifieringslänken.";
    if (/user already registered|already been registered|already exists/i.test(message)) return "Kontot kunde inte skapas. Prova att logga in eller återställa lösenordet.";
    if (/invalid email|email address.*invalid|unable to validate email/i.test(message)) return "Ange en giltig e-postadress, exempelvis namn@exempel.se.";
    if (/password.*(least|short|characters)|weak password/i.test(message)) return "Lösenordet måste innehålla minst 6 tecken.";
    if (/signup.*disabled|signups not allowed/i.test(message)) return "Kontofunktionen är tillfälligt otillgänglig.";
    if (action === "login") return "Det gick inte att logga in just nu. Försök igen om en stund.";
    if (action === "reset") return "Det gick inte att skicka återställningslänken just nu. Försök igen om en stund.";
    if (action === "oauth") return "Det gick inte att öppna inloggningen just nu. Försök igen om en stund.";
    return "Det gick inte att skapa kontot just nu. Försök igen om en stund.";
  }

  function validatedCredentials(requirePassword = true) {
    const emailInput = $("authEmail"), passwordInput = $("authPassword");
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    if (!email) {
      setMessage("authMessage", "Ange din e-postadress.", true);
      emailInput?.focus();
      return null;
    }
    if (emailInput) emailInput.value = email;
    if (!emailInput?.checkValidity()) {
      setMessage("authMessage", "Ange en giltig e-postadress, exempelvis namn@exempel.se.", true);
      emailInput?.focus();
      return null;
    }
    if (requirePassword && !password) {
      setMessage("authMessage", "Ange ett lösenord.", true);
      passwordInput?.focus();
      return null;
    }
    if (requirePassword && password.length < 6) {
      setMessage("authMessage", "Lösenordet måste innehålla minst 6 tecken.", true);
      passwordInput?.focus();
      return null;
    }
    return { email, password };
  }

  async function withBusy(buttonId, task) {
    const button = $(buttonId);
    if (button?.disabled) return;
    if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
    try { return await task(); }
    finally { if (button) { button.disabled = false; button.removeAttribute("aria-busy"); } }
  }

  function daysLeft(iso) {
    if (!iso) return 0;
    return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
  }

  function appRedirectUrl() {
    return new URL("./", window.location.href).href;
  }

  function closeDialog(id) {
    const dialog = $(id);
    if (dialog?.open) dialog.close();
  }

  function bindDialogDismiss(dialogId, closeButtonId) {
    const dialog = $(dialogId);
    $(closeButtonId)?.addEventListener("click", () => closeDialog(dialogId));
    dialog?.addEventListener("click", event => {
      if (event.target === dialog) closeDialog(dialogId);
    });
  }

  function callbackState() {
    const search = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    const error = search.get("error_description") || hash.get("error_description");
    const isCallback = search.has("code") || hash.has("access_token") || search.has("token_hash");
    return { error, isCallback };
  }

  function clearAuthCallbackUrl() {
    if (!location.search && !location.hash) return;
    history.replaceState({}, document.title, appRedirectUrl());
  }

  function effectiveRole(p) {
    if (entitlement) {
      if (["admin", "vip"].includes(entitlement.role)) return entitlement.role;
      if (entitlement.is_trial) return "trial";
      if (entitlement.is_premium) return "premium";
      return "free";
    }
    if (!p) return "free";
    if (["admin", "vip", "premium"].includes(p.role)) return p.role;
    const trialActive = p.trial_ends_at && new Date(p.trial_ends_at).getTime() > Date.now();
    if (p.role === "trial" && trialActive) return "trial";
    if (p.role === "trial" && p.subscription_status === "active" && !p.cancel_at_period_end) return "premium";
    return "free";
  }

  function hasPremiumAccess(p = profile) {
    if (entitlement)return Boolean(entitlement.is_premium||entitlement.is_trial||["premium","vip","admin"].includes(entitlement.role));
    return ["trial", "premium", "vip", "admin"].includes(effectiveRole(p));
  }

  function canAccess(feature, p = profile) {
    if (!Object.prototype.hasOwnProperty.call(PREMIUM_FEATURES, feature)) return false;
    return hasPremiumAccess(p);
  }

  function openPremiumInfo(feature = "") {
    const requested = PREMIUM_FEATURES[feature] || "";
    if ($("premiumRequestedFeature")) {
      $("premiumRequestedFeature").textContent = requested
        ? `${requested} ingår i Premium.`
        : "Se skillnaden mellan Free och Premium.";
    }
    renderPremiumInfo();
    closeDialog("profileDialog");
    if (!$("premiumInfoDialog")?.open) $("premiumInfoDialog")?.showModal();
  }

  function requirePremium(feature, options = {}) {
    if (canAccess(feature)) return true;
    if (options.openDialog !== false) openPremiumInfo(feature);
    window.dispatchEvent(new CustomEvent("vk:premium-required", { detail: { feature } }));
    return false;
  }

  function renderPremiumInfo() {
    const role = effectiveRole(profile);
    const trialEnd=entitlement?.trial_ends_at||profile?.trial_ends_at;
    const periodEnd=entitlement?.current_period_ends_at||trialEnd;
    const trialDays = daysLeft(trialEnd);
    const trialUsed = entitlement?!entitlement.can_start_trial:Boolean(profile?.trial_used_at);
    const cancelled = Boolean(entitlement?.cancel_at_period_end||entitlement?.subscription_status==="cancelled_active"||profile?.cancel_at_period_end);
    const provider=entitlement?.provider||"manual_test";
    if ($("premiumPrice")) $("premiumPrice").textContent = `Planerat pris: ${PLANNED_PREMIUM_PRICE_SEK} kr/månad`;
    if ($("premiumPriceNote")) $("premiumPriceNote").textContent = role === "trial"
      ? `${trialDays} dag${trialDays === 1 ? "" : "ar"} kvar av provperioden`
      : "Ingen verklig debitering sker i webbversionen";
    if ($("premiumTerms")) $("premiumTerms").textContent="Testprovperioden avslutas efter tre dagar. Ingen debitering sker i denna webbversion. Riktiga köp ansluts senare i native-apparna.";
    if ($("premiumState")) {
      $("premiumState").textContent = cancelled&&hasPremiumAccess()
        ? `Uppsagd – Premium gäller till ${new Date(periodEnd).toLocaleDateString("sv-SE")}. Ingen debitering sker.`
        : entitlement?.subscription_status==="expired"
          ? "Din Premiumperiod har avslutats."
        : role === "trial"
        ? cancelled
          ? `Provperioden är aktiv i ${trialDays} dag${trialDays === 1 ? "" : "ar"} till och förnyas inte.`
          : provider==="manual_test"?"Testprovperioden är aktiv. Ingen debitering sker efter testperioden.":"Provperioden är aktiv enligt butikens villkor."
        : role === "premium"
          ? `Premium är aktivt via ${provider}.`
          : role==="vip"?"Kostnadsfri Premiumåtkomst.":role==="admin"?"Admin har full Premiumåtkomst.":hasPremiumAccess()
            ? "Du har full Premium-åtkomst."
            : trialUsed
              ? "Din kostnadsfria provperiod har redan använts."
              : "Du har inte aktiverat provperioden.";
    }
    if ($("premiumPurchase")) {
      const canStart = Boolean(session?.user) && cfg.subscriptionMode==="manual_test" && role === "free" && !trialUsed;
      $("premiumPurchase").classList.toggle("hidden", !canStart);
      $("premiumPurchase").disabled = !canStart;
      $("premiumPurchase").textContent = "Starta 3 dagars gratis provperiod";
    }
    if ($("premiumCancel")) {
      const canCancel = entitlement?.can_manage_subscription && ["trial", "premium"].includes(role) && !cancelled;
      $("premiumCancel").classList.toggle("hidden", !canCancel);
      $("premiumCancel").textContent=provider==="manual_test"?"Avsluta vid periodens slut":"Hantera prenumeration";
    }
    $("restorePurchases")?.classList.toggle("hidden",!["apple","google"].includes(provider));
  }

  async function startPremiumTrial() {
    if (!client || !session?.user) {
      setMessage("premiumState", "Du måste vara inloggad för att starta provperioden.", true);
      return;
    }
    if (cfg.subscriptionMode!=="manual_test")return setMessage("premiumState","Premiumköp kräver native-appen.",true);
    if (!window.confirm("Starta en tre dagar lång testprovperiod? Ingen debitering sker och perioden blir inte automatiskt betald Premium.")) return;

    const button = $("premiumPurchase");
    const originalText = button?.textContent || "Starta 3 dagars gratis provperiod";
    if (button) {
      button.disabled = true;
      button.textContent = "Aktiverar …";
    }
    setMessage("premiumState", "Aktiverar provperioden …");

    try {
      entitlement=await subscriptionProvider.startSubscription();
      await loadProfile();
      if (effectiveRole(profile) !== "trial" || !entitlement?.is_trial) {
        throw new Error("Provperioden kunde inte aktiveras. Kontrollera att den senaste Supabase-migrationen är körd.");
      }

      renderPremiumInfo();
      setMessage("premiumState", "Testprovperioden är aktiv i tre dagar. Ingen debitering sker i webbversionen.");
      window.dispatchEvent(new CustomEvent("vk:access-changed", { detail: getAccessState() }));
    } catch (error) {
      console.error("Kunde inte starta Premium-provperiod", error);
      await loadProfile();
      renderPremiumInfo();
      setMessage("premiumState", error?.message || "Provperioden kunde inte aktiveras. Försök igen.", true);
    } finally {
      if (button && !button.classList.contains("hidden")) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  async function manageSubscription() {
    if (!client || !session?.user) return;
    if(entitlement?.provider!=="manual_test"){
      try{await entitlementProvider().openManageSubscription()}catch(error){setMessage("premiumState",error.message,true)}
      return;
    }
    if (!window.confirm("Avsluta testprenumerationen vid periodens slut? Premium gäller till slutdatumet och ingen debitering sker.")) return;
    setMessage("premiumState", "Registrerar uppsägningen …");
    try{
      entitlement=await subscriptionProvider.cancelAtPeriodEnd();
      await loadProfile();renderPremiumInfo();
      window.dispatchEvent(new CustomEvent("vk:access-changed", { detail: getAccessState() }));
    }catch(error){setMessage("premiumState",error.message,true)}
  }

  async function restorePurchases(){
    try{await entitlementProvider().restorePurchases()}catch(error){setMessage("premiumState",error.message,true)}
  }

  async function loadProfile() {
    if (!client || !session?.user) {
      profile = null;entitlement=null;
      renderAccount();
      return null;
    }
    const { data, error } = await client.from("profiles").select("*").eq("id", session.user.id).single();
    if (error) {
      console.warn("Kunde inte läsa profil", error.message);
      profile = null;entitlement=null;
    } else {
      profile = data;
    }
    if(profile){
      const {data:access,error:accessError}=await client.rpc("get_user_entitlement");
      entitlement=accessError?null:(Array.isArray(access)?access[0]:access);
      if(accessError)console.warn("Kunde inte läsa entitlement; använder kompatibilitetsläge",accessError.message);
    }
    renderAccount();
    window.dispatchEvent(new CustomEvent("vk:access-changed", { detail: getAccessState() }));
    dispatchCloudSettings();
    return profile;
  }

  function getAccessState() {
    const role = effectiveRole(profile);
    return {
      configured,
      signedIn: Boolean(session?.user),
      user: session?.user || null,
      profile,
      entitlement,
      role,
      premium: hasPremiumAccess(profile),
      admin: role === "admin"
    };
  }

  function renderAccount() {
    const signedIn = Boolean(session?.user);
    const role = effectiveRole(profile);
    const labels = ROLE_LABELS[role] || ROLE_LABELS.free;
    if ($("accountLabel")) $("accountLabel").textContent = signedIn ? labels[0] : "Logga in";
    if ($("accountIcon")) $("accountIcon").textContent = signedIn ? (role === "admin" ? "🛡️" : role === "vip" ? "⭐" : role === "premium" || role === "trial" ? "◆" : "👤") : "👤";
    if (!signedIn) return;

    $("profileEmail").textContent = session.user.email || "–";
    const displayName = profile?.display_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
    if ($("profileDisplayName")) $("profileDisplayName").value = displayName;
    $("profileName").textContent = displayName ? `Hej, ${displayName}!` : "Ditt konto";
    $("profileBadge").textContent = labels[0];
    $("profileBadge").dataset.role = role;
    $("profileAccessTitle").textContent = labels[1];
    const accountStatus=entitlement?.account_status||profile?.account_status||"active";

    const trialEnd=entitlement?.trial_ends_at||profile?.trial_ends_at;
    const trialDays = daysLeft(trialEnd);
    $("profileTrial").textContent = trialDays
      ? `${trialDays} dag${trialDays === 1 ? "" : "ar"} kvar`
      : trialEnd ? "Avslutad" : "Ingen provperiod aktiverad";
    const renewalCancelled = Boolean(entitlement?.cancel_at_period_end||entitlement?.subscription_status==="cancelled_active"||profile?.cancel_at_period_end);
    $("profileSubscription").textContent = accountStatus!=="active"
      ? accountStatus==="blocked"?"Kontot är blockerat. Kontakta support om du tror att detta är fel.":"Kontot är tillfälligt pausat. Kontakta support för mer information."
      : role === "trial"
      ? renewalCancelled ? `Uppsagd – Premium gäller till ${new Date(trialEnd).toLocaleDateString("sv-SE")}` : `${entitlement?.provider||"Test"} · ingen debitering`
      : role === "premium"
        ? renewalCancelled ? "Premium – avslutas vid periodens slut" : `Premium via ${entitlement?.provider||"provider"}${entitlement?.current_period_ends_at?` · nästa period ${new Date(entitlement.current_period_ends_at).toLocaleDateString("sv-SE")}`:""}`
        : role==="vip"?"Kostnadsfri Premiumåtkomst":role==="admin"?"Full Premiumåtkomst":entitlement?.subscription_status==="expired"?"Din Premiumperiod har avslutats.":"Du använder gratisversionen";
    $("profileAccessText").textContent = accountStatus!=="active" ? "Åtkomsten är inte aktiv" : role === "trial"
      ? `Full Premium i ${trialDays} dag${trialDays === 1 ? "" : "ar"}`
      : hasPremiumAccess() ? "Alla dagar, flera regioner, molnsynk och reklamfritt" : "Idag, en region och lokala inställningar";
    const mayStartTrial = cfg.subscriptionMode==="manual_test"&&role === "free" && (entitlement?entitlement.can_start_trial:!profile?.trial_used_at);
    $("upgradePremium").classList.toggle("hidden", accountStatus!=="active");
    $("upgradePremium").textContent = mayStartTrial ? "Prova Premium gratis i 3 dagar" : "Visa Premiumstatus";
    $("openAdmin").classList.toggle("hidden", role !== "admin" || accountStatus!=="active");
  }

  function openAccount() {
    if (!configured) {
      setMessage("authMessage", "Fyll i Supabase URL och publik anon-nyckel i config.js för att aktivera inloggning.", true);
      $("authDialog").showModal();
      return;
    }
    if (session?.user) $("profileDialog").showModal();
    else $("authDialog").showModal();
  }

  async function saveDisplayName() {
    if (!client || !session?.user) return;
    const displayName = $("profileDisplayName")?.value.trim() || "";
    setMessage("profileNameMessage", "Sparar …");
    const { data, error } = await client.from("profiles")
      .update({ display_name: displayName || null })
      .eq("id", session.user.id)
      .select("*")
      .single();
    if (error) return setMessage("profileNameMessage", error.message, true);
    profile = data;
    renderAccount();
    setMessage("profileNameMessage", "Namnet är sparat.");
  }

  async function saveSettings(appSettings) {
    if (!client || !session?.user || !appSettings || typeof appSettings !== "object") return false;
    if (!hasPremiumAccess()) return false;
    const { data, error } = await client.from("profiles")
      .update({ app_settings: appSettings, settings_updated_at: new Date().toISOString() })
      .eq("id", session.user.id)
      .select("*")
      .single();
    if (error) {
      console.warn("Kunde inte synka inställningar", error.message);
      window.dispatchEvent(new CustomEvent("vk:cloud-sync-error", { detail: { message: error.message } }));
      return false;
    }
    profile = data;
    window.dispatchEvent(new CustomEvent("vk:cloud-sync-saved", { detail: { updatedAt: data.settings_updated_at } }));
    return true;
  }

  function dispatchCloudSettings() {
    if (!session?.user || !hasPremiumAccess() || cloudSettingsRequested) return;
    cloudSettingsRequested = true;
    const cloud = profile?.app_settings;
    if (cloud && typeof cloud === "object" && Object.keys(cloud).length) {
      window.dispatchEvent(new CustomEvent("vk:cloud-settings", { detail: { settings: cloud, updatedAt: profile?.settings_updated_at || null } }));
    } else {
      window.dispatchEvent(new CustomEvent("vk:cloud-settings-empty"));
    }
  }

  async function signInWithPassword(event) {
    event.preventDefault();
    if (!client) return setMessage("authMessage", "Inloggningen är inte konfigurerad ännu.", true);
    const credentials = validatedCredentials();
    if (!credentials) return;
    return withBusy("emailLogin", async () => {
      setMessage("authMessage", "Loggar in …");
      try {
        const { error } = await client.auth.signInWithPassword(credentials);
        if (error) return setMessage("authMessage", authErrorMessage(error, "login"), true);
        setMessage("authMessage");
        $("authDialog").close();
      } catch (error) { setMessage("authMessage", authErrorMessage(error, "login"), true); }
    });
  }

  async function signUp() {
    if (!client) return setMessage("authMessage", "Kontofunktionen är tillfälligt otillgänglig.", true);
    const credentials = validatedCredentials();
    if (!credentials) return;
    return withBusy("emailSignup", async () => {
      setMessage("authMessage", "Skapar konto …");
      try {
        const { error } = await client.auth.signUp({ ...credentials, options: { emailRedirectTo: appRedirectUrl() } });
        if (error) return setMessage("authMessage", authErrorMessage(error, "signup"), true);
        setMessage("authMessage", "Kontot är skapat. Kontrollera din e-post och öppna verifieringslänken.");
      } catch (error) { setMessage("authMessage", authErrorMessage(error, "signup"), true); }
    });
  }

  async function oauth(provider) {
    if (!client) return setMessage("authMessage", "Kontofunktionen är tillfälligt otillgänglig.", true);
    setMessage("authMessage", `Öppnar ${provider === "apple" ? "Apple" : "Google"} …`);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: appRedirectUrl() }
      });
      if (error) setMessage("authMessage", authErrorMessage(error, "oauth"), true);
    } catch (error) { setMessage("authMessage", authErrorMessage(error, "oauth"), true); }
  }

  async function resetPassword() {
    if (!client) return setMessage("authMessage", "Kontofunktionen är tillfälligt otillgänglig.", true);
    const credentials = validatedCredentials(false);
    if (!credentials) return;
    return withBusy("resetPassword", async () => {
      try {
        const { error } = await client.auth.resetPasswordForEmail(credentials.email, { redirectTo: appRedirectUrl() });
        setMessage("authMessage", error ? authErrorMessage(error, "reset") : "Återställningslänk skickad.", Boolean(error));
      } catch (error) { setMessage("authMessage", authErrorMessage(error, "reset"), true); }
    });
  }

  async function signOut() {
    await client?.auth.signOut();
    $("profileDialog").close();
  }

  function bind() {
    $("accountBtn")?.addEventListener("click", openAccount);
    $("authForm")?.addEventListener("submit", signInWithPassword);
    $("emailSignup")?.addEventListener("click", signUp);
    $("appleLogin")?.addEventListener("click", () => oauth("apple"));
    $("googleLogin")?.addEventListener("click", () => oauth("google"));
    $("resetPassword")?.addEventListener("click", resetPassword);
    $("signOut")?.addEventListener("click", signOut);
    $("saveProfileName")?.addEventListener("click", saveDisplayName);
    $("upgradePremium")?.addEventListener("click", () => openPremiumInfo());
    $("premiumPurchase")?.addEventListener("click", startPremiumTrial);
    $("premiumCancel")?.addEventListener("click", manageSubscription);
    $("restorePurchases")?.addEventListener("click", restorePurchases);
    $("openAdmin")?.addEventListener("click", () => { $("profileDialog").close(); window.dispatchEvent(new CustomEvent("vk:open-admin")); });
    bindDialogDismiss("authDialog", "authClose");
    bindDialogDismiss("profileDialog", "profileClose");
    bindDialogDismiss("premiumInfoDialog", "premiumInfoClose");
  }

  async function init() {
    const callback = callbackState();
    pendingVerificationNotice = callback.isCallback;
    bind();
    if (!client) {
      renderAccount();
      window.dispatchEvent(new CustomEvent("vk:access-changed", { detail: getAccessState() }));
      return;
    }
    const { data } = await client.auth.getSession();
    session = data.session;
    await loadProfile();
    dispatchCloudSettings();

    if (callback.error) {
      setMessage("authMessage", authErrorMessage(callback.error.replace(/\+/g, " "), "login"), true);
      $("authDialog").showModal();
      clearAuthCallbackUrl();
    } else if (callback.isCallback && session?.user) {
      pendingVerificationNotice = false;
      setMessage("profileNotice", "Din e-postadress är verifierad och du är nu inloggad.");
      $("profileDialog").showModal();
      clearAuthCallbackUrl();
    }

    client.auth.onAuthStateChange(async (_event, nextSession) => {
      session = nextSession;
      cloudSettingsRequested = false;
      await loadProfile();
      dispatchCloudSettings();
      if (pendingVerificationNotice && nextSession?.user) {
        pendingVerificationNotice = false;
        setMessage("profileNotice", "Din e-postadress är verifierad och du är nu inloggad.");
        if (!$("profileDialog").open) $("profileDialog").showModal();
        clearAuthCallbackUrl();
      }
    });
  }

  window.VK_AUTH = Object.freeze({
    getAccessState,
    hasPremiumAccess,
    canAccess,
    requirePremium,
    openPremiumInfo,
    saveSettings,
    client,
    manageSubscription,
    premium: Object.freeze({ plannedPriceSek: PLANNED_PREMIUM_PRICE_SEK, features: PREMIUM_FEATURES })
  });
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
