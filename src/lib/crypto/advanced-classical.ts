import type { ToolOutput, TraceStep } from "./types";

// Standard English letter frequencies (%)
export const ENGLISH_FREQUENCIES: Record<string, number> = {
  E: 12.7, T: 9.06, A: 8.17, O: 7.51, I: 6.97, N: 6.75, S: 6.33, H: 6.09, R: 5.99,
  D: 4.25, L: 4.03, C: 2.78, U: 2.76, M: 2.41, W: 2.36, F: 2.23, G: 2.02, Y: 1.97,
  P: 1.93, B: 1.49, V: 0.98, K: 0.77, J: 0.15, X: 0.15, Q: 0.10, Z: 0.07,
};

/**
 * Frequency Analysis with Chi-Squared statistic (χ²)
 */
export function frequencyAnalysisEnhanced(text: string): ToolOutput {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) return { output: "Please provide alphabetic text for analysis." };

  const counts: Record<string, number> = {};
  for (const char of clean) {
    counts[char] = (counts[char] || 0) + 1;
  }

  const total = clean.length;
  let chiSquared = 0;
  const steps: TraceStep[] = [];

  // Sort by frequency descending
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([char, count]) => {
    const observedPercent = (count / total) * 100;
    const expectedPercent = ENGLISH_FREQUENCIES[char] || 0.1;
    const expectedCount = (expectedPercent / 100) * total;
    const chiContribution = Math.pow(count - expectedCount, 2) / expectedCount;
    chiSquared += chiContribution;

    steps.push({
      label: `'${char}': ${count} occurrences (${observedPercent.toFixed(1)}%)`,
      detail: `Expected in standard English: ${expectedPercent}% (~${expectedCount.toFixed(1)} chars) · χ² contribution: ${chiContribution.toFixed(2)}`,
    });
  });

  const summary = sorted.map(([char, count]) => `${char}: ${count} (${((count / total) * 100).toFixed(1)}%)`).join("  |  ");

  let interpretation = "";
  if (chiSquared < 50) {
    interpretation = "Very close to standard English letter distribution (likely plaintext or simple transposition).";
  } else if (chiSquared < 200) {
    interpretation = "Moderate deviation from English. May be a short sample or monoalphabetic substitution.";
  } else {
    interpretation = "High deviation (χ² = " + chiSquared.toFixed(1) + "). Typical of polyalphabetic ciphers, compressed data, or random ciphertext.";
  }

  return {
    output: `Total letters: ${total} · χ² statistic: ${chiSquared.toFixed(2)}\n\n${summary}`,
    steps,
    note: interpretation,
  };
}

/**
 * One-Time Pad (Vernam Cipher)
 */
export function oneTimePad(
  text: string,
  keyInput: string,
  mode: "encrypt" | "decrypt" = "encrypt",
  generateRandomKey: boolean = false
): ToolOutput {
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanText) return { output: "", error: "Provide alphabetic plaintext." };

  let key = keyInput.toUpperCase().replace(/[^A-Z]/g, "");
  if (generateRandomKey || (!key && mode === "encrypt")) {
    // Generate true pseudorandom pad
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const generated: string[] = [];
    for (let i = 0; i < cleanText.length; i++) {
      generated.push(alphabet[Math.floor(Math.random() * alphabet.length)]!);
    }
    key = generated.join("");
  } else if (!key) {
    return { output: "", error: "Provide the secret key pad to decrypt." };
  }

  if (key.length < cleanText.length) {
    let repeated = key;
    while (repeated.length < cleanText.length) {
      repeated += key;
    }
    key = repeated.slice(0, cleanText.length);
  }

  const steps: TraceStep[] = [];
  let result = "";

  for (let i = 0; i < cleanText.length; i++) {
    const pCode = cleanText.charCodeAt(i) - 65;
    const kCode = key.charCodeAt(i % key.length) - 65;
    let cCode = 0;

    if (mode === "encrypt") {
      cCode = (pCode + kCode) % 26;
      steps.push({
        label: `Char ${i + 1}: '${cleanText[i]}' (${pCode}) + Key '${key[i]}' (${kCode}) mod 26 = '${String.fromCharCode(cCode + 65)}' (${cCode})`,
        detail: `Equation: (${pCode} + ${kCode}) % 26 = ${cCode}`,
      });
    } else {
      cCode = (pCode - kCode + 26) % 26;
      steps.push({
        label: `Char ${i + 1}: Cipher '${cleanText[i]}' (${pCode}) - Key '${key[i]}' (${kCode}) mod 26 = '${String.fromCharCode(cCode + 65)}' (${cCode})`,
        detail: `Equation: (${pCode} - ${kCode} + 26) % 26 = ${cCode}`,
      });
    }
    result += String.fromCharCode(cCode + 65);
  }

  return {
    output: result,
    steps: steps.slice(0, 20),
    note: `Pad used: ${key.slice(0, cleanText.length)}. Shannon proved in 1949 that OTP is information-theoretically secure (unbreakable) IF AND ONLY IF the key is truly random, as long as the message, used once, and kept secret.`,
  };
}

