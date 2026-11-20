/* AeroNotes — shared UI + page rendering */
(function () {
  const ICONS = {
    logo: '<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path d="M3 23 45 6 31 42 23 28 3 23Zm20 5 4-1 14-17-18 18Z"/><path d="M23 28 21 37l5-6" opacity=".7"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    Aviation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M21 3 3 10l7 3 3 7 8-17Z"/><path d="m10 13 4-4"/></svg>',
    Space: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c3-1 6-1 6-1s0 3-1 6l-7 7-4-4 6-8Z"/><path d="M8 12H5l-2 3 4 1M12 16v3l-3 2-1-4"/><circle cx="15" cy="9" r="1.5"/><path d="M5 19c0-1 1-2 2-2"/></svg>',
    Propulsion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
    Aerodynamics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 8h12a3 3 0 1 0-3-3M3 12h17M3 16h11a3 3 0 1 1-3 3"/></svg>',
    Sustainability: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 14 10"/></svg>',
    Technology: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>'
  };

  /* ---------- Author auth (GitHub token kept only in this browser) ---------- */
  const AUTH_KEY = "aeronotes_author_token";
  const auth = {
    get() { try { return localStorage.getItem(AUTH_KEY) || ""; } catch { return ""; } },
    set(t) { try { localStorage.setItem(AUTH_KEY, t); } catch {} },
    clear() { try { localStorage.removeItem(AUTH_KEY); } catch {} },
    get on() { return !!this.get(); }
  };
  async function gh(path, opts = {}) {
    const res = await fetch("https://api.github.com" + path, {
      ...opts,
      headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + auth.get(), ...(opts.headers || {}) }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const m = data.message || "GitHub error " + res.status;
      if (/not accessible by personal access token/i.test(m))
        throw new Error("Anahtarın aeronotes deposuna yazma izni yok. GitHub'da anahtarı düzenle: Repository access → aeronotes seçili olsun, Contents → Read and write.");
      throw new Error(m);
    }
    return data;
  }
  const b64decode = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  const b64encodeText = (s) => { let bin = ""; new TextEncoder().encode(s).forEach((b) => (bin += String.fromCharCode(b))); return btoa(bin); };
  const fileToB64 = (file) => new Promise((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = fail; r.readAsDataURL(file); });

  /* Password vault: the GitHub key is encrypted (PBKDF2 + AES-GCM) with the author's password
     and published as auth.json. Only someone who knows the password can unlock it. */
  const VAULT_ITER = 600000;
  const bytesToB64 = (u8) => { let s = ""; u8.forEach((b) => (s += String.fromCharCode(b))); return btoa(s); };
  const b64ToBytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function vaultKey(pw, salt, iter) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function vaultSeal(token, pw) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await vaultKey(pw, salt, VAULT_ITER), new TextEncoder().encode(token));
    return { v: 1, kdf: "PBKDF2-SHA256", iter: VAULT_ITER, salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(new Uint8Array(ct)) };
  }
  async function vaultOpen(vault, pw) {
    const key = await vaultKey(pw, b64ToBytes(vault.salt), vault.iter);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(vault.iv) }, key, b64ToBytes(vault.data));
    return new TextDecoder().decode(pt);
  }

  const sorted = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /* Tiny Markdown → HTML (headings, lists, quotes, bold, italic, code, links, images) */
  function md(src) {
    const inline = (t) =>
      esc(t)
        .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return String(src || "")
      .trim()
      .split(/\n\s*\n/)
      .map((block) => {
        const lines = block.trim().split("\n");
        if (/^###\s/.test(block)) return "<h3>" + inline(block.replace(/^###\s/, "")) + "</h3>";
        if (/^##\s/.test(block)) return "<h2>" + inline(block.replace(/^##\s/, "")) + "</h2>";
        if (lines.every((l) => /^\s*[-*]\s/.test(l)))
          return "<ul>" + lines.map((l) => "<li>" + inline(l.replace(/^\s*[-*]\s/, "")) + "</li>").join("") + "</ul>";
        if (lines.every((l) => /^\s*\d+\.\s/.test(l)))
          return "<ol>" + lines.map((l) => "<li>" + inline(l.replace(/^\s*\d+\.\s/, "")) + "</li>").join("") + "</ol>";
        if (lines.every((l) => /^>\s?/.test(l)))
          return "<blockquote><p>" + lines.map((l) => inline(l.replace(/^>\s?/, ""))).join("<br>") + "</p></blockquote>";
        return "<p>" + lines.map(inline).join(" ") + "</p>";
      })
      .join("\n");
  }

  function meta(p, avatar) {
    return `<div class="meta">
      <span class="author">${avatar ? `<span class="avatar">${initials(SITE.author)}</span>` : ICONS.user}${esc(SITE.author)}</span>
      <span class="dot">·</span><span>${formatDate(p.date)}</span>
      <span class="dot">·</span><span>${p.readTime} min read</span></div>`;
  }

  function card(p, withExcerpt) {
    return `<a class="card" href="post.html?id=${encodeURIComponent(p.id)}">
      <div class="card-media"><img src="${esc(p.cover)}" alt="" loading="lazy"><span class="chip">${esc(p.category)}</span></div>
      <div class="card-body"><h3>${esc(p.title)}</h3>${withExcerpt ? `<p class="excerpt">${esc(p.excerpt)}</p>` : ""}${meta(p)}</div></a>`;
  }

  /* ---------- Header / footer / search ---------- */
  function header(active) {
    const link = (href, label, key) => `<a href="${href}" class="${active === key ? "active" : ""}">${label}</a>`;
    return `<div class="container nav">
      <a class="brand" href="index.html">${ICONS.logo}<span>${esc(SITE.name)}</span></a>
      <span class="tagline">${esc(SITE.tagline)}</span>
      <nav class="nav-links" id="navLinks">${link("index.html", "Home", "home")}${link("articles.html", "Articles", "articles")}${link("about.html", "About", "about")}</nav>
      <div class="nav-tools">
        <button class="icon-btn" id="searchBtn" aria-label="Search">${ICONS.search}</button>
        ${auth.on ? `<a class="btn" href="write.html">${ICONS.pen}<span class="label">Write</span></a>
        <button class="icon-btn" id="logoutBtn" aria-label="Log out" title="Çıkış yap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg></button>` : ""}
        <button class="icon-btn menu-toggle" id="menuBtn" aria-label="Menu">${ICONS.menu}</button>
      </div></div>`;
  }

  function footer() {
    return `<div class="container"><span>© ${new Date().getFullYear()} ${esc(SITE.name)} · Written by ${esc(SITE.author)}</span>
      <span>${esc(SITE.tagline)}${auth.on ? "" : ' · <a href="login.html">Author login</a>'}</span></div>`;
  }

  function setupSearch() {
    const overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.innerHTML = `<div class="search-box" role="dialog" aria-label="Search articles">
      <input type="search" placeholder="Search articles…" aria-label="Search"><div class="search-results"></div></div>`;
    document.body.appendChild(overlay);
    const input = $("input", overlay), results = $(".search-results", overlay);
    const run = () => {
      const q = input.value.trim().toLowerCase();
      const hits = sorted.filter((p) => !q || (p.title + " " + p.excerpt + " " + p.category + " " + p.content).toLowerCase().includes(q));
      results.innerHTML = hits.length
        ? hits.map((p) => `<a href="post.html?id=${encodeURIComponent(p.id)}"><b>${esc(p.title)}</b><span>${esc(p.category)} · ${formatDate(p.date)}</span></a>`).join("")
        : '<div class="none">No articles found.</div>';
    };
    const open = () => { overlay.classList.add("open"); input.value = ""; run(); setTimeout(() => input.focus(), 10); };
    const close = () => overlay.classList.remove("open");
    $("#searchBtn").addEventListener("click", open);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    input.addEventListener("input", run);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName))) { e.preventDefault(); open(); }
    });
  }

  /* ---------- Pages ---------- */
  const pages = {
    home() {
      const featured = sorted.find((p) => p.featured) || sorted[0];
      $("#hero").innerHTML = `<a class="hero" href="post.html?id=${encodeURIComponent(featured.id)}">
        <img src="${esc(featured.cover)}" alt="">
        <div class="hero-body"><span class="chip">${esc(featured.tag || featured.category)}</span>
        <h1>${esc(featured.title)}</h1><p>${esc(featured.excerpt)}</p>${meta(featured, true)}</div></a>`;
      $("#categories").innerHTML = CATEGORIES.map((c) => {
        const n = POSTS.filter((p) => p.category === c).length;
        return `<li><a href="articles.html?category=${encodeURIComponent(c)}">${ICONS[c] || ""}<span>${esc(c)}</span><span class="count">${n || ""}</span></a></li>`;
      }).join("");
      $("#latest").innerHTML = sorted.filter((p) => p !== featured).slice(0, 3).map((p) => card(p)).join("");
    },

    articles() {
      const params = new URLSearchParams(location.search);
      let current = params.get("category") || "All";
      const filters = $("#filters"), grid = $("#grid");
      const draw = () => {
        filters.innerHTML = ["All", ...CATEGORIES].map((c) => `<button class="filter ${c === current ? "active" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
        const list = sorted.filter((p) => current === "All" || p.category === current);
        grid.innerHTML = list.length ? list.map((p) => card(p, true)).join("") : '<div class="empty">No articles in this category yet — coming soon.</div>';
      };
      filters.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        current = b.dataset.c;
        history.replaceState(null, "", current === "All" ? "articles.html" : "articles.html?category=" + encodeURIComponent(current));
        draw();
      });
      draw();
    },

    post() {
      const id = new URLSearchParams(location.search).get("id");
      const i = sorted.findIndex((p) => p.id === id);
      const p = sorted[i];
      if (!p) { $("#post").innerHTML = '<div class="container page-head"><h1>Article not found</h1><p><a class="link-arrow" href="articles.html">Browse all articles ' + ICONS.arrow + "</a></p></div>"; return; }
      document.title = p.title + " · " + SITE.name;
      const newer = sorted[i - 1], older = sorted[i + 1];
      $("#post").innerHTML = `<div class="post-hero"><img src="${esc(p.cover)}" alt=""></div>
        <article><header class="post-head"><a class="chip" href="articles.html?category=${encodeURIComponent(p.category)}">${esc(p.category)}</a>
        <h1>${esc(p.title)}</h1><p class="lead">${esc(p.excerpt)}</p>${meta(p, true)}</header>
        <div class="prose">${md(p.content)}</div></article>
        <nav class="post-nav">${older ? `<a class="link-arrow" href="post.html?id=${encodeURIComponent(older.id)}">${ICONS.arrowLeft} Older</a>` : "<span></span>"}
        ${newer ? `<a class="link-arrow" href="post.html?id=${encodeURIComponent(newer.id)}">Newer ${ICONS.arrow}</a>` : "<span></span>"}</nav>`;
    },

    about() {
      $("#aboutAvatar").textContent = initials(SITE.author);
      $("#statPosts").textContent = POSTS.length;
      $("#statCats").textContent = new Set(POSTS.map((p) => p.category)).size;
      $("#statWords").textContent = Math.round(POSTS.reduce((s, p) => s + p.content.split(/\s+/).length, 0) / 100) / 10 + "k";
    },

    async login() {
      const setupMode = new URLSearchParams(location.search).has("setup");
      if (auth.on && !setupMode) { location.replace("write.html"); return; }
      const say = (el, text, kind) => { el.textContent = text; el.className = "hint" + (kind ? " " + kind : ""); };

      // Is a password already set? (encrypted key published as auth.json)
      let vault = null;
      try { const r = await fetch("auth.json?t=" + Date.now(), { cache: "no-store" }); if (r.ok) vault = await r.json(); } catch {}

      const showSetup = () => {
        $("#pwSection").hidden = true; $("#setupSection").hidden = false;
        if (vault) { $("#setupTitle").textContent = auth.on ? "Parolayı değiştir" : "Parolayı sıfırla"; $("#backToPw").hidden = false; }
        if (auth.on) $("#tokenField").hidden = true; // already logged in: reuse current key
      };
      if (!vault || setupMode) showSetup(); else { $("#pwSection").hidden = false; $("#password").focus(); }
      $("#toSetup").addEventListener("click", (e) => { e.preventDefault(); showSetup(); });

      async function checkToken(token) {
        auth.set(token);
        try {
          const repo = await gh("/repos/" + SITE.repo);
          if (!repo.permissions || !repo.permissions.push) throw new Error("Bu anahtarın siteye yazma izni yok (Contents: Read and write olmalı).");
        } catch (err) {
          auth.clear();
          if (/bad credentials/i.test(err.message)) throw new Error("Anahtar geçersiz ya da süresi dolmuş.");
          if (/not found/i.test(err.message)) throw new Error("Anahtar aeronotes deposunu göremiyor (Repository access ayarını kontrol et).");
          throw err;
        }
      }

      // Normal login with password
      $("#pwForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = $("#pwMsg"), btn = e.submitter;
        btn.disabled = true; say(msg, "Kontrol ediliyor…");
        try {
          let token;
          try { token = await vaultOpen(vault, $("#password").value); }
          catch { await new Promise((r) => setTimeout(r, 800)); throw new Error("Parola yanlış."); }
          try { await checkToken(token); }
          catch (err) { throw new Error(err.message + " \"Parolamı unuttum\" adımlarıyla yeni anahtar oluştur."); }
          location.replace("write.html");
        } catch (err) { say(msg, err.message, "error"); }
        finally { btn.disabled = false; }
      });

      // First setup / reset / change password
      $("#setupForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target, msg = $("#setupMsg"), btn = e.submitter;
        const token = auth.on && $("#tokenField").hidden ? auth.get() : f.token.value.trim();
        const pw = f.newPw.value;
        if (!token) return say(msg, "GitHub anahtarını yapıştır.", "error");
        if (!/^(github_pat_|ghp_)/.test(token)) return say(msg, "Bu bir GitHub anahtarı gibi görünmüyor (github_pat_ ile başlamalı).", "error");
        if (pw.length < 12 || !/[a-zçğıöşü]/.test(pw) || !/[A-ZÇĞİÖŞÜ]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(pw))
          return say(msg, "Parola zayıf: en az 12 karakter, büyük harf, küçük harf, rakam ve sembol olmalı.", "error");
        if (pw !== f.newPw2.value) return say(msg, "Parolalar aynı değil.", "error");
        btn.disabled = true; say(msg, "Kaydediliyor…");
        try {
          await checkToken(token);
          const sealed = await vaultSeal(token, pw);
          let sha;
          try { sha = (await gh(`/repos/${SITE.repo}/contents/auth.json`)).sha; } catch {}
          await gh(`/repos/${SITE.repo}/contents/auth.json`, { method: "PUT", body: JSON.stringify({ message: "Update author password", content: b64encodeText(JSON.stringify(sealed, null, 2) + "\n"), ...(sha ? { sha } : {}) }) });
          say(msg, "✓ Parola kaydedildi! Yönlendiriliyorsun…", "ok");
          setTimeout(() => location.replace("write.html"), 1200);
        } catch (err) { say(msg, "Kaydedilemedi: " + err.message, "error"); }
        finally { btn.disabled = false; }
      });
    },

    write() {
      if (!auth.on) { location.replace("login.html"); return; }
      const f = $("#writeForm"), msg = $("#publishMsg");
      const COVERS = [["assets/wing.webp", "Kanat"], ["assets/rocket.svg", "Roket"], ["assets/engine.webp", "Motor"], ["assets/satellite.webp", "Uydu"], ["assets/airfoil.svg", "Kanat profili"]];
      const slug = (s) => s.toLowerCase().replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const say = (text, kind) => { msg.className = "hint ed-msg" + (kind ? " " + kind : ""); msg.innerHTML = text; };
      let uploadFile = null, uploadURL = "";

      // category chips + cover thumbnails
      $("#cats").innerHTML = CATEGORIES.map((c, i) => `<label><input type="radio" name="category" value="${esc(c)}" ${i ? "" : "checked"}><span>${esc(c)}</span></label>`).join("");
      $("#covers").innerHTML = COVERS.map(([src, name], i) => `<label title="${name}"><input type="radio" name="cover" value="${src}" ${i ? "" : "checked"}><span class="thumb"><img src="${src}" alt="${name}"></span></label>`).join("") +
        `<label title="Kendi fotoğrafın"><input type="radio" name="cover" value="__upload"><span class="thumb upload" id="uploadThumb"><span><b>+</b>Fotoğraf yükle</span></span></label>
         <input type="file" id="coverFile" accept="image/*" hidden>`;
      const fileInput = $("#coverFile");
      $("#uploadThumb").parentElement.addEventListener("click", (e) => { e.preventDefault(); fileInput.click(); });
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0]; if (!file) return;
        if (file.size > 5 * 1024 * 1024) { say("Fotoğraf çok büyük (en fazla 5 MB).", "error"); return; }
        uploadFile = file; if (uploadURL) URL.revokeObjectURL(uploadURL); uploadURL = URL.createObjectURL(file);
        $("#uploadThumb").innerHTML = `<img src="${uploadURL}" alt="">`;
        f.querySelector('input[name=cover][value="__upload"]').checked = true;
      });

      const now = new Date();
      f.date.value = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

      // formatting toolbar
      const ta = f.content;
      const fire = () => ta.dispatchEvent(new Event("input", { bubbles: true }));
      const wrap = (before, after, ph) => {
        const a = ta.selectionStart, b = ta.selectionEnd, sel = ta.value.slice(a, b) || ph;
        ta.setRangeText(before + sel + after, a, b, "select");
        ta.setSelectionRange(a + before.length, a + before.length + sel.length); ta.focus(); fire();
      };
      const linePrefix = (prefix, ph) => {
        const a = ta.selectionStart, b = ta.selectionEnd, sel = ta.value.slice(a, b) || ph;
        const lead = a > 0 && ta.value[a - 1] !== "\n" ? "\n\n" : "";
        ta.setRangeText(lead + sel.split("\n").map((l) => prefix + l).join("\n") + "\n\n", a, b, "end"); ta.focus(); fire();
      };
      $("#toolbar").addEventListener("click", (e) => {
        const btn = e.target.closest("button"); if (!btn) return;
        const k = btn.dataset.md;
        if (k === "b") wrap("**", "**", "kalın yazı");
        if (k === "i") wrap("*", "*", "italik yazı");
        if (k === "h") linePrefix("## ", "Ara başlık");
        if (k === "ul") linePrefix("- ", "Liste maddesi");
        if (k === "q") linePrefix("> ", "Alıntı");
        if (k === "a") { const url = prompt("Link adresi (https://…)"); if (url) wrap("[", "](" + url.trim() + ")", "link yazısı"); }
      });

      const plain = (t) => t.replace(/\]\([^)]*\)/g, "]").replace(/[#>*`\[\]_]/g, "").replace(/^\s*-\s/gm, "").replace(/\s+/g, " ").trim();
      const autoExcerpt = () => { const p = plain(ta.value); return p.length > 160 ? p.slice(0, 157).replace(/\s\S*$/, "") + "…" : p; };
      const uniqueId = (base) => { base = base || "yazi"; let id = base, n = 2; while (POSTS.some((p) => p.id === id)) id = base + "-" + n++; return id; };

      function buildPost(coverPath) {
        const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
        return {
          id: uniqueId(slug(f.title.value)),
          title: f.title.value.trim() || "Başlıksız",
          excerpt: f.excerpt.value.trim() || autoExcerpt(),
          category: f.category.value,
          date: f.date.value,
          readTime: Math.max(1, Math.round(words / 200)),
          cover: coverPath
        };
      }
      const codeFor = (post) => {
        const fields = Object.entries(post).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join("\n");
        const body = ta.value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
        return "  {\n" + fields + "\n    content: `\n" + body + "\n`\n  },";
      };

      // preview toggle
      $("#previewBtn").addEventListener("click", () => {
        if (!$("#previewPane").hidden) { $("#previewPane").hidden = true; $("#editPane").hidden = false; $("#previewBtn").textContent = "Önizle"; return; }
        const cover = f.cover.value === "__upload" ? uploadURL : f.cover.value;
        const post = buildPost(cover);
        $("#previewPane").innerHTML = `<span class="chip">${esc(post.category)}</span><h1>${esc(post.title)}</h1>${meta(post, true)}
          ${cover ? `<div class="pv-cover"><img src="${esc(cover)}" alt=""></div>` : ""}<div class="prose">${md(ta.value) || '<p class="hint">Henüz içerik yok.</p>'}</div>`;
        $("#previewPane").hidden = false; $("#editPane").hidden = true; $("#previewBtn").textContent = "Düzenle";
        window.scrollTo({ top: 0 });
      });

      // publish
      $("#publishBtn").addEventListener("click", async () => {
        const btn = $("#publishBtn");
        if (!f.title.value.trim()) { say("Önce bir başlık yaz.", "error"); f.title.focus(); return; }
        if (!ta.value.trim()) { say("Yazının içeriği boş.", "error"); ta.focus(); return; }
        if (f.cover.value === "__upload" && !uploadFile) { say("Yüklemek için bir fotoğraf seç.", "error"); return; }
        btn.disabled = true; say("Yayınlanıyor…");
        try {
          let coverPath = f.cover.value;
          if (coverPath === "__upload") {
            const ext = (uploadFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
            coverPath = "assets/" + (slug(f.title.value) || "kapak") + "-" + Date.now() + "." + ext;
            await gh(`/repos/${SITE.repo}/contents/${coverPath}`, { method: "PUT", body: JSON.stringify({ message: "Add cover: " + f.title.value, content: await fileToB64(uploadFile) }) });
          }
          const post = buildPost(coverPath);
          const cur = await gh(`/repos/${SITE.repo}/contents/js/posts.js`);
          const text = b64decode(cur.content);
          const m = text.match(/const POSTS = \[\r?\n/);
          if (!m) throw new Error("posts.js beklenen formatta değil.");
          const at = m.index + m[0].length;
          await gh(`/repos/${SITE.repo}/contents/js/posts.js`, { method: "PUT", body: JSON.stringify({ message: "New post: " + post.title, content: b64encodeText(text.slice(0, at) + codeFor(post) + "\n" + text.slice(at)), sha: cur.sha }) });
          POSTS.push(post);
          try { localStorage.removeItem("aeronotes_draft"); } catch {}
          say(`✓ <b>Yayınlandı!</b> 1–2 dakika içinde sitede görünür → <a href="post.html?id=${encodeURIComponent(post.id)}">yazıyı aç</a>`, "ok");
          f.title.value = ""; ta.value = ""; f.excerpt.value = ""; window.scrollTo({ top: 0 });
        } catch (err) {
          say("Yayınlanamadı: " + esc(err.message), "error");
          if (/bad credentials/i.test(err.message)) auth.clear();
        } finally { btn.disabled = false; }
      });

      // keep an unsent draft in this browser
      const keys = ["title", "excerpt", "category", "content"];
      try {
        const d = JSON.parse(localStorage.getItem("aeronotes_draft") || "null");
        if (d) { keys.forEach((k) => d[k] && (f[k].value = d[k])); if (d.cover && d.cover !== "__upload") f.cover.value = d.cover; }
      } catch {}
      let timer;
      const saveDraft = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          try { localStorage.setItem("aeronotes_draft", JSON.stringify({ ...Object.fromEntries(keys.map((k) => [k, f[k].value])), cover: f.cover.value })); $("#saveState").textContent = "✓ Taslak kaydedildi"; } catch {}
        }, 400);
      };
      f.addEventListener("input", saveDraft);
      f.addEventListener("change", saveDraft);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    $("#site-header").innerHTML = header(page);
    $("#site-footer").innerHTML = footer();
    $("#menuBtn").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
    const lo = $("#logoutBtn");
    if (lo) lo.addEventListener("click", () => { auth.clear(); location.href = "index.html"; });
    setupSearch();
    if (pages[page]) pages[page]();
  });

  window.AeroNotes = { md, ICONS, vaultSeal, vaultOpen };
})();
