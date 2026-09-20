import { bytesToHex, bytesToBase64, toBytes } from "./crypto/encoding";
import { isPrime } from "./crypto/numbertheory";

export type DetectedType =
  | "jwt"
  | "pem"
  | "ssh-key"
  | "password-hash"
  | "hash"
  | "uuid"
  | "crypto-address"
  | "base32"
  | "base58"
  | "url-encoded"
  | "morse"
  | "c-array"
  | "caesar"
  | "rot13"
  | "atbash"
  | "baconian"
  | "substitution"
  | "vigenere"
  | "hex"
  | "base64"
  | "binary"
  | "decimal"
  | "ascii";

export interface DetectionResult {
  raw: string;
  detectedType: DetectedType;
  typeLabel: string;
  badge: string;
  confidence: "certain" | "likely" | "possible";
  description: string;
  decodedPreview?: string | undefined;
  entropy: {
    bitsPerByte: number; // 0 to 8
    classification: "Low (Natural Text)" | "Medium (Structured / Base64)" | "High (Encrypted / Compressed)";
    description: string;
  };
  stats?: {
    length: number;
    byteLength: number;
    indexOfCoincidence?: number | undefined;
    printableAsciiPct: number;
  } | undefined;
  hashCandidate?: {
    name: string;
    bits: number;
    security: "Broken" | "Legacy" | "Approved Standard";
  } | undefined;
  possibleHashes?: string[] | undefined;
  jwtParsed?: {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
    isExpired?: boolean | undefined;
    algorithm?: string | undefined;
  } | undefined;
  representations: {
    ascii?: string | undefined;
    hex?: string | undefined;
    base64?: string | undefined;
    binary?: string | undefined;
    decimal?: string | undefined;
  };
  details: { label: string; value: string }[];
  suggestedActions: { label: string; url: string; toolId: string }[];
}

// Compute Shannon Entropy in bits per byte (0.00 to 8.00)
export function calculateShannonEntropy(bytes: Uint8Array): number {
  if (bytes.length === 0) return 0;
  const counts = new Uint32Array(256);
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b !== undefined) {
      const current = counts[b];
      if (current !== undefined) counts[b] = current + 1;
    }
  }

  let entropy = 0;
  const len = bytes.length;
  for (let i = 0; i < 256; i++) {
    const c = counts[i];
    if (c !== undefined && c > 0) {
      const p = c / len;
      entropy -= p * Math.log2(p);
    }
  }
  return Math.min(8, Math.max(0, entropy));
}

// Compute Index of Coincidence (IC) for alphabetic characters
export function calculateIndexOfCoincidence(text: string): number {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
  const N = letters.length;
  if (N <= 1) return 0;

  const counts = new Uint32Array(26);
  for (let i = 0; i < N; i++) {
    const code = letters.charCodeAt(i) - 65;
    if (code >= 0 && code < 26) {
      const c = counts[code];
      if (c !== undefined) counts[code] = c + 1;
    }
  }

  let sum = 0;
  for (let i = 0; i < 26; i++) {
    const n = counts[i];
    if (n !== undefined && n > 1) {
      sum += n * (n - 1);
    }
  }
  return sum / (N * (N - 1));
}

// Helper to check if string of bytes is printable ASCII
function isPrintableAscii(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return false;
  let printable = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] ?? 0;
    if (b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)) {
      printable++;
    }
  }
  return printable / bytes.length >= 0.88;
}

// Convert bytes to readable ASCII string (dots for non-printable)
function bytesToReadableString(bytes: Uint8Array): string {
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    return decoder.decode(bytes);
  } catch {
    return Array.from(bytes)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");
  }
}

// Base64URL decode helper
function decodeBase64Url(str: string): string | null {
  try {
    const clean = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
    return atob(padded);
  } catch {
    return null;
  }
}

// Base32 Decode Helper (RFC 4648)
function decodeBase32(input: string): Uint8Array | null {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  if (!clean || !/^[A-Z2-7]+$/.test(clean)) return null;

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]!);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

// Morse Code Dictionary
const MORSE_MAP: Record<string, string> = {
  ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F", "--.": "G",
  "....": "H", "..": "I", ".---": "J", "-.-": "K", ".-..": "L", "--": "M", "-.": "N",
  "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T", "..-": "U",
  "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y", "--..": "Z", "-----": "0",
  ".----": "1", "..---": "2", "...--": "3", "....-": "4", ".....": "5", "-....": "6",
  "--...": "7", "---..": "8", "----.": "9", ".-.-.-": ".", "--..--": ",", "..--..": "?",
  "-.-.--": "!", "-....-": "-", "-..-.": "/", ".--.-.": "@",
};

function decodeMorseString(raw: string): string | null {
  const tokens = raw.trim().split(/\s+/);
  if (tokens.length === 0) return null;
  let decoded = "";
  let validCount = 0;

  for (const token of tokens) {
    if (token === "/" || token === "|") {
      decoded += " ";
      continue;
    }
    const ch = MORSE_MAP[token];
    if (ch) {
      decoded += ch;
      validCount++;
    } else {
      return null;
    }
  }
  return validCount >= 2 ? decoded : null;
}

// English words vocabulary for classical cipher cryptanalysis & fitness
const COMMON_ENGLISH_WORDS = new Set([
  // Core grammar & syntax
  "THE", "BE", "TO", "OF", "AND", "A", "IN", "THAT", "HAVE", "I", "IT", "FOR",
  "NOT", "ON", "WITH", "HE", "AS", "YOU", "DO", "AT", "THIS", "BUT", "HIS", "BY",
  "FROM", "THEY", "WE", "SAY", "HER", "SHE", "OR", "AN", "WILL", "MY", "ONE", "ALL",
  "WOULD", "THERE", "THEIR", "WHAT", "SO", "UP", "OUT", "IF", "ABOUT", "WHO", "GET",
  "WHICH", "GO", "ME", "WHEN", "MAKE", "CAN", "LIKE", "TIME", "NO", "JUST", "HIM",
  "KNOW", "TAKE", "PEOPLE", "INTO", "YEAR", "YOUR", "GOOD", "SOME", "COULD", "THEM",
  "SEE", "OTHER", "THAN", "THEN", "NOW", "LOOK", "ONLY", "COME", "ITS", "OVER",
  "THINK", "ALSO", "BACK", "AFTER", "USE", "TWO", "HOW", "OUR", "WORK", "FIRST",
  "WELL", "WAY", "EVEN", "NEW", "WANT", "BECAUSE", "ANY", "THESE", "GIVE", "DAY",
  "MOST", "US", "IS", "ARE", "WAS", "WERE", "BEEN", "HAS", "HAD", "SHALL", "SHOULD",
  // Common Crypto, Classical Cipher, and Military/CTF Vocabulary
  "HELLO", "WORLD", "SECRET", "CIPHER", "CRYPTO", "ATTACK", "SECURITY", "DAWN",
  "MIDNIGHT", "MEET", "PASSWORD", "KEY", "KEYS", "BROWN", "FOX", "JUMPS", "LAZY",
  "DOG", "QUICK", "HELP", "FLAG", "SYSTEM", "HIDDEN", "MESSAGE", "PRIVATE", "PUBLIC",
  "ALICE", "BOB", "EVE", "MALLORY", "TRENT", "DEFEND", "CASTLE", "EAST", "WALL",
  "TREASURE", "BURIED", "COVE", "ISLAND", "FLEET", "HARBOR", "ORDERS", "COMMAND",
  "ENCRYPT", "DECRYPT", "SUBSTITUTION", "TRANSPOSITION", "VICTORY", "CONFIDENTIAL",
  "SPECIAL", "AGENT", "OPERATION", "BASE", "REPORT", "INFORMATION", "NUMBER",
]);

