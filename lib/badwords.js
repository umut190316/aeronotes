/*
 * Offensive-language filter for comments (English + Turkish).
 * Text is lower-cased, Turkish letters are folded (ş→s, ı→i ...) and common
 * look-alikes are undone (4→a, 0→o, $→s ...). Words are then compared:
 *   EXACT  – the whole word must match (so "cock" does not block "cockpit")
 *   PREFIX – any word starting with it (so "fuck" also catches "fucking")
 * Keep entries folded: no Turkish letters, no capitals.
 */

const EXACT = [
  // English
  "ass", "asses", "cock", "cocks", "pussy", "pussies", "piss", "pissed", "twat", "prick", "pricks",
  "fag", "fags", "retarded", "tits", "boobs", "jerkoff", "wtf", "stfu", "dumbass", "jackass", "fuk",
  // Turkish (only words that can't be an innocent word once ş/ı/ç are typed without Turkish letters)
  "amk", "aq", "amq", "sikeyim", "sikerim", "sikiyim", "sokayim", "yarak", "yarrak", "mk", "skm", "amcik", "kaltak", "avradini"
];

const PREFIX = [
  // English
  "fuck", "motherfuck", "shit", "bullshit", "bitch", "bastard", "asshole", "arsehole", "cunt", "dickhead",
  "whore", "slut", "faggot", "nigger", "nigga", "wanker", "idiot", "moron", "imbecil", "douche", "porn", "dildo",
  // Turkish
  "orospu", "orosbu", "orrospu", "oruspu", "amina", "amcig", "siktir", "pezevenk", "kahpe", "ibne", "yavsak", "serefsiz",
  "dangalak", "gerizekali", "salak", "aptal", "yarrag", "yarag", "tasak", "kaltag"
];

// Checked BEFORE folding Turkish letters, because their folded forms are innocent words
// (göt→"got", piç→"pic", sık→"sik", sıktı→"sikti").
const RAW_EXACT = ["göt", "götü", "götün", "göte", "piç", "piçler", "oç", "sik", "sikim", "sikik", "sikiş", "sikişme", "sikti", "siktim"];
const RAW_PREFIX = ["götver", "piçlik", "siktiğ", "sikiş"];

const FOLD = { "ı": "i", "İ": "i", "ş": "s", "ğ": "g", "ç": "c", "ö": "o", "ü": "u", "â": "a", "î": "i", "û": "u" };
const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

function normalise(text) {
  return String(text || "")
    .toLocaleLowerCase("tr")
    .replace(/[ıİşğçöüâîû]/g, (c) => FOLD[c] || c)
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[013457@$!]/g, (c) => LEET[c]);
}

function variants(word) {
  // "fuuuuck" -> "fuck" and "fuuck"; "asssss" -> "as" and "ass"
  return [...new Set([word, word.replace(/(.)\1{2,}/g, "$1"), word.replace(/(.)\1{2,}/g, "$1$1")])];
}

/** Returns true if the text contains an offensive word. */
export function isOffensive(text) {
  const raw = String(text || "").toLocaleLowerCase("tr").split(/[^\p{L}]+/u).filter(Boolean);
  if (raw.some((w) => RAW_EXACT.includes(w) || RAW_PREFIX.some((p) => w.startsWith(p)))) return true;
  const norm = normalise(text);
  // also join letters split by dots, dashes or underscores: f.u.c.k / s-i-k
  const joined = norm.replace(/\b([a-z])[._\-*]+(?=[a-z]\b)/g, "$1");
  const words = (norm + " " + joined).split(/[^a-z]+/).filter(Boolean);
  for (const w of words) {
    for (const v of variants(w)) {
      if (EXACT.includes(v)) return true;
      if (PREFIX.some((p) => v.startsWith(p))) return true;
    }
  }
  return false;
}
