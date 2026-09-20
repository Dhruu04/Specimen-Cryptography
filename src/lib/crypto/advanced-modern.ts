import type { ToolOutput, TraceStep } from "./types";

/**
 * AES State Matrix Breakdown & Round Steps Simulator
 */
// Galois Field GF(2^8) multiplication by 2
function gmul2(b: number): number {
  return ((b << 1) ^ ((b & 0x80) ? 0x1b : 0x00)) & 0xff;
}
function gmul3(b: number): number {
  return (gmul2(b) ^ b) & 0xff;
}

// AES S-Box (Standard Rijndael S-Box)
const AES_SBOX: number[] = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

export function aesStateVisualizer(inputText: string, roundKeyHex: string = "000102030405060708090a0b0c0d0e0f"): ToolOutput {
  const enc = new TextEncoder();
  const rawBytes = Array.from(enc.encode(inputText.slice(0, 16)));
  while (rawBytes.length < 16) rawBytes.push(0x20); // Pad with space

  const cleanKey = roundKeyHex.replace(/[^0-9a-fA-F]/g, "").padEnd(32, "0").slice(0, 32);
  const keyBytes: number[] = [];
  for (let i = 0; i < 32; i += 2) {
    keyBytes.push(parseInt(cleanKey.slice(i, i + 2), 16));
  }

  const formatMatrix = (bytes: number[]) => {
    // 4x4 column-major state matrix
    const rows = ["", "", "", ""];
    for (let col = 0; col < 4; col++) {
      for (let r = 0; r < 4; r++) {
        const val = bytes[col * 4 + r] || 0;
        rows[r] += val.toString(16).padStart(2, "0") + " ";
      }
    }
    return rows.join("\n");
  };

  const steps: TraceStep[] = [];

  // Step 1: Initial State Matrix
  steps.push({
    label: "1. Input 4x4 State Matrix (column-major)",
    detail: formatMatrix(rawBytes),
  });

  // Step 2: AddRoundKey (XOR)
  const afterAddRound0 = rawBytes.map((b, i) => b ^ (keyBytes[i] || 0));
  steps.push({
    label: "2. Initial AddRoundKey (State ⊕ RoundKey 0)",
    detail: formatMatrix(afterAddRound0),
  });

  // Step 3: SubBytes (S-Box)
  const afterSubBytes = afterAddRound0.map((b) => AES_SBOX[b] || 0);
  steps.push({
    label: "3. SubBytes (Non-linear inversion in GF(2⁸) + Affine Transformation)",
    detail: formatMatrix(afterSubBytes),
  });

  // Step 4: ShiftRows (Row 0 shift 0, Row 1 shift 1, Row 2 shift 2, Row 3 shift 3)
  const afterShiftRows = [...afterSubBytes];
  // Row 1 (indices 1, 5, 9, 13)
  const r1 = [afterSubBytes[1]!, afterSubBytes[5]!, afterSubBytes[9]!, afterSubBytes[13]!];
  afterShiftRows[1] = r1[1]!; afterShiftRows[5] = r1[2]!; afterShiftRows[9] = r1[3]!; afterShiftRows[13] = r1[0]!;
  // Row 2 (indices 2, 6, 10, 14)
  const r2 = [afterSubBytes[2]!, afterSubBytes[6]!, afterSubBytes[10]!, afterSubBytes[14]!];
  afterShiftRows[2] = r2[2]!; afterShiftRows[6] = r2[3]!; afterShiftRows[10] = r2[0]!; afterShiftRows[14] = r2[1]!;
  // Row 3 (indices 3, 7, 11, 15)
  const r3 = [afterSubBytes[3]!, afterSubBytes[7]!, afterSubBytes[11]!, afterSubBytes[15]!];
  afterShiftRows[3] = r3[3]!; afterShiftRows[7] = r3[0]!; afterShiftRows[11] = r3[1]!; afterShiftRows[15] = r3[2]!;

  steps.push({
    label: "4. ShiftRows (Cyclic row permutations: 0, 1, 2, 3 byte shifts)",
    detail: formatMatrix(afterShiftRows),
  });

  // Step 5: MixColumns (Galois Field matrix multiplication)
  const afterMixCols = new Array<number>(16);
  for (let c = 0; c < 4; c++) {
    const i = c * 4;
    const a0 = afterShiftRows[i]!;
    const a1 = afterShiftRows[i + 1]!;
    const a2 = afterShiftRows[i + 2]!;
    const a3 = afterShiftRows[i + 3]!;

    afterMixCols[i] = (gmul2(a0) ^ gmul3(a1) ^ a2 ^ a3) & 0xff;
    afterMixCols[i + 1] = (a0 ^ gmul2(a1) ^ gmul3(a2) ^ a3) & 0xff;
    afterMixCols[i + 2] = (a0 ^ a1 ^ gmul2(a2) ^ gmul3(a3)) & 0xff;
    afterMixCols[i + 3] = (gmul3(a0) ^ a1 ^ a2 ^ gmul2(a3)) & 0xff;
  }

  steps.push({
    label: "5. MixColumns (Diffusion: matrix multiplication in GF(2⁸) modulo x⁸+x⁴+x³+x+1)",
    detail: formatMatrix(afterMixCols),
  });

  const finalHex = afterMixCols.map((b) => b.toString(16).padStart(2, "0")).join("");

  return {
    output: `Round 1 Output Matrix (Hex):\n${formatMatrix(afterMixCols)}\n\nState Stream: ${finalHex}`,
    steps,
    note: "Rijndael (AES) iterates this 4-step transformation for 10 rounds (AES-128), 12 rounds (AES-192), or 14 rounds (AES-256). In the final round, the MixColumns step is omitted.",
  };
}

