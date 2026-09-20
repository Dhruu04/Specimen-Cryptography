import fs from 'fs';

const enrichments = {
  "quantum-foundations": {
    pitfalls: [
      "Believing quantum computers are simply faster classical multicore processors: quantum speedups require specific algebraic structure and constructive interference.",
      "Dismissing the 'Harvest Now, Decrypt Later' threat for data with multi-decade confidentiality requirements (e.g. government secrets, medical records)."
    ],
    workedExample: {
      title: "Quantum Superposition Measurement Probability",
      steps: [
        { label: "1. Qubit State", detail: "Qubit |ψ⟩ = (√3 / 2)|0⟩ + (1 / 2)|1⟩." },
        { label: "2. Verify Normalization", detail: "|α|² + |β|² = (√3/2)² + (1/2)² = 3/4 + 1/4 = 1. Valid pure state." },
        { label: "3. Probability Calculation", detail: "Probability of measuring |0⟩ = |α|² = 75%. Probability of measuring |1⟩ = |β|² = 25%." },
        { label: "4. Wavefunction Collapse", detail: "Upon measurement, |ψ⟩ collapses irrevocably to |0⟩ or |1⟩. Superposition is destroyed." }
      ],
      outcome: "Demonstrates why quantum algorithms must use phase interference to amplify the probability of correct answers before measurement."
    },
    references: [
      {
        title: "Nielsen & Chuang: Quantum Computation and Quantum Information",
        source: "Cambridge University Press",
        url: "https://en.wikipedia.org/wiki/Quantum_Computation_and_Quantum_Information",
        description: "The definitive textbook ('Mike and Ike') on quantum mechanics, quantum circuits, and quantum algorithms.",
        type: "book"
      },
      {
        title: "MIT OpenCourseWare: Quantum Physics and Information",
        source: "MIT OCW",
        url: "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/",
        description: "Free university lecture series covering linear superposition, Hilbert spaces, and measurement.",
        type: "tutorial"
      }
    ]
  },
  "shor-grover-threats": {
    pitfalls: [
      "Assuming increasing RSA key sizes to 4096 or 8192 bits will defend against Shor's algorithm: Shor scales as O((log N)³), meaning doubling the key only increases quantum factoring time by ~8x.",
      "Assuming Grover's algorithm renders AES-256 insecure: Grover requires 2¹²⁸ evaluations, still physically impossible."
    ],
    workedExample: {
      title: "Shor's Period-Finding Algorithm on N = 15 with Base a = 7",
      steps: [
        { label: "1. Compute Powers of 7 mod 15", detail: "7¹ = 7, 7² = 49 ≡ 4, 7³ = 28 ≡ 13, 7⁴ = 91 ≡ 1 mod 15. The period is r = 4!" },
        { label: "2. Quantum Phase Estimation", detail: "Shor's QFT subroutine finds period r = 4 in polynomial time O((log 15)³)." },
        { label: "3. Check r is Even", detail: "r = 4 is even, so compute a^(r/2) = 7² = 49 ≡ 4 mod 15." },
        { label: "4. Find Prime Factors via GCD", detail: "Factor 1: gcd(4 − 1, 15) = gcd(3, 15) = 3. Factor 2: gcd(4 + 1, 15) = gcd(5, 15) = 5. Factored into 3 × 5!" }
      ],
      outcome: "Integer 15 successfully factored in polynomial quantum steps."
    },
    references: [
      {
        title: "Peter W. Shor: Algorithms for Quantum Computation: Discrete Logarithms and Factoring (1994)",
        source: "IEEE FOCS",
        url: "https://doi.org/10.1109/SFCS.1994.365700",
        description: "The landmark paper demonstrating that quantum computers factor integers in polynomial time.",
        type: "paper"
      },
      {
        title: "Lov K. Grover: A Fast Quantum Mechanical Algorithm for Database Search (1996)",
        source: "ACM STOC",
        url: "https://doi.org/10.1145/237814.237866",
        description: "The original paper establishing the O(√N) quadratic speedup for unstructured search.",
        type: "paper"
      }
    ]
  },
  "lattice-foundations": {
    pitfalls: [
      "Assuming low-dimensional lattices (2D or 3D) are secure: low-dimensional lattices are solved in milliseconds using the LLL algorithm.",
      "Conflating vector basis quality: a 'bad' basis looks like random parallel vectors, making CVP practically unsolvable without the secret trapdoor basis."
    ],
    workedExample: {
      title: "2D Lattice Gram-Schmidt Orthogonalization",
      steps: [
        { label: "1. Input Basis", detail: "b₁ = (1, 3), b₂ = (2, 1)." },
        { label: "2. First Orthogonal Vector", detail: "b₁* = b₁ = (1, 3). Norm ||b₁*||² = 1² + 3² = 10." },
        { label: "3. Project b₂ onto b₁*", detail: "μ₂₁ = (b₂ · b₁*) / ||b₁*||² = (2×1 + 1×3) / 10 = 5 / 10 = 0.5." },
        { label: "4. Compute b₂*", detail: "b₂* = b₂ − μ₂₁ b₁* = (2, 1) − (0.5, 1.5) = (1.5, -0.5). Verified orthogonal: (1, 3) · (1.5, -0.5) = 0." }
      ],
      outcome: "Basis successfully orthogonalized, forming the core subroutine of LLL lattice reduction."
    },
    references: [
      {
        title: "Chris Peikert: A Decade of Lattice Cryptography (Foundations and Trends, 2016)",
        source: "IACR Archive",
        url: "https://eprint.iacr.org/2015/939.pdf",
        description: "The definitive comprehensive tutorial on lattice cryptography, geometry of numbers, and hardness reductions.",
        type: "book"
      }
    ]
  },
  "lwe-module-lwe": {
    pitfalls: [
      "Choosing error distribution e too wide: errors exceed the decoding threshold, causing catastrophic decryption failure.",
      "Choosing error distribution e too small: allows Arora-Ge algebraic attacks to solve the secret via non-linear polynomial systems."
    ],
    workedExample: {
      title: "Learning With Errors (LWE) Single-Bit Decryption (q = 17)",
      steps: [
        { label: "1. Parameters & Secret", detail: "Modulus q = 17. Secret s = 4. Shared A = 3. Small error e = 1." },
        { label: "2. Public Key", detail: "b = (A · s + e) mod 17 = (3 × 4 + 1) mod 17 = 13." },
        { label: "3. Encrypt Bit m = 1", detail: "Bit 1 is encoded as ⌈q/2⌋ = 9. Ephemeral r = 2, e₁ = 1, e₂ = 0. Ciphertext u = (3×2 + 1) = 7. v = (13×2 + 0 + 9) mod 17 = 35 mod 17 = 1." },
        { label: "4. Decrypt via Secret s", detail: "Compute v − s·u = 1 − 4×7 = 1 − 28 = −27 mod 17 = 7. Since 7 is close to 9 (⌈q/2⌋) rather than 0, decodes to m = 1!" }
      ],
      outcome: "Single bit successfully transmitted and decoded in the presence of noise."
    },
    references: [
      {
        title: "Oded Regev: On Lattices, Learning with Errors, Random Linear Codes, and Cryptography (STOC 2005)",
        source: "ACM STOC",
        url: "https://doi.org/10.1145/1060590.1060603",
        description: "The landmark paper introducing LWE and proving worst-case to average-case lattice hardness reductions.",
        type: "paper"
      }
    ]
  },
  "fips203-ml-kem": {
    pitfalls: [
      "Implementing polynomial NTT multiplications with variable execution time, exposing the secret key to cache-timing attacks.",
      "Omitting the Fujisaki-Okamoto re-encryption check in decapsulation: transforms the KEM from IND-CCA2 to passively secure IND-CPA, allowing chosen-ciphertext attacks."
    ],
    workedExample: {
      title: "Kyber Ring Modulus and Polynomial Representation",
      steps: [
        { label: "1. Quotient Ring", detail: "R_q = ℤ_q[X]/(X²⁵⁶ + 1) with prime q = 3329." },
        { label: "2. Property of q = 3329", detail: "3329 ≡ 1 mod 512 (3329 = 6 × 512 + 257). This permits primitive 512th roots of unity in ℤ_q." },
        { label: "3. NTT Splitting", detail: "X²⁵⁶ + 1 splits completely into 128 quadratic factors (X² − r_i) in ℤ_3329, enabling O(n log n) multiplication." },
        { label: "4. Matrix Dimension", detail: "ML-KEM-768 uses a 3 × 3 matrix of polynomials (rank k=3), providing 192 bits of classical and quantum security." }
      ],
      outcome: "Achieves microsecond-level key encapsulation over polynomial rings."
    },
    references: [
      {
        title: "NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard (Aug 2024)",
        source: "NIST CSRC",
        url: "https://doi.org/10.6028/NIST.FIPS.203",
        description: "Official federal publication establishing ML-KEM as the primary post-quantum key establishment standard.",
        type: "standard"
      }
    ]
  },
  "fips204-ml-dsa": {
    pitfalls: [
      "Skipping the rejection sampling step: if signatures outside the safe infinity-norm bound are emitted, the signature vector distribution leaks the private key over time.",
      "Allowing fault injections during verification: corrupting the high-bits extraction allows signature bypasses."
    ],
    workedExample: {
      title: "Dilithium Rejection Sampling Mechanics",
      steps: [
        { label: "1. Signer State", detail: "Secret s, ephemeral y sampled from uniform distribution [-γ₁ + 1, γ₁]." },
        { label: "2. Challenge Computation", detail: "w = A·y; c = H(message ‖ HighBits(w))." },
        { label: "3. Candidate Vector", detail: "Compute candidate signature z = y + c·s." },
        { label: "4. Rejection Check", detail: "If ||z||_∞ ≥ γ₁ − β, abort and restart with new y! Output is accepted ONLY when its distribution is completely independent of s." }
      ],
      outcome: "Guarantees zero secret-key leakage across millions of emitted signatures."
    },
    references: [
      {
        title: "NIST FIPS 204: Module-Lattice-Based Digital Signature Standard (Aug 2024)",
        source: "NIST CSRC",
        url: "https://doi.org/10.6028/NIST.FIPS.204",
        description: "The official federal standard establishing ML-DSA (CRYSTALS-Dilithium) as the primary digital signature standard.",
        type: "standard"
      }
    ]
  },
  "fips206-fn-dsa": {
    pitfalls: [
      "Using non-constant-time floating-point operations: double-precision float operations in software can leak private NTRU basis coordinates via CPU execution time variance.",
      "Deploying on constrained 8-bit or 16-bit microcontrollers lacking hardware floating-point units (FPUs)."
    ],
    workedExample: {
      title: "Falcon NTRU Equation and Basis Geometry",
      steps: [
        { label: "1. NTRU Polynomials", detail: "Private polynomials f, g, F, G in Z[X]/(X^n + 1) satisfying f*G - g*F = q." },
        { label: "2. Public Key", detail: "Compute skewed polynomial h = g * f^(-1) mod q." },
        { label: "3. Signature Generation", detail: "Solve CVP using Fast Fourier sampling over the Falcon tree to find short polynomials (s1, s2) such that s1 + s2*h = H(m) mod q." },
        { label: "4. Verification", detail: "Check that s1 + s2*h = H(m) mod q AND ||(s1, s2)|| <= beta. Smallest signatures in PQC (666 bytes)!" }
      ],
      outcome: "Ultra-compact lattice signature generated via discrete Gaussian sampling."
    },
    references: [
      {
        title: "NIST FIPS 206: Fast-Fourier Lattice-based Digital Signature Algorithm (FN-DSA)",
        source: "NIST CSRC",
        url: "https://csrc.nist.gov/pubs/fips/206/ipd",
        description: "Draft federal standard specifying the Falcon digital signature algorithm.",
        type: "standard"
      }
    ]
  },
  "code-based-mceliece": {
    pitfalls: [
      "Attempting to replace classical binary Goppa codes with structured codes (e.g. generalized Reed-Solomon) to shrink key size: consistently broken by algebraic attacks.",
      "Mismanaging memory when storing the massive ~1 MB public generator matrix in embedded environments."
    ],
    workedExample: {
      title: "McEliece Error-Correction Encryption Flow",
      steps: [
        { label: "1. Private Code", detail: "Goppa code G capable of correcting t errors. Scrambling matrix S, permutation matrix P." },
        { label: "2. Public Key G'", detail: "G' = S · G · P (appears completely indistinguishable from a random linear code matrix)." },
        { label: "3. Encryption", detail: "Encrypt k-bit message m by computing codeword c = m·G' ⊕ e, where e has exact Hamming weight t." },
        { label: "4. Decryption", detail: "Compute c·P⁻¹ = (mS)G ⊕ eP⁻¹. Patterson's algorithm strips error eP⁻¹, recovering mS, multiplied by S⁻¹ to get m!" }
      ],
      outcome: "Unbroken for 45+ years; highest confidence post-quantum encryption scheme."
    },
    references: [
      {
        title: "Robert J. McEliece: A Public-Key Cryptosystem Based on Algebraic Coding Theory (1978)",
        source: "JPL DSN Progress Report",
        url: "https://ipnpr.jpl.nasa.gov/progress_report/42-44/44N.PDF",
        description: "The original paper introducing code-based public-key cryptography.",
        type: "paper"
      }
    ]
  },
  "hash-signatures": {
    pitfalls: [
      "Stateful signature rollback: restoring a virtual machine snapshot or backup containing an XMSS or LMS key allows key reuse, completely breaking signature authenticity.",
      "Using Lamport or Winternitz OTS keys for more than one message."
    ],
    workedExample: {
      title: "Lamport One-Time Signature (OTS) on 1 Byte (0xA5 = 10100101₂)",
      steps: [
        { label: "1. Keypair", detail: "For 8 bits, Alice generates 8 pairs of 256-bit secret strings (x_{0,0}, x_{0,1}) ... (x_{7,0}, x_{7,1}). Public key = 16 hashes y_{i,j} = H(x_{i,j})." },
        { label: "2. Message Bits", detail: "Byte 0xA5 = bits [1, 0, 1, 0, 0, 1, 0, 1]." },
        { label: "3. Emit Signature", detail: "Signature reveals: σ = [x_{0,1}, x_{1,0}, x_{2,1}, x_{3,0}, x_{4,0}, x_{5,1}, x_{6,0}, x_{7,1}]." },
        { label: "4. Verification", detail: "Verifier checks whether H(x_{i, b_i}) matches the published public key hash y_{i, b_i}. Valid!" }
      ],
      outcome: "One-time signature verified solely by hash evaluations."
    },
    references: [
      {
        title: "NIST FIPS 205: Stateless Hash-Based Digital Signature Standard (SLH-DSA, Aug 2024)",
        source: "NIST CSRC",
        url: "https://doi.org/10.6028/NIST.FIPS.205",
        description: "Official federal standard specifying SPHINCS+ as a stateless hash-based digital signature algorithm.",
        type: "standard"
      }
    ]
  },
  "multivariate-isogeny": {
    pitfalls: [
      "Assuming mathematical sophistication guarantees security: SIKE used cutting-edge algebraic geometry but fell in 1 hour due to auxiliary torsion point leaks.",
      "Deploying unbalanced oil and vinegar (UOV) with undersized parameters susceptible to the MinRank algebraic attack."
    ],
    workedExample: {
      title: "The Castryck-Decru Attack on SIDH / SIKE (2022)",
      steps: [
        { label: "1. SIDH Setup", detail: "Supersingular elliptic curves over 𝔽_{p²}. Secret isogeny φ: E₀ → E_A of degree 2^a." },
        { label: "2. The Leaked Auxiliary Points", detail: "To allow Bob to evaluate his isogeny, Alice transmitted points φ(P_B) and φ(Q_B) on the public curve E_A." },
        { label: "3. Kani's Theorem (1997)", detail: "Castryck & Decru used Kani's reduction to connect isogenies between curves to isogenies between 2-dimensional abelian surfaces (E₀ × E_A)." },
        { label: "4. The Break", detail: "Recovered the secret isogeny in under 1 hour on an Intel Core i5 processor without quantum computation!" }
      ],
      outcome: "Complete mathematical break of SIKE/SIDH, ending its NIST standardization candidacy."
    },
    references: [
      {
        title: "Wouter Castryck & Thomas Decru: An Efficient Key Recovery Attack on SIDH (2022)",
        source: "IACR ePrint 2022/975",
        url: "https://eprint.iacr.org/2022/975",
        description: "The landmark paper that broke the supersingular isogeny Diffie-Hellman protocol.",
        type: "paper"
      }
    ]
  },
  "pqc-migration-hybrid": {
    pitfalls: [
      "Switching abruptly to pure post-quantum algorithms before implementations undergo years of real-world fuzzing and side-channel review: always mandate hybrid key exchange.",
      "Ignoring MTU packet fragmentation when deploying large post-quantum certificates over UDP (QUIC / DNSSEC)."
    ],
    workedExample: {
      title: "X25519Kyber768 Hybrid Key Derivation in TLS 1.3",
      steps: [
        { label: "1. Classical Exchange", detail: "Compute classical ECDH shared secret: s_ecdh = X25519(sk_client, pk_server) (32 bytes)." },
        { label: "2. Quantum Encapsulation", detail: "Compute post-quantum shared secret: s_kem = ML-KEM-768-Decap(ct, sk_server) (32 bytes)." },
        { label: "3. Concatenate Secrets", detail: "Combined secret s_hybrid = s_ecdh ‖ s_kem (64 bytes)." },
        { label: "4. HKDF Derivation", detail: "Session Key = HKDF-Extract(0, s_hybrid). If either X25519 OR ML-KEM is secure, the session key is 100% secure!" }
      ],
      outcome: "Combines classical and post-quantum security in billions of daily web connections."
    },
    references: [
      {
        title: "IETF Draft: Hybrid Key Exchange in TLS 1.3 (draft-ietf-tls-hybrid-design)",
        source: "IETF Standards Track",
        url: "https://datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design/",
        description: "Standardized architecture combining classical and post-quantum key exchange mechanisms.",
        type: "standard"
      }
    ]
  },
  "lightweight-crypto": {
    pitfalls: [
      "Attempting to run full AES-256 GCM on battery-powered Class 0 microcontrollers (< 1 KB RAM), exhausting memory and power.",
      "Deploying lightweight ciphers on high-speed cloud servers where standard AES with hardware AES-NI instructions is significantly faster."
    ],
    workedExample: {
      title: "ASCON-128 Sponge State and Permutation",
      steps: [
        { label: "1. Sponge State", detail: "320-bit internal state S divided into 5 64-bit words: x₀, x₁, x₂, x₃, x₄." },
        { label: "2. Round Transformations", detail: "Each round applies: 1) Constant addition p_C; 2) Non-linear substitution p_S (5-bit S-box across words); 3) Linear diffusion p_L (rotations and XORs within each word)." },
        { label: "3. Initialization", detail: "State initialized with 128-bit key K, 128-bit nonce N, and configuration constants, permuted for 12 rounds." },
        { label: "4. Absorption & Squeezing", detail: "Data is absorbed and squeezed in 64-bit blocks, producing ciphertext and a 128-bit authentication tag." }
      ],
      outcome: "High-security authenticated encryption optimized for low-power IoT hardware."
    },
    references: [
      {
        title: "NIST Selects 'Ascon' as Lightweight Cryptography Standard (2023)",
        source: "NIST News",
        url: "https://www.nist.gov/news-events/news/2023/02/nist-selects-lightweight-cryptography-standard-protect-small-devices",
        description: "Official announcement detailing ASCON's selection after a multi-year global competition.",
        type: "standard"
      }
    ]
  },
  "saes-appendix-d": {
    pitfalls: [
      "Using regular integer multiplication instead of polynomial multiplication modulo x⁴ + x + 1 over GF(2⁴).",
      "Executing MixColumns in the final round (both full AES and S-AES omit MixColumns in their final round!)."
    ],
    workedExample: {
      title: "S-AES MixColumns on State [[A, 2], [3, F]]",
      steps: [
        { label: "1. State Nibbles", detail: "Column 0: s₀₀ = 0xA (1010₂), s₁₀ = 0x3 (0011₂)." },
        { label: "2. MixColumns Matrix", detail: "Constant matrix M = [[1, 4], [4, 1]] over GF(2⁴) mod (x⁴ + x + 1). 4 corresponds to x²." },
        { label: "3. Matrix Multiplication", detail: "s'₀₀ = (1 ⊗ 0xA) ⊕ (4 ⊗ 0x3). 1 ⊗ 0xA = 0xA (1010₂). 4 ⊗ 0x3 = x² · (x + 1) = x³ + x² = 1100₂ (0xC)." },
        { label: "4. Sum in GF(2⁴)", detail: "s'₀₀ = 0xA ⊕ 0xC = 1010₂ ⊕ 1100₂ = 0110₂ = 0x6." }
      ],
      outcome: "New mixed nibble s'₀₀ = 0x6. Fully calculates Galois field diffusion by hand."
    },
    references: [
      {
        title: "Edward F. Schaefer: A Simplified Data Encryption Standard (and Simplified AES)",
        source: "Cryptologia (Vol. 20, Issue 1)",
        url: "https://doi.org/10.1080/0161-119691884799",
        description: "The pedagogical paper introducing Simplified AES for classroom and hand-calculation study.",
        type: "paper"
      }
    ]
  }
};

let filePath = 'd:/Projects/Crypto/Cypher/src/content/postquantum.ts';
let code = fs.readFileSync(filePath, 'utf-8');

for (const [id, data] of Object.entries(enrichments)) {
  const target = new RegExp('(id:\\s*"' + id + '",[\\s\\S]*?)(toolId:|glossary:|\\n\\s*\\})');
  const match = code.match(target);
  if (!match) {
    console.warn("Could not find lesson:", id);
    continue;
  }
  let injection = '';
  if (data.pitfalls) {
    injection += '    pitfalls: ' + JSON.stringify(data.pitfalls, null, 6) + ',\n';
  }
  if (data.workedExample) {
    injection += '    workedExample: ' + JSON.stringify(data.workedExample, null, 6) + ',\n';
  }
  if (data.references) {
    injection += '    references: ' + JSON.stringify(data.references, null, 6) + ',\n';
  }
  const replacement = match[1] + injection + '    ' + match[2];
  code = code.replace(match[0], replacement);
}

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Successfully enriched postquantum.ts!");
