import fs from 'fs';

const enrichments = {
  "divisibility": {
    pitfalls: [
      "Assuming integer division `/` in high-level programming languages behaves identically for negative numbers (e.g. `-7 % 3` returns `-1` in C/JS, but `2` in Python/mathematical quotient-remainder form).",
      "Confusing prime numbers with coprime numbers: two composite numbers (like 8 and 9) are coprime (gcd(8,9)=1) despite neither being prime."
    ],
    workedExample: {
      title: "Division Algorithm on Negative Dividends",
      steps: [
        { label: "1. Dividend & Divisor", detail: "Let a = −23, b = 7. Formula: a = q·b + r with 0 ≤ r < b." },
        { label: "2. Incorrect Naive Division", detail: "−23 / 7 = −3 with remainder −2. Violates 0 ≤ r < 7!" },
        { label: "3. Correct Mathematical Division", detail: "q = −4. Compute −4 × 7 = −28. Remainder r = −23 − (−28) = +5." },
        { label: "4. Verification", detail: "−23 = (−4 × 7) + 5. Remainder 5 satisfies 0 ≤ 5 < 7. Perfectly unique." }
      ],
      outcome: "Ensures remainder is non-negative, preserving ring properties in modular arithmetic."
    },
    references: [
      {
        title: "Khan Academy: Division Algorithm and Modular Arithmetic",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/the-euclidean-algorithm",
        description: "Interactive tutorial on the integer division algorithm and remainders.",
        type: "tutorial"
      },
      {
        title: "Euclid's Elements (Book VII: Elementary Number Theory)",
        source: "Perseus Digital Library",
        url: "https://en.wikipedia.org/wiki/Euclid%27s_Elements",
        description: "Historical foundation of divisibility, prime numbers, and the Euclidean algorithm.",
        type: "book"
      }
    ]
  },
  "modular-arithmetic": {
    pitfalls: [
      "Attempting modular division via floating-point division `(a / b) % m`: invalid! Modular division is defined as `(a * modInverse(b, m)) % m`.",
      "Calculating `(a^b) % m` by computing `a^b` first in software: causes integer overflow for large numbers; use modular exponentiation (repeated squaring) instead."
    ],
    workedExample: {
      title: "Fast Modular Exponentiation via Repeated Squaring (7¹²⁸ mod 13)",
      steps: [
        { label: "1. Analyze Exponent", detail: "Exponent 128 = 2⁷ (powers of two)." },
        { label: "2. Successive Squaring", detail: "7¹ ≡ 7; 7² = 49 ≡ 10; 7⁴ = 10² = 100 ≡ 9; 7⁸ = 9² = 81 ≡ 3; 7¹⁶ = 3² = 9; 7³² = 9² ≡ 3; 7⁶⁴ = 3² = 9; 7¹²⁸ = 9² = 81 ≡ 3 mod 13." },
        { label: "3. Alternative via Fermat", detail: "Since 13 is prime, 7¹² ≡ 1 mod 13. 128 = 10×12 + 8. Thus 7¹²⁸ ≡ 7⁸ ≡ 3 mod 13." }
      ],
      outcome: "Computed 7¹²⁸ mod 13 = 3 in 7 multiplications without numbers exceeding 100."
    },
    references: [
      {
        title: "3Blue1Brown: Modular Arithmetic and Cryptography",
        source: "YouTube / 3Blue1Brown",
        url: "https://www.youtube.com/watch?v=sVXkF2c1u6k",
        description: "Visual exploration of clock arithmetic, modular congruence, and modular exponentiation.",
        type: "tutorial"
      }
    ]
  },
  "euclid": {
    pitfalls: [
      "Forgetting to check if gcd(a, m) = 1 before calculating modular inverses: if gcd > 1, the Extended Euclidean Algorithm output is invalid.",
      "Flipping order of inputs in recursive Euclid: always ensure remainder replaces the smaller operand correctly."
    ],
    workedExample: {
      title: "Extended Euclidean Algorithm for gcd(240, 46)",
      steps: [
        { label: "1. Step 1", detail: "240 = 5 × 46 + 10." },
        { label: "2. Step 2", detail: "46 = 4 × 10 + 6." },
        { label: "3. Step 3", detail: "10 = 1 × 6 + 4." },
        { label: "4. Step 4", detail: "6 = 1 × 4 + 2." },
        { label: "5. Step 5", detail: "4 = 2 × 2 + 0. Last non-zero remainder is gcd = 2." },
        { label: "6. Back-Substitution (Bézout)", detail: "2 = 6 − 1×4 = 6 − 1×(10 − 1×6) = 2×6 − 1×10 = 2×(46 − 4×10) − 10 = 2×46 − 9×10 = 2×46 − 9×(240 − 5×46) = (−9)×240 + 47×46." }
      ],
      outcome: "Bézout identity verified: (−9)×240 + (47)×46 = −2160 + 2162 = 2."
    },
    references: [
      {
        title: "Khan Academy: The Extended Euclidean Algorithm",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/the-euclidean-algorithm",
        description: "Step-by-step interactive derivation of Bézout's identity and gcd extraction.",
        type: "tutorial"
      }
    ]
  },
  "modular-inverse": {
    pitfalls: [
      "Using non-constant-time Extended Euclidean Algorithm implementations on secret exponents: timing variations leak bits of the private key.",
      "Attempting inversion when gcd(a, m) != 1 (e.g. 4⁻¹ mod 26 does not exist because gcd(4, 26) = 2)."
    ],
    workedExample: {
      title: "Calculating Modular Inverse 17⁻¹ mod 3120 for RSA",
      steps: [
        { label: "1. Target Equation", detail: "Solve 17 · d ≡ 1 mod 3120." },
        { label: "2. Euclidean Steps", detail: "3120 = 183 × 17 + 9; 17 = 1 × 9 + 8; 9 = 1 × 8 + 1." },
        { label: "3. Back-Substitute for 1", detail: "1 = 9 − 1×8 = 9 − 1×(17 − 1×9) = 2×9 − 1×17." },
        { label: "4. Substitute 9", detail: "1 = 2×(3120 − 183×17) − 1×17 = 2×3120 − 367×17." },
        { label: "5. Reduce Modulo 3120", detail: "d = −367 ≡ 3120 − 367 = 2753 mod 3120." }
      ],
      outcome: "Modular inverse d = 2753 verified: (17 × 2753) mod 3120 = 46801 mod 3120 = 1."
    },
    references: [
      {
        title: "William Stallings: Cryptography and Network Security (8th Edition, Chapter 2)",
        source: "Textbook Standard",
        url: "https://en.wikipedia.org/wiki/Modular_multiplicative_inverse",
        description: "Mathematical formulation of modular inverses and coprime rings.",
        type: "book"
      }
    ]
  },
  "primes": {
    pitfalls: [
      "Using the Fermat primality test alone: Carmichael numbers (like 561) pass Fermat's test for all coprime bases despite being composite.",
      "Running too few Miller-Rabin rounds: each random base has up to a 1/4 chance of falsely certifying a composite; 40 rounds are required for cryptographic certainty."
    ],
    workedExample: {
      title: "Miller-Rabin Primality Test on n = 221 with Base a = 174",
      steps: [
        { label: "1. Decompose n − 1", detail: "221 − 1 = 220 = 2² × 55. So k = 2, q = 55 (220 = 2^k · q)." },
        { label: "2. Test Initial Power", detail: "Compute a^q mod n = 174⁵⁵ mod 221 ≡ 47 ≠ 1 and ≠ 220 (−1)." },
        { label: "3. Square for j=1", detail: "Compute (47)² mod 221 = 2209 mod 221 = 220 ≡ −1 mod 221." },
        { label: "4. Conclusion", detail: "Because a^(2^j · q) ≡ −1 mod 221, 221 passes this round. (Testing other bases reveals 221 = 13 × 17 is composite)." }
      ],
      outcome: "Demonstrates probabilistic witness testing in modern prime generation."
    },
    references: [
      {
        title: "Michael O. Rabin: Probabilistic Algorithm for Testing Primality (1980)",
        source: "Journal of Number Theory",
        url: "https://doi.org/10.1016/0022-314X(80)90084-0",
        description: "The seminal paper establishing the Miller-Rabin probabilistic primality test used in all modern cryptography.",
        type: "paper"
      }
    ]
  },
  "factoring": {
    pitfalls: [
      "Generating RSA primes using poor entropy: if two devices generate moduli n₁ = p·q₁ and n₂ = p·q₂, computing gcd(n₁, n₂) instantly factors both keys!",
      "Assuming factoring is exponential: General Number Field Sieve (GNFS) is sub-exponential, necessitating 3072+ bit RSA keys."
    ],
    workedExample: {
      title: "Fermat's Factorization Method on Close Primes",
      steps: [
        { label: "1. Modulus", detail: "n = 5959. Compute a = ⌈√5959⌉ = 78." },
        { label: "2. Test a² − n", detail: "78² − 5959 = 6084 − 5959 = 125 (not a square)." },
        { label: "3. Next a = 79", detail: "79² − 5959 = 6241 − 5959 = 282 (not a square)." },
        { label: "4. Next a = 80", detail: "80² − 5959 = 6400 − 5959 = 441 = 21² (Square found! b = 21)." },
        { label: "5. Factors Revealed", detail: "p = a − b = 80 − 21 = 59. q = a + b = 80 + 21 = 101." }
      ],
      outcome: "5959 factored into 59 × 101 in 3 iterations because p and q were close together."
    },
    references: [
      {
        title: "Lenstra & Lenstra: The Development of the Number Field Sieve",
        source: "Springer Lecture Notes in Mathematics",
        url: "https://en.wikipedia.org/wiki/General_number_field_sieve",
        description: "The definitive reference on the sub-exponential algorithm used to break RSA challenge keys.",
        type: "book"
      }
    ]
  },
  "fermat-euler": {
    pitfalls: [
      "Applying Fermat's Little Theorem when modulus is not prime: a^(m-1) != 1 if m is composite.",
      "Calculating Euler's totient φ(n) for composite numbers without knowing prime factors: computing φ(n) is mathematically equivalent in hardness to factoring n."
    ],
    workedExample: {
      title: "Euler's Totient Calculation on Composite n = 360",
      steps: [
        { label: "1. Prime Factorization", detail: "360 = 2³ × 3² × 5¹." },
        { label: "2. Product Formula", detail: "φ(n) = n · (1 − 1/p₁) · (1 − 1/p₂) · (1 − 1/p₃)." },
        { label: "3. Calculation", detail: "φ(360) = 360 × (1 − 1/2) × (1 − 1/3) × (1 − 1/5) = 360 × 1/2 × 2/3 × 4/5 = 360 × 8/30 = 96." },
        { label: "4. Conclusion", detail: "There are exactly 96 integers between 1 and 360 that are coprime to 360." }
      ],
      outcome: "Euler totient formula verified on prime-power composites."
    },
    references: [
      {
        title: "Stanford CS255: Number Theory Foundations (Dan Boneh)",
        source: "Stanford University",
        url: "https://crypto.stanford.edu/~dabo/cs255/",
        description: "Academic lecture notes on Euler's totient function, cyclic groups, and RSA correctness proofs.",
        type: "tutorial"
      }
    ]
  },
  "groups-fields": {
    pitfalls: [
      "Using smooth primes in Diffie-Hellman: if p-1 factors into small primes, the Pohlig-Hellman algorithm breaks the discrete logarithm in minutes.",
      "Confusing polynomial addition in GF(2⁸) with integer addition: in GF(2⁸), addition is strictly bitwise XOR (no carrying!)."
    ],
    workedExample: {
      title: "Galois Field GF(2⁸) Multiplication by x (xtime in AES)",
      steps: [
        { label: "1. Byte Value", detail: "Byte 0x57 = 01010111₂ (polynomial x⁶ + x⁴ + x² + x + 1)." },
        { label: "2. Multiply by x", detail: "Shift left: (x⁶ + x⁴ + x² + x + 1) · x = x⁷ + x⁵ + x³ + x² + x = 10101110₂ (0xAE)." },
        { label: "3. Overflow Check", detail: "High bit was 0 (no x⁸ term), so no reduction modulo irreducible polynomial 0x11B needed." },
        { label: "4. When High Bit is 1", detail: "If high bit was 1, XOR with 0x1B (x⁸ + x⁴ + x³ + x + 1 stripped of x⁸)." }
      ],
      outcome: "Core atomic Galois field multiplication implemented in AES MixColumns."
    },
    references: [
      {
        title: "William Stallings: Cryptography and Network Security (Chapter 4: Finite Fields)",
        source: "Textbook Standard",
        url: "https://en.wikipedia.org/wiki/Finite_field_arithmetic",
        description: "Chapter 4: Comprehensive algebraic treatment of groups, rings, and Galois fields GF(2ⁿ).",
        type: "book"
      }
    ]
  },
  "crt": {
    pitfalls: [
      "The Bellcore Fault Injection Attack: If a hardware glitch corrupts one branch of an RSA-CRT computation, comparing the faulty signature with the valid signature instantly factors the modulus n!",
      "Applying CRT when moduli are not pairwise coprime (gcd(n_i, n_j) > 1)."
    ],
    workedExample: {
      title: "Solving a 2-Congruence System via CRT",
      steps: [
        { label: "1. Congruences", detail: "x ≡ 2 mod 3,  x ≡ 3 mod 5. (n₁=3, n₂=5, N = 15)." },
        { label: "2. Compute M_i", detail: "M₁ = N / n₁ = 15/3 = 5. M₂ = N / n₂ = 15/5 = 3." },
        { label: "3. Modular Inverses", detail: "y₁ = 5⁻¹ mod 3 = 2⁻¹ mod 3 = 2. y₂ = 3⁻¹ mod 5 = 2." },
        { label: "4. Solve for x", detail: "x = (a₁ M₁ y₁ + a₂ M₂ y₂) mod N = (2 × 5 × 2 + 3 × 3 × 2) mod 15 = (20 + 18) mod 15 = 38 mod 15 = 8." },
        { label: "5. Verify", detail: "8 mod 3 = 2, 8 mod 5 = 3. Unique solution mod 15 is x = 8!" }
      ],
      outcome: "Chinese Remainder Theorem reconstructs simultaneous congruences uniquely."
    },
    references: [
      {
        title: "Dan Boneh, DeMillo & Lipton: On the Importance of Eliminating Errors in Cryptographic Computations (Bellcore Attack, 1997)",
        source: "Journal of Cryptology",
        url: "https://doi.org/10.1007/s001450010016",
        description: "The historic paper demonstrating how a single computational fault in RSA-CRT breaks private keys.",
        type: "paper"
      }
    ]
  },
  "discrete-log": {
    pitfalls: [
      "Using small groups or non-prime-order subgroups susceptible to small-subgroup confinement attacks.",
      "Believing discrete logs in finite fields are as hard as on elliptic curves: index calculus attacks solve finite-field discrete logs in sub-exponential time."
    ],
    workedExample: {
      title: "Baby-Step Giant-Step on g = 2, h = 9, p = 11",
      steps: [
        { label: "1. Parameter m", detail: "m = ⌈√11⌉ = 4. Target: find x with 2ˣ ≡ 9 mod 11." },
        { label: "2. Baby Steps (gʲ mod p for j=0..3)", detail: "j=0: 2⁰=1; j=1: 2¹=2; j=2: 2²=4; j=3: 2³=8. Table: {1:0, 2:1, 4:2, 8:3}." },
        { label: "3. Giant Steps Factor", detail: "g^(−m) = (2⁴)⁻¹ mod 11 = 16⁻¹ mod 11 = 5⁻¹ mod 11 = 9." },
        { label: "4. Giant Steps (h · (g^(−m))ⁱ mod p)", detail: "i=0: 9×1=9; i=1: 9×9=81 ≡ 4 mod 11. Match found in baby steps at value 4 (j=2)!" },
        { label: "5. Compute x", detail: "x = i·m + j = 1×4 + 2 = 6. Check: 2⁶ = 64 ≡ 9 mod 11. Solved in O(√p) steps!" }
      ],
      outcome: "Discrete logarithm x = 6 solved in √p operations."
    },
    references: [
      {
        title: "Daniel J. Bernstein: Fast Computation of Discrete Logarithms",
        source: "DJB Publications",
        url: "https://cr.yp.to/papers.html",
        description: "Analysis of baby-step giant-step, Pollard's rho, and index-calculus algorithms.",
        type: "paper"
      }
    ]
  },
  "randomness": {
    pitfalls: [
      "Using `Math.random()`, `rand()`, or `java.util.Random` for cryptographic keys: non-cryptographic PRNGs are linear congruential generators easily reconstructed from output history.",
      "The Debian OpenSSL disaster (2008): removing uninitialized memory lines left only 32,767 possible process IDs, allowing global SSH key precomputation."
    ],
    workedExample: {
      title: "Measuring Shannon Entropy of a 4-Digit PIN vs 128-bit Key",
      steps: [
        { label: "1. 4-Digit PIN", detail: "10,000 possibilities. H = log₂(10000) ≈ 13.29 bits of entropy." },
        { label: "2. 8-Char Alphanumeric Password", detail: "62⁸ ≈ 2.18 × 10¹⁴ possibilities. H = log₂(62⁸) ≈ 47.6 bits of entropy." },
        { label: "3. 128-bit CSPRNG Key", detail: "2¹²⁸ ≈ 3.4 × 10³⁸ possibilities. H = 128.0 bits of pure uniform entropy." }
      ],
      outcome: "Cryptographic strength is determined by Shannon entropy, not string length."
    },
    references: [
      {
        title: "RFC 4086: Randomness Requirements for Security",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc4086.txt",
        description: "Official guidelines for hardware entropy harvesting, mixing functions, and CSPRNG design.",
        type: "standard"
      },
      {
        title: "NIST SP 800-90A: Recommendation for Random Number Generation Using Deterministic Random Bit Generators",
        source: "NIST CSRC",
        url: "https://doi.org/10.6028/NIST.SP.800-90Ar1",
        description: "Federal standard specifying HMAC-DRBG, Hash-DRBG, and CTR-DRBG.",
        type: "standard"
      }
    ]
  }
};

let filePath = 'd:/Projects/Crypto/Cypher/src/content/numbertheory.ts';
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
console.log("Successfully enriched numbertheory.ts!");