/**
 * Block Cipher Modes Visualizer (ECB vs CBC vs CTR vs GCM)
 */
export function blockCipherModesVisualizer(
  plaintext: string,
  mode: "ECB" | "CBC" | "CTR" | "GCM" = "CBC",
  ivHex: string = "fedcba9876543210"
): ToolOutput {
  // Simulate 8-character (64-bit) blocks for clarity
  const blockSize = 8;
  const blocks: string[] = [];
  for (let i = 0; i < plaintext.length; i += blockSize) {
    blocks.push(plaintext.slice(i, i + blockSize).padEnd(blockSize, " "));
  }
  if (blocks.length === 0) blocks.push("".padEnd(blockSize, " "));

  const steps: TraceStep[] = [];
  const cipherBlocks: string[] = [];

  // Simple pseudo block cipher round function (hash-based toy block cipher)
  const toyEncrypt = (block: string, key = 0x5a) => {
    let acc = key;
    return block
      .split("")
      .map((c) => {
        acc = (acc * 31 + c.charCodeAt(0)) & 0xff;
        return acc.toString(16).padStart(2, "0");
      })
      .join("");
  };

  const xorHex = (hex1: string, hex2: string) => {
    let out = "";
    for (let i = 0; i < hex1.length; i += 2) {
      const b1 = parseInt(hex1.slice(i, i + 2) || "0", 16);
      const b2 = parseInt(hex2.slice(i, i + 2) || "0", 16);
      out += (b1 ^ b2).toString(16).padStart(2, "0");
    }
    return out;
  };

  const textToHex = (str: string) =>
    Array.from(new TextEncoder().encode(str))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  if (mode === "ECB") {
    blocks.forEach((block, idx) => {
      const c = toyEncrypt(block);
      cipherBlocks.push(c);
      steps.push({
        label: `Block ${idx + 1}: "${block}"`,
        detail: `C_${idx + 1} = E_K(P_${idx + 1}) -> ${c}`,
      });
    });
    return {
      output: cipherBlocks.join(" "),
      steps,
      note: "CRITICAL WEAKNESS: ECB (Electronic Codebook) encrypts identical plaintext blocks to identical ciphertext blocks! An attacker can recognize structural patterns without knowing the key (e.g. the famous ECB Penguin). NEVER use ECB for data larger than one block.",
    };
  } else if (mode === "CBC") {
    let prevCipherHex = ivHex.padEnd(blockSize * 2, "0").slice(0, blockSize * 2);
    steps.push({
      label: "Initialization Vector (IV)",
      detail: `IV = ${prevCipherHex} (Must be unpredictable / cryptographically random)`,
    });

    blocks.forEach((block, idx) => {
      const pBlockHex = textToHex(block);
      const xoredHex = xorHex(pBlockHex, prevCipherHex);
      const c = toyEncrypt(block, parseInt(xoredHex.slice(0, 2), 16));
      prevCipherHex = c;
      cipherBlocks.push(c);
      steps.push({
        label: `Block ${idx + 1}: "${block}"`,
        detail: `P_${idx + 1} ⊕ C_${idx} -> E_K(...) -> C_${idx + 1} = ${c}`,
      });
    });

    return {
      output: `IV: ${ivHex}\nCiphertext:\n${cipherBlocks.join(" ")}`,
      steps,
      note: "CBC (Cipher Block Chaining) chains each ciphertext block into the next plaintext block via XOR. Requires an unpredictable random IV. Vulnerable to Padding Oracle attacks if not authenticated with HMAC.",
    };
  } else if (mode === "CTR") {
    const nonce = ivHex.slice(0, 8);
    blocks.forEach((block, idx) => {
      const counterStr = `${nonce}:${idx.toString().padStart(4, "0")}`;
      const keystream = toyEncrypt(counterStr);
      const pBlockHex = textToHex(block);
      const c = xorHex(pBlockHex, keystream);
      cipherBlocks.push(c);
      steps.push({
        label: `Block ${idx + 1}: Counter = "${counterStr}"`,
        detail: `Keystream K_${idx} = E_K(Counter) -> C_${idx + 1} = P_${idx + 1} ⊕ K_${idx} = ${c}`,
      });
    });

    return {
      output: `Nonce: ${nonce}\nCiphertext:\n${cipherBlocks.join(" ")}`,
      steps,
      note: "CTR (Counter Mode) turns a block cipher into a stream cipher. Encryption and decryption are identical. Highly parallelizable and supports random access. Never reuse a Nonce with the same key!",
    };
  } else {
    // GCM (Galois/Counter Mode)
    const nonce = ivHex.slice(0, 8);
    blocks.forEach((block, idx) => {
      const counterStr = `${nonce}:${(idx + 1).toString().padStart(4, "0")}`;
      const keystream = toyEncrypt(counterStr);
      const pBlockHex = textToHex(block);
      const c = xorHex(pBlockHex, keystream);
      cipherBlocks.push(c);
      steps.push({
        label: `CTR Step ${idx + 1}: "${block}"`,
        detail: `C_${idx + 1} = P_${idx + 1} ⊕ E_K(Nonce || ${idx + 1}) -> ${c}`,
      });
    });

    const mockTag = toyEncrypt(cipherBlocks.join(""), 0xa5).slice(0, 32);
    steps.push({
      label: "GHASH Authentication Tag Generation",
      detail: `Polynomial evaluation over GF(2¹²⁸) yields 128-bit Auth Tag = ${mockTag}`,
    });

    return {
      output: `Ciphertext: ${cipherBlocks.join(" ")}\nAuthentication Tag (128-bit): ${mockTag}`,
      steps,
      note: "GCM (Galois/Counter Mode) provides Authenticated Encryption with Associated Data (AEAD). It guarantees both Confidentiality and Integrity simultaneously. If a single bit of ciphertext or tag is modified, decryption immediately rejects.",
    };
  }
}

