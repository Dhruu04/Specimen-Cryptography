import type { TraceStep } from "./types";

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const idx = (ch: string | undefined) => A.indexOf((ch ?? "").toUpperCase());
export const letter = (n: number) => A[((n % 26) + 26) % 26] ?? "A";
export const isAlpha = (ch: string) => /[a-z]/i.test(ch);
const keepCase = (src: string, out: string) =>
  src === src.toLowerCase() ? out.toLowerCase() : out.toUpperCase();

export function caesar(text: string, shift: number, decrypt = false) {
  const k = decrypt ? -shift : shift;
  const steps: TraceStep[] = [];
  let out = "";
  for (const ch of text) {
    if (!isAlpha(ch)) {
      out += ch;
      continue;
    }
    const p = idx(ch);
    const c = ((p + k) % 26 + 26) % 26;
    out += keepCase(ch, letter(c));
    if (steps.length < 12) {
      steps.push({
        label: `${ch.toUpperCase()} → (${p} ${k < 0 ? "−" : "+"} ${Math.abs(k)}) mod 26`,
        detail: `= ${c} → ${letter(c)}`,
      });
    }
  }
  return { output: out, steps };
}

export function atbash(text: string) {
  const steps: TraceStep[] = [];
  let out = "";
  for (const ch of text) {
    if (!isAlpha(ch)) {
      out += ch;
      continue;
    }
    const p = idx(ch);
    const c = 25 - p;
    out += keepCase(ch, letter(c));
    if (steps.length < 12)
      steps.push({ label: `${ch.toUpperCase()} → 25 − ${p}`, detail: `= ${c} → ${letter(c)}` });
  }
  return { output: out, steps };
}

export function rot13(text: string) {
  return caesar(text, 13);
}

export function egcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - Math.floor(a / b) * y];
}

export function modInverse(a: number, m: number): number | null {
  const [g, x] = egcd(((a % m) + m) % m, m);
  if (g !== 1) return null;
  return ((x % m) + m) % m;
}

export function affine(text: string, a: number, b: number, decrypt = false) {
  const steps: TraceStep[] = [];
  const inv = modInverse(a, 26);
  if (decrypt && inv === null)
    return { output: "", steps, error: `a = ${a} is not coprime with 26, so it has no inverse.` };
  let out = "";
  for (const ch of text) {
    if (!isAlpha(ch)) {
      out += ch;
      continue;
    }
    const p = idx(ch);
    const c = decrypt ? (((inv as number) * (p - b)) % 26 + 26 * 26) % 26 : (a * p + b) % 26;
    out += keepCase(ch, letter(c));
    if (steps.length < 12)
      steps.push({
        label: decrypt
          ? `${ch.toUpperCase()} → ${inv}·(${p} − ${b}) mod 26`
          : `${ch.toUpperCase()} → (${a}·${p} + ${b}) mod 26`,
        detail: `= ${c} → ${letter(c)}`,
      });
  }
  return { output: out, steps };
}

export function vigenere(text: string, key: string, decrypt = false) {
  const k = key.replace(/[^a-z]/gi, "").toUpperCase();
  const steps: TraceStep[] = [];
  if (!k) return { output: "", steps, error: "Enter a key made of letters." };
  let out = "";
  let i = 0;
  for (const ch of text) {
    if (!isAlpha(ch)) {
      out += ch;
      continue;
    }
    const p = idx(ch);
    const kv = idx(k[i % k.length]);
    const c = decrypt ? ((p - kv) % 26 + 26) % 26 : (p + kv) % 26;
    out += keepCase(ch, letter(c));
    if (steps.length < 12)
      steps.push({
        label: `${ch.toUpperCase()} (${p}) ${decrypt ? "−" : "+"} ${k[i % k.length]} (${kv}) mod 26`,
        detail: `= ${c} → ${letter(c)}`,
      });
    i++;
  }
  return { output: out, steps };
}

