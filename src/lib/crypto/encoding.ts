import type { TraceStep } from "./types";

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toBytes(text: string) {
  return enc.encode(text);
}

export function bytesToHex(bytes: Uint8Array, spaced = true) {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return spaced ? hex.join(" ") : hex.join("");
}

export function hexToBytes(hex: string) {
  const clean = hex.trim().replace(/^0x/i, "").replace(/[^0-9a-f]/gi, "");
  if (clean.length % 2) throw new Error("Hex needs an even number of digits.");
  return new Uint8Array((clean.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)));
}

export function bytesToBase64(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64ToBytes(b64: string) {
  const bin = atob(b64.trim().replace(/\s+/g, ""));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function textToBase64(text: string) {
  const bytes = toBytes(text);
  const steps: TraceStep[] = Array.from(bytes)
    .slice(0, 6)
    .map((b) => ({
      label: `${JSON.stringify(dec.decode(new Uint8Array([b])))} → ${b}`,
      detail: b.toString(2).padStart(8, "0"),
    }));
  return {
    output: bytesToBase64(bytes),
    steps,
    note: "Bytes are regrouped into 6-bit chunks; each chunk indexes the 64-character alphabet A–Z a–z 0–9 + /. '=' pads the final group.",
  };
}

export function base64ToText(b64: string) {
  try {
    return { output: dec.decode(base64ToBytes(b64)) };
  } catch {
    return { output: "", error: "That is not valid Base64." };
  }
}

export function textToHex(text: string) {
  return { output: bytesToHex(toBytes(text)), note: "Two hex digits per byte (base 16)." };
}

export function hexToText(hex: string) {
  try {
    return { output: dec.decode(hexToBytes(hex)) };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

export function textToBinary(text: string) {
  return {
    output: Array.from(toBytes(text), (b) => b.toString(2).padStart(8, "0")).join(" "),
    note: "UTF-8 bytes written as 8 bits each.",
  };
}

export function binaryToText(bin: string) {
  const groups = bin.trim().split(/\s+/).filter(Boolean);
  if (groups.some((g) => !/^[01]{1,8}$/.test(g)))
    return { output: "", error: "Use groups of 0s and 1s separated by spaces." };
  return { output: dec.decode(new Uint8Array(groups.map((g) => parseInt(g, 2)))) };
}

export function textToDecimal(text: string) {
  return { output: Array.from(toBytes(text), (b) => String(b)).join(" ") };
}

export function decimalToText(input: string) {
  const nums = input.trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if (nums.some((n) => Number.isNaN(n) || n < 0 || n > 255))
    return { output: "", error: "Use byte values between 0 and 255." };
  return { output: dec.decode(new Uint8Array(nums)) };
}

export function urlEncode(text: string) {
  return { output: encodeURIComponent(text), note: "Reserved characters become %XX using their UTF-8 bytes." };
}

export function urlDecode(text: string) {
  try {
    return { output: decodeURIComponent(text) };
  } catch {
    return { output: "", error: "Malformed percent-encoding." };
  }
}

export function baseConvert(value: string, from: number, to: number) {
  const clean = value.trim().replace(/\s+/g, "");
  if (!clean) return { output: "" };
  const n = parseInt(clean, from);
  if (Number.isNaN(n)) return { output: "", error: `"${clean}" is not a valid base-${from} number.` };
  return {
    output: n.toString(to).toUpperCase(),
    note: `Decimal value: ${n}`,
  };
}

// Base58 (Bitcoin Alphabet: 1-9, A-H, J-N, P-Z, a-k, m-z)
const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function textToBase58(text: string) {
  const bytes = toBytes(text);
  if (bytes.length === 0) return { output: "" };

  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;

  // Convert bytes to BigInt
  let num = 0n;
  for (const b of bytes) {
    num = (num << 8n) + BigInt(b);
  }

  const result: string[] = [];
  while (num > 0n) {
    const rem = Number(num % 58n);
    num = num / 58n;
    result.unshift(B58_ALPHABET[rem]!);
  }

  for (let i = 0; i < zeros; i++) result.unshift("1");

  return {
    output: result.join(""),
    note: "Base58 was created by Satoshi Nakamoto for Bitcoin addresses. It omits visually ambiguous characters (0, O, I, l) to eliminate human transcription errors.",
  };
}

export function base58ToText(b58: string) {
  const clean = b58.trim();
  if (!clean) return { output: "" };

  let num = 0n;
  for (const ch of clean) {
    const idx = B58_ALPHABET.indexOf(ch);
    if (idx === -1) return { output: "", error: `Invalid Base58 character '${ch}'.` };
    num = num * 58n + BigInt(idx);
  }

  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn));
    num = num >> 8n;
  }

  let leadingOnes = 0;
  while (leadingOnes < clean.length && clean[leadingOnes] === "1") {
    bytes.unshift(0);
    leadingOnes++;
  }

  try {
    return {
      output: dec.decode(new Uint8Array(bytes)),
      note: "Decoded from Base58 alphanumeric string back to original UTF-8 text.",
    };
  } catch {
    return {
      output: bytesToHex(new Uint8Array(bytes)),
      note: "Decoded from Base58 as binary data (hex formatted).",
    };
  }
}

// Base32 (RFC 4648: A-Z, 2-7)
const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function textToBase32(text: string) {
  const bytes = toBytes(text);
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += B32_ALPHABET[(value << (5 - bits)) & 31];
  }

  while (output.length % 8 !== 0) {
    output += "=";
  }

  return {
    output,
    note: "Base32 is case-insensitive and used standardly in TOTP/HOTP 2-factor authentication secrets (Google Authenticator, Authy).",
  };
}

export function base32ToText(b32: string) {
  const clean = b32.trim().toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  if (!clean) return { output: "" };

  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const ch of clean) {
    const val = B32_ALPHABET.indexOf(ch);
    if (val === -1) return { output: "", error: `Invalid Base32 character '${ch}'.` };
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  try {
    return {
      output: dec.decode(new Uint8Array(bytes)),
      note: "Decoded from RFC 4648 Base32 back to original UTF-8 text.",
    };
  } catch {
    return {
      output: bytesToHex(new Uint8Array(bytes)),
      note: "Decoded from Base32 as binary data (hex formatted).",
    };
  }
}

// Endianness Converter (Big-Endian vs Little-Endian)
export function endiannessConverter(hexInput: string) {
  const clean = hexInput.trim().replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "");
  if (clean.length === 0 || clean.length % 2 !== 0) {
    return { output: "", error: "Provide an even number of hex digits (e.g. 01020304)." };
  }

  const bytes: string[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(clean.slice(i, i + 2).toUpperCase());
  }

  const bigEndian = [...bytes];
  const littleEndian = [...bytes].reverse();

  return {
    output: `Original Bytes:  ${bytes.join(" ")}\n\nBig-Endian:      ${bigEndian.join(" ")} (Most significant byte first - Network Byte Order)\nLittle-Endian:   ${littleEndian.join(" ")} (Least significant byte first - x86/ARM memory order)`,
    steps: [
      {
        label: "Big-Endian (Network Byte Order, TCP/IP, Cryptographic Moduli)",
        detail: `Higher memory addresses hold less significant bytes: [${bigEndian.join(", ")}]`,
      },
      {
        label: "Little-Endian (Intel x86, AMD64, ARM processors)",
        detail: `Lower memory addresses hold less significant bytes: [${littleEndian.join(", ")}]`,
      },
    ],
    note: "Endianness issues cause frequent cryptographic bugs when converting between raw memory byte arrays and big-integer mathematical representations.",
  };
}
