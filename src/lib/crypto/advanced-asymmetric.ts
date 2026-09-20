import type { ToolOutput, TraceStep } from "./types";

function mod(n: bigint, m: bigint): bigint {
  return ((n % m) + m) % m;
}

function modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % modulus;
    exp = exp / 2n;
    base = (base * base) % modulus;
  }
  return result;
}

function extGcd(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint } {
  if (b === 0n) return { g: a, x: 1n, y: 0n };
  const next = extGcd(b, a % b);
  return {
    g: next.g,
    x: next.y,
    y: next.x - (a / b) * next.y,
  };
}

function modInv(a: bigint, m: bigint): bigint | null {
  const { g, x } = extGcd(a, m);
  if (g !== 1n) return null;
  return mod(x, m);
}

/**
 * RSA Complete Suite: Keygen, Encryption, Decryption, Signatures & Verification
 */
export function rsaCompleteSuite(
  pVal: number,
  qVal: number,
  eVal: number,
  messageVal: number,
  action: "encrypt" | "sign" = "encrypt"
): ToolOutput {
  const p = BigInt(Math.max(3, pVal));
  const q = BigInt(Math.max(3, qVal));
  const e = BigInt(Math.max(3, eVal));
  const m = BigInt(Math.max(1, messageVal));

  if (p === q) {
    return { output: "", error: "Primes p and q must be distinct." };
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (m >= n) {
    return { output: "", error: `Message (${m}) must be smaller than modulus n (${n}).` };
  }

  const d = modInv(e, phi);
  if (d === null) {
    return {
      output: "",
      error: `e = ${e} is not coprime to φ(n) = ${phi} (gcd(${e}, ${phi}) ≠ 1). Choose an e that shares no prime factors with φ(n).`,
    };
  }

  const steps: TraceStep[] = [
    {
      label: `1. Key Generation`,
      detail: `p = ${p}, q = ${q} -> Modulus n = p × q = ${n} · Totient φ(n) = (p-1)(q-1) = ${phi}`,
    },
    {
      label: `2. Public & Private Key Pairs`,
      detail: `Public Key: (e = ${e}, n = ${n}) · Private Key: d ≡ e⁻¹ mod φ(n) = ${d}`,
    },
  ];

  if (action === "encrypt") {
    const ciphertext = modPow(m, e, n);
    const decrypted = modPow(ciphertext, d, n);

    steps.push({
      label: `3. Encryption: c ≡ m^e mod n`,
      detail: `${m}^${e} mod ${n} = ${ciphertext}`,
    });
    steps.push({
      label: `4. Decryption: m' ≡ c^d mod n`,
      detail: `${ciphertext}^${d} mod ${n} = ${decrypted} (Matches original: ${decrypted === m ? "YES" : "NO"})`,
    });

    return {
      output: `Ciphertext c = ${ciphertext}\nDecrypted m' = ${decrypted}\n\nKeys:\nPublic:  (e=${e}, n=${n})\nPrivate: (d=${d}, n=${n})`,
      steps,
      note: "Textbook RSA is deterministic and vulnerable to frequency analysis and chosen-ciphertext attacks. Real-world RSA always uses randomized padding schemes like RSA-OAEP (for encryption) or RSA-PSS (for signatures).",
    };
  } else {
    // Digital Signature
    const signature = modPow(m, d, n);
    const verified = modPow(signature, e, n);

    steps.push({
      label: `3. Digital Signing: s ≡ m^d mod n`,
      detail: `${m}^${d} mod ${n} = ${signature} (Created using Alice's PRIVATE key d)`,
    });
    steps.push({
      label: `4. Public Verification: m' ≡ s^e mod n`,
      detail: `${signature}^${e} mod ${n} = ${verified} (Anyone can verify using PUBLIC key e: ${verified === m ? "VALID SIGNATURE" : "INVALID"})`,
    });

    return {
      output: `Signature s = ${signature}\nVerified Message m' = ${verified} (${verified === m ? "SUCCESS: Signature is authentic" : "FAILED"})\n\nKeys:\nPublic:  (e=${e}, n=${n})\nPrivate: (d=${d}, n=${n})`,
      steps,
      note: "Digital signatures provide Authenticity, Integrity, and Non-repudiation. Only the private key holder can create 's', but anyone in the world with the public key can verify that 's^e mod n == m'.",
    };
  }
}

/**
 * Diffie-Hellman Key Exchange with Man-in-the-Middle (Eve) Interceptor Simulation
 */
export function diffieHellmanMitmSimulator(
  prime: number,
  gen: number,
  alicePriv: number,
  bobPriv: number,
  mitmActive: boolean,
  evePrivAlice: number = 7,
  evePrivBob: number = 11
): ToolOutput {
  const p = BigInt(Math.max(5, prime));
  const g = BigInt(Math.max(2, gen));
  const a = BigInt(Math.max(1, alicePriv));
  const b = BigInt(Math.max(1, bobPriv));

  // Alice computes A = g^a mod p
  const A = modPow(g, a, p);
  // Bob computes B = g^b mod p
  const B = modPow(g, b, p);

  const steps: TraceStep[] = [
    {
      label: `Public Parameters: Prime p = ${p}, Generator g = ${g}`,
      detail: `Alice private a = ${a}, Bob private b = ${b}`,
    },
    {
      label: `Alice sends A = g^a mod p = ${A}`,
      detail: `${g}^${a} mod ${p} = ${A}`,
    },
    {
      label: `Bob sends B = g^b mod p = ${B}`,
      detail: `${g}^${b} mod ${p} = ${B}`,
    },
  ];

  if (!mitmActive) {
    // Normal DH
    const aliceSecret = modPow(B, a, p);
    const bobSecret = modPow(A, b, p);

    steps.push({
      label: `Alice computes s = B^a mod p = ${aliceSecret}`,
      detail: `${B}^${a} mod ${p} = (g^b)^a mod p = g^(ab) mod p`,
    });
    steps.push({
      label: `Bob computes s = A^b mod p = ${bobSecret}`,
      detail: `${A}^${b} mod ${p} = (g^a)^b mod p = g^(ab) mod p`,
    });

    return {
      output: `Alice Shared Secret: ${aliceSecret}\nBob Shared Secret:   ${bobSecret}\n\nStatus: Keys match! Alice and Bob share identical symmetric key g^(ab) mod p without Eve ever learning it.`,
      steps,
      note: "Standard Diffie-Hellman is secure against PASSIVE eavesdroppers because finding 'a' or 'b' from 'A' or 'B' requires solving the Discrete Logarithm Problem.",
    };
  } else {
    // Active MITM: Eve intercepts both channels
    const e1 = BigInt(Math.max(1, evePrivAlice));
    const e2 = BigInt(Math.max(1, evePrivBob));

    // Eve sends E1 to Bob pretending to be Alice, and E2 to Alice pretending to be Bob
    const E1 = modPow(g, e1, p);
    const E2 = modPow(g, e2, p);

    steps.push({
      label: `[INTERCEPT] Eve INTERCEPTS and REPLACES keys in transit!`,
      detail: `Eve drops A and sends E1 = ${E1} to Bob. Eve drops B and sends E2 = ${E2} to Alice.`,
    });

    const aliceSecret = modPow(E2, a, p);
    const eveWithAlice = modPow(A, e2, p);

    const bobSecret = modPow(E1, b, p);
    const eveWithBob = modPow(B, e1, p);

    steps.push({
      label: `Alice computes secret with Eve: s_AE = ${aliceSecret}`,
      detail: `Alice thinks she is talking to Bob!`,
    });
    steps.push({
      label: `Bob computes secret with Eve: s_EB = ${bobSecret}`,
      detail: `Bob thinks he is talking to Alice!`,
    });

    return {
      output: `[ALERT] MITM COMPROMISE DETECTED!\n\nAlice shares secret with Eve:  ${aliceSecret} (Eve has: ${eveWithAlice})\nBob shares secret with Eve:    ${bobSecret} (Eve has: ${eveWithBob})\n\nEve decrypts, reads, alters, and re-encrypts all traffic transparently!`,
      steps,
      note: "Why Unauthenticated DH Fails: Diffie-Hellman establishes a shared key, but DOES NOT AUTHENTICATE identity. This is why TLS uses Digital Signatures (ECDSA/RSA) and Certificates (X.509) to sign the Diffie-Hellman keyshare and prevent MITM.",
    };
  }
}

/**
 * Elliptic Curve Cryptography (ECC) Point Addition & Scalar Multiplication
 * Weierstrass Curve: y² ≡ x³ + ax + b (mod p)
 */
export function eccPointVisualizer(
  aCurve: number,
  bCurve: number,
  primeP: number,
  px: number,
  py: number,
  scalarK: number
): ToolOutput {
  const p = BigInt(Math.max(3, primeP));
  const a = BigInt(aCurve);
  const b = BigInt(bCurve);
  const Px = BigInt(px);
  const Py = BigInt(py);
  const k = BigInt(Math.max(1, scalarK));

  // Check if Point P is on the curve: y^2 = x^3 + ax + b mod p
  const lhs = mod(Py * Py, p);
  const rhs = mod(Px * Px * Px + a * Px + b, p);

  if (lhs !== rhs) {
    return {
      output: "",
      error: `Point P(${Px}, ${Py}) is NOT on the curve y² ≡ x³ + ${a}x + ${b} (mod ${p})!\nLHS: y² = ${lhs} mod ${p}\nRHS: x³ + ax + b = ${rhs} mod ${p}`,
    };
  }

  type ECPoint = { x: bigint; y: bigint } | "O"; // 'O' is point at infinity

  const pointAdd = (P1: ECPoint, P2: ECPoint): ECPoint => {
    if (P1 === "O") return P2;
    if (P2 === "O") return P1;

    if (P1.x === P2.x && P1.y !== P2.y) return "O";

    let lambda: bigint;
    if (P1.x === P2.x && P1.y === P2.y) {
      // Point doubling: λ = (3x₁² + a) / (2y₁) mod p
      const num = mod(3n * P1.x * P1.x + a, p);
      const den = mod(2n * P1.y, p);
      const denInv = modInv(den, p);
      if (denInv === null) return "O";
      lambda = mod(num * denInv, p);
    } else {
      // Point addition: λ = (y₂ - y₁) / (x₂ - x₁) mod p
      const num = mod(P2.y - P1.y, p);
      const den = mod(P2.x - P1.x, p);
      const denInv = modInv(den, p);
      if (denInv === null) return "O";
      lambda = mod(num * denInv, p);
    }

    const x3 = mod(lambda * lambda - P1.x - P2.x, p);
    const y3 = mod(lambda * (P1.x - x3) - P1.y, p);
    return { x: x3, y: y3 };
  };

  const steps: TraceStep[] = [
    {
      label: `Base Point P = (${Px}, ${Py}) on y² ≡ x³ + ${a}x + ${b} (mod ${p})`,
      detail: `Discriminant Δ = -(16(4a³ + 27b²)) mod p. Verified on curve: ${lhs} ≡ ${rhs}`,
    },
  ];

  // Compute scalar multiplication k * P using double-and-add
  let current: ECPoint = { x: Px, y: Py };
  for (let step = 2n; step <= k && step <= 15n; step++) {
    current = pointAdd(current, { x: Px, y: Py });
    steps.push({
      label: `${step} · P = ${current === "O" ? "𝒪 (Infinity)" : `(${current.x}, ${current.y})`}`,
      detail: current === "O" ? "Reached Point at Infinity" : `Geometric chord-and-tangent group law over 𝔽_${p}`,
    });
  }

  // Full multiplication if k > 15
  let res: ECPoint = "O";
  let addend: ECPoint = { x: Px, y: Py };
  let tempK = k;
  while (tempK > 0n) {
    if (tempK % 2n === 1n) res = pointAdd(res, addend);
    addend = pointAdd(addend, addend);
    tempK = tempK / 2n;
  }

  const finalStr = res === "O" ? "𝒪 (Point at Infinity)" : `Q(${res.x}, ${res.y})`;

  return {
    output: `Result of scalar multiplication ${k} · P:\n${finalStr}\n\nPrivate key: k = ${k}\nPublic key:  Q = ${finalStr}`,
    steps,
    note: `The Elliptic Curve Discrete Logarithm Problem (ECDLP): Given P and Q = k·P, it is computationally infeasible to determine k. This allows ECC to use 256-bit keys with equivalent security to RSA 3072-bit keys!`,
  };
}

/**
 * TLS 1.3 Handshake Trace Visualizer
 */
export function tlsHandshakeVisualizer(cipherSuite: string = "TLS_AES_256_GCM_SHA384"): ToolOutput {
  const steps: TraceStep[] = [
    {
      label: "1. Client -> Server: ClientHello + KeyShare (1-RTT)",
      detail: `Supported ciphers: ${cipherSuite} · Client generates ephemeral ECDH keypair (X25519/secp256r1) and sends public keyshare`,
    },
    {
      label: "2. Server -> Client: ServerHello + KeyShare",
      detail: `Server selects ${cipherSuite} · Server generates ephemeral ECDH keyshare and sends it back. BOTH PARTIES NOW COMPUTE SHARED SECRET!`,
    },
    {
      label: "3. Server -> Client: {EncryptedExtensions}",
      detail: `All subsequent handshake packets are now ENCRYPTED using handshake traffic keys`,
    },
    {
      label: "4. Server -> Client: {Certificate + CertificateVerify}",
      detail: `Server proves identity: X.509 Certificate chain and cryptographic signature (ECDSA/RSA-PSS) over the entire handshake transcript`,
    },
    {
      label: "5. Server -> Client: {Finished}",
      detail: `HMAC over entire handshake transcript confirming mutual agreement and zero tampering`,
    },
    {
      label: "6. Client -> Server: {Finished}",
      detail: `Client acknowledges verification. Handshake complete in exactly 1 Round-Trip Time (1-RTT)!`,
    },
    {
      label: "7. Application Data Flow: 0-RTT / 1-RTT Symmetric AEAD",
      detail: `All HTTP/2 or HTTP/3 traffic encrypted with AES-GCM or ChaCha20-Poly1305 and unique per-record keys`,
    },
  ];

  return {
    output: `TLS 1.3 Handshake Complete (1-RTT)\nCipher Suite: ${cipherSuite}\nKey Exchange: Ephemeral Diffie-Hellman (PFS)\nAuthentication: ECDSA / RSA-PSS with X.509 PKI\nBulk Encryption: AES-GCM / ChaCha20-Poly1305`,
    steps,
    note: "TLS 1.3 removed all legacy algorithms (RSA key exchange, CBC ciphers, RC4, SHA-1, MD5) and enforces Perfect Forward Secrecy (PFS): compromising the server's long-term private key does NOT allow decrypting past recorded traffic.",
  };
}
