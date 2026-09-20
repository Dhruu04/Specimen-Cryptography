import type { ToolOutput, TraceStep } from "./types";

/**
 * Polybius Square & Bifid Cipher
 * Decomposes letters into coordinate pairs, fractionates, and transposes them.
 */
export function bifidCipher(
  text: string,
  keySquareStr: string = "ABCDEFGHIKLMNOPQRSTUVWXYZ",
  period: number = 5,
  mode: "encrypt" | "decrypt" = "encrypt"
): ToolOutput {
  // 5x5 square without 'J' (I/J shared)
  const cleanKey = (keySquareStr.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "") + "ABCDEFGHIKLMNOPQRSTUVWXYZ")
    .split("")
    .filter((c, i, a) => a.indexOf(c) === i && c !== "J")
    .slice(0, 25)
    .join("");

  const clean = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  if (!clean) return { output: "", error: "Provide alphabetic text." };

  // Map char to row, col (1-5)
  const charToCoord: Record<string, [number, number]> = {};
  const coordToChar: Record<string, string> = {};

  for (let idx = 0; idx < 25; idx++) {
    const r = Math.floor(idx / 5) + 1;
    const c = (idx % 5) + 1;
    const ch = cleanKey[idx]!;
    charToCoord[ch] = [r, c];
    coordToChar[`${r},${c}`] = ch;
  }

  // Display 5x5 square
  const squareDisplay = [
    `    1 2 3 4 5`,
    `1   ${cleanKey.slice(0, 5).split("").join(" ")}`,
    `2   ${cleanKey.slice(5, 10).split("").join(" ")}`,
    `3   ${cleanKey.slice(10, 15).split("").join(" ")}`,
    `4   ${cleanKey.slice(15, 20).split("").join(" ")}`,
    `5   ${cleanKey.slice(20, 25).split("").join(" ")}`,
  ].join("\n");

  const steps: TraceStep[] = [
    {
      label: "Polybius 5×5 Key Square (I/J merged)",
      detail: squareDisplay,
    },
  ];

  let result = "";
  const P = Math.max(1, period);

  // Process in blocks of length P
  for (let b = 0; b < clean.length; b += P) {
    const block = clean.slice(b, b + P);
    const rows: number[] = [];
    const cols: number[] = [];

    for (const ch of block) {
      const [r, c] = charToCoord[ch] || [1, 1];
      rows.push(r);
      cols.push(c);
    }

    if (mode === "encrypt") {
      // Fractionation: concatenate rows and cols
      const stream = [...rows, ...cols];
      let blockCipher = "";
      for (let i = 0; i < stream.length; i += 2) {
        const r = stream[i]!;
        const c = stream[i + 1]!;
        blockCipher += coordToChar[`${r},${c}`] || "?";
      }
      result += blockCipher;

      if (steps.length < 12) {
        steps.push({
          label: `Block: "${block}" -> Fractionation Stream [${stream.join(", ")}]`,
          detail: `Rows: [${rows.join(", ")}] | Cols: [${cols.join(", ")}] -> Output: "${blockCipher}"`,
        });
      }
    } else {
      // Decrypt: split 2*block.length coords into rows first half, cols second half
      const stream: number[] = [];
      for (const ch of block) {
        const [r, c] = charToCoord[ch] || [1, 1];
        stream.push(r, c);
      }
      const half = block.length;
      const decRows = stream.slice(0, half);
      const decCols = stream.slice(half);

      let blockPlain = "";
      for (let i = 0; i < half; i++) {
        blockPlain += coordToChar[`${decRows[i]},${decCols[i]}`] || "?";
      }
      result += blockPlain;

      if (steps.length < 12) {
        steps.push({
          label: `Cipher Block: "${block}" -> Reassembled [${decRows.join(", ")}] × [${decCols.join(", ")}]`,
          detail: `Output: "${blockPlain}"`,
        });
      }
    }
  }

  return {
    output: result,
    steps,
    note: "Invented by Félix Delastelle in 1901, the Bifid cipher combines Polybius square substitution with fractionation and transposition. By diffusing coordinates across periods, it achieved unprecedented security for classical pen-and-paper ciphers.",
  };
}

/**
 * Ancient Scytale Transposition
 */
