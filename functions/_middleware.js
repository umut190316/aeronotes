/*
 * AeroNotes SEO layer (Cloudflare Pages middleware).
 *
 *  /article/<id>         → post page with title, description, canonical, Open Graph,
 *                          JSON-LD and the article text already in the HTML
 *  /post.html?id=<id>    → 301 to /article/<id> (old links keep working)
 *  /, /articles, /about  → same pages with meta tags and a crawlable article list
 *  /sitemap.xml          → all pages and articles, rebuilt from js/posts.js on every request
 *  /robots.txt           → crawl rules + sitemap location
 *
 * Everything is generated from js/posts.js, so publishing from the admin panel
 * updates all of it automatically.
 */
import {
  SITE_NAME, SITE_TAGLINE, SITE_DESC, AUTHOR, AUTHOR_URL, DEFAULT_OG,
  esc, loadPosts, siteOrigin, postPath, absUrl, ogImageOf, plainText, headTags, articleListHTML,
  setText, setAttr, appendHead, setHTML
} from "../lib/seo.js";

const HTML_HEADERS = { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" };

async function asset(env, request, path) {
  let url = new URL(path, request.url);
  for (let hop = 0; hop < 3; hop++) {
    const res = await env.ASSETS.fetch(new Request(url, { headers: request.headers }));
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) { url = new URL(res.headers.get("location"), url); continue; }
    return res;
  }
  return env.ASSETS.fetch(url);
}

function isoDate(d) { return /^\d{4}-\d{2}-\d{2}/.test(String(d || "")) ? String(d).slice(0, 10) : undefined; }

async function articlePage(context, id) {
  const { request, env } = context;
  const posts = await loadPosts(env, request);
  const p = posts.find((x) => x.id === id);
  const page = await asset(env, request, "/post.html");
  const origin = siteOrigin(env, request);
  const rw = new HTMLRewriter().on("head", { element(el) { el.prepend('<base href="/">', { html: true }); } });

  if (!p) {
    return new Response(
      rw.on("title", setText("Article not found · " + SITE_NAME))
        .on("head", appendHead('<meta name="robots" content="noindex">'))
        .transform(page).body,
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
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;

  const body = `<article class="container seo-article">
<p><a href="/articles?category=${encodeURIComponent(p.category || "")}">${esc(p.category || "")}</a></p>
<h1>${esc(p.title)}</h1>
<p>By ${esc(AUTHOR)} · <time datetime="${esc(isoDate(p.date) || "")}">${esc(p.date || "")}</time>${p.readTime ? ` · ${esc(p.readTime)} min read` : ""}</p>
<img src="${esc(p.cover || "")}" alt="${esc(p.title)}">
<p><strong>${esc(p.excerpt || "")}</strong></p>
${text.split(/\n\s*\n/).map((para) => `<p>${esc(para.trim())}</p>`).join("\n")}
</article>`;

  return new Response(
    rw.on("title", setText(p.title + " · " + SITE_NAME))
      .on('meta[name="description"]', setAttr("content", description))
      .on("head", appendHead(headTags({ title: p.title, description, url, image, type: "article", extra })))
      .on("main#post", setHTML(body))
      .transform(page).body,
    { status: 200, headers: HTML_HEADERS }
  );
}

async function listingPage(context, path, opts) {
  const { request, env } = context;
  const res = await context.next();
  if (!(res.headers.get("content-type") || "").includes("text/html")) return res;
  const origin = siteOrigin(env, request);
  const posts = opts.list ? await loadPosts(env, request) : [];
  let rw = new HTMLRewriter()
    .on('meta[name="description"]', setAttr("content", opts.description))
    .on("head", appendHead(headTags({ title: opts.title, description: opts.description, url: origin + path, image: absUrl(origin, DEFAULT_OG) })));
  if (opts.list) rw = rw.on(opts.list, setHTML(articleListHTML(posts, opts.limit || 0)));
  const out = rw.transform(res);
  const headers = new Headers(out.headers);
  headers.set("cache-control", HTML_HEADERS["cache-control"]);
  return new Response(out.body, { status: out.status, headers });
}

async function sitemap(context) {
  const { request, env } = context;
  const origin = siteOrigin(env, request);
  const posts = await loadPosts(env, request);
  const newest = posts.map((p) => isoDate(p.updated) || isoDate(p.date)).filter(Boolean).sort().pop();
  const urls = [
    { loc: origin + "/", lastmod: newest },
    { loc: origin + "/articles", lastmod: newest },
    { loc: origin + "/about" },
    { loc: origin + "/quiz" },
    { loc: origin + "/flashcards" },
    ...posts.map((p) => ({ loc: origin + postPath(p.id), lastmod: isoDate(p.updated) || isoDate(p.date), image: absUrl(origin, p.cover || ogImageOf(p)), title: p.title }))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}${u.image ? `<image:image><image:loc>${esc(u.image)}</image:loc><image:title>${esc(u.title)}</image:title></image:image>` : ""}</url>`).join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
}

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

export async function onRequest(context) {
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
      return await listingPage(context, "/", { title: SITE_NAME + " · " + SITE_TAGLINE, description: SITE_DESC, list: "#latest", limit: 6 });
    if (path === "/articles" || path === "/articles.html")
      return await listingPage(context, "/articles", { title: "All Articles · " + SITE_NAME, description: "Every AeroNotes article on aviation, space, engines, history and aerospace technology.", list: "#grid" });
    if (path === "/quiz" || path === "/quiz.html")
      return await listingPage(context, "/quiz", { title: "Aviation & Space Quiz · " + SITE_NAME, description: "Test your aviation and space knowledge: 10 random questions per round from a bank of more than 1,500 on airports, airlines, aircraft, space missions and aerospace history." });
    if (path === "/flashcards" || path === "/flashcards.html")
      return await listingPage(context, "/flashcards", { title: "Aerospace Flashcards · " + SITE_NAME, description: "Learn nearly 200 key aerospace terms with flip cards: aerodynamics, controls, propulsion, structures, operations, avionics and space." });
    if (path === "/about" || path === "/about.html")
      return await listingPage(context, "/about", { title: "About · " + SITE_NAME, description: "About " + AUTHOR + ", the aerospace engineering student behind " + SITE_NAME + "." });
  } catch (err) {
    // Never take the site down because of the SEO layer.
    console.error("seo middleware:", err && err.stack || err);
  }
  return context.next();
}
