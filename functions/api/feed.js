// GET /api/feed : latest headlines from aerospace agencies and companies.
// Sources are public RSS feeds (and the free Spaceflight News API). The result is
// cached for one hour at Cloudflare, so the sources are asked at most once an hour.

const GN = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:7d")}&hl=en-US&gl=US&ceid=US:en`;

const BN = (q) => `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&setlang=en-US&cc=US`;

const SOURCES = [
  { key: "nasa", name: "NASA", x: "NASA", feeds: ["https://www.nasa.gov/news-release/feed/", "https://www.nasa.gov/feed/"] },
  { key: "esa", name: "ESA", x: "esa", feeds: ["https://www.esa.int/rssfeed/TopNews", "https://www.esa.int/rssfeed/Our_Activities/Space_News"] },
  { key: "spacex", name: "SpaceX", x: "SpaceX", snapi: "SpaceX", feeds: [GN("SpaceX"), BN("SpaceX")] },
  { key: "airbus", name: "Airbus", x: "Airbus", feeds: [GN("Airbus aircraft OR Airbus space"), BN("Airbus"), "https://www.airbus.com/en/rss.xml"] },
  { key: "boeing", name: "Boeing", x: "Boeing", feeds: ["https://boeing.mediaroom.com/news-releases-statements?pagetemplate=rss", GN("Boeing aircraft"), BN("Boeing")] },
  { key: "lockheed", name: "Lockheed Martin", x: "LockheedMartin", feeds: ["https://news.lockheedmartin.com/news-releases?pagetemplate=rss", GN("\"Lockheed Martin\""), BN("Lockheed Martin")] },
  { key: "baykar", name: "Baykar", x: "BaykarTech", feeds: [GN("Baykar"), BN("Baykar")] },
  { key: "dlr", name: "DLR", x: "DLR_en", feeds: [GN("\"German Aerospace Center\" OR \"DLR\" space"), BN("German Aerospace Center DLR"), "https://www.dlr.de/en/rss.xml"] },
];

const PER_SOURCE = 8;
const TTL = 3600; // seconds

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', ndash: "-", mdash: "-", hellip: "..." };
function decode(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}
const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
};

function parseRss(xml, sourceName) {
  const out = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks) {
    let title = decode(tag(b, "title"));
    let link = decode(tag(b, "link"));
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); if (m) link = m[1]; }
    const date = decode(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date"));
    let via = decode(tag(b, "source")) || sourceName;
    // Google News titles end with " - Publisher"
    if (/news\.google\.com/.test(link)) {
      const cut = title.lastIndexOf(" - ");
      if (cut > 20) { via = title.slice(cut + 3); title = title.slice(0, cut); }
    }
    if (/bing\.com\/news\/apiclick/.test(link)) { try { const u = new URL(link).searchParams.get("url"); if (u) link = u; } catch (e) {} }
    if (!via || via === sourceName) { const m = b.match(/<News:Source>([\s\S]*?)<\/News:Source>/i); if (m) via = decode(m[1]); }
    if (!title || !/^https?:\/\//.test(link)) continue;
    const t = Date.parse(date);
    out.push({ title: title.slice(0, 200), link, date: isNaN(t) ? null : new Date(t).toISOString(), via: via.slice(0, 60) });
  }
  return out;
}

async function get(url, ms = 7000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AeroNotesBot/1.0; +https://aeronotesblog.pages.dev)", Accept: "application/rss+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.8" },
      cf: { cacheTtl: TTL, cacheEverything: true },
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r;
  } finally { clearTimeout(timer); }
}

async function loadSource(s) {
  const seen = new Set();
  let items = [];
  const add = (list) => {
    for (const it of list) {
      const k = it.title.toLowerCase().slice(0, 80);
      if (seen.has(k)) continue;
      seen.add(k); items.push(it);
    }
  };
  if (s.snapi) {
    try {
      const r = await get(`https://api.spaceflightnewsapi.net/v4/articles/?limit=${PER_SOURCE}&ordering=-published_at&search=${encodeURIComponent(s.snapi)}`);
      const j = await r.json();
      add((j.results || []).map((a) => ({ title: String(a.title || "").slice(0, 200), link: a.url, date: a.published_at || null, via: a.news_site || s.name })).filter((a) => a.title && /^https?:\/\//.test(a.link)));
    } catch (e) { /* try the next source */ }
  }
  for (const f of s.feeds) {
    if (items.length >= PER_SOURCE) break;
    try { add(parseRss(await (await get(f)).text(), s.name)); } catch (e) { /* next */ }
  }
  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return { key: s.key, name: s.name, x: s.x, items: items.slice(0, PER_SOURCE) };
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const url = new URL(context.request.url);
  const cacheKey = new Request(url.origin + "/api/feed?v=2");
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const sources = await Promise.all(SOURCES.map((s) => loadSource(s).catch(() => ({ key: s.key, name: s.name, x: s.x, items: [] }))));
  const body = JSON.stringify({ updated: new Date().toISOString(), sources });
  const ok = sources.some((s) => s.items.length);
  const res = new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=600, s-maxage=${ok ? TTL : 120}`,
      "Access-Control-Allow-Origin": "*",
    },
  });
  if (ok) context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