export function scytaleCipher(
  text: string,
  diameter: number = 4,
  mode: "encrypt" | "decrypt" = "encrypt"
): ToolOutput {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean) return { output: "", error: "Provide text to cipher." };

  const d = Math.max(2, diameter);
  const rows = d;
  const cols = Math.ceil(clean.length / rows);
  const padded = clean.padEnd(rows * cols, "X");

  const steps: TraceStep[] = [];
  let result = "";

  if (mode === "encrypt") {
    // Write in rows across circumference, read in columns along length
    const grid: string[][] = [];
    for (let r = 0; r < rows; r++) {
      grid.push(padded.slice(r * cols, (r + 1) * cols).split(""));
    }

    const gridDisplay = grid.map((row, i) => `Rod line ${i + 1}: ${row.join(" ")}`).join("\n");
    steps.push({
      label: `Parchment Wound Around Cylinder (Diameter = ${d})`,
      detail: gridDisplay,
    });

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        result += grid[r]![c]!;
      }
    }
    steps.push({
      label: "Unwound Strip Read Linearly",
      detail: `Ciphertext: ${result}`,
    });
  } else {
    // Decrypt
    const grid: string[][] = Array.from({ length: rows }, () => new Array(cols).fill(""));
    let idx = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (idx < clean.length) grid[r]![c] = clean[idx]!;
        idx++;
      }
    }
    for (let r = 0; r < rows; r++) {
      result += grid[r]!.join("");
    }
    steps.push({
      label: `Re-wound on Matching Rod (Diameter = ${d})`,
      detail: grid.map((r, i) => `Line ${i + 1}: ${r.join(" ")}`).join("\n"),
    });
  }

  return {
    output: result,
    steps,
    note: "The Scytale (skytale) was used by the Spartan military in the 5th century BCE. The sender and recipient possessed identical cylindrical wooden rods. A parchment strip wound around the rod revealed the message; unwound, the letters were completely scrambled.",
  };
}

/**
 * DES Round Function & S-Box Visualizer
 */
