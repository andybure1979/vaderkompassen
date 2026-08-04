(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const cfg = window.VK_CONFIG || {};
  const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase?.createClient);
  const client = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: !window.VK_NATIVE?.isNativePlatform?.(), storage: window.VK_NATIVE?.storage }
  }) : null;

  let session = null;
  let profile = null;
  let entitlement = null;
  let pendingVerificationNotice = false;
  let cloudSettingsRequested = false;
  let lastAppleSyncAt=0,appleSyncPromise=null;

  const subscriptionProvider = window.VK_SUBSCRIPTIONS?.createProvider(cfg, client);
  let storeProduct = null;
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
    return window.VK_NATIVE?.authRedirectUrl?.()||new URL("./", window.location.href).href;
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

  async function handleNativeAuthUrl(rawUrl) {
    if (!client || !rawUrl) return false;
    const url=new URL(rawUrl),search=new URLSearchParams(url.search),hash=new URLSearchParams(url.hash.replace(/^#/,""));
    const error=search.get("error_description")||hash.get("error_description");
    if(error){setMessage("authMessage",authErrorMessage(error,"login"),true);$("authDialog")?.showModal();return false}
    const code=search.get("code");
    if(code){const {error:exchangeError}=await client.auth.exchangeCodeForSession(code);if(exchangeError)throw exchangeError;return true}
    const accessToken=hash.get("access_token"),refreshToken=hash.get("refresh_token");
    if(accessToken&&refreshToken){const {error:sessionError}=await client.auth.setSession({access_token:accessToken,refresh_token:refreshToken});if(sessionError)throw sessionError;return true}
    return false;
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
    refreshStoreDisclosure();
    closeDialog("profileDialog");
    if (!$("premiumInfoDialog")?.open) $("premiumInfoDialog")?.showModal();
  }

  function productPrice(product){return product?.displayPrice||product?.localizedPrice||product?.priceString||null}
  function productPeriod(product){return product?.billingPeriodLabel||product?.subscriptionPeriod?.localized||product?.billingPeriod||"månad"}
  function productIntro(product){const offer=product?.introductoryOffer;return offer?.period?`Provperiod: ${offer.period} (${offer.displayPrice||"0 kr"})`:null}
  async function refreshStoreDisclosure(){
    if(!["apple_native","google_native"].includes(cfg.subscriptionMode))return;
    try{
      const products=await subscriptionProvider.getProducts();storeProduct=Array.isArray(products)?products[0]:products?.products?.[0]||null;
      renderPremiumInfo();
    }catch(error){storeProduct=null;setMessage("premiumState","Butikens produktuppgifter kunde inte hämtas. Inget köp kan genomföras.",true)}
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
    const nativeStore=["apple_native","google_native"].includes(cfg.subscriptionMode),price=productPrice(storeProduct),period=productPeriod(storeProduct);
    if ($("premiumPrice")) $("premiumPrice").textContent = cfg.subscriptionMode==="manual_test"?"Testprovperiod: 0 kr":nativeStore&&price?`Väderkompassen Premium – ${price}/${period}`:"Butiksköp är inte aktiverade";
    if ($("premiumPriceNote")) $("premiumPriceNote").textContent = role === "trial"
      ? `${trialDays} dag${trialDays === 1 ? "" : "ar"} kvar av provperioden`
      : nativeStore&&price?[productIntro(storeProduct),"Butikens lokala pris; automatisk förnyelse enligt perioden"].filter(Boolean).join(" · "):"Ingen verklig debitering sker i denna version";
    if ($("premiumTerms")) $("premiumTerms").textContent=cfg.subscriptionMode==="manual_test"
      ? "Testprovperioden varar tre dagar, kostar 0 kr, avslutas automatiskt och blir inte en betalprenumeration."
      : nativeStore&&price
        ? `Efter eventuell provperiod debiteras ${price} per ${period}. Prenumerationen förnyas automatiskt tills den sägs upp i butiken. Åtkomst behålls till periodens slut.`
        : "Riktiga köp är avstängda tills butikens produktdata, backendverifiering och sandboxflöde fungerar.";
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
      const canStart = Boolean(session?.user) && role === "free" && (["apple_native","google_native"].includes(cfg.subscriptionMode)||cfg.subscriptionMode==="manual_test"&&!trialUsed);
      $("premiumPurchase").classList.toggle("hidden", !canStart);
      $("premiumPurchase").disabled = !canStart;
      $("premiumPurchase").textContent = ["apple_native","google_native"].includes(cfg.subscriptionMode)?"Bli Premium":"Starta 3 dagars gratis provperiod";
    }
    if ($("premiumCancel")) {
      const canCancel = entitlement?.can_manage_subscription && ["trial", "premium"].includes(role) && !cancelled;
      $("premiumCancel").classList.toggle("hidden", !canCancel);
      $("premiumCancel").textContent=provider==="manual_test"?"Avsluta vid periodens slut":"Hantera prenumeration";
    }
    $("restorePurchases")?.classList.toggle("hidden",cfg.subscriptionMode!=="apple_native"&&!["apple","google"].includes(provider));
  }

  async function startPremiumTrial() {
    if (!client || !session?.user) {
      setMessage("premiumState", "Du måste vara inloggad för att starta provperioden.", true);
      return;
    }
    const nativePurchase=["apple_native","google_native"].includes(cfg.subscriptionMode),googlePurchase=cfg.subscriptionMode==="google_native";
    if (!nativePurchase&&cfg.subscriptionMode!=="manual_test")return setMessage("premiumState","Premiumköp kräver native-appen.",true);
    if (!nativePurchase&&!window.confirm("Starta en tre dagar lång testprovperiod? Ingen debitering sker och perioden blir inte automatiskt betald Premium.")) return;

    const button = $("premiumPurchase");
    const originalText = button?.textContent || "Starta 3 dagars gratis provperiod";
    if (button) {
      button.disabled = true;
      button.textContent = "Aktiverar …";
    }
    setMessage("premiumState", "Aktiverar provperioden …");

    try {
      entitlement=await subscriptionProvider.startSubscription();
      if(entitlement?.pending){setMessage("premiumState","Köpet väntar på bekräftelse. Premium aktiveras först efter serververifiering.");return}
      await loadProfile();
      if (!hasPremiumAccess()) {
        throw new Error(nativePurchase?`${googlePurchase?"Google Play":"Apple"}-köpet genomfördes men backend har ännu inte verifierat Premium.`:"Provperioden kunde inte aktiveras. Kontrollera att den senaste Supabase-migrationen är körd.");
      }

      renderPremiumInfo();
      setMessage("premiumState",nativePurchase?(entitlement?.is_trial?`${googlePurchase?"Google Plays":"Apples"} provperiod är verifierad och Premium är aktivt.`:`${googlePurchase?"Google Play":"Apple"}-prenumerationen är verifierad och Premium är aktivt.`):"Testprovperioden är aktiv i tre dagar. Ingen debitering sker i webbversionen.");
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
    return withBusy("restorePurchases",async()=>{
      setMessage("premiumState","Synkar köp med Apple …");
      try{entitlement=await entitlementProvider().restorePurchases();await loadProfile();renderPremiumInfo();setMessage("premiumState",hasPremiumAccess()?"Köpet är återställt och verifierat.":"Apple hittade ingen aktiv Premiumprenumeration.",!hasPremiumAccess());window.dispatchEvent(new CustomEvent("vk:access-changed",{detail:getAccessState()}))}
      catch(error){setMessage("premiumState",error.message||"Köpet kunde inte återställas.",true)}
    })
  }
  async function syncAppleEntitlement(force=false){
    if(cfg.subscriptionMode!=="apple_native"||!session?.user)return null;
    if(!force&&Date.now()-lastAppleSyncAt<300000)return null;
    if(appleSyncPromise)return appleSyncPromise;
    appleSyncPromise=(async()=>{
      try{const synced=await subscriptionProvider.syncPurchases();lastAppleSyncAt=Date.now();if(synced){entitlement=synced;await loadProfile()}return synced}
      catch(error){if(cfg.debug)console.warn("Apple-synk misslyckades",error?.message||error);return null}
      finally{appleSyncPromise=null}
    })();
    return appleSyncPromise;
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
    $("manageBeforeDelete")?.classList.toggle("hidden",!["apple","google"].includes(entitlement?.provider));
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
      const native=window.VK_NATIVE?.isNativePlatform?.();
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: appRedirectUrl(),skipBrowserRedirect:Boolean(native) }
      });
      if (error) setMessage("authMessage", authErrorMessage(error, "oauth"), true);
      else if(native&&data?.url)await window.VK_NATIVE.openAuth(data.url);
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

  async function deleteAccount() {
    if(!client||!session?.user)return;
    const provider=entitlement?.provider||"manual_test",storeProvider=["apple","google"].includes(provider);
    const periodEnd=entitlement?.current_period_ends_at||entitlement?.trial_ends_at;
    const warning=storeProvider
      ? `Kontot och personliga appdata tas bort. Din ${provider==="apple"?"Apple":"Google Play"}-prenumeration avslutas inte automatiskt och måste hanteras i butiken${periodEnd?` före ${new Date(periodEnd).toLocaleDateString("sv-SE")}`:""}. Fortsätta?`
      : "Kontot, profilen och personliga appdata tas bort permanent. Åtgärden kan inte ångras. Fortsätta?";
    if(!window.confirm(warning))return;
    if(window.prompt("Skriv RADERA för att bekräfta permanent kontoborttagning.")!=="RADERA")return setMessage("profileNotice","Kontot raderades inte.",true);
    const button=$("deleteAccount");if(button)button.disabled=true;
    setMessage("profileNotice","Raderar konto …");
    try{
      const {error}=await client.rpc("delete_own_account",{confirmation_text:"RADERA"});
      if(error)throw error;
      await client.auth.signOut({scope:"local"});
      await window.VK_NATIVE?.clearLocalData?.();
      $("profileDialog").close();
      setMessage("authMessage","Kontot och personliga appdata är raderade.");
      $("authDialog").showModal();
    }catch(error){setMessage("profileNotice",/recent|nyligen/i.test(error?.message||"")?"Logga ut och in igen innan du raderar kontot.":"Kontot kunde inte raderas. Försök igen eller kontakta support.",true)}
    finally{if(button)button.disabled=false}
  }

  function bind() {
    $("accountBtn")?.addEventListener("click", openAccount);
    $("authForm")?.addEventListener("submit", signInWithPassword);
    $("emailSignup")?.addEventListener("click", signUp);
    $("appleLogin")?.addEventListener("click", () => oauth("apple"));
    $("googleLogin")?.addEventListener("click", () => oauth("google"));
    $("resetPassword")?.addEventListener("click", resetPassword);
    $("signOut")?.addEventListener("click", signOut);
    $("deleteAccount")?.addEventListener("click", deleteAccount);
    $("manageBeforeDelete")?.addEventListener("click", manageSubscription);
    $("saveProfileName")?.addEventListener("click", saveDisplayName);
    $("upgradePremium")?.addEventListener("click", () => openPremiumInfo());
    $("premiumPurchase")?.addEventListener("click", startPremiumTrial);
    $("premiumCancel")?.addEventListener("click", manageSubscription);
    $("restorePurchases")?.addEventListener("click", restorePurchases);
    window.addEventListener("vk:native-app-state",event=>{if(event.detail?.isActive)syncAppleEntitlement().catch(()=>{})});
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
    await syncAppleEntitlement(true);
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

  window.addEventListener("vk:native-url-open",event=>handleNativeAuthUrl(event.detail?.url).catch(error=>{
    setMessage("authMessage",authErrorMessage(error,"login"),true);$("authDialog")?.showModal();
  }));

  window.VK_AUTH = Object.freeze({
    getAccessState,
    hasPremiumAccess,
    canAccess,
    requirePremium,
    openPremiumInfo,
    saveSettings,
    client,
    manageSubscription,
    premium: Object.freeze({ features: PREMIUM_FEATURES })
  });
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
