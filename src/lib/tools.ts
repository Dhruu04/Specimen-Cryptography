import {
  affine,
  atbash,
  autokey,
  caesar,
  caesarBruteForce,
  columnar,
  frequencyAnalysis,
  morse,
  playfair,
  railFence,
  rot13,
  vigenere,
  xorCipher,
  xorDecipher,
} from "./crypto/classical";
import {
  base32ToText,
  base58ToText,
  base64ToText,
  baseConvert,
  binaryToText,
  decimalToText,
  endiannessConverter,
  hexToText,
  textToBase32,
  textToBase58,
  textToBase64,
  textToBinary,
  textToDecimal,
  textToHex,
  urlDecode,
  urlEncode,
} from "./crypto/encoding";
import {
  aesDecrypt,
  aesEncrypt,
  avalanche,
  diffieHellman,
  hashText,
  hmacText,
  passwordEntropy,
  pbkdf2Tool,
  randomKey,
  rsaDemo,
} from "./crypto/modern";
import {
  chineseRemainderTheorem,
  discreteLog,
  extendedEuclid,
  factorize,
  fastModExpTrace,
  gcdTrace,
  modInverseTool,
  modPowTool,
  primeTest,
  primitiveRoots,
  sieve,
  totient,
} from "./crypto/numbertheory";
import {
  baconianCipher,
  enigmaSimulator,
  frequencyAnalysisEnhanced,
  hillCipher2x2,
  oneTimePad,
} from "./crypto/advanced-classical";
import {
  aesStateVisualizer,
  birthdayCollisionEstimator,
  blockCipherModesVisualizer,
  merkleTreeTool,
} from "./crypto/advanced-modern";
import {
  diffieHellmanMitmSimulator,
  eccPointVisualizer,
  rsaCompleteSuite,
  tlsHandshakeVisualizer,
} from "./crypto/advanced-asymmetric";
import {
  babyStepGiantStep,
  crtMultiSolver,
  extendedEuclidTableau,
  millerRabinStepByStep,
} from "./crypto/advanced-numbertheory";
import {
  paddingOracleSimulator,
  timingAttackSimulator,
  zkpSchnorrSimulator,
} from "./crypto/security-attacks";
import {
  bifidCipher,
  chacha20QuarterRound,
  desRoundVisualizer,
  modularGroupLab,
  quadraticResiduesTool,
  replayAttackSimulator,
  scytaleCipher,
} from "./crypto/more-algorithms";
import {
  codeBasedMcElieceSimulator,
  lamportMerkleSignSimulator,
  latticeLweSimulator,
  mlKemKyberSimulator,
  quantumThreatCalculator,
  simplifiedAesEngine,
} from "./crypto/post-quantum";
import { generateShamirSetup, lagrangeInterpolateSecret } from "./crypto/shamir";
import { inspectFormat } from "./detector";
import type { ToolOutput } from "./crypto/types";

export type ToolField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  default: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  hint?: string;
};

export type Tool = {
  id: string;
  name: string;
  tagline: string;
  trackId: string;
  outputLabel: string;
  fields: ToolField[];
  run: (get: (name: string) => string) => ToolOutput | Promise<ToolOutput>;
};

const text = (
  name: string,
  label: string,
  def: string,
  type: ToolField["type"] = "text",
): ToolField => ({ name, label, type, default: def });

const num = (name: string, label: string, def: string, min?: number, max?: number): ToolField => ({
  name,
  label,
  type: "number",
  default: def,
  ...(min === undefined ? {} : { min }),
  ...(max === undefined ? {} : { max }),
});

const mode = (encryptLabel = "Encrypt", decryptLabel = "Decrypt"): ToolField => ({
  name: "mode",
  label: "Direction",
  type: "select",
  default: "encrypt",
  options: [
    { value: "encrypt", label: encryptLabel },
    { value: "decrypt", label: decryptLabel },
  ],
});

