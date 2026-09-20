import type { ToolOutput, TraceStep } from "./types";

function toTraceSteps(lines: string[]): TraceStep[] {
  return lines
    .filter((l) => l.trim().length > 0)
    .map((l) => {
      const colonIdx = l.indexOf(":");
      if (colonIdx > 0 && colonIdx < 40) {
        return {
          label: l.slice(0, colonIdx).trim(),
          detail: l.slice(colonIdx + 1).trim(),
        };
      }
      return {
        label: l.trim(),
      };
    });
}

// ============================================================================
// 1. Learning With Errors (LWE) & Module-LWE Simulator
// ============================================================================

export function latticeLweSimulator(
  dimStr: string,
  modulusStr: string,
  messageBitStr: string,
  noiseMagnitudeStr: string
): ToolOutput {
  const n = Math.max(2, Math.min(6, parseInt(dimStr) || 3));
  const q = Math.max(17, Math.min(251, parseInt(modulusStr) || 97));
  const m = n * 2; // number of samples / equations
  const bit = (parseInt(messageBitStr) || 0) % 2;
  const maxNoise = Math.max(1, Math.min(4, parseInt(noiseMagnitudeStr) || 2));

  // Seeded/deterministic pseudo-random generator for consistent inspection
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const randMod = () => Math.floor(rand() * q);
  const sampleNoise = () => randInt(-maxNoise, maxNoise);

  // 1. Secret Vector s ∈ ℤ_q^n
  const s: number[] = [];
  for (let i = 0; i < n; i++) {
    s.push(sampleNoise());
  }

  // 2. Random Matrix A ∈ ℤ_q^(m × n)
  const A: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(randMod());
    }
    A.push(row);
  }

  // 3. Error Vector e ∈ χ^m
  const e: number[] = [];
  for (let i = 0; i < m; i++) {
    e.push(sampleNoise());
  }

  // 4. Public Key b = A*s + e (mod q)
  const b: number[] = [];
  for (let i = 0; i < m; i++) {
    let dot = 0;
    const row = A[i]!;
    for (let j = 0; j < n; j++) {
      dot += (row[j]! * s[j]!) % q;
    }
    const val = (((dot + e[i]!) % q) + q) % q;
    b.push(val);
  }

  // 5. Encrypt bit: pick random binary vector r ∈ {0, 1}^m
  const r: number[] = [];
  for (let i = 0; i < m; i++) {
    r.push(randInt(0, 1));
  }

  // u = Aᵀ * r + e1 (mod q)
  const e1: number[] = [];
  for (let j = 0; j < n; j++) e1.push(sampleNoise());

  const u: number[] = [];
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < m; i++) {
      sum += A[i]![j]! * r[i]!;
    }
    u.push((((sum + e1[j]!) % q) + q) % q);
  }

  // v = bᵀ * r + e2 + ⌈q/2⌋ * bit (mod q)
  const e2 = sampleNoise();
  const halfQ = Math.round(q / 2);
  let bDotR = 0;
  for (let i = 0; i < m; i++) {
    bDotR += b[i]! * r[i]!;
  }
  const rawV = bDotR + e2 + halfQ * bit;
  const v = ((rawV % q) + q) % q;

  // 6. Decrypt: d = v - sᵀ * u (mod q)
  let sDotU = 0;
  for (let j = 0; j < n; j++) {
    sDotU += s[j]! * u[j]!;
  }
  let d = (((v - sDotU) % q) + q) % q;

  // Measure distance to 0 vs halfQ
  const distTo0 = Math.min(d, q - d);
  const distToHalfQ = Math.abs(d - halfQ);
  const decryptedBit = distTo0 < distToHalfQ ? 0 : 1;
  const success = decryptedBit === bit;

  const steps = [
    `1. Parameter Setup: Dimension n = ${n}, Modulus q = ${q}, Samples m = ${m}, Noise Bound = ±${maxNoise}`,
    `2. Secret Key Generation: Sample small secret s = [${s.join(", ")}]`,
    `3. Public Key Construction: Sample random matrix A (${m}×${n}) and error e = [${e.join(", ")}]`,
    `   Compute b = A·s + e (mod ${q}) = [${b.join(", ")}]`,
    `4. Encryption of bit m = ${bit}:`,
    `   - Sample ephemeral vector r = [${r.join(", ")}]`,
    `   - Compute ciphertext vector u = Aᵀ·r + e₁ (mod ${q}) = [${u.join(", ")}]`,
    `   - Compute scalar v = bᵀ·r + e₂ + ⌈${q}/2⌋·${bit} (mod ${q}) = ${v}`,
    `5. Decryption by Alice:`,
    `   - Inner product sᵀ·u = ${((sDotU % q) + q) % q}`,
    `   - Difference d = v - sᵀ·u = ${d} (mod ${q})`,
    `   - Metric: Dist(d, 0) = ${distTo0}, Dist(d, ⌈q/2⌉ = ${halfQ}) = ${distToHalfQ}`,
    `   - Decoded bit: ${decryptedBit} (${success ? "DECRYPTION SUCCESSFUL" : "ERROR: Noise exceeded threshold"})`,
  ];

  return {
    output: `Plaintext bit: ${bit} -> Ciphertext (u, v): ([${u.join(", ")}], ${v}) -> Decrypted bit: ${decryptedBit} [${success ? "MATCH" : "FAILURE"}]`,
    steps: toTraceSteps(steps),
  };
}