/**
 * Hill Cipher (2x2 Matrix)
 */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function modInverse26(a: number): number | null {
  a = mod(a, 26);
  for (let x = 1; x < 26; x++) {
    if ((a * x) % 26 === 1) return x;
  }
  return null;
}

export function hillCipher2x2(
  text: string,
  k00: number,
  k01: number,
  k10: number,
  k11: number,
  mode: "encrypt" | "decrypt" = "encrypt"
): ToolOutput {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) return { output: "", error: "Provide text to cipher." };

  const det = mod(k00 * k11 - k01 * k10, 26);
  const detInv = modInverse26(det);

  if (detInv === null) {
    return {
      output: "",
      error: `Invalid Key Matrix! Determinant det(K) = ${det}, which has no modular inverse mod 26 (gcd(${det}, 26) ≠ 1). Choose numbers whose determinant is coprime to 26 (odd and not divisible by 13).`,
    };
  }

  let m00 = k00, m01 = k01, m10 = k10, m11 = k11;
  if (mode === "decrypt") {
    // K^-1 = det^-1 * [ d, -b; -c, a ] mod 26
    m00 = mod(k11 * detInv, 26);
    m01 = mod(-k01 * detInv, 26);
    m10 = mod(-k10 * detInv, 26);
    m11 = mod(k00 * detInv, 26);
  }

  // Pad text if odd length
  const padded = clean.length % 2 !== 0 ? clean + "X" : clean;
  const steps: TraceStep[] = [
    {
      label: `Key Matrix K = [ [${k00}, ${k01}], [${k10}, ${k11}] ]`,
      detail: `det(K) = ${det} · det⁻¹ mod 26 = ${detInv} · Active Matrix = [ [${m00}, ${m01}], [${m10}, ${m11}] ]`,
    },
  ];

  let output = "";
  for (let i = 0; i < padded.length; i += 2) {
    const c1 = padded.charCodeAt(i) - 65;
    const c2 = padded.charCodeAt(i + 1) - 65;

    const r1 = mod(m00 * c1 + m01 * c2, 26);
    const r2 = mod(m10 * c1 + m11 * c2, 26);

    const out1 = String.fromCharCode(r1 + 65);
    const out2 = String.fromCharCode(r2 + 65);
    output += out1 + out2;

    if (steps.length < 15) {
      steps.push({
        label: `Vector [${padded[i]}, ${padded[i + 1]}] = [${c1}, ${c2}]ᵀ`,
        detail: `[${m00}·${c1} + ${m01}·${c2}, ${m10}·${c1} + ${m11}·${c2}] mod 26 = [${r1}, ${r2}]ᵀ -> '${out1}${out2}'`,
      });
    }
  }

  return {
    output,
    steps,
    note: `Hill Cipher is a polygraphic substitution cipher invented in 1929 by Lester S. Hill. It uses linear algebra and matrix multiplication over the finite ring ℤ/26ℤ.`,
  };
}

/**
 * Enigma Machine Simulator (3-Rotor I, II, III with Reflector B)
 */
const ENIGMA_ROTORS: Record<string, { wiring: string; notch: string }> = {
  I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
  II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" },
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" },
};
const ENIGMA_REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

