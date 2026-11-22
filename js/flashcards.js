/* AeroNotes flashcards: double-tap (or double-click) to flip, swipe or arrows to move. */
(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ARROW_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  const cats = ["All", ...new Set(GLOSSARY.map((g) => g[1]))];
  let cat = "All", deck = [], i = 0;
  const card = $("#fcCard");

  function build(keepShuffle) {
    deck = GLOSSARY.filter((g) => cat === "All" || g[1] === cat);
    if (keepShuffle) shuffle(deck);
    i = 0; show();
  }
  function show() {
    const [term, c, def] = deck[i];
    card.classList.remove("flipped");
    // swap text after the card has turned back, so the meaning never flashes
    setTimeout(() => {
      $("#fcTerm").textContent = term; $("#fcTerm2").textContent = term;
      $("#fcCat").textContent = c; $("#fcCat2").textContent = c; $("#fcDef").textContent = def;
    }, card.dataset.ready ? 120 : 0);
    card.dataset.ready = 1;
    $("#fcCount").textContent = `${i + 1} / ${deck.length}`;
  }
  const flip = () => { card.classList.toggle("flipped"); SFX.flip(); };
  const go = (d) => { i = (i + d + deck.length) % deck.length; SFX.swipe(); show(); };

  $("#fcFilters").innerHTML = cats.map((c) => `<button class="filter ${c === cat ? "active" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  $("#fcFilters").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    cat = b.dataset.c; document.querySelectorAll("#fcFilters button").forEach((x) => x.classList.toggle("active", x === b)); build(true);
  });
  $("#fcPrev").innerHTML = ARROW_L; $("#fcNext").innerHTML = ARROW_R;
  $("#fcPrev").onclick = () => go(-1); $("#fcNext").onclick = () => go(1);
  $("#fcFlip").onclick = flip; $("#fcShuffle").onclick = () => build(true);

  // double-tap / double-click to flip, horizontal swipe to change card
  let lastTap = 0, sx = 0, sy = 0, moved = false;
  card.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; moved = false; });
  card.addEventListener("pointermove", (e) => { if (Math.abs(e.clientX - sx) > 12 || Math.abs(e.clientY - sy) > 12) moved = true; });
  card.addEventListener("pointerup", (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { go(dx < 0 ? 1 : -1); lastTap = 0; return; }
    if (moved) return;
    const now = Date.now();
    if (now - lastTap < 350) { flip(); lastTap = 0; } else lastTap = now;
  });
  card.addEventListener("dblclick", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === " " || e.key === "Enter") { if (document.activeElement === card || e.key === " ") { e.preventDefault(); flip(); } }
  });

  const sb = document.querySelector("[data-sfx-toggle]"); if (sb) SFX.mount(sb);
  build(true);
})();