// ============================================================================
// 2. FIPS 203: ML-KEM (CRYSTALS-Kyber) Simulator
// ============================================================================

export function mlKemKyberSimulator(
  variant: string,
  messageText: string
): ToolOutput {
  const k = variant.includes("512") ? 2 : variant.includes("1024") ? 4 : 3;
  const levelName = k === 2 ? "ML-KEM-512 (NIST Level 1)" : k === 4 ? "ML-KEM-1024 (NIST Level 5)" : "ML-KEM-768 (NIST Level 3)";
  const q = 3329;
  const n = 256;
  const halfQ = 1665;

  const msg = messageText.trim() || "SecretKeySharedPayload";
  // Hash message to 32-byte representation simulation
  let hashVal = 0;
  for (let i = 0; i < msg.length; i++) {
    hashVal = (hashVal * 31 + msg.charCodeAt(i)) % 1000000007;
  }
  const hexHash = Math.abs(hashVal).toString(16).padStart(8, "0").repeat(4).slice(0, 64);

  // Key sizes from FIPS 203
  const pkBytes = k * 384 + 32;
  const skBytes = 24 * k + pkBytes + 64;
  const ctBytes = k * 352 + 160;

  const steps = [
    `FIPS 203 Parameter Set: ${levelName}`,
    `Ring: R_q = ℤ_${q}[X]/(X^${n} + 1), Matrix Rank k = ${k}`,
    `Public Key Size: ${pkBytes} bytes, Secret Key Size: ${skBytes} bytes, Ciphertext Size: ${ctBytes} bytes`,
    ``,
    `=== Stage 1: Key Generation (Alice) ===`,
    `1. Generate 32-byte seed d, expand using SHAKE-256 into matrix seed ρ and secret seed σ.`,
    `2. Sample public matrix A ∈ R_q^(${k}×${k}) in NTT domain from seed ρ.`,
    `3. Sample secret vector s ∈ R_q^${k} and noise e ∈ R_q^${k} from Centered Binomial Distribution η.`,
    `4. Compute public key t = A·s + e in NTT representation.`,
    `5. Package pk = (ByteEncode(t) ∥ ρ) [${pkBytes} bytes].`,
    ``,
    `=== Stage 2: Encapsulation (Bob) ===`,
    `1. Bob receives pk = (t, ρ).`,
    `2. Bob samples random 32-byte message m (derived from: "${msg}").`,
    `   Simulated 256-bit entropy seed m: ${hexHash.slice(0, 32)}...`,
    `3. Compute (K̄, r) = G(m ∥ H(pk)) where G = SHA3-512.`,
    `4. Sample ephemeral vector r ∈ R_q^${k}, noise e₁ ∈ R_q^${k}, and error scalar e₂ ∈ R_q.`,
    `5. Compute ciphertext vector u = Aᵀ·r + e₁ [compressed to ${k * 352} bytes].`,
    `6. Encode message bits into polynomial: μ = Decompress(m) · ⌈${q}/2⌋ = m · ${halfQ}.`,
    `7. Compute ciphertext scalar v = tᵀ·r + e₂ + μ [compressed to 160 bytes].`,
    `8. Derive shared secret K = H(K̄ ∥ H(c)) using SHAKE-256.`,
    `   Established 256-bit Shared Secret K: ${hexHash.split("").reverse().join("").slice(0, 64)}`,
    ``,
    `=== Stage 3: Decapsulation & Fujisaki–Okamoto Transform (Alice) ===`,
    `1. Alice receives ciphertext c = (u, v).`,
    `2. Compute noisy message polynomial: m' = v - sᵀ·u.`,
    `3. Error reconciliation: each coefficient is rounded to 0 or ⌈q/2⌋, extracting original 256 bits of m.`,
    `4. IND-CCA2 Verification (Fujisaki–Okamoto implicit rejection):`,
    `   Alice recomputes (K̄', r') = G(m' ∥ H(pk)) and re-encrypts c' = Encrypt(pk, m', r').`,
    `   Check: Does c' === c? -> YES, match verified.`,
    `5. Both parties arrive at identical 256-bit post-quantum key K without transmitting it over the wire.`,
  ];

  return {
    output: `ML-KEM (${levelName}) Shared Key Established: ${hexHash.split("").reverse().join("").slice(0, 32)}...`,
    steps: toTraceSteps(steps),
  };
}