export function enigmaSimulator(
  text: string,
  rotorPositions: string = "AAA",
  plugboardPairs: string = "AB CD"
): ToolOutput {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) return { output: "", error: "Provide alphabetic text for Enigma." };

  const rPos = rotorPositions.toUpperCase().padEnd(3, "A").slice(0, 3);
  let posL = rPos.charCodeAt(0) - 65;
  let posM = rPos.charCodeAt(1) - 65;
  let posR = rPos.charCodeAt(2) - 65;

  // Build plugboard map
  const plugs: Record<string, string> = {};
  const pairs = plugboardPairs.toUpperCase().split(/[\s,]+/);
  for (const pair of pairs) {
    if (pair.length === 2 && pair[0] !== pair[1]) {
      plugs[pair[0]!] = pair[1]!;
      plugs[pair[1]!] = pair[0]!;
    }
  }

  const steps: TraceStep[] = [];
  let result = "";

  for (let i = 0; i < clean.length; i++) {
    // Stepping mechanism (Right rotor steps every keypress, double-stepping anomaly)
    const notchR = ENIGMA_ROTORS["III"]!.notch.charCodeAt(0) - 65;
    const notchM = ENIGMA_ROTORS["II"]!.notch.charCodeAt(0) - 65;

    // Double step check
    if (posM === notchM) {
      posM = (posM + 1) % 26;
      posL = (posL + 1) % 26;
    } else if (posR === notchR) {
      posM = (posM + 1) % 26;
    }
    posR = (posR + 1) % 26;

    const charPos = `${String.fromCharCode(posL + 65)}${String.fromCharCode(posM + 65)}${String.fromCharCode(posR + 65)}`;
    let c = clean[i]!;

    // 1. Plugboard in
    const pluggedIn = plugs[c] || c;

    // 2. Right -> Middle -> Left rotor forward pass
    const passForward = (char: string, rotorName: string, pos: number) => {
      const shift = pos;
      const idx = (char.charCodeAt(0) - 65 + shift) % 26;
      const wired = ENIGMA_ROTORS[rotorName]!.wiring[idx]!;
      const outIdx = (wired.charCodeAt(0) - 65 - shift + 26) % 26;
      return String.fromCharCode(outIdx + 65);
    };

    const passBackward = (char: string, rotorName: string, pos: number) => {
      const shift = pos;
      const idx = (char.charCodeAt(0) - 65 + shift) % 26;
      const targetChar = String.fromCharCode(idx + 65);
      const wiredIdx = ENIGMA_ROTORS[rotorName]!.wiring.indexOf(targetChar);
      const outIdx = (wiredIdx - shift + 26) % 26;
      return String.fromCharCode(outIdx + 65);
    };

    const r1 = passForward(pluggedIn, "III", posR);
    const r2 = passForward(r1, "II", posM);
    const r3 = passForward(r2, "I", posL);

    // 3. Reflector B
    const refl = ENIGMA_REFLECTOR_B[r3.charCodeAt(0) - 65]!;

    // 4. Left -> Middle -> Right rotor reverse pass
    const b3 = passBackward(refl, "I", posL);
    const b2 = passBackward(b3, "II", posM);
    const b1 = passBackward(b2, "III", posR);

    // 5. Plugboard out
    const pluggedOut = plugs[b1] || b1;
    result += pluggedOut;

    if (steps.length < 12) {
      steps.push({
        label: `'${c}' -> [Plug:${pluggedIn}] -> [Rotors:${r1}→${r2}→${r3}] -> [Refl:${refl}] -> [Reverse:${b1}] -> '${pluggedOut}'`,
        detail: `Rotor state after step: ${charPos}`,
      });
    }
  }

  return {
    output: result,
    steps,
    note: `Enigma is reciprocal (symmetric): typing the ciphertext with the same initial rotor positions (${rPos}) and plugboard reproduces the plaintext. Because of the reflector, a letter can NEVER encrypt to itself.`,
  };
}

/**
 * Baconian Cipher (5-bit steganographic alphabet)
 */
export function baconianCipher(
  text: string,
  mode: "encode" | "decode" = "encode"
): ToolOutput {
  const BACON_MAP: Record<string, string> = {
    A: "aaaaa", B: "aaaab", C: "aaaba", D: "aaabb", E: "aabaa", F: "aabab",
    G: "aabba", H: "aabbb", I: "abaaa", J: "abaab", K: "ababa", L: "ababb",
    M: "abbaa", N: "abbab", O: "abbba", P: "abbbb", Q: "baaaa", R: "baaab",
    S: "baaba", T: "baabb", U: "babaa", V: "babab", W: "babba", X: "babbb",
    Y: "bbaaa", Z: "bbaab",
  };
  const BACON_REV = Object.fromEntries(Object.entries(BACON_MAP).map(([k, v]) => [v, k]));

  if (mode === "encode") {
    const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
    if (!clean) return { output: "", error: "Provide text to encode." };
    const encoded = clean.split("").map((c) => BACON_MAP[c] || "").join(" ");
    return {
      output: encoded,
      steps: clean.split("").slice(0, 15).map((c) => ({
        label: `'${c}' -> ${BACON_MAP[c]}`,
        detail: `5-bit representation (A/B)`,
      })),
      note: "Sir Francis Bacon created this cipher in 1605 as a steganographic method: 'a' and 'b' can be hidden as two different font weights or italic styles in normal text.",
    };
  } else {
    const clean = text.toLowerCase().replace(/[^ab]/g, "");
    const chunks: string[] = [];
    for (let i = 0; i < clean.length; i += 5) {
      if (i + 5 <= clean.length) chunks.push(clean.slice(i, i + 5));
    }
    const decoded = chunks.map((chunk) => BACON_REV[chunk] || "?").join("");
    return {
      output: decoded,
      steps: chunks.slice(0, 15).map((chunk) => ({
        label: `${chunk} -> '${BACON_REV[chunk] || "?"}'`,
      })),
      note: "Decoded from 5-bit Baconian alphabet chunks.",
    };
  }
}