/**
 * Merkle Tree Generator & Audit Proof Verifier
 */
function simpleHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function merkleTreeTool(leafDataStr: string, verifyLeafIndex: number = 0): ToolOutput {
  const leaves = leafDataStr.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  if (leaves.length === 0) return { output: "", error: "Provide at least one data leaf." };

  const steps: TraceStep[] = [];
  let currentLevel = leaves.map((leaf) => simpleHash(`leaf:${leaf}`));

  steps.push({
    label: `Level 0: ${leaves.length} Leaves`,
    detail: leaves.map((l, i) => `L${i}("${l}"): ${currentLevel[i]}`).join("  |  "),
  });

  const levels: string[][] = [currentLevel];
  let levelNum = 1;

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i]!;
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1]! : left; // Duplicate last if odd
      const combined = simpleHash(`${left}+${right}`);
      nextLevel.push(combined);
    }
    levels.push(nextLevel);
    steps.push({
      label: `Level ${levelNum}: ${nextLevel.length} Internal Nodes`,
      detail: nextLevel.map((h, i) => `Node(${i}): ${h}`).join("  |  "),
    });
    currentLevel = nextLevel;
    levelNum++;
  }

  const rootHash = currentLevel[0]!;

  // Generate audit proof for chosen index
  const safeIdx = Math.max(0, Math.min(verifyLeafIndex, leaves.length - 1));
  const proof: { sibling: string; position: "left" | "right" }[] = [];
  let currIdx = safeIdx;

  for (let l = 0; l < levels.length - 1; l++) {
    const levelArr = levels[l]!;
    const isRight = currIdx % 2 === 1;
    const siblingIdx = isRight ? currIdx - 1 : currIdx + 1 < levelArr.length ? currIdx + 1 : currIdx;
    proof.push({
      sibling: levelArr[siblingIdx]!,
      position: isRight ? "left" : "right",
    });
    currIdx = Math.floor(currIdx / 2);
  }

  const proofTrace = proof.map((p, i) => `Step ${i + 1}: Hash with ${p.position} sibling [${p.sibling}]`).join("\n");

  return {
    output: `Merkle Root: ${rootHash}\n\nAudit Proof for Leaf #${safeIdx} ("${leaves[safeIdx]}"):\n${proofTrace}`,
    steps,
    note: `Merkle Trees allow efficient and secure verification of large data structures in O(log N) operations. Used extensively in Git, Bitcoin, Ethereum, and Certificate Transparency logs.`,
  };
}