export function autokey(text: string, key: string, decrypt = false) {
  const primer = key.replace(/[^a-z]/gi, "").toUpperCase();
  const letters = text.replace(/[^a-z]/gi, "").toUpperCase();
  if (!primer) return { output: "", error: "Enter a primer key." };
  const steps: TraceStep[] = [];
  let stream = primer;
  let res = "";
  for (let i = 0; i < letters.length; i++) {
    const p = idx(letters[i]);
    const kv = idx(stream[i]);
    const c = decrypt ? ((p - kv) % 26 + 26) % 26 : (p + kv) % 26;
    res += letter(c);
    if (decrypt) stream += letter(c);
    else stream += letters[i];
    if (steps.length < 12)
      steps.push({
        label: `${letters[i]} with stream ${stream[i]}`,
        detail: `→ ${letter(c)}`,
      });
  }
  return { output: res, steps, note: `Key stream: ${stream.slice(0, letters.length)}` };
}

export function railFence(text: string, rails: number, decrypt = false) {
  const n = Math.max(2, Math.min(20, rails));
  const clean = text.replace(/\s+/g, "");
  if (!clean) return { output: "" };
  const pattern: number[] = [];
  let r = 0;
  let dir = 1;
  for (let i = 0; i < clean.length; i++) {
    pattern.push(r);
    if (r === 0) dir = 1;
    else if (r === n - 1) dir = -1;
    r += dir;
  }
  if (!decrypt) {
    let out = "";
    for (let row = 0; row < n; row++)
      for (let i = 0; i < clean.length; i++) if (pattern[i] === row) out += clean[i];
    return { output: out, note: `Zig-zag over ${n} rails, read row by row.` };
  }
  const res = new Array(clean.length).fill("");
  let p = 0;
  for (let row = 0; row < n; row++)
    for (let i = 0; i < clean.length; i++) if (pattern[i] === row) res[i] = clean[p++];
  return { output: res.join(""), note: `Rebuilt the zig-zag across ${n} rails.` };
}

export function columnar(text: string, key: string, decrypt = false) {
  const k = key.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (k.length < 2) return { output: "", error: "Key needs at least 2 characters." };
  const clean = text.replace(/\s+/g, "").toUpperCase();
  const cols = k.length;
  const order = k
    .split("")
    .map((ch, i) => ({ ch, i }))
    .sort((a, b) => (a.ch === b.ch ? a.i - b.i : a.ch < b.ch ? -1 : 1))
    .map((o) => o.i);
  const rows = Math.ceil(clean.length / cols);
  if (!decrypt) {
    let out = "";
    for (const c of order)
      for (let rr = 0; rr < rows; rr++) {
        const ch = clean[rr * cols + c];
        if (ch) out += ch;
      }
    return { output: out, note: `Columns read in alphabetical key order: ${k}` };
  }
  const colLens = new Array(cols).fill(0);
  for (let i = 0; i < clean.length; i++) colLens[i % cols]++;
  const grid: string[][] = Array.from({ length: rows }, () => new Array(cols).fill(""));
  let pos = 0;
  for (const c of order) {
    for (let rr = 0; rr < (colLens[c] ?? 0); rr++) grid[rr]![c] = clean[pos++] ?? "";
  }
  return { output: grid.flat().join(""), note: `Key order: ${k}` };
}

function playfairGrid(key: string) {
  const seen = new Set<string>();
  const cleanKey = (key + A).replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const chars: string[] = [];
  for (const ch of cleanKey.toUpperCase()) {
    if (!seen.has(ch)) {
      seen.add(ch);
      chars.push(ch);
    }
  }
  return chars.slice(0, 25);
}

