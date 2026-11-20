/* AeroNotes — shared UI + page rendering */
(function () {
  const ICONS = {
    logo: '<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path d="M3 23 45 6 31 42 23 28 3 23Zm20 5 4-1 14-17-18 18Z"/><path d="M23 28 21 37l5-6" opacity=".7"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    Aviation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M21 3 3 10l7 3 3 7 8-17Z"/><path d="m10 13 4-4"/></svg>',
    Space: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c3-1 6-1 6-1s0 3-1 6l-7 7-4-4 6-8Z"/><path d="M8 12H5l-2 3 4 1M12 16v3l-3 2-1-4"/><circle cx="15" cy="9" r="1.5"/><path d="M5 19c0-1 1-2 2-2"/></svg>',
    Engines: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 10c0-3 1-5 3-6M14 12c3 0 5 1 6 3M12 14c0 3-1 5-3 6M10 12c-3 0-5-1-6-3"/></svg>',
    History: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>',
    "World News": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z"/></svg>',
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
  async function getAuthJson() {
    try { const f = await gh(`/repos/${SITE.repo}/contents/auth.json`); return { sha: f.sha, vault: JSON.parse(b64decode(f.content)) }; }
    catch { return null; }
  }
  async function putAuthJson(vault, message) {
    const cur = await getAuthJson();
    await gh(`/repos/${SITE.repo}/contents/auth.json`, { method: "PUT", body: JSON.stringify({ message, content: b64encodeText(JSON.stringify(vault, null, 2) + "\n"), ...(cur ? { sha: cur.sha } : {}) }) });
  }

  // Username is stored only as a salted hash next to the encrypted key.
  async function userHash(salt, user) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + String(user).trim().toLowerCase()));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
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

  /* Fonts the author can pick per article */
  // The well-known font is used when the reader has it; otherwise a free look-alike from Google Fonts
  // is loaded, so phones and Macs see the same style.
  const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72, 80, 90, 100];
  const GF = (name) => name.replace(/ /g, "+") + ":ital,wght@0,400;0,700;1,400;1,700";
  const FONTS = {
    default: { label: "Inter (varsayılan)", family: "'Inter', system-ui, sans-serif" },
    times: { label: "Times New Roman", family: "'Times New Roman', Tinos, Times, serif", gf: GF("Tinos") },
    arial: { label: "Arial", family: "Arial, Arimo, Helvetica, sans-serif", gf: GF("Arimo") },
    helvetica: { label: "Helvetica", family: "'Helvetica Neue', Helvetica, Arimo, Arial, sans-serif", gf: GF("Arimo") },
    georgia: { label: "Georgia", family: "Georgia, Gelasio, serif", gf: GF("Gelasio") },
    calibri: { label: "Calibri", family: "Calibri, Carlito, sans-serif", gf: GF("Carlito") },
    cambria: { label: "Cambria", family: "Cambria, Caladea, Georgia, serif", gf: GF("Caladea") },
    garamond: { label: "Garamond", family: "'EB Garamond', Garamond, serif", gf: GF("EB Garamond") },
    verdana: { label: "Verdana", family: "Verdana, 'DejaVu Sans', Geneva, sans-serif" },
    tahoma: { label: "Tahoma", family: "Tahoma, 'Segoe UI', Geneva, sans-serif" },
    trebuchet: { label: "Trebuchet MS", family: "'Trebuchet MS', 'Fira Sans', sans-serif", gf: GF("Fira Sans") },
    palatino: { label: "Palatino", family: "'Palatino Linotype', Palatino, 'Book Antiqua', 'Libre Baskerville', serif", gf: "Libre+Baskerville:ital,wght@0,400;0,700;1,400" },
    courier: { label: "Courier New", family: "'Courier New', Cousine, Courier, monospace", gf: GF("Cousine") },
    comic: { label: "Comic Sans", family: "'Comic Sans MS', 'Comic Neue', cursive", gf: GF("Comic Neue") },
    roboto: { label: "Roboto", family: "Roboto, Arial, sans-serif", gf: GF("Roboto") },
    // older choices (kept so existing articles still look right)
    serif: { label: "Merriweather", family: "'Merriweather', Georgia, serif", gf: "Merriweather:ital,wght@0,400;0,700;1,400", hidden: true },
    lora: { label: "Lora", family: "'Lora', Georgia, serif", gf: GF("Lora"), hidden: true },
    slab: { label: "Roboto Slab", family: "'Roboto Slab', Georgia, serif", gf: "Roboto+Slab:wght@400;700", hidden: true },
    mono: { label: "JetBrains Mono", family: "'JetBrains Mono', Consolas, monospace", gf: GF("JetBrains Mono"), hidden: true }
  };
  function loadFont(key) {
    const f = FONTS[key]; if (!f || !f.gf || document.getElementById("gf-" + key)) return;
    const l = document.createElement("link"); l.id = "gf-" + key; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + f.gf + "&display=swap"; document.head.appendChild(l);
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
  const safeUrl = (u) => (/^(https?:|blob:|assets\/|\/|#|post\.html|articles\.html)/i.test(u) ? u : "#");
  function videoEmbed(url) {
    let m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)))
      return `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="Video" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return `<div class="video"><iframe src="https://player.vimeo.com/video/${m[1]}" title="Video" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    return `<video class="video-file" src="${esc(safeUrl(url))}" controls preload="metadata" playsinline></video>`;
  }
  // media: optional { "assets/x.jpg": "blob:..." } so freshly uploaded files preview before the site redeploys
  function md(src, media = {}) {
    const fix = (u) => media[u] || u;
    const inline = (t) =>
      esc(t)
        .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, u) => `<img src="${safeUrl(fix(u))}" alt="${alt}" loading="lazy">`)
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t2, u) => `<a href="${safeUrl(u)}" target="_blank" rel="noopener">${t2}</a>`)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return String(src || "")
      .trim()
      .split(/\n\s*\n/)
      .map((block) => {
        const lines = block.trim().split("\n");
        const one = block.trim();
        let mm;
        if ((mm = one.match(/^@\[video\]\(([^)\s]+)\)$/))) return videoEmbed(fix(mm[1]));
        if ((mm = one.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)))
          return `<figure><img src="${esc(safeUrl(fix(mm[2])))}" alt="${esc(mm[1])}" loading="lazy">${mm[1] ? `<figcaption>${esc(mm[1])}</figcaption>` : ""}</figure>`;
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

  const authorAvatar = (cls = "avatar") => SITE.avatar ? `<img class="${cls} photo" src="${esc(SITE.avatar)}" alt="${esc(SITE.author)}">` : `<span class="${cls}">${initials(SITE.author)}</span>`;
  function meta(p, avatar) {
    return `<div class="meta">
      <span class="author">${avatar ? authorAvatar() : ICONS.user}${esc(SITE.author)}</span>
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

  function followBox() {
    if (!SITE.linkedin) return "";
    return `<div class="follow-box"><p>Get notified when a new article is out.</p>
      <a class="btn btn-li" href="${esc(SITE.linkedin)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4V9.5Z"/></svg><span>Follow on LinkedIn</span></a></div>`;
  }

  function footer() {
    return `<div class="container"><span>© ${new Date().getFullYear()} ${esc(SITE.name)} · Written by ${esc(SITE.author)}${SITE.linkedin ? ` · <a href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}</span>
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

  /* Read / rewrite js/posts.js in the repo (used for publish, edit and delete) */
  async function loadRemotePosts() {
    const cur = await gh(`/repos/${SITE.repo}/contents/js/posts.js`);
    const text = b64decode(cur.content);
    const m = text.match(/const POSTS = \[\r?\n/);
    if (!m) throw new Error("posts.js beklenen formatta değil.");
    const posts = new Function(text + "\n;return POSTS;")();
    return { sha: cur.sha, prefix: text.slice(0, m.index + m[0].length), posts };
  }
  const POST_KEYS = ["id", "title", "excerpt", "category", "tag", "date", "readTime", "cover", "featured"];
  function postToCode(p) {
    const keys = [...POST_KEYS.filter((k) => k in p), ...Object.keys(p).filter((k) => !POST_KEYS.includes(k) && k !== "content")].filter((k) => p[k] !== undefined);
    const lines = keys.map((k) => "    " + k + ": " + JSON.stringify(p[k]) + ",").join("\n");
    let body = String(p.content || "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    if (!body.startsWith("\n")) body = "\n" + body;
    if (!body.endsWith("\n")) body += "\n";
    return "  {\n" + lines + "\n    content: `" + body + "`\n  },";
  }
  async function saveRemotePosts(remote, posts, message) {
    const text = remote.prefix + posts.map(postToCode).join("\n") + "\n];\n";
    await gh(`/repos/${SITE.repo}/contents/js/posts.js`, { method: "PUT", body: JSON.stringify({ message, content: b64encodeText(text), sha: remote.sha }) });
  }

  /* Articles written in the visual editor are stored as HTML. Only a safe set of tags is kept. */
  const ALLOWED = {
    P: [], H2: [], H3: [], STRONG: [], B: [], EM: [], I: [], U: [], A: ["href"], UL: [], OL: [], LI: [],
    BLOCKQUOTE: [], BR: [], FIGURE: [], FIGCAPTION: [], IMG: ["src", "alt"], VIDEO: ["src"], IFRAME: ["src"], CODE: []
  };
  const firstFontName = (fam) => String(fam).split(",")[0].replace(/["']/g, "").trim().toLowerCase();
  const DROP = new Set(["SCRIPT", "STYLE", "OBJECT", "EMBED", "FORM", "INPUT", "BUTTON", "SELECT", "TEXTAREA", "LINK", "META"]);
  // keepBlob: preview mode (show freshly uploaded files from memory)
  function sanitize(html, keepBlob = false) {
    const doc = new DOMParser().parseFromString("<body>" + String(html || "") + "</body>", "text/html");
    const unwrap = (el) => el.replaceWith(...el.childNodes);
    const walk = (node) => {
      [...node.childNodes].forEach((el) => {
        if (el.nodeType === 3) { if (el.nodeValue.includes("\u200B")) { el.nodeValue = el.nodeValue.replace(/\u200B/g, ""); if (!el.nodeValue) el.remove(); } return; }
        if (el.nodeType !== 1) { el.remove(); return; }
        const tag = el.tagName;
        if (DROP.has(tag)) { el.remove(); return; }
        if (tag === "DIV") {
          if (el.classList.contains("video") && el.querySelector("iframe")) {
            const ifr = el.querySelector("iframe"); el.replaceChildren(ifr); el.className = "video";
            [...el.attributes].forEach((a) => a.name !== "class" && el.removeAttribute(a.name));
            walk(el); return;
          }
          walk(el);
          if (el.classList.contains("media-block")) { unwrap(el); return; }
          const p = doc.createElement("p"); p.append(...el.childNodes); el.replaceWith(p); return;
        }
        if (tag === "SPAN" || tag === "FONT") {
          // keep only a known font and a size between 8 and 100 px
          const fam = el.style.fontFamily || el.getAttribute("face") || "";
          const size = el.style.fontSize || "";
          const span = doc.createElement("span");
          if (fam) {
            const k = Object.keys(FONTS).find((key) => firstFontName(FONTS[key].family) === firstFontName(fam));
            if (k) span.style.fontFamily = FONTS[k].family;
          }
          const px = /^\d+(\.\d+)?px$/.test(size) ? Math.round(parseFloat(size)) : 0;
          if (px >= 8 && px <= 100) span.style.fontSize = px + "px";
          if (el.style.fontWeight === "bold" || Number(el.style.fontWeight) >= 600) span.style.fontWeight = "700";
          if (el.style.fontStyle === "italic") span.style.fontStyle = "italic";
          if (/underline/.test(el.style.textDecoration || el.style.textDecorationLine || "")) span.style.textDecoration = "underline";
          span.append(...el.childNodes); el.replaceWith(span); walk(span);
          if (!span.textContent && !span.querySelector("img,video,iframe,br")) { span.remove(); return; }
          if (!span.getAttribute("style")) unwrap(span);
          return;
        }
        if (!(tag in ALLOWED)) { walk(el); unwrap(el); return; }
        const path = el.getAttribute("data-path");
        [...el.attributes].forEach((a) => { if (!ALLOWED[tag].includes(a.name)) el.removeAttribute(a.name); });
        if (path && !keepBlob) el.setAttribute("src", path);
        if (tag === "A") {
          const href = el.getAttribute("href") || "";
          if (!/^(https?:|mailto:|#|post\.html|articles\.html|\/)/i.test(href)) el.removeAttribute("href");
          el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener");
        }
        if (tag === "IMG" || tag === "VIDEO") {
          const src = el.getAttribute("src") || "";
          const ok = /^(https?:|assets\/)/i.test(src) || (keepBlob && /^blob:/i.test(src));
          if (!ok) { el.remove(); return; }
          if (tag === "IMG") el.setAttribute("loading", "lazy");
          else { el.setAttribute("controls", ""); el.setAttribute("preload", "metadata"); el.setAttribute("playsinline", ""); el.className = "video-file"; }
        }
        if (tag === "IFRAME") {
          const src = el.getAttribute("src") || "";
          if (!/^https:\/\/(www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)/.test(src)) { el.remove(); return; }
          el.setAttribute("allow", "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen");
          el.setAttribute("allowfullscreen", ""); el.setAttribute("loading", "lazy"); el.setAttribute("title", "Video");
          if (!el.parentElement || !el.parentElement.classList.contains("video")) {
            const w = doc.createElement("div"); w.className = "video"; el.replaceWith(w); w.appendChild(el);
          }
        }
        walk(el);
      });
    };
    walk(doc.body);
    return doc.body.innerHTML.replace(/(<p><br><\/p>\s*)+$/g, "").trim();
  }
  const renderContent = (p) => {
    if (p.format !== "html") return md(p.content);
    const html = sanitize(p.content);
    Object.keys(FONTS).forEach((k) => { if (k !== "default" && html.toLowerCase().includes(firstFontName(FONTS[k].family))) loadFont(k); });
    return html;
  };

  /* ---------- Comments ---------- */
  const timeAgo = (iso) => {
    const d = new Date(iso.replace(" ", "T") + "Z");
    return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  async function comments(postId) {
    const list = $("#cList"), form = $("#cForm"), msg = $("#cMsg");
    const draw = (items) => {
      $("#cCount").textContent = items.length ? "(" + items.length + ")" : "";
      list.innerHTML = items.length
        ? items.map((c) => `<div class="c-item"><div class="c-head"><span class="avatar">${esc(initials(c.name))}</span><b>${esc(c.name)}</b><span class="hint">${timeAgo(c.created_at)}</span></div><p>${esc(c.text).replace(/\n/g, "<br>")}</p></div>`).join("")
        : '<p class="hint">No comments yet — be the first!</p>';
    };
    try {
      const r = await fetch("/api/comments?post=" + encodeURIComponent(postId));
      if (!r.ok) throw 0;
      draw((await r.json()).comments || []);
    } catch { list.innerHTML = '<p class="hint">Comments could not be loaded.</p>'; }

    try { const n = localStorage.getItem("aeronotes_cname"); if (n) form.name.value = n; } catch {}
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.submitter; btn.disabled = true;
      msg.className = "hint"; msg.textContent = "Sending…";
      try {
        const r = await fetch("/api/comments", { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ post: postId, name: form.name.value, text: form.text.value, website: form.website.value }) });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || "Something went wrong.");
        try { localStorage.setItem("aeronotes_cname", form.name.value.trim()); } catch {}
        form.text.value = "";
        msg.className = "hint ok"; msg.textContent = "✓ Thank you! Your comment will appear after the author approves it.";
      } catch (err) { msg.className = "hint error"; msg.textContent = err.message; }
      finally { btn.disabled = false; }
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
      if ($("#follow")) $("#follow").innerHTML = followBox();
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
      const font = FONTS[p.font] || FONTS.default; loadFont(p.font);
      const fs = font === FONTS.default ? "" : ` style="font-family:${font.family}"`;
      const shareUrl = location.origin + location.pathname + "?id=" + encodeURIComponent(p.id);
      const enc = encodeURIComponent, shareText = p.title + " — " + SITE.name;
      const newer = sorted[i - 1], older = sorted[i + 1];
      $("#post").innerHTML = `<div class="post-hero"><img src="${esc(p.cover)}" alt=""></div>
        <article><header class="post-head"><a class="chip" href="articles.html?category=${encodeURIComponent(p.category)}">${esc(p.category)}</a>
        <h1${fs}>${esc(p.title)}</h1><p class="lead">${esc(p.excerpt)}</p>${meta(p, true)}</header>
        <div class="prose"${fs}>${renderContent(p)}</div></article>
        <div class="share" id="share"><b>Share:</b>
          <button type="button" id="copyLink">${ICONS.link} Copy link</button>
          <a href="https://wa.me/?text=${enc(shareText + " " + shareUrl)}" target="_blank" rel="noopener">WhatsApp</a>
          <a href="https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}" target="_blank" rel="noopener">X</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}" target="_blank" rel="noopener">Facebook</a>
          ${navigator.share ? `<button type="button" id="nativeShare">${ICONS.share} More…</button>` : ""}
        </div>
        ${followBox()}
        <nav class="post-nav">${older ? `<a class="link-arrow" href="post.html?id=${encodeURIComponent(older.id)}">${ICONS.arrowLeft} Older</a>` : "<span></span>"}
        ${newer ? `<a class="link-arrow" href="post.html?id=${encodeURIComponent(newer.id)}">Newer ${ICONS.arrow}</a>` : "<span></span>"}</nav>
        <section class="comments" id="comments">
          <h2>Comments <span class="count" id="cCount"></span></h2>
          <div id="cList" class="c-list"><p class="hint">Loading comments…</p></div>
          <form id="cForm" class="c-form" autocomplete="on">
            <h3>Leave a comment</h3>
            <div class="field"><label for="cName">Your name</label><input id="cName" name="name" maxlength="60" autocomplete="name" required></div>
            <div class="field"><label for="cText">Your comment</label><textarea id="cText" name="text" maxlength="2000" rows="5" required></textarea></div>
            <input name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
            <button class="btn" type="submit">Send comment</button>
            <p id="cMsg" class="hint"></p>
          </form>
        </section>`;
      $("#copyLink").addEventListener("click", async (e) => {
        const b = e.currentTarget;
        try { await navigator.clipboard.writeText(shareUrl); }
        catch { const t = document.createElement("textarea"); t.value = shareUrl; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
        b.classList.add("copied"); b.innerHTML = "✓ Link copied!";
        setTimeout(() => { b.classList.remove("copied"); b.innerHTML = ICONS.link + " Copy link"; }, 2000);
      });
      const ns = $("#nativeShare");
      if (ns) ns.addEventListener("click", () => navigator.share({ title: p.title, text: p.excerpt, url: shareUrl }).catch(() => {}));
      comments(p.id);
    },

    about() {
      if (SITE.avatar) $("#aboutAvatar").outerHTML = authorAvatar("about-avatar");
      else $("#aboutAvatar").textContent = initials(SITE.author);
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
      // Two-step login on? Then the vault is only handed out by the server after a correct code.
      let twofa = false;
      try { const r = await fetch("/api/auth", { cache: "no-store" }); if (r.ok) twofa = !!(await r.json()).twofa; } catch {}
      if (twofa) { $("#codeField").hidden = false; $("#code").required = true; }

      const showSetup = () => {
        $("#pwSection").hidden = true; $("#setupSection").hidden = false;
        if (vault) { $("#setupTitle").textContent = auth.on ? "Parolayı değiştir" : "Parolayı sıfırla"; $("#backToPw").hidden = false; }
        if (auth.on) $("#tokenField").hidden = true; // already logged in: reuse current key
      };
      if ((!vault && !twofa) || setupMode) showSetup(); else { $("#pwSection").hidden = false; $("#password").focus(); }
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
          let token, v = vault;
          if (twofa) {
            const r = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "vault", code: $("#code").value }) });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) { await new Promise((res) => setTimeout(res, 800)); throw new Error(d.error || "Doğrulama kodu yanlış."); }
            v = d.vault;
          }
          try {
            if (v.uh && (await userHash(v.salt, $("#username").value)) !== v.uh) throw 0;
            token = await vaultOpen(v, $("#password").value);
          }
          catch { await new Promise((r) => setTimeout(r, 800)); throw new Error("Kullanıcı adı veya parola yanlış."); }
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
        const pw = f.newPw.value, user = f.username.value.trim();
        if (user.length < 3) return say(msg, "Kullanıcı adı en az 3 karakter olmalı.", "error");
        if (!token) return say(msg, "GitHub anahtarını yapıştır.", "error");
        if (!/^(github_pat_|ghp_)/.test(token)) return say(msg, "Bu bir GitHub anahtarı gibi görünmüyor (github_pat_ ile başlamalı).", "error");
        if (pw.length < 12 || !/[a-zçğıöşü]/.test(pw) || !/[A-ZÇĞİÖŞÜ]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(pw))
          return say(msg, "Parola zayıf: en az 12 karakter, büyük harf, küçük harf, rakam ve sembol olmalı.", "error");
        if (pw !== f.newPw2.value) return say(msg, "Parolalar aynı değil.", "error");
        btn.disabled = true; say(msg, "Kaydediliyor…");
        try {
          await checkToken(token);
          const sealed = await vaultSeal(token, pw);
          sealed.uh = await userHash(sealed.salt, user);
          if (twofa) {
            const r = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ action: "save", vault: sealed }) });
            if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Hata " + r.status);
          } else await putAuthJson(sealed, "Update author password");
          say(msg, "✓ Parola kaydedildi! Yönlendiriliyorsun…", "ok");
          setTimeout(() => location.replace("write.html"), 1200);
        } catch (err) { say(msg, "Kaydedilemedi: " + err.message, "error"); }
        finally { btn.disabled = false; }
      });
    },

    write() {
      if (!auth.on) { location.replace("login.html"); return; }
      const f = $("#writeForm"), msg = $("#publishMsg"), ed = $("#editor");
      const editId = new URLSearchParams(location.search).get("edit");
      const editing = editId ? POSTS.find((p) => p.id === editId) : null;
      const COVERS = [["assets/wing.webp", "Kanat"], ["assets/rocket.webp", "Roket"], ["assets/engine.webp", "Motor"], ["assets/satellite.webp", "Uydu"], ["assets/airfoil.webp", "Kanat profili"]];
      if (editing && !COVERS.some(([s]) => s === editing.cover)) COVERS.unshift([editing.cover, "Mevcut kapak"]);
      const slug = (s) => s.toLowerCase().replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const say = (text, kind) => { msg.className = "hint ed-msg" + (kind ? " " + kind : ""); msg.innerHTML = text; };
      let uploadFile = null, uploadURL = "";

      // ---- category chips + cover thumbnails
      $("#cats").innerHTML = CATEGORIES.map((c, i) => `<label><input type="radio" name="category" value="${esc(c)}" ${i ? "" : "checked"}><span>${esc(c)}</span></label>`).join("");
      $("#covers").innerHTML = COVERS.map(([src, name], i) => `<label title="${name}"><input type="radio" name="cover" value="${esc(src)}" ${i ? "" : "checked"}><span class="thumb"><img src="${esc(src)}" alt="${name}"></span></label>`).join("") +
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

      // ---- Word-like editor (what you see is what readers see)
      try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch {}
      let savedRange = null;
      const changed = () => ed.dispatchEvent(new Event("input", { bubbles: true }));
      document.addEventListener("selectionchange", () => {
        const s = getSelection();
        if (s.rangeCount && ed.contains(s.anchorNode)) { savedRange = s.getRangeAt(0).cloneRange(); updateToolbar(); }
      });
      const restore = () => {
        ed.focus();
        const s = getSelection(); s.removeAllRanges();
        if (savedRange && ed.contains(savedRange.startContainer)) s.addRange(savedRange);
        else { const r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); s.addRange(r); }
      };
      const exec = (cmd, val = null) => { restore(); document.execCommand(cmd, false, val); changed(); updateToolbar(); };
      const toggleBlock = (tag) => {
        restore();
        const cur = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
        document.execCommand("formatBlock", false, cur === tag ? "p" : tag);
        changed(); updateToolbar();
      };
      const insertHTML = (html) => { restore(); document.execCommand("insertHTML", false, html); changed(); };
      function updateToolbar() {
        const block = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
        const on = { b: "bold", i: "italic", u: "underline", ul: "insertUnorderedList" };
        $("#toolbar").querySelectorAll("button[data-md]").forEach((btn) => {
          const k = btn.dataset.md;
          let active = false;
          try { if (on[k]) active = document.queryCommandState(on[k]); } catch {}
          if (k === "h") active = block === "h2";
          if (k === "q") active = block === "blockquote";
          btn.classList.toggle("on", active);
        });
      }
      $("#toolbar").addEventListener("mousedown", (e) => { if (e.target.closest("button")) e.preventDefault(); });
      $("#toolbar").addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-md]"); if (!btn) return;
        const k = btn.dataset.md;
        if (k === "b") exec("bold");
        if (k === "i") exec("italic");
        if (k === "u") exec("underline");
        if (k === "h") toggleBlock("h2");
        if (k === "ul") exec("insertUnorderedList");
        if (k === "q") toggleBlock("blockquote");
        if (k === "a") {
          const url = (prompt("Link adresi (https://…)") || "").trim(); if (!url) return;
          const href = /^https?:\/\//i.test(url) ? url : "https://" + url;
          restore();
          if (getSelection().isCollapsed) insertHTML(`<a href="${esc(href)}">${esc(url)}</a>&nbsp;`); else exec("createLink", href);
        }
        if (k === "img") $("#imgFile").click();
        if (k === "video") { $("#videoPop").hidden = !$("#videoPop").hidden; if (!$("#videoPop").hidden) $("#videoUrl").focus(); }
      });
      // keyboard shortcuts work too (Ctrl+B / Ctrl+I / Ctrl+U are built in)
      ed.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text/plain");
        const html = text.split(/\r?\n\s*\r?\n/).map((p) => "<p>" + esc(p).replace(/\r?\n/g, "<br>") + "</p>").join("");
        document.execCommand("insertHTML", false, html); changed();
      });

      // ---- photos & videos inside the text (inserted where the cursor is)
      const mediaBlock = (inner) => `<div class="media-block" contenteditable="false">${inner}</div><p><br></p>`;
      async function uploadAsset(file, kind) {
        const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "") || (kind === "video" ? "mp4" : "jpg");
        const path = `assets/${kind}-${Date.now()}.${ext}`;
        await gh(`/repos/${SITE.repo}/contents/${path}`, { method: "PUT", body: JSON.stringify({ message: `Add ${kind}: ${file.name}`, content: await fileToB64(file) }) });
        return path;
      }
      async function handleUpload(file, kind, maxMB) {
        if (!file) return;
        if (file.size > maxMB * 1024 * 1024) { say(`Dosya çok büyük (en fazla ${maxMB} MB).${kind === "video" ? " Büyük videolar için YouTube'a yükleyip linkini ekleyebilirsin." : ""}`, "error"); return; }
        say(kind === "video" ? "Video yükleniyor… (büyük dosyalarda biraz sürebilir)" : "Fotoğraf yükleniyor…");
        try {
          const path = await uploadAsset(file, kind), blob = URL.createObjectURL(file);
          if (kind === "video") insertHTML(mediaBlock(`<video class="video-file" src="${blob}" data-path="${esc(path)}" controls playsinline></video>`));
          else {
            const cap = (prompt("Fotoğrafın altına açıklama yazmak ister misin? (boş bırakabilirsin)") || "").trim();
            insertHTML(mediaBlock(`<figure><img src="${blob}" data-path="${esc(path)}" alt="${esc(cap)}">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`));
          }
          say(kind === "video" ? "✓ Video eklendi." : "✓ Fotoğraf eklendi.", "ok");
        } catch (err) { say("Yüklenemedi: " + esc(err.message), "error"); }
      }
      $("#imgFile").addEventListener("change", (e) => { handleUpload(e.target.files[0], "image", 8); e.target.value = ""; });
      $("#vidFile").addEventListener("change", (e) => { handleUpload(e.target.files[0], "video", 25); e.target.value = ""; });
      $("#videoFileBtn").addEventListener("click", () => { $("#videoPop").hidden = true; $("#vidFile").click(); });
      $("#videoPopX").addEventListener("click", () => { $("#videoPop").hidden = true; });
      const addVideoUrl = () => {
        const u = $("#videoUrl").value.trim();
        if (!/^https?:\/\//i.test(u)) { say("Geçerli bir video linki yapıştır (https:// ile başlamalı).", "error"); return; }
        insertHTML(mediaBlock(videoEmbed(u)));
        $("#videoUrl").value = ""; $("#videoPop").hidden = true; say("✓ Video eklendi.", "ok");
      };
      $("#videoUrlBtn").addEventListener("click", addVideoUrl);
      $("#videoUrl").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addVideoUrl(); } });

      // ---- font & size like Word: applies to the selected text, or to what you type next
      const fontSel = $("#fontSel"), sizeSel = $("#sizeSel");
      fontSel.innerHTML = Object.entries(FONTS).filter(([, v]) => !v.hidden).map(([k, v]) => `<option value="${k}" style="font-family:${v.family}">${v.label.replace(" (varsayılan)", "")}</option>`).join("");

      Object.keys(FONTS).filter((k) => !FONTS[k].hidden).forEach(loadFont);
      let pendingSize = null, holdSync = false; // holdSync: keep menus showing the chosen value until you type or click
      const fixSizes = () => {
        if (!pendingSize) return;
        ed.querySelectorAll('span[style*="xxx-large"], font[size="7"]').forEach((el) => {
          if (el.tagName === "FONT") { const s = document.createElement("span"); s.append(...el.childNodes); el.replaceWith(s); el = s; }
          el.style.fontSize = pendingSize + "px";
        });
      };
      const withCSS = (fn) => { try { document.execCommand("styleWithCSS", false, true); fn(); } finally { try { document.execCommand("styleWithCSS", false, false); } catch {} } };
      [fontSel, sizeSel].forEach((s) => s.addEventListener("pointerdown", () => { const sel = getSelection(); if (sel.rangeCount && ed.contains(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange(); }));
      // No text selected: drop an invisible styled marker at the cursor so what you type next goes inside it
      function styleAtCaret(prop, value) {
        restore();
        const sel = getSelection(); if (!sel.rangeCount) return false;
        const r = sel.getRangeAt(0); if (!r.collapsed) return false;
        let host = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement;
        // reuse an empty marker that is already here instead of stacking new ones
        if (host && host.tagName === "SPAN" && host.textContent === "\u200B") { host.style[prop] = value; changed(); return true; }
        const span = document.createElement("span"); span.style[prop] = value;
        const t = document.createTextNode("\u200B"); span.appendChild(t);
        r.insertNode(span);
        const nr = document.createRange(); nr.setStart(t, 1); nr.collapse(true);
        sel.removeAllRanges(); sel.addRange(nr); savedRange = nr.cloneRange();
        changed(); return true;
      }
      let lastApply = "";
      fontSel.addEventListener("change", () => {
        if (lastApply === "font:" + fontSel.value) return;
        lastApply = "font:" + fontSel.value; setTimeout(() => (lastApply = ""), 400);
        holdSync = true;
        const fam = FONTS[fontSel.value].family;
        if (!styleAtCaret("fontFamily", fam)) { withCSS(() => document.execCommand("fontName", false, fam)); changed(); }
      });
      sizeSel.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sizeSel.dispatchEvent(new Event("change")); } });
      sizeSel.addEventListener("change", () => {
        const n = Math.round(Number(sizeSel.value));
        if (!n) return;
        pendingSize = Math.min(100, Math.max(8, n)); sizeSel.value = pendingSize; holdSync = true;
        if (lastApply === "size:" + pendingSize) return; // the box fires twice (Enter + leaving the box)
        lastApply = "size:" + pendingSize; setTimeout(() => (lastApply = ""), 400);
        if (!styleAtCaret("fontSize", pendingSize + "px")) { withCSS(() => document.execCommand("fontSize", false, "7")); fixSizes(); changed(); }
      });
      ed.addEventListener("input", (e) => { fixSizes(); if (e.isTrusted) holdSync = false; });
      ed.addEventListener("mousedown", () => { holdSync = false; });
      // show the font/size where the cursor is
      const firstFamily = (fam) => String(fam).split(",")[0].replace(/["']/g, "").trim().toLowerCase();
      function syncSelects() {
        if (holdSync) return;
        const sel = getSelection(); if (!sel.rangeCount || !ed.contains(sel.anchorNode)) return;
        let el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
        const cs = getComputedStyle(el);
        const key = Object.keys(FONTS).find((k) => !FONTS[k].hidden && firstFamily(FONTS[k].family) === firstFamily(cs.fontFamily));
        if (key) fontSel.value = key;
        if (document.activeElement !== sizeSel) sizeSel.value = String(Math.round(parseFloat(cs.fontSize)));
      }
      document.addEventListener("selectionchange", () => { if (document.activeElement === ed) syncSelects(); });
      // older articles may have one font for the whole text
      const applyFont = () => { const k = FONTS[f.font.value] ? f.font.value : "default"; loadFont(k); ed.style.fontFamily = FONTS[k].family; };

      // ---- helpers
      const textOf = () => ed.innerText.replace(/\s+/g, " ").trim();
      const hasMedia = () => !!ed.querySelector("img, video, iframe");
      const autoExcerpt = () => { const p = textOf(); return p.length > 160 ? p.slice(0, 157).replace(/\s\S*$/, "") + "…" : p; };
      const uniqueId = (base, list) => { base = base || "yazi"; let id = base, n = 2; while (list.some((p) => p.id === id)) id = base + "-" + n++; return id; };
      function fieldsFrom(coverPath) {
        const words = textOf().split(" ").filter(Boolean).length;
        return {
          title: f.title.value.trim() || "Başlıksız",
          excerpt: f.excerpt.value.trim() || autoExcerpt(),
          category: f.category.value,
          date: f.date.value,
          readTime: Math.max(1, Math.round(words / 200)),
          cover: coverPath,
          font: f.font.value === "default" ? undefined : f.font.value,
          format: "html",
          content: sanitize(ed.innerHTML)
        };
      }
      // Older articles were written in Markdown: show them as formatted text in the editor
      const toEditorHTML = (p) => {
        const html = p.format === "html" ? sanitize(p.content) : md(p.content);
        const tmp = document.createElement("div"); tmp.innerHTML = html;
        tmp.querySelectorAll("figure, video.video-file, div.video").forEach((el) => {
          const wrap = document.createElement("div"); wrap.className = "media-block"; wrap.contentEditable = "false";
          el.replaceWith(wrap); wrap.appendChild(el);
        });
        return tmp.innerHTML;
      };

      // ---- edit mode
      if (editing) {
        document.title = "Düzenle · " + SITE.name;
        f.title.value = editing.title; f.excerpt.value = editing.excerpt || ""; f.date.value = editing.date;
        f.category.value = editing.category; f.cover.value = editing.cover;
        f.font.value = FONTS[editing.font] ? editing.font : "default";
        ed.innerHTML = toEditorHTML(editing);
        $("#publishBtn").textContent = "Kaydet";
        $("#saveState").innerHTML = `Düzenleniyor: <b>${esc(editing.title)}</b>`;
      } else if (editId) {
        say("Bu yazı bulunamadı. Yeni yazı olarak devam edebilirsin.", "error");
      }
      applyFont();

      // ---- preview
      $("#previewBtn").addEventListener("click", () => {
        if (!$("#previewPane").hidden) { $("#previewPane").hidden = true; $("#editPane").hidden = false; $("#previewBtn").textContent = "Önizle"; return; }
        const cover = f.cover.value === "__upload" ? uploadURL : f.cover.value;
        const post = fieldsFrom(cover), fam = (FONTS[f.font.value] || FONTS.default).family;
        $("#previewPane").innerHTML = `<span class="chip">${esc(post.category)}</span><h1 style="font-family:${fam}">${esc(post.title)}</h1>${meta(post, true)}
          ${cover ? `<div class="pv-cover"><img src="${esc(cover)}" alt=""></div>` : ""}<div class="prose" style="font-family:${fam}">${sanitize(ed.innerHTML, true) || '<p class="hint">Henüz içerik yok.</p>'}</div>`;
        $("#previewPane").hidden = false; $("#editPane").hidden = true; $("#previewBtn").textContent = "Düzenle";
        window.scrollTo({ top: 0 });
      });

      // ---- publish / save
      $("#publishBtn").addEventListener("click", async () => {
        const btn = $("#publishBtn");
        if (!f.title.value.trim()) { say("Önce bir başlık yaz.", "error"); f.title.focus(); return; }
        if (!textOf() && !hasMedia()) { say("Yazının içeriği boş.", "error"); ed.focus(); return; }
        if (f.cover.value === "__upload" && !uploadFile) { say("Yüklemek için bir fotoğraf seç.", "error"); return; }
        btn.disabled = true; say(editing ? "Kaydediliyor…" : "Yayınlanıyor…");
        try {
          let coverPath = f.cover.value;
          if (coverPath === "__upload") {
            const ext = (uploadFile.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
            coverPath = "assets/" + (slug(f.title.value) || "kapak") + "-" + Date.now() + "." + ext;
            await gh(`/repos/${SITE.repo}/contents/${coverPath}`, { method: "PUT", body: JSON.stringify({ message: "Add cover: " + f.title.value, content: await fileToB64(uploadFile) }) });
          }
          const remote = await loadRemotePosts();
          const data = fieldsFrom(coverPath);
          let post;
          if (editing) {
            const i = remote.posts.findIndex((p) => p.id === editing.id);
            if (i < 0) throw new Error("Bu yazı artık sitede yok (silinmiş olabilir).");
            post = { ...remote.posts[i], ...data };
            if (!post.font) delete post.font;
            remote.posts[i] = post;
            await saveRemotePosts(remote, remote.posts, "Edit post: " + post.title);
          } else {
            post = { id: uniqueId(slug(f.title.value), remote.posts), ...data };
            await saveRemotePosts(remote, [post, ...remote.posts], "New post: " + post.title);
            POSTS.push(post);
          }
          try { localStorage.removeItem("aeronotes_draft"); } catch {}
          say(`✓ <b>${editing ? "Kaydedildi!" : "Yayınlandı!"}</b> 1–2 dakika içinde sitede görünür → <a href="post.html?id=${encodeURIComponent(post.id)}">yazıyı aç</a> · <a href="manage.html">Yazılarım</a>`, "ok");
          if (!editing) { f.title.value = ""; ed.innerHTML = ""; f.excerpt.value = ""; }
          window.scrollTo({ top: 0 });
        } catch (err) {
          say((editing ? "Kaydedilemedi: " : "Yayınlanamadı: ") + esc(err.message), "error");
          if (/bad credentials/i.test(err.message)) auth.clear();
        } finally { btn.disabled = false; }
      });

      if (editing) return; // drafts are only for new posts

      // ---- keep an unsent draft in this browser
      try {
        const d = JSON.parse(localStorage.getItem("aeronotes_draft") || "null");
        if (d) {
          ["title", "excerpt", "category", "font"].forEach((k) => d[k] && (f[k].value = d[k]));
          if (d.cover && d.cover !== "__upload") f.cover.value = d.cover;
          if (d.html) ed.innerHTML = toEditorHTML({ format: "html", content: d.html });
          applyFont();
        }
      } catch {}
      let timer;
      const saveDraft = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            localStorage.setItem("aeronotes_draft", JSON.stringify({ title: f.title.value, excerpt: f.excerpt.value, category: f.category.value, font: f.font.value, cover: f.cover.value, html: sanitize(ed.innerHTML) }));
            $("#saveState").textContent = "✓ Taslak kaydedildi";
          } catch {}
        }, 500);
      };
      f.addEventListener("input", saveDraft);
      f.addEventListener("change", saveDraft);
      ed.addEventListener("input", saveDraft);
    },

    manage() {
      if (!auth.on) { location.replace("login.html"); return; }
      const list = $("#mList"), msg = $("#mMsg");
      const say = (text, kind) => { msg.className = "hint ed-msg" + (kind ? " " + kind : ""); msg.innerHTML = text; };
      const api = async (path, opts = {}) => {
        const r = await fetch(path, { ...opts, headers: { "content-type": "application/json", Authorization: "Bearer " + auth.get(), ...(opts.headers || {}) } });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(r.status === 401 ? "Oturum geçersiz, tekrar giriş yap." : d.error || "Hata " + r.status);
        return d;
      };
      let tab = "posts", allComments = null, posts = sorted.slice();
      const titleOf = (id) => (POSTS.find((p) => p.id === id) || {}).title || id;

      async function loadComments() {
        try {
          allComments = (await api("/api/comments?all=1")).comments || [];
          const n = allComments.filter((c) => c.status === "pending").length;
          $("#nPending").innerHTML = n ? `<span class="badge">${n}</span>` : "";
        } catch (err) { allComments = []; say("Yorumlar yüklenemedi: " + esc(err.message), "error"); }
      }

      function draw() {
        $("#tabs").querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
        if (tab === "posts") {
          list.innerHTML = posts.length ? posts.map((p) => `<div class="c-item m-post" data-id="${esc(p.id)}">
              <img src="${esc(p.cover)}" alt="">
              <div><b>${esc(p.title)}</b><div class="hint">${esc(p.category)} · ${formatDate(p.date)}</div>
              <div class="c-actions">
                <a class="btn ghost" href="post.html?id=${encodeURIComponent(p.id)}">Görüntüle</a>
                <a class="btn ghost" href="write.html?edit=${encodeURIComponent(p.id)}">✏️ Düzenle</a>
                <button class="btn danger" data-act="delpost">🗑 Sil</button>
              </div></div></div>`).join("") : '<p class="hint">Henüz yazı yok.</p>';
          return;
        }
        if (tab === "security") { drawSecurity(); return; }
        if (!allComments) { list.innerHTML = '<p class="hint">Yükleniyor…</p>'; return; }
        const items = allComments.filter((c) => c.status === tab);
        list.innerHTML = items.length ? items.map((c) => `<div class="c-item ${c.status}" data-cid="${c.id}">
            <div class="c-head"><span class="avatar">${esc(initials(c.name))}</span><b>${esc(c.name)}</b><span class="hint">${timeAgo(c.created_at)}</span></div>
            <div class="c-post">Yazı: <a href="post.html?id=${encodeURIComponent(c.post)}#comments">${esc(titleOf(c.post))}</a></div>
            <p>${esc(c.text).replace(/\n/g, "<br>")}</p>
            <div class="c-actions">${c.status === "pending" ? '<button class="btn" data-act="approve">✓ Onayla</button>' : ""}<button class="btn danger" data-act="delc">🗑 Sil</button></div>
          </div>`).join("") : `<p class="hint">${tab === "pending" ? "Bekleyen yorum yok 🎉" : "Henüz yayında yorum yok."}</p>`;
      }

      async function drawSecurity() {
        list.innerHTML = '<p class="hint">Yükleniyor…</p>';
        let on = false;
        try { on = !!(await (await fetch("/api/auth", { cache: "no-store" })).json()).twofa; }
        catch { list.innerHTML = '<p class="hint error">Güvenlik ayarları yüklenemedi.</p>'; return; }
        if (tab !== "security") return;
        list.innerHTML = on
          ? `<div class="c-item sec"><b>2 adımlı doğrulama: Açık ✅</b>
              <p class="hint">Girişte kullanıcı adı ve parolanın yanında Authenticator uygulamandaki 6 haneli kod da isteniyor.</p>
              <p class="hint">Telefonunu kaybedersen: giriş ekranında "Parolamı unuttum" adımlarıyla yeni GitHub anahtarı oluşturup gir, sonra buradan kapat.</p>
              <div class="c-actions"><button class="btn danger" id="tfOff">2 adımlı doğrulamayı kapat</button></div></div>`
          : `<div class="c-item sec"><b>2 adımlı doğrulama: Kapalı</b>
              <p class="hint">Açınca girişte telefonundaki Authenticator uygulamasının (Google Authenticator, Microsoft Authenticator vb.) ürettiği 6 haneli kod da istenir.</p>
              <div class="c-actions"><button class="btn" id="tfStart">Aç</button></div><div id="tfSetup"></div></div>`;
        const off = $("#tfOff"), start = $("#tfStart");
        if (off) off.onclick = async () => {
          if (!confirm("2 adımlı doğrulamayı kapatmak istediğine emin misin?")) return;
          off.disabled = true;
          try {
            const d = await api("/api/auth", { method: "POST", body: JSON.stringify({ action: "disable" }) });
            if (d.vault) await putAuthJson(d.vault, "Turn off two-step login");
            say("✓ Kapatıldı. 1–2 dakika içinde giriş sadece kullanıcı adı ve parolayla yapılır.", "ok"); drawSecurity();
          } catch (err) { say("Olmadı: " + esc(err.message), "error"); off.disabled = false; }
        };
        if (start) start.onclick = async () => {
          start.disabled = true;
          try {
            const d = await api("/api/auth", { method: "POST", body: JSON.stringify({ action: "setup" }) });
            $("#tfSetup").innerHTML = `<ol class="hint tf-steps">
                <li>Telefonuna <b>Google Authenticator</b> (ya da Microsoft Authenticator) kur.</li>
                <li>Bu telefondaysan: <a class="btn ghost" href="${esc(d.uri)}">Authenticator'a ekle</a><br>
                    <span id="tfQrLine" hidden>Bilgisayardaysan uygulamayla QR kodu okut: <span id="tfQr"></span></span>
                    Olmazsa uygulamada "Kurulum anahtarı gir" de ve şunu yaz: <code class="tf-secret">${esc(d.secret.replace(/(.{4})/g, "$1 ").trim())}</code></li>
                <li>Uygulamada çıkan 6 haneli kodu yaz:</li></ol>
              <div class="field"><input id="tfCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="123456"></div>
              <button class="btn" id="tfOk">Onayla ve aç</button>`;
            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js";
            s.onload = () => { try { const q = qrcode(0, "M"); q.addData(d.uri); q.make(); $("#tfQr").innerHTML = q.createSvgTag({ cellSize: 4, margin: 2 }); $("#tfQrLine").hidden = false; } catch {} };
            document.head.appendChild(s);
            $("#tfOk").onclick = async () => {
              const ok = $("#tfOk"); ok.disabled = true; say("Açılıyor…");
              try {
                const cur = await getAuthJson();
                if (!cur) throw new Error("auth.json bulunamadı.");
                await api("/api/auth", { method: "POST", body: JSON.stringify({ action: "enable", code: $("#tfCode").value, vault: cur.vault }) });
                // The key now lives only behind the code: remove the public copy.
                try { await gh(`/repos/${SITE.repo}/contents/auth.json`, { method: "DELETE", body: JSON.stringify({ message: "Two-step login on: remove public key vault", sha: cur.sha }) }); } catch {}
                say("✓ 2 adımlı doğrulama açıldı! Bir sonraki girişte kod istenecek.", "ok"); drawSecurity();
              } catch (err) { say("Olmadı: " + esc(err.message), "error"); ok.disabled = false; }
            };
          } catch (err) { say("Olmadı: " + esc(err.message), "error"); start.disabled = false; }
        };
      }

      $("#tabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; tab = b.dataset.tab; say(""); draw(); });

      list.addEventListener("click", async (e) => {
        const b = e.target.closest("button[data-act]"); if (!b) return;
        const act = b.dataset.act;
        try {
          if (act === "delpost") {
            const id = b.closest("[data-id]").dataset.id;
            if (!confirm(`"${titleOf(id)}" yazısını silmek istediğine emin misin?\n\nYazı sitede kaybolur. (Geçmiş GitHub'da kalır, gerekirse geri getirilebilir.)`)) return;
            b.disabled = true; say("Siliniyor…");
            const remote = await loadRemotePosts();
            const next = remote.posts.filter((p) => p.id !== id);
            if (next.length === remote.posts.length) throw new Error("Yazı zaten silinmiş.");
            await saveRemotePosts(remote, next, "Delete post: " + titleOf(id));
            posts = posts.filter((p) => p.id !== id);
            say("✓ Yazı silindi. 1–2 dakika içinde siteden kalkar.", "ok");
          } else {
            const cid = Number(b.closest("[data-cid]").dataset.cid);
            if (act === "delc" && !confirm("Bu yorumu silmek istediğine emin misin? Geri alınamaz.")) return;
            b.disabled = true;
            if (act === "approve") await api("/api/comments", { method: "PATCH", body: JSON.stringify({ id: cid }) });
            else await api("/api/comments?id=" + cid, { method: "DELETE" });
            say(act === "approve" ? "✓ Yorum onaylandı, artık sitede görünüyor." : "✓ Yorum silindi.", "ok");
            await loadComments();
          }
          draw();
        } catch (err) { say("Olmadı: " + esc(err.message), "error"); b.disabled = false; }
      });

      draw();
      loadComments().then(draw);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    $("#site-header").innerHTML = header(page);
    $("#site-footer").innerHTML = footer();
    $("#menuBtn").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
    const lo = $("#logoutBtn");
    if (lo) lo.addEventListener("click", () => { auth.clear(); location.href = "login.html"; });
    setupSearch();
    if (pages[page]) pages[page]();
  });

  window.AeroNotes = { md, ICONS, vaultSeal, vaultOpen };
})();
