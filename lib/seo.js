/*
 * Server-side helpers for SEO pages (used by Cloudflare Pages Functions).
 * Reads js/posts.js (the file the admin panel writes) without executing it.
 */

export const SITE_NAME = "AeroNotes";
export const SITE_TAGLINE = "A Student Blog on Aerospace & Space";
export const SITE_DESC = "AeroNotes is a student blog on aviation, space and aerospace engineering by Umutcan Bakırcı.";
export const AUTHOR = "Umutcan Bakırcı";
export const AUTHOR_URL = "https://www.linkedin.com/in/umutcanbak05";
export const DEFAULT_OG = "assets/og/default.jpg";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Parse the POSTS array written by postToCode() in js/main.js:
 *   {\n    key: <JSON>,\n ...    content: `...`\n  },
 * Template-literal escapes (\` \${ \\) are undone. */
export function parsePosts(text) {
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
    for (;;) {
      const nl = text.indexOf("\n", j);
      const line = text.slice(j, nl < 0 ? n : nl).replace(/\r$/, "");
      const m = line.match(/^\s+([A-Za-z_$][\w$]*):\s*(.*)$/);
      if (!m) { j = nl + 1; if (/^\s*\},?\s*$/.test(line)) break; if (nl < 0) break; continue; }
      if (m[1] === "content" && m[2].startsWith("`")) {
        let k = j + line.indexOf("`") + 1, out = "";
        while (k < n) {
          const c = text[k];
          if (c === "\\") { out += text[k + 1] ?? ""; k += 2; continue; }
          if (c === "`") break;
          out += c; k++;
        }
        post.content = out;
        j = text.indexOf("\n", k) + 1;
        continue;
      }
      try { post[m[1]] = JSON.parse(m[2].replace(/,\s*$/, "")); } catch { /* ignore odd line */ }
      j = nl + 1;
    }
    if (post.id) posts.push(post);
    i = j;
  }
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export async function loadPosts(env, request) {
  const res = await env.ASSETS.fetch(new URL("/js/posts.js", request.url));
  if (!res.ok) return [];
  return parsePosts(await res.text());
}

export const siteOrigin = (env, request) => (env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");
export const postPath = (id) => "/article/" + encodeURIComponent(id);
export const absUrl = (origin, path) => (/^https?:/i.test(path) ? path : origin + "/" + String(path).replace(/^\/+/, ""));
export const ogImageOf = (p) => p.ogImage || DEFAULT_OG;

/* Plain text of an article (works for Markdown and for the editor's HTML). */
export function plainText(content) {
  return String(content || "")
    .replace(/<\/(p|h2|h3|li|blockquote|figcaption)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* <head> tags for a page. */
export function headTags({ title, description, url, image, type = "website", extra = "" }) {
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

/* Simple, crawlable list of article links (the page script replaces it with the full cards). */
export function articleListHTML(posts, limit = 0) {
  const list = limit ? posts.slice(0, limit) : posts;
  return `<ul class="seo-list">${list
    .map((p) => `<li><a href="${postPath(p.id)}"><b>${esc(p.title)}</b></a> <span>${esc(p.category || "")} · ${esc(p.date || "")}</span><p>${esc(p.excerpt || "")}</p></li>`)
    .join("")}</ul>`;
}

export const setText = (text) => ({ element(el) { el.setInnerContent(text); } });
export const setAttr = (name, value) => ({ element(el) { el.setAttribute(name, value); } });
export const appendHead = (html) => ({ element(el) { el.append(html, { html: true }); } });
export const setHTML = (html) => ({ element(el) { el.setInnerContent(html, { html: true }); } });
