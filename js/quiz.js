/*
 * AeroNotes quiz: builds 1,000+ questions from js/quiz-data.js, serves 10 per round
 * and remembers (in this browser only) which ones you've already seen.
 */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = (a) => [...new Set(a)];
  const pick = (pool, n, avoid) => { const bad = avoid.flatMap((v) => [v, ...related(v)]); return shuffle(uniq(pool).filter((v) => !bad.includes(v))).slice(0, n); };
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  // Values that would make a distractor arguably correct are never offered together.
  const RELATED = [
    ["Airbus", "Airbus Helicopters"], ["Boeing", "McDonnell Douglas", "Douglas"], ["Grumman", "Northrop / Northrop Grumman"],
    ["China", "Hong Kong", "Taiwan"], ["New York", "Newark"],
    ["Jupiter", "Europa", "Jupiter's icy moons"], ["Saturn", "Titan"], ["The Moon (far side)", "The Moon (south polar region)"]
  ];
  const related = (v) => RELATED.filter((g) => g.includes(v)).flat();

  const ROUND = 10;
  const GROUP_LABEL = { airports: "Airports", airlines: "Airlines", aircraft: "Aircraft", space: "Space", flight: "Flight & Ops", history: "History", units: "Units", phonetic: "Radio Alphabet" };

  /* ---------- question bank ---------- */
  // Each question: { id, g, q, a, wrong() -> 3 distractors, why }
  const BANK = [];
  const add = (id, g, q, a, wrong, why) => BANK.push({ id, g, q, a, wrong, why });

  // Airports
  const apNames = QZ_AIRPORTS.map((x) => x[2]), apCodes = QZ_AIRPORTS.map((x) => x[0]), apCities = QZ_AIRPORTS.map((x) => x[3]);
  const icao = QZ_AIRPORTS.filter((x) => x[1]);
  QZ_AIRPORTS.forEach(([code, , name, city]) => {
    add("ap1-" + code, "airports", `Which airport has the IATA code ${code}?`, name, () => pick(apNames, 3, [name]), `${code} is the IATA code of ${name} (${city}).`);
    add("ap2-" + code, "airports", `What is the IATA code of ${name}?`, code, () => pick(apCodes, 3, [code]), `${name} uses the code ${code}.`);
    if (code !== "EWR") add("ap3-" + code, "airports", `Airport code ${code} serves which city?`, city, () => pick(apCities, 3, [city]), `${code} is ${name}, serving ${city}.`);
  });
  icao.forEach(([iata, code, name]) => {
    add("ic1-" + code, "airports", `Which airport has the ICAO code ${code}?`, name, () => pick(icao.map((x) => x[2]), 3, [name]), `${code} is the four-letter ICAO code of ${name} (IATA: ${iata}).`);
    add("ic2-" + code, "airports", `What is the ICAO code of ${name}?`, code, () => pick(icao.map((x) => x[1]), 3, [code]), `ICAO codes have four letters; ${name} is ${code}.`);
  });

  // Airlines
  const alCountries = QZ_AIRLINES.map((x) => x[1]);
  QZ_AIRLINES.forEach(([al, country, code]) => {
    const k = al.replace(/\W+/g, "");
    add("al1-" + k, "airlines", `In which country is ${al} based?`, country, () => pick(alCountries, 3, [country]), `${al} is based in ${country}.`);
    add("al2-" + k, "airlines", `Which of these airlines is based in ${country}?`, al,
      () => pick(QZ_AIRLINES.filter((x) => x[1] !== country && !related(country).includes(x[1])).map((x) => x[0]), 3, [al]), `${al} is a ${country} airline.`);
    if (code) {
      add("al3-" + k, "airlines", `What is the two-character IATA code of ${al}?`, code, () => pick(QZ_AIRLINES.map((x) => x[2]).filter(Boolean), 3, [code]), `${al} flights are numbered ${code} 123 and so on.`);
      add("al4-" + k, "airlines", `Which airline uses the IATA code ${code}?`, al, () => pick(QZ_AIRLINES.map((x) => x[0]), 3, [al]), `${code} is ${al}.`);
    }
  });

  // Aircraft
  const makers = Object.keys(QZ_MAKERS);
  const models = makers.flatMap((m) => QZ_MAKERS[m].slice(1).map((x) => [x, m, QZ_MAKERS[m][0]]));
  const countries = uniq(makers.map((m) => QZ_MAKERS[m][0]).filter(Boolean));
  models.forEach(([model, maker, country]) => {
    const k = (maker + model).replace(/\W+/g, "");
    add("mk1-" + k, "aircraft", `Which manufacturer built the ${model}?`, maker, () => pick(makers, 3, [maker]), `The ${model} comes from ${maker}.`);
    add("mk2-" + k, "aircraft", `Which of these aircraft was built by ${maker}?`, model,
      () => pick(models.filter((x) => x[1] !== maker && !related(maker).includes(x[1])).map((x) => x[0]), 3, [model]), `${maker} built the ${model}.`);
    if (country) add("mk3-" + k, "aircraft", `The ${model} was developed in which country?`, country, () => pick(countries, 3, [country]), `The ${model} was developed by ${maker} in ${country}.`);
  });

  // Space tables
  QZ_MISSIONS.forEach(([m, t]) => {
    const k = m.replace(/\W+/g, "");
    add("ms1-" + k, "space", `What was the main target of the ${m} mission?`, t, () => pick(QZ_MISSIONS.map((x) => x[1]), 3, [t]), `${m} was sent to study ${t}.`);
    add("ms2-" + k, "space", `Which mission was sent to ${t}?`, m, () => pick(QZ_MISSIONS.filter((x) => x[1] !== t && !related(t).includes(x[1])).map((x) => x[0]), 3, [m]), `${m} studied ${t}.`);
  });
  QZ_ROCKETS.forEach(([r, o]) => {
    const k = r.replace(/\W+/g, "");
    add("rk1-" + k, "space", `Who operates or operated the ${r} rocket?`, o, () => pick(QZ_ROCKETS.map((x) => x[1]), 3, [o]), `${r}: ${o}.`);
    add("rk2-" + k, "space", `Which of these rockets belongs to ${o}?`, r, () => pick(QZ_ROCKETS.filter((x) => x[1] !== o).map((x) => x[0]), 3, [r]), `${r} is a ${o} launch vehicle.`);
  });
  const ord = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
  QZ_PLANETS.forEach((p, i) => {
    add("pl1-" + p, "space", `Which is the ${ord[i]} planet from the Sun?`, p, () => pick(QZ_PLANETS, 3, [p]), `Order from the Sun: ${QZ_PLANETS.join(", ")}.`);
    add("pl2-" + p, "space", `Counting from the Sun, what position does ${p} have?`, ord[i][0].toUpperCase() + ord[i].slice(1),
      () => pick(ord.map((o) => o[0].toUpperCase() + o.slice(1)), 3, [ord[i][0].toUpperCase() + ord[i].slice(1)]), `${p} is planet number ${i + 1}.`);
  });

  // Hand-written facts
  const G = { Flight: "flight", Space: "space", History: "history" };
  QUIZ_FACTS.forEach(([g, q, a, w, why], i) => add("f-" + i, G[g] || "flight", q, a, () => w.slice(), why));

  // Phonetic alphabet
  QZ_PHONETIC.forEach((word, i) => {
    const L = String.fromCharCode(65 + i);
    add("ph1-" + L, "phonetic", `In the ICAO radio alphabet, which word stands for "${L}"?`, word, () => pick(QZ_PHONETIC, 3, [word]), `${L} is spoken as ${word}.`);
    add("ph2-" + L, "phonetic", `In the ICAO radio alphabet, "${word}" stands for which letter?`, L,
      () => pick([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"], 3, [L]), `${word} = ${L}.`);
  });

  // Units (computed, so always exact)
  const numQ = (id, q, value, unit, factors, why) => {
    const a = fmt(value) + " " + unit;
    add(id, "units", q, a, () => pick(factors.map((f) => fmt(value * f) + " " + unit), 3, [a]), why);
  };
  [60, 80, 100, 120, 140, 150, 180, 200, 220, 250, 280, 300, 350, 400, 450, 480, 500, 520].forEach((kn) =>
    numQ("kn-" + kn, `${kn} knots is about how many km/h?`, kn * 1.852, "km/h", [1.609 / 1.852, 1 / 1.852, 1.25, 0.75, 1.5],
      "1 knot = 1 nautical mile per hour = 1.852 km/h."));
  [1000, 2000, 3000, 5000, 8000, 10000, 12000, 18000, 25000, 30000, 35000, 39000, 41000, 45000].forEach((ft) =>
    numQ("ft-" + ft, `${fmt(ft)} ft is about how many metres?`, ft * 0.3048, "m", [3.281 * 3.281, 1 / 0.3048, 1.5, 0.6], "1 ft = 0.3048 m."));
  [5, 10, 25, 50, 100, 250, 500, 1000, 3000].forEach((nm) =>
    numQ("nm-" + nm, `${fmt(nm)} nautical mile${nm > 1 ? "s" : ""} is about how many kilometres?`, nm * 1.852, "km", [1.609 / 1.852, 1 / 1.852, 1.25, 0.75], "1 nautical mile = 1.852 km, one minute of latitude."));
  [50, 100, 180, 240, 290, 310, 330, 350, 370, 390, 410, 430].forEach((fl) => {
    const a = fmt(fl * 100) + " ft";
    add("fl-" + fl, "units", `Flight level ${fl} (FL${fl}) means a pressure altitude of about...`, a,
      () => pick([fmt(fl * 10) + " ft", fmt(fl * 1000) + " ft", fmt(fl * 100) + " m", fmt(fl * 30) + " ft"], 3, [a]), "A flight level is pressure altitude in hundreds of feet.");
  });
  [-56.5, -40, -20, 0, 15, 25, 30, 40].forEach((c) => {
    const f = c * 9 / 5 + 32, a = (Math.round(f * 10) / 10) + " °F";
    add("tc-" + c, "units", `${c} °C equals how many °F?`, a,
      () => pick([(Math.round((c + 32) * 10) / 10) + " °F", (Math.round(c * 5 / 9 * 10) / 10 + 32) + " °F", (Math.round((c * 2) * 10) / 10) + " °F", (Math.round((f + 18) * 10) / 10) + " °F", (Math.round((f - 18) * 10) / 10) + " °F", (Math.round((f + 36) * 10) / 10) + " °F"], 3, [a]),
      "°F = °C × 9/5 + 32. (−56.5 °C is the ISA temperature above 11 km, and −40 is where both scales meet.)");
  });

  window.AERO_QUIZ_COUNT = BANK.length;

  /* ---------- seen-tracking (this browser only) ---------- */
  const SEEN_KEY = "aeronotes_quiz_seen", BEST_KEY = "aeronotes_quiz_best";
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  let seen = new Set(load(SEEN_KEY, []));

  function newRound() {
    const groups = shuffle(Object.keys(GROUP_LABEL));
    const out = [], used = new Set();
    for (let i = 0; out.length < ROUND && i < ROUND * 4; i++) {
      const g = groups[i % groups.length];
      let pool = BANK.filter((x) => x.g === g && !seen.has(x.id) && !used.has(x.id));
      if (!pool.length) {
        BANK.filter((x) => x.g === g).forEach((x) => seen.delete(x.id)); // finished this group: start it over
        pool = BANK.filter((x) => x.g === g && !used.has(x.id));
      }
      if (!pool.length) continue;
      const q = pool[Math.floor(Math.random() * pool.length)];
      used.add(q.id); out.push(q);
    }
    return shuffle(out).map((q) => ({ ...q, options: shuffle([q.a, ...q.wrong().slice(0, 3)]) }));
  }

  /* ---------- UI ---------- */
  const box = $("#quiz");
  let round = [], idx = 0, score = 0;

  function intro() {
    const best = load(BEST_KEY, null);
    box.innerHTML = `<div class="qz-intro">
        <div class="qz-big">${fmt(BANK.length)}</div><p class="hint">questions in the bank · ${fmt(Math.min(seen.size, BANK.length))} seen on this device</p>
        <p>Airports, airlines, aircraft, space missions, flight physics, aviation history, units and the radio alphabet. Every round gives you ${ROUND} questions you haven't seen yet.</p>
        ${best !== null ? `<p class="hint">Your best: <b>${best}/${ROUND}</b></p>` : ""}
        <button class="btn qz-start" id="qzStart">Start quiz</button></div>`;
    $("#qzStart").onclick = start;
  }

  function start() { round = newRound(); idx = 0; score = 0; SFX.start(); show(); }

  function show() {
    const q = round[idx];
    box.innerHTML = `<div class="qz-top"><span class="chip">${esc(GROUP_LABEL[q.g])}</span><span class="hint">Question ${idx + 1} / ${round.length}</span><span class="hint">Score ${score}</span></div>
      <div class="qz-bar"><span style="width:${(idx / round.length) * 100}%"></span></div>
      <h2 class="qz-q">${esc(q.q)}</h2>
      <div class="qz-opts">${q.options.map((o, i) => `<button class="qz-opt" data-i="${i}"><b>${"ABCD"[i]}</b><span>${esc(o)}</span></button>`).join("")}</div>
      <div id="qzAfter"></div>`;
    box.querySelectorAll(".qz-opt").forEach((b) => (b.onclick = () => answer(+b.dataset.i)));
  }

  function answer(i) {
    const q = round[idx], ok = q.options[i] === q.a;
    if (ok) score++;
    ok ? SFX.correct() : SFX.wrong();
    seen.add(q.id); save(SEEN_KEY, [...seen]);
    box.querySelectorAll(".qz-opt").forEach((b, j) => {
      b.disabled = true;
      if (q.options[j] === q.a) b.classList.add("right");
      else if (j === i) b.classList.add("wrong");
    });
    const last = idx === round.length - 1;
    $("#qzAfter").innerHTML = `<p class="qz-why ${ok ? "ok" : "no"}"><b>${ok ? "Correct!" : "Not quite."}</b> ${esc(q.why || "")}</p>
      <button class="btn" id="qzNext">${last ? "See result" : "Next question"}</button>`;
    $("#qzNext").onclick = () => { if (last) result(); else { idx++; show(); } };
    $("#qzNext").focus();
  }

  function result() {
    const best = Math.max(score, load(BEST_KEY, 0) || 0); save(BEST_KEY, best);
    SFX.finish(score, ROUND);
    const msg = score === ROUND ? "Perfect round. Captain material!" : score >= 8 ? "Excellent, cleared for takeoff." : score >= 5 ? "Solid flight. A bit more practice and you're there." : "Rough landing. Try another round!";
    const shareText = `I scored ${score}/${ROUND} on the AeroNotes aviation & space quiz. Can you beat me?`;
    const url = location.origin + "/quiz";
    box.innerHTML = `<div class="qz-intro"><div class="qz-big">${score}/${ROUND}</div><p>${msg}</p>
      <p class="hint">Best on this device: ${best}/${ROUND} · ${fmt(Math.min(seen.size, BANK.length))} of ${fmt(BANK.length)} questions seen</p>
      <div class="qz-actions"><button class="btn" id="qzAgain">Play another round</button>
      <a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}">Share on WhatsApp</a>
      <a class="btn ghost" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}">Share on LinkedIn</a></div></div>`;
    $("#qzAgain").onclick = start;
  }

  const sb = document.querySelector("[data-sfx-toggle]"); if (sb) SFX.mount(sb);
  intro();
})();
