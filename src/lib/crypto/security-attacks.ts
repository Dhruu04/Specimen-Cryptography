import type { ToolOutput, TraceStep } from "./types";

/**
 * Padding Oracle Attack Simulator (PKCS#7 CBC Decryption)
 * Demonstrates Serge Vaudenay's 2002 attack where an oracle responding with
 * "invalid padding" vs "valid padding" allows recovering full plaintext byte-by-byte
 * without knowing the key!
 */
export function paddingOracleSimulator(secretWord: string = "SECRET"): ToolOutput {
  const clean = (secretWord || "CRYPTO").toUpperCase().slice(0, 8);
  const targetByte = clean.charCodeAt(clean.length - 1);
  const padLength = 8 - (clean.length % 8);

  // Simulated server oracle
  const checkPaddingOracle = (candidateXor: number): boolean => {
    // When intermediate byte XOR candidateXor == padByte (0x01)
    const intermediate = targetByte ^ padLength;
    return (intermediate ^ candidateXor) === 1;
  };

  const steps: TraceStep[] = [
    {
      label: `Target Ciphertext Block with Secret Word: "${clean}"`,
      detail: `Target block size: 8 bytes · Secret final character: '${clean[clean.length - 1]}' (0x${targetByte.toString(16)})`,
    },
    {
      label: `Attacker Strategy: Malleate C'[last_byte] to force padding byte 0x01`,
      detail: `The server decrypts P' = D_K(C) ⊕ C'. When C' is altered, server checks if padding is valid (ends in 0x01, 0x02 0x02, etc.).`,
    },
  ];

  let foundXor: number | null = null;
  let attempts = 0;

  // Attacker tests 256 possible bytes
  for (let candidate = 0; candidate < 256; candidate++) {
    attempts++;
    if (checkPaddingOracle(candidate)) {
      foundXor = candidate;
      steps.push({
        label: `Oracle hit at candidate byte 0x${candidate.toString(16).padStart(2, "0")} (Test #${attempts})!`,
        detail: `Server responded: "HTTP 200 OK (Padding Valid)" instead of "HTTP 500 (Bad Padding)"!`,
      });
      break;
    }
  }

  if (foundXor !== null) {
    const recoveredByte = foundXor ^ 1 ^ padLength;
    const recoveredChar = String.fromCharCode(recoveredByte);

    steps.push({
      label: `Plaintext Byte Recovered: '${recoveredChar}' (0x${recoveredByte.toString(16)})`,
      detail: `Math: P[last] = candidate ⊕ 0x01 ⊕ IV[last] = 0x${foundXor.toString(16)} ⊕ 0x01 ⊕ 0x${padLength.toString(16)} = 0x${recoveredByte.toString(16)} -> '${recoveredChar}'`,
    });

    return {
      output: `Recovered Byte: '${recoveredChar}' (ASCII 0x${recoveredByte.toString(16)})\nOracle Queries: ${attempts} queries (out of 256 max)`,
      steps,
      note: "Padding Oracle Attacks completely destroy unauthenticated CBC mode encryption. This vulnerability plagued SSL 3.0 (POODLE), TLS 1.0 (Lucky Thirteen), and ASP.NET. Defense: ALWAYS use Authenticated Encryption (AEAD like AES-GCM or Encrypt-then-MAC with HMAC) so tampered ciphertexts are rejected before padding is ever checked!",
    };
  }

  return { output: "Simulation completed.", steps };
}

/**
 * Side-Channel Timing Attack Simulator
 * Compares naive byte-by-byte comparison vs constant-time comparison
 */