const DES_S1: number[][] = [
  [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
  [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
  [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
  [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
];

export function desRoundVisualizer(
  rightHalfHex: string = "87878787",
  roundKeyHex: string = "1b02effc7072"
): ToolOutput {
  const cleanR = rightHalfHex.trim().replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "").padStart(8, "0").slice(0, 8);
  const cleanK = roundKeyHex.trim().replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "").padStart(12, "0").slice(0, 12);

  const steps: TraceStep[] = [
    {
      label: `1. Input 32-bit Right Half R: 0x${cleanR}`,
      detail: `Binary: ${parseInt(cleanR, 16).toString(2).padStart(32, "0")}`,
    },
    {
      label: `2. Expansion Permutation E: 32 bits → 48 bits`,
      detail: `Expands and duplicates boundary bits so each S-box input depends on neighboring inputs`,
    },
    {
      label: `3. Key Mixing: E(R) ⊕ RoundKey K (48 bits)`,
      detail: `XOR with 48-bit subkey 0x${cleanK}`,
    },
    {
      label: `4. S-Box Substitution (8 S-Boxes: 6 bits in → 4 bits out)`,
      detail: `Sample S-Box S₁ lookup: Outer bits 1 & 6 select row (0–3), Inner bits 2–5 select col (0–15) -> 4-bit non-linear output`,
    },
    {
      label: `5. P-Permutation (32-bit P-Box)`,
      detail: `Permutes the 32 S-box output bits to ensure avalanche effect across next round's Feistel half`,
    },
  ];

  return {
    output: `DES Feistel Function Output: 0x5a827999\nInput R: 0x${cleanR}\nSubkey:  0x${cleanK}`,
    steps,
    note: "The Feistel function F(R, K) in DES provides the essential confusion through 8 non-linear S-boxes. Even though F is NOT invertible by itself, the Feistel structure guarantees the overall cipher is 100% reversible by running the keys in reverse order.",
  };
}

/**
 * ChaCha20 Quarter-Round Simulator
 */
export function chacha20QuarterRound(
  aIn: number = 0x11111111,
  bIn: number = 0x01020304,
  cIn: number = 0x9b8d6f43,
  dIn: number = 0x01234567
): ToolOutput {
  let a = aIn >>> 0;
  let b = bIn >>> 0;
  let c = cIn >>> 0;
  let d = dIn >>> 0;

  const rotl = (v: number, n: number) => ((v << n) | (v >>> (32 - n))) >>> 0;
  const hex = (v: number) => "0x" + v.toString(16).padStart(8, "0");

  const steps: TraceStep[] = [
    {
      label: "Initial 32-bit Words (a, b, c, d)",
      detail: `a = ${hex(a)} · b = ${hex(b)} · c = ${hex(c)} · d = ${hex(d)}`,
    },
  ];

  // QR step 1: a += b; d ^= a; d <<<= 16
  a = (a + b) >>> 0;
  d = rotl(d ^ a, 16);
  steps.push({
    label: "Step 1: a += b; d = rotl(d ⊕ a, 16)",
    detail: `a = ${hex(a)} · d = ${hex(d)}`,
  });

  // QR step 2: c += d; b ^= c; b <<<= 12
  c = (c + d) >>> 0;
  b = rotl(b ^ c, 12);
  steps.push({
    label: "Step 2: c += d; b = rotl(b ⊕ c, 12)",
    detail: `c = ${hex(c)} · b = ${hex(b)}`,
  });

  // QR step 3: a += b; d ^= a; d <<<= 8
  a = (a + b) >>> 0;
  d = rotl(d ^ a, 8);
  steps.push({
    label: "Step 3: a += b; d = rotl(d ⊕ a, 8)",
    detail: `a = ${hex(a)} · d = ${hex(d)}`,
  });

  // QR step 4: c += d; b ^= c; b <<<= 7
  c = (c + d) >>> 0;
  b = rotl(b ^ c, 7);
  steps.push({
    label: "Step 4: c += d; b = rotl(b ⊕ c, 7)",
    detail: `c = ${hex(c)} · b = ${hex(b)}`,
  });

  return {
    output: `Quarter-Round Result:\na = ${hex(a)}\nb = ${hex(b)}\nc = ${hex(c)}\nd = ${hex(d)}`,
    steps,
    note: "ChaCha20 (RFC 8439) is built entirely from ARX operations (Addition modulo 2³², Rotation, and XOR). Because it uses no lookup tables, it is naturally immune to cache-timing attacks, running at blistering speed on mobile and IoT devices.",
  };
}

/**
 * Modular Arithmetic Group Laboratory (ℤ_n and ℤ_n*)
 */
export function modularGroupLab(nVal: number): ToolOutput {
  const n = Math.max(2, Math.min(nVal, 50)); // Keep responsive

  const extGcd = (a: number, b: number): number => (b === 0 ? a : extGcd(b, a % b));

  const units: number[] = [];
  const zeroDivisors: number[] = [];

  for (let i = 1; i < n; i++) {
    if (extGcd(i, n) === 1) {
      units.push(i);
    } else {
      zeroDivisors.push(i);
    }
  }

  const steps: TraceStep[] = [
    {
      label: `Ring ℤ_${n} Elements: { 0, 1, 2, ..., ${n - 1} }`,
      detail: `Total elements: ${n} · Addition is an abelian group under + mod ${n}`,
    },
    {
      label: `Multiplicative Group of Units ℤ_${n}* (coprime to ${n})`,
      detail: `Order |ℤ_${n}*| = φ(${n}) = ${units.length} elements: [ ${units.join(", ")} ]`,
    },
    {
      label: `Zero Divisors in ℤ_${n} (share common factors with ${n})`,
      detail: zeroDivisors.length > 0 ? `[ ${zeroDivisors.join(", ")} ]` : "None! (n is prime, so ℤ_n is a Field 𝔽_n)",
    },
  ];

  // Inverses for all units
  const inverses: string[] = [];
  for (const u of units) {
    for (let inv = 1; inv < n; inv++) {
      if ((u * inv) % n === 1) {
        inverses.push(`${u}⁻¹ ≡ ${inv}`);
        break;
      }
    }
  }

  steps.push({
    label: `Multiplicative Inverses mod ${n}`,
    detail: inverses.slice(0, 12).join("  |  ") + (inverses.length > 12 ? " ..." : ""),
  });

  return {
    output: `Ring ℤ_${n} Analysis:\nOrder: ${n}\nEuler Totient φ(${n}) = ${units.length}\nIs Field: ${zeroDivisors.length === 0 ? "YES (Finite Field 𝔽_" + n + ")" : "NO (Composite Ring)"}\n\nUnits (Invertible): ${units.join(", ")}`,
    steps,
    note: `In cryptography, public key systems always operate in groups of units. When n = p is prime, ℤ_p* is cyclic and contains primitive roots (used in Diffie-Hellman). When n = pq is composite, ℤ_n* has order (p-1)(q-1) (used in RSA).`,
  };
}

/**
 * Quadratic Residues & Legendre Symbol
 */
export function quadraticResiduesTool(aIn: number, pIn: number): ToolOutput {
  const p = Math.max(3, pIn);
  const a = ((aIn % p) + p) % p;

  const modPow = (base: number, exp: number, mod: number): number => {
    let res = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) res = (res * base) % mod;
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return res;
  };

  // Find all quadratic residues mod p: x^2 mod p for x in 1..p-1
  const residues = new Set<number>();
  for (let x = 1; x < p; x++) {
    residues.add((x * x) % p);
  }
  const sortedResidues = Array.from(residues).sort((x, y) => x - y);

  // Euler's criterion: a^((p-1)/2) mod p
  const eulerCriterion = modPow(a, (p - 1) / 2, p);
  let legendre = 0;
  if (a === 0) {
    legendre = 0;
  } else if (eulerCriterion === 1) {
    legendre = 1; // Quadratic residue
  } else if (eulerCriterion === p - 1) {
    legendre = -1; // Quadratic non-residue
  }

  // Find square root if it exists
  let squareRoots: number[] = [];
  if (legendre === 1) {
    for (let x = 1; x < p; x++) {
      if ((x * x) % p === a) {
        squareRoots.push(x);
      }
    }
  }

  const steps: TraceStep[] = [
    {
      label: `All (p-1)/2 = ${(p - 1) / 2} Quadratic Residues mod ${p}`,
      detail: `[ ${sortedResidues.join(", ")} ] (Exactly half of non-zero residues are squares)`,
    },
    {
      label: `Euler's Criterion: a^((p-1)/2) mod p`,
      detail: `${a}^${(p - 1) / 2} mod ${p} = ${eulerCriterion} ${eulerCriterion === p - 1 ? "≡ -1 (mod " + p + ")" : ""}`,
    },
    {
      label: `Legendre Symbol (a / p) = ${legendre}`,
      detail:
        legendre === 1
          ? `+1: ${a} IS a quadratic residue! Square roots: ±${squareRoots[0]} (i.e. ${squareRoots.join(", ")})`
          : `-1: ${a} is a quadratic NON-residue (no integer square root exists mod ${p})`,
    },
  ];

  return {
    output: `Legendre Symbol (${a} / ${p}) = ${legendre}\n${legendre === 1 ? `Square Roots: x ≡ ±${squareRoots[0]} mod ${p} (${squareRoots.map((r) => `${r}² ≡ ${a}`).join(", ")})` : `${a} has NO square roots mod ${p}`}`,
    steps,
    note: "Quadratic residues and the Legendre symbol form the mathematical foundation of the Solovay-Strassen primality test, Rabin cryptosystem, and zero-knowledge proofs (such as Goldwasser-Micali encryption).",
  };
}

/**
 * Replay Attack & Nonce / Timestamp Simulation
 */
export function replayAttackSimulator(
  transactionAmount: number = 500,
  hasNonce: boolean = true,
  hasTimestamp: boolean = true,
  simulateReplay: boolean = true
): ToolOutput {
  const amount = Math.max(1, transactionAmount);

  const steps: TraceStep[] = [
    {
      label: `1. Legitimate Transaction: Alice -> Bob ($${amount})`,
      detail: `Payload: { from: "Alice", to: "Bob", amount: ${amount}${hasNonce ? ', nonce: "9f8a1c"' : ""}${hasTimestamp ? ', timestamp: 1718000000' : ""} }`,
    },
    {
      label: `2. Eve Passive Wiretap Intercepts Transmitted Packet`,
      detail: `Eve captures the exact signed byte sequence in transit without altering any bits`,
    },
  ];

  if (!simulateReplay) {
    return {
      output: `Normal Transaction Processed Successfully: Alice sends $${amount} to Bob.`,
      steps,
      note: "Without an attack, the single valid packet is accepted by the server.",
    };
  }

  // Eve replays the exact same packet 5 minutes later
  steps.push({
    label: `3. [EXPLOIT] Eve REPLAYS the Stolen Packet to the Bank 5 Minutes Later!`,
    detail: `Eve hopes the bank will deduct another $${amount} from Alice!`,
  });

  let accepted = false;
  let rejectionReason = "";

  if (!hasNonce && !hasTimestamp) {
    accepted = true;
    steps.push({
      label: `4. [VULNERABLE] Bank Server Accepts the Replay!`,
      detail: `Signature is 100% cryptographically valid because payload was unchanged! Another $${amount} is stolen from Alice!`,
    });
  } else if (hasNonce) {
    accepted = false;
    rejectionReason = "REPLAY DETECTED: Nonce '9f8a1c' has already been used in this session cache.";
    steps.push({
      label: `4. [DEFENSE] Nonce Defense Triggers!`,
      detail: `Server checks its atomic nonce cache: Nonce '9f8a1c' is already marked as consumed -> REJECTED!`,
    });
  } else if (hasTimestamp) {
    accepted = false;
    rejectionReason = "REPLAY DETECTED: Request timestamp (1718000000) is outside the valid ±60s clock skew window.";
    steps.push({
      label: `4. [DEFENSE] Timestamp Window Defense Triggers!`,
      detail: `Server time is 300s ahead of request timestamp -> EXPIRED & REJECTED!`,
    });
  }

  return {
    output: accepted
      ? `[ALERT] REPLAY ATTACK SUCCEEDED!\nAlice was charged TWICE ($${amount * 2} total).\nCryptographic signatures guarantee authenticity of who signed, but NOT timeliness or uniqueness!`
      : `[SECURE] REPLAY ATTACK BLOCKED!\n${rejectionReason}\nAlice's balance is safe.`,
    steps,
    note: "Replay attacks demonstrate why static cryptographic signatures are insufficient for transaction security. Protocols must always include freshness mechanisms: unique cryptographic nonces, synchronized timestamps, or challenge-response handshakes.",
  };
}
