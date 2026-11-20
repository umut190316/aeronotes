/*
 * AeroNotes comment API (Cloudflare Pages Function + D1)
 *
 * Readers:  GET  /api/comments?post=<id>         → approved comments of a post
 *           POST /api/comments {post,name,text}  → new comment (waits for approval)
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
      const { results } = await db.prepare("SELECT id, post, name, text, status, created_at FROM comments ORDER BY status = 'pending' DESC, id DESC LIMIT 200").all();
      return json({ comments: results });
    }
    const post = (url.searchParams.get("post") || "").slice(0, 120);
    if (!post) return json({ comments: [] });
    const { results } = await db.prepare("SELECT id, name, text, created_at FROM comments WHERE post = ? AND status = 'approved' ORDER BY id ASC").bind(post).all();
    return json({ comments: results });
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
    if (body.website) return json({ ok: true }); // honeypot: bots fill hidden field
    const post = String(body.post || "").trim().slice(0, 120);
    const name = String(body.name || "").trim().replace(/\s+/g, " ");
    const text = String(body.text || "").trim();
    if (!post) return json({ error: "Article not found." }, 400);
    if (name.length < 2 || name.length > 60) return json({ error: "Please enter your name (2–60 characters)." }, 400);
    if (text.length < 2 || text.length > 2000) return json({ error: "Your comment must be 2–2000 characters." }, 400);

    const ipHash = await sha256((request.headers.get("cf-connecting-ip") || "unknown") + "|aeronotes");
    const recent = await db.prepare("SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')").bind(ipHash).first();
    if (recent && recent.n >= 5) return json({ error: "Too many comments in a short time. Please try again in a few minutes." }, 429);

    await db.prepare("INSERT INTO comments (post, name, text, ip_hash) VALUES (?, ?, ?, ?)").bind(post, name, text, ipHash).run();
    return json({ ok: true });
  }

  if (request.method === "PATCH" || request.method === "DELETE") {
    if (!(await isAuthor(request))) return json({ error: "Unauthorized" }, 401);
    let id;
    if (request.method === "PATCH") { try { id = Number((await request.json()).id); } catch {} }
    else id = Number(url.searchParams.get("id"));
    if (!Number.isInteger(id)) return json({ error: "Invalid comment." }, 400);
    if (request.method === "PATCH") await db.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
    else await db.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }

  return json({ error: "Method not allowed." }, 405);
}
