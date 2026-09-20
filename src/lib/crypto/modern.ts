import { bytesToBase64, bytesToHex, base64ToBytes, toBytes } from "./encoding";
import { isPrime, modPow } from "./numbertheory";
import type { TraceStep } from "./types";

const subtle = () => {
  if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle)
    throw new Error("Web Crypto is unavailable in this environment.");
  return globalThis.crypto.subtle;
};

const HASHES = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
export type HashName = (typeof HASHES)[number];

export async function hashText(text: string, algorithm: string) {
  const algo = (HASHES as readonly string[]).includes(algorithm) ? algorithm : "SHA-256";
  const digest = new Uint8Array(await subtle().digest(algo, toBytes(text)));
  return {
    output: bytesToHex(digest, false),
    steps: [
      { label: "input length", detail: `${toBytes(text).length} bytes` },
      { label: "digest length", detail: `${digest.length} bytes / ${digest.length * 8} bits` },
      { label: "base64", detail: bytesToBase64(digest) },
    ] satisfies TraceStep[],
    note:
      algo === "SHA-1"
        ? "SHA-1 is broken for collision resistance (SHAttered, 2017). Never use it for signatures."
        : "Change one character and roughly half the output bits flip — the avalanche effect.",
  };
}

export async function avalanche(text: string, altText?: string) {
  if (!text) return { output: "", error: "Type something to compare." };
  const flipped = altText && altText !== text ? altText : text.slice(0, -1) + (text.slice(-1) === "a" ? "b" : "a");
  const a = new Uint8Array(await subtle().digest("SHA-256", toBytes(text)));
  const b = new Uint8Array(await subtle().digest("SHA-256", toBytes(flipped)));
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    let x = a[i]! ^ b[i]!;
    while (x) {
      diff += x & 1;
      x >>= 1;
    }
  }
  return {
    output: `${diff} of 256 bits differ (${((diff / 256) * 100).toFixed(1)} %)`,
    steps: [
      { label: `SHA-256("${text}")`, detail: bytesToHex(a, false).slice(0, 48) + "…" },
      { label: `SHA-256("${flipped}")`, detail: bytesToHex(b, false).slice(0, 48) + "…" },
    ],
    note: "A single-character edit produces an unrelated digest. Ideal is 50 %.",
  };
}

export async function hmacText(message: string, key: string, algorithm: string) {
  if (!key) return { output: "", error: "Enter a secret key." };
  const algo = (HASHES as readonly string[]).includes(algorithm) ? algorithm : "SHA-256";
  const cryptoKey = await subtle().importKey(
    "raw",
    toBytes(key),
    { name: "HMAC", hash: algo },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await subtle().sign("HMAC", cryptoKey, toBytes(message)));
  return {
    output: bytesToHex(sig, false),
    steps: [
      { label: "construction", detail: "H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ message))" },
      { label: "base64", detail: bytesToBase64(sig) },
    ],
    note: "HMAC proves both integrity and authenticity: without the key you cannot forge the tag.",
  };
}

async function deriveAesKey(password: string, salt: Uint8Array, iterations: number) {
  const base = await subtle().importKey("raw", toBytes(password), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function aesEncrypt(plaintext: string, password: string) {
  if (!password) return { output: "", error: "Enter a passphrase." };
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt, 200000);
  const ct = new Uint8Array(
    await subtle().encrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, key, toBytes(plaintext)),
  );
  const packed = new Uint8Array(salt.length + iv.length + ct.length);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(ct, salt.length + iv.length);
  return {
    output: bytesToBase64(packed),
    steps: [
      { label: "salt (16 bytes)", detail: bytesToHex(salt) },
      { label: "nonce / IV (12 bytes)", detail: bytesToHex(iv) },
      { label: "key derivation", detail: "PBKDF2-HMAC-SHA256, 200 000 iterations, 256-bit key" },
      { label: "cipher", detail: "AES-256-GCM — the last 16 bytes are the authentication tag" },
    ],
    note: "Salt and nonce are stored alongside the ciphertext; they are public but must never repeat.",
  };
}

export async function aesDecrypt(payload: string, password: string) {
  if (!password) return { output: "", error: "Enter the passphrase." };
  try {
    const packed = base64ToBytes(payload);
    if (packed.length < 29) return { output: "", error: "Ciphertext is too short." };
    const salt = packed.slice(0, 16);
    const iv = packed.slice(16, 28);
    const ct = packed.slice(28);
    const key = await deriveAesKey(password, salt, 200000);
    const pt = await subtle().decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      ct as unknown as BufferSource,
    );
    return { output: new TextDecoder().decode(pt), note: "The GCM tag verified, so the message is authentic and unmodified." };
  } catch {
    return {
      output: "",
      error: "Decryption failed — wrong passphrase, or the ciphertext was tampered with. GCM refuses to return unverified data.",
    };
  }
}

