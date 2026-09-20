import type { Lesson } from "./types";

export const postQuantumLessons: Lesson[] = [
  {
    id: "quantum-foundations",
    trackId: "postquantum",
    title: "Quantum Computing & Cryptographic Threats",
    subtitle: "Superposition, entanglement, and the limits of classical hardness",
    formula: {
      expr: "|ψ⟩ = α|0⟩ + β|1⟩,  |α|² + |β|² = 1;   |Ψ⟩ = (1/√2)(|00⟩ + |11⟩)",
      badge: "Quantum Mechanics",
      note: "A classical bit is strictly 0 or 1. A quantum bit (qubit) exists in a continuous linear superposition of basis states until measured. Entanglement links multiple qubits into an exponentially large 2ⁿ Hilbert state space.",
    },
    pitfalls: [
      "Believing quantum computers are simply faster classical multicore processors: quantum speedups require specific algebraic structure and constructive interference.",
      "Dismissing the 'Harvest Now, Decrypt Later' threat for data with multi-decade confidentiality requirements (e.g. government secrets, medical records)."
],
    workedExample: {
      "title": "Quantum Superposition Measurement Probability",
      "steps": [
            {
                  "label": "1. Qubit State",
                  "detail": "Qubit |ψ⟩ = (√3 / 2)|0⟩ + (1 / 2)|1⟩."
            },
            {
                  "label": "2. Verify Normalization",
                  "detail": "|α|² + |β|² = (√3/2)² + (1/2)² = 3/4 + 1/4 = 1. Valid pure state."
            },
            {
                  "label": "3. Probability Calculation",
                  "detail": "Probability of measuring |0⟩ = |α|² = 75%. Probability of measuring |1⟩ = |β|² = 25%."
            },
            {
                  "label": "4. Wavefunction Collapse",
                  "detail": "Upon measurement, |ψ⟩ collapses irrevocably to |0⟩ or |1⟩. Superposition is destroyed."
            }
      ],
      "outcome": "Demonstrates why quantum algorithms must use phase interference to amplify the probability of correct answers before measurement."
},
    references: [
      {
            "title": "Nielsen & Chuang: Quantum Computation and Quantum Information",
            "source": "Cambridge University Press",
            "url": "https://en.wikipedia.org/wiki/Quantum_Computation_and_Quantum_Information",
            "description": "The definitive textbook ('Mike and Ike') on quantum mechanics, quantum circuits, and quantum algorithms.",
            "type": "book"
      },
      {
            "title": "MIT OpenCourseWare: Quantum Physics and Information",
            "source": "MIT OCW",
            "url": "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/",
            "description": "Free university lecture series covering linear superposition, Hilbert spaces, and measurement.",
            "type": "tutorial"
      }
],
    body: [
      "Modern public-key cryptography (RSA, Diffie–Hellman, ECDH, ECDSA) relies entirely on two computational problems: integer factorization and discrete logarithms (over finite fields and elliptic curve groups). While no polynomial-time classical algorithm exists to solve them, their security is not an absolute mathematical law — it is an empirical assumption tied directly to classical Turing computation.",
      "A quantum computer processes quantum information represented as qubits. By exploiting quantum superposition, an operation applied to an n-qubit register acts on all 2ⁿ basis states simultaneously. Through quantum entanglement, states cannot be described independently, enabling destructive interference of incorrect candidate solutions and constructive amplification of the true answer.",
      "The 'Harvest Now, Decrypt Later' (HNDL) strategy represents an immediate threat: nation-state adversaries are currently intercepting and archiving encrypted military, diplomatic, and financial traffic across the global Internet. When a Cryptanalytically Relevant Quantum Computer (CRQC) becomes operational, all captured historical traffic will be retroactively decrypted unless protected by post-quantum algorithms today.",
    ],
    keyPoints: [
      "Public-key cryptography is vulnerable because its hardness assumptions collapse under quantum computation.",
      "Harvest Now, Decrypt Later makes quantum-resistant migration urgent today, years before large quantum computers are built.",
      "Symmetric cryptography (AES) remains viable by doubling key lengths; public-key cryptography requires completely new mathematical foundations.",
    ],
    toolId: "pqc-threat-calculator",
    glossary: [
      {
        term: "Qubit",
        def: "The fundamental unit of quantum information, represented as a two-level quantum mechanical system.",
      },
      {
        term: "Superposition",
        def: "The ability of a quantum system to be in multiple basis states simultaneously until measurement collapses the wave function.",
      },
      {
        term: "Entanglement",
        def: "A quantum phenomenon where the state of multiple particles cannot be factored into independent product states.",
      },
      {
        term: "CRQC",
        def: "Cryptanalytically Relevant Quantum Computer — a hypothetical quantum machine with enough stable logical qubits to execute Shor's algorithm against practical key sizes.",
      },
    ],
  },
  {
    id: "shor-grover-threats",
    trackId: "postquantum",
    title: "Shor's vs. Grover's Algorithms",
    subtitle: "Exponential speedup for algebra, polynomial speedup for brute force",
    formula: {
      expr: "Shor: O((log N)³) polynomial time;   Grover: O(√N) quadratic speedup",
      badge: "Quantum Complexity",
      note: "Peter Shor (1994) transformed order-finding into a quantum Fourier transform (QFT) problem. Lov Grover (1996) proved a quadratic speedup for unstructured database searches.",
    },
    pitfalls: [
      "Assuming increasing RSA key sizes to 4096 or 8192 bits will defend against Shor's algorithm: Shor scales as O((log N)³), meaning doubling the key only increases quantum factoring time by ~8x.",
      "Assuming Grover's algorithm renders AES-256 insecure: Grover requires 2¹²⁸ evaluations, still physically impossible."
],
    workedExample: {
      "title": "Shor's Period-Finding Algorithm on N = 15 with Base a = 7",
      "steps": [
            {
                  "label": "1. Compute Powers of 7 mod 15",
                  "detail": "7¹ = 7, 7² = 49 ≡ 4, 7³ = 28 ≡ 13, 7⁴ = 91 ≡ 1 mod 15. The period is r = 4!"
            },
            {
                  "label": "2. Quantum Phase Estimation",
                  "detail": "Shor's QFT subroutine finds period r = 4 in polynomial time O((log 15)³)."
            },
            {
                  "label": "3. Check r is Even",
                  "detail": "r = 4 is even, so compute a^(r/2) = 7² = 49 ≡ 4 mod 15."
            },
            {
                  "label": "4. Find Prime Factors via GCD",
                  "detail": "Factor 1: gcd(4 − 1, 15) = gcd(3, 15) = 3. Factor 2: gcd(4 + 1, 15) = gcd(5, 15) = 5. Factored into 3 × 5!"
            }
      ],
      "outcome": "Integer 15 successfully factored in polynomial quantum steps."
},
    references: [
      {
            "title": "Peter W. Shor: Algorithms for Quantum Computation: Discrete Logarithms and Factoring (1994)",
            "source": "IEEE FOCS",
            "url": "https://doi.org/10.1109/SFCS.1994.365700",
            "description": "The landmark paper demonstrating that quantum computers factor integers in polynomial time.",
            "type": "paper"
      },
      {
            "title": "Lov K. Grover: A Fast Quantum Mechanical Algorithm for Database Search (1996)",
            "source": "ACM STOC",
            "url": "https://doi.org/10.1145/237814.237866",
            "description": "The original paper establishing the O(√N) quadratic speedup for unstructured search.",
            "type": "paper"
      }
],
    body: [
      "Shor's algorithm completely breaks RSA, finite-field Diffie–Hellman, and Elliptic Curve Cryptography (ECC) in polynomial time: O((log N)³). It works by rephrasing integer factorization and discrete logarithms as order-finding problems (finding the smallest integer r such that aʳ ≡ 1 mod N). Using the Quantum Fourier Transform (QFT), a quantum register can identify the period r in polynomial time. For RSA-2048, Shor's algorithm requires approximately 4,096 ideal logical qubits, or roughly 4 to 10 million physical qubits with surface-code fault tolerance.",
      "Grover's algorithm tackles unstructured search problems. Given an unsorted space of N = 2ᵏ possibilities, a classical computer requires N/2 evaluations on average to find a target. Grover's algorithm uses amplitude amplification to locate the target in O(√N) = O(2^(k/2)) operations. This quadratic speedup does not break symmetric algorithms, but effectively halves their key length.",
      "Consequently, AES-128 offers 64 bits of quantum security (unacceptable), whereas AES-256 maintains 128 bits of post-quantum security — well beyond any computational horizon. Cryptographic hash functions like SHA-256 require 384 or 512 bits to retain 128-bit collision resistance against quantum collision attacks (Brassard et al.).",
    ],
    keyPoints: [
      "Shor's algorithm provides an exponential speedup, reducing RSA and ECC from sub-exponential/exponential to polynomial time.",
      "Grover's algorithm provides a quadratic speedup, halving the effective key bits of symmetric ciphers and preimage resistance.",
      "AES-256 and SHA-384/512 are quantum-resistant; RSA, ECDH, and ECDSA are completely obsolete in the presence of a CRQC.",
    ],
    toolId: "pqc-threat-calculator",
    glossary: [
      {
        term: "Quantum Fourier Transform (QFT)",
        def: "A linear transformation on quantum bits that computes the discrete Fourier transform with exponential speedup, enabling period finding.",
      },
      {
        term: "Amplitude Amplification",
        def: "The quantum subroutine in Grover's algorithm that repeatedly reflects the state vector to boost the probability of measuring the correct state.",
      },
      {
        term: "Logical Qubit",
        def: "An error-corrected, fault-tolerant qubit synthesized from hundreds or thousands of noisy physical qubits.",
      },
    ],
  },
  {
    id: "lattice-foundations",
    trackId: "postquantum",
    title: "Lattice-Based Cryptography Foundations",
    subtitle: "Geometry of numbers, basis reduction, and shortest vector problems",
    formula: {
      expr: "Λ = { ∑ cᵢ bᵢ : cᵢ ∈ ℤ },  dim(Λ) = n,  det(Λ) = |det(B)|",
      badge: "Geometry of Numbers",
      note: "A lattice is a discrete periodic arrangement of points in n-dimensional Euclidean space generated by integer linear combinations of basis vectors.",
    },
    pitfalls: [
      "Assuming low-dimensional lattices (2D or 3D) are secure: low-dimensional lattices are solved in milliseconds using the LLL algorithm.",
      "Conflating vector basis quality: a 'bad' basis looks like random parallel vectors, making CVP practically unsolvable without the secret trapdoor basis."
],
    workedExample: {
      "title": "2D Lattice Gram-Schmidt Orthogonalization",
      "steps": [
            {
                  "label": "1. Input Basis",
                  "detail": "b₁ = (1, 3), b₂ = (2, 1)."
            },
            {
                  "label": "2. First Orthogonal Vector",
                  "detail": "b₁* = b₁ = (1, 3). Norm ||b₁*||² = 1² + 3² = 10."
            },
            {
                  "label": "3. Project b₂ onto b₁*",
                  "detail": "μ₂₁ = (b₂ · b₁*) / ||b₁*||² = (2×1 + 1×3) / 10 = 5 / 10 = 0.5."
            },
            {
                  "label": "4. Compute b₂*",
                  "detail": "b₂* = b₂ − μ₂₁ b₁* = (2, 1) − (0.5, 1.5) = (1.5, -0.5). Verified orthogonal: (1, 3) · (1.5, -0.5) = 0."
            }
      ],
      "outcome": "Basis successfully orthogonalized, forming the core subroutine of LLL lattice reduction."
},
    references: [
      {
            "title": "Chris Peikert: A Decade of Lattice Cryptography (Foundations and Trends, 2016)",
            "source": "IACR Archive",
            "url": "https://eprint.iacr.org/2015/939.pdf",
            "description": "The definitive comprehensive tutorial on lattice cryptography, geometry of numbers, and hardness reductions.",
            "type": "book"
      }
],
    body: [
      "A lattice Λ generated by a basis B = {b₁, b₂, ..., bₙ} in ℝⁿ is the set of all integer linear combinations of the basis vectors. Any given lattice has infinitely many different bases related by unimodular transformation matrices U with det(U) = ±1. A 'good' basis consists of short, nearly orthogonal vectors; a 'bad' basis consists of long, highly skewed, nearly parallel vectors.",
      "The security of lattice-based cryptography rests on the hardness of geometric problems in high dimensions (typically n ≥ 512 to 1024):",
      "1. Shortest Vector Problem (SVP): Given a lattice basis B, find the non-zero lattice vector v ∈ Λ with the smallest Euclidean norm ||v||. The approximate version (SVP_γ) asks for a vector no longer than γ times the shortest vector.",
      "2. Closest Vector Problem (CVP): Given a basis B and an arbitrary target point t ∉ Λ, find the lattice vector v ∈ Λ closest to t.",
      "3. Shortest Independent Vectors Problem (SIVP): Find n linearly independent lattice vectors that minimize the maximum norm.",
      "In low dimensions (n ≤ 30), algorithms like the Lenstra–Lenstra–Lovász (LLL) lattice reduction and Block Korkine–Zolotarev (BKZ) efficiently solve these problems. But in high dimensions, the best known classical and quantum algorithms require exponential time 2^(O(n)). Unlike factoring, quantum computers provide no polynomial shortcut for lattice reduction.",
    ],
    keyPoints: [
      "A lattice can be represented by 'good' (orthogonal) or 'bad' (skewed) bases.",
      "Finding the shortest or closest vector in high dimensions (n ≥ 512) is NP-hard or believed to require exponential time.",
      "SVP and CVP remain computationally intractable for both classical and quantum computers.",
    ],
    toolId: "pqc-lattice-visualizer",
    glossary: [
      {
        term: "Lattice",
        def: "A discrete additive subgroup of ℝⁿ consisting of all integral linear combinations of a set of linearly independent vectors.",
      },
      {
        term: "SVP (Shortest Vector Problem)",
        def: "The problem of finding the shortest non-zero vector in a lattice given an arbitrary basis.",
      },
      {
        term: "CVP (Closest Vector Problem)",
        def: "The problem of finding the point in a lattice nearest to an arbitrary target vector in Euclidean space.",
      },
      {
        term: "LLL Algorithm",
        def: "A polynomial-time lattice reduction algorithm developed in 1982 that approximates SVP within an exponential factor.",
      },
    ],
  },
  {
    id: "lwe-module-lwe",
    trackId: "postquantum",
    title: "Learning With Errors (LWE & Module-LWE)",
    subtitle: "Hiding secrets behind small Gaussian perturbations",
    formula: {
      expr: "b = A·s + e (mod q);   find secret s ∈ ℤ_qⁿ given (A, b)",
      badge: "Hard Lattice Problem",
      note: "Introduced by Oded Regev in 2005. Without the error vector e, solving for s is trivial via Gaussian elimination. With even tiny noise e, the problem is as hard as worst-case lattice problems.",
    },
    pitfalls: [
      "Choosing error distribution e too wide: errors exceed the decoding threshold, causing catastrophic decryption failure.",
      "Choosing error distribution e too small: allows Arora-Ge algebraic attacks to solve the secret via non-linear polynomial systems."
],
    workedExample: {
      "title": "Learning With Errors (LWE) Single-Bit Decryption (q = 17)",
      "steps": [
            {
                  "label": "1. Parameters & Secret",
                  "detail": "Modulus q = 17. Secret s = 4. Shared A = 3. Small error e = 1."
            },
            {
                  "label": "2. Public Key",
                  "detail": "b = (A · s + e) mod 17 = (3 × 4 + 1) mod 17 = 13."
            },
            {
                  "label": "3. Encrypt Bit m = 1",
                  "detail": "Bit 1 is encoded as ⌈q/2⌋ = 9. Ephemeral r = 2, e₁ = 1, e₂ = 0. Ciphertext u = (3×2 + 1) = 7. v = (13×2 + 0 + 9) mod 17 = 35 mod 17 = 1."
            },
            {
                  "label": "4. Decrypt via Secret s",
                  "detail": "Compute v − s·u = 1 − 4×7 = 1 − 28 = −27 mod 17 = 7. Since 7 is close to 9 (⌈q/2⌋) rather than 0, decodes to m = 1!"
            }
      ],
      "outcome": "Single bit successfully transmitted and decoded in the presence of noise."
},
    references: [
      {
            "title": "Oded Regev: On Lattices, Learning with Errors, Random Linear Codes, and Cryptography (STOC 2005)",
            "source": "ACM STOC",
            "url": "https://doi.org/10.1145/1060590.1060603",
            "description": "The landmark paper introducing LWE and proving worst-case to average-case lattice hardness reductions.",
            "type": "paper"
      }
],
    body: [
      "The Learning With Errors (LWE) problem is the cornerstone of modern post-quantum public-key systems. Consider a random matrix A ∈ ℤ_q^(m × n) and a secret vector s ∈ ℤ_qⁿ. If an observer is given pairs (A, b = As mod q), recovering s is trivial using Gaussian elimination in O(n³) operations. However, if we add a small error vector e sampled from a discrete Gaussian distribution χ (where elements are tiny relative to the modulus q), recovering s becomes computationally intractable.",
      "Regev proved a profound mathematical reduction: solving the average-case LWE problem is at least as hard as solving the worst-case Shortest Independent Vectors Problem (SIVP) on general lattices. There are two variants:",
      "• Search-LWE: Given (A, b = As + e), recover the exact secret vector s.",
      "• Decision-LWE: Distinguish between pairs (A, b = As + e) and pairs (A, u) where u is uniformly random.",
      "Standard LWE requires storing large m × n matrices, leading to public keys of several megabytes. To solve this efficiency bottleneck, cryptographers introduced algebraic structure: Ring-LWE replaces vectors with polynomials in the quotient ring R_q = ℤ_q[X]/(Xⁿ + 1). Module-LWE strikes the optimal balance between security and performance by using small matrices of ring elements, providing flexible parameter scaling without the algebraic attack surfaces of pure Ring-LWE.",
    ],
    keyPoints: [
      "LWE transforms linear systems into computationally hard problems by injecting tiny discrete Gaussian errors.",
      "The hardness of average-case LWE reduces directly to worst-case lattice problems.",
      "Module-LWE provides the structural engine behind NIST's primary post-quantum standards.",
    ],
    toolId: "pqc-lwe-simulator",
    glossary: [
      {
        term: "LWE",
        def: "Learning With Errors: finding a secret vector given noisy inner products with random vectors modulo q.",
      },
      {
        term: "Ring-LWE",
        def: "An algebraic variant of LWE defined over polynomial quotient rings, dramatically reducing key sizes.",
      },
      {
        term: "Module-LWE",
        def: "A generalization that considers modules over polynomial rings, combining the compact size of Ring-LWE with the security robustness of standard LWE.",
      },
    ],
  },
  {
    id: "fips203-ml-kem",
    trackId: "postquantum",
    title: "FIPS 203: ML-KEM (CRYSTALS-Kyber)",
    subtitle: "NIST's primary standard for post-quantum key encapsulation",
    formula: {
      expr: "R_q = ℤ_q[X]/(X²⁵⁶ + 1),  q = 3329;   t = A·s + e;   u = Aᵀ·r + e₁,  v = tᵀ·r + e₂ + ⌈q/2⌋·m",
      badge: "FIPS 203 Standard",
      note: "Standardized in August 2024. Operates on k × k polynomial matrices in dimension n = 256. Uses the Number Theoretic Transform (NTT) for O(n log n) polynomial multiplication.",
    },
    pitfalls: [
      "Implementing polynomial NTT multiplications with variable execution time, exposing the secret key to cache-timing attacks.",
      "Omitting the Fujisaki-Okamoto re-encryption check in decapsulation: transforms the KEM from IND-CCA2 to passively secure IND-CPA, allowing chosen-ciphertext attacks."
],
    workedExample: {
      "title": "Kyber Ring Modulus and Polynomial Representation",
      "steps": [
            {
                  "label": "1. Quotient Ring",
                  "detail": "R_q = ℤ_q[X]/(X²⁵⁶ + 1) with prime q = 3329."
            },
            {
                  "label": "2. Property of q = 3329",
                  "detail": "3329 ≡ 1 mod 512 (3329 = 6 × 512 + 257). This permits primitive 512th roots of unity in ℤ_q."
            },
            {
                  "label": "3. NTT Splitting",
                  "detail": "X²⁵⁶ + 1 splits completely into 128 quadratic factors (X² − r_i) in ℤ_3329, enabling O(n log n) multiplication."
            },
            {
                  "label": "4. Matrix Dimension",
                  "detail": "ML-KEM-768 uses a 3 × 3 matrix of polynomials (rank k=3), providing 192 bits of classical and quantum security."
            }
      ],
      "outcome": "Achieves microsecond-level key encapsulation over polynomial rings."
},
    references: [
      {
            "title": "NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard (Aug 2024)",
            "source": "NIST CSRC",
            "url": "https://doi.org/10.6028/NIST.FIPS.203",
            "description": "Official federal publication establishing ML-KEM as the primary post-quantum key establishment standard.",
            "type": "standard"
      }
],
    body: [
      "ML-KEM (Module-Lattice Key Encapsulation Mechanism), derived from the CRYSTALS-Kyber submission, is NIST's selected primary post-quantum key establishment standard (FIPS 203). Instead of encrypting arbitrary payloads directly, a KEM securely establishes a 256-bit symmetric shared secret between two parties over an insecure channel.",
      "The algorithm operates over the cyclotomic ring R_q = ℤ_q[X]/(X²⁵⁶ + 1) with modulus q = 3329 (a prime chosen because 3329 ≡ 1 mod 512, which permits complete splitting into degree-1 linear factors for extremely fast Number Theoretic Transform (NTT) multiplications). The security parameter k represents the matrix rank:",
      "• ML-KEM-512 (k = 2): NIST Security Level 1 (equivalent to AES-128 against quantum attack).",
      "• ML-KEM-768 (k = 3): NIST Security Level 3 (equivalent to AES-192, the recommended general-purpose default).",
      "• ML-KEM-1024 (k = 4): NIST Security Level 5 (equivalent to AES-256).",
      "Key Generation: Alice samples a public matrix A ∈ R_q^(k × k) from a 32-byte seed ρ using SHAKE-128. She samples small secret polynomials s and errors e from a centered binomial distribution. Her public key is (A, t = As + e).",
      "Encapsulation: Bob encodes a random 32-byte message m into polynomial coefficients scaled by ⌈q/2⌋. He samples ephemeral vectors r, e₁, and scalar e₂, computing ciphertext u = Aᵀr + e₁ and v = tᵀr + e₂ + ⌈q/2⌋m. The shared key K is derived via SHA-3 / SHAKE-256.",
      "Decapsulation: Alice computes v - sᵀu = m·⌈q/2⌋ + (eᵀr + e₂ - sᵀe₁). Because the combined noise term is strictly smaller than q/4, Alice rounds each coefficient to 0 or ⌈q/2⌋ to recover m without error. To achieve IND-CCA2 security, ML-KEM wraps this CPA-secure scheme in the Fujisaki–Okamoto (FO) transform: Alice re-encrypts the recovered message and verifies that the generated ciphertext matches Bob's byte-for-byte.",
    ],
    keyPoints: [
      "ML-KEM is the official NIST FIPS 203 standard for quantum-resistant key establishment.",
      "Relies on Module-LWE over R_q with q = 3329 and polynomial degree n = 256.",
      "Applies the Fujisaki–Okamoto transform with implicit rejection to defeat chosen-ciphertext attacks.",
    ],
    toolId: "pqc-kyber-simulator",
    glossary: [
      {
        term: "KEM (Key Encapsulation Mechanism)",
        def: "A cryptographic primitive where a sender generates a random symmetric key and encapsulates it in a ciphertext using the recipient's public key.",
      },
      {
        term: "NTT (Number Theoretic Transform)",
        def: "A discrete Fourier transform defined over a finite field or ring, enabling polynomial multiplication in O(n log n) rather than O(n²).",
      },
      {
        term: "Fujisaki–Okamoto (FO) Transform",
        def: "A conversion technique that turns a passively secure (IND-CPA) public-key encryption scheme into an actively secure (IND-CCA2) KEM.",
      },
    ],
  },
  {
    id: "fips204-ml-dsa",
    trackId: "postquantum",
    title: "FIPS 204: ML-DSA (CRYSTALS-Dilithium)",
    subtitle: "Lattice-based digital signatures with 'Fiat-Shamir with Aborts'",
    formula: {
      expr: "w = A·y;  c = H(μ ∥ w₁);  z = y + c·s;   reject if ∥z∥ ≥ γ₁ - β;   verify: ∥z∥ < γ₁ - β and w₁ = HighBits(A·z - c·t)",
      badge: "FIPS 204 Standard",
      note: "Standardized in August 2024. Built on Module-LWE and Module-SIS. Uses rejection sampling so the signature z reveals zero information about the private key s.",
    },
    pitfalls: [
      "Skipping the rejection sampling step: if signatures outside the safe infinity-norm bound are emitted, the signature vector distribution leaks the private key over time.",
      "Allowing fault injections during verification: corrupting the high-bits extraction allows signature bypasses."
],
    workedExample: {
      "title": "Dilithium Rejection Sampling Mechanics",
      "steps": [
            {
                  "label": "1. Signer State",
                  "detail": "Secret s, ephemeral y sampled from uniform distribution [-γ₁ + 1, γ₁]."
            },
            {
                  "label": "2. Challenge Computation",
                  "detail": "w = A·y; c = H(message ‖ HighBits(w))."
            },
            {
                  "label": "3. Candidate Vector",
                  "detail": "Compute candidate signature z = y + c·s."
            },
            {
                  "label": "4. Rejection Check",
                  "detail": "If ||z||_∞ ≥ γ₁ − β, abort and restart with new y! Output is accepted ONLY when its distribution is completely independent of s."
            }
      ],
      "outcome": "Guarantees zero secret-key leakage across millions of emitted signatures."
},
    references: [
      {
            "title": "NIST FIPS 204: Module-Lattice-Based Digital Signature Standard (Aug 2024)",
            "source": "NIST CSRC",
            "url": "https://doi.org/10.6028/NIST.FIPS.204",
            "description": "The official federal standard establishing ML-DSA (CRYSTALS-Dilithium) as the primary digital signature standard.",
            "type": "standard"
      }
],
    body: [
      "ML-DSA (Module-Lattice Digital Signature Algorithm), based on CRYSTALS-Dilithium, is NIST's primary standard for general-purpose post-quantum digital signatures (FIPS 204). It replaces RSA-PSS, DSA, and ECDSA.",
      "The scheme is built on the 'Fiat–Shamir with Aborts' framework (invented by Vadim Lyubashevsky). In classical Fiat–Shamir signatures (like Schnorr), the signer computes z = y + c·s. If this were applied directly to lattices, the distribution of z would depend on the secret key s, leaking private key information across multiple signatures. To prevent this without complex trapdoor sampling, Lyubashevsky introduced rejection sampling: if the candidate signature vector z exceeds a strict geometric threshold (||z|| ≥ γ₁ - β), the signer simply aborts and restarts with a fresh ephemeral vector y.",
      "Key sizes and signatures are remarkably compact compared to other post-quantum schemes: an ML-DSA-65 (Level 3) public key is 1,952 bytes, and its signature is 3,309 bytes. It avoids floating-point operations entirely, executing with constant-time modular integer arithmetic to resist physical side-channel leakage.",
    ],
    keyPoints: [
      "ML-DSA is NIST's primary standard for post-quantum digital signatures.",
      "Uses Fiat–Shamir with Aborts and rejection sampling to decouple signature distributions from secret keys.",
      "Relies on the hardness of Module Learning With Errors (M-LWE) and Module Shortest Integer Solution (M-SIS).",
    ],
    toolId: "pqc-threat-calculator",
    glossary: [
      {
        term: "Rejection Sampling",
        def: "A technique where candidate signature vectors outside an allowed bound are discarded, ensuring the output distribution is completely independent of the private key.",
      },
      {
        term: "SIS (Shortest Integer Solution)",
        def: "The problem of finding a non-zero short vector z such that Az ≡ 0 mod q, forming the basis for lattice signature security.",
      },
    ],
  },
  {
    id: "fips206-fn-dsa",
    trackId: "postquantum",
    title: "FIPS 206: FN-DSA (Falcon)",
    subtitle: "Fast-Fourier lattice signatures with minimal bandwidth",
    formula: {
      expr: "h = g·f⁻¹ (mod q);   s₁ + s₂·h ≡ H(m) (mod q);   ∥(s₁, s₂)∥ ≤ β",
      badge: "FIPS 206 Standard",
      note: "Standardized as FN-DSA. Uses the Gentry–Peikert–Vaikuntanathan (GPV) hash-and-sign trapdoor paradigm over NTRU lattices with Fast Fourier orthogonalization.",
    },
    pitfalls: [
      "Using non-constant-time floating-point operations: double-precision float operations in software can leak private NTRU basis coordinates via CPU execution time variance.",
      "Deploying on constrained 8-bit or 16-bit microcontrollers lacking hardware floating-point units (FPUs)."
],
    workedExample: {
      "title": "Falcon NTRU Equation and Basis Geometry",
      "steps": [
            {
                  "label": "1. NTRU Polynomials",
                  "detail": "Private polynomials f, g, F, G in Z[X]/(X^n + 1) satisfying f*G - g*F = q."
            },
            {
                  "label": "2. Public Key",
                  "detail": "Compute skewed polynomial h = g * f^(-1) mod q."
            },
            {
                  "label": "3. Signature Generation",
                  "detail": "Solve CVP using Fast Fourier sampling over the Falcon tree to find short polynomials (s1, s2) such that s1 + s2*h = H(m) mod q."
            },
            {
                  "label": "4. Verification",
                  "detail": "Check that s1 + s2*h = H(m) mod q AND ||(s1, s2)|| <= beta. Smallest signatures in PQC (666 bytes)!"
            }
      ],
      "outcome": "Ultra-compact lattice signature generated via discrete Gaussian sampling."
},
    references: [
      {
            "title": "NIST FIPS 206: Fast-Fourier Lattice-based Digital Signature Algorithm (FN-DSA)",
            "source": "NIST CSRC",
            "url": "https://csrc.nist.gov/pubs/fips/206/ipd",
            "description": "Draft federal standard specifying the Falcon digital signature algorithm.",
            "type": "standard"
      }
],
    body: [
      "FN-DSA (Fast-Fourier Lattice-based Digital Signature Algorithm), based on the Falcon submission, is NIST's secondary signature standard (FIPS 206), optimized for environments where network transmission bandwidth is at a premium.",
      "While ML-DSA uses rejection sampling, FN-DSA follows the GPV (Gentry–Peikert–Vaikuntanathan) hash-and-sign paradigm over NTRU lattices. The private key is a 'good' basis of short polynomials (f, g, F, G) satisfying the NTRU equation fG - gF = q, while the public key is the skewed polynomial h = g·f⁻¹ mod q.",
      "To sign a message digest H(m), the signer uses Fast Fourier sampling over the Falcon tree to solve a discrete Gaussian Closest Vector Problem (CVP), producing a very short signature vector (s₁, s₂) such that s₁ + s₂·h ≡ H(m) mod q. Because the signature vector is exceptionally short, Falcon signatures are tiny: just 666 bytes for Falcon-512 (compared to 2,420 bytes for Dilithium2).",
      "The engineering trade-off is implementation complexity: FN-DSA requires double-precision floating-point arithmetic (IEEE 754) with strictly constant-time execution to prevent timing attacks on the Fast Fourier tree sampler.",
    ],
    keyPoints: [
      "FN-DSA produces the smallest signatures among all NIST lattice standards (666 bytes for Level 1).",
      "Follows the GPV hash-and-sign paradigm over NTRU lattices using Fast Fourier Gaussian sampling.",
      "Requires constant-time floating-point arithmetic, making it ideal for web certificates but challenging for constrained microcontrollers.",
    ],
    toolId: "pqc-threat-calculator",
    glossary: [
      {
        term: "NTRU Lattice",
        def: "A class of convolution modular lattices characterized by blocks of circulant matrices, allowing compact polynomial representations.",
      },
      {
        term: "GPV Paradigm",
        def: "A signature method where the private key acts as a trapdoor to sample short vectors in a lattice near a hashed target point.",
      },
    ],
  },
  {
    id: "code-based-mceliece",
    trackId: "postquantum",
    title: "Code-Based Cryptography & Classic McEliece",
    subtitle: "Robert McEliece's 1978 vision: 45 years unbroken",
    formula: {
      expr: "G' = S·G·P;   c = m·G' ⊕ e,  wt(e) = t;   decryption: c·P⁻¹ = (mS)G ⊕ eP⁻¹",
      badge: "Classic McEliece",
      note: "Proposed in 1978. Relies on the NP-hardness of decoding an arbitrary linear error-correcting code, while using an algebraic Goppa code as the secret trapdoor.",
    },
    pitfalls: [
      "Attempting to replace classical binary Goppa codes with structured codes (e.g. generalized Reed-Solomon) to shrink key size: consistently broken by algebraic attacks.",
      "Mismanaging memory when storing the massive ~1 MB public generator matrix in embedded environments."
],
    workedExample: {
      "title": "McEliece Error-Correction Encryption Flow",
      "steps": [
            {
                  "label": "1. Private Code",
                  "detail": "Goppa code G capable of correcting t errors. Scrambling matrix S, permutation matrix P."
            },
            {
                  "label": "2. Public Key G'",
                  "detail": "G' = S · G · P (appears completely indistinguishable from a random linear code matrix)."
            },
            {
                  "label": "3. Encryption",
                  "detail": "Encrypt k-bit message m by computing codeword c = m·G' ⊕ e, where e has exact Hamming weight t."
            },
            {
                  "label": "4. Decryption",
                  "detail": "Compute c·P⁻¹ = (mS)G ⊕ eP⁻¹. Patterson's algorithm strips error eP⁻¹, recovering mS, multiplied by S⁻¹ to get m!"
            }
      ],
      "outcome": "Unbroken for 45+ years; highest confidence post-quantum encryption scheme."
},
    references: [
      {
            "title": "Robert J. McEliece: A Public-Key Cryptosystem Based on Algebraic Coding Theory (1978)",
            "source": "JPL DSN Progress Report",
            "url": "https://ipnpr.jpl.nasa.gov/progress_report/42-44/44N.PDF",
            "description": "The original paper introducing code-based public-key cryptography.",
            "type": "paper"
      }
],
    body: [
      "Code-based cryptography, introduced by Robert McEliece in 1978, is the oldest surviving public-key cryptosystem. While RSA and Diffie–Hellman rely on number theory, McEliece relies on algorithmic coding theory: namely, that decoding an unknown, random-looking linear code without knowledge of its underlying structure is NP-hard (syndrome decoding).",
      "Key Generation: Alice chooses a binary Goppa code with generator matrix G ∈ 𝔽₂^(k × n) capable of correcting up to t errors. She selects a random non-singular scrambling matrix S ∈ 𝔽₂^(k × k) and a random permutation matrix P ∈ 𝔽₂^(n × n). Her public key is the scrambled matrix G' = S·G·P. Her private key is the triple (S, G, P).",
      "Encryption: To encrypt a k-bit message m, Bob computes c = m·G' ⊕ e, where e is a random n-bit error vector with exact Hamming weight wt(e) = t.",
      "Decryption: Alice computes c·P⁻¹ = (m·S)G ⊕ (e·P⁻¹). Because P is a permutation, wt(e·P⁻¹) = t. Alice uses the efficient Patterson decoding algorithm for Goppa codes to eliminate the error vector and recover m·S, then multiplies by S⁻¹ to obtain m.",
      "Security & Practicality: Classic McEliece is regarded as the most conservative post-quantum algorithm in existence, having resisted cryptanalysis for over four decades. However, its public keys are massive (261 KB to 1.04 MB) because they contain generator matrices. Ciphertexts, however, are tiny (around 128 bytes to 240 bytes) and decapsulation is blindingly fast (tens of microseconds).",
    ],
    keyPoints: [
      "Classic McEliece is based on the NP-hard syndrome decoding problem of general linear error-correcting codes.",
      "Has survived 45+ years of intense cryptanalytic scrutiny without any structural break.",
      "Features very large public keys (~1 MB) but tiny ciphertexts (~128 bytes) and ultra-fast hardware decapsulation.",
    ],
    toolId: "pqc-mceliece",
    glossary: [
      {
        term: "Goppa Code",
        def: "A class of linear error-correcting codes defined over finite fields with efficient algebraic decoding algorithms (e.g., Patterson's algorithm).",
      },
      {
        term: "Syndrome Decoding",
        def: "The problem of finding the minimum weight error vector matching a given syndrome s = y·Hᵀ, proven to be NP-complete by Berlekamp et al.",
      },
      {
        term: "Hamming Weight",
        def: "The number of non-zero symbols in a vector.",
      },
    ],
  },
  {
    id: "hash-signatures",
    trackId: "postquantum",
    title: "Hash-Based Digital Signatures (SPHINCS+)",
    subtitle: "Minimal assumptions: security guaranteed by collision-resistant hashes",
    formula: {
      expr: "Lamport OTS: (x_{i,0}, x_{i,1}) \\xrightarrow{H} (y_{i,0}, y_{i,1});   σ_i = x_{i, m_i};   FIPS 205: SLH-DSA",
      badge: "FIPS 205 Standard",
      note: "Standardized in August 2024 as SLH-DSA. Relies entirely on the preimage and collision resistance of cryptographic hash functions like SHA-256 and SHAKE-256.",
    },
    pitfalls: [
      "Stateful signature rollback: restoring a virtual machine snapshot or backup containing an XMSS or LMS key allows key reuse, completely breaking signature authenticity.",
      "Using Lamport or Winternitz OTS keys for more than one message."
],
    workedExample: {
      "title": "Lamport One-Time Signature (OTS) on 1 Byte (0xA5 = 10100101₂)",
      "steps": [
            {
                  "label": "1. Keypair",
                  "detail": "For 8 bits, Alice generates 8 pairs of 256-bit secret strings (x_{0,0}, x_{0,1}) ... (x_{7,0}, x_{7,1}). Public key = 16 hashes y_{i,j} = H(x_{i,j})."
            },
            {
                  "label": "2. Message Bits",
                  "detail": "Byte 0xA5 = bits [1, 0, 1, 0, 0, 1, 0, 1]."
            },
            {
                  "label": "3. Emit Signature",
                  "detail": "Signature reveals: σ = [x_{0,1}, x_{1,0}, x_{2,1}, x_{3,0}, x_{4,0}, x_{5,1}, x_{6,0}, x_{7,1}]."
            },
            {
                  "label": "4. Verification",
                  "detail": "Verifier checks whether H(x_{i, b_i}) matches the published public key hash y_{i, b_i}. Valid!"
            }
      ],
      "outcome": "One-time signature verified solely by hash evaluations."
},
    references: [
      {
            "title": "NIST FIPS 205: Stateless Hash-Based Digital Signature Standard (SLH-DSA, Aug 2024)",
            "source": "NIST CSRC",
            "url": "https://doi.org/10.6028/NIST.FIPS.205",
            "description": "Official federal standard specifying SPHINCS+ as a stateless hash-based digital signature algorithm.",
            "type": "standard"
      }
],
    body: [
      "Hash-based digital signatures represent the ultimate fallback for post-quantum security. Unlike lattice or code-based schemes, they do not rely on structured algebraic hardness assumptions. Their security rests solely on the standard cryptographic security of hash functions (preimage resistance, second preimage resistance, and collision resistance). If lattices ever fail, hash-based signatures will remain completely secure.",
      "The foundation is the Lamport One-Time Signature (OTS) scheme (1979): for an n-bit digest, Alice generates 2n random secret strings (x_{i,0}, x_{i,1}) and publishes their hashes (y_{i,0}, y_{i,1}). To sign message bit b_i, Alice reveals x_{i, b_i}. Anyone can verify that H(x_{i, b_i}) = y_{i, b_i}. Crucially, an OTS key can only be used once: signing a second different message reveals opposite bits, allowing attackers to forge arbitrary signatures.",
      "To sign multiple messages, Ralph Merkle invented Merkle Signature Schemes (MSS): OTS public keys form the leaves of a binary Merkle tree, where the root hash serves as the master public key. Stateful schemes like XMSS (RFC 8391) and LMS (RFC 8554) track an internal leaf counter; if the counter is ever cloned or reused (e.g., via VM snapshot rollbacks), the system is fatally compromised.",
      "FIPS 205: SLH-DSA (SPHINCS+) solves this operational risk by creating a stateless hash-based signature scheme. It arranges hyper-trees of Merkle trees over few-time signature systems (FORS - Forest of Random Subsets). Signatures are self-contained and require no state management, making them immune to backup restoration bugs at the expense of larger signature sizes (8 to 49 KB).",
    ],
    keyPoints: [
      "Hash-based signatures rely exclusively on hash function security, free from lattice or number-theoretic assumptions.",
      "One-time signatures (Lamport, WOTS+) must never sign more than one message per key.",
      "SLH-DSA (SPHINCS+, FIPS 205) is completely stateless, providing robust quantum resistance for code signing and long-term roots of trust.",
    ],
    toolId: "pqc-lamport-merkle",
    glossary: [
      {
        term: "One-Time Signature (OTS)",
        def: "A digital signature scheme whose private key can safely sign exactly one message before becoming insecure.",
      },
      {
        term: "WOTS+ (Winternitz OTS+)",
        def: "An optimized hash-based OTS that signs several bits simultaneously using hash chains, reducing key and signature sizes.",
      },
      {
        term: "Stateless Hash-Based Signature",
        def: "A signature scheme (like SPHINCS+) that uses vast pseudo-random hyper-trees so signers never need to record or synchronize which leaves have been used.",
      },
    ],
  },
  {
    id: "multivariate-isogeny",
    trackId: "postquantum",
    title: "Multivariate & Isogeny Cryptography",
    subtitle: "Quadratic polynomial equations, elliptic curve walks, and lessons from SIKE",
    formula: {
      expr: "MQ: p_i(x_1, ..., x_n) = ∑ γ_{ijk} x_j x_k + ∑ β_{ij} x_j + α_i = y_i;   Isogeny: φ: E_1 \\to E_2",
      badge: "MQ & Isogenies",
      note: "Multivariate cryptography solves systems of non-linear polynomial equations over finite fields 𝔽_q. Isogeny cryptography navigates graphs of supersingular elliptic curves.",
    },
    pitfalls: [
      "Assuming mathematical sophistication guarantees security: SIKE used cutting-edge algebraic geometry but fell in 1 hour due to auxiliary torsion point leaks.",
      "Deploying unbalanced oil and vinegar (UOV) with undersized parameters susceptible to the MinRank algebraic attack."
],
    workedExample: {
      "title": "The Castryck-Decru Attack on SIDH / SIKE (2022)",
      "steps": [
            {
                  "label": "1. SIDH Setup",
                  "detail": "Supersingular elliptic curves over 𝔽_{p²}. Secret isogeny φ: E₀ → E_A of degree 2^a."
            },
            {
                  "label": "2. The Leaked Auxiliary Points",
                  "detail": "To allow Bob to evaluate his isogeny, Alice transmitted points φ(P_B) and φ(Q_B) on the public curve E_A."
            },
            {
                  "label": "3. Kani's Theorem (1997)",
                  "detail": "Castryck & Decru used Kani's reduction to connect isogenies between curves to isogenies between 2-dimensional abelian surfaces (E₀ × E_A)."
            },
            {
                  "label": "4. The Break",
                  "detail": "Recovered the secret isogeny in under 1 hour on an Intel Core i5 processor without quantum computation!"
            }
      ],
      "outcome": "Complete mathematical break of SIKE/SIDH, ending its NIST standardization candidacy."
},
    references: [
      {
            "title": "Wouter Castryck & Thomas Decru: An Efficient Key Recovery Attack on SIDH (2022)",
            "source": "IACR ePrint 2022/975",
            "url": "https://eprint.iacr.org/2022/975",
            "description": "The landmark paper that broke the supersingular isogeny Diffie-Hellman protocol.",
            "type": "paper"
      }
],
    body: [
      "Multivariate Quadratic (MQ) Cryptography: A multivariate public key is a system of m quadratic polynomial equations in n variables over a small finite field 𝔽_q. Solving random systems of multivariate quadratic equations (the MQ problem) is proven to be NP-complete and NP-hard. Schemes like Unbalanced Oil and Vinegar (UOV) and Rainbow design a secret trapdoor that permits polynomial evaluation inversion by separating variables into 'oil' and 'vinegar' sets.",
      "While multivariate signatures are extremely short (as small as 60 bytes), their public keys are large, and several high-profile candidates (including Rainbow in Round 3 of NIST PQC) suffered catastrophic structural algebraic breaks by Beullens using the MinRank attack.",
      "Isogeny-Based Cryptography: Instead of using points on an elliptic curve, isogeny-based schemes use morphisms (structure-preserving maps called isogenies) between different elliptic curves. Schemes like SIDH (Supersingular Isogeny Diffie–Hellman) and SIKE featured the smallest public keys among all post-quantum proposals (~330 bytes).",
      "The Historic SIKE Break (2022): In July 2022, Wouter Castryck and Thomas Decru published an astonishing mathematical breakthrough that recovered SIKE's secret key in under an hour on a single CPU core. The vulnerability lay in the auxiliary torsion point information that SIKE transmitted to enable Bob to evaluate Alice's isogeny. Using Kani's theorem and abelian surfaces (genus 2 theta functions), they transformed the problem into finding an isogeny between abelian varieties, proving that high mathematical elegance does not guarantee security.",
    ],
    keyPoints: [
      "Multivariate cryptography relies on the NP-hard MQ problem; UOV is undergoing secondary NIST evaluation for short signatures.",
      "SIKE/SIDH was completely broken in 2022 using genus 2 abelian surfaces exploiting auxiliary torsion points.",
      "Highlights the critical importance of cryptanalytic maturity before deploying post-quantum primitives.",
    ],
    toolId: "pqc-threat-calculator",
    glossary: [
      {
        term: "Multivariate Quadratic (MQ)",
        def: "The computational problem of solving a set of non-linear degree-2 polynomial equations over a finite field.",
      },
      {
        term: "Isogeny",
        def: "A non-constant algebraic morphism between two elliptic curves that preserves the identity point (group structure).",
      },
      {
        term: "Castryck–Decru Attack",
        def: "The 2022 mathematical attack that completely destroyed the security of the SIKE isogeny cryptosystem.",
      },
    ],
  },
  {
    id: "pqc-migration-hybrid",
    trackId: "postquantum",
    title: "PQC Migration & Hybrid Schemes",
    subtitle: "X25519Kyber768 in TLS 1.3, CNSA 2.0 timelines, and defense-in-depth",
    formula: {
      expr: "SharedKey = HKDF-Extract(0, ECDH_Secret ∥ ML-KEM_Secret);   dual security guarantee",
      badge: "Hybrid Post-Quantum",
      note: "Combines a battle-tested classical algorithm (X25519) with a post-quantum algorithm (ML-KEM-768). If either algorithm holds, the session remains confidential.",
    },
    pitfalls: [
      "Switching abruptly to pure post-quantum algorithms before implementations undergo years of real-world fuzzing and side-channel review: always mandate hybrid key exchange.",
      "Ignoring MTU packet fragmentation when deploying large post-quantum certificates over UDP (QUIC / DNSSEC)."
],
    workedExample: {
      "title": "X25519Kyber768 Hybrid Key Derivation in TLS 1.3",
      "steps": [
            {
                  "label": "1. Classical Exchange",
                  "detail": "Compute classical ECDH shared secret: s_ecdh = X25519(sk_client, pk_server) (32 bytes)."
            },
            {
                  "label": "2. Quantum Encapsulation",
                  "detail": "Compute post-quantum shared secret: s_kem = ML-KEM-768-Decap(ct, sk_server) (32 bytes)."
            },
            {
                  "label": "3. Concatenate Secrets",
                  "detail": "Combined secret s_hybrid = s_ecdh ‖ s_kem (64 bytes)."
            },
            {
                  "label": "4. HKDF Derivation",
                  "detail": "Session Key = HKDF-Extract(0, s_hybrid). If either X25519 OR ML-KEM is secure, the session key is 100% secure!"
            }
      ],
      "outcome": "Combines classical and post-quantum security in billions of daily web connections."
},
    references: [
      {
            "title": "IETF Draft: Hybrid Key Exchange in TLS 1.3 (draft-ietf-tls-hybrid-design)",
            "source": "IETF Standards Track",
            "url": "https://datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design/",
            "description": "Standardized architecture combining classical and post-quantum key exchange mechanisms.",
            "type": "standard"
      }
],
    body: [
      "Transitioning the entire world's digital infrastructure to post-quantum cryptography is the largest cryptographic migration in human history. To mitigate the risk of unforeseen mathematical breakthroughs against nascent lattice schemes, modern security architectures mandate hybrid key exchange.",
      "In a hybrid key exchange (such as X25519Kyber768, standardized by the IETF for TLS 1.3), the client and server perform both an X25519 Diffie–Hellman exchange and an ML-KEM-768 key encapsulation simultaneously. The resulting shared secrets are concatenated and passed through HKDF-Extract. For an adversary to compromise the session, they must break both the classical elliptic-curve discrete log problem and the Module-LWE lattice problem.",
      "Major browser vendors (Google Chrome, Apple Safari) and CDN providers (Cloudflare) already protect billions of daily HTTPS connections using hybrid X25519Kyber768. The US National Security Agency (NSA) Commercial National Security Algorithm (CNSA 2.0) guidelines establish mandatory migration deadlines:",
      "• By 2025–2027: Software and firmware updates must support post-quantum algorithms.",
      "• By 2030: All new national security systems, TLS connections, and VPNs must exclusively employ post-quantum algorithms.",
      "• By 2033: Complete deprecation and decommission of all classical public-key cryptography (RSA, DSA, DH, ECDH, ECDSA).",
    ],
    keyPoints: [
      "Hybrid key exchange (X25519 + ML-KEM) guarantees that confidentiality holds if either algorithm remains unbroken.",
      "Billions of daily web sessions already use hybrid post-quantum TLS 1.3.",
      "CNSA 2.0 mandates the total deprecation of classical public-key algorithms by 2030–2033.",
    ],
    toolId: "tls-handshake",
    glossary: [
      {
        term: "Hybrid Key Exchange",
        def: "A key agreement protocol that combines both classical and post-quantum algorithms in parallel to provide defense-in-depth.",
      },
      {
        term: "CNSA 2.0",
        def: "The Commercial National Security Algorithm Suite 2.0 published by the NSA, specifying quantum-resistant requirements for critical systems.",
      },
    ],
  },
  {
    id: "lightweight-crypto",
    trackId: "postquantum",
    title: "Lightweight Cryptography (Stallings Ch. 14)",
    subtitle: "Security for IoT, RFID, and hardware-constrained microcontrollers",
    formula: {
      expr: "ASCON-128: 320-bit permutation state;  PRESENT: 31-round SPN, 64-bit block, 4-bit S-Box",
      badge: "NIST Lightweight Standard",
      note: "William Stallings 8th Edition Chapter 14.1 & 14.2. Constrained devices (Class 0: < 10 KB ROM, < 1 KB RAM) cannot support standard AES-GCM without exhausting silicon area and battery.",
    },
    pitfalls: [
      "Attempting to run full AES-256 GCM on battery-powered Class 0 microcontrollers (< 1 KB RAM), exhausting memory and power.",
      "Deploying lightweight ciphers on high-speed cloud servers where standard AES with hardware AES-NI instructions is significantly faster."
],
    workedExample: {
      "title": "ASCON-128 Sponge State and Permutation",
      "steps": [
            {
                  "label": "1. Sponge State",
                  "detail": "320-bit internal state S divided into 5 64-bit words: x₀, x₁, x₂, x₃, x₄."
            },
            {
                  "label": "2. Round Transformations",
                  "detail": "Each round applies: 1) Constant addition p_C; 2) Non-linear substitution p_S (5-bit S-box across words); 3) Linear diffusion p_L (rotations and XORs within each word)."
            },
            {
                  "label": "3. Initialization",
                  "detail": "State initialized with 128-bit key K, 128-bit nonce N, and configuration constants, permuted for 12 rounds."
            },
            {
                  "label": "4. Absorption & Squeezing",
                  "detail": "Data is absorbed and squeezed in 64-bit blocks, producing ciphertext and a 128-bit authentication tag."
            }
      ],
      "outcome": "High-security authenticated encryption optimized for low-power IoT hardware."
},
    references: [
      {
            "title": "NIST Selects 'Ascon' as Lightweight Cryptography Standard (2023)",
            "source": "NIST News",
            "url": "https://www.nist.gov/news-events/news/2023/02/nist-selects-lightweight-cryptography-standard-protect-small-devices",
            "description": "Official announcement detailing ASCON's selection after a multi-year global competition.",
            "type": "standard"
      }
],
    body: [
      "While post-quantum cryptography addresses the high-end threat of quantum computers, Lightweight Cryptography solves the opposite challenge: securing billions of resource-constrained Internet of Things (IoT) devices, RFIDs, smart cards, and implanted medical sensors (Table 14.1 in Stallings).",
      "Stallings classifies constrained devices into three tiers:",
      "• Class 0 (C0): Data size < 1 KB RAM, code size < 10 KB ROM/Flash. Cannot run standard TLS or AES-GCM.",
      "• Class 1 (C1): Data size ~10 KB RAM, code size ~100 KB ROM/Flash. Highly constrained, requires lightweight protocols like CoAP and CBOR.",
      "• Class 2 (C2): Data size ~50 KB RAM, code size ~250 KB Flash. Capable of supporting stripped-down standard cryptography.",
      "Lightweight Cipher Designs: To minimize gate count and energy consumption, lightweight algorithms replace 8-bit S-boxes with 4-bit S-boxes and eliminate complex linear mixing layers:",
      "1. PRESENT: An ultra-lightweight block cipher with a 64-bit block size and 80-bit or 128-bit key. It uses a 31-round Substitution-Permutation Network (SPN) with a single 4-bit S-Box (requiring only ~1500 GE - Gate Equivalents).",
      "2. SIMON and SPECK: Developed by the NSA for ultra-constrained hardware and software implementations using simple ARX (Addition, Rotation, XOR) primitives.",
      "3. ASCON: Selected in 2023 as NIST's official Lightweight Cryptography Standard for Authenticated Encryption with Associated Data (AEAD) and hashing. Built on a sponge construction with a 320-bit permutation, ASCON provides robust security against side-channel differential power analysis while operating efficiently on 8-bit and 32-bit microcontrollers.",
    ],
    keyPoints: [
      "Lightweight cryptography optimizes for silicon area (Gate Equivalents), power consumption, and memory constraints in IoT devices.",
      "Uses 4-bit S-boxes, bit permutations, and sponge constructions instead of memory-heavy 8-bit lookups.",
      "ASCON is NIST's official standard for lightweight AEAD and hashing.",
    ],
    toolId: "simplified-aes",
    glossary: [
      {
        term: "Gate Equivalent (GE)",
        def: "A standard metric for silicon area in ASICs, equivalent to the area of a basic two-input NAND gate.",
      },
      {
        term: "SPN (Substitution-Permutation Network)",
        def: "A cipher architecture that interleaves non-linear substitution boxes (S-boxes) with bit permutation layers.",
      },
      {
        term: "ASCON",
        def: "NIST's lightweight cryptographic standard for authenticated encryption and hashing, designed for low-power IoT microcontrollers.",
      },
    ],
  },
  {
    id: "saes-appendix-d",
    trackId: "postquantum",
    title: "Simplified AES (Stallings Appendix D)",
    subtitle: "The 16-bit educational cipher over GF(2⁴) and its mathematical mechanics",
    formula: {
      expr: "Block: 16 bits (4 nibbles), Key: 16 bits;   NibbleSub over GF(2⁴) mod (x⁴ + x + 1);   MixColumns with [[1, 4], [4, 1]]",
      badge: "Stallings S-AES",
      note: "Developed by Edward Schaefer and detailed in Stallings Appendix D. Retains every structural feature of full AES (SubBytes, ShiftRows, MixColumns, AddRoundKey) in a format calculated by hand.",
    },
    pitfalls: [
      "Using regular integer multiplication instead of polynomial multiplication modulo x⁴ + x + 1 over GF(2⁴).",
      "Executing MixColumns in the final round (both full AES and S-AES omit MixColumns in their final round!)."
],
    workedExample: {
      "title": "S-AES MixColumns on State [[A, 2], [3, F]]",
      "steps": [
            {
                  "label": "1. State Nibbles",
                  "detail": "Column 0: s₀₀ = 0xA (1010₂), s₁₀ = 0x3 (0011₂)."
            },
            {
                  "label": "2. MixColumns Matrix",
                  "detail": "Constant matrix M = [[1, 4], [4, 1]] over GF(2⁴) mod (x⁴ + x + 1). 4 corresponds to x²."
            },
            {
                  "label": "3. Matrix Multiplication",
                  "detail": "s'₀₀ = (1 ⊗ 0xA) ⊕ (4 ⊗ 0x3). 1 ⊗ 0xA = 0xA (1010₂). 4 ⊗ 0x3 = x² · (x + 1) = x³ + x² = 1100₂ (0xC)."
            },
            {
                  "label": "4. Sum in GF(2⁴)",
                  "detail": "s'₀₀ = 0xA ⊕ 0xC = 1010₂ ⊕ 1100₂ = 0110₂ = 0x6."
            }
      ],
      "outcome": "New mixed nibble s'₀₀ = 0x6. Fully calculates Galois field diffusion by hand."
},
    references: [
      {
            "title": "Edward F. Schaefer: A Simplified Data Encryption Standard (and Simplified AES)",
            "source": "Cryptologia (Vol. 20, Issue 1)",
            "url": "https://doi.org/10.1080/0161-119691884799",
            "description": "The pedagogical paper introducing Simplified AES for classroom and hand-calculation study.",
            "type": "paper"
      }
],
    body: [
      "In Appendix D of Cryptography and Network Security, William Stallings presents Simplified AES (S-AES), designed by Edward Schaefer. S-AES features the exact same algorithmic structure, mathematical principles, and algebraic stages as full 128-bit AES, but operates on a 16-bit block with a 16-bit key.",
      "This makes it the premier pedagogical tool for understanding modern block ciphers, finite field arithmetic, and differential cryptanalysis without the cognitive overload of a 16-byte state matrix.",
      "S-AES State and Stages:",
      "• State Matrix: A 2 × 2 matrix of 4-bit nibbles: [ [s₀₀, s₀₁], [s₁₀, s₁₁] ] representing the 16-bit block.",
      "• NibbleSub: Non-linear byte substitution using a 4-bit S-Box derived from modular inversion in the Galois field GF(2⁴) modulo the irreducible polynomial m(x) = x⁴ + x + 1 (binary 10011), followed by an affine transformation.",
      "• ShiftRows: Row 0 remains unchanged; Row 1 is cyclically rotated left by one nibble (swapping s₁₀ and s₁₁).",
      "• MixColumns: Matrix multiplication over GF(2⁴) with constant matrix M = [ [1, 4], [4, 1] ] where 4 corresponds to polynomial x² in GF(2⁴).",
      "• AddRoundKey: Bitwise XOR of the 16-bit state with the 16-bit round key (W₀, W₁, W₂, W₃, W₄, W₅).",
      "Round Execution: Initial AddRoundKey (Round 0), Round 1 (NibbleSub, ShiftRows, MixColumns, AddRoundKey), and Round 2 (NibbleSub, ShiftRows, AddRoundKey — omitting MixColumns, exactly like full AES!).",
    ],
    keyPoints: [
      "S-AES preserves all algorithmic characteristics of standard AES in a 16-bit block cipher.",
      "Computes Galois Field multiplication over GF(2⁴) with irreducible polynomial x⁴ + x + 1.",
      "Key expansion generates three 16-bit round keys from an initial 16-bit master key using Rcon constants.",
    ],
    toolId: "simplified-aes",
    glossary: [
      {
        term: "Nibble",
        def: "A 4-bit half-byte capable of representing 16 distinct hexadecimal values (0x0 to 0xF).",
      },
      {
        term: "GF(2⁴)",
        def: "Galois Field of 16 elements, where arithmetic is defined as polynomial multiplication modulo an irreducible degree-4 polynomial.",
      },
      {
        term: "S-AES",
        def: "Simplified Advanced Encryption Standard, an educational cipher introduced by Schaefer and Stallings to teach AES mechanics.",
      },
    ],
  },
];
