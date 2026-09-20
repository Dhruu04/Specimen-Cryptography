import type { Lesson } from "./types";

export const encodingLessons: Lesson[] = [
  {
    id: "encoding-vs-encryption",
    trackId: "encoding",
    title: "Encoding is not encryption",
    subtitle: "Representation, compression, hashing and encryption compared",
    formula: {
      expr: "Encoding: Data ↔ Format (No Key) | Encryption: P + Key ↔ C (Confidential)",
      badge: "Fundamental Rule",
      note: "Encoding transforms data representation for transport; encryption guarantees confidentiality with a secret key; hashing creates an irreversible fixed-size integrity fingerprint.",
    },
    body: [
      "The single most common and dangerous misconception in software engineering is conflating encoding with encryption. An encoding is a deterministic, keyless transformation of data representation designed purely for transport compatibility and data interoperability. Base64, Hexadecimal (Base16), ASCII, UTF-8, and URL-percent encoding are public algorithms whose specifications are freely available to the entire world. Anyone possessing an encoded string can reverse it in microseconds without permission, authentication, or passwords.",
      "In contrast, encryption is mathematically parameterized by a secret key. A secure cipher (such as AES-256 or ChaCha20) ensures that an adversary without the key cannot distinguish the resulting ciphertext from pure, uniform random noise (Indistinguishability under Chosen-Plaintext Attack, or IND-CPA). Without the secret key, recovering the underlying message requires brute-forcing through astronomical key spaces (such as 2²⁵⁶ possibilities, which exceeds the number of atoms in the observable universe).",
      "Hashing and compression represent two additional distinct categories: Hashing is an irreversible, keyless mathematical compression function that produces a fixed-size digest (e.g., SHA-256 always outputs 32 bytes regardless of whether the input is one letter or a 10-gigabyte database). It is designed to verify data integrity, not hide content. Compression (like gzip or zstandard) removes statistical redundancies to minimize byte size and is fully reversible without a key.",
      "Real-world security incidents frequently stem from developers believing that encoding provides defense-in-depth: 'We store credit card numbers as Base64 in our database so the DBA cannot read them' or 'The API token is securely encrypted using Hex.' In reality, these tokens are stored in absolute plaintext—every database tool and script decodes them instantly. Never rely on an encoding layer to protect sensitive data.",
    ],
    keyPoints: [
      "Encoding: Completely keyless, 100% public, reversible by anyone in microseconds; strictly for data transport.",
      "Encryption: Keyed mathematical transformation; provably infeasible to decrypt without the secret key.",
      "Hashing: One-way, irreversible, fixed-size mathematical digest; used for integrity checks and password verification.",
      "Compression: Keyless, bidirectional data shrinkage exploiting statistical redundancies.",
      "Golden Rule: Never store passwords, personal records, or secret credentials using Base64, Hex, or rot13.",
    ],
    pitfalls: [
      "Storing sensitive credentials, tokens, or PII using Base64 or Hex under the false belief that it satisfies data-at-rest encryption compliance.",
      "Treating client-side encoding or obfuscation layers as a security boundary against authenticated users or reverse engineers.",
      "Using reversible encodings instead of salted cryptographic hashes (Argon2id, bcrypt, PBKDF2) for password storage.",
    ],
    workedExample: {
      title: "Contrasting Base64 Encoding vs AES-256-GCM Encryption",
      steps: [
        { label: "1. Secret Input", detail: "Database stores sensitive master API key: 'sk_live_99887766554433221100'." },
        { label: "2. The Flawed 'Encoding' Path", detail: "Developer encodes token using Base64: 'c2tfbGl2ZV85OTg4Nzc2NjU1NDQzMzIyMTEwMA=='. An attacker executing SQL injection runs `atob()` or `base64 -d` and recovers the secret in 0.001 ms without any key!" },
        { label: "3. The Proper 'Encryption' Path", detail: "System encrypts token using AES-256-GCM with a secret key derived from a KMS: Ciphertext: '0e8a71...4f' + 96-bit IV + 128-bit Tag. Without the KMS key, deciphering the string is computationally impossible even with all current global computing power." },
      ],
      outcome: "Encodings format data for communication pipes; encryption alone provides cryptographic confidentiality.",
    },
    references: [
      {
        title: "RFC 4648: The Base16, Base32, and Base64 Data Encodings",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc4648.txt",
        description: "The authoritative internet standard defining Base64, Base32, and Base16 data representations.",
        type: "standard",
      },
      {
        title: "OWASP: Cryptographic Storage Cheat Sheet",
        source: "OWASP Foundation",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html",
        description: "Official industry guidance detailing the boundary between proper encryption and naive encodings.",
        type: "tutorial",
      },
    ],
    toolId: "base64",
    glossary: [
      { term: "Encoding", def: "A public, deterministic transformation of data representation without a secret key." },
      { term: "Encryption", def: "A mathematical transformation parameterized by a secret key that guarantees confidentiality." },
      { term: "Hashing", def: "A one-way mathematical function mapping variable-length data to a fixed-size irreversible digest." },
    ],
  },
  {
    id: "bits-and-bytes",
    trackId: "encoding",
    title: "Bits, bytes and character sets",
    subtitle: "What a cipher actually operates on",
    formula: {
      expr: "1 Byte = 8 Bits = 2 Hex Digits ∈ [0, 255] (0x00 to 0xFF)",
      badge: "Octet Standard",
      note: "Modern ciphers operate on raw byte arrays (octets). Plaintext text must be explicitly encoded (typically via UTF-8) before cryptographic operations.",
    },
    body: [
      "Modern cryptographic primitives do not understand human language, letters, words, or typography: they operate strictly on finite sequences of bytes (8-bit octets) and binary words (16-bit, 32-bit, or 64-bit unsigned integers). Before any encryption algorithm like AES or hashing algorithm like SHA-256 can process a human string like 'Attack at dawn!', that string must first be converted into a deterministic sequence of bytes according to an explicit character encoding standard.",
      "The ASCII standard (American Standard Code for Information Interchange, 1963) defines 128 characters (code points 0 to 127) using 7 bits. It accounts for the standard English alphabet, numerical digits 0–9, basic punctuation, and control codes (like newline `\\n` and carriage return `\\r`). However, ASCII cannot represent accented European characters, Arabic, Cyrillic, Hebrew, Asian scripts, or modern emojis.",
      "UTF-8 is the universal, variable-width Unicode standard that powers the modern internet: standard ASCII characters consume exactly 1 byte (0x00 to 0x7F, maintaining 100% backward compatibility); European accented letters like 'é' consume 2 bytes; East Asian Han characters consume 3 bytes; and complex emojis consume 4 bytes. If two communicating systems assume different character encodings (e.g., Windows-1252 vs. UTF-8), calculating the SHA-256 hash of the exact same visual sentence produces completely different cryptographic digests.",
      "Entropy and Human Passwords: A critical security principle is that a 16-character human password does not possess 128 bits of cryptographic entropy. Because human passwords draw from a tiny subset of printable characters with predictable linguistic rules (vowels following consonants, common dictionary roots), their true Shannon entropy is often only 25 to 35 bits. True cryptographic keys must always be generated from cryptographically secure pseudorandom number generators (CSPRNG), not user strings.",
    ],
    keyPoints: [
      "Cryptographic primitives operate strictly on byte arrays, never native high-level string objects.",
      "Always explicitly specify UTF-8 serialization before hashing, signing, or encrypting textual data.",
      "Character count does not equal byte count: in UTF-8, characters consume between 1 and 4 bytes.",
      "Human password characters have low entropy; true keys must be generated via CSPRNG or derived via Argon2/PBKDF2.",
    ],
    pitfalls: [
      "Relying on platform-default string encodings (e.g. Windows-1252 vs UTF-8), causing cryptographic hashes of the same string to diverge across servers.",
      "Assuming that `string.length == 16` provides 128 bits of cryptographic key security.",
      "Treating binary byte streams as strings and passing them through functions like JavaScript's `String.fromCharCode()`, which can silently mangle non-ASCII byte sequences.",
    ],
    workedExample: {
      title: "UTF-8 Multi-Byte Breakdown for 'Crypto €'",
      steps: [
        { label: "1. ASCII Characters", detail: "'C' (0x43), 'r' (0x72), 'y' (0x79), 'p' (0x70), 't' (0x74), 'o' (0x6F), ' ' (0x20) — exactly 1 byte each." },
        { label: "2. Unicode Multi-Byte Character", detail: "Euro symbol '€' (Unicode code point U+20AC) requires 3 bytes in UTF-8: [0xE2, 0x82, 0xAC]." },
        { label: "3. Binary Stream Inspection", detail: "0xE2 = 11100010, 0x82 = 10000010, 0xAC = 10101100. The leading '1110' prefix indicates a 3-byte sequence; each following byte begins with '10' continuation bits." },
        { label: "4. Total Memory Footprint", detail: "Total string length: 8 characters, but exactly 10 bytes in physical memory: [43, 72, 79, 70, 74, 6F, 20, E2, 82, AC]." },
      ],
      outcome: "Proves conclusively why string character length != memory byte length in modern software.",
    },
    references: [
      {
        title: "The Unicode Standard: Character Encoding Architecture",
        source: "Unicode Consortium",
        url: "https://www.unicode.org/standard/standard.html",
        description: "The international standard defining Unicode code points, UTF-8, and binary character encodings.",
        type: "standard",
      },
      {
        title: "RFC 3629: UTF-8, a Transformation Format of ISO 10646",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc3629.txt",
        description: "Official RFC standard specifying UTF-8 serialization rules and bit prefixes.",
        type: "standard",
      },
    ],
    toolId: "binary",
    glossary: [
      { term: "Octet", def: "An unambiguous term for an 8-bit byte." },
      { term: "Code Point", def: "A unique numerical identifier assigned to a character in the Unicode standard." },
      { term: "UTF-8", def: "A variable-width character encoding capable of encoding all 1,114,112 valid character code points in Unicode." },
    ],
  },
  {
    id: "base64-detail",
    trackId: "encoding",
    title: "How Base64 works",
    subtitle: "Three bytes become four printable characters",
    formula: {
      expr: "3 Bytes (24 bits) → 4 × 6-bit chunks → 4 Characters ∈ [A-Za-z0-9+/]",
      badge: "+33.3% Overhead",
      note: "Every 6-bit chunk (values 0–63) indexes a 64-character table. '=' characters are appended as padding when the input byte length is not a multiple of 3.",
    },
    body: [
      "Base64 was developed in the 1980s for MIME (Multipurpose Internet Mail Extensions) protocols because early email relays and gateways were designed strictly for 7-bit ASCII printable text. Passing raw 8-bit binary data (like compiled binaries, images, or private keys) through legacy SMTP servers resulted in dropped high bits, stripped null bytes (0x00), or corrupted control characters. Base64 solved this problem permanently by translating arbitrary binary data into a safe 64-character subset of printable ASCII.",
      "The Mathematical Mapping: The algorithm groups raw input bytes into sets of 3 consecutive bytes (3 × 8 = 24 bits). These 24 bits are then sliced into 4 chunks of 6 bits each (4 × 6 = 24 bits). Each 6-bit chunk represents an integer value between 0 and 63 (since 2⁶ = 64). This value serves as an index into the standard Base64 lookup table: index 0–25 map to 'A'–'Z', 26–51 map to 'a'–'z', 52–61 map to '0'–'9', 62 maps to '+', and 63 maps to '/'.",
      "Because 3 raw bytes always expand into 4 printable ASCII characters, Base64 introduces an exact 33.3% data expansion overhead. A 3-megabyte JPEG image will occupy 4 megabytes when serialized in Base64.",
      "The Purpose and Mechanics of Padding ('='): When the input byte length is not an exact multiple of 3, padding rules apply: 1) If 1 byte remains (8 bits), 4 zero bits are appended to create two 6-bit chunks, producing two Base64 characters followed by two '=' padding characters ('=='); 2) If 2 bytes remain (16 bits), 2 zero bits are appended to create three 6-bit chunks, producing three Base64 characters followed by one '=' padding character ('='). The trailing '=' characters inform the decoder exactly how many padding zero bits to discard.",
    ],
    keyPoints: [
      "Converts 3 raw bytes (24 bits) into 4 printable ASCII characters (4 × 6 bits).",
      "Always introduces an exact 33.3% size overhead.",
      "Trailing '=' characters signal byte alignment: '==' means 1 input byte remained; '=' means 2 input bytes remained.",
      "URL-Safe Base64 (RFC 4648 §5) replaces '+' with '-' and '/' with '_' to prevent URL routing failures.",
    ],
    pitfalls: [
      "Placing standard Base64 in URL query parameters without escaping: '+' is parsed as a space character by web servers, permanently corrupting the decoded data.",
      "Assuming Base64 provides confidentiality: automated crawlers and vulnerability scanners detect and decode Base64 strings immediately.",
    ],
    workedExample: {
      title: "Encoding 'Man' into Base64 Step-by-Step",
      steps: [
        { label: "1. ASCII to Binary Bytes", detail: "'M' = 77 (01001101₂), 'a' = 97 (01100001₂), 'n' = 110 (01101110₂)." },
        { label: "2. Form 24-Bit Bitstream", detail: "Concatenate bits: 01001101 01100001 01101110." },
        { label: "3. Regroup into 4 × 6-Bit Chunks", detail: "Chunk 1: 010011 (value 19) → 'T'. Chunk 2: 010110 (value 22) → 'W'. Chunk 3: 000101 (value 5) → 'F'. Chunk 4: 101110 (value 46) → 'u'." },
        { label: "4. Assemble Output String", detail: "'Man' encodes cleanly to 'TWFu' (no padding '=' needed since 3 bytes divided evenly)." },
      ],
      outcome: "Plaintext 'Man' (3 bytes) becomes Base64 string 'TWFu' (4 bytes).",
    },
    references: [
      {
        title: "RFC 4648: Base64 Data Encoding Standard",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc4648.txt",
        description: "Official specification detailing Base64 and URL-Safe Base64 with padding specifications.",
        type: "standard",
      },
    ],
    toolId: "base64",
    glossary: [
      { term: "Base64", def: "A binary-to-text encoding scheme that represents binary data in an ASCII string format by translating it into a radix-64 representation." },
      { term: "URL-Safe Base64", def: "A Base64 variant replacing '+' with '-' and '/' with '_' to prevent conflicts in URL parameters and HTTP headers." },
    ],
  },
  {
    id: "hex-and-bases",
    trackId: "encoding",
    title: "Hexadecimal and other bases",
    subtitle: "Reading numbers the way machines store them",
    formula: {
      expr: "Value = Σ (dᵢ · 16ⁱ)  |  1 Hex Digit = 4 Bits (Nibble) ∈ [0-9, A-F]",
      badge: "Base 16 Standard",
      note: "Base 16 is universally favored in computer systems because 2 hex digits represent exactly 1 byte (8 bits) from 0x00 to 0xFF.",
    },
    body: [
      "Hexadecimal (base 16) is the lingua franca of low-level systems programming, reverse engineering, digital forensics, and modern cryptography. Because 16 is an exact power of two (16 = 2⁴), each hexadecimal digit ('0' through '9' and 'A' through 'F') maps directly and precisely to a 4-bit binary nibble. Consequently, a single 8-bit byte is represented cleanly by exactly two hexadecimal digits without any messy fractional bits or alignment shifts.",
      "Every major cryptographic entity—symmetric keys, initialization vectors, cryptographic nonces, and hash digests—is represented in hexadecimal format. For example, a 256-bit AES key is 32 bytes = exactly 64 hexadecimal characters. An experienced security analyst can identify unknown cryptographic artifacts simply by observing their hex string length: 32 hex chars indicates a 128-bit MD5 or AES-128 key; 40 hex chars indicates a 160-bit SHA-1 digest; 64 hex chars indicates a 256-bit SHA-256 digest or Bitcoin private key.",
      "Positional Radix Arithmetic: Any non-negative integer can be expressed in base b as the summation of each digit multiplied by its positional power of the base: Value = d_k · b^k + ... + d_1 · b^1 + d_0 · b^0. This fundamental positional notation bridges the conceptual gap between raw ASCII text, binary byte arrays, and the massive 2048-bit and 4096-bit integers used in RSA and Elliptic Curve Cryptography.",
    ],
    keyPoints: [
      "1 hex digit = 4 bits (nibble); 2 hex digits = 1 full byte (0x00 to 0xFF).",
      "Standard digest lengths: 32 hex = 128-bit; 40 hex = 160-bit; 64 hex = 256-bit; 128 hex = 512-bit.",
      "Hexadecimal allows human inspection of binary data without losing bit-level precision.",
    ],
    pitfalls: [
      "Case sensitivity string comparison bugs: `0x2a` and `0x2A` represent the identical byte value (42), but naive case-sensitive string matching will evaluate them as unequal.",
      "Odd-length hex strings: Every valid byte is 2 hex digits. A hex string with an odd character length indicates either a missing leading zero or a truncated corrupted byte.",
    ],
    workedExample: {
      title: "Converting Byte 0xA7 to Binary and Decimal",
      steps: [
        { label: "1. Isolate Hex Digits", detail: "High nibble: 'A' (decimal 10). Low nibble: '7' (decimal 7)." },
        { label: "2. Convert Nibbles to 4-Bit Binary", detail: "'A' (10) = 1010₂. '7' (7) = 0111₂." },
        { label: "3. Concatenate to 8-Bit Byte", detail: "0xA7 = 10100111₂." },
        { label: "4. Calculate Decimal Value", detail: "(10 × 16¹) + (7 × 16⁰) = 160 + 7 = 167 in decimal." },
      ],
      outcome: "Hexadecimal 0xA7 equals binary 10100111₂ and decimal 167₁₀.",
    },
    references: [
      {
        title: "RFC 4648 Section 8: Base16 Encoding",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc4648.txt",
        description: "Official standard specification for Base16 (hexadecimal) serialization.",
        type: "standard",
      },
    ],
    toolId: "radix",
    glossary: [
      { term: "Nibble", def: "A four-bit aggregation, or half an octet. Expressed as a single hexadecimal digit." },
      { term: "Radix", def: "The base of a system of numeration (e.g. 2 for binary, 10 for decimal, 16 for hexadecimal)." },
    ],
  },
  {
    id: "base58-base32",
    trackId: "encoding",
    title: "Base58 and Base32 representations",
    subtitle: "Human-safe encodings for 2FA and cryptocurrency addresses",
    formula: {
      expr: "Base58: Omits [0, O, I, l, +, /]  |  Base32: A–Z and 2–7 (Case-Insensitive)",
      badge: "Human UX",
      note: "Engineered specifically to eliminate human transcription errors when copying secrets by hand or scanning physical QR codes.",
    },
    body: [
      "While Base64 is efficient for machine-to-machine transmission, it is notoriously hostile to human interaction: 1) Visual ambiguity: in many computer fonts, uppercase 'O' and the digit '0' look virtually identical; lowercase 'l' and uppercase 'I' are indistinguishable; 2) Punctuation breaks: double-clicking a token containing '+' or '/' only selects a portion of the string; 3) Word-wrapping: punctuation characters cause terminal emulators and messaging apps to insert unexpected line breaks.",
      "Base58 in Cryptocurrencies: In 2008, Satoshi Nakamoto introduced Base58 for Bitcoin public wallet addresses and private key exports (Wallet Import Format, WIF). Base58 takes the 62 alphanumeric characters and removes all visually ambiguous letters: '0' (zero), 'O' (uppercase o), 'I' (uppercase i), and 'l' (lowercase L), as well as '+' and '/'. The remaining 58 characters can be handwritten, read over the phone, or double-clicked as a single contiguous token.",
      "Base58Check: Bitcoin wraps Base58 in an error-detecting envelope called Base58Check. It prepends a version byte (e.g., 0x00 for Bitcoin Mainnet addresses) and appends a 4-byte checksum computed via double-SHA256 (`SHA256(SHA256(data))[0..4]`). If a user accidentally mistypes a single character in a Bitcoin address, the checksum fails with 99.9999999% probability, preventing permanent loss of funds.",
      "Base32 in Two-Factor Authentication: Base32 (RFC 4648) uses a 32-character alphabet (A–Z and digits 2–7) that is completely case-insensitive (omitting 0, 1, 8, and 9). Base32 is the universal standard for Two-Factor Authentication (TOTP / Google Authenticator) seed keys. Whether a user enters 'JBSWY3DPEHPK3PXP' in all lowercase or all uppercase, the system decodes the exact same secret seed.",
    ],
    keyPoints: [
      "Base58 eliminates visually ambiguous characters (0, O, I, l) to protect human cryptocurrency transfers.",
      "Base58Check incorporates a 4-byte double-SHA256 checksum to detect manual mistyping errors.",
      "Base32 is 100% case-insensitive, making it ideal for manual 2FA authenticator app seed entry.",
      "Both are encodings without keys: neither provides cryptographic secrecy on its own.",
    ],
    pitfalls: [
      "Assuming Base32 2FA seed keys in QR codes are encrypted: anyone who scans the QR code gains full generation capability for future 2FA codes.",
      "Attempting to decode Base58 using standard modular division without handling leading zero bytes: in Base58, leading 0x00 bytes must be encoded as leading '1' characters.",
    ],
    workedExample: {
      title: "Decoding a Base32 2FA Secret Key Step-by-Step",
      steps: [
        { label: "1. 2FA Secret String", detail: "'JBSWY3DP' (the classic test seed defined in RFC 6238)." },
        { label: "2. Lookup 5-Bit Values", detail: "J=9 (01001₂), B=1 (00001₂), S=18 (10010₂), W=22 (10110₂), Y=24 (11000₂), 3=27 (11011₂), D=3 (00011₂), P=15 (01111₂)." },
        { label: "3. Concatenate 40 Bits", detail: "01001 00001 10010 10110 11000 11011 00011 01111." },
        { label: "4. Regroup into 5 × 8-Bit Bytes", detail: "Byte 1: 01001000 (0x48 = 'H'). Byte 2: 01100101 (0x65 = 'e'). Byte 3: 01101100 (0x6C = 'l'). Byte 4: 01101100 (0x6C = 'l'). Byte 5: 01101111 (0x6F = 'o')." },
      ],
      outcome: "Base32 string 'JBSWY3DP' decodes cleanly to byte array 'Hello'.",
    },
    references: [
      {
        title: "RFC 4648 Section 6: Base32 Encoding",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc4648.txt",
        description: "Official standard defining the 32-character alphabet used in TOTP two-factor authentication.",
        type: "standard",
      },
      {
        title: "Bitcoin Wiki: Base58Check Encoding",
        source: "Bitcoin Wiki",
        url: "https://en.bitcoin.it/wiki/Base58Check_encoding",
        description: "Technical reference explaining Base58 alphabet selection and SHA-256 error-detecting checksums.",
        type: "spec",
      },
    ],
    toolId: "base58",
    glossary: [
      { term: "Base58", def: "A group of binary-to-text encoding schemes used in Bitcoin designed to avoid visually ambiguous characters." },
      { term: "Base58Check", def: "A Base58 encoding with version bytes and a 4-byte double-SHA256 checksum to prevent mistyped addresses." },
      { term: "Base32", def: "A 5-bit case-insensitive encoding utilizing 32 ASCII characters, standard for TOTP authentication seeds." },
    ],
  },
  {
    id: "endianness",
    trackId: "encoding",
    title: "Endianness & machine byte order",
    subtitle: "Big-Endian vs Little-Endian in cryptographic protocols",
    formula: {
      expr: "32-bit Integer 0x12345678: Big-Endian = [12, 34, 56, 78] | Little-Endian = [78, 56, 34, 12]",
      badge: "Architecture Standard",
      note: "Big-Endian stores the most significant byte (MSB) at the lowest memory address. Little-Endian stores the least significant byte (LSB) first.",
    },
    body: [
      "Endianness dictates how computer architectures organize and store multi-byte integers in sequential physical memory addresses. The term originates from Jonathan Swift's 1726 satire 'Gulliver's Travels', where Lilliputians waged war over which end of a boiled egg to crack. In modern computing, endianness is a fundamental hardware reality that causes severe cross-platform cryptographic failures and subtle security vulnerabilities when overlooked.",
      "Big-Endian ('Network Byte Order'): In Big-Endian systems, the Most Significant Byte (MSB) is stored at the lowest memory address, matching the natural left-to-right reading order of numbers in human Arabic notation. Internet standards (TCP/IP, UDP, DNS), cryptographic hashing algorithms (SHA-256, SHA-512, MD5), and large-integer RSA operations mandate Big-Endian byte serialization. When transmitting an integer over the internet, RFC standards require it to be converted to Network Byte Order.",
      "Little-Endian ('Hardware Native Order'): In Little-Endian systems, the Least Significant Byte (LSB) is stored at the lowest memory address. The dominant microprocessor architectures of the modern world—including Intel/AMD x86-64 and ARM processors (used in iPhones, Android devices, and Apple Silicon Macs)—operate natively in Little-Endian mode because it simplifies arithmetic carry operations in CPU silicon.",
      "Cryptographic Implications: Algorithms like ChaCha20, Poly1305, and Keccak (SHA-3) explicitly specify Little-Endian word loading. When cryptographic software loads an array of bytes into a 32-bit or 64-bit CPU register, it must explicitly perform endianness swapping (via hardware instructions like `bswap` or compiler built-ins like `__builtin_bswap32`) if the protocol expects Big-Endian. Failing to swap byte order produces completely invalid message digests and signature verification rejections.",
    ],
    keyPoints: [
      "Big-Endian (Network Byte Order): Stores MSB first; standard for TLS, IP packets, RSA moduli, and SHA-256.",
      "Little-Endian: Stores LSB first; native execution order for x86-64 and ARM CPUs.",
      "Cryptographic algorithms explicitly mandate endianness: SHA-256 is Big-Endian; ChaCha20 and MD4/MD5 internal states are Little-Endian.",
      "Never cast raw byte pointers directly to integer pointers in C/Rust without explicit endianness conversion.",
    ],
    pitfalls: [
      "Using raw C pointer casting `*(uint32_t*)buffer` on network bytes: on Little-Endian x86 systems, the integer is reversed, causing hash mismatches.",
      "Confusing display order with memory order in Bitcoin transactions: Bitcoin transaction hashes are stored in Little-Endian in raw blocks, but displayed in Big-Endian in block explorers.",
    ],
    workedExample: {
      title: "Storing 32-Bit Integer 0x0A0B0C0D in Memory",
      steps: [
        { label: "1. The 32-Bit Integer", detail: "Value: 0x0A0B0C0D (Decimal: 168,496,141). Most Significant Byte: 0x0A; Least Significant Byte: 0x0D." },
        { label: "2. Big-Endian Memory Layout", detail: "Address 0x00: 0x0A, Address 0x01: 0x0B, Address 0x02: 0x0C, Address 0x03: 0x0D. [Natural human order]." },
        { label: "3. Little-Endian Memory Layout", detail: "Address 0x00: 0x0D, Address 0x01: 0x0C, Address 0x02: 0x0B, Address 0x03: 0x0A. [Reversed byte order]." },
        { label: "4. Register Load Verification", detail: "When a Little-Endian CPU loads bytes [0x0D, 0x0C, 0x0B, 0x0A] into a 32-bit register, the register reconstructs the exact original value 0x0A0B0C0D." },
      ],
      outcome: "Shows how opposite physical memory byte sequences represent the exact same mathematical value.",
    },
    references: [
      {
        title: "IETF IEN 137: On Holy Wars and a Plea for Peace (Danny Cohen, 1980)",
        source: "IETF Classic",
        url: "https://www.ietf.org/rfc/ien137.txt",
        description: "The famous computing paper that established the terms Big-Endian and Little-Endian in computer architecture.",
        type: "paper",
      },
    ],
    toolId: "endianness",
    glossary: [
      { term: "Big-Endian", def: "A byte order where the most significant byte is stored at the smallest memory address." },
      { term: "Little-Endian", def: "A byte order where the least significant byte is stored at the smallest memory address." },
      { term: "Network Byte Order", def: "The standardized Big-Endian byte ordering used in internet protocol headers." },
    ],
  },
  {
    id: "url-encoding",
    trackId: "encoding",
    title: "Percent-encoding and injection risk",
    subtitle: "Where encoding meets web security",
    formula: {
      expr: "Reserved Character → '%' + Hex(Byte 1) + Hex(Byte 2) (UTF-8)",
      badge: "RFC 3986",
      note: "RFC 3986 reserves characters with special syntactic meaning (like '?', '&', '=', '/', '#'). Any non-safe byte is replaced by '%' followed by two hexadecimal digits.",
    },
    body: [
      "Uniform Resource Identifiers (URIs) are constrained by RFC 3986 to a small subset of printable ASCII characters divided into unreserved characters (letters `A–Z`, `a–z`, digits `0–9`, `-`, `_`, `.`, `~`) and reserved characters (`?`, `&`, `=`, `/`, `#`, `:`, `@`, `+`) which act as structural protocol delimiters. Any data containing characters outside the unreserved set—such as spaces, punctuation, non-Latin scripts, or binary tokens—must be percent-encoded.",
      "How Percent-Encoding Works: Each byte of the UTF-8 representation is replaced by a percent symbol `'%'` followed by exactly two uppercase hexadecimal digits. For example, an ASCII space character (byte 0x20) becomes `'%20'`; an ampersand `'&'` (byte 0x26) becomes `'%26'`; and the UTF-8 euro symbol `'€'` (bytes `0xE2 0x82 0xAC`) becomes `'%E2%82%AC'`. In URL query strings (application/x-www-form-urlencoded), spaces are alternately represented by `'+'`.",
      "The Double-Encoding Vulnerability: In modern multi-tier web architectures, user input passes through reverse proxies, web application firewalls (WAFs), API gateways, and backend application servers. If one layer decodes the URL and passes it to the next layer without re-encoding, attackers can exploit Double-Encoding to bypass security filters: The percent sign `'%'` itself has hex value 0x25. An attacker targeting a single quote `'` (0x27) encodes it as `'%2527'`. The WAF decodes `'%2527'` once, seeing the harmless string `'%27'`, which it permits. The backend application server then decodes `'%27'` a second time, executing a malicious SQL injection single quote `'`!",
      "Contextual Decoding Rule: Input validation and sanitization must occur strictly after the final decoding layer. Never validate data while it is still in an encoded state.",
    ],
    keyPoints: [
      "Percent-encoding converts arbitrary UTF-8 bytes into `%HH` hexadecimal sequences.",
      "Characters with protocol syntax roles (`?`, `&`, `=`, `/`) must be encoded when used as data payload.",
      "Double encoding (%2527 → %27 → ') is a classic bypass against multi-tier web filters.",
      "Security rule: Decode input exactly once at the application boundary before validation.",
    ],
    pitfalls: [
      "Validating user input before decoding: WAFs checking for `../` path traversal will miss `%252e%252e%252f`.",
      "Confusing `encodeURI()` with `encodeURIComponent()` in JavaScript: `encodeURI` preserves protocol characters like `?` and `&`, while `encodeURIComponent` correctly encodes them for query parameter values.",
    ],
    workedExample: {
      title: "Tracing a Double-Encoding Filter Evasion Attack",
      steps: [
        { label: "1. Attacker Goal", detail: "Attacker wishes to inject path traversal payload `../` to read `/etc/passwd`." },
        { label: "2. Single Encoding", detail: "'.' (0x2E) and '/' (0x2F) become `..%2F`." },
        { label: "3. Double Encoding", detail: "Attacker encodes the '%' (0x25) character: `..%252F`." },
        { label: "4. WAF Inspection", detail: "WAF decodes once: `..%252F` becomes `..%2F`. WAF regex checks for `../`. It does not match! Request forwarded." },
        { label: "5. Web Server Execution", detail: "Node.js/Nginx routing framework decodes again: `..%2F` becomes `../`. Traversal executed!" },
      ],
      outcome: "Shows why decoding must happen once, and path canonicalization must occur after decoding.",
    },
    references: [
      {
        title: "RFC 3986: Uniform Resource Identifier (URI) Generic Syntax",
        source: "IETF RFC",
        url: "https://www.ietf.org/rfc/rfc3986.txt",
        description: "The authoritative standard specifying URI percent-encoding syntax and reserved characters.",
        type: "standard",
      },
      {
        title: "OWASP Double Encoding Bypass Guide",
        source: "OWASP",
        url: "https://owasp.org/www-community/attacks/Double_Encoding",
        description: "In-depth web security analysis of double-encoding vulnerabilities and filter evasion.",
        type: "tutorial",
      },
    ],
    toolId: "url",
    glossary: [
      { term: "Percent-Encoding", def: "A mechanism for encoding characters in a Uniform Resource Identifier (URI) under certain circumstances." },
      { term: "Double Encoding", def: "A web vulnerability where user input is decoded twice, allowing malicious characters to bypass intermediate filters." },
    ],
  },
];
