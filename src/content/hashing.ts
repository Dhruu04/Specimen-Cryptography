import type { Lesson } from "./types";

export const hashingLessons: Lesson[] = [
  {
    id: "hash-properties",
    trackId: "hashing",
    title: "What a cryptographic hash guarantees",
    subtitle: "Pre-image, second pre-image and collision resistance",
    formula: {
      expr: "H : {0,1}* → {0,1}ⁿ  |  Pre-image: 2ⁿ  |  Collision: 2^(n/2)",
      badge: "One-Way Function",
      note: "Compresses variable-length input into an n-bit digest. Guarantees: 1) Pre-image resistance (given h, find x); 2) Second pre-image resistance (given x, find x' ≠ x with H(x') = H(x)); 3) Collision resistance (find any x₁ ≠ x₂ with H(x₁) = H(x₂)).",
    },
    body: [
      "A cryptographic hash function is a deterministic mathematical compression algorithm that maps arbitrary-length binary inputs into a fixed-length string of bits (e.g., 256 bits for SHA-256 or 512 bits for SHA-512). Because the domain of possible inputs is infinite while the range of digests is strictly finite (e.g., exactly 2²⁵⁶ distinct possible values for SHA-256), collisions (distinct inputs producing identical output hashes) mathematically must exist by the Pigeonhole Principle. The security of a hash function does not mean collisions do not exist; it means that finding one requires an infeasible amount of computing power.",
      "The Three Formal Security Properties: Every secure cryptographic hash function must satisfy three independent mathematical criteria: 1) Pre-image Resistance (One-Wayness): Given a hash digest h, it is computationally impossible to invert the function and find any message m such that H(m) = h. An attacker must perform an exhaustive brute-force search over approximately 2ⁿ guesses; 2) Second Pre-image Resistance (Weak Collision Resistance): Given an existing message m₁, it is computationally impossible to find a different message m₂ ≠ m₁ such that H(m₁) = H(m₂). This requires approximately 2ⁿ attempts; 3) Collision Resistance (Strong Collision Resistance): It is computationally impossible to find ANY two distinct messages m₁ and m₂ such that H(m₁) = H(m₂). Due to the Birthday Paradox, finding any collision requires only 2^(n/2) operations.",
      "Hashes Are Keyless: A cryptographic hash function is public, open, and keyless. Anyone with a computer can calculate H(m) in nanoseconds. Therefore, hashes provide Data Integrity (detecting whether a message has been altered in transit), but provide zero confidentiality or authenticity on their own. If an attacker intercepts a file in transit, modifies it, computes the new hash of the altered file, and updates the checksum on the download page, an unkeyed hash check will report that the file is 'valid'. To prove authenticity, hashes must be keyed via an HMAC or digitally signed via RSA or ECDSA.",
    ],
    keyPoints: [
      "Collisions exist mathematically; cryptographic security means finding one requires computationally impossible resources.",
      "Pre-image resistance requires 2ⁿ work; collision resistance is bounded by the Birthday paradox at 2^(n/2) work.",
      "Hashes are completely keyless: they guarantee data integrity, but provide neither confidentiality nor sender authenticity.",
      "To verify authenticity against an active adversary, hashes must be converted into HMACs or digital signatures.",
    ],
    pitfalls: [
      "Using an unkeyed hash as an authentication token: an attacker who modifies a message simply recalculates and replaces the hash checksum.",
      "Truncating hash outputs excessively: reducing a hash to 32 bits reduces collision resistance to just 2¹⁶ = 65,536 attempts, easily collided in milliseconds.",
    ],
    workedExample: {
      title: "Contrasting Pre-Image vs Collision Attack Complexity",
      steps: [
        { label: "1. Target Hash Function", detail: "Consider an n=64 bit toy cryptographic hash function." },
        { label: "2. Pre-Image Attack (Cracking a Target Password)", detail: "Attacker has hash h = H('TargetUserPassword'). To find the preimage, attacker must test 2⁶⁴ ≈ 1.84 × 10¹⁹ guesses (requiring centuries on standard hardware)." },
        { label: "3. Collision Attack (Forging Two Colliding Documents)", detail: "Attacker wants ANY two files (A, B) with H(A) = H(B). Attacker only needs 2^(64/2) = 2³² ≈ 4.29 billion guesses (achievable in seconds on a GPU)!" },
        { label: "4. Conclusion", detail: "A collision attack is over 4 billion times faster than a pre-image attack on the same hash function." },
      ],
      outcome: "Proves why an n-bit hash provides only n/2 bits of collision resistance.",
    },
    references: [
      {
        title: "NIST FIPS 180-4: Secure Hash Standard (SHS)",
        source: "NIST CSRC",
        url: "https://doi.org/10.6028/NIST.FIPS.180-4",
        description: "Official federal standard specifying SHA-1, SHA-224, SHA-256, SHA-384, and SHA-512.",
        type: "standard",
      },
      {
        title: "Dan Boneh & Victor Shoup: A Graduate Course in Applied Cryptography (Chapter 8)",
        source: "Stanford University",
        url: "https://toc.cryptobook.us/",
        description: "Rigorous academic textbook on collision resistance, random oracles, and Merkle-Damgård constructions.",
        type: "book",
      },
    ],
    toolId: "hash",
    glossary: [
      { term: "Pre-image Resistance", def: "The property making it computationally impossible to invert a hash and recover the original input message." },
      { term: "Second Pre-image Resistance", def: "The property making it impossible, given one input, to find a second distinct input producing the same digest." },
      { term: "Collision Resistance", def: "The property making it impossible to find any two arbitrary distinct inputs that hash to identical digests." },
    ],
  },
  {
    id: "hash-families",
    trackId: "hashing",
    title: "MD5, SHA-1, SHA-2 and SHA-3",
    subtitle: "Which are broken and what to use now",
    formula: {
      expr: "MD5 (128-bit) [Broken] · SHA-1 (160-bit) [Broken] · SHA-256 (256-bit) [Secure] · SHA-3 (Keccak Sponge)",
      badge: "Cryptanalysis Timeline",
      note: "MD5 and SHA-1 have been practically broken by real-world collision generation. SHA-2 (Merkle-Damgård) remains secure. SHA-3 (Keccak sponge) provides architectural diversity.",
    },
    body: [
      "The history of cryptographic hashing is a story of cryptanalytic progress steadily defeating early designs. MD5, designed by Ron Rivest in 1991, outputs a 128-bit digest. In 2004, Chinese cryptanalyst Xiaoyun Wang demonstrated practical collisions; by 2008, security researchers used MD5 collisions to forge a rogue CA certificate trusted by all web browsers. MD5 can now be collided in under a second on a laptop.",
      "SHA-1, developed by the NSA in 1995 (160-bit digest), suffered the same fate. In 2017, Google and CWI Amsterdam published the 'SHAttered' attack, generating two distinct PDF documents with identical SHA-1 hashes. By 2020, chosen-prefix collision attacks reduced SHA-1 attack costs to less than $45,000 on cloud servers. SHA-1 is officially banned across all major browsers and TLS standards.",
      "Modern Standards: SHA-2 (SHA-256, SHA-512), standardized in NIST FIPS 180-4, has resisted collision attacks for over two decades. However, because SHA-2 uses the Merkle-Damgård iterative construction, it is vulnerable to Length Extension Attacks when used naively as a MAC. SHA-3 (Keccak), standardized in NIST FIPS 202, uses an entirely different Sponge Construction that is inherently immune to length extension. BLAKE3 is a high-speed tree-based hash popular in systems programming.",
    ],
    keyPoints: [
      "MD5 and SHA-1 are cryptographically broken: NEVER use them for digital signatures, certificates, or integrity verification.",
      "SHA-256 and SHA-512 are universally trusted industry standards.",
      "SHA-3 (Keccak sponge) and BLAKE3 provide immunity to length-extension attacks and extreme multi-core parallelism.",
    ],
    pitfalls: [
      "Using MD5 or SHA-1 for file integrity verification against an adversary: an attacker can produce two conflicting files with identical checksums.",
      "Using SHA-256 in naive message authentication `H(secret ‖ message)`: vulnerable to length-extension forgery.",
    ],
    workedExample: {
      title: "The SHAttered Attack Collision (Google / CWI 2017)",
      steps: [
        { label: "1. Target", detail: "Generate two distinct PDF files (PDF A and PDF B) with identical SHA-1 hashes." },
        { label: "2. Computation", detail: "Required ~9 quintillion (9 × 10¹⁸) SHA-1 computations (approx. 6,500 CPU years and 110 GPU years)." },
        { label: "3. PDF A Content", detail: "Displays a blue background with a document agreeing to terms." },
        { label: "4. PDF B Content", detail: "Displays a red background with completely altered fraudulent terms." },
        { label: "5. Resulting Hashes", detail: "SHA-1(PDF A) = 38762cf7f55934b34d179ae6a4c80cadccbb7f0a = SHA-1(PDF B). Fully forged collision!" },
      ],
      outcome: "Proved conclusively that SHA-1 digital signatures can no longer be trusted.",
    },
    references: [
      {
        title: "Google Security Blog: Announcing the First SHA-1 Collision (SHAttered, 2017)",
        source: "Google / CWI Amsterdam",
        url: "https://shattered.io/",
        description: "Official publication detailing the real-world generation of two colliding PDF files.",
        type: "paper",
      },
      {
        title: "NIST FIPS 202: SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions",
        source: "NIST CSRC",
        url: "https://doi.org/10.6028/NIST.FIPS.202",
        description: "The federal standard specifying SHA-3 and the Keccak sponge construction.",
        type: "standard",
      },
    ],
    toolId: "hash",
    glossary: [
      { term: "Merkle-Damgård Construction", def: "A method of building collision-resistant cryptographic hash functions from collision-resistant one-way compression functions." },
      { term: "Sponge Construction", def: "A framework for constructing functions which take a variable-length input and output a variable-length string based on a fixed permutation." },
    ],
  },
  {
    id: "avalanche",
    trackId: "hashing",
    title: "The avalanche effect",
    subtitle: "One bit in, half the bits out",
    formula: {
      expr: "Strict Avalanche Criterion (SAC): P(Bit_out[j] flips | Bit_in[i] flips) = 0.5 ∀ i, j",
      badge: "Diffusion Standard",
      note: "Any single-bit modification in the input must cause an average of 50% of the output digest bits to flip randomly and independently.",
    },
    body: [
      "The Avalanche Effect is a vital requirement for all modern cryptographic hash functions and block ciphers. Named by Horst Feistel in 1973 and mathematically formalized by Webster and Tavares in 1985 as the Strict Avalanche Criterion (SAC), it mandates that flipping even a single bit in the input message must cause roughly half the output bits to flip unpredictably.",
      "Why Avalanche is Vital Against Attacks: If a hash function lacked the avalanche effect, outputs of similar inputs would cluster together in the digest space. An adversary observing a target hash could test minor perturbations of a guessed password, observe whether the output moved 'closer' to or 'further' from the target digest, and perform a hill-climbing search to recover the preimage in logarithmic time!",
      "How SHA-256 Builds the Avalanche: The avalanche effect is achieved through iterative diffusion rounds. In SHA-256, 64 rounds of non-linear Boolean functions (`Ch`, `Maj`), bitwise rotations (`Σ₀`, `Σ₁`, `σ₀`, `σ₁`), and addition modulo 2³² ensure that by round 16, every input bit has diffused across the entire 256-bit internal state.",
    ],
    keyPoints: [
      "A 1-bit input difference flips ~50% of output bits with near-zero statistical correlation.",
      "Prevents hill-climbing, gradient descent, and divide-and-conquer cryptanalysis.",
      "Built through multi-round mixing of non-linear boolean operations and bitwise rotations.",
    ],
    pitfalls: [
      "Designing ad-hoc checksums (like CRC32 or Pearson hashing) for security: non-cryptographic checksums exhibit linear bit propagation easily reversed by linear algebra.",
    ],
    workedExample: {
      title: "Measuring Avalanche on SHA-256 with 1-Bit Difference",
      steps: [
        { label: "1. Input 1", detail: "'The quick brown fox jumps over the lazy dog.'" },
        { label: "2. Input 2", detail: "'The quick brown fox jumps over the lazy dog?' (only final punctuation changed by 1 bit)." },
        { label: "3. Hash 1", detail: "0xef537f25c895bfa782526529a9b63d97aa631564d5d789c2b765448c8635fb6c." },
        { label: "4. Hash 2", detail: "0xd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592." },
        { label: "5. Hamming Distance", detail: "Count differing bits: exactly 126 out of 256 bits flipped (49.22%)!" },
      ],
      outcome: "Near-perfect 50% bit divergence demonstrates complete loss of correlation.",
    },
    references: [
      {
        title: "Webster & Tavares: On the Design of S-Boxes (Crypto 1985)",
        source: "IACR Crypto",
        url: "https://doi.org/10.1007/3-540-39799-X_39",
        description: "The seminal paper establishing the Strict Avalanche Criterion (SAC) in modern cryptography.",
        type: "paper",
      },
    ],
    toolId: "avalanche",
    glossary: [
      { term: "Strict Avalanche Criterion (SAC)", def: "A cryptographic property satisfied if, whenever a single input bit is complemented, each of the output bits changes with a probability of 0.5." },
    ],
  },
  {
    id: "hmac",
    trackId: "hashing",
    title: "HMAC and message authentication",
    subtitle: "Proving a message is unchanged and from whom",
    formula: {
      expr: "HMAC(K, m) = H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ m))",
      badge: "RFC 2104",
      note: "Where opad = 0x5c5c...5c and ipad = 0x3636...36 (repeated across the block size). The double-nested hash structure provably defeats Length-Extension Attacks.",
    },
    body: [
      "A Message Authentication Code (MAC) is a keyed cryptographic checksum that simultaneously verifies two properties: Data Integrity (the message was not modified in transit) and Data Authenticity (the message was generated by someone holding the shared secret key K).",
      "The Fatal Flaw of Naive Hashing: Inexperienced developers frequently attempt to build a MAC using `Tag = H(Secret ‖ Message)`. On any Merkle-Damgård hash function (including MD5, SHA-1, SHA-256, and SHA-512), this construction is completely broken by a Length Extension Attack! Because the internal state of a Merkle-Damgård hash after hashing a message is literally the digest itself, an attacker who knows `H(Secret ‖ Message)` can append arbitrary malicious data `‖ MaliciousSuffix` and calculate the valid hash of `Secret ‖ Message ‖ Padding ‖ MaliciousSuffix` without ever knowing the secret key!",
      "HMAC (RFC 2104), invented by Mihir Bellare, Ran Canetti, and Hugo Krawczyk in 1996, solves this mathematically. By nesting two hash calls using an inner key `K ⊕ ipad` and an outer key `K ⊕ opad`, the internal state is re-hashed, completely breaking the iterative state chain. HMAC is provably secure as long as the underlying compression function is a pseudorandom function (PRF).",
    ],
    keyPoints: [
      "NEVER construct a MAC as H(Key ‖ Message): Merkle-Damgård hashes are vulnerable to length extension attacks.",
      "HMAC nests two hash operations with distinct pads: H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ m)).",
      "Constant-time comparison is strictly mandatory when verifying MAC tags to prevent timing attacks.",
    ],
    pitfalls: [
      "Using standard string comparison `mac1 === mac2`: JavaScript/C/Java early-exit on the first non-matching byte, creating a timing side-channel that allows attackers to forge tags byte-by-byte.",
      "Solution: Always use constant-time comparison functions (e.g. `crypto.timingSafeEqual()`).",
    ],
    workedExample: {
      title: "Executing a Length-Extension Attack on Naive H(Key ‖ Message)",
      steps: [
        { label: "1. Original Message", detail: "Alice signs payment: Message = 'count=10&lat=37.5'. Server computes Tag = SHA256(Secret ‖ Message)." },
        { label: "2. Adversary Intercept", detail: "Attacker observes Message and Tag. Attacker does NOT know Secret." },
        { label: "3. State Initialization", detail: "Attacker initializes SHA-256 internal registers (A,B,C,D,E,F,G,H) directly with the Tag's 8 32-bit words!" },
        { label: "4. Extend Stream", detail: "Attacker feeds additional block '&admin=true' into the hash engine and gets valid NewTag." },
        { label: "5. Resulting Forgery", detail: "Server receives Message + Padding + '&admin=true' and NewTag. Validates as 100% authentic!" },
      ],
      outcome: "Proves why naive prefix hashing fails and why HMAC's nested structure is indispensable.",
    },
    references: [
      {
        title: "RFC 2104: HMAC: Keyed-Hashing for Message Authentication",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc2104.txt",
        description: "The authoritative international standard specifying the HMAC algorithm and security proofs.",
        type: "standard",
      },
      {
        title: "Bellare, Canetti & Krawczyk: Keying Hash Functions for Message Authentication (Crypto '96)",
        source: "IACR Crypto",
        url: "https://link.springer.com/chapter/10.1007/3-540-68697-5_1",
        description: "The original mathematical security proof establishing HMAC's pseudorandom function guarantees.",
        type: "paper",
      },
    ],
    toolId: "hmac",
    glossary: [
      { term: "HMAC", def: "A specific type of message authentication code involving a cryptographic hash function and a secret cryptographic key." },
      { term: "Timing Attack", def: "A side-channel attack in which the attacker attempts to compromise a cryptosystem by analyzing the time taken to execute cryptographic algorithms." },
    ],
  },
  {
    id: "password-hashing",
    trackId: "hashing",
    title: "Storing passwords properly",
    subtitle: "Salt, pepper, and deliberately slow functions",
    formula: {
      expr: "Digest = Argon2id(Password, Salt, MemoryCost=64MB, Iterations=3, Parallelism=4)",
      badge: "Password KDF",
      note: "Standard cryptographic hashes (SHA-256) are optimized for gigabyte speed. Password hashing requires deliberately slow, memory-hard Key Derivation Functions (KDFs).",
    },
    body: [
      "The fundamental rule of user authentication is that passwords must never be stored in plaintext. However, hashing passwords with standard fast algorithms (like MD5, SHA-1, or plain SHA-256) is an equally catastrophic vulnerability: modern consumer GPUs can compute tens of billions of SHA-256 hashes per second, allowing offline dictionary attacks to crack 8-character passwords in minutes.",
      "The Salt Requirement: A cryptographic salt is a unique, cryptographically random byte sequence (minimum 16 bytes) generated per user and stored alongside the password hash. The salt achieves two critical goals: 1) It defeats precomputed Rainbow Tables (attackers cannot reuse a single precalculated lookup table across users); 2) It ensures that two users with identical passwords have completely different stored hashes.",
      "Modern Memory-Hard Algorithms: To neutralize GPU and ASIC attacks, password hashing functions must be Memory-Hard (requiring large allocations of RAM that GPU thread cores cannot accommodate). Argon2id (winner of the Password Hashing Competition, standardized in RFC 9106) is the gold standard, combining resistance to side-channel cache attacks with memory hardness. Bcrypt and scrypt remain strong alternatives.",
    ],
    keyPoints: [
      "Fast hashes (SHA-256, MD5) are broken for password storage due to GPU cracking speeds.",
      "Salt must be unique per user, random, minimum 16 bytes, and stored in the database.",
      "Argon2id (RFC 9106) is the current industry gold standard; bcrypt is the legacy benchmark.",
    ],
    pitfalls: [
      "Using a static global salt across all users (a 'pepper' alone): allows rainbow tables if the single salt is leaked.",
      "Failing to adjust cost parameters over time as attacker hardware improves (Moore's law).",
      "Using PBKDF2 without high iteration counts (minimum 600,000 iterations for PBKDF2-HMAC-SHA256 according to OWASP).",
    ],
    workedExample: {
      title: "Argon2id Password Storage Structure",
      steps: [
        { label: "1. User Password", detail: "User enters 'CorrectHorseBatteryStaple'." },
        { label: "2. Generate Random Salt", detail: "System generates 16 random bytes: 0x9f8b2c41..." },
        { label: "3. Configure Parameters", detail: "Memory = 64 MB (65536 KiB), Iterations = 3, Parallelism = 4 threads." },
        { label: "4. Output Encoded Hash", detail: "'$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ...$q8F4...'. Stores algorithm, version, parameters, salt, and digest safely together." },
      ],
      outcome: "A single verification takes ~150 ms on CPU, making bulk offline GPU cracking economically impossible.",
    },
    references: [
      {
        title: "RFC 9106: Argon2 Memory-Hard Function for Password Hashing",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc9106.txt",
        description: "The official IETF standard specifying Argon2d, Argon2i, and Argon2id algorithms.",
        type: "standard",
      },
      {
        title: "OWASP Password Storage Cheat Sheet",
        source: "OWASP Foundation",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
        description: "Official security recommendations for Argon2id, bcrypt, and PBKDF2 parameters.",
        type: "tutorial",
      },
    ],
    toolId: "pbkdf2",
    glossary: [
      { term: "Salt", def: "Random data that is used as an additional input to a one-way function that hashes data, a password or passphrase." },
      { term: "Key Derivation Function (KDF)", def: "A cryptographic algorithm that derives one or more secret keys from a secret value such as a master key or password." },
    ],
  },
  {
    id: "merkle-trees",
    trackId: "hashing",
    title: "Merkle trees and commitments",
    subtitle: "Hashing structures, not just messages",
    formula: {
      expr: "Parent = H(Left_Child ‖ Right_Child)  |  Audit Path Proof: O(log₂ N) Hashes",
      badge: "Cryptographic Trees",
      note: "A binary tree of cryptographic hashes where every leaf node is the hash of a data block and every non-leaf node is the hash of its children. The Root Hash commits to the entire dataset.",
    },
    body: [
      "Invented and patented by Ralph Merkle in 1979, Merkle Trees are hierarchical data structures that allow efficient, tamper-evident verification of large datasets. In a Merkle tree, each leaf node contains the cryptographic hash of a data chunk (e.g. a transaction, a file block, or a TLS certificate). Pairs of sibling nodes are concatenated and hashed recursively upward until reaching a single 256-bit value: the Merkle Root.",
      "The Merkle Root acts as a cryptographic commitment: changing even a single bit in any leaf cascades up the tree via the avalanche effect, producing a completely different root hash. This makes it impossible to tamper with any item in the dataset without invalidating the root.",
      "Logarithmic Inclusion Proofs: To prove that a specific item is included in a dataset of N elements, one does not need to send all N items. Instead, the prover provides an Audit Path consisting of only the sibling hashes along the path from the leaf to the root. For a dataset of 1,000,000 items, verifying inclusion requires only log₂(1,000,000) ≈ 20 hashes! Merkle trees power Git commits, Certificate Transparency (RFC 6962), and decentralized ledgers.",
    ],
    keyPoints: [
      "Single root hash commits immutably to an arbitrarily large dataset.",
      "Membership proof requires only O(log₂ N) sibling hashes instead of downloading the whole dataset.",
      "Powers Git version control, Bitcoin blocks, and Certificate Transparency (RFC 6962).",
    ],
    pitfalls: [
      "Second Pre-Image Attack on unbalanced Merkle trees: if intermediate nodes and leaf nodes are not cryptographically distinguished (e.g. prepending 0x00 for leaves and 0x01 for internal nodes), an attacker can forge proofs using intermediate hashes.",
    ],
    workedExample: {
      title: "Verifying an Inclusion Proof with 4 Leaves (N=4)",
      steps: [
        { label: "1. Dataset Leaves", detail: "Four records: D₀, D₁, D₂, D₃. Leaves: H₀=H(D₀), H₁=H(D₁), H₂=H(D₂), H₃=H(D₃)." },
        { label: "2. Intermediate Nodes", detail: "H₀₁ = H(H₀ ‖ H₁), H₂₃ = H(H₂ ‖ H₃). Root = H(H₀₁ ‖ H₂₃)." },
        { label: "3. Prove D₁ is Present", detail: "Prover provides: Data D₁ and Audit Path [H₀, H₂₃]." },
        { label: "4. Verifier Checks", detail: "Verifier computes H₁ = H(D₁), then H₀₁' = H(H₀ ‖ H₁), then Root' = H(H₀₁' ‖ H₂₃). Matches Root? Verified in 2 steps!" },
      ],
      outcome: "Proved membership of D₁ in O(log₂ 4) = 2 hash steps without revealing D₀, D₂, or D₃.",
    },
    references: [
      {
        title: "Ralph Merkle: Secrecy, Authentication, and Public Key Systems (1979)",
        source: "Stanford PhD Thesis",
        url: "https://www.merkle.com/papers/Thesis1979.pdf",
        description: "Ralph Merkle's historic dissertation introducing Merkle trees and digital signatures.",
        type: "paper",
      },
      {
        title: "RFC 6962: Certificate Transparency (Merkle Tree Auditing)",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc6962.txt",
        description: "Official RFC describing how append-only Merkle trees monitor all public SSL/TLS certificates.",
        type: "standard",
      },
    ],
    toolId: "merkle-tree",
    glossary: [
      { term: "Merkle Tree", def: "A tree in which every leaf node is labelled with the cryptographic hash of a data block, and every non-leaf node is labelled with the cryptographic hash of the labels of its child nodes." },
      { term: "Merkle Root", def: "The root hash of a Merkle tree that represents all transactions or data elements contained within the tree." },
    ],
  },
  {
    id: "birthday-paradox",
    trackId: "hashing",
    title: "The Birthday paradox & hash collisions",
    subtitle: "Why an n-bit hash provides only n/2 bits of collision resistance",
    formula: {
      expr: "P(Collision) ≈ 1 − e^(−k² / (2 · 2ⁿ)),  k ≈ 1.177 · 2^(n/2) for 50% probability",
      badge: "Square Root Bound",
      note: "In a group of just 23 people, there is a >50% probability two people share a birthday. Similarly, finding ANY collision in an n-bit hash requires only ~2^(n/2) hashes, not 2ⁿ.",
    },
    body: [
      "The Birthday Paradox is one of probability theory's most counter-intuitive mathematical realities. Most people assume that finding a shared birthday requires roughly 365 / 2 ≈ 183 people. However, that logic applies only to matching a SPECIFIC chosen birthday. When asking whether ANY pair among k people shares a birthday, the number of pairwise combinations grows quadratically as k(k − 1)/2. With just 23 people, there are 253 pairwise comparisons, yielding a 50.7% chance of a collision.",
      "Application to Cryptographic Hashes: For an n-bit hash function with N = 2ⁿ possible digests, an adversary does not need 2ⁿ attempts to find a collision; they only need approximately √N = 2^(n/2) random samples! This square-root reduction is known as the Birthday Bound.",
      "Real-World Impact: This explains why MD5 (128-bit output) became catastrophically insecure: its collision resistance was not 2¹²⁸, but only 2⁶⁴ (~1.84 × 10¹⁹ operations) — an operational threshold easily reached by distributed computing clusters. To achieve a 128-bit security level against collision attacks today, a hash function must output at least 256 bits (like SHA-256).",
    ],
    keyPoints: [
      "Pairwise combinations grow quadratically: k(k − 1) / 2 comparisons.",
      "Collision resistance of any n-bit hash function is bounded at 2^(n/2).",
      "An algorithm requiring 128 bits of collision resistance must output at least 256 bits.",
    ],
    pitfalls: [
      "Assuming a 64-bit checksum provides 64 bits of collision protection: it collapses in 2³² ≈ 4.3 billion operations (under 1 second on modern hardware).",
      "Confusing Pre-image Resistance (2ⁿ work) with Collision Resistance (2^(n/2) work).",
    ],
    workedExample: {
      title: "Deriving the 23-Person Birthday Problem",
      steps: [
        { label: "1. Complementary Probability", detail: "Calculate probability that ALL 23 people have distinct birthdays: P(all distinct) = (365/365) × (364/365) × ... × (343/365)." },
        { label: "2. Product Calculation", detail: "P(all distinct) ≈ 0.4927." },
        { label: "3. Collision Probability", detail: "P(at least one collision) = 1 − P(all distinct) = 1 − 0.4927 = 0.5073 (50.73%)." },
        { label: "4. Cryptographic Translation", detail: "For 64-bit hashes, k ≈ 1.177 × √(2⁶⁴) = 1.177 × 2³² ≈ 5.05 billion hashes to find a collision." },
      ],
      outcome: "Proves mathematically why collision resistance is bounded by the square root of the keyspace.",
    },
    references: [
      {
        title: "William F. Friedman: The Mathematics of Cryptography and Collisions",
        source: "Historical Foundations",
        url: "https://en.wikipedia.org/wiki/Birthday_problem",
        description: "Mathematical derivation of the birthday problem and its application to cryptographic hash functions.",
        type: "tutorial",
      },
    ],
    toolId: "birthday-attack",
    glossary: [
      { term: "Birthday Attack", def: "A cryptographic attack that exploits the mathematics behind the birthday problem in probability theory to find collisions in a hash function." },
    ],
  },
];
