/*
 * AeroNotes sound effects, synthesised live with the Web Audio API (no audio files).
 * Cockpit-style chimes, a master-caution blip and jet whooshes.
 * Muted state is remembered in this browser only.
 */
(function () {
  const KEY = "aeronotes_sfx_muted";
  let ctx = null, master = null, verb = null;
  let muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch {}

  function init() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    // small "cockpit" room: two feedback delays
    verb = ctx.createGain(); verb.gain.value = 0.22;
    [0.031, 0.047].forEach((t) => {
      const d = ctx.createDelay(); d.delayTime.value = t;
      const fb = ctx.createGain(); fb.gain.value = 0.38;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
      verb.connect(d); d.connect(lp).connect(fb).connect(d); lp.connect(master);
    });
    return true;
  }
  const now = () => ctx.currentTime;

  // bell-like tone: sine + soft overtone, quick attack, long decay
  function bell(freq, t, dur = 0.9, vol = 0.35) {
    [[1, vol], [2.01, vol * 0.18], [3.98, vol * 0.05]].forEach(([mul, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * mul;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / mul ** 0.5);
      o.connect(g); g.connect(master); g.connect(verb);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }

  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  // filtered-noise whoosh; pan from -1 to 1 for a fly-by
  function whoosh(t, dur = 0.35, f0 = 500, f1 = 2600, vol = 0.32, pan = [0, 0]) {
    const src = ctx.createBufferSource(); src.buffer = noise();
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.55);
    bp.frequency.exponentialRampToValueAtTime(f0 * 0.8, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = g;
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner(); p.pan.setValueAtTime(pan[0], t); p.pan.linearRampToValueAtTime(pan[1], t + dur);
      g.connect(p); node = p;
    }
    src.connect(bp).connect(g); node.connect(master);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  // short square blip through a low-pass, like an avionics alert
  function blip(freq, t, dur = 0.09, vol = 0.16) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "square"; o.frequency.value = freq;
    lp.type = "lowpass"; lp.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.setValueAtTime(vol, t + dur - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp).connect(g); g.connect(master); g.connect(verb);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function thump(t, vol = 0.5) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.25);
  }

  // short jet-engine pass: turbine whine with a Doppler drop, broadband roar and low rumble.
  // dir = 1 sweeps left -> right, -1 right -> left
  function jetPass(t, dir = 1, dur = 0.75) {
    const pan = (node) => {
      if (!ctx.createStereoPanner) return node;
      const p = ctx.createStereoPanner(); p.pan.setValueAtTime(-0.9 * dir, t); p.pan.linearRampToValueAtTime(0.9 * dir, t + dur);
      node.connect(p); return p;
    };
    const env = (g, peak, at = 0.45) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + dur * at);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    };
    // roar: noise through a low-pass that opens as the jet comes closer
    const src = ctx.createBufferSource(); src.buffer = noise();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 0.7;
    lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.45); lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    const rg = ctx.createGain(); env(rg, 0.55);
    src.connect(lp).connect(rg); pan(rg).connect(master);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
    // turbine whine: two detuned tones that drop in pitch as it passes (Doppler)
    [[3300, 0.05], [4420, 0.03]].forEach(([f, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f * 1.12, t); o.frequency.setValueAtTime(f * 1.1, t + dur * 0.35);
      o.frequency.exponentialRampToValueAtTime(f * 0.86, t + dur * 0.6);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = 4;
      env(g, v, 0.4);
      o.connect(bp).connect(g); pan(g).connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    });
    // low rumble
    const r = ctx.createOscillator(), rgain = ctx.createGain();
    r.type = "sine"; r.frequency.setValueAtTime(70, t); r.frequency.exponentialRampToValueAtTime(46, t + dur);
    env(rgain, 0.22, 0.5); r.connect(rgain).connect(master); r.start(t); r.stop(t + dur + 0.05);
  }

  const play = (fn) => () => { if (muted || !init()) return; try { fn(now()); } catch {} };

  window.SFX = {
    // quiz start: radio click + "seatbelt sign" chime
    start: play((t) => { blip(2400, t, 0.02, 0.08); bell(1175, t + 0.06, 1.1, 0.3); }),
    // correct: quick rising cockpit chime with a light air swish
    correct: play((t) => { whoosh(t, 0.22, 900, 3800, 0.12); bell(784, t + 0.02, 0.6, 0.28); bell(1175, t + 0.11, 0.9, 0.3); bell(1568, t + 0.2, 1.2, 0.22); }),
    // wrong: low thud + double master-caution blip
    wrong: play((t) => { thump(t, 0.35); blip(330, t + 0.02); blip(330, t + 0.16); }),
    // flashcard flip / swipe
    flip: play((t) => whoosh(t, 0.28, 600, 3200, 0.22, [-0.4, 0.4])),
    swipe: play((t) => whoosh(t, 0.2, 400, 1800, 0.16)),
    // home page slider: short jet-engine pass in the direction of travel
    slide: (dir = 1) => play((t) => jetPass(t, dir))(),
    // end of round: jet fly-by, then a chord whose brightness follows the score
    finish: (score = 0, max = 10) => play((t) => {
      whoosh(t, 1.6, 180, 1400, 0.42, [-1, 1]);
      thump(t + 0.55, 0.25);
      const r = score / max;
      const notes = r >= 0.8 ? [784, 988, 1175, 1568] : r >= 0.5 ? [784, 988, 1175] : [587, 698];
      notes.forEach((f, i) => bell(f, t + 1.15 + i * 0.12, 1.6, 0.24));
    })(),
    get muted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch {} if (!muted) { init(); window.SFX.start(); } return muted; },
    // speaker button: <button data-sfx-toggle>
    mount(el) {
      const draw = () => {
        el.innerHTML = muted
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
        el.setAttribute("aria-label", muted ? "Sound off. Turn sound on" : "Sound on. Turn sound off");
        el.title = muted ? "Sound off" : "Sound on";
      };
      draw(); el.onclick = () => { window.SFX.toggle(); draw(); };
    }
  };
})();