/**
 * Birthday Attack & Collision Estimator
 */
export function birthdayCollisionEstimator(bitLength: number, samples: number): ToolOutput {
  const n = Math.max(8, Math.min(bitLength, 512));
  const k = Math.max(1, samples);

  // Total possible outputs N = 2^n
  // Probability p ≈ 1 - exp(-k^2 / (2 * 2^n))
  // For large n, use log space
  const log2N = n;
  const squareRootBound = Math.pow(2, n / 2);

  // Approximate probability
  let prob = 0;
  if (n <= 50) {
    const totalN = Math.pow(2, n);
    const exponent = -(k * (k - 1)) / (2 * totalN);
    prob = 1 - Math.exp(exponent);
  } else {
    // Large n approximation
    const logK = Math.log2(k);
    if (logK >= n / 2) {
      prob = 0.9999;
    } else {
      const diff = n - 2 * logK;
      prob = Math.max(0, Math.min(1, Math.pow(2, -diff)));
    }
  }

  const steps: TraceStep[] = [
    {
      label: `Hash Output Space: 2^${n} possible states`,
      detail: `Total possible hashes = ${n <= 64 ? Math.pow(2, n).toLocaleString() : `~1.15 × 10^${Math.round(n * 0.301)}`}`,
    },
    {
      label: `Square-Root Birthday Bound: ~2^(${n}/2) = 2^${(n / 2).toFixed(1)}`,
      detail: `A 50% probability of finding ANY collision requires only ~${(squareRootBound < 1e12 ? Math.round(squareRootBound).toLocaleString() : `~10^${Math.round((n / 2) * 0.301)}`)} hashes!`,
    },
    {
      label: `Evaluated for k = ${k.toLocaleString()} test hashes`,
      detail: `Calculated collision probability: ${(prob * 100).toFixed(4)}%`,
    },
  ];

  return {
    output: `Collision Probability for ${k.toLocaleString()} hashes of length ${n}-bit: ${(prob * 100).toFixed(4)}%\n\nSquare Root Bound (50% collision threshold): ~2^${(n / 2).toFixed(0)} (~${Math.round(n / 2)} bits of security)`,
    steps,
    note: "The Birthday Paradox shows why a hash function with n bits of output only provides n/2 bits of collision resistance. That is why MD5 (128-bit) provides only 64 bits of collision security and was broken, while SHA-256 provides 128 bits of collision resistance.",
  };
}
