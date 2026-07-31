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

  const ROLE_LABELS = {
    free: ["FREE", "Gratis"],
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
    $("profileName").textContent = profile?.display_name || "Ditt konto";
    $("profileBadge").textContent = labels[0];
    $("profileBadge").dataset.role = role;
    $("profileAccessTitle").textContent = labels[1];

    const trialDays = daysLeft(profile?.trial_ends_at);
    $("profileTrial").textContent = trialDays ? `${trialDays} dag${trialDays === 1 ? "" : "ar"} kvar` : "Avslutad";
    $("profileSubscription").textContent = profile?.subscription_status === "active" ? "Aktivt" : "Inget aktivt abonnemang";
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

  async function signInWithPassword(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
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
    const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
    if (error) return setMessage("authMessage", error.message, true);
    setMessage("authMessage", "Kontot är skapat. Kontrollera din e-post för verifieringslänken.");
  }

  async function oauth(provider) {
    if (!client) return;
    setMessage("authMessage", `Öppnar ${provider === "apple" ? "Apple" : "Google"} …`);
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: location.origin + location.pathname }
    });
    if (error) setMessage("authMessage", error.message, true);
  }

  async function resetPassword() {
    const email = $("authEmail").value.trim();
    if (!email) return setMessage("authMessage", "Ange din e-postadress först.", true);
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
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
    $("upgradePremium")?.addEventListener("click", () => alert("Betalning aktiveras i v14.1. Ditt konto är redan förberett."));
    $("openAdmin")?.addEventListener("click", () => { $("profileDialog").close(); $("adminDialog").showModal(); });
    $("adminSearchBtn")?.addEventListener("click", searchAdmin);
    $("adminSearch")?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); searchAdmin(); } });
  }

  async function init() {
    bind();
    if (!client) {
      renderAccount();
      return;
    }
    const { data } = await client.auth.getSession();
    session = data.session;
    await loadProfile();
    client.auth.onAuthStateChange(async (_event, nextSession) => {
      session = nextSession;
      await loadProfile();
    });
  }

  window.VK_AUTH = Object.freeze({ getAccessState, hasPremiumAccess, client });
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
