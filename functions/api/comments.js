import { clientIp } from "../../lib/clientip.js";
import { loadPosts } from "../../lib/seo.js";
import { isOffensive } from "../../lib/badwords.js";
/*
 * AeroNotes comment API (Cloudflare Pages Function + D1)
 *
 * Readers:  GET  /api/comments?post=<id>         → approved comments of a post (with parent_id for replies)
 *           POST /api/comments {post,name,text,parent?} → new comment or reply, published at once.
 *           Offensive words are refused (422, code "offensive"); comments with links wait for approval.
 *           Replies are one level deep, like Instagram: a reply to a reply hangs under the same top comment.
 *           If the author posts with their key, the comment is approved at once and marked as the author's.
 * Author:   GET    /api/comments?all=1           → recent comments incl. pending   (Authorization: Bearer <GitHub key>)
 *           PATCH  /api/comments {id}            → approve
 *           DELETE /api/comments?id=<id>         → delete
 */

const REPO = "umut190316/aeronotes";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

async function ensureTable(db) {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post TEXT NOT NULL, name TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', ip_hash TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))"
  );
  // Columns added later for replies; add them once on older databases.
  const cols = (await db.prepare("PRAGMA table_info(comments)").all()).results.map((c) => c.name);
  if (!cols.includes("parent_id")) await db.exec("ALTER TABLE comments ADD COLUMN parent_id INTEGER");
  if (!cols.includes("is_author")) await db.exec("ALTER TABLE comments ADD COLUMN is_author INTEGER NOT NULL DEFAULT 0");
}

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// The author proves who they are with the same GitHub key the site already uses.
async function isAuthor(request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const res = await fetch("https://api.github.com/repos/" + REPO, {
    headers: { Authorization: auth, Accept: "application/vnd.github+json", "User-Agent": "aeronotes-comments" }
  });
  if (!res.ok) return false;
  const repo = await res.json();
  return !!(repo.permissions && repo.permissions.push);
}

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ error: "Comments are not available right now." }, 500);
  const db = env.DB;
  await ensureTable(db);
  const url = new URL(request.url);

  if (request.method === "GET") {
    if (url.searchParams.has("all")) {
      if (!(await isAuthor(request))) return json({ error: "Unauthorized" }, 401);
      const { results } = await db.prepare("SELECT c.id, c.post, c.name, c.text, c.status, c.created_at, c.parent_id, c.is_author, p.name AS parent_name FROM comments c LEFT JOIN comments p ON p.id = c.parent_id ORDER BY c.status = 'pending' DESC, c.id DESC LIMIT 300").all();
      return json({ comments: results });
    }
    const post = (url.searchParams.get("post") || "").slice(0, 120);
    if (!post) return json({ comments: [] });
    const { results } = await db.prepare("SELECT id, name, text, created_at, parent_id, is_author FROM comments WHERE post = ? AND status = 'approved' ORDER BY id ASC").bind(post).all();
    return json({ comments: results });
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
    if (body.website) return json({ ok: true }); // honeypot: bots fill hidden field
    const post = String(body.post || "").trim().slice(0, 120);
    // Strip invisible and direction-changing characters (used to disguise names and links)
    const clean = (v) => String(v || "").normalize("NFC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, "");
    const name = clean(body.name).trim().replace(/\s+/g, " ");
    const text = clean(body.text).trim().replace(/\n{4,}/g, "\n\n\n");
    if (!post) return json({ error: "Article not found." }, 400);
    try {
      const posts = await loadPosts(env, request);
      if (posts.length && !posts.some((p) => p.id === post)) return json({ error: "Article not found." }, 400);
    } catch { /* if the check fails, still accept: comments are moderated anyway */ }
    if (name.length < 2 || name.length > 60) return json({ error: "Please enter your name (2–60 characters)." }, 400);
    if (text.length < 2 || text.length > 2000) return json({ error: "Your comment must be 2–2000 characters." }, 400);
    if (isOffensive(name) || isOffensive(text))
      return json({ error: "Please don't use offensive or insulting words. Your comment was not posted.", code: "offensive" }, 422);

    // Replies: attach to an approved comment of the same article (replies to replies go under the top comment)
    let parent = null;
    if (body.parent != null && body.parent !== "") {
      const pid = Number(body.parent);
      if (!Number.isInteger(pid)) return json({ error: "Invalid reply." }, 400);
      const row = await db.prepare("SELECT id, post, parent_id FROM comments WHERE id = ? AND status = 'approved'").bind(pid).first();
      if (!row || row.post !== post) return json({ error: "The comment you are replying to was not found." }, 400);
      parent = row.parent_id || row.id;
    }
    const author = request.headers.get("authorization") ? await isAuthor(request) : false;
    // Only the author may use the author's name (or look-alikes such as "admin")
    const fold = (v) => v.toLowerCase().replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    if (!author && /umutcan|bakirci|aeronotes|admin|moderator|dirtyairman/.test(fold(name)))
      return json({ error: "This name is reserved. Please use a different name." }, 400);

    const ipHash = await sha256(clientIp(request) + "|" + (env.IP_SALT || "aeronotes"));
    const recent = await db.prepare("SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')").bind(ipHash).first();
    if (recent && recent.n >= 5) return json({ error: "Too many comments in a short time. Please try again in a few minutes." }, 429);
    // Site-wide brake against spam floods (cannot be dodged by changing addresses)
    if (!author) {
      const all = await db.prepare("SELECT COUNT(*) AS n FROM comments WHERE is_author = 0 AND created_at > datetime('now', '-1 hour')").first();
      if (all && all.n >= 60) return json({ error: "Comments are busy right now. Please try again a bit later." }, 429);
    }

    // Published straight away; only comments with links are held for review (typical spam)
    const hasLink = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|xyz|top|info|io|ly)\b/i.test(text + " " + name);
    const publish = author || !hasLink;
    const res = await db.prepare("INSERT INTO comments (post, name, text, ip_hash, parent_id, is_author, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(post, name, text, ipHash, parent, author ? 1 : 0, publish ? "approved" : "pending").run();
    return json({ ok: true, approved: publish, id: res.meta && res.meta.last_row_id });
  }

  if (request.method === "PATCH" || request.method === "DELETE") {
    if (!(await isAuthor(request))) return json({ error: "Unauthorized" }, 401);
    let id;
    if (request.method === "PATCH") { try { id = Number((await request.json()).id); } catch {} }
    else id = Number(url.searchParams.get("id"));
    if (!Number.isInteger(id)) return json({ error: "Invalid comment." }, 400);
    if (request.method === "PATCH") await db.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
    else await db.prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?").bind(id, id).run();
    return json({ ok: true });
  }

  return json({ error: "Method not allowed." }, 405);
}