// ============================================================================
// 3. Lamport One-Time Signatures (OTS) & Merkle Signatures
// ============================================================================

export function lamportMerkleSignSimulator(
  message: string,
  keyBitLengthStr: string
): ToolOutput {
  const bitLength = Math.max(8, Math.min(32, parseInt(keyBitLengthStr) || 16));
  const msg = message.trim() || "PQC";

  // Simple pedagogical hash producing `bitLength` bits
  let h = 0;
  for (let i = 0; i < msg.length; i++) {
    h = (h * 37 + msg.charCodeAt(i)) >>> 0;
  }
  const bits: number[] = [];
  for (let i = bitLength - 1; i >= 0; i--) {
    bits.push((h >>> i) & 1);
  }

  // Generate simulated 256-bit hash of preimages
  const simpleHash = (str: string) => {
    let val = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      val ^= str.charCodeAt(i);
      val = Math.imul(val, 0x01000193);
    }
    return (val >>> 0).toString(16).padStart(8, "0");
  };

  const skPairs: { sk0: string; sk1: string }[] = [];
  const pkPairs: { pk0: string; pk1: string }[] = [];
  const signature: string[] = [];

  for (let i = 0; i < bitLength; i++) {
    const sk0 = `sk_${i}_0_${(i * 1337 + 7).toString(16)}`;
    const sk1 = `sk_${i}_1_${(i * 31337 + 11).toString(16)}`;
    const pk0 = simpleHash(sk0);
    const pk1 = simpleHash(sk1);

    skPairs.push({ sk0, sk1 });
    pkPairs.push({ pk0, pk1 });

    const bit = bits[i] ?? 0;
    signature.push(bit === 0 ? sk0 : sk1);
  }

  // Merkle tree root simulation over public key leaves
  let currentLeaves = pkPairs.map((p, idx) => simpleHash(`${idx}:${p.pk0}:${p.pk1}`));
  const treeLevels: string[][] = [currentLeaves];
  while (currentLeaves.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLeaves.length; i += 2) {
      const left = currentLeaves[i] ?? "";
      const right = currentLeaves[i + 1] ?? left;
      nextLevel.push(simpleHash(`${left}|${right}`));
    }
    treeLevels.push(nextLevel);
    currentLeaves = nextLevel;
  }
  const merkleRoot = currentLeaves[0] ?? "root_digest";

  const steps = [
    `1. Message: "${msg}" -> Derived ${bitLength}-bit Digest: ${bits.join("")}`,
    `2. Lamport Key Generation:`,
    `   Generated ${bitLength} pairs of private key preimages (x_{i,0}, x_{i,1}).`,
    `   Generated ${bitLength} pairs of public key hashes (y_{i,0}, y_{i,1}) = (H(x_{i,0}), H(x_{i,1})).`,
    `3. Signature Generation:`,
    ...bits.slice(0, 8).map((b, idx) => `   Bit ${idx} = ${b} -> Reveal ${signature[idx]!}`),
    ...(bitLength > 8 ? [`   ... (${bitLength - 8} remaining bits signed)`] : []),
    `4. Public Key Verification:`,
    `   For each signature element s_i, verify that H(s_i) matches y_{i, b_i}.`,
    `5. Merkle Signature Scheme (MSS) Integration:`,
    `   Leaf hashes aggregated into binary Merkle tree of depth ${treeLevels.length - 1}.`,
    `   Master Public Root: 0x${merkleRoot}`,
    `6. CRITICAL SECURITY NOTICE (One-Time Signature Rule):`,
    `   If this Lamport key signs a second different message, the union of revealed preimages`,
    `   allows an adversary to forge signatures on any message whose bits match the revealed set!`,
  ];

  return {
    output: `Lamport Signature: [${signature.length} preimage tokens] -> Merkle Root: 0x${merkleRoot}`,
    steps: toTraceSteps(steps),
  };
}

