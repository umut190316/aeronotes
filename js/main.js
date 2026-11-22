/* AeroNotes — shared UI + page rendering */
(function () {
  const ICONS = {
    rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.6" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    logo: '<svg class="brand-mark" viewBox="0 0 615 255" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M4.5 250.1C7.6 247.2 111.1 191.1 117.9 188.6C136.6 181.9 167.9 175.1 198 171.4C219.8 168.6 324.2 169 310.5 171.7C283.8 177.1 212.4 197.7 181.8 208.8C170 213.1 173.3 210.6 140.3 240.8L129.1 251L66.3 251C28.7 251 4 250.6 4.5 250.1ZM371.7 248.8C370.9 247.5 366.1 238.4 361 228.5C349.5 206.2 323.7 157.1 316 143C312.9 137.2 305.7 123.8 300 113.2C294.2 102.7 289.3 94 288.9 94C288.6 94 275.3 106.6 259.4 121.9L230.5 149.9L223 150.5C189.5 153.2 173.8 155.3 152 159.9C144.6 161.5 138.4 162.7 138.2 162.5C137.2 161.6 304.3 4 306.3 4C307.1 4 340.2 64.9 390.5 159C395 167.5 402.6 181.7 407.3 190.5C412 199.3 421 216.5 427.3 228.8L438.7 251L405.9 251L373 251L371.7 248.8ZM586.5 249.1C576.1 246.1 572.2 243.7 545 224.4C530.4 214.1 500.1 192.5 477.5 176.5C454.9 160.4 426.4 140.2 414 131.5C401.6 122.8 390.1 114.6 388.3 113.4C386.2 111.8 382.7 106.3 377.4 96.3C373.2 88.1 365.2 73.2 359.8 63.1C348.6 42.3 345.9 36.3 343.1 26C341 18.6 339.2 4 340.4 4C341.2 4 367 22.2 466.2 93.2C512.3 126.1 550.4 153 551 153C551.7 153 552 127.8 552 78.5L552 4L581.2 4.2L610.5 4.5L610.7 127.8L611 251L601.7 250.9C596.1 250.9 590.2 250.2 586.5 249.1Z"/></svg>',
    wordmark: '<svg class="brand-word" viewBox="0 0 930 59" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M348.7 55.9C323.2 49.9 318.7 17.9 341.8 6.1C355.3 -0.8 377.1 2.2 385.4 12.1C404.6 34.8 380.7 63.4 348.7 55.9ZM584.5 56C567.3 51.8 558.3 36.7 563.5 21C571.3 -2.6 614.2 -4.3 624.9 18.5C635.2 40.4 611.2 62.7 584.5 56ZM890.2 55.5C878.8 52.3 876.8 50.3 880.4 45.5L883 42.1L888.2 44.8C898.7 50.2 916 48.2 916 41.5C916 37.8 913 36.2 901.5 34C884.7 30.6 880 27.6 879.3 19.3C877.9 4.6 902.7 -3.1 921.5 6L926 8.2L924.3 11.2C921.4 16 920.7 16.2 915.4 13.8C904.9 9.1 891 11.3 891 17.6C891 21 894.2 22.6 905.9 24.9C918.5 27.4 922.7 29.4 925.8 34C935.4 48.3 913 61.9 890.2 55.5ZM2 55.4C2 55.1 7.7 43.2 14.7 28.9L27.3 3L33.5 3L39.7 3L45.8 15.8C49.1 22.8 54.8 34.7 58.4 42.2L64.9 56L58.6 56L52.3 56L49.7 50L47.1 44L33.2 44L19.3 44L16.7 50L14.1 56L8 56C4.7 56 2 55.8 2 55.4ZM118 29.5L118 3L140.4 3C164.7 3 164.6 3 163.6 8.5L162.9 12L146.2 12.2L129.5 12.5L129.2 15.4C129 17 129.1 19.8 129.5 21.7L130.1 25L145 25L160 25L160 29.5L160 34L145 34L130 34L130 38.9C130 41.6 129.7 44.5 129.4 45.4C128.9 46.8 130.7 47 146.4 47L164 47L164 51.5L164 56L141 56L118 56L118 29.5ZM221 29.4L221 2.8L239.2 3.2C256 3.5 257.9 3.7 262.2 5.8C275.4 12.3 275.1 29 261.8 35L258 36.7L265 45.6C273.5 56.4 273.4 56 265.7 56L259.5 56L253 47.1L246.5 38.1L239.2 38.1L232 38L232 47L232 56L226.5 56L221 56L221 29.4ZM450 29.5L450 3L455.4 3L460.8 3L471.2 14.3C477 20.4 484.3 28.5 487.6 32.2C490.8 35.8 493.8 38.9 494.2 38.9C494.7 39 495 30.9 495 21L495 3L500.5 3L506 3L506 29.5L506 56L500.6 56L495.2 56L478.8 38L462.5 19.9L461.9 37.7C461.6 47.5 461.3 55.6 461.2 55.8C461.1 55.9 458.5 56 455.5 56L450 56L450 29.5ZM696 34L696 12L686.5 12L677 12L677 7.5L677 3L702 3L727 3L727 7.5L727 12L717.5 12L708 12L708 34L708 56L702 56L696 56L696 34ZM780 29.5L780 3L802.5 3L825 3L825 7.5L825 12L808 12L791 12L791 18.5L791 25L806 25L821 25L821 29.5L821 34L806 34L791 34L791 40.5L791 47L808.5 47L826 47L826 51.5L826 56L803 56L780 56L780 29.5ZM366.7 46.5C385.2 41 383.5 16.2 364.4 11.9C351.1 8.9 339 17.3 339 29.5C339 43 351.9 50.9 366.7 46.5ZM606.4 44.7C617.8 38.4 617.8 20.7 606.3 14.3C590.1 5.4 570.6 17.6 575 33.9C578.3 46.1 594 51.5 606.4 44.7ZM40.6 29.8C39.4 26.9 37.2 22.2 35.7 19.5L33.2 14.5L28.6 24.2C26.1 29.6 24 34.2 24 34.5C24 34.8 28.3 35 33.5 35L43 35L40.6 29.8ZM255 27.7C258.7 25.8 260.6 21.7 259.5 18.3C257.9 13.7 253 12 241.8 12L232 12L232 20.5L232 29L242.2 29C248.4 29 253.5 28.5 255 27.7Z"/></svg>',
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
    "Inspiring People": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/><path d="m19 2 .7 1.6 1.6.7-1.6.7L19 6.6l-.7-1.6-1.6-.7 1.6-.7Z"/></svg>',
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

  /* Centre-crop an uploaded photo to a square JPEG of size px. */
  async function squareImage(file, size) {
    const img = await new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = URL.createObjectURL(file); });
    const s = Math.min(img.naturalWidth, img.naturalHeight), out = Math.min(size, s);
    const c = document.createElement("canvas"); c.width = c.height = out;
    c.getContext("2d").drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, out, out);
    return await new Promise((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error("canvas"))), "image/jpeg", 0.88));
  }

  /* Tap-to-zoom for any image marked [data-zoom] (profile photo, article images). */
  function openZoom(src, alt) {
    const box = document.createElement("div");
    box.className = "zoom";
    box.innerHTML = `<img src="${esc(src)}" alt="${esc(alt || "")}"><button class="zoom-x" aria-label="Close">✕</button>`;
    const close = () => { box.classList.remove("on"); setTimeout(() => box.remove(), 200); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    box.addEventListener("click", close); document.addEventListener("keydown", onKey);
    document.body.appendChild(box); requestAnimationFrame(() => box.classList.add("on"));
  }
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-zoom], article .prose img");
    if (!img || img.closest("a")) return;
    e.preventDefault(); openZoom(img.currentSrc || img.src, img.alt);
  });

  /* Downscale an uploaded photo to a JPEG no wider/taller than max px. */
  async function shrinkImage(file, max) {
    const img = await new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = URL.createObjectURL(file); });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error("canvas"))), "image/jpeg", 0.85));
  }

  /* Crop any cover (File or image path) to a 1200x630 JPEG for link previews. */
  async function makeOgImage(src) {
    const img = await new Promise((resolve, reject) => {
      const im = new Image(); im.onload = () => resolve(im); im.onerror = reject;
      im.src = src instanceof Blob ? URL.createObjectURL(src) : "/" + String(src).replace(/^\/+/, "");
    });
    const W = 1200, H = 630, c = document.createElement("canvas"); c.width = W; c.height = H;
    const k = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
    const g = c.getContext("2d"); g.fillStyle = "#0f2d52"; g.fillRect(0, 0, W, H);
    g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    return await new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/jpeg", 0.86));
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
  const postUrl = (id) => "/article/" + encodeURIComponent(id);
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
    return `<a class="card" href="${postUrl(p.id)}">
      <div class="card-media"><img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy"><span class="chip">${esc(p.category)}</span></div>
      <div class="card-body"><h3>${esc(p.title)}</h3>${withExcerpt ? `<p class="excerpt">${esc(p.excerpt)}</p>` : ""}${meta(p)}</div></a>`;
  }

  /* ---------- Header / footer / search ---------- */
  function header(active) {
    const link = (href, label, key) => `<a href="${href}" class="${active === key ? "active" : ""}">${label}</a>`;
    return `<div class="container nav">
      <a class="brand" href="index.html" aria-label="${esc(SITE.name)} home">${ICONS.logo}${ICONS.wordmark}</a>
      <span class="tagline">${esc(SITE.tagline)}</span>
      <nav class="nav-links" id="navLinks">${link("index.html", "Home", "home")}${link("articles.html", "Articles", "articles")}${link("quiz.html", "Quiz", "quiz")}${link("flashcards.html", "Flashcards", "cards")}${link("about.html", "About", "about")}</nav>
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
      <span><a href="/privacy">Privacy</a>${auth.on ? "" : ' · <a href="/login">Author login</a>'}</span></div>`;
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
        ? hits.map((p) => `<a href="${postUrl(p.id)}"><b>${esc(p.title)}</b><span>${esc(p.category)} · ${formatDate(p.date)}</span></a>`).join("")
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
    const html = sanitize(p.content).replace(/<img([^>]*?) alt=""/g, (m, a) => `<img${a} alt="${esc(p.title)}"`);
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
    const isAuthor = auth.on;
    const authHeader = () => (isAuthor ? { Authorization: "Bearer " + auth.get() } : {});
    const warn = (el, text, kind) => { el.className = "hint" + (kind ? " " + kind : ""); el.textContent = text; };
    const open = new Set(); // threads whose replies are expanded

    const one = (c, reply) => `<div class="c-item${reply ? " c-reply" : ""}${c.is_author ? " c-by-author" : ""}" data-cid="${c.id}">
        <div class="c-head">${c.is_author ? authorAvatar("avatar") : `<span class="avatar">${esc(initials(c.name))}</span>`}<b>${esc(c.name)}</b>${c.is_author ? '<span class="c-badge">Author</span>' : ""}<span class="hint">${timeAgo(c.created_at)}</span></div>
        <p>${esc(c.text).replace(/\n/g, "<br>")}</p>
        <button class="c-reply-btn" data-reply="${c.id}" data-name="${esc(c.name)}">Reply</button></div>`;

    const draw = (items) => {
      const tops = items.filter((c) => !c.parent_id);
      const kids = {};
      items.filter((c) => c.parent_id).forEach((c) => (kids[c.parent_id] = kids[c.parent_id] || []).push(c));
      $("#cCount").textContent = items.length ? "(" + items.length + ")" : "";
      list.innerHTML = tops.length ? tops.map((c) => {
        const r = kids[c.id] || [], show = r.length <= 2 || open.has(c.id);
        return `<div class="c-thread" data-thread="${c.id}">${one(c)}
          ${r.length ? `<div class="c-replies">${show ? r.map((x) => one(x, true)).join("") : ""}
            ${show ? "" : `<button class="c-more" data-more="${c.id}"><span></span>View ${r.length} replies</button>`}</div>` : ""}
          <div class="c-reply-slot"></div></div>`;
      }).join("") : '<p class="hint">No comments yet. Be the first!</p>';
      list._items = items;
    };

    async function load() {
      try {
        const r = await fetch("/api/comments?post=" + encodeURIComponent(postId));
        if (!r.ok) throw 0;
        draw((await r.json()).comments || []);
      } catch { list.innerHTML = '<p class="hint">Comments could not be loaded.</p>'; }
    }

    async function send(body, msgEl) {
      if (String(body.name || "").trim().length < 2) { const e = new Error("Please enter your name first."); e.kind = "error"; throw e; }
      const r = await fetch("/api/comments", { method: "POST", headers: { "content-type": "application/json", ...authHeader() }, body: JSON.stringify({ post: postId, ...body }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { const e = new Error(data.error || "Something went wrong."); e.kind = data.code === "offensive" ? "alert" : "error"; throw e; }
      if (data.approved) { await load(); return true; }
      warn(msgEl, "✓ Thanks! Comments with links are checked before they appear.", "ok");
      return false;
    }

    // Reply: inline form under the thread, like Instagram
    list.addEventListener("click", (e) => {
      const more = e.target.closest("[data-more]");
      if (more) { open.add(+more.dataset.more); draw(list._items); return; }
      const btn = e.target.closest("[data-reply]");
      if (!btn) return;
      const thread = btn.closest(".c-thread"), slot = thread.querySelector(".c-reply-slot");
      list.querySelectorAll(".c-reply-slot").forEach((x) => { if (x !== slot) x.innerHTML = ""; });
      slot.innerHTML = `<form class="c-form c-reply-form">
          ${isAuthor ? "" : `<input name="name" maxlength="60" placeholder="Please enter your name" autocomplete="name" required>`}
          <textarea name="text" maxlength="2000" rows="3" required>@${esc(btn.dataset.name)} </textarea>
          <input name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
          <div class="c-reply-actions"><button class="btn" type="submit">Reply</button><button class="btn ghost" type="button" data-cancel>Cancel</button></div>
          <p class="hint"></p></form>`;
      const f = slot.querySelector("form"), t = f.text;
      t.focus(); t.setSelectionRange(t.value.length, t.value.length);
      f.querySelector("[data-cancel]").onclick = () => (slot.innerHTML = "");
      f.onsubmit = async (ev) => {
        ev.preventDefault();
        const b = f.querySelector('button[type="submit"]'), m = f.querySelector("p"); b.disabled = true;
        warn(m, "Sending…");
        try {
          open.add(+thread.dataset.thread);
          const done = await send({ parent: btn.dataset.reply, name: isAuthor ? SITE.author : f.name.value, text: t.value, website: f.website.value }, m);
          if (done) return; t.value = ""; f.querySelector("[data-cancel]").textContent = "Close";
        } catch (err) { warn(m, err.message, err.kind || "error"); }
        finally { b.disabled = false; }
      };
    });

    await load();

    if (isAuthor) { form.name.value = SITE.author; form.name.readOnly = true; }
    form.name.placeholder = "Please enter your name";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.submitter; btn.disabled = true;
      warn(msg, "Sending…");
      try {
        const done = await send({ name: form.name.value, text: form.text.value, website: form.website.value }, msg);
        form.text.value = "";
        if (done) warn(msg, "✓ Your comment is live.", "ok");
      } catch (err) { warn(msg, err.message, err.kind || "error"); }
      finally { btn.disabled = false; }
    });
  }

  /* ---------- Pages ---------- */
  const pages = {
    home() {
      const featured = sorted.find((p) => p.featured) || sorted[0];
      const slides = [featured, ...sorted.filter((p) => p !== featured)].slice(0, 6);
      const slide = (p, i) => `<a class="hero" href="${postUrl(p.id)}" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}">
        <img src="${esc(p.cover)}" alt="${esc(p.title)}" ${i ? 'loading="lazy"' : ""}>
        <div class="hero-body"><span class="chip">${esc(p.tag || p.category)}</span>
        <h1>${esc(p.title)}</h1><p>${esc(p.excerpt)}</p>${meta(p, true)}</div></a>`;
      $("#hero").innerHTML = `<div class="hero-slider" aria-roledescription="carousel">
        <div class="hero-track" id="heroTrack">${slides.map(slide).join("")}</div>
        ${slides.length > 1 ? `<button class="hero-nav prev" aria-label="Previous article">${ICONS.arrowLeft}</button><button class="hero-nav next" aria-label="Next article">${ICONS.arrow}</button>
        <div class="hero-dots">${slides.map((_, i) => `<button aria-label="Article ${i + 1}" data-i="${i}"></button>`).join("")}</div>` : ""}</div>`;
      if (slides.length > 1) {
        const track = $("#heroTrack"), dots = [...document.querySelectorAll(".hero-dots button")];
        const cur = () => Math.round(track.scrollLeft / track.clientWidth);
        const go = (i) => track.scrollTo({ left: ((i + slides.length) % slides.length) * track.clientWidth, behavior: "smooth" });
        let lastDir = 1;
        const sfx = (dir = lastDir) => { if (window.SFX && SFX.slide) SFX.slide(dir); };
        let shown = 0, byHand = false;
        // whoosh when the reader changes slide by swiping (not on auto-advance)
        const mark = () => {
          const c = cur(); dots.forEach((d, i) => d.classList.toggle("on", i === c));
          if (c !== shown) { if (byHand) sfx(c > shown ? 1 : -1); shown = c; }
        };
        track.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true }); mark();
        const nav = (i) => { byHand = false; sfx(i >= cur() ? 1 : -1); go(i); stop(); };
        $(".hero-nav.prev").onclick = () => nav(cur() - 1);
        $(".hero-nav.next").onclick = () => nav(cur() + 1);
        dots.forEach((d) => (d.onclick = () => nav(+d.dataset.i)));
        ["pointerdown", "touchstart", "wheel"].forEach((ev) => track.addEventListener(ev, () => (byHand = true), { passive: true }));
        let timer = matchMedia("(prefers-reduced-motion: reduce)").matches ? null : setInterval(() => go(cur() + 1), 7000);
        const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
        ["pointerdown", "touchstart", "wheel"].forEach((ev) => track.addEventListener(ev, stop, { passive: true }));
      }
      // "Aerospace Live": latest headlines from agencies and companies, served by /api/feed
      // (refreshed at most once an hour on the server). One source at a time, switching every hour.
      if ($("#xbox")) {
        const box = $("#xbox"); box.hidden = false;
        let data = null, pick = 0;
        const ago = (iso) => {
          if (!iso) return "";
          const m = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60000));
          if (m < 60) return m + " min ago";
          const h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
          const d = Math.round(h / 24); return d < 30 ? d + (d === 1 ? " day ago" : " days ago") : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        };
        box.innerHTML = `<div class="xbox-head"><span class="xbox-logo">${ICONS.rss}</span><div><b>Aerospace Live</b><span>Latest from agencies and companies, updated hourly</span></div></div>
          <div class="xbox-tabs" role="tablist"></div>
          <div class="xbox-feed" id="xfeed"><p class="hint">Loading the latest news…</p></div>`;
        const render = () => {
          const list = data.sources, s = list[pick];
          box.querySelector(".xbox-tabs").innerHTML = list.map((t, k) => `<button role="tab" data-k="${k}" aria-selected="${k === pick}">${esc(t.name)}</button>`).join("");
          $("#xfeed").innerHTML = s.items.length
            ? `<ul class="xnews">${s.items.map((it) => `<li><a href="${esc(it.link)}" target="_blank" rel="noopener"><b>${esc(it.title)}</b><span>${esc(it.via || s.name)}${it.date ? " · " + esc(ago(it.date)) : ""}</span></a></li>`).join("")}</ul>`
            : `<p class="hint">No fresh news from ${esc(s.name)} right now.</p>`;
          const tabs = box.querySelector(".xbox-tabs"), on = tabs.querySelector('[aria-selected="true"]');
          if (on) tabs.scrollLeft = on.offsetLeft - tabs.offsetLeft - (tabs.clientWidth - on.offsetWidth) / 2;
        };
        box.addEventListener("click", (e) => {
          const b = e.target.closest(".xbox-tabs button"); if (!b || !data) return;
          pick = +b.dataset.k; render();
        });
        const load = async () => {
          try {
            const r = await fetch("/api/feed"); if (!r.ok) throw 0;
            const j = await r.json();
            j.sources = (j.sources || []).filter((s) => s.items && s.items.length);
            if (!j.sources.length) throw 0;
            const keep = data && data.sources[pick] ? data.sources[pick].key : null;
            data = j;
            const k = keep ? j.sources.findIndex((s) => s.key === keep) : -1;
            pick = k >= 0 ? k : Math.floor(Date.now() / 3600000) % j.sources.length; // changes every hour
            render();
          } catch (e) { if (!data) box.hidden = true; }
        };
        load();
        // for readers who leave the page open: next source and fresh headlines every hour
        setInterval(async () => { await load(); if (data) { pick = (pick + 1) % data.sources.length; render(); } }, 3600000);
      }

      // Coming up: planned articles from SCHEDULE (past dates and already-published titles are hidden)
      const today = new Date().toISOString().slice(0, 10);
      const plan = (typeof SCHEDULE !== "undefined" ? SCHEDULE : [])
        .filter((s) => s.date >= today && !POSTS.some((p) => p.title.trim().toLowerCase() === String(s.title).trim().toLowerCase()))
        .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
      if (plan.length && $("#upcoming")) {
        $("#upcomingWrap").hidden = false;
        $("#upcoming").innerHTML = plan.map((s) => {
          const d = new Date(s.date + "T00:00:00");
          return `<div class="up-item${s.date === today ? " today" : ""}">${s.image ? `<img class="up-bg" src="${esc(s.image)}" alt="" loading="lazy">` : ""}
            <div class="up-date"><b>${d.getDate()}</b><span>${d.toLocaleDateString("en-US", { month: "short" })}</span><small>${s.date === today ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" })}</small></div>
            <div class="up-body">${s.category ? `<span class="chip">${esc(s.category)}</span>` : ""}<b>${esc(s.title)}</b>${s.note ? `<p>${esc(s.note)}</p>` : ""}</div></div>`;
        }).join("");
      }
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
        grid.innerHTML = list.length ? list.map((p) => card(p, true)).join("") : '<div class="empty">No articles in this category yet. Coming soon.</div>';
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
      const id = new URLSearchParams(location.search).get("id") || decodeURIComponent((location.pathname.match(/\/article\/([^/]+)/) || [])[1] || "");
      const i = sorted.findIndex((p) => p.id === id);
      const p = sorted[i];
      if (!p) { $("#post").innerHTML = '<div class="container page-head"><h1>Article not found</h1><p><a class="link-arrow" href="articles.html">Browse all articles ' + ICONS.arrow + "</a></p></div>"; return; }
      document.title = p.title + " · " + SITE.name;
      const font = FONTS[p.font] || FONTS.default; loadFont(p.font);
      const fs = font === FONTS.default ? "" : ` style="font-family:${font.family}"`;
      const shareUrl = location.origin + postUrl(p.id);
      const enc = encodeURIComponent, shareText = p.title + " | " + SITE.name;
      const newer = sorted[i - 1], older = sorted[i + 1];
      $("#post").innerHTML = `<div class="post-hero"><img src="${esc(p.cover)}" alt="${esc(p.title)}"></div>
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
        <nav class="post-nav">${older ? `<a class="link-arrow" href="${postUrl(older.id)}">${ICONS.arrowLeft} Older</a>` : "<span></span>"}
        ${newer ? `<a class="link-arrow" href="${postUrl(newer.id)}">Newer ${ICONS.arrow}</a>` : "<span></span>"}</nav>
        <section class="comments" id="comments">
          <h2>Comments <span class="count" id="cCount"></span></h2>
          <div id="cList" class="c-list"><p class="hint">Loading comments…</p></div>
          <form id="cForm" class="c-form" autocomplete="on">
            <h3>Leave a comment</h3>
            <div class="field"><label for="cName">Your name</label><input id="cName" name="name" maxlength="60" autocomplete="name" required></div>
            <div class="field"><label for="cText">Your comment</label><textarea id="cText" name="text" maxlength="2000" rows="5" required></textarea></div>
            <input name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
            <button class="btn" type="submit">Send comment</button>
            <p class="hint small">Your name and comment are shown publicly. Please be respectful. See the <a href="/privacy">privacy note</a>.</p>
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
      if (SITE.avatar) { $("#aboutAvatar").outerHTML = authorAvatar("about-avatar"); const a = $(".about-avatar"); if (a) { a.dataset.zoom = ""; a.title = "Tap to enlarge"; } }
      else $("#aboutAvatar").textContent = initials(SITE.author);
      if (SITE.linkedin) $(".about-links").insertAdjacentHTML("beforeend", `<a class="btn btn-li" href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">Follow on LinkedIn</a>`);
      $("#statPosts").textContent = POSTS.length;
      const TOPIC_INFO = {
        Aviation: "how aircraft fly and how they are getting more efficient",
        Space: "launch vehicles, satellites and mission design",
        Engines: "jet and rocket engines and how they work",
        History: "the people, aircraft and missions that shaped aerospace",
        "Inspiring People": "stories and interviews with people building the future of flight",
        "World News": "the latest aviation and space news from around the world",
        Sustainability: "fuels, efficiency and the road to cleaner flight",
        Technology: "materials, avionics and tools of the trade"
      };
      if ($("#topicList")) $("#topicList").innerHTML = CATEGORIES.map((c) =>
        `<li><a href="articles.html?category=${encodeURIComponent(c)}"><strong>${esc(c)}</strong></a>${TOPIC_INFO[c] ? ": " + esc(TOPIC_INFO[c]) : ""}</li>`).join("");
      $("#statCats").textContent = new Set(POSTS.map((p) => p.category)).size;
      $("#statWords").textContent = Math.round(POSTS.reduce((s, p) => s + p.content.split(/\s+/).length, 0) / 100) / 10 + "k";
    },

    async login() {
      const setupMode = new URLSearchParams(location.search).has("setup");
      if (auth.on && !setupMode) { location.replace("write.html"); return; }
      const say = (el, text, kind) => { el.textContent = text; el.className = "hint" + (kind ? " " + kind : ""); };

      // Is a password already set? (encrypted key published as auth.json)
      let vault = null;
      // Two-step login on? Then the vault is only handed out by the server after a correct code.
      let twofa = false;
      try { const r = await fetch("/api/auth", { cache: "no-store" }); if (r.ok) twofa = !!(await r.json()).twofa; } catch {}
      if (!twofa) try { const r = await fetch("auth.json?t=" + Date.now(), { cache: "no-store" }); if (r.ok) vault = await r.json(); } catch {}
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
      // Tap a photo in the editor to edit its description (alt text)
      ed.addEventListener("click", (e) => {
        const img = e.target.closest("img"); if (!img) return;
        const v = prompt("Görsel açıklaması (alt text). Kısa, İngilizce:", img.getAttribute("alt") || "");
        if (v !== null) { img.setAttribute("alt", v.trim()); say("✓ Görsel açıklaması güncellendi.", "ok"); }
      });
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
            const guess = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\b(img|image|dsc|pxl|whatsapp|screenshot)\b.*$/i, "").trim();
            const alt = (prompt("Görselde ne var? Kısa, İngilizce yaz (Google ve görme engelli okuyucular için).\nÖrn: Cutaway of a turbojet engine", guess) || "").trim();
            const cap = (prompt("Fotoğrafın altında görünecek yazı (istersen boş bırak):", "") || "").trim();
            insertHTML(mediaBlock(`<figure><img src="${blob}" data-path="${esc(path)}" alt="${esc(alt || cap)}">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`));
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
          const postId = editing ? editing.id : uniqueId(slug(f.title.value), remote.posts);
          if (editing) data.updated = new Date().toISOString().slice(0, 10);
          // 1200x630 JPEG for LinkedIn / WhatsApp / Google previews
          try {
            const og = await makeOgImage(f.cover.value === "__upload" ? uploadFile : coverPath);
            const ogPath = "assets/og/" + postId + ".jpg";
            let sha; try { sha = (await gh(`/repos/${SITE.repo}/contents/${ogPath}`)).sha; } catch {}
            await gh(`/repos/${SITE.repo}/contents/${ogPath}`, { method: "PUT", body: JSON.stringify({ message: "Share image: " + data.title, content: await fileToB64(og), ...(sha ? { sha } : {}) }) });
            data.ogImage = ogPath;
          } catch (e) { console.warn("share image skipped", e); }
          let post;
          if (editing) {
            const i = remote.posts.findIndex((p) => p.id === editing.id);
            if (i < 0) throw new Error("Bu yazı artık sitede yok (silinmiş olabilir).");
            post = { ...remote.posts[i], ...data };
            if (!post.font) delete post.font;
            remote.posts[i] = post;
            await saveRemotePosts(remote, remote.posts, "Edit post: " + post.title);
          } else {
            post = { id: postId, ...data };
            await saveRemotePosts(remote, [post, ...remote.posts], "New post: " + post.title);
            POSTS.push(post);
          }
          try { localStorage.removeItem("aeronotes_draft"); } catch {}
          say(`✓ <b>${editing ? "Kaydedildi!" : "Yayınlandı!"}</b> 1–2 dakika içinde sitede görünür → <a href="${postUrl(post.id)}">yazıyı aç</a> · <a href="manage.html">Yazılarım</a>`, "ok");
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
                <a class="btn ghost" href="${postUrl(p.id)}">Görüntüle</a>
                <a class="btn ghost" href="write.html?edit=${encodeURIComponent(p.id)}">✏️ Düzenle</a>
                <button class="btn danger" data-act="delpost">🗑 Sil</button>
              </div></div></div>`).join("") : '<p class="hint">Henüz yazı yok.</p>';
          return;
        }
        if (tab === "security") { drawSecurity(); return; }
        if (tab === "schedule") { drawSchedule(); return; }
        if (tab === "profile") { drawProfile(); return; }
        if (!allComments) { list.innerHTML = '<p class="hint">Yükleniyor…</p>'; return; }
        const items = allComments.filter((c) => c.status === tab);
        list.innerHTML = items.length ? items.map((c) => `<div class="c-item ${c.status}" data-cid="${c.id}">
            <div class="c-head"><span class="avatar">${esc(initials(c.name))}</span><b>${esc(c.name)}</b><span class="hint">${timeAgo(c.created_at)}</span></div>
            <div class="c-post">Yazı: <a href="${postUrl(c.post)}#comments">${esc(titleOf(c.post))}</a>${c.parent_id ? ` · ↳ <b>${esc(c.parent_name || "bir yorum")}</b> adlı kişiye yanıt` : ""}${c.is_author ? " · senin yorumun" : ""}</div>
            <p>${esc(c.text).replace(/\n/g, "<br>")}</p>
            <div class="c-actions">${c.status === "pending" ? '<button class="btn" data-act="approve">✓ Onayla</button>' : ""}<button class="btn danger" data-act="delc">🗑 Sil</button></div>
          </div>`).join("") : `<p class="hint">${tab === "pending" ? "Bekleyen yorum yok 🎉" : "Henüz yayında yorum yok."}</p>`;
      }

      // ---- Publishing calendar (SCHEDULE line in js/posts.js)
      async function loadSchedule() {
        const cur = await gh(`/repos/${SITE.repo}/contents/js/posts.js`);
        const text = b64decode(cur.content);
        const m = text.match(/^const SCHEDULE = (.*);$/m);
        return { sha: cur.sha, text, list: m ? JSON.parse(m[1]) : [] };
      }
      async function saveSchedule(remote, list, message) {
        list.sort((a, b) => a.date.localeCompare(b.date));
        const line = "const SCHEDULE = " + JSON.stringify(list) + ";";
        const text = /^const SCHEDULE = .*;$/m.test(remote.text)
          ? remote.text.replace(/^const SCHEDULE = .*;$/m, () => line)
          : remote.text.replace(/const POSTS = \[\r?\n/, (m) => line + "\n\n" + m);
        await gh(`/repos/${SITE.repo}/contents/js/posts.js`, { method: "PUT", body: JSON.stringify({ message, content: b64encodeText(text), sha: remote.sha }) });
      }
      async function drawSchedule() {
        list.innerHTML = '<p class="hint">Yükleniyor…</p>';
        let remote;
        try { remote = await loadSchedule(); } catch (err) { list.innerHTML = `<p class="hint error">Takvim yüklenemedi: ${esc(err.message)}</p>`; return; }
        if (tab !== "schedule") return;
        const today = new Date().toISOString().slice(0, 10);
        const items = remote.list.slice().sort((a, b) => a.date.localeCompare(b.date));
        list.innerHTML = `<div class="c-item sec"><b>Yeni plan ekle</b>
            <p class="hint">Ana sayfadaki "Coming Up" bölümünde tarihiyle görünür. Tarihi geçince ya da aynı başlıkta yazı yayınlayınca kendiliğinden kaybolur.</p>
            <form id="schForm" class="sch-form">
              <div class="field"><label>Tarih</label><input type="date" name="date" min="${today}" required></div>
              <div class="field"><label>Başlık</label><input type="text" name="title" maxlength="120" placeholder="Örn: How the Jet Engine Changed Everything" required></div>
              <div class="field"><label>Kategori</label><select name="category"><option value="">(yok)</option>${CATEGORIES.map((c) => `<option>${esc(c)}</option>`).join("")}</select></div>
              <div class="field"><label>Kısa not (isteğe bağlı)</label><input type="text" name="note" maxlength="160" placeholder="Örn: An interview with a test pilot"></div>
              <div class="field"><label>Arka plan görseli (isteğe bağlı)</label><input type="file" name="image" accept="image/*"><span class="hint">Kartın lacivert zemininde şeffaf olarak görünür.</span></div>
              <button class="btn" type="submit">Takvime ekle</button>
            </form></div>
          ${items.length ? items.map((s, i) => `<div class="c-item${s.date < today ? " past" : ""}" data-si="${i}">
              <div class="c-head"><b>${esc(s.title)}</b><span class="hint">${formatDate(s.date)}${s.date < today ? " · geçti" : ""}</span></div>
              ${s.category || s.note ? `<p class="hint">${esc([s.category, s.note].filter(Boolean).join(" · "))}</p>` : ""}
              <div class="c-actions"><button class="btn danger" data-act="delsch">🗑 Sil</button></div></div>`).join("") : '<p class="hint">Takvimde henüz plan yok.</p>'}`;
        $("#schForm").onsubmit = async (e) => {
          e.preventDefault();
          const f = e.target, btn = f.querySelector("button"); btn.disabled = true; say("Kaydediliyor…");
          try {
            let image;
            if (f.image.files[0]) {
              const blob = await shrinkImage(f.image.files[0], 1400);
              image = "assets/schedule/plan-" + Date.now() + ".jpg";
              await gh(`/repos/${SITE.repo}/contents/${image}`, { method: "PUT", body: JSON.stringify({ message: "Schedule image: " + f.title.value.trim(), content: await fileToB64(blob) }) });
            }
            const r = await loadSchedule();
            r.list.push({ date: f.date.value, title: f.title.value.trim(), category: f.category.value || undefined, note: f.note.value.trim() || undefined, image });
            await saveSchedule(r, r.list, "Schedule: " + f.title.value.trim());
            say("✓ Takvime eklendi. 1–2 dakika içinde ana sayfada görünür.", "ok"); drawSchedule();
          } catch (err) { say("Olmadı: " + esc(err.message), "error"); btn.disabled = false; }
        };
        list.querySelectorAll('[data-act="delsch"]').forEach((b) => (b.onclick = async () => {
          const s = items[+b.closest("[data-si]").dataset.si];
          if (!confirm(`"${s.title}" planını silmek istediğine emin misin?`)) return;
          b.disabled = true;
          try {
            const r = await loadSchedule();
            await saveSchedule(r, r.list.filter((x) => !(x.date === s.date && x.title === s.title)), "Unschedule: " + s.title);
            say("✓ Silindi.", "ok"); drawSchedule();
          } catch (err) { say("Olmadı: " + esc(err.message), "error"); b.disabled = false; }
        }));
      }

      // ---- Profile photo (SITE.avatar in js/posts.js)
      function drawProfile() {
        list.innerHTML = `<div class="c-item sec prof">
            <b>Profil fotoğrafı</b>
            <p class="hint">About sayfasında, yazı kartlarında ve manşette görünür. Kare olarak ortadan kırpılır.</p>
            <div class="prof-row">
              <img id="profPrev" class="prof-prev" src="${esc(SITE.avatar || "")}" alt="" ${SITE.avatar ? "" : "hidden"}>
              <label class="btn ghost prof-pick">Fotoğraf seç<input type="file" id="profFile" accept="image/*" hidden></label>
            </div>
            <div class="c-actions"><button class="btn" id="profSave" disabled>Kaydet</button></div></div>
          <div class="c-item sec">
            <b>X listesi (ana sayfadaki "Aviation on X" kutusu)</b>
            <p class="hint">X'te havacılık hesaplarından herkese açık bir liste oluştur, linkini buraya yapıştır. Boş bırakırsan kutu gizlenir.</p>
            <div class="field"><input id="xListUrl" type="url" placeholder="https://x.com/i/lists/1234567890" value="${esc(SITE.xList || "")}"></div>
            <div class="c-actions"><button class="btn" id="xListSave">Kaydet</button></div></div>`;
        $("#xListSave").onclick = async () => {
          const v = $("#xListUrl").value.trim();
          if (v && !/^https:\/\/(x|twitter)\.com\/(i\/lists\/\d+|[A-Za-z0-9_]{1,15}(\/lists\/[\w-]+)?)\/?$/.test(v)) return say("Bu bir X liste ya da profil linki gibi görünmüyor. Örn: https://x.com/i/lists/1234567890", "error");
          const btn = $("#xListSave"); btn.disabled = true; say("Kaydediliyor…");
          try {
            const cur = await gh(`/repos/${SITE.repo}/contents/js/posts.js`);
            const text = b64decode(cur.content);
            const next = /^(\s*xList:\s*)"[^"]*"/m.test(text)
              ? text.replace(/^(\s*xList:\s*)"[^"]*"/m, (m, a) => a + JSON.stringify(v))
              : text.replace(/const SITE = \{\n/, (m) => m + "  xList: " + JSON.stringify(v) + ",\n");
            await gh(`/repos/${SITE.repo}/contents/js/posts.js`, { method: "PUT", body: JSON.stringify({ message: "X list for home page", content: b64encodeText(next), sha: cur.sha }) });
            SITE.xList = v; say(v ? "✓ Kaydedildi. 1–2 dakika içinde ana sayfada görünür." : "✓ Kutu gizlendi.", "ok");
          } catch (err) { say("Olmadı: " + esc(err.message), "error"); }
          finally { btn.disabled = false; }
        };
        let blob = null;
        $("#profFile").onchange = async (e) => {
          const f = e.target.files[0]; if (!f) return;
          try { blob = await squareImage(f, 600); $("#profPrev").src = URL.createObjectURL(blob); $("#profPrev").hidden = false; $("#profSave").disabled = false; }
          catch { say("Bu fotoğraf okunamadı. JPG veya PNG dene.", "error"); }
        };
        $("#profSave").onclick = async () => {
          const btn = $("#profSave"); btn.disabled = true; say("Yükleniyor…");
          try {
            const path = "assets/profile-" + Date.now() + ".jpg";
            await gh(`/repos/${SITE.repo}/contents/${path}`, { method: "PUT", body: JSON.stringify({ message: "New profile photo", content: await fileToB64(blob) }) });
            const cur = await gh(`/repos/${SITE.repo}/contents/js/posts.js`);
            const text = b64decode(cur.content);
            const next = /^(\s*avatar:\s*)"[^"]*"/m.test(text)
              ? text.replace(/^(\s*avatar:\s*)"[^"]*"/m, (m, a) => a + JSON.stringify(path))
              : text.replace(/const SITE = \{\n/, (m) => m + "  avatar: " + JSON.stringify(path) + ", // profil fotoğrafı\n");
            await gh(`/repos/${SITE.repo}/contents/js/posts.js`, { method: "PUT", body: JSON.stringify({ message: "Use new profile photo", content: b64encodeText(next), sha: cur.sha }) });
            SITE.avatar = path;
            say("✓ Profil fotoğrafı güncellendi. 1–2 dakika içinde sitede görünür.", "ok");
          } catch (err) { say("Olmadı: " + esc(err.message), "error"); btn.disabled = false; }
        };
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
