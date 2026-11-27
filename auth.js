/* NovaSchool — accounts & sessions (Supabase Auth: Google OAuth + email/password, JWT sessions).
   Active on the hosted site (GitHub Pages / Vercel). Inside Claude the app uses Claude's own storage instead. */
(function () {
  const NS = window.NS, cfg = NS.CONFIG || {};
  const A = NS.auth = { enabled: false, client: null, session: null, user: null, profile: null, error: null, recovery: false, ready: Promise.resolve(), _l: new Set() };
  const inClaude = !!(window.claude && window.claude.use);
  if (!cfg.supabaseUrl || !cfg.supabaseKey || inClaude || !window.supabase || !window.supabase.createClient) return;

  A.enabled = true;
  A.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "ns-auth" }
  });
  const sb = A.client;
  const base = () => location.origin + location.pathname;
  A.onChange = fn => { A._l.add(fn); return () => A._l.delete(fn); };
  const emit = ev => A._l.forEach(fn => { try { fn(ev); } catch (e) { console.error(e); } });

  // OAuth / email-link errors come back in the query string
  const qs = new URLSearchParams(location.search);
  A.urlError = qs.get("error_description") || qs.get("error") || null;
  function cleanUrl() {
    const u = new URL(location.href); let changed = false;
    ["code", "error", "error_code", "error_description", "type"].forEach(k => { if (u.searchParams.has(k)) { u.searchParams.delete(k); changed = true; } });
    if (changed) history.replaceState(null, "", u.pathname + (u.search || "") + (location.hash || ""));
  }

  async function loadProfile() {
    const u = A.user; if (!u) { A.profile = null; return; }
    let { data, error } = await sb.from("ns_profiles").select("*").eq("id", u.id).maybeSingle();
    if (!data && !error) {
      const m = u.user_metadata || {};
      const ins = {
        id: u.id,
        full_name: String(m.full_name || m.name || (u.email || "").split("@")[0] || "").slice(0, 120),
        avatar_url: m.avatar_url || m.picture || null,
        role: ["student", "parent"].includes(m.ns_role) ? m.ns_role : "student",
        board: ["cbse", "icse", "ib", "cambridge"].includes(m.board) ? m.board : null,
        cls: +m.cls >= 5 && +m.cls <= 12 ? +m.cls : null,
        stream: ["PCM", "PCB", "PCMB"].includes(m.stream) ? m.stream : null,
        lang: ["English", "Hindi", "Hinglish"].includes(m.lang) ? m.lang : "English",
        provider: (u.app_metadata && u.app_metadata.provider) || "email"
      };
      ({ data, error } = await sb.from("ns_profiles").insert(ins).select().single());
      if (data) A.isNew = true;
    }
    A.profile = data || null; A.error = error || null;
    if (data) sb.from("ns_profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", u.id).then(() => { });
  }

  async function setSession(s, ev) {
    const prev = A.user && A.user.id;
    A.session = s || null; A.user = (s && s.user) || null;
    if (A.user && (A.user.id !== prev || !A.profile || ev === "USER_UPDATED")) await loadProfile();
    if (!A.user) A.profile = null;
    emit(ev || "INITIAL");
  }

  A.ready = (async () => {
    try { const { data } = await sb.auth.getSession(); await setSession(data.session, "INITIAL"); }
    catch (e) { A.error = e; }
    cleanUrl();
    sb.auth.onAuthStateChange((ev, s) => {
      if (ev === "PASSWORD_RECOVERY") A.recovery = true;
      if (ev === "TOKEN_REFRESHED") { A.session = s; emit(ev); return; }
      setTimeout(() => setSession(s, ev), 0);
    });
  })();

  const friendly = e => {
    const m = (e && (e.message || e.error_description)) || String(e || "Something went wrong");
    if (/provider is not enabled|Unsupported provider/i.test(m)) return "Google sign-in isn't switched on for this site yet. Use email for now — the site owner can enable Google in Supabase.";
    if (/Invalid login credentials/i.test(m)) return "That email and password don't match. Try again or reset your password.";
    if (/Email not confirmed/i.test(m)) return "Please confirm your email first — check your inbox for the link.";
    if (/User already registered/i.test(m)) return "An account with this email already exists. Sign in instead.";
    if (/rate limit|too many/i.test(m)) return "Too many attempts. Please wait a minute and try again.";
    if (/Password should be/i.test(m)) return "Password must be at least 8 characters.";
    if (/redirect/i.test(m) && /not allowed|invalid/i.test(m)) return "This site's address isn't on the sign-in allow-list yet. The site owner needs to add it in Supabase → Authentication → URL Configuration.";
    return m;
  };
  A.friendly = friendly;

  A.signInGoogle = async (next) => {
    try { sessionStorage.setItem("ns_after_login", next || "portal"); } catch { }
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: base(), queryParams: { prompt: "select_account" } } });
    if (error) throw new Error(friendly(error));
  };
  A.signIn = async (email, password) => {
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(friendly(error));
  };
  A.signUp = async ({ email, password, full_name, role, board, cls, stream, lang }) => {
    const { data, error } = await sb.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: base(), data: { full_name, ns_role: role, board, cls, stream, lang } } });
    if (error) throw new Error(friendly(error));
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error("An account with this email already exists. Sign in instead.");
    return { needsConfirm: !data.session };
  };
  A.resend = async email => { const { error } = await sb.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: base() } }); if (error) throw new Error(friendly(error)); };
  A.resetPassword = async email => { const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: base() }); if (error) throw new Error(friendly(error)); };
  A.updatePassword = async password => { const { error } = await sb.auth.updateUser({ password }); if (error) throw new Error(friendly(error)); A.recovery = false; };
  A.signOut = async (scope = "local") => { await sb.auth.signOut({ scope }); A.session = null; A.user = null; A.profile = null; emit("SIGNED_OUT"); };
  A.refresh = async () => { const { data, error } = await sb.auth.refreshSession(); if (error) throw new Error(friendly(error)); A.session = data.session; emit("TOKEN_REFRESHED"); };

  A.updateProfile = async patch => {
    const { data, error } = await sb.from("ns_profiles").update(patch).eq("id", A.user.id).select().single();
    if (error) throw new Error(friendly(error));
    A.profile = data; emit("PROFILE"); return data;
  };
  A.loadState = async () => { const { data } = await sb.from("ns_state").select("state, updated_at").eq("user_id", A.user.id).maybeSingle(); return data; };
  let saving = Promise.resolve();
  A.saveState = state => { if (!A.user) return saving; const row = { user_id: A.user.id, state, updated_at: new Date().toISOString() }; saving = saving.then(() => sb.from("ns_state").upsert(row)).catch(() => { }); return saving; };

  /* decoded JWT claims of the current session (for the Security page) */
  A.jwt = () => {
    const t = A.session && A.session.access_token; if (!t) return null;
    try {
      const dec = p => JSON.parse(decodeURIComponent(escape(atob(p.replace(/-/g, "+").replace(/_/g, "/")))));
      const [h, p] = t.split("."); return { header: dec(h), claims: dec(p) };
    } catch { return null; }
  };
  A.afterLogin = () => { let n = "portal"; try { n = sessionStorage.getItem("ns_after_login") || "portal"; sessionStorage.removeItem("ns_after_login"); } catch { } return n; };
})();