export const tools: Tool[] = [
  // --- Classical Track ---
  {
    id: "caesar",
    name: "Caesar cipher",
    tagline: "Shift every letter down the alphabet",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"),
      num("shift", "Shift (0–25)", "3", 0, 25),
      mode(),
    ],
    run: (g) => caesar(g("text"), Number(g("shift")), g("mode") === "decrypt"),
  },
  {
    id: "rot13",
    name: "ROT13",
    tagline: "The 13-shift involution",
    trackId: "classical",
    outputLabel: "Result",
    fields: [text("text", "Text", "URYYB JBEYQ")],
    run: (g) => rot13(g("text")),
  },
  {
    id: "atbash",
    name: "Atbash cipher",
    tagline: "Reverse the alphabet (A↔Z, B↔Y)",
    trackId: "classical",
    outputLabel: "Result",
    fields: [text("text", "Text", "SHERLOCK")],
    run: (g) => atbash(g("text")),
  },
  {
    id: "affine",
    name: "Affine cipher",
    tagline: "Multiply and shift mod 26: E(x) = (ax + b) mod 26",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "AFFINE CIPHER"),
      num("a", "Multiplier a (must be coprime to 26)", "5"),
      num("b", "Shift b", "8", 0, 25),
      mode(),
    ],
    run: (g) => affine(g("text"), Number(g("a")), Number(g("b")), g("mode") === "decrypt"),
  },
  {
    id: "vigenere",
    name: "Vigenère cipher",
    tagline: "Polyalphabetic substitution with a repeating keyword",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "ATTACK AT DAWN"),
      text("key", "Key", "LEMON"),
      mode(),
    ],
    run: (g) => vigenere(g("text"), g("key"), g("mode") === "decrypt"),
  },
  {
    id: "autokey",
    name: "Autokey cipher",
    tagline: "Vigenère with plaintext extending the key",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "MEET AT MIDNIGHT"),
      text("primer", "Primer key", "QUEEN"),
      mode(),
    ],
    run: (g) => autokey(g("text"), g("primer"), g("mode") === "decrypt"),
  },
  {
    id: "playfair",
    name: "Playfair cipher",
    tagline: "Encrypt digraphs on a 5×5 key square",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "HIDE THE GOLD IN THE TREE STUMP"),
      text("key", "Key", "MONARCHY"),
      mode(),
    ],
    run: (g) => playfair(g("text"), g("key"), g("mode") === "decrypt"),
  },
  {
    id: "rail-fence",
    name: "Rail fence cipher",
    tagline: "Zig-zag transposition across rails",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "DEFEND THE EAST WALL"),
      num("rails", "Rails", "3", 2, 10),
      mode(),
    ],
    run: (g) => railFence(g("text"), Number(g("rails")), g("mode") === "decrypt"),
  },
  {
    id: "columnar",
    name: "Columnar transposition",
    tagline: "Rearrange text into columns ordered by key letters",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "THE TREASURE IS BURIED AT THE COVE"),
      text("key", "Key", "ZEBRA"),
      mode(),
    ],
    run: (g) => columnar(g("text"), g("key"), g("mode") === "decrypt"),
  },
  {
    id: "otp",
    name: "One-Time Pad (Vernam)",
    tagline: "Information-theoretically unbreakable cipher (Shannon 1949)",
    trackId: "classical",
    outputLabel: "Ciphertext / Plaintext",
    fields: [
      text("text", "Text", "TOP SECRET MESSAGE"),
      text("key", "Key (Pad)", "XMCKLPOIQAZWSXEDCRF"),
      mode(),
    ],
    run: (g) => oneTimePad(g("text"), g("key"), g("mode") as "encrypt" | "decrypt"),
  },
  {
    id: "hill-cipher",
    name: "Hill cipher (2×2)",
    tagline: "Polygraphic matrix linear algebra over ℤ/26ℤ",
    trackId: "classical",
    outputLabel: "Output",
    fields: [
      text("text", "Text", "HELP"),
      num("k00", "Matrix [0,0]", "3"),
      num("k01", "Matrix [0,1]", "3"),
      num("k10", "Matrix [1,0]", "2"),
      num("k11", "Matrix [1,1]", "5"),
      mode(),
    ],
    run: (g) =>
      hillCipher2x2(
        g("text"),
        Number(g("k00")),
        Number(g("k01")),
        Number(g("k10")),
        Number(g("k11")),
        g("mode") as "encrypt" | "decrypt",
      ),
  },
  {
    id: "enigma",
    name: "Enigma machine",
    tagline: "WWII 3-rotor (I, II, III) + Reflector B + Plugboard simulator",
    trackId: "classical",
    outputLabel: "Ciphertext",
    fields: [
      text("text", "Text", "WETTERBERICHT"),
      text("rotors", "Rotor positions (e.g. AAA)", "AAA"),
      text("plugs", "Plugboard pairs (e.g. AB CD)", "AB CD"),
    ],
    run: (g) => enigmaSimulator(g("text"), g("rotors"), g("plugs")),
  },
  {
    id: "baconian",
    name: "Baconian cipher",
    tagline: "Francis Bacon's 5-bit steganographic binary alphabet",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "KNOWLEDGE"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ],
      },
    ],
    run: (g) => baconianCipher(g("text"), g("mode") as "encode" | "decode"),
  },
  {
    id: "frequency",
    name: "Frequency analysis & χ²",
    tagline: "Count letters, plot against English frequencies, calculate χ²",
    trackId: "classical",
    outputLabel: "Analysis",
    fields: [
      text(
        "text",
        "Text to analyze",
        "WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ",
        "textarea",
      ),
    ],
    run: (g) => frequencyAnalysisEnhanced(g("text")),
  },
  {
    id: "caesar-bruteforce",
    name: "Caesar cracker",
    tagline: "Try all 25 shifts at once",
    trackId: "classical",
    outputLabel: "All shifts",
    fields: [text("text", "Ciphertext", "WKH TXLFN EURZQ IRA")],
    run: (g) => caesarBruteForce(g("text")),
  },
  {
    id: "morse",
    name: "Morse code",
    tagline: "Dots and dashes of telegraphy",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "SOS"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Text to Morse" },
          { value: "decode", label: "Morse to Text" },
        ],
      },
    ],
    run: (g) => morse(g("text"), g("mode") === "decode"),
  },
  {
    id: "xor-cipher",
    name: "XOR cipher",
    tagline: "The fundamental bitwise building block of modern crypto",
    trackId: "classical",
    outputLabel: "Result",
    fields: [
      text("text", "Text", "HELLO"),
      text("key", "Key", "KEY"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encrypt",
        options: [
          { value: "encrypt", label: "Text → Hex" },
          { value: "decrypt", label: "Hex → Text" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encrypt" ? xorCipher(g("text"), g("key")) : xorDecipher(g("text"), g("key"))),
  },

  // --- Encoding Track ---
  {
    id: "base64",
    name: "Base64",
    tagline: "Bytes to 64 ASCII characters",
    trackId: "encoding",
    outputLabel: "Result",
    fields: [
      text("text", "Input", "Hello, cryptography!"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Text → Base64" },
          { value: "decode", label: "Base64 → Text" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encode" ? textToBase64(g("text")) : base64ToText(g("text"))),
  },
  {
    id: "base58",
    name: "Base58 (Bitcoin)",
    tagline: "Binary-to-text without ambiguous characters (0, O, I, l)",
    trackId: "encoding",
    outputLabel: "Base58 Output",
    fields: [
      text("text", "Input Text / Base58", "Satoshi Nakamoto"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Text → Base58" },
          { value: "decode", label: "Base58 → Text" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encode" ? textToBase58(g("text")) : base58ToText(g("text"))),
  },
  {
    id: "base32",
    name: "Base32 (RFC 4648)",
    tagline: "Case-insensitive encoding used in 2FA / TOTP secrets",
    trackId: "encoding",
    outputLabel: "Base32 Output",
    fields: [
      text("text", "Input Text / Base32", "The quick brown fox"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Text → Base32" },
          { value: "decode", label: "Base32 → Text" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encode" ? textToBase32(g("text")) : base32ToText(g("text"))),
  },
  {
    id: "endianness",
    name: "Endianness inspector",
    tagline: "Big-Endian vs Little-Endian byte order representation",
    trackId: "encoding",
    outputLabel: "Endian Analysis",
    fields: [text("hex", "Hex Bytes (e.g. 01020304)", "01020304")],
    run: (g) => endiannessConverter(g("hex")),
  },
  {
    id: "hex",
    name: "Hexadecimal (Base 16)",
    tagline: "Two characters per byte",
    trackId: "encoding",
    outputLabel: "Result",
    fields: [
      text("text", "Input", "Crypto"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Text → Hex" },
          { value: "decode", label: "Hex → Text" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encode" ? textToHex(g("text")) : hexToText(g("text"))),
  },
  {
    id: "binary",
    name: "Binary (Base 2)",
    tagline: "The raw bits of your UTF-8 bytes",
    trackId: "encoding",
    outputLabel: "Result",
    fields: [
      text("text", "Input", "ABC"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Text → Bits" },
          { value: "decode", label: "Bits → Text" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encode" ? textToBinary(g("text")) : binaryToText(g("text"))),
  },
  {
    id: "decimal",
    name: "Decimal bytes",
    tagline: "Bytes as numbers 0–255",
    trackId: "encoding",
    outputLabel: "Result",
    fields: [
      text("text", "Input", "Hi!"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Text → Bytes" },
          { value: "decode", label: "Bytes → Text" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encode" ? textToDecimal(g("text")) : decimalToText(g("text"))),
  },
  {
    id: "url",
    name: "URL percent-encoding",
    tagline: "Safe transmission in HTTP query parameters",
    trackId: "encoding",
    outputLabel: "Result",
    fields: [
      text("text", "Input", "hello world & foo=bar"),
      {
        name: "mode",
        label: "Direction",
        type: "select",
        default: "encode",
        options: [
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ],
      },
    ],
    run: (g) => (g("mode") === "encode" ? urlEncode(g("text")) : urlDecode(g("text"))),
  },
  {
    id: "radix",
    name: "Base / Radix converter",
    tagline: "Convert any integer between bases 2 and 36",
    trackId: "encoding",
    outputLabel: "Converted number",
    fields: [
      text("value", "Value", "255"),
      num("from", "From base", "10", 2, 36),
      num("to", "To base", "16", 2, 36),
    ],
    run: (g) => baseConvert(g("value"), Number(g("from")), Number(g("to"))),
  },
  {
    id: "format-inspector",
    name: "Format auto-detector & inspector",
    tagline: "Intelligent format recognition, Shannon entropy, and cryptographic signature analysis",
    trackId: "encoding",
    outputLabel: "Detection Report",
    fields: [
      text("text", "Input Buffer / Ciphertext / Key / Hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "textarea"),
    ],
    run: (g) => {
      const res = inspectFormat(g("text"));
      const steps: { label: string; detail: string }[] = [
        { label: "Detected Format", detail: `${res.typeLabel} (${res.confidence} confidence)` },
        { label: "Classification Badge", detail: res.badge },
        { label: "Description", detail: res.description },
        {
          label: "Shannon Entropy",
          detail: `${res.entropy.bitsPerByte} / 8.00 bits/byte — ${res.entropy.classification} (${res.entropy.description})`,
        },
      ];

      if (res.stats?.indexOfCoincidence) {
        steps.push({
          label: "Index of Coincidence (IC)",
          detail: `${res.stats.indexOfCoincidence} (${res.stats.indexOfCoincidence > 0.055 ? "Natural English distribution" : "High spread / Polyalphabetic / Ciphertext"})`,
        });
      }

      if (res.possibleHashes && res.possibleHashes.length > 0) {
        steps.push({
          label: "Candidate Hash Algorithms",
          detail: res.possibleHashes.join(" | "),
        });
      }

      if (res.decodedPreview) {
        steps.push({
          label: "Decoded Interpretation",
          detail: res.decodedPreview,
        });
      }

      for (const d of res.details) {
        steps.push({ label: d.label, detail: d.value });
      }

      let formattedOutput = `[FORMAT DETECTED: ${res.typeLabel.toUpperCase()}]\n\n`;
      formattedOutput += `Confidence: ${res.confidence}\n`;
      formattedOutput += `Badge: ${res.badge}\n`;
      formattedOutput += `Shannon Entropy: ${res.entropy.bitsPerByte} bits/byte (${res.entropy.classification})\n\n`;
      if (res.decodedPreview) {
        formattedOutput += `--- DECODED PREVIEW ---\n${res.decodedPreview}\n\n`;
      }
      formattedOutput += `--- REPRESENTATIONS ---\n`;
      if (res.representations.ascii) formattedOutput += `ASCII: ${res.representations.ascii}\n`;
      if (res.representations.hex) formattedOutput += `Hex: ${res.representations.hex}\n`;
      if (res.representations.base64) formattedOutput += `Base64: ${res.representations.base64}\n`;
      if (res.representations.binary) formattedOutput += `Binary: ${res.representations.binary}\n`;
      if (res.representations.decimal) formattedOutput += `Decimal: ${res.representations.decimal}\n`;

      return {
        output: formattedOutput,
        steps,
      };
    },
  },

  // --- Symmetric Track ---
  {
    id: "aes",
    name: "AES-GCM",
    tagline: "Authenticated encryption with WebCrypto",
    trackId: "symmetric",
    outputLabel: "Result",
    fields: [
      text("text", "Plaintext or hex payload", "Secret message to AES encrypt"),
      text("pass", "Passphrase", "correct horse battery staple"),
      mode(),
    ],
    run: (g) =>
      g("mode") === "encrypt" ? aesEncrypt(g("text"), g("pass")) : aesDecrypt(g("text"), g("pass")),
  },
  {
    id: "aes-state",
    name: "AES State & Rounds visualizer",
    tagline: "SubBytes (S-Box), ShiftRows, MixColumns (GF(2⁸)), AddRoundKey",
    trackId: "symmetric",
    outputLabel: "Round 1 State Matrix",
    fields: [
      text("text", "16-byte Block Text", "CRYPTO STUDY LAB"),
      text("key", "32-char Round Key Hex", "000102030405060708090a0b0c0d0e0f"),
    ],
    run: (g) => aesStateVisualizer(g("text"), g("key")),
  },
  {
    id: "block-modes",
    name: "Block cipher modes",
    tagline: "ECB (Penguin effect) vs CBC (IV chaining) vs CTR vs GCM (AEAD)",
    trackId: "symmetric",
    outputLabel: "Block Mode Result",
    fields: [
      text("text", "Plaintext", "ATTACKATDAWNATTACKATDAWN"),
      {
        name: "mode",
        label: "Cipher Mode",
        type: "select",
        default: "CBC",
        options: [
          { value: "ECB", label: "ECB (Electronic Codebook)" },
          { value: "CBC", label: "CBC (Cipher Block Chaining)" },
          { value: "CTR", label: "CTR (Counter Mode)" },
          { value: "GCM", label: "GCM (Galois/Counter Mode AEAD)" },
        ],
      },
      text("iv", "IV / Nonce (Hex)", "fedcba9876543210"),
    ],
    run: (g) => blockCipherModesVisualizer(g("text"), g("mode") as any, g("iv")),
  },
  {
    id: "random-key",
    name: "Cryptographic keygen",
    tagline: "CSPRNG cryptographically secure random bytes",
    trackId: "symmetric",
    outputLabel: "Generated key",
    fields: [
      num("bytes", "Length in bytes", "32", 1, 128),
      {
        name: "fmt",
        label: "Format",
        type: "select",
        default: "hex",
        options: [
          { value: "hex", label: "Hex" },
          { value: "base64", label: "Base64" },
        ],
      },
    ],
    run: (g) => randomKey(g("bytes"), g("fmt")),
  },

  // --- Hashing Track ---
  {
    id: "hash",
    name: "Cryptographic hash",
    tagline: "SHA-256, SHA-512, SHA-1, MD5",
    trackId: "hashing",
    outputLabel: "Digest",
    fields: [
      text("text", "Input text", "Cryptex"),
      {
        name: "algo",
        label: "Algorithm",
        type: "select",
        default: "SHA-256",
        options: [
          { value: "SHA-256", label: "SHA-256 (Standard)" },
          { value: "SHA-512", label: "SHA-512 (High security)" },
          { value: "SHA-1", label: "SHA-1 (Broken - Legacy only)" },
          { value: "MD5", label: "MD5 (Broken - Legacy only)" },
        ],
      },
    ],
    run: (g) => hashText(g("text"), g("algo")),
  },
  {
    id: "hmac",
    name: "HMAC",
    tagline: "Keyed-hash message authentication code",
    trackId: "hashing",
    outputLabel: "MAC Tag",
    fields: [
      text("text", "Message", "transfer $500 to Bob"),
      text("key", "Secret key", "supersecretkey"),
      {
        name: "algo",
        label: "Hash algorithm",
        type: "select",
        default: "SHA-256",
        options: [
          { value: "SHA-256", label: "SHA-256" },
          { value: "SHA-512", label: "SHA-512" },
        ],
      },
    ],
    run: (g) => hmacText(g("text"), g("key"), g("algo")),
  },
  {
    id: "avalanche",
    name: "Avalanche effect",
    tagline: "Flip one bit, watch 50% of hash bits flip",
    trackId: "hashing",
    outputLabel: "Comparison",
    fields: [
      text("text1", "Input 1", "The quick brown fox"),
      text("text2", "Input 2 (change one letter)", "The quick brown foy"),
    ],
    run: (g) => avalanche(g("text1"), g("text2")),
  },
  {
    id: "merkle-tree",
    name: "Merkle tree & audit proofs",
    tagline: "Hierarchical cryptographic hash trees with O(log N) verification",
    trackId: "hashing",
    outputLabel: "Tree Root & Audit Proof",
    fields: [
      text(
        "leaves",
        "Data Leaves (comma or newline separated)",
        "Tx1: Alice->Bob 5, Tx2: Bob->Charlie 2, Tx3: Charlie->Dave 1, Tx4: Dave->Eve 4",
        "textarea",
      ),
      num("verifyIndex", "Verify leaf index", "1", 0, 100),
    ],
    run: (g) => merkleTreeTool(g("leaves"), Number(g("verifyIndex"))),
  },
  {
    id: "birthday-attack",
    name: "Birthday paradox & collision calculator",
    tagline: "Why an n-bit hash offers only n/2 bits of collision resistance",
    trackId: "hashing",
    outputLabel: "Collision Probability",
    fields: [
      num("bits", "Hash Output Size (bits)", "32", 8, 512),
      num("samples", "Number of Generated Hashes (k)", "77000", 1, 1000000000),
    ],
    run: (g) => birthdayCollisionEstimator(Number(g("bits")), Number(g("samples"))),
  },
  {
    id: "pbkdf2",
    name: "PBKDF2 key derivation",
    tagline: "Slow, salted password hashing",
    trackId: "hashing",
    outputLabel: "Derived key (Hex)",
    fields: [
      text("pass", "Password", "correct horse battery staple"),
      text("salt", "Salt", "random-salt-1234"),
      num("iters", "Iterations", "100000", 1000, 1000000),
    ],
    run: (g) => pbkdf2Tool(g("pass"), g("salt"), g("iters")),
  },

  // --- Public Key Track ---
  {
    id: "rsa-suite",
    name: "RSA complete suite",
    tagline: "Key generation, encryption, decryption, digital signing & verification",
    trackId: "publickey",
    outputLabel: "RSA Cryptographic Output",
    fields: [
      num("p", "Prime p", "61"),
      num("q", "Prime q", "53"),
      num("e", "Public exponent e (coprime to φ(n))", "17"),
      num("msg", "Integer message m (< n)", "65"),
      {
        name: "action",
        label: "Operation",
        type: "select",
        default: "encrypt",
        options: [
          { value: "encrypt", label: "Encrypt & Decrypt" },
          { value: "sign", label: "Sign & Verify" },
        ],
      },
    ],
    run: (g) =>
      rsaCompleteSuite(
        Number(g("p")),
        Number(g("q")),
        Number(g("e")),
        Number(g("msg")),
        g("action") as "encrypt" | "sign",
      ),
  },
  {
    id: "rsa",
    name: "RSA miniature demo",
    tagline: "Toy RSA arithmetic on small primes",
    trackId: "publickey",
    outputLabel: "RSA Demo",
    fields: [
      num("p", "Prime p", "61"),
      num("q", "Prime q", "53"),
      num("e", "Exponent e", "17"),
      num("msg", "Message m", "42"),
    ],
    run: (g) => rsaDemo(g("p"), g("q"), g("e"), g("msg")),
  },
  {
    id: "dh-mitm",
    name: "Diffie–Hellman & MITM attack",
    tagline: "Key exchange and why unauthenticated DH is vulnerable to active interceptors",
    trackId: "publickey",
    outputLabel: "Exchange Status",
    fields: [
      num("p", "Prime modulus p", "997"),
      num("g", "Generator g", "7"),
      num("a", "Alice private key a", "123"),
      num("b", "Bob private key b", "456"),
      {
        name: "mitm",
        label: "Eve active MITM interceptor",
        type: "select",
        default: "no",
        options: [
          { value: "no", label: "No (Clean Channel)" },
          { value: "yes", label: "Yes (Eve Intercepts & Replaces Keys)" },
        ],
      },
    ],
    run: (g) =>
      diffieHellmanMitmSimulator(
        Number(g("p")),
        Number(g("g")),
        Number(g("a")),
        Number(g("b")),
        g("mitm") === "yes",
      ),
  },
  {
    id: "diffie-hellman",
    name: "Diffie–Hellman key exchange",
    tagline: "Agree on a secret key over a public channel",
    trackId: "publickey",
    outputLabel: "Shared secret",
    fields: [
      num("p", "Prime modulus p", "353"),
      num("g", "Generator g", "3"),
      num("a", "Alice private exponent a", "97"),
      num("b", "Bob private exponent b", "233"),
    ],
    run: (g) => diffieHellman(g("p"), g("g"), g("a"), g("b")),
  },
  {
    id: "ecc-point",
    name: "Elliptic curve cryptography",
    tagline: "Weierstrass curve y² ≡ x³ + ax + b (mod p), point addition and scalar k·P",
    trackId: "publickey",
    outputLabel: "Scalar Multiplication Result",
    fields: [
      num("a", "Curve parameter a", "2"),
      num("b", "Curve parameter b", "3"),
      num("p", "Prime p", "97"),
      num("px", "Base point P.x", "3"),
      num("py", "Base point P.y", "6"),
      num("k", "Private scalar k", "7", 1, 1000),
    ],
    run: (g) =>
      eccPointVisualizer(
        Number(g("a")),
        Number(g("b")),
        Number(g("p")),
        Number(g("px")),
        Number(g("py")),
        Number(g("k")),
      ),
  },
  {
    id: "tls-handshake",
    name: "TLS 1.3 Handshake trace",
    tagline: "Step-by-step packet inspection: ClientHello, KeyShare, CertVerify, Finished (1-RTT)",
    trackId: "publickey",
    outputLabel: "Handshake Transcript",
    fields: [
      {
        name: "cipher",
        label: "Cipher Suite",
        type: "select",
        default: "TLS_AES_256_GCM_SHA384",
        options: [
          { value: "TLS_AES_256_GCM_SHA384", label: "TLS_AES_256_GCM_SHA384" },
          { value: "TLS_CHACHA20_POLY1305_SHA256", label: "TLS_CHACHA20_POLY1305_SHA256" },
          { value: "TLS_AES_128_GCM_SHA256", label: "TLS_AES_128_GCM_SHA256" },
        ],
      },
    ],
    run: (g) => tlsHandshakeVisualizer(g("cipher")),
  },

  // --- Number Theory Track ---
  {
    id: "euclid-tableau",
    name: "Extended Euclid Bézout tableau",
    tagline: "Find gcd(a, b) and integer coefficients satisfying a·s + b·t = gcd(a, b)",
    trackId: "numbertheory",
    outputLabel: "Bézout Tableau & Solution",
    fields: [num("a", "First number a", "240"), num("b", "Second number b", "46")],
    run: (g) => extendedEuclidTableau(Number(g("a")), Number(g("b"))),
  },
  {
    id: "miller-rabin",
    name: "Miller–Rabin primality test",
    tagline: "Step-by-step witness evaluation testing n - 1 = 2^s · d",
    trackId: "numbertheory",
    outputLabel: "Primality Decision",
    fields: [num("n", "Candidate integer n", "561"), num("a", "Witness base a", "2")],
    run: (g) => millerRabinStepByStep(Number(g("n")), Number(g("a"))),
  },
  {
    id: "crt-multi",
    name: "Chinese Remainder (CRT) solver",
    tagline: "Solve systems of simultaneous congruences x ≡ a_i (mod m_i)",
    trackId: "numbertheory",
    outputLabel: "CRT Solution",
    fields: [
      text(
        "congruences",
        "System of Congruences",
        "2 mod 3, 3 mod 5, 2 mod 7",
        "text",
      ),
    ],
    run: (g) => crtMultiSolver(g("congruences")),
  },
  {
    id: "baby-step-giant-step",
    name: "Discrete log (Baby-step Giant-step)",
    tagline: "Solve g^x ≡ h (mod p) in O(√p) time using Shanks' algorithm",
    trackId: "numbertheory",
    outputLabel: "Discrete Logarithm",
    fields: [
      num("g", "Base generator g", "3"),
      num("h", "Target value h", "13"),
      num("p", "Prime modulus p", "17"),
    ],
    run: (g) => babyStepGiantStep(Number(g("g")), Number(g("h")), Number(g("p"))),
  },
  {
    id: "gcd",
    name: "Euclidean algorithm (GCD)",
    tagline: "Trace the greatest common divisor step by step",
    trackId: "numbertheory",
    outputLabel: "GCD Trace",
    fields: [num("a", "Number a", "1071"), num("b", "Number b", "462")],
    run: (g) => gcdTrace(Number(g("a")), Number(g("b"))),
  },
  {
    id: "extended-euclid",
    name: "Extended Euclidean algorithm",
    tagline: "Find Bézout coefficients: ax + by = gcd(a,b)",
    trackId: "numbertheory",
    outputLabel: "Coefficients",
    fields: [num("a", "a", "240"), num("b", "b", "46")],
    run: (g) => extendedEuclid(Number(g("a")), Number(g("b"))),
  },
  {
    id: "mod-inverse",
    name: "Modular multiplicative inverse",
    tagline: "Solve a·x ≡ 1 (mod m)",
    trackId: "numbertheory",
    outputLabel: "Modular Inverse",
    fields: [num("a", "Number a", "17"), num("m", "Modulus m", "3120")],
    run: (g) => modInverseTool(Number(g("a")), Number(g("m"))),
  },
  {
    id: "mod-pow",
    name: "Modular exponentiation",
    tagline: "Fast power-mod algorithm: b^e mod m",
    trackId: "numbertheory",
    outputLabel: "Result",
    fields: [num("b", "Base b", "7"), num("e", "Exponent e", "256"), num("m", "Modulus m", "13")],
    run: (g) => modPowTool(g("b"), g("e"), g("m")),
  },
  {
    id: "prime-test",
    name: "Primality test",
    tagline: "Check if n is prime and find its smallest factor",
    trackId: "numbertheory",
    outputLabel: "Primality",
    fields: [text("n", "Number", "104729")],
    run: (g) => primeTest(g("n")),
  },
  {
    id: "factorize",
    name: "Prime factorization",
    tagline: "Decompose n into its prime factors",
    trackId: "numbertheory",
    outputLabel: "Factors",
    fields: [text("n", "Number", "3233")],
    run: (g) => factorize(g("n")),
  },
  {
    id: "totient",
    name: "Euler's totient φ(n)",
    tagline: "Count integers coprime to n",
    trackId: "numbertheory",
    outputLabel: "Result",
    fields: [text("n", "Number", "3233")],
    run: (g) => totient(g("n")),
  },
  {
    id: "sieve",
    name: "Sieve of Eratosthenes",
    tagline: "All primes up to a given limit",
    trackId: "numbertheory",
    outputLabel: "Primes",
    fields: [num("limit", "Limit", "200", 2, 20000)],
    run: (g) => sieve(g("limit")),
  },
  {
    id: "primitive-roots",
    name: "Primitive roots",
    tagline: "Generators of the multiplicative group ℤ/pℤ*",
    trackId: "numbertheory",
    outputLabel: "Roots mod p",
    fields: [num("p", "Prime p", "23")],
    run: (g) => primitiveRoots(g("p")),
  },

  // --- Security Practice Track ---
  {
    id: "padding-oracle",
    name: "Padding oracle attack (CBC)",
    tagline: "Decrypt ciphertext byte-by-byte via PKCS#7 error leakage (Vaudenay 2002)",
    trackId: "security",
    outputLabel: "Attack Results",
    fields: [text("secret", "Target Word (1-8 chars)", "SECRET")],
    run: (g) => paddingOracleSimulator(g("secret")),
  },
  {
    id: "timing-attack",
    name: "Side-channel timing attack",
    tagline: "Compare early-exit string comparisons vs constant-time execution",
    trackId: "security",
    outputLabel: "Timing Comparison",
    fields: [
      text("candidate", "Attacker Guess", "SECXXXXX"),
      text("secret", "Actual Secret Password", "SECURITY"),
    ],
    run: (g) => timingAttackSimulator(g("candidate"), g("secret")),
  },
  {
    id: "zkp-schnorr",
    name: "Zero-Knowledge Proof (Schnorr)",
    tagline: "Peggy proves knowledge of x such that y = g^x (mod p) without revealing x",
    trackId: "security",
    outputLabel: "ZKP Verification",
    fields: [
      num("x", "Peggy's Secret x", "42"),
      num("challenge", "Victor's Challenge c", "7"),
    ],
    run: (g) => zkpSchnorrSimulator(Number(g("x")), Number(g("challenge"))),
  },
  {
    id: "password-entropy",
    name: "Password entropy & crack time",
    tagline: "Calculate bits of entropy and offline brute-force duration",
    trackId: "security",
    outputLabel: "Entropy Analysis",
    fields: [text("password", "Password", "Tr0ub4dor&3")],
    run: (g) => passwordEntropy(g("password")),
  },
  {
    id: "bifid",
    name: "Bifid & Polybius cipher",
    tagline: "Fractionation and transposition across a 5×5 Polybius grid (Delastelle 1901)",
    trackId: "classical",
    outputLabel: "Ciphertext / Plaintext",
    fields: [
      text("text", "Text", "DEFEND THE EAST WALL"),
      text("key", "5×5 Key Alphabet (25 letters)", "ABCDEFGHIKLMNOPQRSTUVWXYZ"),
      num("period", "Fractionation Period", "5", 1, 20),
      mode(),
    ],
    run: (g) => bifidCipher(g("text"), g("key"), Number(g("period")), g("mode") as any),
  },
  {
    id: "scytale",
    name: "Spartan Scytale transposition",
    tagline: "Ancient cylinder wrapping transposition (5th century BCE)",
    trackId: "classical",
    outputLabel: "Parchment Strip",
    fields: [
      text("text", "Secret Message", "SEND REINFORCEMENTS TO SPARTA"),
      num("diameter", "Rod Diameter (Rows)", "4", 2, 10),
      mode(),
    ],
    run: (g) => scytaleCipher(g("text"), Number(g("diameter")), g("mode") as any),
  },
  {
    id: "des-feistel",
    name: "DES Feistel round function",
    tagline: "32-bit expansion E, 8 S-Boxes (6→4 bits), and P-permutation",
    trackId: "symmetric",
    outputLabel: "Round Output",
    fields: [
      text("right", "32-bit Right Half (Hex)", "87878787"),
      text("subkey", "48-bit Round Subkey (Hex)", "1b02effc7072"),
    ],
    run: (g) => desRoundVisualizer(g("right"), g("subkey")),
  },
  {
    id: "chacha20",
    name: "ChaCha20 quarter-round (ARX)",
    tagline: "Addition modulo 2³², Rotation, and XOR without cache-timing leaks",
    trackId: "symmetric",
    outputLabel: "Updated Words",
    fields: [
      num("a", "Word a (Hex / Int)", "286331153"),
      num("b", "Word b (Hex / Int)", "16909060"),
      num("c", "Word c (Hex / Int)", "2609737539"),
      num("d", "Word d (Hex / Int)", "19088743"),
    ],
    run: (g) => chacha20QuarterRound(Number(g("a")), Number(g("b")), Number(g("c")), Number(g("d"))),
  },
  {
    id: "modular-group",
    name: "Modular group & ring explorer",
    tagline: "Analyze ℤ_n elements, units in ℤ_n*, zero divisors, and inverses",
    trackId: "numbertheory",
    outputLabel: "Group Structure Analysis",
    fields: [num("n", "Modulus n (2–50)", "12", 2, 50)],
    run: (g) => modularGroupLab(Number(g("n"))),
  },
  {
    id: "quadratic-residues",
    name: "Quadratic residues & Legendre symbol",
    tagline: "Euler's criterion a^((p-1)/2) mod p and square roots modulo p",
    trackId: "numbertheory",
    outputLabel: "Legendre Symbol & Roots",
    fields: [num("a", "Residue a", "5"), num("p", "Prime p", "19")],
    run: (g) => quadraticResiduesTool(Number(g("a")), Number(g("p"))),
  },
  {
    id: "replay-attack",
    name: "Replay attack & nonce defense",
    tagline: "Simulate wiretap replay attacks and freshness defenses (Nonces vs Timestamps)",
    trackId: "security",
    outputLabel: "Bank Server Decision",
    fields: [
      num("amount", "Transfer Amount ($)", "500"),
      {
        name: "nonce",
        label: "Include Cryptographic Nonce",
        type: "select",
        default: "yes",
        options: [
          { value: "yes", label: "Yes (Unique Nonce Cache)" },
          { value: "no", label: "No Nonce" },
        ],
      },
      {
        name: "timestamp",
        label: "Include Request Timestamp",
        type: "select",
        default: "yes",
        options: [
          { value: "yes", label: "Yes (60s Expiry Window)" },
          { value: "no", label: "No Timestamp" },
        ],
      },
      {
        name: "attack",
        label: "Eve Executes Replay",
        type: "select",
        default: "yes",
        options: [
          { value: "yes", label: "Yes (Replay Packet 5m Later)" },
          { value: "no", label: "No Replay (Normal Flow)" },
        ],
      },
    ],
    run: (g) =>
      replayAttackSimulator(
        Number(g("amount")),
        g("nonce") === "yes",
        g("timestamp") === "yes",
        g("attack") === "yes",
      ),
  },
  {
    id: "pqc-lwe-simulator",
    name: "Learning with Errors (LWE) Lab",
    tagline: "Simulate LWE & Module-LWE encryption, Gaussian noise perturbation, and threshold decryption",
    trackId: "postquantum",
    outputLabel: "LWE Decryption Result",
    fields: [
      num("dim", "Dimension (n)", "3"),
      num("modulus", "Modulus (q)", "97"),
      {
        name: "bit",
        label: "Message Bit to Encrypt (m)",
        type: "select",
        default: "1",
        options: [
          { value: "1", label: "Bit 1 (Encoded as ⌈q/2⌉)" },
          { value: "0", label: "Bit 0 (Encoded as 0)" },
        ],
      },
      num("noise", "Max Noise Bound (±e)", "2"),
    ],
    run: (g) =>
      latticeLweSimulator(
        g("dim"),
        g("modulus"),
        g("bit"),
        g("noise")
      ),
  },
  {
    id: "pqc-kyber-simulator",
    name: "ML-KEM / Kyber Key Encapsulation",
    tagline: "Step-by-step FIPS 203 Module-Lattice Key Encapsulation (ML-KEM-512/768/1024)",
    trackId: "postquantum",
    outputLabel: "ML-KEM Shared Secret Output",
    fields: [
      {
        name: "variant",
        label: "Security Level",
        type: "select",
        default: "768",
        options: [
          { value: "512", label: "ML-KEM-512 (NIST Level 1 - AES-128 equivalent)" },
          { value: "768", label: "ML-KEM-768 (NIST Level 3 - AES-192 / Recommended)" },
          { value: "1024", label: "ML-KEM-1024 (NIST Level 5 - AES-256 equivalent)" },
        ],
      },
      text("msg", "Entropy Seed Message", "SecretPayloadForTLS1.3"),
    ],
    run: (g) => mlKemKyberSimulator(g("variant"), g("msg")),
  },
  {
    id: "pqc-lamport-merkle",
    name: "Lamport OTS & Merkle Signatures",
    tagline: "Interactive One-Time Signatures (OTS) and binary Merkle authentication paths",
    trackId: "postquantum",
    outputLabel: "Lamport & Merkle Signature",
    fields: [
      text("msg", "Message String", "POST-QUANTUM"),
      num("bits", "Digest Bit Length", "16"),
    ],
    run: (g) => lamportMerkleSignSimulator(g("msg"), g("bits")),
  },
  {
    id: "pqc-threat-calculator",
    name: "Quantum Threat & Resource Estimator",
    tagline: "Evaluate Shor's & Grover's impact, required logical/physical qubits, and CNSA 2.0 deadlines",
    trackId: "postquantum",
    outputLabel: "Quantum Threat Evaluation",
    fields: [
      {
        name: "algo",
        label: "Cryptographic Algorithm",
        type: "select",
        default: "rsa-2048",
        options: [
          { value: "rsa-2048", label: "RSA-2048 (Classical Public Key)" },
          { value: "rsa-4096", label: "RSA-4096 (High-Security Classical)" },
          { value: "p-256", label: "ECC P-256 / Curve25519 (Elliptic Curves)" },
          { value: "aes-128", label: "AES-128 (Symmetric Block Cipher)" },
          { value: "aes-256", label: "AES-256 (Symmetric Block Cipher)" },
          { value: "sha-256", label: "SHA-256 (Cryptographic Hash)" },
          { value: "ml-kem", label: "ML-KEM-768 / Kyber (FIPS 203 Lattice KEM)" },
          { value: "ml-dsa", label: "ML-DSA-65 / Dilithium (FIPS 204 Signature)" },
          { value: "sphincs", label: "SLH-DSA-128 / SPHINCS+ (FIPS 205 Hash Signature)" },
        ],
      },
    ],
    run: (g) => quantumThreatCalculator(g("algo")),
  },
  {
    id: "pqc-mceliece",
    name: "Classic McEliece Code-Based Crypto",
    tagline: "Simulate Robert McEliece's 1978 Goppa code cryptosystem and syndrome decoding",
    trackId: "postquantum",
    outputLabel: "Code-Based Decoding Result",
    fields: [
      text("bits", "4-Bit Message Vector", "1011"),
    ],
    run: (g) => codeBasedMcElieceSimulator(g("bits")),
  },
  {
    id: "simplified-aes",
    name: "Simplified AES (Stallings Appendix D)",
    tagline: "16-bit educational AES with NibbleSub over GF(2⁴), ShiftRows, MixColumns, and Key Expansion",
    trackId: "postquantum",
    outputLabel: "S-AES Output (Hex)",
    fields: [
      text("input", "Plaintext / Ciphertext (4 Hex Digits)", "6F6B"),
      text("key", "Master Key (4 Hex Digits)", "A73B"),
      {
        name: "mode",
        label: "Operation",
        type: "select",
        default: "enc",
        options: [
          { value: "enc", label: "Encrypt (R0 -> R1 Sub/Shift/Mix -> R2 Sub/Shift)" },
          { value: "dec", label: "Decrypt (R2 InvSub/Shift -> R1 InvMix/Sub/Shift -> R0)" },
        ],
      },
    ],
    run: (g) => simplifiedAesEngine(g("input"), g("key"), g("mode")),
  },
  {
    id: "chinese-remainder",
    name: "Chinese Remainder Theorem Solver",
    tagline: "Solve systems of linear congruences with coprime moduli step-by-step",
    trackId: "numbertheory",
    outputLabel: "Unique Residue Solution",
    fields: [
      text("congruences", "System of Congruences (a mod m)", "2 mod 3, 3 mod 5, 2 mod 7"),
    ],
    run: (g) => chineseRemainderTheorem(g("congruences")),
  },
  {
    id: "fast-mod-exp",
    name: "Fast Modular Exponentiation (Repeated Squaring)",
    tagline: "Compute b^e mod m in O(log e) time with binary expansion and step table",
    trackId: "numbertheory",
    outputLabel: "Calculated Power mod m",
    fields: [
      text("base", "Base (b)", "7"),
      text("exp", "Exponent (e)", "560"),
      text("mod", "Modulus (m)", "561"),
    ],
    run: (g) => fastModExpTrace(g("base"), g("exp"), g("mod")),
  },
  {
    id: "format-inspector",
    name: "Universal Format & Entropy Inspector",
    tagline: "Instantly detect Hex, Base64, Binary, Decimal, Hashes, and calculate Shannon entropy",
    trackId: "encoding",
    outputLabel: "Detection & Entropy Summary",
    fields: [
      text("input", "Ciphertext, Hash, or Encoded String", "48656c6c6f20576f726c6421", "textarea"),
    ],
    run: (g) => {
      const res = inspectFormat(g("input"));
      const steps = [
        { label: "Detected Encoding", detail: `${res.typeLabel} (${res.badge}) — ${res.confidence} confidence` },
        { label: "Shannon Entropy", detail: `${res.entropy.bitsPerByte} bits/byte (${res.entropy.classification})` },
      ];
      if (res.hashCandidate) {
        steps.push({ label: "Hash Identification", detail: `${res.hashCandidate.name} — ${res.hashCandidate.security}` });
      }
      for (const d of res.details) {
        steps.push({ label: d.label, detail: d.value });
      }
      if (res.representations.ascii) {
        steps.push({ label: "Decoded ASCII/UTF-8", detail: res.representations.ascii });
      }
      if (res.representations.hex) {
        steps.push({ label: "Hexadecimal (Base16)", detail: res.representations.hex });
      }
      if (res.representations.base64) {
        steps.push({ label: "Base64 (RFC 4648)", detail: res.representations.base64 });
      }
      return {
        output: `${res.typeLabel} (${res.badge}) | Shannon Entropy: ${res.entropy.bitsPerByte} bits/byte`,
        steps,
        note: `${res.description} Entropy context: ${res.entropy.description}`,
      };
    },
  },
  {
    id: "shamir-secret-sharing",
    name: "Shamir's Secret Sharing (Threshold Cryptosystem)",
    tagline: "Adi Shamir (k, n) threshold polynomial secret sharing over GF(257) with Lagrange interpolation",
    trackId: "security",
    outputLabel: "Reconstructed Secret & Lagrange Math",
    fields: [
      num("secret", "Secret Value S (0–255)", "42", 0, 255),
      num("threshold", "Threshold (k)", "3", 2, 6),
      num("total", "Total Shares (n)", "5", 2, 8),
    ],
    run: (g) => {
      const s = Number(g("secret")) || 42;
      const k = Number(g("threshold")) || 3;
      const n = Number(g("total")) || 5;
      const setup = generateShamirSetup(s, k, n);
      const usedShares = setup.shares.slice(0, k);
      const recon = lagrangeInterpolateSecret(usedShares, setup.prime);
      return {
        output: `Secret S = ${recon.secret} (Original: ${setup.secret})\nThreshold: ${k} of ${n} shares required\nPolynomial: f(x) = ${setup.coefficients.map((c, i) => `${c}${i > 0 ? `·x^${i}` : ""}`).join(" + ")} (mod ${setup.prime})`,
        steps: recon.steps.map((step, idx) => ({
          label: `Lagrange Step ${idx + 1}`,
          detail: step,
        })),
        note: "Adi Shamir (1979). Perfect secrecy holds: any k-1 shares provide zero information about the secret, because every possible secret in GF(p) is equally probable under the family of valid degree-k polynomials.",
      };
    },
  },
  {
    id: "merkle-tree",
    name: "Merkle Tree & Blockchain SPV Verifier",
    tagline: "Ralph Merkle binary hash tree with O(log₂ N) SPV audit proofs",
    trackId: "hashing",
    outputLabel: "Merkle Root & Proof Path",
    fields: [
      text("leaves", "Transactions / Leaves (comma or newline separated)", "Tx 0: Alice -> Bob (5 BTC)\nTx 1: Bob -> Carol (2.5 BTC)\nTx 2: Dave -> Eve (1.1 BTC)\nTx 3: Satoshi -> Hal (50 BTC)", "textarea"),
      num("verifyLeafIndex", "Target Leaf Index to Verify (0-based)", "0", 0, 7),
    ],
    run: (g) => merkleTreeTool(g("leaves"), Number(g("verifyLeafIndex")) || 0),
  },
  {
    id: "tls-handshake",
    name: "TLS 1.3 Handshake & HKDF Key Schedule",
    tagline: "Inspect RFC 8446 1-RTT handshake, HKDF key derivation, and AEAD tampering",
    trackId: "publickey",
    outputLabel: "TLS 1.3 Handshake Summary",
    fields: [
      text("cipher", "Cipher Suite", "TLS_AES_128_GCM_SHA256"),
    ],
    run: (g) => tlsHandshakeVisualizer(g("cipher")),
  },
  {
    id: "zkp-schnorr",
    name: "Schnorr Zero-Knowledge Proof (ZKP)",
    tagline: "3-move identification protocol (Commitment -> Challenge -> Response) over cyclic groups",
    trackId: "security",
    outputLabel: "Verification Equation & Proof Status",
    fields: [
      num("secretX", "Prover Secret Key (x)", "5", 1, 21),
      num("challengeE", "Verifier Challenge (c)", "4", 1, 21),
    ],
    run: (g) => zkpSchnorrSimulator(Number(g("secretX")) || 5, Number(g("challengeE")) || 4),
  },
  {
    id: "padding-oracle",
    name: "CBC Padding Oracle Attack Simulator",
    tagline: "Serge Vaudenay's attack decrypting CBC ciphertexts byte-by-byte via padding error leakage",
    trackId: "security",
    outputLabel: "Decrypted Plaintext Byte & Oracle Queries",
    fields: [
      text("secretWord", "Secret Word in Target Block (Max 8 Chars)", "CRYPTO"),
    ],
    run: (g) => paddingOracleSimulator(g("secretWord")),
  },
];

export const toolsById = new Map(tools.map((t) => [t.id, t]));
export const getTool = (id: string) => toolsById.get(id);
export const toolsForTrack = (trackId: string) => tools.filter((t) => t.trackId === trackId);
