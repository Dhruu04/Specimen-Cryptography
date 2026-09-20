# Cypher / Specimen — Cryptography & Cryptanalysis Laboratory

> An all-in-one interactive study laboratory, cryptanalysis workbench, and educational notebook covering the complete mathematical and practical foundations of cryptography and network security.

Based on the gold-standard academic syllabus of William Stallings' *Cryptography and Network Security: Principles and Practice* (8th Edition), **Specimen** provides interactive step-by-step visualizations, mathematical calculators, attack simulators, and an extensive challenge arena running completely client-side in the browser.

---

## Table of Contents

- [Overview & Philosophy](#overview--philosophy)
- [Quick Start & Local Development](#quick-start--local-development)
- [Firebase Hosting & Deployment](#firebase-hosting--deployment)
- [Mobile & Smartphone Ergonomics](#mobile--smartphone-ergonomics)
- [Curriculum Syllabus (8 Tracks & 75 Lessons)](#curriculum-syllabus-8-tracks--75-lessons)
- [Cryptographic Converter Suite (81+ Tools)](#cryptographic-converter-suite-81-tools)
- [Specialized Interactive Laboratories](#specialized-interactive-laboratories)
  - [1. Attack Lab & Exploit Simulators](#1-attack-lab--exploit-simulators)
  - [2. TLS 1.3 Handshake & Packet Wire Inspector](#2-tls-13-handshake--packet-wire-inspector)
  - [3. Zero-Knowledge Proofs (ZKP) Playground](#3-zero-knowledge-proofs-zkp-playground)
  - [4. Post-Quantum Lattice Studio (NIST FIPS 203 & 204)](#4-post-quantum-lattice-studio-nist-fips-203--204)
  - [5. Steganography & Digital Forensics Studio](#5-steganography--digital-forensics-studio)
  - [6. Crypto Pipeline Studio](#6-crypto-pipeline-studio)
  - [7. Cryptographic Benchmark & Avalanche Arena](#7-cryptographic-benchmark--avalanche-arena)
  - [8. Mechanical Enigma Simulator](#8-mechanical-enigma-simulator)
  - [9. Spaced-Repetition Study Flashcards](#9-spaced-repetition-study-flashcards)
- [CTF Challenge Arena & Live Sandboxes](#ctf-challenge-arena--live-sandboxes)
  - [Live Interactive Padding Oracle Sandbox](#live-interactive-padding-oracle-sandbox)
  - [Live Interactive Håstad Broadcast CRT Sandbox](#live-interactive-håstad-broadcast-crt-sandbox)
- [Lab Notebook, Cryptanalyst Ranking & Verifiable Certificate](#lab-notebook-cryptanalyst-ranking--verifiable-certificate)
- [Instant Format Auto-Detector & Assistant](#instant-format-auto-detector--assistant)
- [Universal Cryptographic Scratchpad (Alt+S)](#universal-cryptographic-scratchpad-alts)
- [Cryptographic Standards Matrix](#cryptographic-standards-matrix)
- [Privacy, Offline Field Use & Security Guarantees](#privacy-offline-field-use--security-guarantees)

---

## Overview & Philosophy

Modern cryptography is often taught either through purely abstract mathematics or through black-box software libraries where the inner mechanics remain invisible. **Specimen** bridges this divide by making every mathematical transformation visible, inspectable, and interactive.

- **Zero Black Boxes:** Every algorithm exposes its intermediate internal states—from the S-Box byte substitutions and Galois field multiplications in AES to the polynomial noise cancellation in post-quantum lattice schemes.
- **Deep Historical & Modern Breadth:** Covers everything from classical monoalphabetic substitution (Caesar, Alberti, Vigenère) to contemporary NIST standards (AES-GCM, SHA-3, Ed25519) and next-generation post-quantum standards (ML-KEM, ML-DSA).
- **Interactive Experimentation:** Tweak noise multipliers to witness lattice decryption failures, flip ciphertext bits to test CBC malleability, step through Vaudenay padding oracle queries, or slice individual image bit planes to reveal hidden steganographic payloads.
- **100% Client-Side Confidentiality:** No keys, plaintexts, or files ever leave your computer. All computation executes locally inside your browser engine.

---

## Quick Start & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or `pnpm` / `yarn`)
- Modern web browser supporting Web Crypto API and HTML5 Canvas

### Clone & Install
```bash
# Clone the repository
git clone https://github.com/Dhruu04/Specimen-Cryptography.git

# Navigate to application directory
cd Specimen-Cryptography

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Firebase Hosting & Deployment

Specimen is fully pre-configured for one-command deployment to **Google Firebase Hosting** with automated SPA routing, immutable asset caching, and service worker registration.

### 1. Install Firebase CLI & Login
```bash
npm install -g firebase-tools
firebase login
```

### 2. Configure Your Firebase Project
Link your Firebase project:
```bash
firebase use --add
# Select your Firebase project from the interactive list
```
*(Or manually edit `.firebaserc` with your project ID)*

### 3. Build & Deploy
Deploy with a single command:
```bash
npm run firebase:deploy
```
This script automatically executes `vite build` and deploys the contents of `dist/` directly to Firebase Hosting's global CDN edge network.

---

## Mobile & Smartphone Ergonomics

Specimen is built with a mobile-first responsive architecture ensuring zero UI breakage across smartphones down to 375px (iPhone SE, iPhone 14/15/16 Pro, Galaxy S23, Pixel 8):

- **Dedicated Mobile Lesson Switcher:** On phone viewports (`xl:hidden`), curriculum lessons feature a quick segmented toggle between `[ Lesson Theory ]` (reading notes, formulas, worked examples, pitfalls, codebook, and quiz) and `[ Interactive Lab ]` (instant jump to the live converter/sandbox without scrolling). State and inputs are strictly preserved across switches.
- **Floating Dock & Safe-Area Clearance:** The floating Universal Scratchpad (`Alt+S`) and bottom navigation dock automatically adjust positioning and incorporate `env(safe-area-inset-bottom)` to clear modern phone gesture bars.
- **Touch-Native Canvas Dragging:** Interactive geometric visualizers (such as the 2D Lattice CVP Closest Vector geometer) support `onTouchStart`, `onTouchMove`, and `onTouchEnd` with `touch-none` styling, allowing smooth single-finger repositioning of noise vectors without triggering page scrolls.
- **Thumb-Friendly Touch Targets:** All interactive bit-plane buttons, sliders, and options maintain comfortable minimum 40px touch targets.

---

## Curriculum Syllabus (8 Tracks & 75 Lessons)

The curriculum is organized into eight progressive tracks providing rigorous theoretical explanations, formal formulas, and historical context:

### Track 1: Classical Ciphers & Cryptanalysis (13 Lessons)
- **Foundations of Secrecy:** Symmetric cipher model, cryptanalysis vs. brute force, Kerckhoffs's principle.
- **Monoalphabetic Substitution:** Caesar cipher, shift ciphers, and general monoalphabetic substitution.
- **Polyalphabetic Ciphers:** Playfair 5×5 matrix rules, Vigenère cipher, Beaufort cipher, and running-key ciphers.
- **Polygraphic & Transposition Ciphers:** Hill cipher linear algebra modulo 26, Rail Fence, and columnar transposition.
- **Rotor Machines & Information Theory:** Alberti cipher disk, Enigma rotor mechanics, and the Vernam One-Time Pad with Claude Shannon's proof of perfect secrecy.
- **Cryptanalysis Methods:** Frequency analysis, Index of Coincidence (IC), and the Kasiski examination.

### Track 2: Data Representation & Encodings (7 Lessons)
- **Binary & Bitwise Foundations:** Bits, bytes, nibbles, XOR properties, and logic masks.
- **Hexadecimal Representation:** Base16 addressing, byte boundaries, and raw memory layouts.
- **Radix Encodings:** Base64, Base64URL, Base32, and Base58Check encoding rules and padding.
- **Character Sets:** ASCII 7-bit standard, ISO-8859-1, and UTF-8 multi-byte variable encodings.
- **Byte Order & Structures:** Big-Endian vs Little-Endian architectures, network byte order, and integer word packing.

### Track 3: Modern Symmetric Encryption (6 Lessons)
- **Block Cipher Architecture:** Feistel network design principles, Claude Shannon's confusion and diffusion.
- **Data Encryption Standard (DES):** 16-round Feistel structure, initial permutations, 48-bit subkey schedules, and 3DES.
- **Advanced Encryption Standard (AES):** Rijndael architecture, SubBytes non-linear substitution, ShiftRows, MixColumns in GF(2⁸), and AddRoundKey key expansions for 128, 192, and 256-bit variants.
- **Block Cipher Modes of Operation:** ECB structural leakage, CBC chaining, CFB, OFB, CTR streaming, and modern AEAD modes (AES-GCM).
- **Modern Stream Ciphers:** RC4 design flaws and the ChaCha20-Poly1305 ARX architecture.

### Track 4: Cryptographic Hashing & Integrity (7 Lessons)
- **Hash Function Foundations:** Pre-image resistance, second pre-image resistance, collision resistance, and the Birthday Paradox.
- **Legacy Hashes:** MD5 and SHA-1 compression functions and their collision attacks.
- **The SHA-2 Family:** SHA-256 and SHA-512 Merkle–Damgård structures and length extension attacks.
- **SHA-3 & Keccak:** The sponge construction (absorb and squeeze phases) and permutation states.
- **Message Authentication Codes:** HMAC construct (nested inner/outer hashing) and CMAC block cipher MACs.
- **Merkle Trees:** Hierarchical hash verification and cryptographic inclusion proofs in blockchains and certificate transparency logs.

### Track 5: Public-Key Cryptography & Key Exchange (7 Lessons)
- **Asymmetric Principles:** Trapdoor one-way functions and public-private key separation.
- **The RSA Cryptosystem:** Prime generation, modulus $n = p \times q$, Euler's totient $\phi(n)$, encryption $C = M^e \pmod n$, private exponent $d = e^{-1} \pmod{\phi(n)}$, and OAEP padding.
- **Diffie–Hellman Key Exchange:** Ephemeral key agreement over discrete logarithm groups and man-in-the-middle vulnerabilities.
- **Elliptic Curve Cryptography (ECC):** Weierstrass equation $y^2 = x^3 + ax + b$, point addition, point doubling, ECDH agreement, and ECDSA signatures.
- **Edwards Curves:** Curve25519 and Ed25519 complete addition formulas resisting side-channel timing attacks.

### Track 6: Post-Quantum Cryptography & Quantum Resistance (13 Lessons)
- **Quantum Threat Models:** Peter Shor's polynomial-time algorithm for integer factoring and discrete logarithms; Lov Grover's quadratic database search algorithm.
- **Lattice-Based Cryptography:** Shortest Vector Problem (SVP), Closest Vector Problem (CVP), and the Learning With Errors (LWE / Ring-LWE / Module-LWE) problem.
- **NIST Post-Quantum Standards:**
  - **FIPS 203:** ML-KEM (CRYSTALS-Kyber) lattice key encapsulation mechanism.
  - **FIPS 204:** ML-DSA (CRYSTALS-Dilithium) lattice digital signature algorithm with rejection sampling.
  - **FIPS 205:** SLH-DSA (SPHINCS+) stateless hash-based digital signature algorithm.
- **Code-Based & Isogeny Cryptography:** McEliece cryptosystem with Goppa codes, and the history of supersingular isogeny key exchange.
- **Migration Strategies:** Hybrid post-quantum/classical certificates (e.g., X25519 + ML-KEM-768) and quantum risk assessments.

### Track 7: Mathematical Foundations & Number Theory (11 Lessons)
- **Divisibility & Primes:** Divisibility rules, prime factorizations, and the Fundamental Theorem of Arithmetic.
- **Euclidean Algorithms:** Greatest common divisor (GCD) and the Extended Euclidean Algorithm for Bézout coefficients.
- **Modular Arithmetic:** Congruences, residue systems, and modular multiplicative inverses.
- **Algebraic Structures:** Groups, rings, fields, and finite Galois Fields $\text{GF}(p)$ and $\text{GF}(2^n)$.
- **Theorems & Primality:** Fermat's Little Theorem, Euler's Theorem, Euler's Totient function $\phi(n)$, and the Miller-Rabin probabilistic primality test.
- **Advanced Solvers:** The Chinese Remainder Theorem (CRT) and the Discrete Logarithm Problem (Baby-step Giant-step).

### Track 8: Applied Cyber Security Practice & Protocols (11 Lessons)
- **Transport Layer Security (TLS 1.3):** 1-RTT handshake protocol, HKDF key schedule derivation, and forward secrecy.
- **Public Key Infrastructure (PKI):** X.509 certificate formats, Certificate Authorities (CAs), revocation (CRLs, OCSP), and certificate transparency.
- **Authentication & Tokens:** Kerberos ticketing, OAuth 2.0, OpenID Connect, and JSON Web Tokens (JWT).
- **Secure Password Storage:** Iterative key derivation functions (PBKDF2, Bcrypt, Scrypt, and RFC 9106 Argon2id).
- **Threshold Cryptography:** Shamir's $(k, n)$ secret sharing polynomial interpolation over finite fields.
- **Zero-Knowledge Proofs (ZKP):** Interactive proof systems, completeness, soundness, zero-knowledge properties, and Schnorr identification.

---

## Cryptographic Converter Suite (81+ Tools)

**Specimen** includes a comprehensive suite of over 81 interactive calculators, converters, and step-by-step visualizers arranged into 8 categories:

1. **Classical Ciphers (15 Tools):**
   Caesar Cipher, ROT13, Affine Cipher, Atbash, Substitution Cipher Desk, Vigenère, Beaufort, Autokey, Playfair 5×5 Matrix, Hill Cipher Matrix, Rail Fence, Columnar Transposition, Baconian Cipher, Vernam One-Time Pad, and Enigma M3/M4 Simulator.

2. **Encoding & Representation (10 Tools):**
   Base64 Encoder/Decoder, Base64URL, Base32, Hexadecimal converter, ASCII / Binary bitstream analyzer, Big-Endian / Little-Endian word swapper, URL Encoder, Base58Check, Byte Frequency Inspector, and Shannon Entropy Calculator.

3. **Modern Symmetric Ciphers (7 Tools):**
   AES-128 / 192 / 256 Interactive Step Visualizer (SubBytes, ShiftRows, MixColumns, AddRoundKey), DES 16-Round Engine, Triple DES (3DES), RC4 Stream Cipher, ChaCha20 Quarter-Round Simulator, AES-GCM Authenticated Encryption, and Block Cipher Mode Visualizer (ECB, CBC, CFB, OFB, CTR).

4. **Hashing & Integrity (8 Tools):**
   MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-3 (Keccak-256 / 512 Sponge State Visualizer), and HMAC Generator.

5. **Public Key & Key Exchange (6 Tools):**
   RSA Key Generator & Math Calculator, Diffie-Hellman Key Agreement Simulator, Elliptic Curve Point Addition & Doubling Visualizer, ECDH Key Agreement, ECDSA Signature Verifier, and Ed25519 Curve Engine.

6. **Post-Quantum Cryptography (7 Tools):**
   ML-KEM (Kyber) Polynomial Encapsulation Engine, ML-DSA (Dilithium) Rejection Sampling Visualizer, SPHINCS+ Hash-Tree Signature Estimator, Ring-LWE Polynomial Multiplier, 2D Lattice CVP Geometer, Falcon Fast Fourier Lattice Inspector, and Hybrid Quantum-Safe Key Combiner.

7. **Number Theory Engines (15 Tools):**
   Euclidean Algorithm GCD Tracer, Extended Euclidean Solver ($a\cdot x + b\cdot y = \gcd$), Modular Multiplicative Inverse Finder, Modular Exponentiation ($a^b \pmod m$), Prime Factorizer, Euler's Totient $\phi(n)$ Calculator, Chinese Remainder Theorem (CRT) Solver, Miller-Rabin Primality Tester, Primitive Root Finder, Discrete Logarithm Calculator, Legendre & Jacobi Symbols, Quadratic Residues, GF(2⁸) Rijndael Field Arithmetic, Galois Polynomial Divider, and Gaussian Integer GCD.

8. **Attacks & Protocol Labs (13 Tools):**
   ECB Penguin Pattern Visualizer, CBC Bit-Flipping Exploit, Diffie-Hellman MITM Interceptor, Index of Coincidence (IC) & Frequency Desk, Kasiski Examination Key Length Guesser, RSA Small Exponent ($e=3$) Attack, Padding Oracle Attack Simulator, TLS 1.3 Handshake Inspector, Schnorr Zero-Knowledge Proof, Graph 3-Coloring ZKP Round, Shamir $(k, n)$ Secret Sharing, Password Strength & Entropy Scorer, and Argon2id KDF Simulator.

---

## Specialized Interactive Laboratories

### 1. Attack Lab & Exploit Simulators
- **The ECB "Penguin" Flaw Visualizer:** Upload or select bitmaps with macroscopic patterns to see how Electronic Codebook (ECB) preserves structural patterns, disproving semantic security (IND-CPA). Switch to CBC or CTR to observe complete pseudo-random diffusion.
- **CBC Bit-Flipping Exploit:** Demonstrates ciphertext malleability. Alter a single bit in ciphertext block $C_{i-1}$ to predictably rewrite the decrypted role from `user=guest` to `admin=1` in block $P_i$ without ever learning the AES secret key.
- **Diffie-Hellman MITM Interceptor:** A live three-party simulation (Alice, Mallorie, Bob) showing how unauthenticated key exchange allows an active attacker to substitute public keys and transparently decrypt, manipulate, and forward messages.
- **Frequency Analysis & Cryptanalysis Desk:** Live Index of Coincidence (IC) calculations, n-gram distribution graphs against natural language corpora, and an interactive substitution workspace to break classical ciphers.

### 2. TLS 1.3 Handshake & Packet Wire Inspector
- **1-RTT Protocol Frames:** Step-through the wire exchange: `ClientHello`, `ServerHello`, `EncryptedExtensions`, `Certificate`, `CertificateVerify`, and `Finished`.
- **HKDF Key Derivation Schedule:** Visualizes the early secret, handshake secret, and master secret derivation.
- **MITM Wire Tamper Engine:** Flip individual bytes in transit ciphertext frames to observe real-time `AEAD_BAD_TAG` decryption aborts, proving the necessity of authenticated encryption with associated data.

### 3. Zero-Knowledge Proofs (ZKP) Playground
- **Schnorr 3-Move Identification:** Walk through the interactive protocol: Commitment ($t = g^r \pmod p$), Challenge ($e$), and Response ($s = r + e\cdot x \pmod{p-1}$). Switch between Honest Prover and Imposter modes to observe how an attacker guessing commitments is mathematically caught within rounds.
- **Graph 3-Coloring Protocol:** Verifier queries random edges in a permuted graph coloring, demonstrating completeness and soundness without leaking the coloring solution.

### 4. Post-Quantum Lattice Studio (NIST FIPS 203 & 204)
- **Ring-LWE Polynomial Ring Arithmetic:** Perform polynomial multiplication over the quotient ring $\mathbb{Z}_q[X]/(X^n+1)$ with selectable degrees ($n=4, 8, 16$) and moduli ($q=17, 257, 3329$).
- **ML-KEM (Kyber) Step-by-Step:**
  - *KeyGen:* Public matrix $\mathbf{A}$, secret binomial noise vector $\mathbf{s}$, error $\mathbf{e}$, public key $\mathbf{t} = \mathbf{A}\mathbf{s} + \mathbf{e} \pmod q$.
  - *Encapsulation:* Ephemeral vector $\mathbf{r}$, errors $\mathbf{e}_1, \mathbf{e}_2$, ciphertext $\mathbf{u} = \mathbf{A}^T\mathbf{r} + \mathbf{e}_1$, and scalar $v = \mathbf{t}^T\mathbf{r} + \mathbf{e}_2 + \lceil q/2 \rfloor \cdot m$.
  - *Decapsulation:* Noise cancellation $v - \mathbf{s}^T\mathbf{u}$ and threshold bit recovery.
- **Noise Amplification & Failure Slider:** Artificially scale error variance to cross the theoretical failure threshold ($|e_{\text{total}}| \ge \lfloor q/4 \rfloor$), witnessing the exact conditions that cause lattice decryption errors.
- **ML-DSA (Dilithium) Rejection Sampling:** Demonstrates the "Fiat-Shamir with Aborts" paradigm, proving why lattice signature schemes must reject signatures whose norms approach the uniform boundary to prevent secret key leakage.
- **2D CVP Geometry Canvas:** Interactive plane demonstrating the Babai closest vector projection using private orthogonal bases versus public skewed bases.

### 5. Steganography & Digital Forensics Studio (`/forensics`)
- **Custom Image Drag & Drop & Presets:** Drag and drop or upload your own images (PNG, JPEG, WebP) or select from built-in procedural specimens (Emblem, Target, Spectrum) with automatic aspect-ratio-preserving canvas normalization.
- **8-Bit Plane Slicer:** Isolates individual bit planes (Bit 0 LSB up to Bit 7 MSB) across Red, Green, Blue, and Grayscale channels, stripping high-order visual data to uncover concealed watermarks, monochrome payloads, and spatial noise anomalies.
- **LSB Carrier Injection & Extraction:** Injects secret text messages into image least-significant bits using an authentic 32-bit magic header (`STEG`) and 32-bit length prefix, preventing premature EOF noise or garbage decoding. Features live extraction, an amplified difference heatmap, and mathematical quality metrics:
  - **Mean Squared Error (MSE)**
  - **Peak Signal-to-Noise Ratio (PSNR in dB)** (>50 dB indicates near-perfect visual imperceptibility).
- **Lossless Stego Export & Roundtrip Testing:** Download your encoded image as a pristine 24-bit PNG with `Download Stego PNG`, and upload external stego files with `Extract from External File` to verify end-to-end extraction across machines.
- **File Structure & Magic Byte Inspector:** Drag and drop files to analyze magic byte headers (JPEG, PNG, GIF, PDF, ZIP, ELF, Windows PE) and automatically detect appended payloads or polyglot archives trailing past official End-of-File (EOF) markers.

### 6. Crypto Pipeline Studio (`/pipeline`)
A multi-stage sequential processing workbench inspired by CyberChef:
- **Sequential Transformation Chain:** Add, toggle, reorder, and configure arbitrary transformation stages. Output of stage $n$ automatically feeds as input into stage $n+1$.
- **17+ Built-in Operations:** Hex Decode/Encode, Base64 Decode/Encode, URL Decode/Encode, Caesar Shift, ROT13, Atbash, Reverse String, XOR with ASCII text key, XOR with Hex byte mask, Strip Whitespace, Uppercase, Lowercase, Shannon Entropy calculation, and Frequency Distribution analysis.
- **Live Intermediate Stage Inspection:** View intermediate textual states, execution errors, and dynamic Shannon entropy values per step.
- **Curated Recipe Presets:** Instant loading for common workflows: Defang & Decode, Caesar Bruteforce Stager, Multi-layer Stego Unmask, and Malicious Script Hex Deobfuscation.
- **Recipe Portability:** Export and import recipes as JSON files or clipboard strings.

### 7. Cryptographic Benchmark & Avalanche Arena (`/benchmark`)
Live browser hardware benchmarking and diffusion analysis:
- **Native Web Crypto Benchmarks:** Real client-side CPU speed tests on AES-256-GCM, AES-128-CBC, SHA-256, SHA-512, HMAC-SHA256, RSA-OAEP 2048-bit key exchange, and Kyber-768 NTT polynomial butterfly lattice arithmetic. Reports operations per second, throughput in MB/s, and average latency.
- **128-Bit Strict Avalanche Criterion (SAC) Grid:** Interactive 16-byte (128-bit) block visualizer. Flip individual input bits and observe immediate non-linear bit avalanche flips across the output block.
- **Shannon Diffusion Metrics:** Evaluates live Hamming distance between original and mutated states, output flip percentage (ideal SAC = 50.0%), and output Shannon entropy.

### 8. Mechanical Enigma Simulator
Electromechanical simulation of the German military Enigma I / M3 machine:
- **German QWERTZ Military Interface:** Physical keyboard layout with illuminated lampboard reacting to keystrokes.
- **Steckerbrett Plugboard:** Cross-connect letter pairs with patch cables; swaps are applied before entry into the entry wheel (ETW) and after return from the reflector.
- **Rotor Stepping & Double-Stepping Anomaly:** Faithfully models the mechanical pawl-and-ratchet mechanism, including the famous middle-rotor double-stepping anomaly.
- **Historical Rotor Library:** Includes Rotors I through V with authentic internal wiring and turnover notches (Q, E, V, J, Z), plus Reflector B (Umkehrwalze B).
- **10-Stage Signal Pathway:** Complete electrical circuit tracing from key press to lamp illumination.

### 9. Spaced-Repetition Study Flashcards (`/flashcards`)
Active recall study engine designed for mastery of mathematical concepts and cryptanalytic proofs:
- **185+ Rigorous Academic Cards:** Deeply populated across all 8 curriculum tracks: Classical Ciphers, Encodings & Finite Fields, Symmetric Block & Stream Ciphers, Hashes & MACs, Asymmetric Cryptosystems, Post-Quantum Lattice Cryptography, Protocols & ZKP, and Number Theory.
- **Complete Formal Notation:** Back of cards include exact algebraic identities, modular arithmetic proofs, and vulnerability criteria.
- **3D Flip Animation & Active Recall Grading:** Keyboard-accessible self-assessment (Space to flip, 1 for "Needs Review", 2 for "Mastered", arrow keys for navigation).
- **Persistent Curriculum Mastery Telemetry:** Tracks known vs. review vs. unstudied cards in local storage with live percentage mastery meters and search/filter controls.

---

## CTF Challenge Arena & Live Sandboxes

Put your cryptographic knowledge into practice with 45+ built-in Capture The Flag (CTF) challenges and interactive vulnerability sandboxes:

- **Realistic Intercepted Artifacts:** Every challenge provides copyable raw ciphertexts, hex payloads, or public key parameters to analyze and decrypt.
- **Embedded Decryption Workbench:** Each challenge card features an inline interactive workbench where users can test Caesar shifts, ROT13, Base64/Hex decodes, custom XOR keys, and modular exponentiation/inverses (`pow(a, b, m)`, `inv(a, m)`) without leaving the card.
- **Progressive Hint Ladders:** Multi-stage hints provide directional clues and mathematical strategy before revealing any solution.
- **Extensive Category Spectrum (45+ Challenges):**
  - **Classical Cryptanalysis & Transposition:** Monoalphabetic substitution with natural letter frequencies, Vigenère unknown-period Kasiski / Index of Coincidence analysis, Playfair 5×5 matrix digraph deduction, Two-Time Pad keystream reuse ($C_1 \oplus C_2$) crib dragging, 2-rail zig-zag rail fence decipherment, and columnar keyword transposition matrices.
  - **Data Encoding & Token Security:** Nested multi-layer encoding stripping (Hex $\rightarrow$ Base64 $\rightarrow$ ASCII), JWT `alg: none` signature bypasses, and JWT HMAC-RSA algorithm key confusion (CVE-2015-9235).
  - **Modern Symmetric & AEAD Exploits:** CBC bit-flipping XOR mask calculations, ECB cut-and-paste block independence privilege escalation, live Vaudenay CBC padding oracle exploitation, Double DES Meet-in-the-Middle ($2^{57}$ operations), and the AES-GCM Forbidden Attack recovering hash keys from reused nonces.
  - **Side-Channel & Hardware Fault Attacks:** Boneh-DeMillo-Lipton Bellcore laser fault injection attack on RSA-CRT via $\gcd(S' - S, N)$, and microsecond latency analysis exploiting non-constant-time byte comparisons (`strcmp` timing leaks).
  - **Blockchain & Cryptographic Trees:** EVM secp256k1 ECDSA High-S signature malleability ($s' = n - s \pmod n$) transaction hash spoofing, and RFC 6962 `0x00` leaf domain separation defeating Merkle tree second pre-image inclusion proofs.
  - **Mathematical & Number Theory:** Extended Euclidean modular inverses, Chinese Remainder Theorem simultaneous congruences, and Fermat factorization of close primes ($p \approx q$).
  - **Asymmetric & RSA Attacks:** Small public exponent ($e=3$) integer cube root attacks, Bleichenbacher PKCS#1 v1.5 low-exponent signature forgeries, Håstad's broadcast CRT attacks, RSA Common Modulus attacks via Bézout coefficients ($r e_1 + s e_2 = 1$), batch GCD factorization of low-entropy IoT keys ($\gcd(N_1, N_2) > 1$), Wiener's continued fractions attack on small private exponent ($d < \frac{1}{3}N^{1/4}$), and totient leakage factorization ($\phi(N)$ quadratic roots).
  - **Diffie-Hellman & Elliptic Curves:** Small subgroup confinement attacks ($A' \equiv -1$), parameter injection MITM, smooth group order Pohlig-Hellman discrete logarithm decomposition, and PlayStation 3 ECDSA nonce reuse ($k$-collision private key recovery).
  - **Hashes, PRNGs & Stream Ciphers:** Merkle–Damgård hash length extension attacks on raw SHA-256, Birthday collision bounds, Linear Congruential Generator (LCG) state prediction, and Fluhrer-Mantin-Shamir (FMS) keystream leakage on 802.11b WEP.
  - **Post-Quantum Lattices & Knapsacks:** Babai's closest vector projection in 2D lattices, Kyber ML-KEM noise overflow failure thresholds ($|e| \ge \lfloor q/4 \rfloor$), Dilithium rejection sampling distribution leakage, and Merkle-Hellman superincreasing knapsack subset sum recovery.
  - **Homomorphic Cryptography & Protocols:** Paillier additive homomorphic electronic voting ballot aggregation ($c_1 \cdot c_2 \pmod{n^2} = m_1 + m_2 \pmod n$), and KRACK (Key Reinstallation Attack) IEEE 802.11i WPA2 4-Way Handshake nonce reset exploitation.
  - **Digital Forensics & Zero-Knowledge Proofs:** Spatial LSB bit plane payload extraction, PNG `IEND` trailing ZIP polyglot detection, Shamir $(k, n)$ secret sharing reconstruction over $\text{GF}(257)$, and Schnorr identification soundness limits against imposter provers.

### Live Interactive Padding Oracle Sandbox
An authentic software replica of Serge Vaudenay's 2002 chosen-ciphertext attack on PKCS#7 block cipher padding:
- **Four Live Register Arrays:** Displays the 16-byte original ciphertext block $C_0$, the mutated probe block $C'_0$, the recovered intermediate block $I = D_K(C_1)$, and the final decrypted plaintext block $P = I \oplus C_0$.
- **Manual & Auto-Solve Exploit Engines:** Step through candidate bytes ($0x00$ through $0xFF$) one at a time or trigger automated solving with configurable delay.
- **Live HTTP Wire Diagnostics:** Visualizes server oracle reactions: valid padding returns `HTTP 200 OK (Padding Valid)` while invalid padding yields `HTTP 500 Internal Server Error (Decryption Failed)`.
- **Mathematical Proof & Circuit Mechanics:** Demonstrates how setting target padding byte $pad$ forces $C'_{0, k} = I_k \oplus pad$, enabling exact algebraic recovery of $I_k$ and subsequent plaintext deduction $P_k = I_k \oplus C_{0, k}$ without ever recovering key $K$.

### Live Interactive Håstad Broadcast CRT Sandbox
An interactive laboratory solver demonstrating Johan Håstad's 1985 broadcast attack on RSA with small public exponents ($e = 3$):
- **Configurable Secret & Moduli:** Input an arbitrary secret message $m$ and three distinct pairwise coprime RSA moduli ($N_1, N_2, N_3$) under public exponent $e = 3$.
- **Step 1 — Multi-Recipient Broadcast Encryption:** Computes the three intercepted modular ciphertexts $c_1 \equiv m^3 \pmod{N_1}$, $c_2 \equiv m^3 \pmod{N_2}$, and $c_3 \equiv m^3 \pmod{N_3}$.
- **Step 2 — Chinese Remainder Theorem Reconstruction:** Computes the compound product $N = N_1 \cdot N_2 \cdot N_3$, partial products $M_i = N / N_i$, and Bézout modular inverses $M_i^{-1} \pmod{N_i}$ via the Extended Euclidean Algorithm to assemble $C \equiv m^3 \pmod N$.
- **Step 3 — Exact Integer Root Recovery:** Demonstrates that because $m < N_i$, $m^3 < N_1 \cdot N_2 \cdot N_3$. Therefore, no modular wrap-around occurs over the compound modulus $N$. Taking the exact real cube root $\sqrt[3]{C}$ over the integers $\mathbb{Z}$ immediately recovers the secret plaintext $m$ without factoring any modulus.

---

## Lab Notebook, Cryptanalyst Ranking & Verifiable Certificate

Specimen includes a built-in researcher portfolio, ranking engine, and academic certification generator:

- **6-Tier Cryptanalyst Ranking System:**
  1. *Recruit Cryptanalyst (Tier I):* Classical substitution, monoalphabetic frequency analysis, and elementary encodings.
  2. *Cipher Operator (Tier II):* Polyalphabetic cryptanalysis, Kasiski inspection, Index of Coincidence, and rotor stepping.
  3. *Symmetric Specialist (Tier III):* AES Galois field arithmetic, Feistel networks, and CBC padding oracles.
  4. *Number Theorist (Tier IV):* RSA factorization, CRT exploitation, and discrete logarithms.
  5. *Protocol Exploiter (Tier V):* TLS 1.3 handshakes, replay vulnerabilities, and zero-knowledge proofs.
  6. *Master Post-Quantum Cryptanalyst (Tier VI / Apex):* High-dimensional lattice reduction and post-quantum transitions.
- **Verifiable Academic Certificate:** Formal certificate modal with institutional borders, candidate name, completion metrics, and a cryptographically calculated SHA-256 verification fingerprint over the candidate dossier. Includes a dedicated single-page print stylesheet for physical diploma generation.
- **Curriculum Audit Checklist:** Interactive tracking for all 75 lessons and 45+ CTF challenges with local browser persistence.
- **Researcher Field Notes:** Persistent Markdown laboratory log for documenting findings, equations, and audit steps.

---

## Instant Format Auto-Detector & Assistant

Accessible via the universal shortcut **`⌘K`** (or **`Ctrl+K`**), the smart assistant provides:

- **Instant Format Auto-Detection:** Automatically identifies over 30 data representations—including Base64, Hexadecimal, PEM certificates, JSON Web Tokens (JWT), Bitcoin/Ethereum addresses, Argon2/Bcrypt hash strings, and classical ciphertexts.
- **Cryptographic Math Calculator:** Type natural mathematical expressions like `gcd(1071, 462)`, `inv(3, 11)`, `pow(7, 13, 29)`, or `sha256 'hello'` for instant calculations with step-by-step traces.
- **Advisory Guidance:** Ask conceptual questions (e.g., *"Why is ECB broken?"*, *"Which cipher to encrypt files?"*, *"Can quantum computers break RSA?"*) to receive concise, standards-aligned answers with direct links to relevant tools.

---

## Universal Cryptographic Scratchpad (`Alt+S`)

Specimen features a persistent floating cryptographic scratchpad and data piping dock accessible across all routes:
- **Global Keybinding (`Alt+S`):** Toggle the drawer from anywhere in the app to view stored tokens, keys, ciphertexts, and intermediate values.
- **One-Click Tool Piping:** Send any saved snippet directly into the Format Inspector, SHA-256 Hash Engine, Base64 Converter, Hex Converter, or AES State Engine with a single click.
- **Type Auto-Tagging:** Automatically detects and tags snippets as `hex`, `base64`, `hash`, `key`, or `text`.
- **Local Persistence:** All scratchpad items remain safely cached in your browser's `localStorage` across page reloads without cloud transmission.

---

## Cryptographic Standards Matrix

Specimen maintains an up-to-date comparative matrix of industry standards, NIST Special Publications, and IETF RFCs:

| Standard | Specification | Category | Classical Security | Quantum Resistance | Recommended Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AES-256-GCM** | NIST SP 800-38D | AEAD Block Cipher | 256 bits | Safe (128-bit via Grover) | Primary choice for bulk data at rest & in transit |
| **ChaCha20-Poly1305** | RFC 8439 | AEAD Stream Cipher | 256 bits | Safe (128-bit via Grover) | Mobile & devices without hardware AES-NI |
| **ML-KEM-768** | NIST FIPS 203 (Kyber) | Post-Quantum KEM | Category 3 (AES-192) | Quantum-Safe (Module-LWE) | Primary general-purpose key encapsulation |
| **ML-DSA-65** | NIST FIPS 204 (Dilithium) | Post-Quantum Signature | Category 3 (AES-192) | Quantum-Safe (Module-Lattice) | Primary post-quantum digital signature |
| **SLH-DSA** | NIST FIPS 205 (SPHINCS+) | Stateless Hash Signature | Category 1 / 3 / 5 | Quantum-Safe (Hash-based) | High-assurance fallback without lattice assumptions |
| **Ed25519** | RFC 8032 / FIPS 186-5 | Elliptic Curve Signature | 128 bits | Vulnerable (Broken by Shor) | Current industry standard classical signature |
| **Argon2id** | RFC 9106 | Password KDF | Memory-Hard | Quantum-Safe | Secure password hashing resisting GPU/ASIC attacks |

---

## Privacy, Offline Field Use & Security Guarantees

1. **Zero Data Egress:** Specimen contains zero tracking scripts, analytics trackers, or external API endpoints. All cryptographic operations run 100% locally in your browser sandbox.
2. **Offline Progressive Web App (PWA):** Equipped with a service worker and web application manifest, Specimen can be installed as a standalone desktop application that runs completely offline without an active internet connection.
3. **Typography & Minimal Aesthetics:** Designed in a formal Swiss international style with high contrast, legible mathematical typography, clean layout hierarchies, and strictly zero decorative emojis—ensuring a focused, professional research environment.