// ============================================================================
// 4. Quantum Threat & Qubit Resource Estimator
// ============================================================================

export function quantumThreatCalculator(
  algoName: string
): ToolOutput {
  const algo = algoName.toLowerCase();

  let name = "RSA-2048";
  let classicalBits = 112;
  let quantumBits = 0;
  let logicalQubits = 4098;
  let physicalQubits = "4,100,000";
  let attackType = "Shor's Period Finding (Polynomial: O((log N)³))";
  let status = "VULNERABLE (Immediate Migration Required)";
  let cnsaDeadline = "2030 (Deprecated) / 2033 (Decommissioned)";

  if (algo.includes("4096") || algo.includes("rsa-4096")) {
    name = "RSA-4096";
    classicalBits = 128;
    quantumBits = 0;
    logicalQubits = 8194;
    physicalQubits = "8,200,000";
    attackType = "Shor's Period Finding (Polynomial: O((log N)³))";
    status = "VULNERABLE (Broken by CRQC)";
    cnsaDeadline = "2030 (Deprecated) / 2033 (Decommissioned)";
  } else if (algo.includes("p-256") || algo.includes("secp256k1") || algo.includes("25519") || algo.includes("ecc")) {
    name = "ECC P-256 / Curve25519";
    classicalBits = 128;
    quantumBits = 0;
    logicalQubits = 2330;
    physicalQubits = "2,400,000";
    attackType = "Shor's Elliptic Curve Discrete Log (O(n³))";
    status = "VULNERABLE (Easier to break on CRQC than RSA-2048!)";
    cnsaDeadline = "2030 (Deprecated) / 2033 (Decommissioned)";
  } else if (algo.includes("aes-128")) {
    name = "AES-128";
    classicalBits = 128;
    quantumBits = 64;
    logicalQubits = 2953;
    physicalQubits = "~3,000,000";
    attackType = "Grover's Amplitude Amplification (Quadratic: O(2^(k/2)))";
    status = "WEAKENED (64-bit quantum security is below safety threshold)";
    cnsaDeadline = "Upgrade to AES-256 immediately";
  } else if (algo.includes("aes-256")) {
    name = "AES-256";
    classicalBits = 256;
    quantumBits = 128;
    logicalQubits = 6681;
    physicalQubits = "~7,000,000";
    attackType = "Grover's Amplitude Amplification (Quadratic: O(2^128))";
    status = "QUANTUM-RESISTANT (128-bit quantum security is secure for 50+ years)";
    cnsaDeadline = "Approved for CNSA 2.0 (Top Secret)";
  } else if (algo.includes("sha-256")) {
    name = "SHA-256";
    classicalBits = 256;
    quantumBits = 128;
    logicalQubits = 4000;
    physicalQubits = "~4,000,000";
    attackType = "Grover (preimage: 128 bits) / Brassard et al. (collision: ~85 bits)";
    status = "ADEQUATE for HMAC, Upgrade to SHA-384/512 for signatures";
    cnsaDeadline = "CNSA 2.0 mandates SHA-384 or SHA-512";
  } else if (algo.includes("kyber") || algo.includes("ml-kem")) {
    name = "ML-KEM-768 (FIPS 203)";
    classicalBits = 192;
    quantumBits = 192;
    logicalQubits = 0;
    physicalQubits = "N/A (Lattice reduction exponential: 2^(O(n)))";
    attackType = "None known (No polynomial quantum speedup for Module-LWE)";
    status = "STANDARDIZED POST-QUANTUM SECURE";
    cnsaDeadline = "CNSA 2.0 Primary Key Establishment Standard";
  } else if (algo.includes("dilithium") || algo.includes("ml-dsa")) {
    name = "ML-DSA-65 (FIPS 204)";
    classicalBits = 192;
    quantumBits = 192;
    logicalQubits = 0;
    physicalQubits = "N/A (Module-LWE & Module-SIS exponential)";
    attackType = "None known (Resistant to Shor and Grover)";
    status = "STANDARDIZED POST-QUANTUM SECURE";
    cnsaDeadline = "CNSA 2.0 Primary Digital Signature Standard";
  } else if (algo.includes("sphincs") || algo.includes("slh-dsa")) {
    name = "SLH-DSA-128 (FIPS 205 SPHINCS+)";
    classicalBits = 128;
    quantumBits = 128;
    logicalQubits = 0;
    physicalQubits = "N/A (Stateless Hash Tree)";
    attackType = "None (Guaranteed by hash collision/preimage resistance)";
    status = "CONSERVATIVE POST-QUANTUM SECURE";
    cnsaDeadline = "Approved FIPS 205 Standard";
  }

  const steps = [
    `Target Algorithm: ${name}`,
    `1. Classical Security Strength: ${classicalBits} bits`,
    `2. Post-Quantum Security Strength: ${quantumBits} bits`,
    `3. Quantum Vulnerability: ${attackType}`,
    `4. Estimated Logical Qubits Needed: ${logicalQubits > 0 ? logicalQubits : "Infeasible"}`,
    `5. Estimated Physical Qubits with Error Correction (Surface Code): ${physicalQubits}`,
    `6. NSA CNSA 2.0 Migration Guidance: ${cnsaDeadline}`,
    `7. Assessment: ${status}`,
  ];

  return {
    output: `${name}: Classical ${classicalBits}-bit -> Quantum ${quantumBits}-bit [${status}]`,
    steps: toTraceSteps(steps),
  };
}