export function timingAttackSimulator(candidateInput: string, actualSecret: string = "SECURITY"): ToolOutput {
  const candidate = candidateInput.toUpperCase();
  const secret = actualSecret.toUpperCase();

  // Simulate naive comparison
  let naiveMatches = 0;
  for (let i = 0; i < candidate.length && i < secret.length; i++) {
    if (candidate[i] === secret[i]) {
      naiveMatches++;
    } else {
      break; // NAIVE EARLY EXIT! Leaks number of matching prefix characters via time!
    }
  }

  // Simulated execution time in nanoseconds
  const baseTimeNs = 15;
  const loopStepTimeNs = 42; // Time taken per character check
  const naiveTime = baseTimeNs + naiveMatches * loopStepTimeNs;

  // Constant time comparison (processes all bytes regardless)
  const maxLen = Math.max(candidate.length, secret.length);
  const constantTime = baseTimeNs + maxLen * loopStepTimeNs;

  const steps: TraceStep[] = [
    {
      label: `Naive Comparison (Early Exit on Mismatch)`,
      detail: `Matched prefix: "${candidate.slice(0, naiveMatches)}" (${naiveMatches} chars) -> Aborted after ${naiveMatches + 1} checks. Simulated Time: ~${naiveTime} ns`,
    },
    {
      label: `Constant-Time Comparison (crypto.timingSafeEqual)`,
      detail: `Accumulates bitwise XOR differences across all ${maxLen} bytes without branching. Simulated Time: ~${constantTime} ns (Constant regardless of match!)`,
    },
  ];

  let leakageAnalysis = "";
  if (naiveMatches > 0) {
    leakageAnalysis = `[ALERT] TIMING LEAK: Attacker measures +${naiveMatches * loopStepTimeNs} ns latency, confirming that the first ${naiveMatches} characters are CORRECT! By trying A-Z for each position, an attacker cracks the secret in O(26 × length) time instead of O(26^length) brute force!`;
  } else {
    leakageAnalysis = `No prefix matched. Attacker measures baseline latency ~${naiveTime} ns.`;
  }

  return {
    output: `Secret: "${secret}"  |  Tested: "${candidate}"\n\nNaive Check Time:         ~${naiveTime} ns (Leaks length of correct prefix!)\nConstant-Time Check Time:  ~${constantTime} ns (Zero information leaked)\n\n${leakageAnalysis}`,
    steps,
    note: "Timing attacks are devastating against password hashes, MAC verification, and RSA private key operations. Cryptographic code must NEVER use '==' or 'strcmp' on secrets; always use constant-time functions like Node's 'crypto.timingSafeEqual'.",
  };
}

/**
 * Zero-Knowledge Proof (ZKP) Schnorr Protocol Simulator
 * Peggy (Prover) proves to Victor (Verifier) that she knows secret x such that y = g^x (mod p)
 * WITHOUT revealing anything about x!
 */
export function zkpSchnorrSimulator(secretX: number, challengeC: number = 7): ToolOutput {
  const p = 1019n; // Prime modulus
  const g = 2n;    // Generator
  const x = BigInt(Math.max(1, secretX));
  const c = BigInt(Math.max(1, challengeC));

  // Peggy's public key: y = g^x mod p
  const modPow = (b: bigint, exp: bigint, m: bigint): bigint => {
    let r = 1n;
    b = b % m;
    while (exp > 0n) {
      if (exp % 2n === 1n) r = (r * b) % m;
      exp = exp / 2n;
      b = (b * b) % m;
    }
    return r;
  };

  const y = modPow(g, x, p);

  // 1. Peggy picks random ephemeral secret r and sends commitment t = g^r mod p
  const r = 317n; // Ephemeral random nonce
  const t = modPow(g, r, p);

  // 2. Victor issues challenge c

  // 3. Peggy computes response s = r + c * x
  const s = r + c * x;

  // 4. Victor verifies: g^s ≡ t · y^c (mod p)
  const lhs = modPow(g, s, p);
  const rhs = (t * modPow(y, c, p)) % p;

  const valid = lhs === rhs;

  const steps: TraceStep[] = [
    {
      label: `1. Setup: Public Params (p = ${p}, g = ${g})`,
      detail: `Peggy's Public Key: y = g^x mod p = ${g}^${x} mod ${p} = ${y} (Secret x = ${x} remains hidden!)`,
    },
    {
      label: `2. Commitment (Prover -> Verifier)`,
      detail: `Peggy picks ephemeral secret r = ${r} and sends commitment t = g^r mod p = ${t}`,
    },
    {
      label: `3. Challenge (Verifier -> Prover)`,
      detail: `Victor sends random unpredictable challenge c = ${c}`,
    },
    {
      label: `4. Response (Prover -> Verifier)`,
      detail: `Peggy computes response s = r + c·x = ${r} + (${c})(${x}) = ${s}`,
    },
    {
      label: `5. Verification: g^s ≡ t · y^c (mod p)`,
      detail: `LHS: g^s mod p = ${lhs} · RHS: t · y^c mod p = ${rhs} · Match: ${valid ? "VALID PROOF" : "INVALID"}`,
    },
  ];

  return {
    output: `Zero-Knowledge Proof: ${valid ? "ACCEPTED (Peggy knows secret x)" : "REJECTED"}\n\nLHS: g^s mod p = ${lhs}\nRHS: t·y^c mod p = ${rhs}\n\nKnowledge Revealed about x: ZERO!`,
    steps,
    note: "Zero-Knowledge Proofs satisfy three properties: 1) Completeness (honest prover always convinces verifier), 2) Soundness (cheater cannot convince verifier except with negligible odds), and 3) Zero-Knowledge (verifier learns nothing beyond the fact that the statement is true). Foundation of Zcash, zk-SNARKs, and modern blockchain privacy.",
  };
}