// Standard English Letter Frequencies (percentages)
const ENGLISH_FREQ: Record<string, number> = {
  A: 0.082, B: 0.015, C: 0.028, D: 0.043, E: 0.127, F: 0.022, G: 0.020,
  H: 0.061, I: 0.070, J: 0.002, K: 0.008, L: 0.040, M: 0.024, N: 0.067,
  O: 0.075, P: 0.019, Q: 0.001, R: 0.060, S: 0.063, T: 0.091, U: 0.028,
  V: 0.010, W: 0.024, X: 0.002, Y: 0.020, Z: 0.001,
};

// Shift string backwards by 'shift' positions (i.e. decrypt Caesar with key 'shift')
function caesarShiftString(str: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return str.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base - s + 26) % 26) + base);
  });
}

// Reverse alphabet reflection: A↔Z, B↔Y, C↔X
function atbashString(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(base + (25 - (code - base)));
  });
}

// Baconian cipher 5-bit lookup table
const BACON_MAP: Record<string, string> = {
  "AAAAA": "A", "AAAAB": "B", "AAABA": "C", "AAABB": "D", "AABAA": "E",
  "AABAB": "F", "AABBA": "G", "AABBB": "H", "ABAAA": "I", "ABAAB": "K",
  "ABABA": "L", "ABABB": "M", "ABBAA": "N", "ABBAB": "O", "ABBBA": "P",
  "ABBBB": "Q", "BAAAA": "R", "BAAAB": "S", "BAABA": "T", "BAABB": "U",
  "BABAA": "W", "BABAB": "X", "BABBA": "Y", "BABBB": "Z",
};

function decodeBaconian(str: string): string | null {
  const clean = str.toUpperCase().replace(/[^AB]/g, "");
  if (clean.length < 10 || clean.length % 5 !== 0) return null;
  let decoded = "";
  for (let i = 0; i < clean.length; i += 5) {
    const chunk = clean.slice(i, i + 5);
    const letter = BACON_MAP[chunk];
    if (!letter) return null;
    decoded += letter;
  }
  return decoded.length >= 2 ? decoded : null;
}

// Measure lexical and frequency fitness against the English language
function evaluateEnglishFitness(text: string): { score: number; wordHits: number; totalWords: number } {
  const upper = text.toUpperCase();
  const words = upper.split(/[^A-Z]+/).filter((w) => w.length >= 2);
  let wordHits = 0;
  for (const w of words) {
    if (COMMON_ENGLISH_WORDS.has(w)) {
      wordHits += w.length >= 4 ? 2 : 1;
    }
  }

  const letters = upper.replace(/[^A-Z]/g, "");
  let letterCorrelation = 0;
  if (letters.length > 0) {
    for (let i = 0; i < letters.length; i++) {
      const ch = letters[i]!;
      letterCorrelation += (ENGLISH_FREQ[ch] || 0.001) * 100;
    }
    letterCorrelation = letterCorrelation / letters.length;
  }

  const score = wordHits * 50 + letterCorrelation * 10;
  return { score, wordHits, totalWords: words.length };
}

// Comprehensive Classical Text Cipher Analyzer
function detectClassicalCipher(
  raw: string,
  ic: number,
  entropyData: DetectionResult["entropy"],
  statsData: DetectionResult["stats"]
): DetectionResult | null {
  const lettersOnly = raw.replace(/[^A-Za-z]/g, "");
  if (lettersOnly.length < 5) return null;

  // 1. Baconian Steganographic Cipher Check (A/B quintuplets)
  const cleanBacon = raw.toUpperCase().replace(/[^AB]/g, "");
  if (cleanBacon.length >= 10 && cleanBacon.length % 5 === 0 && /^[AB\s]+$/i.test(raw)) {
    const baconDecoded = decodeBaconian(raw);
    if (baconDecoded) {
      return {
        raw,
        detectedType: "baconian",
        typeLabel: "Baconian Steganographic Cipher",
        badge: `${baconDecoded.length} Decoded Letters`,
        confidence: "certain",
        description: "Francis Bacon 5-bit binary cipher encoding alphabet letters using two symbols (A and B).",
        decodedPreview: `Decoded Plaintext: "${baconDecoded}"\n5-bit Pattern: ${cleanBacon.match(/.{1,5}/g)?.join(" ")}`,
        entropy: entropyData,
        stats: statsData,
        representations: {
          ascii: baconDecoded,
          hex: bytesToHex(toBytes(baconDecoded), true),
          base64: bytesToBase64(toBytes(baconDecoded)),
        },
        details: [
          { label: "Decoded Message", value: baconDecoded },
          { label: "5-bit Blocks", value: `${cleanBacon.length / 5} quintuplets` },
        ],
        suggestedActions: [
          { label: "Baconian Cipher Tool", url: "/tools/baconian", toolId: "baconian" },
        ],
      };
    }
  }

  // Check if raw input is already valid, readable English text
  const rawFitness = evaluateEnglishFitness(raw);
  const isAlreadyEnglish =
    rawFitness.totalWords > 0 &&
    (rawFitness.wordHits >= 2 || (rawFitness.wordHits >= 1 && rawFitness.totalWords <= 2) || (rawFitness.wordHits / rawFitness.totalWords >= 0.4));

  if (isAlreadyEnglish) {
    return null; // Let standard Plaintext handler present it accurately
  }

  // 2. Caesar Shift Cipher Check (test shifts k = 1 to 25)
  let bestShift = -1;
  let bestScore = -1;
  let bestPlaintext = "";
  let bestWordHits = 0;

  for (let k = 1; k <= 25; k++) {
    const candidate = caesarShiftString(raw, k);
    const fitness = evaluateEnglishFitness(candidate);
    if (fitness.wordHits > 0 && fitness.score > bestScore) {
      bestScore = fitness.score;
      bestShift = k;
      bestPlaintext = candidate;
      bestWordHits = fitness.wordHits;
    }
  }

  // If a Caesar shift produces high-confidence English words
  if (bestShift !== -1 && bestWordHits >= 1 && bestScore > rawFitness.score + 25) {
    const isRot13 = bestShift === 13;
    const typeLabel = isRot13 ? "ROT13 Ciphertext (Shift k=13)" : `Caesar Ciphertext (Shift Key k=${bestShift})`;
    const badge = isRot13 ? "ROT13 (A↔N)" : `Shift k=${bestShift}`;

    return {
      raw,
      detectedType: isRot13 ? "rot13" : "caesar",
      typeLabel,
      badge,
      confidence: "likely",
      description: isRot13
        ? "Monoalphabetic shift cipher of 13 positions (involution A↔N, B↔O)."
        : `Classical Caesar shift cipher displaced by ${bestShift} positions in the alphabet.`,
      decodedPreview: `Decrypted Plaintext (Shift Key k=${bestShift}):\n"${bestPlaintext}"`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        ascii: bestPlaintext,
        hex: bytesToHex(toBytes(bestPlaintext), true),
        base64: bytesToBase64(toBytes(bestPlaintext)),
      },
      details: [
        { label: "Decrypted Plaintext", value: bestPlaintext },
        { label: "Identified Key", value: `k = ${bestShift} (Shift ${bestShift} positions backward)` },
        { label: "Alphabet Mapping", value: `A → ${String.fromCharCode(65 + bestShift)}, B → ${String.fromCharCode(66 + bestShift)}` },
        { label: "English Words Matched", value: `${bestWordHits} vocabulary matches` },
      ],
      suggestedActions: [
        { label: isRot13 ? "Open ROT13 Tool" : "Open Caesar Tool", url: isRot13 ? "/tools/rot13" : "/tools/caesar", toolId: isRot13 ? "rot13" : "caesar" },
        { label: "Caesar Brute-Force Cracker", url: "/tools/caesar-crack", toolId: "caesar-crack" },
      ],
    };
  }

  // 3. Atbash Cipher Check (A↔Z, B↔Y, C↔X)
  const atbashCandidate = atbashString(raw);
  const atbashFitness = evaluateEnglishFitness(atbashCandidate);
  if (atbashFitness.wordHits >= 1 && atbashFitness.score > rawFitness.score + 25) {
    return {
      raw,
      detectedType: "atbash",
      typeLabel: "Atbash Ciphertext",
      badge: "Monoalphabetic Reflection (A↔Z)",
      confidence: "likely",
      description: "Hebrew classical substitution cipher reversing the alphabet (A↔Z, B↔Y, C↔X).",
      decodedPreview: `Decrypted Plaintext (Atbash Reflection):\n"${atbashCandidate}"`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        ascii: atbashCandidate,
        hex: bytesToHex(toBytes(atbashCandidate), true),
        base64: bytesToBase64(toBytes(atbashCandidate)),
      },
      details: [
        { label: "Decrypted Plaintext", value: atbashCandidate },
        { label: "Cipher Type", value: "Atbash (Affinely: E(x) = (-x - 1) mod 26)" },
        { label: "Involution Property", value: "Encrypting twice returns original plaintext" },
      ],
      suggestedActions: [
        { label: "Open Atbash Tool", url: "/tools/atbash", toolId: "atbash" },
        { label: "Affine Cipher Tool", url: "/tools/affine", toolId: "affine" },
      ],
    };
  }

  // 4. Monoalphabetic Substitution Cipher (via Index of Coincidence κ >= 0.055)
  // When text is long enough and exhibits English frequency peaks, but Caesar/Atbash didn't solve it:
  if (lettersOnly.length >= 20 && ic >= 0.055 && rawFitness.wordHits === 0) {
    return {
      raw,
      detectedType: "substitution",
      typeLabel: "Monoalphabetic Substitution Cipher",
      badge: `Monoalphabetic (IC = ${ic.toFixed(4)})`,
      confidence: "likely",
      description: `The Index of Coincidence (κ = ${ic.toFixed(4)}) closely matches natural English (κ ≈ 0.0667), proving unigram letter distribution preservation under single-alphabet substitution.`,
      decodedPreview: `Statistical Analysis:\n- Index of Coincidence: ${ic.toFixed(4)} (English ≈ 0.0667)\n- Preserved letter peaks: Likely Affine, Playfair, or Random Key Substitution\n- Cryptanalysis: Frequency Analysis & letter mapping workbench`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        ascii: raw,
        hex: bytesToHex(toBytes(raw), true),
        base64: bytesToBase64(toBytes(raw)),
      },
      details: [
        { label: "Index of Coincidence (IC)", value: `κ = ${ic.toFixed(4)} (Matches monoalphabetic English)` },
        { label: "Cipher Category", value: "Monoalphabetic Substitution (Affine / Keyword / Simple)" },
        { label: "Recommended Attack", value: "Frequency Analysis (ETAOIN SHRDLU unigram & digraph mapping)" },
      ],
      suggestedActions: [
        { label: "Open Frequency Analysis Desk", url: "/attacks", toolId: "attacks" },
        { label: "Affine Cipher Tool", url: "/tools/affine", toolId: "affine" },
      ],
    };
  }

  // 5. Polyalphabetic Cipher (Vigenère / Beaufort / Autokey via suppressed Index of Coincidence κ <= 0.048)
  if (lettersOnly.length >= 25 && ic <= 0.048 && ic >= 0.032 && rawFitness.wordHits === 0) {
    return {
      raw,
      detectedType: "vigenere",
      typeLabel: "Polyalphabetic Ciphertext (Vigenère / Beaufort)",
      badge: `Suppressed IC (κ = ${ic.toFixed(4)})`,
      confidence: "likely",
      description: `The Index of Coincidence (κ = ${ic.toFixed(4)}) is suppressed towards random distribution (κ ≈ 0.0385), typical of periodic multi-alphabet polyalphabetic shifting.`,
      decodedPreview: `Statistical Analysis:\n- Index of Coincidence: ${ic.toFixed(4)} (Random/Flattened ≈ 0.0385)\n- Polyalphabetic shifts have flattened standard English frequency spikes\n- Cryptanalysis: Kasiski examination & Friedman test to find key period m`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        ascii: raw,
        hex: bytesToHex(toBytes(raw), true),
        base64: bytesToBase64(toBytes(raw)),
      },
      details: [
        { label: "Index of Coincidence (IC)", value: `κ = ${ic.toFixed(4)} (Suppressed by polyalphabetic shifting)` },
        { label: "Cipher Family", value: "Polyalphabetic (Vigenère / Beaufort / Autokey)" },
        { label: "Known Attacks", value: "Kasiski examination for repeated n-grams + Friedman test for key length m" },
      ],
      suggestedActions: [
        { label: "Open Vigenère Cipher Tool", url: "/tools/vigenere", toolId: "vigenere" },
        { label: "Attack Simulators Lab", url: "/attacks", toolId: "attacks" },
      ],
    };
  }

  return null;
}