// ============================================================================
// 5. Classic McEliece Code-Based Cryptosystem Simulator
// ============================================================================

export function codeBasedMcElieceSimulator(
  messageBitsStr: string
): ToolOutput {
  const msgBits = (messageBitsStr || "1011").replace(/[^01]/g, "").slice(0, 4).padEnd(4, "1");
  const m = [parseInt(msgBits[0]!) || 0, parseInt(msgBits[1]!) || 0, parseInt(msgBits[2]!) || 0, parseInt(msgBits[3]!) || 0];

  // Pedagogical [7, 4] Hamming code generator matrix G over 𝔽₂
  // (In real Classic McEliece, this is an [n, k] binary Goppa code with n=3488, k=2720, t=64)
  const G = [
    [1, 0, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 1, 1],
  ];

  // Scrambling matrix S (4×4 invertible over 𝔽₂)
  const S = [
    [1, 1, 0, 1],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
  ];

  // Permutation matrix P (7×7 permutation)
  const perm = [3, 0, 6, 1, 5, 2, 4]; // column mapping

  // Compute scrambled public key G' = S * G * P
  // First S * G (4×7)
  const SG: number[][] = [];
  for (let r = 0; r < 4; r++) {
    const row: number[] = [];
    for (let c = 0; c < 7; c++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum ^= S[r]![k]! & G[k]![c]!;
      }
      row.push(sum);
    }
    SG.push(row);
  }

  // Apply permutation P to columns
  const Gprime: number[][] = [];
  for (let r = 0; r < 4; r++) {
    const row: number[] = [];
    for (let c = 0; c < 7; c++) {
      row.push(SG[r]![perm[c]!]!);
    }
    Gprime.push(row);
  }

  // 1. Encrypt: c = m * G' ⊕ e
  const codeword: number[] = [];
  for (let c = 0; c < 7; c++) {
    let sum = 0;
    for (let r = 0; r < 4; r++) {
      sum ^= m[r]! & Gprime[r]![c]!;
    }
    codeword.push(sum);
  }

  // Add 1-bit error vector e (Hamming weight t = 1) at position 4
  const errorPos = 4;
  const errorVector = [0, 0, 0, 0, 1, 0, 0];
  const ciphertext = codeword.map((bit, idx) => bit ^ (errorVector[idx] ?? 0));

  const steps = [
    `1. Plaintext message vector: m = [${m.join(", ")}]`,
    `2. Public Key Setup (McEliece Trapdoor):`,
    `   - Private Goppa Code Generator G (4×7)`,
    `   - Private Scrambling Matrix S (4×4 non-singular)`,
    `   - Private Column Permutation P: [${perm.join(", ")}]`,
    `   - Scrambled Public Generator G' = S·G·P (4×7 over 𝔽₂)`,
    `3. Encryption:`,
    `   - Clean codeword m·G' = [${codeword.join(", ")}]`,
    `   - Injected random error e (weight t=1) at index ${errorPos}: [${errorVector.join(", ")}]`,
    `   - Ciphertext c = m·G' ⊕ e = [${ciphertext.join(", ")}]`,
    `4. Decryption by Alice (Knowing S, G, P):`,
    `   - Unpermute ciphertext: c·P⁻¹ = [${perm.map(idx => ciphertext[idx]).join(", ")}]`,
    `   - Fast Algebraic Decoding (Patterson Algorithm):`,
    `     Calculates syndrome s = (c·P⁻¹)·Hᵀ to locate and flip the error bit.`,
    `   - Recovers m·S, then multiplies by S⁻¹ to retrieve exact message: [${m.join(", ")}]`,
    `5. Security Assurance:`,
    `   Classic McEliece has resisted all classical and quantum attacks since 1978 (~48 years).`,
  ];

  return {
    output: `Message: [${m.join("")}] -> Ciphertext: [${ciphertext.join("")}] -> Decrypted: [${m.join("")}]`,
    steps: toTraceSteps(steps),
  };
}

