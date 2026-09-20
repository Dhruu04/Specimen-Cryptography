import { bytesToHex, bytesToBase64, toBytes } from "./crypto/encoding";
import { gcdTrace, extendedEuclid, modInverseTool, modPow } from "./crypto/numbertheory";

export interface AssistantInsight {
  queryType: "calculator" | "consultation" | "recommendation" | "attack";
  title: string;
  badge: string;
  summary: string;
  formula?: string | undefined;
  standard?: string | undefined;
  antipattern?: string | undefined;
  output?: string | undefined;
  steps?: { label: string; detail?: string | undefined }[] | undefined;
  actionLabel?: string | undefined;
  actionUrl?: string | undefined;
}

// 1. Instant Cryptographic Expression Calculator
export async function evaluateCryptoMath(raw: string): Promise<AssistantInsight | null> {
  const q = raw.trim();

  // Pattern: gcd(a, b) or gcd a b
  const gcdMatch = q.match(/^(?:gcd|hcf)\s*(?:\(\s*(\d+)\s*,\s*(\d+)\s*\)|(\d+)\s+(\d+))$/i);
  if (gcdMatch) {
    const a = parseInt(gcdMatch[1] || gcdMatch[3] || "0", 10);
    const b = parseInt(gcdMatch[2] || gcdMatch[4] || "0", 10);
    if (a > 0 && b > 0) {
      const res = gcdTrace(a, b);
      const ext = extendedEuclid(a, b);
      return {
        queryType: "calculator",
        title: `Greatest Common Divisor: gcd(${a}, ${b})`,
        badge: "Euclidean Algorithm",
        summary: `The greatest common divisor of ${a} and ${b} is ${res.output.replace(/gcd\([^)]+\)\s*=\s*/, "")}. ${res.note}`,
        formula: ext.output,
        standard: "William Stallings (8th Ed., Ch. 4)",
        output: res.output,
        steps: res.steps ? res.steps.slice(0, 5) : undefined,
        actionLabel: "Open Euclidean Algorithm Tool",
        actionUrl: "/tools/euclidean",
      };
    }
  }

  // Pattern: inv(a, m) or modInverse(a, m) or inverse of a mod m
  const invMatch = q.match(/^(?:inv|modinv|modinverse)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/i) ||
    q.match(/^(?:inverse\s+of\s+)?(\d+)\s*(?:modinv|\^-1|inv)\s*(?:mod\s*)?(\d+)$/i) ||
    q.match(/^inverse\s+of\s+(\d+)\s+mod\s+(\d+)$/i);

  if (invMatch) {
    const a = parseInt(invMatch[1] || "0", 10);
    const m = parseInt(invMatch[2] || "0", 10);
    if (a > 0 && m > 1) {
      const res = modInverseTool(a, m);
      if (res.error) {
        return {
          queryType: "calculator",
          title: `Modular Inverse: ${a}⁻¹ mod ${m}`,
          badge: "Calculation Error",
          summary: res.error,
          standard: "Coprimality Rule: gcd(a, m) must equal 1",
          antipattern: "Attempting modular division without verified coprimality leads to undefined operations.",
          actionLabel: "Open Modular Arithmetic Tool",
          actionUrl: "/tools/modular-arithmetic",
        };
      }
      return {
        queryType: "calculator",
        title: `Modular Multiplicative Inverse: ${a}⁻¹ mod ${m}`,
        badge: "Extended Euclid",
        summary: `${res.output}. This means (${a} × ${res.output.replace(/[^0-9]/g, "")}) ≡ 1 (mod ${m}).`,
        formula: `${a} · x ≡ 1 (mod ${m})`,
        standard: "Bézout's Identity",
        output: res.output,
        steps: res.steps ? res.steps.slice(0, 4) : undefined,
        actionLabel: "Open Modular Arithmetic Tool",
        actionUrl: "/tools/modular-arithmetic",
      };
    }
  }

  // Pattern: a^b mod m or pow(a, b, m)
  const powMatch = q.match(/^(?:pow\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)|(\d+)\s*(?:\^|\*\*)\s*(\d+)\s*(?:mod|%)\s*(\d+))$/i);
  if (powMatch) {
    const base = BigInt(powMatch[1] || powMatch[4] || "0");
    const exp = BigInt(powMatch[2] || powMatch[5] || "0");
    const mod = BigInt(powMatch[3] || powMatch[6] || "1");
    if (mod > 1n) {
      const result = modPow(base, exp, mod);
      return {
        queryType: "calculator",
        title: `Modular Exponentiation: ${base}^${exp} mod ${mod}`,
        badge: "Square-and-Multiply",
        summary: `${base}^${exp} ≡ ${result} (mod ${mod}). Computed in O(log e) bit operations using repeated squaring.`,
        formula: `b^e \\pmod{m} = ${result}`,
        standard: "RSA / Diffie-Hellman Core Primitive",
        output: `${base}^${exp} mod ${mod} = ${result}`,
        actionLabel: "Open Fast Modular Exponentiation Tool",
        actionUrl: "/tools/fast-mod-exp",
      };
    }
  }

  // Pattern: a mod m
  const modMatch = q.match(/^(\d+)\s*(?:mod|%)\s*(\d+)$/i);
  if (modMatch && !q.includes("^")) {
    const a = BigInt(modMatch[1] || "0");
    const m = BigInt(modMatch[2] || "1");
    if (m > 0n) {
      const rem = ((a % m) + m) % m;
      return {
        queryType: "calculator",
        title: `Modular Reduction: ${a} mod ${m}`,
        badge: "Clock Arithmetic",
        summary: `${a} divided by ${m} gives quotient ${a / m} with remainder ${rem}.`,
        formula: `${a} = ${a / m} × ${m} + ${rem}`,
        output: `${a} mod ${m} = ${rem}`,
        actionLabel: "Open Modular Arithmetic Tool",
        actionUrl: "/tools/modular-arithmetic",
      };
    }
  }

  // Pattern: sha256(text) or hash <text> or sha256 <text>
  const shaMatch = q.match(/^(?:sha256|sha-256|hash)\s*(?:\(\s*["']?(.*?)["']?\s*\)|["']?(.*?)["']?)$/i);
  if (shaMatch && (shaMatch[1] !== undefined || shaMatch[2] !== undefined)) {
    const text = shaMatch[1] ?? shaMatch[2] ?? "";
    if (text.length > 0) {
      try {
        const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", toBytes(text)));
        const hex = bytesToHex(digest, false);
        return {
          queryType: "calculator",
          title: `SHA-256 Digest: "${text}"`,
          badge: "FIPS 180-4",
          summary: `Cryptographic 256-bit hash digest computed in real-time via Web Crypto API.`,
          formula: `H(m) \\in \\{0, 1\\}^{256}`,
          output: hex,
          standard: "NIST FIPS 180-4 Secure Hash Standard",
          antipattern: "Never use plain SHA-256 for passwords (use Argon2id) or for keyed authentication without HMAC.",
          actionLabel: "Open SHA-256 Converter Tool",
          actionUrl: "/tools/sha256",
        };
      } catch {
        // Subtle crypto unavailable fallback
      }
    }
  }

  // Pattern: base64 <text> or b64 <text>
  const b64Match = q.match(/^(?:b64|base64)\s+(?:encode\s+)?["']?(.*?)["']?$/i);
  if (b64Match && b64Match[1]) {
    const text = b64Match[1];
    const encoded = bytesToBase64(toBytes(text));
    return {
      queryType: "calculator",
      title: `Base64 Representation: "${text}"`,
      badge: "RFC 4648",
      summary: `ASCII representation encoding 6 bits per character. Note: Base64 is representation/encoding, NOT encryption!`,
      output: encoded,
      antipattern: "Base64 provides 0 security or confidentiality. Never treat Base64 encoding as encryption.",
      actionLabel: "Open Base64 Converter Tool",
      actionUrl: "/tools/base64",
    };
  }

  // Pattern: hex <text>
  const hexMatch = q.match(/^hex\s+["']?(.*?)["']?$/i);
  if (hexMatch && hexMatch[1]) {
    const text = hexMatch[1];
    const encoded = bytesToHex(toBytes(text), true);
    return {
      queryType: "calculator",
      title: `Hexadecimal Representation: "${text}"`,
      badge: "Base16",
      summary: `Hex byte stream representation (2 hex digits per 8-bit byte).`,
      output: encoded,
      actionLabel: "Open Hex Converter Tool",
      actionUrl: "/tools/hex",
    };
  }

  return null;
}

// 2. Comprehensive Cryptographic Knowledge Base & Expert Assistant
interface KnowledgeEntry {
  keywords: string[];
  title: string;
  badge: string;
  summary: string;
  formula?: string;
  standard?: string;
  antipattern?: string;
  actionLabel: string;
  actionUrl: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ["password", "hash password", "store password", "passwords", "argon", "bcrypt", "pbkdf2"],
    title: "Password Storage Standard: Argon2id",
    badge: "RFC 9106 Standard",
    summary: "Always use memory-hard Key Derivation Functions (KDF) like Argon2id. Fast cryptographic hashes (MD5, SHA-1, SHA-256) compute in nanoseconds on GPUs, enabling billions of guesses per second.",
    formula: "K = \\text{Argon2id}(P, S, t, m, p)",
    standard: "RFC 9106 / OWASP Password Storage Cheat Sheet",
    antipattern: "Never use plain SHA-256 or fast hashes for passwords. A single modern GPU tests over 10 billion SHA-256 hashes per second.",
    actionLabel: "View Algorithm Standards Matrix",
    actionUrl: "/matrix",
  },
  {
    keywords: ["encrypt file", "encrypt data", "symmetric cipher", "which cipher", "aes", "gcm", "chacha20", "aead"],
    title: "Symmetric Encryption Recommendation: AES-256-GCM or ChaCha20-Poly1305",
    badge: "NIST FIPS 197 / RFC 8439",
    summary: "Always use Authenticated Encryption with Associated Data (AEAD). AES-GCM provides hardware-accelerated confidentiality and authenticity. On devices lacking AES-NI (e.g. mobile, IoT), ChaCha20-Poly1305 is preferred.",
    formula: "C, T = \\text{AES-GCM}_K(\\text{IV}, P, A)",
    standard: "NIST SP 800-38D / RFC 8439",
    antipattern: "CRITICAL: Never repeat a 96-bit Nonce/IV under the same key in GCM. A single nonce reuse completely leaks the authentication key H (GHASH catastrophe).",
    actionLabel: "Inspect AES State Visualizer",
    actionUrl: "/tools/aes-state",
  },
  {
    keywords: ["ecb", "penguin", "electronic codebook", "ecb mode", "structural leakage"],
    title: "Why ECB Mode is Broken: Zero Semantic Diffusion",
    badge: "Structural Leakage Vulnerability",
    summary: "In Electronic Codebook (ECB) mode, each 128-bit plaintext block encrypts independently (C_i = E_k(P_i)). Identical input blocks always yield identical ciphertext blocks, preserving macroscopic images and structural patterns (the famous ECB Penguin flaw).",
    formula: "C_i = E_K(P_i) \\implies P_i = P_j \\iff C_i = C_j",
    standard: "NIST SP 800-38A (ECB Prohibited for Multi-Block Data)",
    antipattern: "Using ECB mode for database columns or file payloads leaks bitmap structures, token lengths, and repeated data blocks.",
    actionLabel: "Launch Interactive ECB Penguin Simulator",
    actionUrl: "/attacks",
  },
  {
    keywords: ["bit flip", "bit flipping", "cbc malleability", "cbc attack", "padding oracle"],
    title: "CBC Bit-Flipping & Malleability Exploit",
    badge: "Active Integrity Attack",
    summary: "In Cipher Block Chaining (CBC), decryption satisfies P_2 = D_k(C_2) ⊕ C_1. Flipping bit j in ciphertext block C_1 inverts bit j in plaintext block P_2, allowing attackers to forge permissions (e.g. role=user to role=root) without knowing the secret key.",
    formula: "P_2' = D_K(C_2) \\oplus (C_1 \\oplus \\Delta) = P_2 \\oplus \\Delta",
    standard: "CWE-311 / Stallings Ch. 6",
    antipattern: "Using unauthenticated CBC encryption. Without a cryptographic MAC (Encrypt-then-MAC) or AEAD (AES-GCM), ciphertext is malleable.",
    actionLabel: "Launch CBC Bit-Flipping Simulator",
    actionUrl: "/attacks",
  },
  {
    keywords: ["mitm", "man in the middle", "diffie hellman", "dh", "key exchange attack"],
    title: "Diffie-Hellman Man-in-the-Middle (MITM) Vulnerability",
    badge: "Unauthenticated Protocol Flaw",
    summary: "Unauthenticated Diffie-Hellman is vulnerable to active interception. An attacker in the network path intercepts Alice's public key (g^a) and Bob's public key (g^b), replacing them with their own key (g^m), establishing separate shared keys with each party to transparently decrypt all traffic.",
    formula: "K_{AM} = g^{am} \\pmod p, \\quad K_{MB} = g^{bm} \\pmod p",
    standard: "RFC 5246 (TLS 1.2) & RFC 8446 (TLS 1.3)",
    antipattern: "Deploying raw Diffie-Hellman without digital signatures (e.g. Ed25519 or RSA-PSS) to authenticate public key origins.",
    actionLabel: "Launch DH MITM Interceptor Simulator",
    actionUrl: "/attacks",
  },
  {
    keywords: ["lattice", "cvp", "lwe", "learning with errors", "kyber", "pqc", "quantum safe", "dilithium", "ml-kem", "ml-dsa"],
    title: "Lattice Cryptography: Closest Vector Problem (CVP) & LWE",
    badge: "NIST FIPS 203 & 204",
    summary: "Post-quantum security is built on high-dimensional lattices. An authentic secret basis (short, orthogonal) decodes small Gaussian noise via Babai's algorithm in constant time. A public skewed basis creates an intractable Closest Vector Problem resisting Shor's algorithm.",
    formula: "\\vec{t} = A \\cdot \\vec{s} + \\vec{e} \\pmod q",
    standard: "NIST FIPS 203 (ML-KEM-768) & FIPS 204 (ML-DSA-65)",
    antipattern: "Relying purely on RSA or ECC for long-lived secrets subject to 'Harvest Now, Decrypt Later' quantum adversaries.",
    actionLabel: "Launch Post-Quantum Lattice Studio",
    actionUrl: "/pqc",
  },
  {
    keywords: ["steganography", "lsb", "forensics", "hidden message", "magic bytes", "bit plane"],
    title: "Digital Forensics & LSB Image Steganography",
    badge: "Forensics Studio",
    summary: "Spatial steganography injects secret bits into least-significant bit (LSB) planes of image channels with imperceptible visual distortion (>50 dB PSNR). Structural forensics identifies anomalous appended payloads past EOF markers (JPEG FF D9 or PNG IEND).",
    formula: "\\text{PSNR} = 10 \\log_{10} \\left( \\frac{255^2}{\\text{MSE}} \\right) \\text{ dB}",
    standard: "IEEE Signal Processing & ISO/IEC 10918-1",
    antipattern: "Assuming image steganography provides encryption. LSB encoding hides existence but is not a cipher; always encrypt payloads (e.g. AES-GCM) before steganographic carrier injection.",
    actionLabel: "Open Steganography & Forensics Studio",
    actionUrl: "/forensics",
  },
  {
    keywords: ["notebook", "export", "report", "progress", "syllabus", "dossier"],
    title: "Lab Notebook & Verification Dossier",
    badge: "Portfolio & Export",
    summary: "Track completed curriculum lessons across all 8 Stallings tracks, log captured CTF flags, maintain researcher laboratory logs, and export formal academic verification reports in Markdown or Print-ready PDF.",
    standard: "Specimen Academic Verification Dossier",
    actionLabel: "Open Lab Notebook & Progress Exporter",
    actionUrl: "/notebook",
  },
  {
    keywords: ["shor", "shor algorithm", "quantum computer", "break rsa", "break ecc"],
    title: "Shor's Algorithm: Quantum Threat to Public-Key Cryptography",
    badge: "Quantum Threat Matrix",
    summary: "Peter Shor's 1994 quantum algorithm solves prime integer factorization and discrete logarithms in O((log N)³) polynomial time using the Quantum Fourier Transform (QFT). When cryptographically relevant quantum computers (CRQCs) emerge, all RSA, Diffie-Hellman, and ECC will break.",
    formula: "\\text{Period finding via QFT: } f(x) = a^x \\pmod N",
    standard: "NIST Post-Quantum Cryptography Standardization",
    antipattern: "Assuming 4096-bit RSA keys provide quantum safety. Increasing RSA key length only delays Shor's algorithm by a cubic polynomial factor.",
    actionLabel: "View Algorithm Standards Matrix",
    actionUrl: "/matrix",
  },
  {
    keywords: ["grover", "grover algorithm", "quantum aes", "quantum hash"],
    title: "Grover's Algorithm: Quantum Threat to Symmetric Primitives",
    badge: "Quantum Threat Matrix",
    summary: "Lov Grover's 1996 quantum algorithm accelerates unstructured database search from O(N) to O(√N). This effectively halves the symmetric security level of block ciphers and hashes. AES-128 drops to 64-bit security (vulnerable), but AES-256 retains 128-bit security (quantum-safe).",
    formula: "\\mathcal{O}(\\sqrt{2^k}) = 2^{k/2} \\text{ operations}",
    standard: "NIST SP 800-131A Rev. 2",
    antipattern: "Using 128-bit symmetric keys for military or high-assurance data destined to be secure past 2035.",
    actionLabel: "View Algorithm Standards Matrix",
    actionUrl: "/matrix",
  },
  {
    keywords: ["rsa", "how rsa works", "rsa encryption", "rsa key"],
    title: "RSA Cryptosystem: Mathematical Trapdoor",
    badge: "PKCS #1 / RFC 8017",
    summary: "RSA relies on the hardness of factoring large composite integers n = p × q. Encryption computes C = M^e mod n. Decryption uses the private exponent d = e⁻¹ mod φ(n), where φ(n) = (p-1)(q-1).",
    formula: "C \\equiv M^e \\pmod n, \\quad M \\equiv C^d \\pmod n",
    standard: "NIST SP 800-56B Rev. 2 (Min 2048-bit, Recommended 3072-bit)",
    antipattern: "Never use textbook RSA without randomized OAEP padding (PKCS#1 v2.2). Textbook RSA is deterministic and vulnerable to Coppersmith & Bleichenbacher attacks.",
    actionLabel: "Explore RSA Lesson & Calculator",
    actionUrl: "/lessons/rsa",
  },
  {
    keywords: ["frequency analysis", "caesar", "vigenere", "substitution", "etaoin"],
    title: "Classical Cryptanalysis: Letter Frequency & Index of Coincidence",
    badge: "Cryptanalysis Lab",
    summary: "Monoalphabetic ciphers preserve the underlying language letter distribution (in English: E, T, A, O, I, N, S, H, R, D, L, U). The Index of Coincidence (IC) measures the probability that two randomly selected letters are identical (IC ≈ 0.0667 for English, ≈ 0.0385 for random polyalphabetic).",
    formula: "\\text{IC} = \\frac{\\sum_{i=1}^{26} f_i(f_i - 1)}{N(N - 1)}",
    standard: "William Stallings (8th Ed., Ch. 3)",
    antipattern: "Believing complex multi-alphabet substitution or secret rotation algorithms are secure without provable one-time pad properties.",
    actionLabel: "Launch Frequency Analysis Desk",
    actionUrl: "/attacks",
  },
  {
    keywords: ["chinese remainder", "crt", "sun zi"],
    title: "Chinese Remainder Theorem (CRT)",
    badge: "Number Theory Solver",
    summary: "The Chinese Remainder Theorem states that if moduli m₁, m₂, ..., m_k are pairwise coprime, the system of simultaneous congruences x ≡ a_i (mod m_i) has a unique solution modulo M = ∏ m_i. Widely used to accelerate RSA decryption by 4x.",
    formula: "x \\equiv \\sum_{i=1}^k a_i M_i y_i \\pmod M",
    standard: "Stallings 8th Ed., Section 8.4",
    actionLabel: "Open Chinese Remainder Theorem Solver",
    actionUrl: "/tools/chinese-remainder",
  },
  {
    keywords: ["hmac", "hash message authentication", "mac", "tampering", "integrity"],
    title: "HMAC: Hash-based Message Authentication Code",
    badge: "RFC 2104 / FIPS 198-1",
    summary: "HMAC provides cryptographic authenticity and integrity using a secret key and a cryptographic hash function. It shields against length-extension attacks that affect raw Merkle-Damgård hashes (SHA-256).",
    formula: "\\text{HMAC}(K, m) = H((K \\oplus \\text{opad}) \\parallel H((K \\oplus \\text{ipad}) \\parallel m))",
    standard: "NIST FIPS 198-1",
    antipattern: "Never create a MAC by naive concatenation H(k || m). Merkle-Damgård hashes permit length extension attacks where an attacker appends data without knowing k.",
    actionLabel: "Open HMAC Tool",
    actionUrl: "/tools/hmac",
  },
  {
    keywords: ["tls", "tls 1.3", "handshake", "hkdf", "packet inspector", "wire", "sni"],
    title: "TLS 1.3 Handshake Protocol & HKDF Key Schedule",
    badge: "RFC 8446 (Transport Layer Security)",
    summary: "TLS 1.3 reduces handshake latency to 1-RTT by mandating ephemeral Diffie-Hellman (ECDHE) key shares in ClientHello. The HKDF key schedule derives Early, Handshake, and Application traffic keys with AEAD encryption protecting all certificates, signatures, and data records.",
    formula: "\\text{HandshakeSecret} = \\text{HKDF-Extract}(\\text{EarlySecret}, g^{ab})",
    standard: "RFC 8446 / NIST SP 800-52 Rev. 2",
    antipattern: "Using legacy TLS 1.0/1.1 or static RSA key exchange (which lacks forward secrecy and is vulnerable to DROWN).",
    actionLabel: "Launch TLS 1.3 Packet Inspector",
    actionUrl: "/handshake",
  },
  {
    keywords: ["zkp", "zero knowledge", "schnorr", "graph coloring", "fiat shamir", "interactive proof"],
    title: "Zero-Knowledge Proofs: Schnorr & Graph 3-Coloring",
    badge: "GMR (1985) / Schnorr (1989)",
    summary: "A Zero-Knowledge Proof allows a prover to convince a verifier that a statement is true without disclosing any secret witness. Schnorr proves knowledge of a discrete logarithm x such that y = g^x mod p via a 3-move exchange (Commitment, Challenge, Response).",
    formula: "g^s \\equiv R \\cdot y^c \\pmod p",
    standard: "ISO/IEC 14888-3 / BSI TR-03111",
    antipattern: "Generating challenges with predictable nonces or using non-cryptographic hash functions in Fiat-Shamir heuristics.",
    actionLabel: "Launch ZKP Playground",
    actionUrl: "/zkp",
  },
  {
    keywords: ["shamir", "secret sharing", "threshold", "lagrange", "k of n", "perfect secrecy"],
    title: "Shamir's (k, n) Threshold Secret Sharing Scheme",
    badge: "Adi Shamir (1979) / GF(257)",
    summary: "Splits a master secret S into n shares by encoding S as the constant term of a random degree-(k-1) polynomial f(0) = S. Any k shares uniquely reconstruct S via Lagrange interpolation over a finite field GF(p). Any k-1 shares reveal zero bits of information.",
    formula: "S = f(0) = \\sum_{i=1}^k y_i \\prod_{j \\ne i} \\frac{-x_j}{x_i - x_j} \\pmod p",
    standard: "NIST SP 800-57 Part 2 (Key Management)",
    antipattern: "Evaluating threshold polynomials over the real numbers instead of a finite field, which leaks partial information about the secret.",
    actionLabel: "Launch Shamir Visualizer",
    actionUrl: "/tools/shamir-secret-sharing",
  },
  {
    keywords: ["merkle", "merkle tree", "spv", "blockchain", "inclusion proof", "hash tree"],
    title: "Ralph Merkle Cryptographic Binary Hash Tree",
    badge: "Ralph Merkle (1979) / Bitcoin SPV",
    summary: "A binary tree of hashes where each leaf is the hash of a data block and each internal node is the hash of its children. Provides O(log₂ N) Simplified Payment Verification (SPV) inclusion proofs and instant tamper detection.",
    formula: "H_{root} = \\text{SHA256}(H_{01} \\parallel H_{23})",
    standard: "RFC 6962 (Certificate Transparency) / BIP 37",
    antipattern: "Unbalanced hash trees without domain separation prefixes, which may allow intermediate node collisions.",
    actionLabel: "Launch Merkle Tree Verifier",
    actionUrl: "/tools/merkle-tree",
  },
  {
    keywords: ["padding oracle", "vaudenay", "cbc padding", "lucky 13", "poodle"],
    title: "Vaudenay CBC Padding Oracle Attack",
    badge: "Serge Vaudenay (Eurocrypt 2002)",
    summary: "An active chosen-ciphertext attack against CBC mode encryption with PKCS#7 padding. If a server leaks whether decrypted padding is valid or invalid, an adversary can decrypt all ciphertext blocks byte-by-byte without knowing the encryption key.",
    formula: "P[i] = C'[i] \\oplus 0x01 \\oplus C[i-1]",
    standard: "CWE-388 / OWASP Cryptographic Failures",
    antipattern: "Decrypting CBC ciphertexts and returning detailed error messages, or failing to use Encrypt-then-MAC or AEAD (AES-GCM).",
    actionLabel: "Launch CTF Padding Oracle Sandbox",
    actionUrl: "/challenges",
  },
];

// Search Knowledge Base for user consultation
export function queryKnowledgeBase(rawQuery: string): AssistantInsight | null {
  const q = rawQuery.toLowerCase().trim();
  if (q.length < 3) return null;

  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      const res: AssistantInsight = {
        queryType: "consultation",
        title: entry.title,
        badge: entry.badge,
        summary: entry.summary,
        actionLabel: entry.actionLabel,
        actionUrl: entry.actionUrl,
      };
      if (entry.formula) res.formula = entry.formula;
      if (entry.standard) res.standard = entry.standard;
      if (entry.antipattern) res.antipattern = entry.antipattern;
      return res;
    }
  }

  return null;
}
