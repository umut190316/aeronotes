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
    if (!res.ok) throw new Error(data.message || "GitHub error " + res.status);
    return data;
  }
  const b64decode = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  const b64encodeText = (s) => { let bin = ""; new TextEncoder().encode(s).forEach((b) => (bin += String.fromCharCode(b))); return btoa(bin); };
  const fileToB64 = (file) => new Promise((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = fail; r.readAsDataURL(file); });

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

    login() {
      if (auth.on) { location.replace("write.html"); return; }
      const f = $("#loginForm"), msg = $("#loginMsg");
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = f.token.value.trim();
        if (!token) return;
        msg.textContent = "Kontrol ediliyor…"; msg.className = "hint";
        auth.set(token);
        try {
          const repo = await gh("/repos/" + SITE.repo);
          if (!repo.permissions || !repo.permissions.push) throw new Error("Bu anahtarın siteye yazma izni yok.");
          location.replace("write.html");
        } catch (err) {
          auth.clear();
          msg.textContent = "Giriş başarısız: " + err.message; msg.className = "hint error";
        }
      });
    },

    write() {
      if (!auth.on) { location.replace("login.html"); return; }
      const f = $("#writeForm");
      f.category.innerHTML = CATEGORIES.map((c) => `<option>${esc(c)}</option>`).join("");
      const now = new Date();
      f.date.value = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const slug = (s) => s.toLowerCase().replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const update = () => {
        const words = f.content.value.trim().split(/\s+/).filter(Boolean).length;
        const post = {
          id: slug(f.title.value) || "new-post",
          title: f.title.value || "Untitled",
          excerpt: f.excerpt.value,
          category: f.category.value,
          date: f.date.value,
          readTime: Math.max(1, Math.round(words / 200)),
          cover: f.cover.value
        };
        $("#pvTitle").innerHTML = `<span class="chip">${esc(post.category)}</span><h1>${esc(post.title)}</h1>${meta(post, true)}`;
        $("#pvBody").innerHTML = md(f.content.value) || '<p class="hint">Preview appears here as you type.</p>';
        const fields = Object.entries(post).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join("\n");
        $("#code").textContent = `  {\n${fields}\n    content: \`\n${f.content.value.replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\n\`\n  },`;
      };
      f.addEventListener("input", update);
      f.addEventListener("change", update);

      $("#publishBtn").addEventListener("click", async () => {
        const btn = $("#publishBtn"), msg = $("#publishMsg");
        if (!f.title.value.trim() || !f.content.value.trim()) { msg.textContent = "Başlık ve içerik boş olamaz."; msg.className = "hint error"; return; }
        btn.disabled = true; msg.className = "hint"; msg.textContent = "Yayınlanıyor…";
        try {
          const file = f.coverFile.files[0];
          if (file) {
            const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
            const path = "assets/" + slug(f.title.value) + "-" + Date.now() + "." + ext;
            await gh(`/repos/${SITE.repo}/contents/${path}`, { method: "PUT", body: JSON.stringify({ message: "Add cover: " + f.title.value, content: await fileToB64(file) }) });
            f.cover.insertAdjacentHTML("beforeend", `<option value="${path}">${esc(file.name)}</option>`);
            f.cover.value = path; f.coverFile.value = ""; update();
          }
          const cur = await gh(`/repos/${SITE.repo}/contents/js/posts.js`);
          const text = b64decode(cur.content);
          const m = text.match(/const POSTS = \[\r?\n/);
          if (!m) throw new Error("posts.js beklenen formatta değil.");
          const at = m.index + m[0].length;
          const updated = text.slice(0, at) + $("#code").textContent + "\n" + text.slice(at);
          await gh(`/repos/${SITE.repo}/contents/js/posts.js`, { method: "PUT", body: JSON.stringify({ message: "New post: " + f.title.value, content: b64encodeText(updated), sha: cur.sha }) });
          const url = "post.html?id=" + encodeURIComponent(slug(f.title.value));
          msg.className = "hint ok";
          msg.innerHTML = `✓ Yayınlandı! 1–2 dakika içinde sitede görünür: <a href="${url}">yazıyı aç</a>`;
          try { localStorage.removeItem("aeronotes_draft"); } catch {}
        } catch (err) {
          msg.className = "hint error"; msg.textContent = "Yayınlanamadı: " + err.message;
          if (/bad credentials/i.test(err.message)) { auth.clear(); }
        } finally { btn.disabled = false; }
      });

      // keep an unsent draft in this browser
      const fields = ["title", "excerpt", "category", "cover", "content"];
      try { const d = JSON.parse(localStorage.getItem("aeronotes_draft") || "null"); if (d) fields.forEach((k) => d[k] && (f[k].value = d[k])); } catch {}
      f.addEventListener("input", () => { try { localStorage.setItem("aeronotes_draft", JSON.stringify(Object.fromEntries(fields.map((k) => [k, f[k].value])))); } catch {} });
      $("#copyBtn").addEventListener("click", async () => {
        try { await navigator.clipboard.writeText($("#code").textContent); $("#copyBtn").textContent = "Copied!"; }
        catch { $("#copyBtn").textContent = "Select & copy manually"; }
        setTimeout(() => ($("#copyBtn").textContent = "Copy code"), 1800);
      });
      if (SITE.repo) {
        const a = $("#ghLink");
        a.href = `https://github.com/${SITE.repo}/edit/main/js/posts.js`;
        a.hidden = false;
      }
      update();
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

  window.AeroNotes = { md, ICONS };
})();