// Main Intelligent Format Auto-Detector
export function inspectFormat(input: string): DetectionResult {
  const raw = input.trim();
  const rawBytes = toBytes(raw);
  const entropyBits = calculateShannonEntropy(rawBytes);
  const ic = calculateIndexOfCoincidence(raw);

  let entropyClass: "Low (Natural Text)" | "Medium (Structured / Base64)" | "High (Encrypted / Compressed)";
  let entropyDesc: string;

  if (entropyBits < 3.8) {
    entropyClass = "Low (Natural Text)";
    entropyDesc = "Typical of natural English language, structured code, or repetitive bytes.";
  } else if (entropyBits <= 6.2) {
    entropyClass = "Medium (Structured / Base64)";
    entropyDesc = "Typical of Base64 strings, formatted JSON, or mixed alphanumeric tokens.";
  } else {
    entropyClass = "High (Encrypted / Compressed)";
    entropyDesc = "Indistinguishable from true random bits. Typical of ciphertext (AES/ChaCha) or cryptographic hash digests.";
  }

  const entropyData = {
    bitsPerByte: Number(entropyBits.toFixed(2)),
    classification: entropyClass,
    description: entropyDesc,
  };

  const statsData: DetectionResult["stats"] = {
    length: raw.length,
    byteLength: rawBytes.length,
    indexOfCoincidence: Number(ic.toFixed(4)),
    printableAsciiPct: rawBytes.length > 0 ? Number(((rawBytes.filter((b) => (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13).length / rawBytes.length) * 100).toFixed(1)) : 0,
  };

  if (!raw) {
    return {
      raw: "",
      detectedType: "ascii",
      typeLabel: "Empty Buffer",
      badge: "Empty",
      confidence: "certain",
      description: "Enter or paste any cryptographic string to automatically inspect its format, entropy, and algorithms.",
      entropy: {
        bitsPerByte: 0,
        classification: "Low (Natural Text)",
        description: "Zero bytes evaluated.",
      },
      stats: statsData,
      representations: {},
      details: [],
      suggestedActions: [],
    };
  }

  // 1. JSON Web Token (JWT) Check
  // Pattern: header.payload.signature (3 segments separated by '.')
  const jwtParts = raw.split(".");
  if (jwtParts.length === 3 && jwtParts[0] && jwtParts[1] && jwtParts[2] && /^[A-Za-z0-9_-]+$/.test(jwtParts[0]) && /^[A-Za-z0-9_-]+$/.test(jwtParts[1])) {
    const headerStr = decodeBase64Url(jwtParts[0]);
    const payloadStr = decodeBase64Url(jwtParts[1]);
    if (headerStr && payloadStr) {
      try {
        const header = JSON.parse(headerStr);
        const payload = JSON.parse(payloadStr);
        if (typeof header === "object" && header !== null && ("alg" in header || "typ" in header)) {
          const alg = String(header.alg || "Unknown");
          const typ = String(header.typ || "JWT");
          const exp = typeof payload.exp === "number" ? new Date(payload.exp * 1000).toISOString() : undefined;
          const isExpired = typeof payload.exp === "number" ? Date.now() > payload.exp * 1000 : undefined;
          const sub = payload.sub ? String(payload.sub) : undefined;
          const iss = payload.iss ? String(payload.iss) : undefined;

          return {
            raw,
            detectedType: "jwt",
            typeLabel: "JSON Web Token (JWT)",
            badge: `${typ} (${alg})`,
            confidence: "certain",
            description: `RFC 7519 Compact Serialization. Signed with ${alg} cryptographic algorithm.`,
            decodedPreview: `Header: ${JSON.stringify(header, null, 2)}\n\nPayload: ${JSON.stringify(payload, null, 2)}`,
            entropy: entropyData,
            stats: statsData,
            jwtParsed: {
              header,
              payload,
              signature: jwtParts[2],
              isExpired,
              algorithm: alg,
            },
            representations: {
              ascii: `JWT (${alg}) sub: ${sub || "N/A"}`,
              hex: bytesToHex(rawBytes, true),
              base64: bytesToBase64(rawBytes),
            },
            details: [
              { label: "Token Algorithm (alg)", value: alg },
              { label: "Token Type (typ)", value: typ },
              { label: "Subject (sub)", value: sub || "Not specified" },
              { label: "Issuer (iss)", value: iss || "Not specified" },
              { label: "Expiration (exp)", value: exp ? `${exp} (${isExpired ? "EXPIRED" : "VALID"})` : "No expiration set" },
              { label: "Signature Segment", value: `${jwtParts[2].length} Base64URL characters` },
            ],
            suggestedActions: [
              { label: "Base64 & Encoding Lab", url: "/tools/base64", toolId: "base64" },
              { label: "HMAC Authentication", url: "/tools/hmac", toolId: "hmac" },
              { label: "Check Standards Matrix", url: "/matrix", toolId: "matrix" },
            ],
          };
        }
      } catch {
        // Not a JSON object in JWT header
      }
    }
  }

  // 2. PEM Encoded Keys & Certificates
  const pemMatch = raw.match(/-----BEGIN ([A-Z0-9 ]+)-----[\s\S]+?-----END \1-----/);
  if (pemMatch && pemMatch[1]) {
    const pemType = pemMatch[1].trim();
    const base64Body = raw.replace(/-----BEGIN [A-Z0-9 ]+-----/, "").replace(/-----END [A-Z0-9 ]+-----/, "").replace(/\s+/g, "");
    let decodedLen = 0;
    try {
      decodedLen = atob(base64Body).length;
    } catch {
      decodedLen = Math.floor((base64Body.length * 3) / 4);
    }

    return {
      raw,
      detectedType: "pem",
      typeLabel: `PEM (${pemType})`,
      badge: `${decodedLen * 8}-bit DER Payload`,
      confidence: "certain",
      description: `RFC 7468 / PKCS Privacy-Enhanced Mail container wrapping an ASN.1 DER structure.`,
      decodedPreview: `Container Type: ${pemType}\nDER Encoded Length: ${decodedLen} bytes (${decodedLen * 8} bits)\nBase64 Lines: ${raw.split("\n").length}`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        base64: base64Body.slice(0, 64) + "...",
      },
      details: [
        { label: "PEM Header Tag", value: pemType },
        { label: "DER Binary Size", value: `${decodedLen} bytes` },
        { label: "Encoding Format", value: "RFC 7468 (Base64 with ASCII Armor)" },
      ],
      suggestedActions: [
        { label: "RSA Cryptosystem Tool", url: "/tools/rsa", toolId: "rsa" },
        { label: "Algorithm Matrix & FIPS Standards", url: "/matrix", toolId: "matrix" },
      ],
    };
  }

  // 3. OpenSSH Public Keys
  const sshMatch = raw.match(/^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521|sk-ssh-ed25519@openssh.com)\s+([A-Za-z0-9+/=]+)(?:\s+(.*))?$/);
  if (sshMatch && sshMatch[1] && sshMatch[2]) {
    const keyType = sshMatch[1];
    const keyDataB64 = sshMatch[2];
    const comment = sshMatch[3] ? sshMatch[3].trim() : "None";
    let keyBytesLen = 0;
    try {
      keyBytesLen = atob(keyDataB64).length;
    } catch {
      keyBytesLen = Math.floor((keyDataB64.length * 3) / 4);
    }

    return {
      raw,
      detectedType: "ssh-key",
      typeLabel: `OpenSSH Public Key (${keyType})`,
      badge: `${keyType} (${keyBytesLen}B)`,
      confidence: "certain",
      description: `RFC 4253 / OpenSSH public key wire format for SSH authentication.`,
      decodedPreview: `Key Type: ${keyType}\nKey Length: ${keyBytesLen} bytes (${keyBytesLen * 8} bits)\nComment / Identity: ${comment}`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        base64: keyDataB64,
      },
      details: [
        { label: "Public Key Algorithm", value: keyType },
        { label: "Wire Format Size", value: `${keyBytesLen} bytes` },
        { label: "Comment / Principal", value: comment },
        { label: "Post-Quantum Security", value: keyType.includes("ed25519") || keyType.includes("rsa") ? "Vulnerable to Shor's Algorithm" : "Classical Only" },
      ],
      suggestedActions: [
        { label: "Check Standards Matrix", url: "/matrix", toolId: "matrix" },
        { label: "Base64 Converter", url: "/tools/base64", toolId: "base64" },
      ],
    };
  }

  // 4. Password Hashes & Key Derivations (Bcrypt, Argon2, Linux Crypt, PBKDF2)
  // Bcrypt: $2a$, $2b$, $2y$ + 2-digit cost + $ + 53 chars
  const bcryptMatch = raw.match(/^\$2[aby]\$([0-9]{2})\$([A-Za-z0-9./]{22})([A-Za-z0-9./]{31})$/);
  if (bcryptMatch && bcryptMatch[1] && bcryptMatch[2] && bcryptMatch[3]) {
    const cost = parseInt(bcryptMatch[1], 10);
    const iterations = Math.pow(2, cost);
    return {
      raw,
      detectedType: "password-hash",
      typeLabel: "Bcrypt Password Hash",
      badge: `Cost ${cost} (2^${cost} = ${iterations.toLocaleString()} rounds)`,
      confidence: "certain",
      description: `Eksblowfish-based password key derivation function. Cost factor 2^${cost}.`,
      decodedPreview: `Algorithm: Bcrypt ($2b$)\nWork Factor: 2^${cost} (${iterations.toLocaleString()} iterations)\nSalt (128-bit Base64): ${bcryptMatch[2]}\nChecksum (184-bit Base64): ${bcryptMatch[3]}`,
      entropy: entropyData,
      stats: statsData,
      representations: {},
      details: [
        { label: "KDF Algorithm", value: "Bcrypt (Blowfish-based)" },
        { label: "Cost Factor", value: `${cost} (${iterations.toLocaleString()} rounds)` },
        { label: "Salt Length", value: "128 bits (16 bytes)" },
        { label: "Security Status", value: cost >= 12 ? "Strong (Standard)" : "Low cost factor (consider cost >= 12)" },
      ],
      suggestedActions: [
        { label: "Password Storage Guidance", url: "/matrix", toolId: "matrix" },
        { label: "PBKDF2 & KDF Tool", url: "/tools/pbkdf2", toolId: "pbkdf2" },
      ],
    };
  }

  // Argon2: $argon2id$, $argon2i$, $argon2d$
  const argonMatch = raw.match(/^\$argon2(id|i|d)\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/);
  if (argonMatch && argonMatch[1] && argonMatch[2] && argonMatch[3] && argonMatch[4] && argonMatch[5]) {
    const variant = argonMatch[1];
    const memKiB = parseInt(argonMatch[3], 10);
    const timeIter = parseInt(argonMatch[4], 10);
    const parallelism = parseInt(argonMatch[5], 10);
    return {
      raw,
      detectedType: "password-hash",
      typeLabel: `Argon2${variant.toUpperCase()} Password Hash`,
      badge: `${memKiB >= 1024 ? (memKiB / 1024).toFixed(0) + " MB" : memKiB + " KiB"}, t=${timeIter}, p=${parallelism}`,
      confidence: "certain",
      description: `RFC 9106 Password Hashing Competition (PHC) Winner. Memory-hard key derivation function.`,
      decodedPreview: `Variant: Argon2${variant}\nMemory: ${memKiB} KiB (${(memKiB / 1024).toFixed(1)} MiB)\nTime (Iterations): ${timeIter}\nParallelism (Lanes): ${parallelism}`,
      entropy: entropyData,
      stats: statsData,
      representations: {},
      details: [
        { label: "Algorithm Variant", value: `Argon2${variant} (RFC 9106)` },
        { label: "Memory Cost (m)", value: `${memKiB.toLocaleString()} KiB` },
        { label: "Time Cost (t)", value: `${timeIter} passes` },
        { label: "Parallelism (p)", value: `${parallelism} threads` },
        { label: "Security Recommendation", value: variant === "id" ? "NIST & RFC 9106 Gold Standard" : "Consider Argon2id for hybrid side-channel resistance" },
      ],
      suggestedActions: [
        { label: "Password Architecture Standards", url: "/matrix", toolId: "matrix" },
        { label: "PBKDF2 Lab", url: "/tools/pbkdf2", toolId: "pbkdf2" },
      ],
    };
  }

  // Linux Crypt: $6$ (SHA-512), $5$ (SHA-256), $1$ (MD5)
  const linuxCryptMatch = raw.match(/^\$([156])\$([a-zA-Z0-9./]+)\$([a-zA-Z0-9./]+)$/);
  if (linuxCryptMatch && linuxCryptMatch[1] && linuxCryptMatch[2] && linuxCryptMatch[3]) {
    const id = linuxCryptMatch[1];
    const salt = linuxCryptMatch[2];
    const algo = id === "6" ? "SHA-512 Crypt" : id === "5" ? "SHA-256 Crypt" : "MD5 Crypt";
    const security = id === "6" ? "Approved Linux Standard" : id === "5" ? "Legacy Linux Standard" : "Broken (MD5 Collision Vulnerable)";
    return {
      raw,
      detectedType: "password-hash",
      typeLabel: `Linux shadow hash (${algo})`,
      badge: algo,
      confidence: "certain",
      description: `glibc /etc/shadow password hash format using ${algo}.`,
      decodedPreview: `Algorithm: ${algo}\nSalt: ${salt}\nHash: ${linuxCryptMatch[3]}`,
      entropy: entropyData,
      stats: statsData,
      representations: {},
      details: [
        { label: "System Origin", value: "UNIX / Linux /etc/shadow" },
        { label: "Hash Algorithm", value: algo },
        { label: "Salt", value: salt },
        { label: "Security Verdict", value: security },
      ],
      suggestedActions: [
        { label: "Check Password Standards Matrix", url: "/matrix", toolId: "matrix" },
      ],
    };
  }

  // 5. UUID / GUID (RFC 4122)
  const uuidMatch = raw.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-([1-5])[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/);
  if (uuidMatch && uuidMatch[1]) {
    const version = uuidMatch[1];
    const vDescriptions: Record<string, string> = {
      "1": "Version 1: Date-time timestamp & MAC hardware address",
      "2": "Version 2: DCE Security with POSIX UID/GID",
      "3": "Version 3: MD5 namespace hash",
      "4": "Version 4: Pseudorandomly generated (122 random bits)",
      "5": "Version 5: SHA-1 namespace hash",
    };
    return {
      raw,
      detectedType: "uuid",
      typeLabel: `UUID v${version} (RFC 4122)`,
      badge: `UUID Version ${version}`,
      confidence: "certain",
      description: vDescriptions[version] || "Universally Unique Identifier",
      decodedPreview: `UUID: ${raw}\nStandard: RFC 4122\nVersion: ${version}\nHex Bytes: ${raw.replace(/-/g, "")}`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        hex: "0x" + raw.replace(/-/g, "").toLowerCase(),
        base64: bytesToBase64(rawBytes),
      },
      details: [
        { label: "RFC Standard", value: "RFC 4122 (128-bit Identifier)" },
        { label: "Version Number", value: `v${version}` },
        { label: "Generation Mechanism", value: vDescriptions[version] || "Unknown" },
      ],
      suggestedActions: [
        { label: "Convert to Hex Bytes", url: "/tools/hex", toolId: "hex" },
      ],
    };
  }

  // 6. Cryptocurrency Addresses
  // Ethereum / EVM Address: 0x followed by 40 hex chars
  if (/^0x[0-9a-fA-F]{40}$/.test(raw)) {
    return {
      raw,
      detectedType: "crypto-address",
      typeLabel: "Ethereum / EVM Address",
      badge: "20-byte Keccak-256 Hash",
      confidence: "certain",
      description: "EVM public account address derived from the rightmost 20 bytes of the Keccak-256 hash of the ECDSA public key.",
      decodedPreview: `Network: Ethereum / EVM Compatible (Polygon, Arbitrum, BSC)\nAddress: ${raw}\nByte Length: 20 bytes (160 bits)`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        hex: raw.toLowerCase(),
      },
      details: [
        { label: "EVM Standard", value: "ERC-55 / SECP256k1 Derived" },
        { label: "Byte Length", value: "20 bytes (160 bits)" },
        { label: "Checksum Validation", value: raw === raw.toLowerCase() || raw === raw.toUpperCase() ? "Unchecked / Lowercase" : "EIP-55 Mixed-Case Checksummed" },
      ],
      suggestedActions: [
        { label: "Inspect in Elliptic Curve Lab", url: "/tools/ecc", toolId: "ecc" },
        { label: "SHA-256 & Keccak Primitives", url: "/tools/sha256", toolId: "sha256" },
      ],
    };
  }

  // Bitcoin Legacy (P2PKH '1...') or Script (P2SH '3...')
  if (/^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(raw)) {
    const isP2PKH = raw.startsWith("1");
    return {
      raw,
      detectedType: "crypto-address",
      typeLabel: isP2PKH ? "Bitcoin Legacy Address (P2PKH)" : "Bitcoin Script Address (P2SH)",
      badge: isP2PKH ? "P2PKH (Base58Check)" : "P2SH (Multisig / SegWit)",
      confidence: "certain",
      description: isP2PKH ? "Pay-to-PubKey-Hash address derived via RIPEMD-160(SHA-256(PubKey))." : "Pay-to-Script-Hash address wrapping script hash.",
      decodedPreview: `Network: Bitcoin Mainnet\nFormat: Base58Check with 4-byte double-SHA256 checksum\nPayload: ${raw}`,
      entropy: entropyData,
      stats: statsData,
      representations: {},
      details: [
        { label: "Network", value: "Bitcoin Mainnet" },
        { label: "Type", value: isP2PKH ? "Legacy P2PKH (Pay to Public Key Hash)" : "P2SH (Pay to Script Hash)" },
        { label: "Encoding", value: "Base58Check (58 glyphs without 0, O, I, l)" },
      ],
      suggestedActions: [
        { label: "Base58 Converter", url: "/tools/base58", toolId: "base58" },
        { label: "Elliptic Curves (SECP256k1)", url: "/tools/ecc", toolId: "ecc" },
      ],
    };
  }

  // Bitcoin Native SegWit (Bech32 'bc1q...' or 'bc1p...')
  if (/^bc1[ac-hj-np-z02-9]{11,71}$/.test(raw)) {
    const isTaproot = raw.startsWith("bc1p");
    return {
      raw,
      detectedType: "crypto-address",
      typeLabel: isTaproot ? "Bitcoin Taproot Address (Bech32m)" : "Bitcoin Native SegWit Address (Bech32)",
      badge: isTaproot ? "BIP-350 (Taproot / Schnorr)" : "BIP-173 (SegWit v0)",
      confidence: "certain",
      description: isTaproot ? "BIP-341/350 Taproot address using Schnorr signatures and Merkleized Alternative Script Trees." : "BIP-173 Native SegWit witness address with BCH error correction.",
      decodedPreview: `Protocol: Bitcoin ${isTaproot ? "Taproot (P2TR)" : "Native SegWit (P2WPKH)"}\nChecksum: Bech32${isTaproot ? "m" : ""}\nAddress: ${raw}`,
      entropy: entropyData,
      stats: statsData,
      representations: {},
      details: [
        { label: "Standard", value: isTaproot ? "BIP-341 / BIP-350 (Taproot)" : "BIP-173 (Bech32 SegWit)" },
        { label: "Signature Scheme", value: isTaproot ? "BIP-340 Schnorr Signatures (64-byte)" : "ECDSA (71-72 byte DER)" },
      ],
      suggestedActions: [
        { label: "Standards Matrix", url: "/matrix", toolId: "matrix" },
      ],
    };
  }

  // Solana Public Key Address (Base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw) && !raw.startsWith("1") && !raw.startsWith("3")) {
    // Distinguish from ordinary text: Base58 string of length 32-44 has high entropy
    if (entropyBits > 4.5) {
      return {
        raw,
        detectedType: "crypto-address",
        typeLabel: "Solana Account / Base58 Public Key",
        badge: "Ed25519 32-Byte Public Key",
        confidence: "likely",
        description: "Solana blockchain account address or Ed25519 public key encoded in Base58.",
        decodedPreview: `Format: Base58 encoded 32-byte Ed25519 key\nString: ${raw}`,
        entropy: entropyData,
        stats: statsData,
        suggestedActions: [
          { label: "Base58 Converter", url: "/tools/base58", toolId: "base58" },
          { label: "Check Standards Matrix", url: "/matrix", toolId: "matrix" },
        ],
        representations: {},
        details: [
          { label: "Cryptographic Primitive", value: "Curve25519 / Ed25519 (Edwards curve)" },
          { label: "Encoding Alphabet", value: "Bitcoin Base58" },
        ],
      };
    }
  }

  // 7. Morse Code
  const morseDecoded = decodeMorseString(raw);
  if (morseDecoded && /^[.\-\s/|]+$/.test(raw)) {
    return {
      raw,
      detectedType: "morse",
      typeLabel: "Morse Code Telegraphy",
      badge: `${morseDecoded.length} Decoded Characters`,
      confidence: "certain",
      description: "Auditory / visual telegraphic code representing alphabet letters by dots and dashes.",
      decodedPreview: `Decoded Plaintext: "${morseDecoded}"`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        ascii: morseDecoded,
        hex: bytesToHex(toBytes(morseDecoded), true),
        base64: bytesToBase64(toBytes(morseDecoded)),
      },
      details: [
        { label: "Decoded Message", value: morseDecoded },
        { label: "Signal Elements", value: `${(raw.match(/[.-]/g) || []).length} pulses` },
      ],
      suggestedActions: [
        { label: "Open Morse Code Tool", url: "/tools/morse", toolId: "morse" },
      ],
    };
  }

  // 8. URL / Percent-Encoded Strings
  if (/%[0-9a-fA-F]{2}/.test(raw)) {
    try {
      const decodedUrl = decodeURIComponent(raw);
      if (decodedUrl !== raw) {
        return {
          raw,
          detectedType: "url-encoded",
          typeLabel: "URL Percent-Encoded String",
          badge: `Decoded (${decodedUrl.length} Chars)`,
          confidence: "certain",
          description: "RFC 3986 percent-encoded URI data representing octets with %XX hexadecimal escapes.",
          decodedPreview: `Decoded Plaintext: "${decodedUrl}"`,
          entropy: entropyData,
          stats: statsData,
          representations: {
            ascii: decodedUrl,
            hex: bytesToHex(toBytes(decodedUrl), true),
            base64: bytesToBase64(toBytes(decodedUrl)),
          },
          details: [
            { label: "Decoded Text", value: decodedUrl },
            { label: "Standard", value: "RFC 3986 / RFC 1738" },
          ],
          suggestedActions: [
            { label: "URL Percent-Encoding Tool", url: "/tools/url", toolId: "url" },
          ],
        };
      }
    } catch {
      // Invalid URL encoding
    }
  }

  // 9. C / Hex / Byte Array Formats (e.g. \x48\x65\x6c\x6c\x6f or [0x48, 0x65, ...])
  const cEscapeMatch = raw.match(/(\\x[0-9a-fA-F]{2})+/);
  if (cEscapeMatch && cEscapeMatch[0].length >= 8) {
    const hexBytesStr = raw.replace(/\\x/g, "");
    if (/^[0-9a-fA-F]+$/.test(hexBytesStr)) {
      const bytes = new Uint8Array(hexBytesStr.length / 2);
      for (let i = 0; i < hexBytesStr.length; i += 2) {
        bytes[i / 2] = parseInt(hexBytesStr.slice(i, i + 2), 16);
      }
      const readable = bytesToReadableString(bytes);
      return {
        raw,
        detectedType: "c-array",
        typeLabel: "C-Style Hex Escapes (\\xNN)",
        badge: `${bytes.length} Bytes`,
        confidence: "certain",
        description: "Byte sequence formatted using C / Python \\xNN hexadecimal escape notation.",
        decodedPreview: `Decoded String: "${readable}"\nHex: ${bytesToHex(bytes, true)}`,
        entropy: entropyData,
        stats: statsData,
        representations: {
          ascii: isPrintableAscii(bytes) ? readable : undefined,
          hex: bytesToHex(bytes, true),
          base64: bytesToBase64(bytes),
        },
        details: [
          { label: "Byte Length", value: `${bytes.length} bytes` },
          { label: "Decoded Text", value: isPrintableAscii(bytes) ? readable : "[Non-printable binary bytes]" },
        ],
        suggestedActions: [
          { label: "Hexadecimal Converter", url: "/tools/hex", toolId: "hex" },
          { label: "Base64 Converter", url: "/tools/base64", toolId: "base64" },
        ],
      };
    }
  }

  // Comma-separated hex or decimal bytes: e.g. "0x48, 0x65, 0x6c" or "72, 101, 108"
  if (/^[\[{]?(?:(?:0x[0-9a-fA-F]{1,2}|\d{1,3})\s*,\s*)+(?:0x[0-9a-fA-F]{1,2}|\d{1,3})[\]}]?$/.test(raw)) {
    try {
      const numbers = raw.replace(/[\[\]{}]/g, "").split(",").map((s) => s.trim()).filter(Boolean).map((s) => parseInt(s, s.startsWith("0x") ? 16 : 10));
      if (numbers.length >= 2 && numbers.every((n) => n >= 0 && n <= 255)) {
        const bytes = new Uint8Array(numbers);
        const readable = bytesToReadableString(bytes);
        return {
          raw,
          detectedType: "c-array",
          typeLabel: "Byte Array [0..255]",
          badge: `${bytes.length} Elements`,
          confidence: "certain",
          description: "Raw sequence of byte numbers formatted as array elements.",
          decodedPreview: `Decoded String: "${readable}"\nHex: ${bytesToHex(bytes, true)}`,
          entropy: entropyData,
          stats: statsData,
          representations: {
            ascii: isPrintableAscii(bytes) ? readable : undefined,
            hex: bytesToHex(bytes, true),
            base64: bytesToBase64(bytes),
          },
          details: [
            { label: "Byte Count", value: `${bytes.length} bytes` },
            { label: "Decoded ASCII", value: isPrintableAscii(bytes) ? readable : "[Binary bytes]" },
          ],
          suggestedActions: [
            { label: "Decimal Bytes Tool", url: "/tools/decimal", toolId: "decimal" },
            { label: "Hex Converter", url: "/tools/hex", toolId: "hex" },
          ],
        };
      }
    } catch {
      // Ignore array parse error
    }
  }

  // 10. Classical Text Ciphers (Caesar, Atbash, Baconian, Monoalphabetic Substitution, Vigenère)
  const classicalResult = detectClassicalCipher(raw, ic, entropyData, statsData);
  if (classicalResult) {
    return classicalResult;
  }

  // 11. Pure Binary Bitstream (01001000 01100101... or continuous)
  const cleanBinary = raw.replace(/\s+/g, "");
  if (/^[01]+$/.test(cleanBinary) && cleanBinary.length >= 8 && cleanBinary.length % 8 === 0) {
    const bytes = new Uint8Array(cleanBinary.length / 8);
    for (let i = 0; i < cleanBinary.length; i += 8) {
      bytes[i / 8] = parseInt(cleanBinary.slice(i, i + 8), 2);
    }
    const hex = bytesToHex(bytes, true);
    const b64 = bytesToBase64(bytes);
    const readable = bytesToReadableString(bytes);
    const isText = isPrintableAscii(bytes);

    return {
      raw,
      detectedType: "binary",
      typeLabel: "Binary Bitstream (Base 2)",
      badge: `${cleanBinary.length} Bits (${cleanBinary.length / 8} Bytes)`,
      confidence: "certain",
      description: "Binary bit sequence formatted in 8-bit octets.",
      decodedPreview: isText ? `Decoded ASCII: "${readable}"` : `Hex Equivalent: ${hex}`,
      entropy: entropyData,
      stats: statsData,
      representations: {
        ascii: isText ? readable : undefined,
        hex,
        base64: b64,
        binary: cleanBinary.match(/.{1,8}/g)?.join(" "),
      },
      details: [
        { label: "Bit Count", value: `${cleanBinary.length} bits` },
        { label: "Byte Length", value: `${cleanBinary.length / 8} bytes` },
        { label: "Decoded Text", value: isText ? readable : "[Non-printable binary bytes]" },
      ],
      suggestedActions: [
        { label: "Inspect in Binary Converter", url: "/tools/binary", toolId: "binary" },
        { label: "Convert to Hexadecimal", url: "/tools/hex", toolId: "hex" },
      ],
    };
  }

  // 12. Decimal Integer & Number Theory Primality
  if (/^-?\d+$/.test(raw) && raw.length <= 200) {
    try {
      const n = BigInt(raw);
      const isPositive = n > 0n;
      const bitLen = n === 0n ? 1 : n.toString(2).replace(/^-/, "").length;
      let primeStatus = "Not Evaluated";
      if (n > 1n && n < 1000000000000n) {
        primeStatus = isPrime(n) ? "Prime Number" : "Composite (Factorable)";
      }

      return {
        raw,
        detectedType: "decimal",
        typeLabel: "Decimal Integer",
        badge: `${bitLen}-bit Integer`,
        confidence: "certain",
        description: `Numerical value representing an integer of ${bitLen} bits (approx 2^${bitLen}).`,
        decodedPreview: `Value: ${n.toString(10)}\nHex: ${isPositive ? "0x" + n.toString(16).toUpperCase() : "N/A"}\nBit Length: ${bitLen} bits`,
        entropy: entropyData,
        stats: statsData,
        representations: {
          decimal: n.toString(10),
          hex: isPositive ? "0x" + n.toString(16).toUpperCase() : undefined,
          binary: isPositive && bitLen <= 64 ? n.toString(2) : undefined,
        },
        details: [
          { label: "Bit Length", value: `${bitLen} bits (approx 2^${bitLen})` },
          { label: "Hex Equivalent", value: isPositive ? "0x" + n.toString(16).toUpperCase() : "N/A" },
          { label: "Primality", value: primeStatus },
        ],
        suggestedActions: [
          { label: "Modular Arithmetic Solver", url: "/tools/modular-arithmetic", toolId: "modular-arithmetic" },
          { label: "Fast Modular Exponentiation", url: "/tools/fast-mod-exp", toolId: "fast-mod-exp" },
        ],
      };
    } catch {
      // BigInt error
    }
  }

  // 13. Cryptographic Hash Digests & Hexadecimal Byte Sequences
  const has0xPrefix = /^0x/i.test(raw);
  const cleanHex = raw.replace(/^0x/i, "").replace(/[\s:.-]+/g, "");
  const isHexOnly = /^[0-9a-fA-F]+$/.test(cleanHex);
  const hasDigits = /\d/.test(cleanHex);

  if (isHexOnly && cleanHex.length >= 4) {
    const isEven = cleanHex.length % 2 === 0;
    const byteLen = Math.floor(cleanHex.length / 2);

    let hexBytes: Uint8Array | null = null;
    if (isEven) {
      hexBytes = new Uint8Array(byteLen);
      for (let i = 0; i < cleanHex.length; i += 2) {
        hexBytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
      }
    }

    // Known Cryptographic Hash Digest Fingerprints
    const HASH_FINGERPRINTS: Record<number, { primary: string; bits: number; security: "Broken" | "Legacy" | "Approved Standard"; all: string[] }> = {
      8: {
        primary: "CRC-32 (32-bit Checksum)",
        bits: 32,
        security: "Broken",
        all: ["CRC-32 (IEEE 802.3)", "Adler-32", "CRC-32C (Castagnoli)"],
      },
      32: {
        primary: "MD5 / NTLM (128-bit)",
        bits: 128,
        security: "Broken",
        all: ["MD5 (RFC 1321)", "NTLM (Windows SAM)", "MD4", "RIPEMD-128"],
      },
      40: {
        primary: "SHA-1 / RIPEMD-160 (160-bit)",
        bits: 160,
        security: "Broken",
        all: ["SHA-1 (FIPS 180-4)", "RIPEMD-160", "HAS-160"],
      },
      56: {
        primary: "SHA-224 / SHA3-224 (224-bit)",
        bits: 224,
        security: "Legacy",
        all: ["SHA-224 (NIST FIPS 180-4)", "SHA3-224 (NIST FIPS 202)"],
      },
      64: {
        primary: "SHA-256 / SHA3-256 / BLAKE2s (256-bit)",
        bits: 256,
        security: "Approved Standard",
        all: ["SHA-256 (NIST FIPS 180-4)", "SHA3-256 (NIST FIPS 202)", "BLAKE2s", "SM3 (GB/T 32918.2)", "Keccak-256"],
      },
      96: {
        primary: "SHA-384 / SHA3-384 (384-bit)",
        bits: 384,
        security: "Approved Standard",
        all: ["SHA-384 (NIST FIPS 180-4)", "SHA3-384 (NIST FIPS 202)"],
      },
      128: {
        primary: "SHA-512 / SHA3-512 / BLAKE2b (512-bit)",
        bits: 512,
        security: "Approved Standard",
        all: ["SHA-512 (NIST FIPS 180-4)", "SHA3-512 (NIST FIPS 202)", "BLAKE2b", "Whirlpool"],
      },
    };

    const hashMatch = HASH_FINGERPRINTS[cleanHex.length];
    if (hashMatch && isEven && (hasDigits || cleanHex.length >= 32)) {
      return {
        raw,
        detectedType: "hash",
        typeLabel: "Cryptographic Hash Digest",
        badge: hashMatch.primary,
        confidence: cleanHex.length >= 32 ? "likely" : "possible",
        description: `Matches the exact length of ${hashMatch.bits} bits (${byteLen} bytes). Potential algorithms: ${hashMatch.all.join(", ")}.`,
        decodedPreview: `Digest: ${cleanHex.toLowerCase()}\nBits: ${hashMatch.bits} bits (${byteLen} bytes)\nLikely Candidates: ${hashMatch.all.join(" | ")}`,
        entropy: entropyData,
        stats: statsData,
        hashCandidate: {
          name: hashMatch.primary,
          bits: hashMatch.bits,
          security: hashMatch.security,
        },
        possibleHashes: hashMatch.all,
        representations: {
          hex: cleanHex.toLowerCase(),
          base64: hexBytes ? bytesToBase64(hexBytes) : undefined,
        },
        details: [
          { label: "Digest Length", value: `${cleanHex.length} hex digits (${byteLen} bytes / ${hashMatch.bits} bits)` },
          { label: "Likely Algorithm", value: hashMatch.primary },
          { label: "All Candidates", value: hashMatch.all.join(", ") },
          { label: "Security Status", value: hashMatch.security },
        ],
        suggestedActions: [
          { label: "Inspect in SHA-256 Tool", url: "/tools/sha256", toolId: "sha256" },
          { label: "Check Standards Matrix", url: "/matrix", toolId: "matrix" },
        ],
      };
    }

    // General Hexadecimal Stream
    const isPunctuation = /[\s:.-]/.test(raw);
    const looksLikeHex = has0xPrefix || isPunctuation || (hasDigits && isEven) || cleanHex.length >= 16;

    if (isEven && hexBytes && looksLikeHex) {
      const readable = bytesToReadableString(hexBytes);
      const isText = isPrintableAscii(hexBytes);
      return {
        raw,
        detectedType: "hex",
        typeLabel: "Hexadecimal Byte Sequence (Base16)",
        badge: `${byteLen} Bytes (Base16)`,
        confidence: has0xPrefix || isPunctuation ? "certain" : "likely",
        description: `Base16 encoded byte sequence representing ${byteLen} bytes.`,
        decodedPreview: isText ? `Decoded ASCII: "${readable}"` : `Raw Hex Bytes (${byteLen}B): ${cleanHex.slice(0, 64)}...`,
        entropy: entropyData,
        stats: statsData,
        representations: {
          ascii: isText ? readable : undefined,
          hex: cleanHex.toLowerCase(),
          base64: bytesToBase64(hexBytes),
        },
        details: [
          { label: "Byte Length", value: `${byteLen} bytes (${byteLen * 8} bits)` },
          { label: "ASCII Output", value: isText ? readable : "[Non-printable binary bytes]" },
          { label: "Prefix", value: has0xPrefix ? "0x included" : "Raw hex without prefix" },
        ],
        suggestedActions: [
          { label: "Open Hex Converter", url: "/tools/hex", toolId: "hex" },
          { label: "Inspect in Base64 Converter", url: "/tools/base64", toolId: "base64" },
        ],
      };
    }
  }

  // 14. Base32 (RFC 4648, e.g. TOTP Google Authenticator secrets)
  if (/^[A-Z2-7=]{8,}$/i.test(raw) && !raw.includes(" ") && !/^\d+$/.test(raw)) {
    const b32Bytes = decodeBase32(raw);
    if (b32Bytes && b32Bytes.length >= 5) {
      const isText = isPrintableAscii(b32Bytes);
      const readable = bytesToReadableString(b32Bytes);
      const hex = bytesToHex(b32Bytes, true);

      // Distinguish from ordinary text: Base32 often has length 16 or 32 (like Google Authenticator secrets) or padding '='
      if (raw.endsWith("=") || raw.length === 16 || raw.length === 32 || isText) {
        return {
          raw,
          detectedType: "base32",
          typeLabel: "Base32 Representation (RFC 4648)",
          badge: `${b32Bytes.length} Decoded Bytes`,
          confidence: raw.endsWith("=") || raw.length === 16 || raw.length === 32 ? "certain" : "likely",
          description: "RFC 4648 Base32 alphabet (A-Z, 2-7). Commonly used in 2FA / TOTP authentication secrets.",
          decodedPreview: `Decoded Bytes: ${hex}\n${isText ? `Decoded Text: "${readable}"` : ""}`,
          entropy: entropyData,
          stats: statsData,
          representations: {
            ascii: isText ? readable : undefined,
            hex,
            base64: bytesToBase64(b32Bytes),
          },
          details: [
            { label: "Decoded Byte Length", value: `${b32Bytes.length} bytes` },
            { label: "TOTP Compatibility", value: raw.length === 16 || raw.length === 32 ? "Valid 2FA / TOTP Secret Key Length" : "Standard Base32 String" },
          ],
          suggestedActions: [
            { label: "Base32 Converter", url: "/tools/base32", toolId: "base32" },
            { label: "HMAC & Authentication Lab", url: "/tools/hmac", toolId: "hmac" },
          ],
        };
      }
    }
  }

  // 15. Base64 & Base64URL
  const cleanB64 = raw.replace(/\s+/g, "");
  const hasBase64Punctuation = cleanB64.includes("=") || cleanB64.includes("+") || cleanB64.includes("/") || cleanB64.includes("-") || cleanB64.includes("_");
  const isBase64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(cleanB64);
  const isBase64UrlPattern = /^[A-Za-z0-9-_]+={0,2}$/.test(cleanB64);

  if ((isBase64Pattern || isBase64UrlPattern) && cleanB64.length >= 4 && !/^\d+$/.test(cleanB64)) {
    try {
      const normalizedB64 = cleanB64.replace(/-/g, "+").replace(/_/g, "/");
      const paddedB64 = normalizedB64 + "=".repeat((4 - (normalizedB64.length % 4)) % 4);
      const binaryStr = atob(paddedB64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const readable = bytesToReadableString(bytes);
      const isText = isPrintableAscii(bytes);
      const hex = bytesToHex(bytes, true);

      // Distinguish genuine Base64 from natural words:
      const isGenuineBase64 = hasBase64Punctuation || (isText && cleanB64.length >= 8 && !raw.includes(" "));

      if (isGenuineBase64) {
        return {
          raw,
          detectedType: "base64",
          typeLabel: isBase64UrlPattern && !isBase64Pattern ? "Base64URL Representation" : "Base64 Representation (RFC 4648)",
          badge: `RFC 4648 (${bytes.length} Decoded Bytes)`,
          confidence: hasBase64Punctuation ? "certain" : "likely",
          description: "ASCII radix-64 representation encoding binary octets. Note: Base64 is representation, NOT encryption.",
          decodedPreview: isText ? `Decoded Plaintext: "${readable}"` : `Decoded Bytes (${bytes.length}B): ${hex.slice(0, 64)}...`,
          entropy: entropyData,
          stats: statsData,
          representations: {
            ascii: isText ? readable : undefined,
            hex,
            base64: cleanB64,
          },
          details: [
            { label: "Decoded Byte Length", value: `${bytes.length} bytes (${bytes.length * 8} bits)` },
            { label: "Decoded Interpretation", value: isText ? `ASCII Text: "${readable}"` : `Binary bytes: ${hex.slice(0, 32)}…` },
            { label: "Alphabet Variant", value: isBase64UrlPattern && !isBase64Pattern ? "Base64URL (- and _)" : "Standard Base64 (+ and /)" },
          ],
          suggestedActions: [
            { label: "Open Base64 Converter", url: "/tools/base64", toolId: "base64" },
            { label: "Convert Decoded Bytes to Hex", url: "/tools/hex", toolId: "hex" },
          ],
        };
      }
    } catch {
      // Not base64
    }
  }

  // 16. Fallback: Raw UTF-8 / ASCII Plaintext
  const isAscii = isPrintableAscii(rawBytes);
  return {
    raw,
    detectedType: "ascii",
    typeLabel: isAscii ? "Plaintext String (UTF-8 / ASCII)" : "Raw Byte Stream",
    badge: `${rawBytes.length} Bytes`,
    confidence: "certain",
    description: isAscii
      ? "Readable natural language or formatted code."
      : "Arbitrary or unformatted byte stream with non-printable characters.",
    decodedPreview: `Character Count: ${raw.length}\nByte Size: ${rawBytes.length} bytes\nIndex of Coincidence: ${ic.toFixed(4)}`,
    entropy: entropyData,
    stats: statsData,
    representations: {
      ascii: raw,
      hex: bytesToHex(rawBytes, true),
      base64: bytesToBase64(rawBytes),
    },
    details: [
      { label: "Character Count", value: `${raw.length} characters` },
      { label: "Byte Size (UTF-8)", value: `${rawBytes.length} bytes` },
      { label: "Word Count", value: `${raw.split(/\s+/).filter(Boolean).length} words` },
      { label: "Index of Coincidence (IC)", value: `${ic.toFixed(4)} (${ic > 0.055 ? "Natural English distribution" : "Polyalphabetic or high spread"})` },
    ],
    suggestedActions: [
      { label: "Compute SHA-256 Digest", url: "/tools/sha256", toolId: "sha256" },
      { label: "Encode in Base64", url: "/tools/base64", toolId: "base64" },
      { label: "Encrypt with AES State", url: "/tools/aes-state", toolId: "aes-state" },
    ],
  };
}
