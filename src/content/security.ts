import type { Lesson } from "./types";

export const securityLessons: Lesson[] = [
  {
    "id": "cia-triad",
    "trackId": "security",
    "title": "The CIA triad and threat modelling",
    "subtitle": "Deciding what you are actually defending",
    "formula": {
      "expr": "Confidentiality · Integrity · Availability",
      "note": "Add authentication, authorisation and accountability and you have the vocabulary for almost every security requirement."
    },
    "body": [
      "Threat modelling asks four questions: what are we building, what can go wrong, what will we do about it, and did we do a good enough job? STRIDE gives a checklist of what can go wrong — spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege.",
      "Security controls come in layers: preventive (encryption, access control), detective (logging, alerting) and corrective (backups, incident response). Defence in depth assumes each layer will eventually fail.",
      "Least privilege and fail-safe defaults do more real-world good than any cipher choice. Most breaches exploit misconfiguration, stolen credentials or unpatched software — not mathematics."
    ],
    "keyPoints": [
      "Model the threat before choosing a control.",
      "Layer preventive, detective and corrective controls.",
      "Least privilege and safe defaults prevent more incidents than crypto choices."
    ],
    "pitfalls": [
      "Confusing Confidentiality with Integrity: Encrypting telemetry with CBC without a MAC still allows bit-flipping attacks that alter readings without decryption.",
      "Designing security as an afterthought ('bolt-on security'): Retrofitting encryption into an unauthenticated API inevitably leaves architectural backdoors.",
      "Ignoring Availability: Complex multi-round cryptographic handshakes can be exploited by unauthenticated attackers to exhaust server CPU and memory (algorithmic DoS).",
      "Equating compliance with security: Passing a checklist audit does not guarantee resilience against targeted threat actors."
    ],
    "workedExample": {
      "title": "STRIDE Threat Modeling of an IoT Pacemaker Telemetry Gateway",
      "steps": [
        {
          "label": "1. Spoofing",
          "detail": "Attacker impersonates cardiac monitor. Mitigation: Mutual TLS (mTLS) with hardware-rooted X.509 certificates."
        },
        {
          "label": "2. Tampering",
          "detail": "Attacker alters telemetry in flight. Mitigation: Authenticated Encryption with Associated Data (AES-GCM)."
        },
        {
          "label": "3. Repudiation",
          "detail": "Clinic denies receiving emergency shock alert. Mitigation: Digitally signed telemetry logs in append-only tamper-evident hash chain."
        },
        {
          "label": "4. Information Disclosure",
          "detail": "Eavesdropper snoops patient ECG traces on hospital WiFi. Mitigation: End-to-end TLS 1.3 with Perfect Forward Secrecy."
        },
        {
          "label": "5. Denial of Service",
          "detail": "RF jamming or API flooder suppresses cardiac alarms. Mitigation: Dual-band backup transmitter, local flash logging, and rate limiting."
        },
        {
          "label": "6. Elevation of Privilege",
          "detail": "Malicious payload exploits telemetry parser. Mitigation: Sandboxed parser with unprivileged daemon user (least privilege)."
        }
      ],
      "outcome": "Identifies and mitigates high-impact system risks before writing a single line of production code."
    },
    "references": [
      {
        "title": "NIST SP 800-30 Rev 1: Guide for Conducting Risk Assessments",
        "source": "NIST Special Publication",
        "url": "https://csrc.nist.gov/pubs/sp/800/30/r1/final",
        "description": "Comprehensive federal guidelines on identifying vulnerabilities, threat sources, and impact analysis.",
        "type": "standard"
      },
      {
        "title": "OWASP Threat Modeling Cheat Sheet",
        "source": "OWASP",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
        "description": "Practical guide to STRIDE, DREAD, and threat modeling workflows for software engineering.",
        "type": "tutorial"
      },
      {
        "title": "RFC 3552: Guidelines for Writing RFC Text on Security Considerations",
        "source": "IETF RFC",
        "url": "https://datatracker.ietf.org/doc/html/rfc3552",
        "description": "The definitive Internet threat model: attackers can read, modify, replay, or inject arbitrary packets.",
        "type": "rfc"
      }
    ],
    glossary: [
      { term: "STRIDE", def: "A threat modeling framework categorizing threats into Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege." },
      { term: "Defense in Depth", def: "A security design principle where multiple independent layers of defense are deployed so that the failure of any single layer does not compromise the system." },
      { term: "Least Privilege", def: "The principle that every security principal, program, or system component must only possess the bare minimum access privileges necessary to perform its function." },
      { term: "Threat Modeling", def: "A structured process for identifying potential security threats and vulnerabilities, quantifying risk, and selecting appropriate architectural mitigations." }
    ]
  },
  {
    "id": "authn-authz",
    "trackId": "security",
    "title": "Authentication and authorisation",
    "subtitle": "Who you are versus what you may do",
    "formula": {
      "expr": "factors: something you know · have · are",
      "note": "Multi-factor authentication requires evidence from two different categories. SMS codes are a weak second factor because of SIM-swap attacks; hardware keys using WebAuthn are the strongest."
    },
    "body": [
      "Authentication establishes identity; authorisation decides permissions. Conflating them causes broken access control — the most common serious web vulnerability, where a user simply changes an ID in a URL and reads someone else's data.",
      "Sessions must be protected end to end: random session identifiers, HttpOnly and Secure cookies, SameSite to blunt cross-site request forgery, rotation on privilege change, and real server-side invalidation on logout.",
      "Authorise on the server, on every request, against the authenticated identity. Client-side checks are user-interface convenience, never security — anything the browser decides, the user can change."
    ],
    "keyPoints": [
      "Never trust a client-side authorisation check.",
      "Check permissions per request, per object.",
      "WebAuthn / passkeys beat passwords and SMS codes."
    ],
    "pitfalls": [
      "Client-side authorization checks: Hiding the 'Delete' button in React/Vue does nothing to stop an attacker sending a direct POST /api/delete.",
      "Confusing Authentication (Who you are) with Authorization (What you can do): Passing a valid JWT does not mean the user is authorized for every ID inside the payload.",
      "Using SMS/Voice for MFA: Susceptible to SIM swapping, SS7 interception, and phishing proxies (use WebAuthn/FIDO2 hardware keys instead).",
      "Storing JWTs in localStorage: Vulnerable to XSS token exfiltration; session cookies should use HttpOnly, Secure, and SameSite=Strict."
    ],
    "workedExample": {
      "title": "Preventing IDOR / BOLA at the Data Access Layer",
      "steps": [
        {
          "label": "1. Inbound Request",
          "detail": "GET /api/documents/1042 with Cookie: session=s_987654321 (Logged in as user_id=42)."
        },
        {
          "label": "2. Vulnerable Query",
          "detail": "SELECT * FROM documents WHERE id = 1042 (Doc 1042 belongs to user 99 — unauthorized access granted!)."
        },
        {
          "label": "3. Enforced Authorization",
          "detail": "SELECT * FROM documents WHERE id = 1042 AND (owner_id = 42 OR tenant_id IN (SELECT tenant_id FROM memberships WHERE user_id = 42 AND role = 'viewer'))."
        },
        {
          "label": "4. Result Check",
          "detail": "0 rows returned -> Handler issues HTTP 404 Not Found (or 403 Forbidden without leaking existence)."
        }
      ],
      "outcome": "Broken object-level authorization is neutralized by scoping database queries to the authenticated session principal."
    },
    "references": [
      {
        "title": "OWASP Top 10: Broken Access Control (A01)",
        "source": "OWASP",
        "url": "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
        "description": "The #1 web application security risk, detailing BOLA, IDOR, and privilege escalation mitigations.",
        "type": "standard"
      },
      {
        "title": "NIST SP 800-63B: Digital Identity Guidelines - Authentication and Lifecycle",
        "source": "NIST Special Publication",
        "url": "https://pages.nist.gov/800-63-3/sp800-63b.html",
        "description": "Federal standard forbidding periodic password expiration, password hints, and discouraging SMS MFA.",
        "type": "standard"
      },
      {
        "title": "W3C WebAuthn Level 3 Recommendation",
        "source": "W3C Standard",
        "url": "https://www.w3.org/TR/webauthn-3/",
        "description": "FIDO2 / Web Authentication specification enabling phishing-resistant public-key credentials.",
        "type": "spec"
      }
    ],
    "toolId": "password-entropy",
    glossary: [
      { term: "Authentication (AuthN)", def: "The process of verifying the claimed identity of a user, process, or device ('Who are you?')." },
      { term: "Authorization (AuthZ)", def: "The process of determining whether an authenticated entity has permission to perform a specific action on a specific resource ('What are you allowed to do?')." },
      { term: "BOLA / IDOR", def: "Broken Object Level Authorization (Insecure Direct Object Reference): a vulnerability where an API exposes direct record IDs without verifying tenant ownership." },
      { term: "WebAuthn (FIDO2)", def: "A modern web standard for passwordless, phishing-resistant public-key authentication backed by hardware security keys or device biometrics." }
    ]
  },
  {
    "id": "passwords",
    "trackId": "security",
    "title": "Passwords, entropy and cracking",
    "subtitle": "What attackers actually do with a stolen database",
    "formula": {
      "expr": "H = L · log₂(pool size)",
      "badge": "bits of entropy",
      "note": "A 12-character password from a 95-character pool carries about 79 bits — if it is genuinely random. Human-chosen passwords carry far less, because attackers guess patterns, not characters."
    },
    "body": [
      "Real cracking uses leaked password lists, dictionary rules and mutation patterns (capitalise the first letter, append a year, swap a for @). These reflect how people actually build passwords, so pattern-based guessing beats brute force by orders of magnitude.",
      "Good policy: enforce a minimum length of 12 or more, screen candidates against known-breached lists, drop forced periodic rotation and composition rules, allow long passphrases and password managers, and rate-limit plus monitor login attempts.",
      "Credential stuffing — replaying username and password pairs from other breaches — succeeds because of reuse. Multi-factor authentication is the single most effective defence available."
    ],
    "keyPoints": [
      "Length and unpredictability beat character-class rules.",
      "Screen against breach lists instead of forcing rotation.",
      "Multi-factor authentication stops credential stuffing."
    ],
    "pitfalls": [
      "Using Fast Hash Algorithms: Hashing passwords with MD5, SHA-256, or SHA-512 enables billions of guesses per second on consumer GPUs. Always use Argon2id, bcrypt, or scrypt.",
      "Predictable Salt Generation: Reusing a static salt across users or generating salts with Math.random() defeats rainbow table resistance.",
      "Arbitrary Maximum Length Limits: Truncating passwords to 16 or 32 characters weakens passphrases and can cause unexpected authentication bugs.",
      "Periodic Forced Password Expiration: Forcing changes every 90 days encourages users to make predictable incremental edits (Summer2023! -> Summer2024!)."
    ],
    "workedExample": {
      "title": "Measuring Password Search Space & Modern GPU Cracking Speed",
      "steps": [
        {
          "label": "1. Complex Pattern",
          "detail": "Password 'P@ssw0rd2024!' has 13 chars. Naive theoretical entropy: 13 · log₂(95) = 85.4 bits."
        },
        {
          "label": "2. Dictionary Reality",
          "detail": "Hashcat rule 'Password' + '@' + '0' + 'year' + 'symbol' reduces effective search space to just 2²⁶ combinations."
        },
        {
          "label": "3. Cracking Cost",
          "detail": "On an 8x RTX 4090 rig hashing NTLM @ 100 GH/s: 'P@ssw0rd2024!' is cracked in 0.0006 seconds."
        },
        {
          "label": "4. Diceware Passphrase",
          "detail": "'correct horse battery staple' (4 words from 7,776-word list) carries 4 · log₂(7776) = 51.7 bits of true random entropy."
        },
        {
          "label": "5. Memory-Hard Defense",
          "detail": "Using Argon2id (m=64MB, t=3): cracking speed drops to 1,000 hashes/sec; cracking the 4-word passphrase takes over 100,000 years."
        }
      ],
      "outcome": "Memory-hard slow hashing (Argon2id) combined with random word length defeats modern parallel GPU farms."
    },
    "references": [
      {
        "title": "RFC 9106: Argon2 Memory-Hard Function for Password Hashing",
        "source": "IETF RFC",
        "url": "https://datatracker.ietf.org/doc/html/rfc9106",
        "description": "Specification for Argon2d, Argon2i, and Argon2id, the winner of the Password Hashing Competition.",
        "type": "rfc"
      },
      {
        "title": "NIST SP 800-63B: Passwords and Memorized Secrets",
        "source": "NIST Special Publication",
        "url": "https://pages.nist.gov/800-63-3/sp800-63b.html#memsecret",
        "description": "Modern password policy guidance banning composition rules and mandating breach list screening.",
        "type": "standard"
      },
      {
        "title": "OWASP Password Storage Cheat Sheet",
        "source": "OWASP",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
        "description": "Recommended parameters and algorithms for secure password hashing in production.",
        "type": "tutorial"
      }
    ],
    "toolId": "password-entropy",
    glossary: [
      { term: "Password Entropy", def: "A logarithmic measure of password unpredictability expressed in bits: H = L · log₂(N), where L is length and N is the character pool size." },
      { term: "Credential Stuffing", def: "An automated cyberattack where lists of compromised username/password pairs are tested at scale against unrelated websites." },
      { term: "Memory-Hard Function", def: "A cryptographic algorithm (like Argon2id or scrypt) deliberately engineered to require massive RAM allocation, crippling parallel ASIC/GPU password cracking farms." },
      { term: "Diceware", def: "A method for creating cryptographically secure, easily memorable passphrases using physical dice rolls to select words randomly from a numbered wordlist." }
    ]
  },
  {
    "id": "web-attacks",
    "trackId": "security",
    "title": "Common web vulnerabilities",
    "subtitle": "Injection, XSS, CSRF, SSRF and broken access control",
    "formula": {
      "expr": "untrusted input + trusted context = vulnerability",
      "note": "Every injection class is one bug: data crossing into a place that interprets it as code. The fix is always context-aware escaping or a parameterised interface, never blocklists."
    },
    "body": [
      "SQL injection is solved by parameterised queries, which keep data and code in separate channels. Cross-site scripting is solved by contextual output encoding plus a strict Content Security Policy. Never build either defence out of string filtering.",
      "CSRF abuses ambient credentials: the browser attaches cookies to a request the user did not intend. SameSite cookies plus anti-CSRF tokens fix it. SSRF tricks the server into making requests to internal addresses — allow-list destinations and block link-local metadata endpoints.",
      "Broken access control tops the OWASP Top Ten. Enforce ownership checks on every object access, prefer unguessable identifiers, and deny by default so a forgotten route is closed rather than open."
    ],
    "keyPoints": [
      "Parameterise queries; encode output for its exact context.",
      "SameSite cookies plus tokens for CSRF; allow-lists for SSRF.",
      "Deny by default and verify object ownership every time."
    ],
    "pitfalls": [
      "Sanitizing via blocklists or regex filters: Attackers bypass filters with casing tricks, Unicode normalization, null bytes, or alternate SQL dialects.",
      "Relying on client-side input validation: Attackers bypass HTML5 forms and JavaScript validators using curl, Postman, or Burp Suite.",
      "Reflected and DOM-based XSS via innerHTML: Inserting unescaped user data into the DOM enables session token theft and keylogging. Use textContent or DOMPurify.",
      "Missing Anti-CSRF Protection on State-Changing Endpoints: Assuming HTTP POST is safe from cross-origin requests without SameSite cookies or CSRF tokens."
    ],
    "workedExample": {
      "title": "Neutralizing SQL Injection via Parameterized Prepared Statements",
      "steps": [
        {
          "label": "1. Hostile Input",
          "detail": "User input string: admin@bank.com' OR '1'='1"
        },
        {
          "label": "2. Vulnerable Concatenation",
          "detail": "query = 'SELECT * FROM users WHERE email = '' + input + '' AND active = 1' (Syntax evaluated: returns all records and grants admin!)."
        },
        {
          "label": "3. Parameterized Query",
          "detail": "query = 'SELECT * FROM users WHERE email = ? AND active = 1'; preparedStatement.setString(1, input);"
        },
        {
          "label": "4. Execution Boundary",
          "detail": "SQL AST template is compiled first; parameter is transmitted as pure literal binary data over wire."
        },
        {
          "label": "5. Engine Evaluation",
          "detail": "Database searches literally for email matching 'admin@bank.com\\' OR \\'1\\'=\\'1'. 0 rows matched; access denied."
        }
      ],
      "outcome": "Data is prevented from crossing the syntactic boundary into executable SQL command grammar."
    },
    "references": [
      {
        "title": "OWASP Top 10 Web Application Security Risks",
        "source": "OWASP",
        "url": "https://owasp.org/www-project-top-ten/",
        "description": "The definitive consensus standard on the most critical security flaws in modern web applications.",
        "type": "standard"
      },
      {
        "title": "CWE-89: SQL Injection Flaws and Mitigations",
        "source": "MITRE CWE",
        "url": "https://cwe.mitre.org/data/definitions/89.html",
        "description": "Root cause analysis, architectural mitigations, and demonstrative exploit examples.",
        "type": "spec"
      },
      {
        "title": "RFC 6265bis: Cookies - HTTP State Management (SameSite)",
        "source": "IETF RFC",
        "url": "https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis",
        "description": "Modern cookie security attributes preventing cross-site request forgery and data leakage.",
        "type": "rfc"
      }
    ],
    glossary: [
      { term: "Cross-Site Scripting (XSS)", def: "A vulnerability where an attacker injects malicious client-side JavaScript into web pages viewed by other users." },
      { term: "Cross-Site Request Forgery (CSRF)", def: "An attack that tricks an authenticated victim into executing unwanted state-changing actions on a trusted web application." },
      { term: "Server-Side Request Forgery (SSRF)", def: "An exploit where an attacker forces a backend server to initiate unauthorized HTTP requests to internal networks or cloud metadata APIs (e.g., 169.254.169.254)." },
      { term: "Content Security Policy (CSP)", def: "An HTTP response header that restricts the domains and resources from which browser scripts, styles, and assets can be loaded." }
    ]
  },
  {
    "id": "side-channels",
    "trackId": "security",
    "title": "Side-channel attacks",
    "subtitle": "When correct maths still leaks the key",
    "formula": {
      "expr": "leak channels: time · power · cache · electromagnetic · acoustic",
      "note": "Any observable that depends on secret data is a channel. Constant-time code, branch-free comparisons and blinding are the standard defences."
    },
    "body": [
      "Timing attacks measure how long an operation takes. A string comparison that exits on the first mismatched byte lets an attacker recover a MAC tag one byte at a time; always use a constant-time comparison for secrets.",
      "Cache attacks exploit table lookups whose addresses depend on the key — the reason table-based AES implementations were replaced by hardware instructions and bit-sliced code. Power analysis reads the key from a smartcard's consumption trace. Padding oracles turn a single distinguishable error message into full plaintext recovery.",
      "The design rule: control flow and memory access patterns must never depend on secret data. This is also why you should not roll your own implementation of a primitive, even when the algorithm is public and simple."
    ],
    "keyPoints": [
      "Constant-time comparison for every secret value.",
      "No secret-dependent branches or memory indices.",
      "Error messages must not distinguish failure causes."
    ],
    "pitfalls": [
      "Data-Dependent Branching: Using 'if (secret_bit == 1)' causes CPU branch predictors and instruction caches to leak key bits via execution latency.",
      "Table Lookups with Secret Indices: Looking up S-boxes in AES via arr[state ^ key] leaks the cache line hit/miss profile (Cache-timing / Meltdown / Spectre style).",
      "Compilers optimizing away constant-time code: C/Rust optimizers can recognize XOR loops and optimize them back into early-exit jumps if volatile or constant-time intrinsics are omitted.",
      "Different Error Responses: Returning 'User not found' vs 'Incorrect password' lets attackers enumerate valid accounts via response time and status codes."
    ],
    "workedExample": {
      "title": "Recovering a 32-Byte Authentication Tag via Early-Exit Timing Leaks",
      "steps": [
        {
          "label": "1. Vulnerable Code",
          "detail": "for (let i=0; i<len; i++) { if (a[i] !== b[i]) return false; } (Returns false on first byte mismatch)."
        },
        {
          "label": "2. Testing Byte 0",
          "detail": "Attacker submits 256 requests with varying byte 0. When byte 0 matches, function checks byte 1, taking ~15 ns longer."
        },
        {
          "label": "3. Statistical Analysis",
          "detail": "Over 5,000 samples per byte, network jitter is averaged out. Byte 0 is identified with >99.9% statistical confidence."
        },
        {
          "label": "4. Linear Complexity",
          "detail": "Attacker repeats for bytes 1 through 31. Total complexity is only 32 · 256 = 8,192 requests rather than 2²⁵⁶ brute force."
        },
        {
          "label": "5. Constant-Time Fix",
          "detail": "let diff = 0; for (let i=0; i<len; i++) { diff |= (a[i] ^ b[i]); } return diff === 0; (No early exit; timing delta is 0 ns)."
        }
      ],
      "outcome": "Eliminating secret-dependent branches renders timing analysis completely uninformative to attackers."
    },
    "references": [
      {
        "title": "Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS (Paul Kocher, 1996)",
        "source": "Seminal Paper",
        "url": "https://www.paulkocher.com/doc/TimingAttacks.pdf",
        "description": "The foundational academic paper discovering side-channel timing attacks against public key cryptography.",
        "type": "paper"
      },
      {
        "title": "Cache-Timing Attacks on AES (Daniel J. Bernstein, 2005)",
        "source": "Academic Research",
        "url": "https://cr.yp.to/antiforgery/cachetiming-20050414.pdf",
        "description": "Demonstration of remote key extraction from OpenSSL AES due to CPU cache lookup latency.",
        "type": "paper"
      },
      {
        "title": "Guidelines for Writing Constant-Time Software",
        "source": "BearSSL Documentation",
        "url": "https://bearssl.org/constanttime.html",
        "description": "Thomas Pornin's authoritative handbook on branch-free arithmetic, boolean masking, and compiler evasion.",
        "type": "tutorial"
      }
    ],
    "toolId": "timing-attack",
    glossary: [
      { term: "Side-Channel Attack", def: "An attack enabled by physical implementation artifacts — such as execution timing, power consumption, or electromagnetic emissions — rather than mathematical flaws in the algorithm." },
      { term: "Constant-Time Code", def: "Software engineered so that execution latency and memory access patterns are strictly independent of secret keys or sensitive inputs." },
      { term: "Cache-Timing Attack", def: "An attack where an adversary measures CPU cache hit/miss latencies to infer which table lookup addresses or memory lines were accessed during encryption." },
      { term: "Branch Predictor Leak", def: "A vulnerability where speculative execution or branch prediction hardware reveals conditional execution paths that depended on private data." }
    ]
  },
  {
    "id": "padding-oracle",
    "trackId": "security",
    "title": "Padding oracle attacks",
    "subtitle": "How one error message decrypts entire messages",
    "formula": {
      "expr": "Pᵢ = D_K(Cᵢ) ⊕ Cᵢ₋₁,  PKCS#7 leak",
      "badge": "Vaudenay 2002",
      "note": "By toggling bytes in ciphertext block C_{i-1} and observing whether the server returns 'invalid padding' or 'invalid message', an attacker decodes byte-by-byte in at most 256 queries per byte."
    },
    "body": [
      "In 2002, Serge Vaudenay showed that standard CBC mode with PKCS#7 padding is catastrophically vulnerable if an application distinguishes between bad padding and other application errors. This broke SSL 3.0 (POODLE), TLS 1.0 (Lucky Thirteen), and XML encryption.",
      "The attacker malleates the preceding ciphertext block byte by byte. When the modified block produces a decrypted byte ending in 0x01, the padding check passes. The attacker now knows D_K(C_i) ⊕ C'_{i-1} = 0x01, which immediately reveals the original plaintext byte!",
      "The fundamental fix is Authenticated Encryption (AEAD). With AES-GCM or HMAC, the authentication tag is checked FIRST in constant time. If any byte was altered, the whole message is rejected before padding is ever parsed."
    ],
    "keyPoints": [
      "Never decrypt without verifying an authentication tag first.",
      "Uniform error messages alone do not stop timing-based padding oracles.",
      "Use AES-GCM or ChaCha20-Poly1305 to eliminate CBC padding attacks."
    ],
    "pitfalls": [
      "Using Unauthenticated CBC Mode: Encrypting with CBC mode without an authenticated HMAC (or checking HMAC after decryption) makes padding oracle attacks possible.",
      "Mac-Then-Decrypt Ordering: Verifying padding before checking the cryptographic MAC gives the attacker an oracle. The rule is always Authenticate-Then-Decrypt.",
      "Assuming Generic Error Messages Stop the Attack: Even if both errors return HTTP 500, microscopic timing differences in decryption failure allow attackers to determine if padding was valid.",
      "Custom Padding Schemes: Inventing home-grown zero-padding or delimiter schemes often introduces worse padding or truncating bugs."
    ],
    "workedExample": {
      "title": "CBC Plaintext Byte Decryption via Vaudenay's PKCS#7 Padding Oracle",
      "steps": [
        {
          "label": "1. Target Setup",
          "detail": "Target block C₁, preceding block C₀. Decryption: P₁[15] = D_K(C₁)[15] ⊕ C₀[15]."
        },
        {
          "label": "2. Craft Probe Block",
          "detail": "Attacker creates C₀' with random bytes 0..14 and sweeps byte 15 through values 0x00 to 0xFF."
        },
        {
          "label": "3. Oracle Query",
          "detail": "Server decrypts D_K(C₁) ⊕ C₀' and checks PKCS#7 padding. For 255 values, padding is invalid (Error 500)."
        },
        {
          "label": "4. Oracle Success",
          "detail": "At C₀'[15] = 0x7E, decrypted last byte equals 0x01 (valid 1-byte padding, 200 OK or Bad Signature)."
        },
        {
          "label": "5. Algebraic Recovery",
          "detail": "D_K(C₁)[15] ⊕ 0x7E = 0x01 ⇒ D_K(C₁)[15] = 0x7E ⊕ 0x01 = 0x7F."
        },
        {
          "label": "6. Plaintext Decoded",
          "detail": "P₁[15] = D_K(C₁)[15] ⊕ C₀[15] = 0x7F ⊕ C₀[15]. Decoded in at most 256 requests!"
        }
      ],
      "outcome": "Plaintext is completely reconstructed without knowing the AES key. AEAD (AES-GCM) eliminates the attack entirely."
    },
    "references": [
      {
        "title": "Security Flaws Induced by CBC Padding (Serge Vaudenay, EUROCRYPT 2002)",
        "source": "IACR ePrint",
        "url": "https://www.iacr.org/cryptodb/data/paper.php?pubkey=1534",
        "description": "The landmark EUROCRYPT paper formalizing padding oracle attacks against block cipher modes.",
        "type": "paper"
      },
      {
        "title": "The POODLE Attack: Padding Oracle On Downgraded Legacy Encryption",
        "source": "Google Security Advisory",
        "url": "https://www.openssl.org/~bodo/ssl-poodle.pdf",
        "description": "How padding oracles in SSLv3 forced the worldwide retirement of legacy SSL protocol suites.",
        "type": "paper"
      },
      {
        "title": "RFC 7366: Encrypt-then-MAC for Transport Layer Security (TLS)",
        "source": "IETF RFC",
        "url": "https://datatracker.ietf.org/doc/html/rfc7366",
        "description": "Standard specifying Encrypt-then-MAC to prevent timing and padding oracle attacks in TLS.",
        "type": "rfc"
      }
    ],
    "toolId": "padding-oracle",
    glossary: [
      { term: "Padding Oracle", def: "A cryptographic vulnerability where an attacker uses error codes or timing responses from padding verification to decrypt ciphertext blocks." },
      { term: "PKCS#7 Padding", def: "A standard padding format for block ciphers where N padding bytes each take the value N (e.g. four bytes of padding are each 0x04)." },
      { term: "Vaudenay Attack", def: "Serge Vaudenay's 2002 cryptanalytic technique that deciphers CBC ciphertexts by altering preceding ciphertext blocks to trigger padding responses." },
      { term: "Authenticated Encryption (AEAD)", def: "A cipher mode (e.g. AES-GCM) that simultaneously provides confidentiality, integrity, and authenticity guarantees in a single cryptographic primitive." }
    ]
  },
  {
    "id": "zero-knowledge-proofs",
    "trackId": "security",
    "title": "Zero-knowledge proofs",
    "subtitle": "Proving truth without revealing information",
    "formula": {
      "expr": "Completeness · Soundness · Zero-Knowledge",
      "badge": "ZKP / zk-SNARKs",
      "note": "The prover convinces the verifier that a statement is true without disclosing any secret witness. Schnorr's protocol proves knowledge of discrete log x in y = g^x."
    },
    "body": [
      "Goldwasser, Micali and Rackoff introduced Zero-Knowledge Proofs in 1985. A ZKP must satisfy three formal properties: Completeness (an honest prover always convinces the verifier), Soundness (a dishonest prover cannot convince the verifier except with negligible probability), and Zero-Knowledge (the verifier learns nothing except that the statement is true).",
      "Interactive proofs follow a Commitment-Challenge-Response structure (the Sigma protocol). The prover commits to a random nonce, the verifier issues a random challenge, and the prover responds. The Fiat-Shamir heuristic converts this into a non-interactive proof by hashing the commitment and statement to generate the challenge.",
      "Modern ZKPs power privacy cryptocurrencies (Zcash, Tornado Cash), Ethereum Layer-2 rollups (zk-Rollups), anonymous credentials, and privacy-preserving identity verification (proving you are over 18 without revealing your birthdate or name)."
    ],
    "keyPoints": [
      "Proof of knowledge with zero data leakage.",
      "Sigma protocols: Commitment → Challenge → Response.",
      "Foundation of modern privacy-preserving computing and rollups."
    ],
    "pitfalls": [
      "Weak Randomness in Nonce Generation: Reusing or leaking the nonce v allows anyone to calculate the private key x = (v - r) / c mod q.",
      "Missing Fiat-Shamir Binding: If the challenge hash H(commitment) does not include the public key and message statement, proofs can be forged via malleability attacks.",
      "Trusted Setup Vulnerabilities: In zk-SNARKs requiring trusted setups (Groth16), compromise of toxic waste parameters enables unlimited forged valid proofs.",
      "Under-Constrained Circuits: In ZK smart contracts, failing to constrain all intermediate signal wires allows malicious provers to satisfy polynomial checks with rogue inputs."
    ],
    "workedExample": {
      "title": "Schnorr Identification Protocol (Proving Discrete Log Knowledge)",
      "steps": [
        {
          "label": "1. Setup",
          "detail": "Public group: prime p = 23, generator g = 5. Secret key x = 6. Public key y = 5⁶ mod 23 = 8."
        },
        {
          "label": "2. Commitment",
          "detail": "Prover picks random ephemeral nonce v = 4. Computes commitment t = gᵛ mod p = 5⁴ mod 23 = 4. Sends t to Verifier."
        },
        {
          "label": "3. Challenge",
          "detail": "Verifier sends random challenge c = 3 back to Prover."
        },
        {
          "label": "4. Response",
          "detail": "Prover calculates r = v - c·x mod (p - 1) = 4 - (3 · 6) = -14 ≡ 8 (mod 22). Sends r = 8 to Verifier."
        },
        {
          "label": "5. Verification",
          "detail": "Verifier checks: gʳ · yᶜ mod p == (5⁸ · 8³ mod 23) = (16 · 6 mod 23) = 96 mod 23 = 4 == t. Verification succeeds!"
        }
      ],
      "outcome": "Verifier is 100% convinced Prover knows secret x = 6, but Verifier learned zero bits of x."
    },
    "references": [
      {
        "title": "The Knowledge Complexity of Interactive Proof Systems (Goldwasser, Micali, Rackoff, 1985)",
        "source": "Seminal Paper",
        "url": "https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Proof%20Systems/The_Knowledge_Complexity_Of_Interactive_Proof_Systems.pdf",
        "description": "The foundation of modern zero-knowledge theory; winner of the Gödel Prize.",
        "type": "paper"
      },
      {
        "title": "Efficient Signature Generation by Smart Cards (Claus Schnorr, 1991)",
        "source": "Springer / Journal of Cryptology",
        "url": "https://link.springer.com/article/10.1007/BF00196725",
        "description": "Original publication of the Schnorr identification protocol and digital signature scheme.",
        "type": "paper"
      },
      {
        "title": "A Graduate Course in Applied Cryptography (Boneh & Shoup) - Chapter 19: Zero Knowledge",
        "source": "Open Textbook",
        "url": "https://toc.cryptobook.us/",
        "description": "Rigorous modern mathematical coverage of Sigma protocols, Fiat-Shamir, and zk-SNARK constructions.",
        "type": "book"
      }
    ],
    "toolId": "zkp-schnorr",
    glossary: [
      { term: "Zero-Knowledge Proof (ZKP)", def: "A cryptographic method by which a prover can prove to a verifier that a given statement is true without revealing any information beyond the statement's validity." },
      { term: "Completeness", def: "The ZKP property that an honest prover will always successfully convince an honest verifier of a true statement." },
      { term: "Soundness", def: "The ZKP property that a cheating prover cannot convince a verifier of a false statement, except with negligible mathematical probability." },
      { term: "Sigma Protocol", def: "A 3-move interactive proof consisting of Commitment, Challenge, and Response." },
      { term: "Fiat-Shamir Heuristic", def: "A technique that transforms an interactive zero-knowledge proof into a non-interactive proof by replacing the verifier's challenge with a cryptographic hash of the commitment." }
    ]
  },
  {
    "id": "key-management",
    "trackId": "security",
    "title": "Key management",
    "subtitle": "The part that fails in practice",
    "formula": {
      "expr": "generate → store → rotate → revoke → destroy",
      "note": "A key's lifecycle needs a plan at every stage. Most incidents involve keys in the wrong place, not weak algorithms."
    },
    "body": [
      "Generate keys with a CSPRNG, keep them out of source control, and inject them through a secret manager, KMS or HSM. Committed credentials are found by automated scanners within minutes of a push.",
      "Separate keys by purpose and environment — never share a key between signing and encryption, or between staging and production. Use envelope encryption: a data key encrypts the data, and a master key in a KMS encrypts the data key, so rotation does not mean re-encrypting everything.",
      "Plan for compromise before it happens: know how to revoke, how to rotate without downtime, and how to detect misuse from audit logs. Rehearse it — a rotation procedure nobody has tested does not work."
    ],
    "keyPoints": [
      "Never commit keys; use a secret manager or KMS.",
      "One key, one purpose, one environment.",
      "Test rotation and revocation before you need them."
    ],
    "pitfalls": [
      "Hardcoding Keys in Source Code: Keys committed to git repositories are scraped by bots within seconds, even in private repositories.",
      "Reusing One Key for Multiple Functions: Using the same key for HMAC integrity and AES encryption can destroy security proofs and enable cross-protocol attacks.",
      "Lacking a Tested Key Rotation Plan: Rotating keys only after a catastrophic breach causes service outages if systems cannot handle multi-version active keys.",
      "Exporting Plaintext Keys to Application Logs: Unsanitized exception dumps and debug logging frequently dump sensitive cryptographic keys into plaintext log aggregators."
    ],
    "workedExample": {
      "title": "Envelope Encryption Lifecycle in Cloud KMS Architecture",
      "steps": [
        {
          "label": "1. Generate Data Key",
          "detail": "App requests KMS: GenerateDataKey(K_master, AES-256). KMS returns Plaintext DK and Encrypted DK (wrapped under master key)."
        },
        {
          "label": "2. Encrypt Payload",
          "detail": "App encrypts 500 MB record locally with Plaintext DK using AES-256-GCM."
        },
        {
          "label": "3. Memory Cleansing",
          "detail": "App overwrites Plaintext DK in memory with zeroes (secure zeroize)."
        },
        {
          "label": "4. Database Storage",
          "detail": "Database row stores: [Encrypted DK (48B) || IV (12B) || Ciphertext (500MB) || Auth Tag (16B)]."
        },
        {
          "label": "5. Master Key Rotation",
          "detail": "Yearly master key rotation: only the 48-byte Encrypted DK is re-wrapped; zero heavy database re-encryption needed."
        }
      ],
      "outcome": "High-throughput local symmetric encryption backed by tamper-resistant hardware HSM access control."
    },
    "references": [
      {
        "title": "NIST SP 800-57 Part 1 Rev 5: Recommendation for Key Management",
        "source": "NIST Special Publication",
        "url": "https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final",
        "description": "Comprehensive federal guidelines on cryptographic key states, cryptoperiods, and lifecycle controls.",
        "type": "standard"
      },
      {
        "title": "AWS KMS Cryptographic Details Whitepaper: Envelope Encryption",
        "source": "Industry Architecture Guide",
        "url": "https://docs.aws.amazon.com/whitepapers/latest/kms-cryptographic-details/envelope-encryption.html",
        "description": "In-depth architecture guide on envelope encryption, HSM FIPS 140-2 Level 3 validation, and quorum authorization.",
        "type": "spec"
      },
      {
        "title": "OWASP Key Management Cheat Sheet",
        "source": "OWASP",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html",
        "description": "Actionable engineering practices for key storage, environment segregation, and secret destruction.",
        "type": "tutorial"
      }
    ],
    "toolId": "random-key",
    glossary: [
      { term: "Envelope Encryption", def: "A key management pattern where data is encrypted locally with a data encryption key (DEK), and the DEK is encrypted (wrapped) under a master key (KEK) managed in an HSM or KMS." },
      { term: "Hardware Security Module (HSM)", def: "A tamper-resistant physical computing device dedicated to safeguarding and managing digital keys and performing cryptographic operations." },
      { term: "Key Management Service (KMS)", def: "A centralized cloud or enterprise service providing automated lifecycle management, auditing, and access control for cryptographic keys." },
      { term: "Cryptoperiod", def: "The designated span of time during which a cryptographic key is authorized for use in active encryption and/or decryption." }
    ]
  },
  {
    "id": "network-security",
    "trackId": "security",
    "title": "Network and transport security",
    "subtitle": "TLS in practice, VPNs and hardening",
    "formula": {
      "expr": "TLS 1.3 + HSTS + certificate validation",
      "note": "Encrypt everything in transit, refuse downgrades, and validate certificates strictly. HSTS instructs browsers never to use plain HTTP for your domain again."
    },
    "body": [
      "Deploy TLS 1.2 at minimum and prefer 1.3, disable legacy cipher suites and compression, enable HSTS, and keep certificates automated so they never expire quietly. Use OCSP stapling to avoid leaking browsing patterns to the CA.",
      "For internal traffic, mutual TLS authenticates both ends; WireGuard offers a small, modern, well-audited VPN. Zero-trust architecture assumes the network is hostile and authenticates every request regardless of origin.",
      "Segment networks so a single compromised host cannot reach everything, and log at boundaries. Monitoring is what turns an intrusion into a contained incident instead of a breach."
    ],
    "keyPoints": [
      "TLS 1.3, HSTS, automated certificate renewal.",
      "Mutual TLS or WireGuard for service-to-service traffic.",
      "Segment and monitor — assume the network is hostile."
    ],
    "pitfalls": [
      "Disabling Certificate Validation in Code: Setting rejectUnauthorized: false or trustAllCertificates enables simple trivial Man-in-the-Middle (MitM) interception.",
      "Failing to Enforce HSTS (HTTP Strict Transport Security): Without HSTS, attackers on public WiFi use SSLStrip to downgrade traffic to unencrypted HTTP before the first redirect.",
      "Leaking DNS Queries via Plaintext Port 53: Even with TLS, unencrypted DNS queries expose every domain your application visits to local eavesdroppers (use DoH/DoT).",
      "Allowing TLS 1.0 and 1.1: Legacy protocols contain vulnerable CBC ciphers and weak MD5/SHA-1 signatures susceptible to BEAST and Lucky Thirteen."
    ],
    "workedExample": {
      "title": "TLS 1.3 1-RTT Handshake with Ephemeral Diffie-Hellman Key Exchange",
      "steps": [
        {
          "label": "1. ClientHello",
          "detail": "Client generates ephemeral private key x; sends ClientHello with supported ciphers (TLS_AES_256_GCM_SHA384) and key share gˣ."
        },
        {
          "label": "2. ServerHello",
          "detail": "Server generates ephemeral y; computes shared secret S = (gˣ)ʸ = gˣʸ. Sends ServerHello with key share gʸ."
        },
        {
          "label": "3. Handshake Secret Derivation",
          "detail": "Both derive Handshake Secret using HKDF-Extract and HKDF-Expand; all remaining handshake packets are encrypted."
        },
        {
          "label": "4. Server Certificate & Verification",
          "detail": "Server sends EncryptedCertificate and CertificateVerify (digital signature over transcript) and Finished HMAC."
        },
        {
          "label": "5. Client Finished",
          "detail": "Client validates X.509 chain against root CA trust store, sends ClientFinished, and switches to Application Traffic Keys."
        }
      ],
      "outcome": "Full handshake finishes in 1 round trip (1-RTT) with Perfect Forward Secrecy; past sessions remain unbreakable even if long-term server key is stolen later."
    },
    "references": [
      {
        "title": "RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3",
        "source": "IETF RFC",
        "url": "https://datatracker.ietf.org/doc/html/rfc8446",
        "description": "The definitive IETF specification for TLS 1.3, detailing 1-RTT handshakes, 0-RTT, and AEAD ciphers.",
        "type": "rfc"
      },
      {
        "title": "RFC 6797: HTTP Strict Transport Security (HSTS)",
        "source": "IETF RFC",
        "url": "https://datatracker.ietf.org/doc/html/rfc6797",
        "description": "The web standard instructing browsers to automatically enforce HTTPS connections.",
        "type": "rfc"
      },
      {
        "title": "Mozilla SSL Configuration Generator",
        "source": "Mozilla Security",
        "url": "https://ssl-config.mozilla.org/",
        "description": "Authoritative, continuously updated server configuration templates for Apache, Nginx, and Caddy.",
        "type": "tutorial"
      }
    ],
    glossary: [
      { term: "Transport Layer Security (TLS)", def: "The cryptographic protocol providing secure, authenticated, and encrypted end-to-end communication across the Internet." },
      { term: "HTTP Strict Transport Security (HSTS)", def: "A security header forcing browsers to communicate only via HTTPS, protecting against SSL-stripping man-in-the-middle attacks." },
      { term: "Mutual TLS (mTLS)", def: "A security handshake where both the client and server present and cryptographically authenticate each other's X.509 digital certificates." },
      { term: "Perfect Forward Secrecy (PFS)", def: "A feature of key-agreement protocols ensuring that session keys will not be compromised even if the private key of the server is compromised in the future." }
    ]
  },
  {
    "id": "replay-attacks",
    "trackId": "security",
    "title": "Replay attacks & freshness defenses",
    "subtitle": "Why encrypted valid messages can still be maliciously repeated",
    "formula": {
      "expr": "Freshness = Nonce || Timestamp || Sequence Number",
      "badge": "Wiretap Defense",
      "note": "An attacker who intercepts a valid ciphertext (e.g. 'Transfer $500') does not need to decrypt it; they simply retransmit the packet to execute the action multiple times."
    },
    "body": [
      "In a replay attack, an eavesdropper records a valid communication exchange between two parties and later retransmits it to the receiver. Because the packet has a valid cryptographic signature or MAC and was encrypted with authentic keys, naive endpoints accept it as legitimate.",
      "Joseph Steinberg highlights the classic banking scenario: a legitimate API request transferring funds can be captured on the local WiFi network and spammed 100 times, emptying the victim's account even though the payload was encrypted.",
      "The two primary defenses are Cryptographic Nonces (Numbers Used Once) and Timestamps. With nonces, the server issues a random challenge that must be included in the signed message and is cached to reject duplicates. With timestamps, messages are valid only within a narrow window (e.g. 60 seconds), combined with replay-detection caches."
    ],
    "keyPoints": [
      "Encryption does not prevent replay attacks; valid ciphertexts can be replayed.",
      "Nonces provide challenge-response freshness without synchronized clocks.",
      "Timestamps require clock synchronization (NTP) and short tolerance windows."
    ],
    "pitfalls": [
      "Assuming HTTPS eliminates replay attacks: An authenticated user or malicious middlebox can capture their own valid HTTPS payload and spam it directly against the backend.",
      "Unsynchronized System Clocks: Depending on timestamps without Network Time Protocol (NTP) synchronization causes false rejection of legitimate requests.",
      "Unbounded Nonce Storage: Storing all nonces forever causes memory exhaustion; always combine nonces with timestamps so nonces can expire after the time window.",
      "Missing Nonce from Cryptographic Signature: If the nonce is sent in an unauthenticated HTTP header, an attacker can modify the nonce while keeping the payload body intact."
    ],
    "workedExample": {
      "title": "Defeating REST API Transaction Replay with Atomic Nonce Caching",
      "steps": [
        {
          "label": "1. Vulnerable Endpoint",
          "detail": "POST /api/transfer { amount: 500, to: 'Alice' } with HMAC-SHA256 signature. Interceptor replays packet 100 times, draining $50,000."
        },
        {
          "label": "2. Client Freshness Payload",
          "detail": "Client attaches timestamp t = 1718000000 and 128-bit UUID nonce n = 'a7b3c8...'. Signature: HMAC(body || t || n)."
        },
        {
          "label": "3. Timestamp Check",
          "detail": "Server verifies: |now - t| < 60 seconds. Stale requests are rejected immediately."
        },
        {
          "label": "4. Atomic Nonce Lock",
          "detail": "Server executes Redis: SET nonce:a7b3c8... 1 EX 120 NX (Atomic insert with 120s TTL only if key does not already exist)."
        },
        {
          "label": "5. Replay Rejection",
          "detail": "If Redis returns nil (key was already present), server immediately rejects duplicate transaction with HTTP 409 Conflict."
        }
      ],
      "outcome": "Attacker retransmissions are deterministically dropped while Redis memory footprint remains strictly bounded by TTL."
    },
    "references": [
      {
        "title": "RFC 4120: The Kerberos Network Authentication Service (Replay Defense)",
        "source": "IETF RFC",
        "url": "https://datatracker.ietf.org/doc/html/rfc4120#section-3.1",
        "description": "The foundational protocol using timestamps and replay caches (authenticators) to prevent replay attacks.",
        "type": "rfc"
      },
      {
        "title": "OWASP REST Security Cheat Sheet - Replay Defense",
        "source": "OWASP",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html",
        "description": "Best practices for implementing idempotency keys, nonces, and request signing in distributed APIs.",
        "type": "tutorial"
      },
      {
        "title": "Joseph Steinberg: Cybersecurity for Dummies - Understanding Replay Attacks",
        "source": "Educational Guide",
        "url": "https://josephsteinberg.com/how-replay-attacks-work-and-how-to-prevent-them/",
        "description": "Clear conceptual breakdown of wireless, network, and API replay attack vectors.",
        "type": "book"
      }
    ],
    "toolId": "replay-attack",
    glossary: [
      { term: "Replay Attack", def: "A network cyberattack where an adversary intercepts an authentic encrypted or signed transmission and maliciously delays or repeats it." },
      { term: "Cryptographic Nonce", def: "An arbitrary number used only once in cryptographic communications (often combined with a timestamp or counter) to guarantee message freshness." },
      { term: "Message Freshness", def: "The guarantee that a message has been sent recently and is not a recorded replay of an earlier valid transmission." },
      { term: "Idempotency Key", def: "A unique token supplied by a client that allows a server to recognize subsequent retries of the same request and avoid duplicate executions." }
    ]
  },
  {
    "id": "opsec",
    "trackId": "security",
    "title": "Operational security and incident response",
    "subtitle": "Detect, contain, eradicate, recover, learn",
    "formula": {
      "expr": "MTTD + MTTR",
      "note": "Mean time to detect and mean time to respond describe your real security posture far better than a list of installed tools."
    },
    "body": [
      "Assume compromise will happen. Patch quickly, inventory your assets and dependencies, scan for known-vulnerable libraries, and keep offline, tested backups — ransomware primarily targets backups that are reachable from the network.",
      "Write the incident plan before the incident: who decides, who communicates, how evidence is preserved, when regulators and users are notified. GDPR-style regimes impose short notification deadlines.",
      "Run blameless post-mortems. A culture where people report mistakes early detects problems sooner than any monitoring product, and phishing simulations plus practical training address the human path attackers actually prefer."
    ],
    "keyPoints": [
      "Offline, tested backups defeat ransomware.",
      "Write and rehearse the incident plan in advance.",
      "Blameless review beats blame — it surfaces problems earlier."
    ],
    "pitfalls": [
      "Backups Connected to the Domain: Leaving backups accessible via network shares allows modern ransomware to discover and encrypt backup repositories first.",
      "Punitive Post-Mortem Culture: Punishing employees for reporting security errors leads to concealment, delaying incident detection until damage is catastrophic.",
      "Untested Disaster Recovery Plans: Having an incident playbook that has never undergone a live tabletop drill leads to panic, missed regulatory deadlines, and confusion during real emergencies.",
      "Lack of Out-of-Band Incident Communication: Coordinating incident response using the compromised corporate email or Slack alerts the attacker who is monitoring internal communications."
    ],
    "workedExample": {
      "title": "Ransomware Incident Response: 15-Minute MTTD & MTTR Timeline",
      "steps": [
        {
          "label": "1. Detection (MTTD: 3m)",
          "detail": "SIEM detects abnormal SMB file-enumeration spikes and canary honeypot file encryption on file server SRV-01."
        },
        {
          "label": "2. Automated Isolation",
          "detail": "SOAR playbook disables SRV-01 switch port and revokes active Kerberos ticket-granting tickets within 90 seconds."
        },
        {
          "label": "3. Volatile Evidence",
          "detail": "Security engineer captures live RAM image over out-of-band IPMI to preserve memory keys and injected malware payloads."
        },
        {
          "label": "4. Patient Zero Eradication",
          "detail": "Incident team traces ingress to compromised VPN session lacking MFA; credentials purged and VPN gateway hardened."
        },
        {
          "label": "5. Immutable Recovery",
          "detail": "Clean system re-imaged from air-gapped immutable backups; integrity validated against pre-breach SHA-256 baseline hashes."
        }
      ],
      "outcome": "Rapid containment limits breach radius to a single segmented host with zero ransomware ransom paid and zero data loss."
    },
    "references": [
      {
        "title": "NIST SP 800-61 Rev 2: Computer Security Incident Handling Guide",
        "source": "NIST Special Publication",
        "url": "https://csrc.nist.gov/pubs/sp/800/61/r2/final",
        "description": "The gold standard framework for incident preparation, detection, containment, eradication, and post-incident analysis.",
        "type": "standard"
      },
      {
        "title": "CISA Ransomware Guide & Prevention Best Practices",
        "source": "CISA / US Government",
        "url": "https://www.cisa.gov/stopransomware/ransomware-guide",
        "description": "Federal guidelines on immutable offline backups, segmentation, and incident response management.",
        "type": "standard"
      },
      {
        "title": "Google SRE: Blameless Post-Mortem Culture",
        "source": "Site Reliability Engineering",
        "url": "https://sre.google/sre-book/postmortem-culture/",
        "description": "Authoritative handbook on blameless reviews, psychological safety, and root cause engineering.",
        "type": "book"
      }
    ],
    glossary: [
      { term: "MTTD (Mean Time to Detect)", def: "The average time elapsed between the occurrence of a security breach or incident and its initial detection by monitoring systems or human analysts." },
      { term: "MTTR (Mean Time to Respond)", def: "The average time required to contain, neutralize, and recover from a detected security incident." },
      { term: "Blameless Post-Mortem", def: "An incident retrospective methodology focused on identifying systemic vulnerabilities and process flaws rather than punishing individuals." },
      { term: "Immutable Backup", def: "A backup copy that cannot be modified, encrypted, or deleted by any user or automated process during its retention period, serving as an absolute defense against ransomware." }
    ]
  }
];
