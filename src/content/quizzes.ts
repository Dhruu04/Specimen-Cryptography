export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export const lessonQuizzes: Record<string, QuizQuestion[]> = {
  // Classical
  "caesar-cipher": [
    {
      id: "q_caesar_1",
      question: "In a classical Caesar cipher with key k = 3, what does the plaintext letter 'X' encrypt to in standard 26-letter modulo arithmetic?",
      options: ["A", "B", "Z", "Y"],
      correctIndex: 0,
      explanation: "Position of 'X' is 23 (where A=0). (23 + 3) mod 26 = 26 mod 26 = 0, which corresponds to 'A'.",
      topic: "Modular Shift",
    },
    {
      id: "q_caesar_2",
      question: "Why does the Caesar cipher offer zero computational security against ciphertext-only attacks?",
      options: [
        "It uses a non-linear S-box",
        "The key space size is only 25 possible shifts, easily brute-forced in milliseconds",
        "It generates key-dependent padding oracles",
        "It relies on the hardness of discrete logarithms"
      ],
      correctIndex: 1,
      explanation: "There are only 25 non-trivial shifts in the English alphabet (keys 1 to 25). A simple exhaustive search instantly reveals the readable English plaintext.",
      topic: "Key Space Complexity",
    },
  ],

  // Encoding
  "encoding-basics": [
    {
      id: "q_enc_1",
      question: "What is the primary difference between encoding (e.g. Base64) and encryption (e.g. AES)?",
      options: [
        "Encoding requires a secret key, whereas encryption is publicly reversible",
        "Encoding is reversible by anyone using public deterministic algorithms; encryption strictly requires a secret key for confidentiality",
        "Encoding always compresses data to 50% of its original size",
        "Encoding guarantees message authenticity and integrity"
      ],
      correctIndex: 1,
      explanation: "Encoding transforms data representations for transport/storage without secrecy. Encryption protects confidentiality using a secret key.",
      topic: "Encoding vs Encryption",
    },
    {
      id: "q_enc_2",
      question: "How much data overhead is introduced by standard Base64 encoding?",
      options: ["0% (no overhead)", "Approximately 33.3% increase", "100% increase (doubles in size)", "50% reduction"],
      correctIndex: 1,
      explanation: "Base64 encodes every 3 binary bytes (24 bits) into 4 ASCII printable characters (4 × 8 = 32 bits), creating a 4/3 ratio (+33.3% expansion).",
      topic: "Base64 Expansion",
    },
  ],

  // Symmetric
  "aes-state": [
    {
      id: "q_aes_1",
      question: "What is the size of the internal State matrix in AES, regardless of whether the key is 128, 192, or 256 bits?",
      options: ["8×8 bytes (64 bytes)", "4×4 bytes (16 bytes / 128 bits)", "2×2 bytes (4 bytes)", "16×16 bytes (256 bytes)"],
      correctIndex: 1,
      explanation: "The AES block size is fixed at 128 bits (16 bytes), organized as a 4×4 byte matrix. Only the key length and number of rounds vary (10, 12, or 14 rounds).",
      topic: "AES State Matrix",
    },
    {
      id: "q_aes_2",
      question: "Which AES round transformation provides 'confusion' via a non-linear substitution in Galois Field GF(2⁸)?",
      options: ["ShiftRows", "MixColumns", "SubBytes", "AddRoundKey"],
      correctIndex: 2,
      explanation: "SubBytes performs non-linear byte substitution using the multiplicative inverse in GF(2⁸) followed by an affine transformation to prevent differential and linear cryptanalysis.",
      topic: "AES Transformations",
    },
  ],

  // Hashing
  "sha256": [
    {
      id: "q_sha_1",
      question: "What is the length of the internal hash state and the output message digest of SHA-256?",
      options: ["128 bits (16 bytes)", "160 bits (20 bytes)", "256 bits (32 bytes)", "512 bits (64 bytes)"],
      correctIndex: 2,
      explanation: "SHA-256 produces a 256-bit (32-byte) digest processed in 512-bit message blocks using 8 32-bit working variables (A through H).",
      topic: "Hash Output Length",
    },
    {
      id: "q_sha_2",
      question: "Why should fast hash functions like SHA-256 never be used alone to hash passwords for storage?",
      options: [
        "They have been completely broken by collision attacks",
        "They are designed to be extremely fast on GPUs/ASICs, allowing billions of guesses per second; memory-hard functions like Argon2id are required",
        "They do not support salts",
        "They produce variable-length digests"
      ],
      correctIndex: 1,
      explanation: "SHA-256 is designed for fast stream processing. Modern GPUs can calculate billions of SHA-256 hashes/sec, making dictionary/brute-force cracking trivial without memory-hard key derivation functions.",
      topic: "Password Hashing Security",
    },
  ],

  // Public Key
  "rsa": [
    {
      id: "q_rsa_1",
      question: "In the RSA cryptosystem with primes p = 11 and q = 13, what is Euler's totient function φ(n)?",
      options: ["143", "120", "24", "132"],
      correctIndex: 1,
      explanation: "φ(n) = (p - 1) × (q - 1) = (11 - 1) × (13 - 1) = 10 × 12 = 120. Modulus n = 11 × 13 = 143.",
      topic: "Euler's Totient Calculation",
    },
    {
      id: "q_rsa_2",
      question: "What mathematical property must the public encryption exponent 'e' satisfy relative to φ(n)?",
      options: ["e must be greater than n", "gcd(e, φ(n)) = 1 (e must be coprime to φ(n))", "e must be an even integer", "e must equal p + q"],
      correctIndex: 1,
      explanation: "e must be coprime to φ(n) so that the modular inverse d ≡ e⁻¹ (mod φ(n)) exists by the Extended Euclidean Algorithm.",
      topic: "Coprimality and Inverses",
    },
  ],

  // Post Quantum
  "pqc-crystals": [
    {
      id: "q_pqc_1",
      question: "Which mathematical hard problem forms the foundation of NIST FIPS 203 (ML-KEM / Kyber)?",
      options: [
        "Integer factorization of large semiprimes",
        "The Module Learning With Errors (M-LWE) problem on high-dimensional polynomial lattices",
        "Discrete logarithm over elliptic curve groups",
        "Isogeny path-finding on supersingular elliptic curves"
      ],
      correctIndex: 1,
      explanation: "ML-KEM is built on the hardness of Module Learning With Errors (M-LWE), which is resistant to Shor's quantum algorithm because polynomial lattices have no known hidden subgroup periodicity.",
      topic: "Lattice Hardness",
    },
    {
      id: "q_pqc_2",
      question: "Why does Shor's quantum algorithm break RSA and ECC, but fails against lattice-based cryptography?",
      options: [
        "Lattices use longer bit lengths",
        "RSA and ECC rely on abelian groups where quantum period finding calculates periods in polynomial time; shortest vector problems in lattices lack this periodic structure",
        "Lattice cryptography uses quantum superposition during key generation",
        "Quantum computers can only compute even numbers"
      ],
      correctIndex: 1,
      explanation: "Shor's algorithm exploits the Quantum Fourier Transform to find the period of functions in abelian groups in O((log n)³) time. Lattice problems (SVP, CVP, LWE) do not translate to periodic group orders.",
      topic: "Quantum Resistance",
    },
  ],

  // Number Theory
  "euclid-algorithm": [
    {
      id: "q_euclid_1",
      question: "According to Bézout's Identity, for any integers a and b with gcd(a, b) = d, there exist integers s and t such that:",
      options: ["a · b = s · t + d", "a · s + b · t = d", "a^s + b^t = d", "s / a + t / b = d"],
      correctIndex: 1,
      explanation: "Bézout's identity states that the greatest common divisor can always be written as an integer linear combination: a·s + b·t = gcd(a, b).",
      topic: "Bézout's Identity",
    },
    {
      id: "q_euclid_2",
      question: "What is the worst-case number of divisions for Euclid's algorithm to compute gcd(a, b)?",
      options: [
        "O(n²) where n is the number of digits",
        "Lamé's Theorem states it never exceeds 5 times the number of decimal digits of the smaller number (Fibonacci numbers yield the worst case)",
        "Always exactly 1 division",
        "Exponential in the size of the inputs"
      ],
      correctIndex: 1,
      explanation: "By Lamé's Theorem (1844), consecutive Fibonacci numbers produce quotients of 1 at every step, requiring at most 5 × (number of digits in b) division steps.",
      topic: "Lamé's Theorem",
    },
  ],
};

export function getQuizForLesson(lessonId: string): QuizQuestion[] {
  const exact = lessonQuizzes[lessonId];
  if (exact) return exact;
  if (lessonId.includes("caesar")) return lessonQuizzes["caesar-cipher"] ?? [];
  if (lessonId.includes("aes")) return lessonQuizzes["aes-state"] ?? [];
  if (lessonId.includes("sha")) return lessonQuizzes["sha256"] ?? [];
  if (lessonId.includes("rsa")) return lessonQuizzes["rsa"] ?? [];
  if (lessonId.includes("kyber") || lessonId.includes("dilithium") || lessonId.includes("pqc")) return lessonQuizzes["pqc-crystals"] ?? [];
  if (lessonId.includes("euclid") || lessonId.includes("gcd")) return lessonQuizzes["euclid-algorithm"] ?? [];
  if (lessonId.includes("encoding")) return lessonQuizzes["encoding-basics"] ?? [];
  return [];
}
