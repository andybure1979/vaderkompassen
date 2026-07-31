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
  let pendingVerificationNotice = false;
  let cloudSettingsRequested = false;

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
    if (!p) return "free";
    if (["admin", "vip", "premium"].includes(p.role)) return p.role;
    if (p.trial_ends_at && new Date(p.trial_ends_at).getTime() > Date.now()) return "trial";
    return "free";
  }

  function hasPremiumAccess(p = profile) {
    return ["trial", "premium", "vip", "admin"].includes(effectiveRole(p));
  }

  async function loadProfile() {
    if (!client || !session?.user) {
      profile = null;
      renderAccount();
      return null;
    }
    const { data, error } = await client.from("profiles").select("*").eq("id", session.user.id).single();
    if (error) {
      console.warn("Kunde inte läsa profil", error.message);
      profile = null;
    } else {
      profile = data;
    }
    renderAccount();
    window.dispatchEvent(new CustomEvent("vk:access-changed", { detail: getAccessState() }));
    return profile;
  }

  function getAccessState() {
    const role = effectiveRole(profile);
    return {
      configured,
      signedIn: Boolean(session?.user),
      user: session?.user || null,
      profile,
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

    const trialDays = daysLeft(profile?.trial_ends_at);
    $("profileTrial").textContent = trialDays
      ? `${trialDays} dag${trialDays === 1 ? "" : "ar"} kvar`
      : profile?.trial_ends_at ? "Avslutad" : "Ingen provperiod aktiverad";
    $("profileSubscription").textContent = profile?.subscription_status === "active"
      ? "Premium är aktivt"
      : "Du använder gratisversionen";
    $("profileAccessText").textContent = role === "trial"
      ? `Full Premium i ${trialDays} dag${trialDays === 1 ? "" : "ar"}`
      : hasPremiumAccess() ? "Full tillgång utan reklam" : "Grundläggande tillgång";
    $("upgradePremium").classList.toggle("hidden", hasPremiumAccess());
    $("openAdmin").classList.toggle("hidden", role !== "admin");
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
    if (!session?.user || cloudSettingsRequested) return;
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
    setMessage("authMessage", "Loggar in …");
    const { error } = await client.auth.signInWithPassword({
      email: $("authEmail").value.trim(),
      password: $("authPassword").value
    });
    if (error) return setMessage("authMessage", error.message, true);
    setMessage("authMessage");
    $("authDialog").close();
  }

  async function signUp() {
    setMessage("authMessage", "Skapar konto …");
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    if (!email || password.length < 6) return setMessage("authMessage", "Ange en giltig e-postadress och minst 6 tecken.", true);
    const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: appRedirectUrl() } });
    if (error) return setMessage("authMessage", error.message, true);
    setMessage("authMessage", "Kontot är skapat. Kontrollera din e-post för verifieringslänken.");
  }

  async function oauth(provider) {
    if (!client) return;
    setMessage("authMessage", `Öppnar ${provider === "apple" ? "Apple" : "Google"} …`);
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: appRedirectUrl() }
    });
    if (error) setMessage("authMessage", error.message, true);
  }

  async function resetPassword() {
    const email = $("authEmail").value.trim();
    if (!email) return setMessage("authMessage", "Ange din e-postadress först.", true);
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: appRedirectUrl() });
    setMessage("authMessage", error ? error.message : "Återställningslänk skickad.", Boolean(error));
  }

  async function signOut() {
    await client?.auth.signOut();
    $("profileDialog").close();
  }

  function renderAdminRows(rows) {
    const wrap = $("adminResults");
    wrap.innerHTML = "";
    if (!rows?.length) {
      wrap.innerHTML = '<p class="empty-state">Inga användare hittades.</p>';
      return;
    }
    rows.forEach(user => {
      const card = document.createElement("article");
      card.className = "admin-user-card";
      card.innerHTML = `<div><strong>${escapeHtml(user.email || "Okänd e-post")}</strong><small>${escapeHtml(user.display_name || "Inget namn")}</small></div><select aria-label="Åtkomst för ${escapeHtml(user.email || "användare")}">${["free","trial","premium","vip","admin"].map(r => `<option value="${r}"${r === user.role ? " selected" : ""}>${ROLE_LABELS[r][0]}</option>`).join("")}</select><button type="button" class="secondary">Spara</button>`;
      card.querySelector("button").onclick = async () => {
        const role = card.querySelector("select").value;
        setMessage("adminMessage", "Sparar …");
        const { error } = await client.rpc("admin_set_user_role", { target_user_id: user.id, new_role: role });
        setMessage("adminMessage", error ? error.message : "Åtkomsten är uppdaterad.", Boolean(error));
      };
      wrap.appendChild(card);
    });
  }

  async function searchAdmin() {
    setMessage("adminMessage", "Söker …");
    const { data, error } = await client.rpc("admin_search_users", { search_text: $("adminSearch").value.trim() });
    if (error) return setMessage("adminMessage", error.message, true);
    setMessage("adminMessage");
    renderAdminRows(data);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]);
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
    $("upgradePremium")?.addEventListener("click", () => {
      closeDialog("profileDialog");
      $("premiumInfoDialog")?.showModal();
    });
    $("openAdmin")?.addEventListener("click", () => { $("profileDialog").close(); $("adminDialog").showModal(); });
    $("adminSearchBtn")?.addEventListener("click", searchAdmin);
    $("adminSearch")?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); searchAdmin(); } });
    bindDialogDismiss("authDialog", "authClose");
    bindDialogDismiss("profileDialog", "profileClose");
    bindDialogDismiss("premiumInfoDialog", "premiumInfoClose");
    bindDialogDismiss("adminDialog", "adminClose");
  }

  async function init() {
    const callback = callbackState();
    pendingVerificationNotice = callback.isCallback;
    bind();
    if (!client) {
      renderAccount();
      return;
    }
    const { data } = await client.auth.getSession();
    session = data.session;
    await loadProfile();
    dispatchCloudSettings();

    if (callback.error) {
      setMessage("authMessage", callback.error.replace(/\+/g, " "), true);
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

  window.VK_AUTH = Object.freeze({ getAccessState, hasPremiumAccess, saveSettings, client });
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