export function playfair(text: string, key: string, decrypt = false) {
  const grid = playfairGrid(key.toUpperCase());
  const cell = (i: number) => grid[i] ?? "A";
  const pos = (ch: string | undefined): [number, number] => {
    const i = grid.indexOf(ch ?? "A");
    return [Math.floor(i / 5), i % 5];
  };
  let letters = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const pairs: string[] = [];
  for (let i = 0; i < letters.length; ) {
    const a = letters[i];
    let b = letters[i + 1];
    if (!b || a === b) {
      b = "X";
      i += 1;
    } else i += 2;
    pairs.push(a + b);
  }
  const steps: TraceStep[] = [];
  const shift = decrypt ? 4 : 1;
  let out = "";
  for (const pair of pairs) {
    const [r1, c1] = pos(pair[0]);
    const [r2, c2] = pos(pair[1]);
    let x: string;
    let y: string;
    let rule: string;
    if (r1 === r2) {
      x = cell(r1 * 5 + ((c1 + shift) % 5));
      y = cell(r2 * 5 + ((c2 + shift) % 5));
      rule = "same row → slide sideways";
    } else if (c1 === c2) {
      x = cell(((r1 + shift) % 5) * 5 + c1);
      y = cell(((r2 + shift) % 5) * 5 + c2);
      rule = "same column → slide down";
    } else {
      x = cell(r1 * 5 + c2);
      y = cell(r2 * 5 + c1);
      rule = "rectangle → swap columns";
    }
    out += x + y;
    if (steps.length < 10) steps.push({ label: `${pair} → ${x}${y}`, detail: rule });
  }
  return {
    output: out.replace(/(.{2})/g, "$1 ").trim(),
    steps,
    note: `Square: ${grid.join("").replace(/(.{5})/g, "$1 ").trim()}`,
  };
}

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.", "-": "-....-",
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

export function morse(text: string, decrypt = false) {
  if (decrypt) {
    const out = text
      .trim()
      .split(/\s*\/\s*|\s{2,}/)
      .map((word) =>
        word
          .trim()
          .split(/\s+/)
          .map((code) => MORSE_REV[code] ?? "")
          .join(""),
      )
      .join(" ");
    return { output: out };
  }
  const out = text
    .toUpperCase()
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((ch) => MORSE[ch] ?? "")
        .filter(Boolean)
        .join(" "),
    )
    .join(" / ");
  return { output: out };
}

export function xorCipher(text: string, key: string) {
  if (!key) return { output: "", error: "Enter a key." };
  const bytes = new TextEncoder().encode(text);
  const kb = new TextEncoder().encode(key);
  const out = Array.from(bytes, (b, i) => (b ^ kb[i % kb.length]!).toString(16).padStart(2, "0"));
  const steps: TraceStep[] = Array.from(bytes)
    .slice(0, 8)
    .map((b, i) => ({
      label: `${b.toString(2).padStart(8, "0")} ⊕ ${kb[i % kb.length]!.toString(2).padStart(8, "0")}`,
      detail: `= 0x${(b ^ kb[i % kb.length]!).toString(16).padStart(2, "0")}`,
    }));
  return { output: out.join(" "), steps, note: "XOR is its own inverse: apply the same key again." };
}

export function xorDecipher(hex: string, key: string) {
  if (!key) return { output: "", error: "Enter a key." };
  const clean = hex.replace(/[^0-9a-f]/gi, "");
  if (clean.length % 2) return { output: "", error: "Hex input must have an even number of digits." };
  const bytes = clean.match(/.{2}/g) ?? [];
  const kb = new TextEncoder().encode(key);
  const out = bytes.map((h, i) => parseInt(h, 16) ^ kb[i % kb.length]!!);
  return { output: new TextDecoder().decode(new Uint8Array(out)) };
}

export function frequencyAnalysis(text: string) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return { output: "", error: "Enter some letters to analyse." };
  const counts = new Map<string, number>();
  for (const ch of letters) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const steps: TraceStep[] = sorted.slice(0, 12).map(([ch, n]) => ({
    label: `${ch} — ${n} occurrence${n === 1 ? "" : "s"}`,
    detail: `${((n / letters.length) * 100).toFixed(1)} % of ${letters.length} letters`,
  }));
  const ic =
    [...counts.values()].reduce((s, n) => s + n * (n - 1), 0) /
    (letters.length * (letters.length - 1) || 1);
  return {
    output: sorted.map(([ch, n]) => `${ch}:${n}`).join("  "),
    steps,
    note: `Index of coincidence ≈ ${ic.toFixed(4)} (English ≈ 0.0667, random ≈ 0.0385). Values near 0.067 hint at a monoalphabetic cipher.`,
  };
}

export function caesarBruteForce(text: string) {
  const steps: TraceStep[] = [];
  for (let k = 1; k < 26; k++)
    steps.push({ label: `shift ${String(k).padStart(2, "0")}`, detail: caesar(text, k, true).output });
  return { output: `${25} candidate plaintexts`, steps, note: "Scan for a line that reads as language — that is the key." };
}