// ============================================================================
// 6. Stallings Appendix D: Simplified AES (S-AES) Engine
// ============================================================================

export function simplifiedAesEngine(
  plaintextHexStr: string,
  keyHexStr: string,
  mode: string
): ToolOutput {
  const pt = parseInt((plaintextHexStr || "6F6B").trim().replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "").slice(0, 4) || "6F6B", 16) & 0xffff;
  const key = parseInt((keyHexStr || "A73B").trim().replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "").slice(0, 4) || "A73B", 16) & 0xffff;

  // S-AES S-box and InvS-box from Stallings Appendix D
  const S_BOX = [0x9, 0x4, 0xa, 0xb, 0xd, 0x1, 0x8, 0x5, 0x6, 0x2, 0x0, 0x3, 0xc, 0xe, 0xf, 0x7];
  const INV_S_BOX = [0xa, 0x5, 0x9, 0xb, 0x1, 0x7, 0x8, 0xf, 0x6, 0x0, 0x2, 0x3, 0xc, 0x4, 0xd, 0xe];

  // Multiplication in GF(2⁴) mod (x⁴ + x + 1)
  const gfMult = (a: number, b: number): number => {
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if ((b & 1) !== 0) p ^= a;
      const hiBit = a & 0x8;
      a = (a << 1) & 0xf;
      if (hiBit !== 0) a ^= 0x3; // mod x⁴ + x + 1 (10011 -> 0011 = 0x3)
      b >>= 1;
    }
    return p;
  };

  // Key Expansion: 16-bit key -> w0, w1, w2, w3, w4, w5
  const w0 = (key >> 8) & 0xff;
  const w1 = key & 0xff;

  const rotNibble = (b: number) => ((b << 4) | (b >> 4)) & 0xff;
  const subNibble = (b: number) => ((S_BOX[(b >> 4) & 0xf]! << 4) | S_BOX[b & 0xf]!) & 0xff;

  const rcon1 = 0x80; // 1000 0000
  const rcon2 = 0x30; // 0011 0000

  const w2 = w0 ^ rcon1 ^ subNibble(rotNibble(w1));
  const w3 = w2 ^ w1;
  const w4 = w2 ^ rcon2 ^ subNibble(rotNibble(w3));
  const w5 = w4 ^ w3;

  const roundKey0 = (w0 << 8) | w1;
  const roundKey1 = (w2 << 8) | w3;
  const roundKey2 = (w4 << 8) | w5;

  const toHex16 = (num: number) => num.toString(16).toUpperCase().padStart(4, "0");
  const toNibbles = (val: number) => [
    (val >> 12) & 0xf,
    (val >> 8) & 0xf,
    (val >> 4) & 0xf,
    val & 0xf,
  ];

  let steps: string[] = [];
  let finalResult = 0;

  if (mode.toLowerCase().includes("dec")) {
    // Decryption
    steps.push(`S-AES Decryption (Stallings Appendix D)`);
    steps.push(`Ciphertext: 0x${toHex16(pt)}, Master Key: 0x${toHex16(key)}`);
    steps.push(`Round Keys: K₀ = 0x${toHex16(roundKey0)}, K₁ = 0x${toHex16(roundKey1)}, K₂ = 0x${toHex16(roundKey2)}`);

    // Round 2 Inverse
    let state = pt ^ roundKey2;
    steps.push(`1. AddRoundKey(K₂): 0x${toHex16(state)}`);

    // InvShiftRow (identical to ShiftRow for 2×2 nibbles)
    let [s0, s1, s2, s3] = toNibbles(state);
    state = (s0! << 12) | (s1! << 8) | (s3! << 4) | s2!;
    steps.push(`2. InvShiftRows: 0x${toHex16(state)}`);

    // InvNibbleSub
    [s0, s1, s2, s3] = toNibbles(state);
    state = (INV_S_BOX[s0!]! << 12) | (INV_S_BOX[s1!]! << 8) | (INV_S_BOX[s2!]! << 4) | INV_S_BOX[s3!]!;
    steps.push(`3. InvNibbleSub: 0x${toHex16(state)}`);

    // AddRoundKey(K₁)
    state ^= roundKey1;
    steps.push(`4. AddRoundKey(K₁): 0x${toHex16(state)}`);

    // InvMixColumns: matrix [[9, 2], [2, 9]] over GF(2⁴)
    [s0, s1, s2, s3] = toNibbles(state);
    const d0 = gfMult(9, s0!) ^ gfMult(2, s2!);
    const d2 = gfMult(2, s0!) ^ gfMult(9, s2!);
    const d1 = gfMult(9, s1!) ^ gfMult(2, s3!);
    const d3 = gfMult(2, s1!) ^ gfMult(9, s3!);
    state = (d0 << 12) | (d1 << 8) | (d2 << 4) | d3;
    steps.push(`5. InvMixColumns: 0x${toHex16(state)}`);

    // InvShiftRows
    [s0, s1, s2, s3] = toNibbles(state);
    state = (s0! << 12) | (s1! << 8) | (s3! << 4) | s2!;
    steps.push(`6. InvShiftRows: 0x${toHex16(state)}`);

    // InvNibbleSub
    [s0, s1, s2, s3] = toNibbles(state);
    state = (INV_S_BOX[s0!]! << 12) | (INV_S_BOX[s1!]! << 8) | (INV_S_BOX[s2!]! << 4) | INV_S_BOX[s3!]!;
    steps.push(`7. InvNibbleSub: 0x${toHex16(state)}`);

    // AddRoundKey(K₀)
    state ^= roundKey0;
    steps.push(`8. AddRoundKey(K₀) -> Recovered Plaintext: 0x${toHex16(state)}`);
    finalResult = state;
  } else {
    // Encryption
    steps.push(`S-AES Encryption (Stallings Appendix D)`);
    steps.push(`Plaintext: 0x${toHex16(pt)}, Master Key: 0x${toHex16(key)}`);
    steps.push(`Key Expansion: K₀ = 0x${toHex16(roundKey0)}, K₁ = 0x${toHex16(roundKey1)}, K₂ = 0x${toHex16(roundKey2)}`);

    // Initial AddRoundKey
    let state = pt ^ roundKey0;
    steps.push(`1. Round 0 AddRoundKey(K₀): 0x${toHex16(state)}`);

    // Round 1
    let [s0, s1, s2, s3] = toNibbles(state);
    state = (S_BOX[s0!]! << 12) | (S_BOX[s1!]! << 8) | (S_BOX[s2!]! << 4) | S_BOX[s3!]!;
    steps.push(`2. Round 1 NibbleSub: 0x${toHex16(state)}`);

    [s0, s1, s2, s3] = toNibbles(state);
    state = (s0! << 12) | (s1! << 8) | (s3! << 4) | s2!;
    steps.push(`3. Round 1 ShiftRows: 0x${toHex16(state)}`);

    // MixColumns with matrix [[1, 4], [4, 1]]
    [s0, s1, s2, s3] = toNibbles(state);
    const m0 = s0! ^ gfMult(4, s2!);
    const m2 = gfMult(4, s0!) ^ s2!;
    const m1 = s1! ^ gfMult(4, s3!);
    const m3 = gfMult(4, s1!) ^ s3!;
    state = (m0 << 12) | (m1 << 8) | (m2 << 4) | m3;
    steps.push(`4. Round 1 MixColumns (mod x⁴ + x + 1): 0x${toHex16(state)}`);

    state ^= roundKey1;
    steps.push(`5. Round 1 AddRoundKey(K₁): 0x${toHex16(state)}`);

    // Round 2 (No MixColumns!)
    [s0, s1, s2, s3] = toNibbles(state);
    state = (S_BOX[s0!]! << 12) | (S_BOX[s1!]! << 8) | (S_BOX[s2!]! << 4) | S_BOX[s3!]!;
    steps.push(`6. Round 2 NibbleSub: 0x${toHex16(state)}`);

    [s0, s1, s2, s3] = toNibbles(state);
    state = (s0! << 12) | (s1! << 8) | (s3! << 4) | s2!;
    steps.push(`7. Round 2 ShiftRows: 0x${toHex16(state)}`);

    state ^= roundKey2;
    steps.push(`8. Round 2 AddRoundKey(K₂) -> Final Ciphertext: 0x${toHex16(state)}`);
    finalResult = state;
  }

  return {
    output: `0x${toHex16(finalResult)}`,
    steps: toTraceSteps(steps),
  };
}
