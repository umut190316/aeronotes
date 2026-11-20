var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-YjnmtB/functionsWorker-0.42899818190961203.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var REPO = "umut190316/aeronotes";
var ISSUER = "AeroNotes";
var json = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
}), "json");
async function ensureTables(db) {
  await db.exec("CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
  await db.exec("CREATE TABLE IF NOT EXISTS auth_fails (ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))");
}
__name(ensureTables, "ensureTables");
__name2(ensureTables, "ensureTables");
var getSetting = /* @__PURE__ */ __name2(async (db, k) => (await db.prepare("SELECT v FROM settings WHERE k = ?").bind(k).first())?.v ?? null, "getSetting");
var setSetting = /* @__PURE__ */ __name2((db, k, v) => db.prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(k, v).run(), "setSetting");
var delSetting = /* @__PURE__ */ __name2((db, k) => db.prepare("DELETE FROM settings WHERE k = ?").bind(k).run(), "delSetting");
async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
__name2(sha256, "sha256");
async function isAuthor(request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const res = await fetch("https://api.github.com/repos/" + REPO, {
    headers: { Authorization: auth, Accept: "application/vnd.github+json", "User-Agent": "aeronotes-auth" }
  });
  if (!res.ok) return false;
  const repo = await res.json();
  return !!(repo.permissions && repo.permissions.push);
}
__name(isAuthor, "isAuthor");
__name2(isAuthor, "isAuthor");
var B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function b32encode(bytes) {
  let bits = 0, val = 0, out = "";
  for (const b of bytes) {
    val = val << 8 | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[val >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[val << 5 - bits & 31];
  return out;
}
__name(b32encode, "b32encode");
__name2(b32encode, "b32encode");
function b32decode(s) {
  let bits = 0, val = 0;
  const out = [];
  for (const c of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(c);
    if (i < 0) continue;
    val = val << 5 | i;
    bits += 5;
    if (bits >= 8) {
      out.push(val >>> bits - 8 & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}
__name(b32decode, "b32decode");
__name2(b32decode, "b32decode");
async function totp(secret, step) {
  const key = await crypto.subtle.importKey("raw", b32decode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const msg = new ArrayBuffer(8);
  const view = new DataView(msg);
  view.setUint32(0, Math.floor(step / 2 ** 32));
  view.setUint32(4, step >>> 0);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const o = h[19] & 15;
  const n = (h[o] & 127) << 24 | h[o + 1] << 16 | h[o + 2] << 8 | h[o + 3];
  return String(n % 1e6).padStart(6, "0");
}
__name(totp, "totp");
__name2(totp, "totp");
async function checkCode(secret, code) {
  code = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const now = Math.floor(Date.now() / 3e4);
  for (const d of [-1, 0, 1]) if (await totp(secret, now + d) === code) return true;
  return false;
}
__name(checkCode, "checkCode");
__name2(checkCode, "checkCode");
var validVault = /* @__PURE__ */ __name2((v) => v && typeof v === "object" && typeof v.salt === "string" && typeof v.iv === "string" && typeof v.data === "string", "validVault");
async function onRequest({ request, env }) {
  if (!env.DB) return json({ error: "Not available right now." }, 500);
  const db = env.DB;
  await ensureTables(db);
  const enabled = !!await getSetting(db, "totp_secret") && !!await getSetting(db, "vault");
  if (request.method === "GET") return json({ twofa: enabled });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const action = body.action;
  if (action === "vault") {
    if (!enabled) return json({ error: "2FA is off." }, 400);
    const ipHash = await sha256((request.headers.get("cf-connecting-ip") || "unknown") + "|aeronotes-auth");
    await db.prepare("DELETE FROM auth_fails WHERE created_at < datetime('now', '-1 day')").run();
    const fails = await db.prepare("SELECT COUNT(*) AS n FROM auth_fails WHERE ip_hash = ? AND created_at > datetime('now', '-15 minutes')").bind(ipHash).first();
    if (fails && fails.n >= 5) return json({ error: "\xC7ok fazla hatal\u0131 deneme. 15 dakika sonra tekrar dene." }, 429);
    if (!await checkCode(await getSetting(db, "totp_secret"), body.code)) {
      await db.prepare("INSERT INTO auth_fails (ip_hash) VALUES (?)").bind(ipHash).run();
      return json({ error: "Do\u011Frulama kodu yanl\u0131\u015F." }, 401);
    }
    return json({ vault: JSON.parse(await getSetting(db, "vault")) });
  }
  if (!await isAuthor(request)) return json({ error: "Unauthorized" }, 401);
  if (action === "setup") {
    const secret = b32encode(crypto.getRandomValues(new Uint8Array(20)));
    await setSetting(db, "totp_pending", secret);
    const uri = `otpauth://totp/${encodeURIComponent(ISSUER + ":Author")}?secret=${secret}&issuer=${encodeURIComponent(ISSUER)}&algorithm=SHA1&digits=6&period=30`;
    return json({ secret, uri });
  }
  if (action === "enable") {
    const pending = await getSetting(db, "totp_pending");
    if (!pending) return json({ error: "\xD6nce kurulumu ba\u015Flat." }, 400);
    if (!validVault(body.vault)) return json({ error: "Ge\xE7ersiz anahtar kasas\u0131." }, 400);
    if (!await checkCode(pending, body.code)) return json({ error: "Kod yanl\u0131\u015F. Uygulamadaki g\xFCncel kodu yaz." }, 400);
    await setSetting(db, "vault", JSON.stringify(body.vault));
    await setSetting(db, "totp_secret", pending);
    await delSetting(db, "totp_pending");
    return json({ ok: true });
  }
  if (action === "save") {
    if (!validVault(body.vault)) return json({ error: "Ge\xE7ersiz anahtar kasas\u0131." }, 400);
    await setSetting(db, "vault", JSON.stringify(body.vault));
    return json({ ok: true });
  }
  if (action === "disable") {
    const vault = await getSetting(db, "vault");
    await delSetting(db, "totp_secret");
    await delSetting(db, "totp_pending");
    return json({ ok: true, vault: vault ? JSON.parse(vault) : null });
  }
  return json({ error: "Unknown action." }, 400);
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
var REPO2 = "umut190316/aeronotes";
var json2 = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
}), "json");
async function ensureTable(db) {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post TEXT NOT NULL, name TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', ip_hash TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))"
  );
}
__name(ensureTable, "ensureTable");
__name2(ensureTable, "ensureTable");
async function sha2562(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha2562, "sha2562");
__name2(sha2562, "sha256");
async function isAuthor2(request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const res = await fetch("https://api.github.com/repos/" + REPO2, {
    headers: { Authorization: auth, Accept: "application/vnd.github+json", "User-Agent": "aeronotes-comments" }
  });
  if (!res.ok) return false;
  const repo = await res.json();
  return !!(repo.permissions && repo.permissions.push);
}
__name(isAuthor2, "isAuthor2");
__name2(isAuthor2, "isAuthor");
async function onRequest2({ request, env }) {
  if (!env.DB) return json2({ error: "Comments are not available right now." }, 500);
  const db = env.DB;
  await ensureTable(db);
  const url = new URL(request.url);
  if (request.method === "GET") {
    if (url.searchParams.has("all")) {
      if (!await isAuthor2(request)) return json2({ error: "Unauthorized" }, 401);
      const { results: results2 } = await db.prepare("SELECT id, post, name, text, status, created_at FROM comments ORDER BY status = 'pending' DESC, id DESC LIMIT 200").all();
      return json2({ comments: results2 });
    }
    const post = (url.searchParams.get("post") || "").slice(0, 120);
    if (!post) return json2({ comments: [] });
    const { results } = await db.prepare("SELECT id, name, text, created_at FROM comments WHERE post = ? AND status = 'approved' ORDER BY id ASC").bind(post).all();
    return json2({ comments: results });
  }
  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json2({ error: "Invalid request." }, 400);
    }
    if (body.website) return json2({ ok: true });
    const post = String(body.post || "").trim().slice(0, 120);
    const name = String(body.name || "").trim().replace(/\s+/g, " ");
    const text = String(body.text || "").trim();
    if (!post) return json2({ error: "Article not found." }, 400);
    if (name.length < 2 || name.length > 60) return json2({ error: "Please enter your name (2\u201360 characters)." }, 400);
    if (text.length < 2 || text.length > 2e3) return json2({ error: "Your comment must be 2\u20132000 characters." }, 400);
    const ipHash = await sha2562((request.headers.get("cf-connecting-ip") || "unknown") + "|aeronotes");
    const recent = await db.prepare("SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')").bind(ipHash).first();
    if (recent && recent.n >= 5) return json2({ error: "Too many comments in a short time. Please try again in a few minutes." }, 429);
    await db.prepare("INSERT INTO comments (post, name, text, ip_hash) VALUES (?, ?, ?, ?)").bind(post, name, text, ipHash).run();
    return json2({ ok: true });
  }
  if (request.method === "PATCH" || request.method === "DELETE") {
    if (!await isAuthor2(request)) return json2({ error: "Unauthorized" }, 401);
    let id;
    if (request.method === "PATCH") {
      try {
        id = Number((await request.json()).id);
      } catch {
      }
    } else id = Number(url.searchParams.get("id"));
    if (!Number.isInteger(id)) return json2({ error: "Invalid comment." }, 400);
    if (request.method === "PATCH") await db.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
    else await db.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    return json2({ ok: true });
  }
  return json2({ error: "Method not allowed." }, 405);
}
__name(onRequest2, "onRequest2");
__name2(onRequest2, "onRequest");
var SITE_NAME = "AeroNotes";
var SITE_TAGLINE = "A Student Blog on Aerospace & Space";
var SITE_DESC = "AeroNotes is a student blog on aviation, space and aerospace engineering by Umutcan Bak\u0131rc\u0131.";
var AUTHOR = "Umutcan Bak\u0131rc\u0131";
var AUTHOR_URL = "https://www.linkedin.com/in/umutcanbak05";
var DEFAULT_OG = "assets/og/default.jpg";
var esc = /* @__PURE__ */ __name2((s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), "esc");
function parsePosts(text) {
  const start = text.search(/const POSTS = \[\r?\n/);
  if (start < 0) return [];
  const posts = [];
  let i = text.indexOf("\n", start) + 1;
  const n = text.length;
  while (i < n) {
    const open = text.indexOf("  {", i);
    if (open < 0) break;
    const end = text.indexOf("\n];", i);
    if (end >= 0 && end < open) break;
    const post = {};
    let j = text.indexOf("\n", open) + 1;
    for (; ; ) {
      const nl = text.indexOf("\n", j);
      const line = text.slice(j, nl < 0 ? n : nl).replace(/\r$/, "");
      const m = line.match(/^\s+([A-Za-z_$][\w$]*):\s*(.*)$/);
      if (!m) {
        j = nl + 1;
        if (/^\s*\},?\s*$/.test(line)) break;
        if (nl < 0) break;
        continue;
      }
      if (m[1] === "content" && m[2].startsWith("`")) {
        let k = j + line.indexOf("`") + 1, out = "";
        while (k < n) {
          const c = text[k];
          if (c === "\\") {
            out += text[k + 1] ?? "";
            k += 2;
            continue;
          }
          if (c === "`") break;
          out += c;
          k++;
        }
        post.content = out;
        j = text.indexOf("\n", k) + 1;
        continue;
      }
      try {
        post[m[1]] = JSON.parse(m[2].replace(/,\s*$/, ""));
      } catch {
      }
      j = nl + 1;
    }
    if (post.id) posts.push(post);
    i = j;
  }
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
__name(parsePosts, "parsePosts");
__name2(parsePosts, "parsePosts");
async function loadPosts(env, request) {
  const res = await env.ASSETS.fetch(new URL("/js/posts.js", request.url));
  if (!res.ok) return [];
  return parsePosts(await res.text());
}
__name(loadPosts, "loadPosts");
__name2(loadPosts, "loadPosts");
var siteOrigin = /* @__PURE__ */ __name2((env, request) => (env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, ""), "siteOrigin");
var postPath = /* @__PURE__ */ __name2((id) => "/article/" + encodeURIComponent(id), "postPath");
var absUrl = /* @__PURE__ */ __name2((origin, path) => /^https?:/i.test(path) ? path : origin + "/" + String(path).replace(/^\/+/, ""), "absUrl");
var ogImageOf = /* @__PURE__ */ __name2((p) => p.ogImage || DEFAULT_OG, "ogImageOf");
function plainText(content) {
  return String(content || "").replace(/<\/(p|h2|h3|li|blockquote|figcaption)>/gi, "\n\n").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/^#{1,6}\s+/gm, "").replace(/^>\s?/gm, "").replace(/[*_`]/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
}
__name(plainText, "plainText");
__name2(plainText, "plainText");
function headTags({ title, description, url, image, type = "website", extra = "" }) {
  return `
<link rel="canonical" href="${esc(url)}">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:type" content="${esc(type)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
${extra}`;
}
__name(headTags, "headTags");
__name2(headTags, "headTags");
function articleListHTML(posts, limit = 0) {
  const list = limit ? posts.slice(0, limit) : posts;
  return `<ul class="seo-list">${list.map((p) => `<li><a href="${postPath(p.id)}"><b>${esc(p.title)}</b></a> <span>${esc(p.category || "")} \xB7 ${esc(p.date || "")}</span><p>${esc(p.excerpt || "")}</p></li>`).join("")}</ul>`;
}
__name(articleListHTML, "articleListHTML");
__name2(articleListHTML, "articleListHTML");
var setText = /* @__PURE__ */ __name2((text) => ({ element(el) {
  el.setInnerContent(text);
} }), "setText");
var setAttr = /* @__PURE__ */ __name2((name, value) => ({ element(el) {
  el.setAttribute(name, value);
} }), "setAttr");
var appendHead = /* @__PURE__ */ __name2((html) => ({ element(el) {
  el.append(html, { html: true });
} }), "appendHead");
var setHTML = /* @__PURE__ */ __name2((html) => ({ element(el) {
  el.setInnerContent(html, { html: true });
} }), "setHTML");
var HTML_HEADERS = { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" };
async function asset(env, request, path) {
  let url = new URL(path, request.url);
  for (let hop = 0; hop < 3; hop++) {
    const res = await env.ASSETS.fetch(new Request(url, { headers: request.headers }));
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location"), url);
      continue;
    }
    return res;
  }
  return env.ASSETS.fetch(url);
}
__name(asset, "asset");
__name2(asset, "asset");
function isoDate(d) {
  return /^\d{4}-\d{2}-\d{2}/.test(String(d || "")) ? String(d).slice(0, 10) : void 0;
}
__name(isoDate, "isoDate");
__name2(isoDate, "isoDate");
async function articlePage(context, id) {
  const { request, env } = context;
  const posts = await loadPosts(env, request);
  const p = posts.find((x) => x.id === id);
  const page = await asset(env, request, "/post.html");
  const origin = siteOrigin(env, request);
  const rw = new HTMLRewriter().on("head", { element(el) {
    el.prepend('<base href="/">', { html: true });
  } });
  if (!p) {
    return new Response(
      rw.on("title", setText("Article not found \xB7 " + SITE_NAME)).on("head", appendHead('<meta name="robots" content="noindex">')).transform(page).body,
      { status: 404, headers: HTML_HEADERS }
    );
  }
  const url = origin + postPath(p.id);
  const image = absUrl(origin, ogImageOf(p));
  const text = plainText(p.content);
  const description = (p.excerpt || text.slice(0, 160)).trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description,
    image: [image],
    datePublished: isoDate(p.date),
    dateModified: isoDate(p.updated) || isoDate(p.date),
    author: { "@type": "Person", name: AUTHOR, url: AUTHOR_URL },
    publisher: { "@type": "Person", name: AUTHOR, url: AUTHOR_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: p.category,
    wordCount: words,
    inLanguage: "en"
  };
  const extra = `
<meta property="article:published_time" content="${esc(isoDate(p.date) || "")}">
${p.updated ? `<meta property="article:modified_time" content="${esc(isoDate(p.updated))}">` : ""}
<meta property="article:section" content="${esc(p.category || "")}">
<meta property="article:author" content="${esc(AUTHOR_URL)}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}<\/script>`;
  const body = `<article class="container seo-article">
<p><a href="/articles?category=${encodeURIComponent(p.category || "")}">${esc(p.category || "")}</a></p>
<h1>${esc(p.title)}</h1>
<p>By ${esc(AUTHOR)} \xB7 <time datetime="${esc(isoDate(p.date) || "")}">${esc(p.date || "")}</time>${p.readTime ? ` \xB7 ${esc(p.readTime)} min read` : ""}</p>
<img src="${esc(p.cover || "")}" alt="${esc(p.title)}">
<p><strong>${esc(p.excerpt || "")}</strong></p>
${text.split(/\n\s*\n/).map((para) => `<p>${esc(para.trim())}</p>`).join("\n")}
</article>`;
  return new Response(
    rw.on("title", setText(p.title + " \xB7 " + SITE_NAME)).on('meta[name="description"]', setAttr("content", description)).on("head", appendHead(headTags({ title: p.title, description, url, image, type: "article", extra }))).on("main#post", setHTML(body)).transform(page).body,
    { status: 200, headers: HTML_HEADERS }
  );
}
__name(articlePage, "articlePage");
__name2(articlePage, "articlePage");
async function listingPage(context, path, opts) {
  const { request, env } = context;
  const res = await context.next();
  if (!(res.headers.get("content-type") || "").includes("text/html")) return res;
  const origin = siteOrigin(env, request);
  const posts = opts.list ? await loadPosts(env, request) : [];
  let rw = new HTMLRewriter().on('meta[name="description"]', setAttr("content", opts.description)).on("head", appendHead(headTags({ title: opts.title, description: opts.description, url: origin + path, image: absUrl(origin, DEFAULT_OG) })));
  if (opts.list) rw = rw.on(opts.list, setHTML(articleListHTML(posts, opts.limit || 0)));
  const out = rw.transform(res);
  const headers = new Headers(out.headers);
  headers.set("cache-control", HTML_HEADERS["cache-control"]);
  return new Response(out.body, { status: out.status, headers });
}
__name(listingPage, "listingPage");
__name2(listingPage, "listingPage");
async function sitemap(context) {
  const { request, env } = context;
  const origin = siteOrigin(env, request);
  const posts = await loadPosts(env, request);
  const newest = posts.map((p) => isoDate(p.updated) || isoDate(p.date)).filter(Boolean).sort().pop();
  const urls = [
    { loc: origin + "/", lastmod: newest },
    { loc: origin + "/articles", lastmod: newest },
    { loc: origin + "/about" },
    ...posts.map((p) => ({ loc: origin + postPath(p.id), lastmod: isoDate(p.updated) || isoDate(p.date), image: absUrl(origin, p.cover || ogImageOf(p)), title: p.title }))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}${u.image ? `<image:image><image:loc>${esc(u.image)}</image:loc><image:title>${esc(u.title)}</image:title></image:image>` : ""}</url>`).join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
}
__name(sitemap, "sitemap");
__name2(sitemap, "sitemap");
function robots(context) {
  const origin = siteOrigin(context.env, context.request);
  const txt = `User-agent: *
Allow: /
Disallow: /login
Disallow: /write
Disallow: /manage
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;
  return new Response(txt, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
__name(robots, "robots");
__name2(robots, "robots");
async function onRequest3(context) {
  const { request } = context;
  if (request.method !== "GET" && request.method !== "HEAD") return context.next();
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  try {
    if (path.startsWith("/api/")) return context.next();
    const m = path.match(/^\/article\/([^/]+)$/);
    if (m) return await articlePage(context, decodeURIComponent(m[1]));
    if (path === "/post.html" || path === "/post") {
      const id = url.searchParams.get("id");
      if (id) return Response.redirect(new URL(postPath(id) + url.hash, url).toString(), 301);
      return context.next();
    }
    if (path === "/sitemap.xml") return await sitemap(context);
    if (path === "/robots.txt") return robots(context);
    if (path === "/" || path === "/index.html" || path === "/index")
      return await listingPage(context, "/", { title: SITE_NAME + " \xB7 " + SITE_TAGLINE, description: SITE_DESC, list: "#latest", limit: 6 });
    if (path === "/articles" || path === "/articles.html")
      return await listingPage(context, "/articles", { title: "All Articles \xB7 " + SITE_NAME, description: "Every AeroNotes article on aviation, space, engines, history and aerospace technology.", list: "#grid" });
    if (path === "/about" || path === "/about.html")
      return await listingPage(context, "/about", { title: "About \xB7 " + SITE_NAME, description: "About " + AUTHOR + ", the aerospace engineering student behind " + SITE_NAME + "." });
  } catch (err) {
    console.error("seo middleware:", err && err.stack || err);
  }
  return context.next();
}
__name(onRequest3, "onRequest3");
__name2(onRequest3, "onRequest");
var routes = [
  {
    routePath: "/api/auth",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/comments",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest3],
    modules: []
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
__name2(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../tmp/wr/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../tmp/wr/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-PaWjeW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../tmp/wr/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-PaWjeW/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.42899818190961203.js.map