export async function pbkdf2Tool(password: string, salt: string, iterationsS: string) {
  const iterations = Math.max(1, Math.min(1000000, Number(iterationsS) || 100000));
  const base = await subtle().importKey("raw", toBytes(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(
    await subtle().deriveBits(
      { name: "PBKDF2", salt: toBytes(salt) as unknown as BufferSource, iterations, hash: "SHA-256" },
      base,
      256,
    ),
  );
  return {
    output: bytesToHex(bits, false),
    steps: [
      { label: "iterations", detail: iterations.toLocaleString() },
      { label: "salt", detail: salt || "(empty — always use a random salt in practice)" },
    ],
    note: "Slow, salted derivation defeats rainbow tables and throttles brute force. Argon2id or scrypt are stronger modern choices.",
  };
}

export function randomKey(bitsS: string, format: string) {
  const bits = Math.max(64, Math.min(1024, Number(bitsS) || 256));
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(Math.ceil(bits / 8)));
  const output = format === "base64" ? bytesToBase64(bytes) : bytesToHex(bytes, false);
  return {
    output,
    note: `${bytes.length * 8} bits from a cryptographically secure generator. Math.random() is never acceptable for keys.`,
  };
}

export function passwordEntropy(password: string) {
  if (!password) return { output: "" };
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-z0-9]/i.test(password)) pool += 33;
  const bits = password.length * Math.log2(pool || 1);
  const guesses = 2 ** (bits - 1);
  const perSecond = 1e11;
  const seconds = guesses / perSecond;
  const human =
    seconds < 60
      ? `${seconds.toFixed(1)} seconds`
      : seconds < 3600
        ? `${(seconds / 60).toFixed(1)} minutes`
        : seconds < 86400
          ? `${(seconds / 3600).toFixed(1)} hours`
          : seconds < 3.15e7
            ? `${(seconds / 86400).toFixed(1)} days`
            : `${(seconds / 3.15e7).toExponential(2)} years`;
  return {
    output: `${bits.toFixed(1)} bits of entropy`,
    steps: [
      { label: "character pool", detail: `${pool} possible symbols per position` },
      { label: "length", detail: `${password.length} characters` },
      { label: "offline cracking estimate", detail: `${human} at 10¹¹ guesses/second` },
    ],
    note: "Length beats complexity: four random words outscore 'P@ssw0rd!' by a wide margin. 80+ bits is a good target.",
  };
}

export function rsaDemo(pS: string, qS: string, eS: string, messageS: string) {
  try {
    const p = BigInt(pS), q = BigInt(qS), e = BigInt(eS), m = BigInt(messageS);
    if (!isPrime(p) || !isPrime(q)) return { output: "", error: "p and q must both be prime." };
    if (p === q) return { output: "", error: "p and q must be different primes." };
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    const g = (x: bigint, y: bigint): bigint => (y === 0n ? x : g(y, x % y));
    if (g(e, phi) !== 1n) return { output: "", error: `e = ${e} must be coprime with φ(n) = ${phi}.` };
    if (m >= n) return { output: "", error: `Message must be smaller than n = ${n}.` };
    let d = 1n;
    while ((d * e) % phi !== 1n % phi) {
      d++;
      if (d > phi) return { output: "", error: "Could not find d." };
    }
    const c = modPow(m, e, n);
    const back = modPow(c, d, n);
    return {
      output: `ciphertext = ${c}, decrypted = ${back}`,
      steps: [
        { label: `n = p·q = ${p}·${q}`, detail: `${n}` },
        { label: `φ(n) = (p−1)(q−1)`, detail: `${phi}` },
        { label: `public key (e, n)`, detail: `(${e}, ${n})` },
        { label: `private key d = e⁻¹ mod φ(n)`, detail: `${d}` },
        { label: `encrypt: m^e mod n = ${m}^${e} mod ${n}`, detail: `${c}` },
        { label: `decrypt: c^d mod n = ${c}^${d} mod ${n}`, detail: `${back}` },
      ],
      note: "Real RSA uses 2048-bit primes and OAEP padding. Textbook RSA like this is deterministic and insecure.",
    };
  } catch {
    return { output: "", error: "Enter whole numbers." };
  }
}

export function diffieHellman(pS: string, gS: string, aS: string, bS: string) {
  try {
    const p = BigInt(pS), gg = BigInt(gS), a = BigInt(aS), b = BigInt(bS);
    if (!isPrime(p)) return { output: "", error: "p must be prime." };
    const A = modPow(gg, a, p);
    const B = modPow(gg, b, p);
    const sA = modPow(B, a, p);
    const sB = modPow(A, b, p);
    return {
      output: `shared secret = ${sA}`,
      steps: [
        { label: `Alice sends A = g^a mod p = ${gg}^${a} mod ${p}`, detail: `${A}` },
        { label: `Bob sends B = g^b mod p = ${gg}^${b} mod ${p}`, detail: `${B}` },
        { label: `Alice computes B^a mod p`, detail: `${sA}` },
        { label: `Bob computes A^b mod p`, detail: `${sB}` },
      ],
      note: "An eavesdropper sees p, g, A and B but must solve the discrete logarithm to recover the secret.",
    };
  } catch {
    return { output: "", error: "Enter whole numbers." };
  }
}
