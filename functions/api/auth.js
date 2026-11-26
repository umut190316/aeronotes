import { clientIp } from "../../lib/clientip.js";
/*
 * AeroNotes two-step login (Cloudflare Pages Function + D1)
 *
 * When 2FA is on, the encrypted author key (the "vault", same format as the old
 * public auth.json) lives only here and is handed out after a correct
 * authenticator code. The password still decrypts it in the browser.
 *
 *   GET  /api/auth                         → { twofa: bool }
 *   POST /api/auth { action: "vault", code } → { vault }        (needs valid 6-digit code)
 * Author only (Authorization: Bearer <GitHub key>):
 *   POST { action: "setup" }               → { secret, uri }   (new pending secret)
 *   POST { action: "enable", code, vault } → turns 2FA on
 *   POST { action: "save", vault }         → replaces stored vault (password change)
 *   POST { action: "disable" }             → { vault }, turns 2FA off
 */

const REPO = "umut190316/aeronotes";
const ISSUER = "AeroNotes";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

async function ensureTables(db) {
  await db.exec("CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
  await db.exec("CREATE TABLE IF NOT EXISTS auth_fails (ip_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))");
}
const getSetting = async (db, k) => (await db.prepare("SELECT v FROM settings WHERE k = ?").bind(k).first())?.v ?? null;
const setSetting = (db, k, v) => db.prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(k, v).run();
const delSetting = (db, k) => db.prepare("DELETE FROM settings WHERE k = ?").bind(k).run();

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

/* ---- TOTP (RFC 6238, SHA-1, 6 digits, 30 s) ---- */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function b32encode(bytes) {
  let bits = 0, val = 0, out = "";
  for (const b of bytes) { val = (val << 8) | b; bits += 8; while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}
function b32decode(s) {
  let bits = 0, val = 0; const out = [];
  for (const c of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(c); if (i < 0) continue;
    val = (val << 5) | i; bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}
async function totp(secret, step) {
  const key = await crypto.subtle.importKey("raw", b32decode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const msg = new ArrayBuffer(8); const view = new DataView(msg);
  view.setUint32(0, Math.floor(step / 2 ** 32)); view.setUint32(4, step >>> 0);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const o = h[19] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1e6).padStart(6, "0");
}
async function checkCode(secret, code) {
  code = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const now = Math.floor(Date.now() / 30000);
  for (const d of [-1, 0, 1]) if ((await totp(secret, now + d)) === code) return now + d;
  return false;
}

const validVault = (v) => v && typeof v === "object" && typeof v.salt === "string" && typeof v.iv === "string" && typeof v.data === "string";

export async function onRequest({ request, env }) {
  if (!env.DB) return json({ error: "Not available right now." }, 500);
  const db = env.DB;
  await ensureTables(db);

  const enabled = !!(await getSetting(db, "totp_secret")) && !!(await getSetting(db, "vault"));
  if (request.method === "GET") return json({ twofa: enabled });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const action = body.action;

  if (action === "vault") {
    if (!enabled) return json({ error: "2FA is off." }, 400);
    const ipHash = await sha256(clientIp(request) + "|aeronotes-auth");
    await db.prepare("DELETE FROM auth_fails WHERE created_at < datetime('now', '-1 day')").run();
    const fails = await db.prepare("SELECT COUNT(*) AS n FROM auth_fails WHERE ip_hash = ? AND created_at > datetime('now', '-15 minutes')").bind(ipHash).first();
    if (fails && fails.n >= 5) return json({ error: "Çok fazla hatalı deneme. 15 dakika sonra tekrar dene." }, 429);
    // Global brake: many wrong codes from many addresses (a spread-out guessing attack) lock it for everyone for an hour
    const all = await db.prepare("SELECT COUNT(*) AS n FROM auth_fails WHERE created_at > datetime('now', '-1 hour')").first();
    if (all && all.n >= 30) return json({ error: "Giriş geçici olarak kilitlendi. 1 saat sonra tekrar dene." }, 429);
    const step = await checkCode(await getSetting(db, "totp_secret"), body.code);
    // A code works only once (stops someone reusing a code they saw)
    if (step !== false && String(step) === (await getSetting(db, "totp_last"))) return json({ error: "Bu kod zaten kullanıldı. Yeni kodu bekle." }, 401);
    if (step === false) {
      await db.prepare("INSERT INTO auth_fails (ip_hash) VALUES (?)").bind(ipHash).run();
      return json({ error: "Doğrulama kodu yanlış." }, 401);
    }
    await setSetting(db, "totp_last", String(step));
    return json({ vault: JSON.parse(await getSetting(db, "vault")) });
  }

  if (!(await isAuthor(request))) return json({ error: "Unauthorized" }, 401);

  if (action === "setup") {
    const secret = b32encode(crypto.getRandomValues(new Uint8Array(20)));
    await setSetting(db, "totp_pending", secret);
    const uri = `otpauth://totp/${encodeURIComponent(ISSUER + ":Author")}?secret=${secret}&issuer=${encodeURIComponent(ISSUER)}&algorithm=SHA1&digits=6&period=30`;
    return json({ secret, uri });
  }
  if (action === "enable") {
    const pending = await getSetting(db, "totp_pending");
    if (!pending) return json({ error: "Önce kurulumu başlat." }, 400);
    if (!validVault(body.vault)) return json({ error: "Geçersiz anahtar kasası." }, 400);
    if ((await checkCode(pending, body.code)) === false) return json({ error: "Kod yanlış. Uygulamadaki güncel kodu yaz." }, 400);
    await setSetting(db, "vault", JSON.stringify(body.vault));
    await setSetting(db, "totp_secret", pending);
    await delSetting(db, "totp_pending");
    return json({ ok: true });
  }
  if (action === "save") {
    if (!validVault(body.vault)) return json({ error: "Geçersiz anahtar kasası." }, 400);
    await setSetting(db, "vault", JSON.stringify(body.vault));
    return json({ ok: true });
  }
  if (action === "disable") {
    const vault = await getSetting(db, "vault");
    await delSetting(db, "totp_secret"); await delSetting(db, "totp_pending");
    return json({ ok: true, vault: vault ? JSON.parse(vault) : null });
  }
  return json({ error: "Unknown action." }, 400);
}
