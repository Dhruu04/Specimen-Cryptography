import { toolsById } from "../src/lib/tools";

async function testRoundtrips() {
  console.log("=== Testing Conversions and Roundtrips across all modules ===\n");

  const tests: Array<{
    name: string;
    toolId: string;
    encryptInputs: Record<string, string>;
    decryptInputs: (cipherOut: string) => Record<string, string>;
    expected: (plain: string, decrypted: string) => boolean;
  }> = [
    {
      name: "Caesar Cipher (shift=3)",
      toolId: "caesar",
      encryptInputs: { text: "THE QUICK BROWN FOX", shift: "3", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, shift: "3", mode: "decrypt" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Rot13 Cipher",
      toolId: "rot13",
      encryptInputs: { text: "HELLO WORLD" },
      decryptInputs: (c) => ({ text: c }),
      expected: (p, d) => d === p,
    },
    {
      name: "Atbash Cipher",
      toolId: "atbash",
      encryptInputs: { text: "SECURITY" },
      decryptInputs: (c) => ({ text: c }),
      expected: (p, d) => d === p,
    },
    {
      name: "Affine Cipher (a=5, b=8)",
      toolId: "affine",
      encryptInputs: { text: "AFFINE CIPHER", a: "5", b: "8", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, a: "5", b: "8", mode: "decrypt" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Vigenère Cipher (key=LEMON)",
      toolId: "vigenere",
      encryptInputs: { text: "ATTACK AT DAWN", key: "LEMON", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, key: "LEMON", mode: "decrypt" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Autokey Cipher (primer=QUEEN)",
      toolId: "autokey",
      encryptInputs: { text: "MEET AT MIDNIGHT", primer: "QUEEN", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, primer: "QUEEN", mode: "decrypt" }),
      expected: (p, d) => d === p.replace(/[^A-Z]/g, ""),
    },
    {
      name: "Playfair Cipher (key=MONARCHY)",
      toolId: "playfair",
      encryptInputs: { text: "INSTRUMENTS", key: "MONARCHY", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, key: "MONARCHY", mode: "decrypt" }),
      expected: (p, d) => d.replace(/\s+/g, "").startsWith("INSTRUMENTS".replace(/J/g, "I")),
    },
    {
      name: "Rail Fence Cipher (rails=3)",
      toolId: "rail-fence",
      encryptInputs: { text: "WE ARE DISCOVERED FLEE AT ONCE", rails: "3", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, rails: "3", mode: "decrypt" }),
      expected: (p, d) => d === p.replace(/\s+/g, ""),
    },
    {
      name: "Columnar Cipher (key=GERMAN)",
      toolId: "columnar",
      encryptInputs: { text: "DEFEND THE EAST WALL OF THE CASTLE", key: "GERMAN", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, key: "GERMAN", mode: "decrypt" }),
      expected: (p, d) => d === p.replace(/\s+/g, "").toUpperCase(),
    },
    {
      name: "Morse Code",
      toolId: "morse",
      encryptInputs: { text: "SOS MAYDAY", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d.toUpperCase() === p.toUpperCase(),
    },
    {
      name: "XOR Cipher (key=SECRET)",
      toolId: "xor-cipher",
      encryptInputs: { text: "HELLO CRYPTO WORLD", key: "SECRET", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, key: "SECRET", mode: "decrypt" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Base64 Encoding",
      toolId: "base64",
      encryptInputs: { text: "Hello Cryptographic World!", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Base58 Encoding",
      toolId: "base58",
      encryptInputs: { text: "Hello Cryptography", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Base32 Encoding",
      toolId: "base32",
      encryptInputs: { text: "The quick brown fox", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Hex Encoding",
      toolId: "hex",
      encryptInputs: { text: "Confidential payload 0x42", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Binary Encoding",
      toolId: "binary",
      encryptInputs: { text: "Bits and bytes", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Decimal ASCII Encoding",
      toolId: "decimal",
      encryptInputs: { text: "ASCII 123", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d === p,
    },
    {
      name: "URL Encoding",
      toolId: "url",
      encryptInputs: { text: "https://example.com/search?q=crypto & privacy=100%", mode: "encode" },
      decryptInputs: (c) => ({ text: c, mode: "decode" }),
      expected: (p, d) => d === p,
    },
    {
      name: "One-Time Pad (key=QAZWSXEDCRFVTGBYHN)",
      toolId: "otp",
      encryptInputs: { text: "TOPSECRETINFORMATION", key: "QAZWSXEDCRFVTGBYHN", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, key: "QAZWSXEDCRFVTGBYHN", mode: "decrypt" }),
      expected: (p, d) => d === p.toUpperCase(),
    },
    {
      name: "Hill Cipher 2x2",
      toolId: "hill-cipher",
      encryptInputs: { text: "HELP", k00: "3", k01: "3", k10: "2", k11: "5", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, k00: "3", k01: "3", k10: "2", k11: "5", mode: "decrypt" }),
      expected: (p, d) => d === p.toUpperCase(),
    },
    {
      name: "AES-GCM Authenticated Encryption",
      toolId: "aes",
      encryptInputs: { text: "Secret banking record #99281", pass: "StrongP@ssw0rd2024!", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, pass: "StrongP@ssw0rd2024!", mode: "decrypt" }),
      expected: (p, d) => d === p,
    },
    {
      name: "Bifid Cipher (Polybius square)",
      toolId: "bifid",
      encryptInputs: { text: "DEFENDTHEEAST", key: "ENIGMA", period: "5", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, key: "ENIGMA", period: "5", mode: "decrypt" }),
      expected: (p, d) => d === p.toUpperCase().replace(/J/g, "I"),
    },
    {
      name: "Scytale Transposition (diameter=4)",
      toolId: "scytale",
      encryptInputs: { text: "IAMHURTVERYBADLY", diameter: "4", mode: "encrypt" },
      decryptInputs: (c) => ({ text: c, diameter: "4", mode: "decrypt" }),
      expected: (p, d) => d === p.toUpperCase(),
    },
  ];

  let passCount = 0;
  let failCount = 0;

  for (const t of tests) {
    const tool = toolsById.get(t.toolId);
    if (!tool) {
      console.error(`❌ Tool not found: ${t.toolId}`);
      failCount++;
      continue;
    }

    try {
      // Step 1: Encrypt/Encode
      const encRes = await tool.run((k) => t.encryptInputs[k] ?? "");
      if (encRes.error) {
        console.error(`❌ [${t.name}] Encrypt failed with error:`, encRes.error);
        failCount++;
        continue;
      }
      const cipherText = encRes.output;

      // Step 2: Decrypt/Decode
      const decMap = t.decryptInputs(cipherText);
      const decRes = await tool.run((k) => decMap[k] ?? "");
      if (decRes.error) {
        console.error(`❌ [${t.name}] Decrypt failed with error:`, decRes.error);
        failCount++;
        continue;
      }
      const decryptedText = decRes.output;

      const plain = t.encryptInputs.text;
      if (t.expected(plain, decryptedText)) {
        console.log(`✅ [${t.name}] Roundtrip passed! (Cipher: "${cipherText.slice(0, 30)}..." -> Decrypted: "${decryptedText.slice(0, 30)}")`);
        passCount++;
      } else {
        console.error(`❌ [${t.name}] Roundtrip mismatch! Expected "${plain}", got "${decryptedText}" (Cipher: "${cipherText}")`);
        failCount++;
      }
    } catch (e: any) {
      console.error(`💥 [${t.name}] Threw exception:`, e?.message || e);
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Roundtrips: Total: ${tests.length} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log(`========================================\n`);
}

testRoundtrips().catch(console.error);
