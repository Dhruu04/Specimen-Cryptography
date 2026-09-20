export interface CodeSnippet {
  language: "python" | "rust" | "go" | "typescript";
  title: string;
  code: string;
  notes: string;
}

export interface LessonCodeRecipe {
  lessonId: string;
  algorithmName: string;
  standard: string;
  antipattern: string;
  snippets: Record<"python" | "rust" | "go" | "typescript", CodeSnippet>;
}

export const codeRecipes: Record<string, LessonCodeRecipe> = {
  "aes-gcm": {
    lessonId: "aes-gcm",
    algorithmName: "AES-256-GCM (Authenticated Encryption with Associated Data)",
    standard: "NIST SP 800-38D",
    antipattern: "CRITICAL: Never reuse a nonce with the same key. Nonce reuse in GCM destroys confidentiality and allows key recovery.",
    snippets: {
      python: {
        language: "python",
        title: "Python (cryptography)",
        notes: "Uses the PyCA cryptography library. Automatically appends the 16-byte authentication tag.",
        code: `import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Generate a 256-bit (32-byte) key
key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)

# Generate a unique 96-bit (12-byte) nonce for every encryption
nonce = os.urandom(12)
plaintext = b"Specimen Laboratory Confidential Payload"
associated_data = b"metadata-auth-tag-v1"

# Encrypt (ciphertext includes 16-byte auth tag at the end)
ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)

# Decrypt and authenticate
decrypted = aesgcm.decrypt(nonce, ciphertext, associated_data)
assert decrypted == plaintext
print("Decrypted successfully:", decrypted.decode())`,
      },
      rust: {
        language: "rust",
        title: "Rust (aes-gcm)",
        notes: "Uses the pure-Rust 'aes-gcm' crate. Enforces unique nonces and verified authentication.",
        code: `use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use aes_gcm::aead::generic_array::GenericArray;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Generate a random 256-bit key and 96-bit nonce
    let key = Aes256Gcm::generate_key(&mut OsRng);
    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 96-bits unique

    let plaintext = b"Specimen Laboratory Confidential Payload";

    // Encrypt
    let ciphertext = cipher.encrypt(&nonce, plaintext.as_ref())
        .map_err(|e| format!("Encryption failure: {e:?}"))?;

    // Decrypt and verify tag
    let decrypted = cipher.decrypt(&nonce, ciphertext.as_ref())
        .map_err(|e| format!("Decryption/Auth tag verification failure: {e:?}"))?;

    assert_eq!(&decrypted, plaintext);
    println!("Decrypted: {}", String::from_utf8(decrypted)?);
    Ok(())
}`,
      },
      go: {
        language: "go",
        title: "Go (crypto/cipher)",
        notes: "Go standard library implementation. Automatically creates a GCM block cipher with authenticated tags.",
        code: `package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"fmt"
	"io"
)

func main() {
	key := make([]byte, 32) // AES-256
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		panic(err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		panic(err)
	}

	// Always generate a unique 12-byte nonce
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		panic(err)
	}

	plaintext := []byte("Specimen Laboratory Confidential Payload")
	// Seal encrypts and appends the 16-byte auth tag
	ciphertext := aesGCM.Seal(nil, nonce, plaintext, nil)

	// Open authenticates tag and decrypts
	decrypted, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic("Authentication failed: ciphertext corrupted or tampered!")
	}

	fmt.Println("Decrypted:", string(decrypted))
}`,
      },
      typescript: {
        language: "typescript",
        title: "TypeScript / Browser (Web Crypto API)",
        notes: "Zero dependencies. Built into modern browsers and Node.js 18+ via global crypto.subtle.",
        code: `async function aesGcmDemo() {
  // Generate AES-256 key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Generate unique 12-byte (96-bit) IV/nonce
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const plaintext = enc.encode("Specimen Laboratory Confidential Payload");

  // Encrypt with 128-bit authentication tag
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    plaintext
  );

  // Decrypt and verify tag integrity
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  console.log("Decrypted:", dec.decode(decryptedBuffer));
}

aesGcmDemo();`,
      },
    },
  },

  "rsa": {
    lessonId: "rsa",
    algorithmName: "RSA-OAEP & RSA-PSS",
    standard: "PKCS #1 v2.2 (RFC 8017)",
    antipattern: "Never use textbook RSA (c = m^e mod n) or PKCS#1 v1.5 padding. Always use OAEP for encryption and PSS for signatures.",
    snippets: {
      python: {
        language: "python",
        title: "Python (cryptography)",
        notes: "Uses RSA-OAEP with SHA-256 for public-key encryption.",
        code: `from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# Generate a secure 3072-bit RSA private key
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=3072,
)
public_key = private_key.public_key()

message = b"Secret cryptographic session key"

# Encrypt using OAEP with SHA-256
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

# Decrypt
decrypted = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)
print("Recovered:", decrypted.decode())`,
      },
      rust: {
        language: "rust",
        title: "Rust (rsa)",
        notes: "Using the 'rsa' crate with OAEP padding and SHA-256.",
        code: `use rsa::{RsaPrivateKey, RsaPublicKey, Oaep, sha2::Sha256};
use rand::rngs::OsRng;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut rng = OsRng;
    let bits = 3072;
    let priv_key = RsaPrivateKey::new(&mut rng, bits)?;
    let pub_key = RsaPublicKey::from(&priv_key);

    let data = b"Secret cryptographic session key";
    let padding = Oaep::new::<Sha256>();

    // Encrypt with Public Key
    let enc_data = pub_key.encrypt(&mut rng, padding, data)?;

    // Decrypt with Private Key
    let dec_data = priv_key.decrypt(Oaep::new::<Sha256>(), &enc_data)?;

    assert_eq!(dec_data, data);
    println!("Decrypted: {}", String::from_utf8(dec_data)?);
    Ok(())
}`,
      },
      go: {
        language: "go",
        title: "Go (crypto/rsa)",
        notes: "Standard Go implementation using rsa.EncryptOAEP with SHA-256.",
        code: `package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"fmt"
)

func main() {
	privKey, err := rsa.GenerateKey(rand.Reader, 3072)
	if err != nil {
		panic(err)
	}

	secretMsg := []byte("Secret cryptographic session key")

	// Encrypt with OAEP padding
	ciphertext, err := rsa.EncryptOAEP(sha256.New(), rand.Reader, &privKey.PublicKey, secretMsg, nil)
	if err != nil {
		panic(err)
	}

	// Decrypt
	plaintext, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, privKey, ciphertext, nil)
	if err != nil {
		panic(err)
	}

	fmt.Println("Decrypted:", string(plaintext))
}`,
      },
      typescript: {
        language: "typescript",
        title: "TypeScript (Web Crypto API)",
        notes: "Browser-native RSA-OAEP with 3072-bit modulus and SHA-256 hash.",
        code: `async function rsaOaepDemo() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 3072,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const enc = new TextEncoder();
  const plaintext = enc.encode("Secret cryptographic session key");

  // Encrypt with public key
  const ciphertext = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    keyPair.publicKey,
    plaintext
  );

  // Decrypt with private key
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    keyPair.privateKey,
    ciphertext
  );

  const dec = new TextDecoder();
  console.log("Decrypted:", dec.decode(decrypted));
}

rsaOaepDemo();`,
      },
    },
  },

  "ed25519": {
    lessonId: "ed25519",
    algorithmName: "Ed25519 (Edwards-curve Digital Signature Algorithm)",
    standard: "RFC 8032 (FIPS 186-5)",
    antipattern: "Never use weak random number generators for nonces. Ed25519 uses deterministic nonce derivation to prevent catastrophic key leakage.",
    snippets: {
      python: {
        language: "python",
        title: "Python (cryptography)",
        notes: "Pure, high-performance Edwards25519 digital signature signing and verification.",
        code: `from cryptography.hazmat.primitives.asymmetric import ed25519

# Generate a 32-byte Ed25519 private key
private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

message = b"Transaction: transfer 100 satoshis to Alice"

# Sign (produces a 64-byte deterministic signature)
signature = private_key.sign(message)

# Verify
try:
    public_key.verify(signature, message)
    print("Signature is authentic and verified!")
except Exception as e:
    print("Verification failed:", e)`,
      },
      rust: {
        language: "rust",
        title: "Rust (ed25519-dalek)",
        notes: "Industry-standard ed25519-dalek crate used by Solana, Signal, and Matrix.",
        code: `use ed25519_dalek::{Signer, Verifier, SigningKey, Signature};
use rand::rngs::OsRng;

fn main() {
    let mut csprng = OsRng;
    let signing_key = SigningKey::generate(&mut csprng);
    let verifying_key = signing_key.verifying_key();

    let message: &[u8] = b"Transaction: transfer 100 satoshis to Alice";

    // Sign message -> 64-byte signature
    let signature: Signature = signing_key.sign(message);

    // Verify signature
    assert!(verifying_key.verify(message, &signature).is_ok());
    println!("Signature valid!");
}`,
      },
      go: {
        language: "go",
        title: "Go (crypto/ed25519)",
        notes: "Built into Go's standard library. Zero allocation signature verification.",
        code: `package main

import (
	"crypto/ed25519"
	"crypto/rand"
	"fmt"
)

func main() {
	pubKey, privKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		panic(err)
	}

	msg := []byte("Transaction: transfer 100 satoshis to Alice")

	// Sign
	signature := ed25519.Sign(privKey, msg)

	// Verify
	valid := ed25519.Verify(pubKey, msg, signature)
	fmt.Println("Signature verified:", valid)
}`,
      },
      typescript: {
        language: "typescript",
        title: "TypeScript (Web Crypto API)",
        notes: "Native Ed25519 in modern Web Crypto engines.",
        code: `async function ed25519Demo() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"]
  );

  const enc = new TextEncoder();
  const data = enc.encode("Transaction: transfer 100 satoshis to Alice");

  // Sign message
  const signature = await crypto.subtle.sign(
    { name: "Ed25519" },
    keyPair.privateKey,
    data
  );

  // Verify signature
  const isValid = await crypto.subtle.verify(
    { name: "Ed25519" },
    keyPair.publicKey,
    signature,
    data
  );

  console.log("Signature valid:", isValid);
}

ed25519Demo();`,
      },
    },
  },

  "sha256": {
    lessonId: "sha256",
    algorithmName: "SHA-256 & HMAC-SHA256",
    standard: "FIPS 180-4 / RFC 2104",
    antipattern: "Never use simple concatenation H(key || message) for message authentication; it is vulnerable to Length Extension Attacks. Always use HMAC.",
    snippets: {
      python: {
        language: "python",
        title: "Python (hmac + hashlib)",
        notes: "Built-in standard library HMAC-SHA256 implementation with constant-time comparison.",
        code: `import hmac
import hashlib

key = b"super-secret-cryptographic-auth-key"
data = b"GET /api/v2/account/balance?id=108"

# Compute HMAC-SHA256
signature = hmac.new(key, data, hashlib.sha256).digest()
print("HMAC (hex):", signature.hex())

# Constant-time comparison to prevent timing side-channels
def verify(received_sig, key, data):
    expected_sig = hmac.new(key, data, hashlib.sha256).digest()
    return hmac.compare_digest(received_sig, expected_sig)

print("Verified:", verify(signature, key, data))`,
      },
      rust: {
        language: "rust",
        title: "Rust (hmac + sha2)",
        notes: "Uses RustCrypto's standard 'hmac' and 'sha2' crates with constant-time tag verification.",
        code: `use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let key = b"super-secret-cryptographic-auth-key";
    let mut mac = HmacSha256::new_from_slice(key)?;

    mac.update(b"GET /api/v2/account/balance?id=108");
    let result = mac.finalize();
    let code = result.into_bytes();

    println!("HMAC (hex): {:x}", code);

    // Constant-time verification
    let mut verify_mac = HmacSha256::new_from_slice(key)?;
    verify_mac.update(b"GET /api/v2/account/balance?id=108");
    verify_mac.verify(&code)?;
    println!("Verified authentic!");
    Ok(())
}`,
      },
      go: {
        language: "go",
        title: "Go (crypto/hmac)",
        notes: "Go standard library HMAC with hmac.Equal for timing attack prevention.",
        code: `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func main() {
	key := []byte("super-secret-cryptographic-auth-key")
	data := []byte("GET /api/v2/account/balance?id=108")

	mac := hmac.New(sha256.New, key)
	mac.Write(data)
	tag := mac.Sum(nil)

	fmt.Println("HMAC (hex):", hex.EncodeToString(tag))

	// Constant-time check
	isValid := hmac.Equal(tag, mac.Sum(nil))
	fmt.Println("Verified:", isValid)
}`,
      },
      typescript: {
        language: "typescript",
        title: "TypeScript (Web Crypto API)",
        notes: "Browser-native HMAC-SHA256 generation and verification.",
        code: `async function hmacDemo() {
  const enc = new TextEncoder();
  const rawKey = enc.encode("super-secret-cryptographic-auth-key");
  const data = enc.encode("GET /api/v2/account/balance?id=108");

  const key = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  // Compute HMAC
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const hex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  console.log("HMAC (hex):", hex);

  // Verify HMAC in constant time
  const isValid = await crypto.subtle.verify("HMAC", key, signature, data);
  console.log("Verified:", isValid);
}

hmacDemo();`,
      },
    },
  },

  "diffie-hellman": {
    lessonId: "diffie-hellman",
    algorithmName: "X25519 (ECDH Key Agreement)",
    standard: "RFC 7748",
    antipattern: "Never use unauthenticated Diffie-Hellman in production. Always sign the ephemeral public keys with Ed25519 or embed inside TLS 1.3 to prevent Man-in-the-Middle attacks.",
    snippets: {
      python: {
        language: "python",
        title: "Python (cryptography)",
        notes: "Modern Curve25519 (X25519) Diffie-Hellman Key Exchange.",
        code: `from cryptography.hazmat.primitives.asymmetric import x25519

# Alice generates keypair
alice_priv = x25519.X25519PrivateKey.generate()
alice_pub = alice_priv.public_key()

# Bob generates keypair
bob_priv = x25519.X25519PrivateKey.generate()
bob_pub = bob_priv.public_key()

# Alice computes shared secret using Bob's public key
alice_shared = alice_priv.exchange(bob_pub)

# Bob computes shared secret using Alice's public key
bob_shared = bob_priv.exchange(alice_pub)

# Both arrive at the exact same 32-byte shared secret
assert alice_shared == bob_shared
print("Shared Secret (hex):", alice_shared.hex())`,
      },
      rust: {
        language: "rust",
        title: "Rust (x25519-dalek)",
        notes: "Fast, constant-time Diffie-Hellman exchange over Curve25519.",
        code: `use x25519_dalek::{EphemeralSecret, PublicKey};
use rand::rngs::OsRng;

fn main() {
    let mut rng = OsRng;

    // Alice generates ephemeral secret and public key
    let alice_secret = EphemeralSecret::random_from_rng(&mut rng);
    let alice_public = PublicKey::from(&alice_secret);

    // Bob generates ephemeral secret and public key
    let bob_secret = EphemeralSecret::random_from_rng(&mut rng);
    let bob_public = PublicKey::from(&bob_secret);

    // Exchange
    let alice_shared = alice_secret.diffie_hellman(&bob_public);
    let bob_shared = bob_secret.diffie_hellman(&alice_public);

    assert_eq!(alice_shared.as_bytes(), bob_shared.as_bytes());
    println!("Shared key established!");
}`,
      },
      go: {
        language: "go",
        title: "Go (crypto/ecdh)",
        notes: "Modern Go 1.20+ ecdh standard library package using X25519.",
        code: `package main

import (
	"crypto/ecdh"
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

func main() {
	curve := ecdh.X25519()

	// Alice keypair
	alicePriv, _ := curve.GenerateKey(rand.Reader)
	alicePub := alicePriv.PublicKey()

	// Bob keypair
	bobPriv, _ := curve.GenerateKey(rand.Reader)
	bobPub := bobPriv.PublicKey()

	// Key Agreement
	aliceShared, _ := alicePriv.ECDH(bobPub)
	bobShared, _ := bobPriv.ECDH(alicePub)

	fmt.Println("Alice shared:", hex.EncodeToString(aliceShared))
	fmt.Println("Bob shared:  ", hex.EncodeToString(bobShared))
}`,
      },
      typescript: {
        language: "typescript",
        title: "TypeScript (Web Crypto API)",
        notes: "ECDH using P-256 / P-384 or modern X25519.",
        code: `async function ecdhDemo() {
  // Alice generates ECDH keypair
  const aliceKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey", "deriveBits"]
  );

  // Bob generates ECDH keypair
  const bobKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey", "deriveBits"]
  );

  // Alice derives bits using Bob's public key
  const aliceBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: bobKeyPair.publicKey },
    aliceKeyPair.privateKey,
    256
  );

  // Bob derives bits using Alice's public key
  const bobBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: aliceKeyPair.publicKey },
    bobKeyPair.privateKey,
    256
  );

  const hexA = Array.from(new Uint8Array(aliceBits)).map(b => b.toString(16).padStart(2, "0")).join("");
  const hexB = Array.from(new Uint8Array(bobBits)).map(b => b.toString(16).padStart(2, "0")).join("");
  console.log("Shared key matches:", hexA === hexB);
}

ecdhDemo();`,
      },
    },
  },
};

export function getCodeRecipeForLesson(lessonId: string): LessonCodeRecipe | undefined {
  if (codeRecipes[lessonId]) return codeRecipes[lessonId];
  if (lessonId.includes("aes") || lessonId.includes("gcm")) return codeRecipes["aes-gcm"];
  if (lessonId.includes("rsa")) return codeRecipes["rsa"];
  if (lessonId.includes("ed25519") || lessonId.includes("ecc") || lessonId.includes("digital-signature")) return codeRecipes["ed25519"];
  if (lessonId.includes("sha") || lessonId.includes("hash") || lessonId.includes("hmac")) return codeRecipes["sha256"];
  if (lessonId.includes("diffie") || lessonId.includes("dh")) return codeRecipes["diffie-hellman"];
  return undefined;
}
