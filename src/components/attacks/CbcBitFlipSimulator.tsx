import { useState } from "react";
import { ArrowDown, Check, ShieldAlert, Sparkles, Unlock } from "lucide-react";

export function CbcBitFlipSimulator() {
  // Let Block 1 (IV) be a 16-byte hex string
  // Let Block 2 be "role=user;auth=0" (16 bytes)
  const originalPlain = "role=user;auth=0";
  const [targetChar, setTargetChar] = useState<"0" | "1">("1");
  const [tampered, setTampered] = useState(false);

  // Original IV / Ciphertext block 1 bytes
  const originalC1 = [
    0x2f, 0x9a, 0x4c, 0x11, 0x8b, 0x3d, 0x7e, 0x05, 0xfa, 0x62, 0xc1, 0x44, 0x18, 0x9e, 0x77, 0xb2,
  ];

  // Bit flip math:
  // Target is index 15: originally '0' (0x30), target is '1' (0x31)
  // Delta = 0x30 ^ 0x31 = 0x01
  const delta = "0".charCodeAt(0) ^ targetChar.charCodeAt(0);
  const activeC1 = originalC1.map((byte, idx) => {
    if (tampered && idx === 15) {
      return byte ^ delta;
    }
    return byte;
  });

  // Decrypted plaintext byte at index 15
  const decryptedChar = tampered ? targetChar : "0";
  const decryptedPlain = `role=user;auth=${decryptedChar}`;
  const isPrivileged = decryptedChar === "1";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              MALLEABILITY ATTACK
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              CBC Decryption Vulnerability
            </span>
          </div>
          <h3 className="font-sans text-[17px] font-bold text-foreground">
            CBC Bit-Flipping Exploit Simulator
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Demonstrates how unauthenticated encryption allows an attacker to alter plaintext bytes without knowing the secret key.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setTampered(!tampered)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[12.5px] font-semibold transition shadow-xs ${
            tampered
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          <Unlock className="size-3.5" />
          <span>{tampered ? "Revert to Original Ciphertext" : "Execute Bit-Flip in Ciphertext"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Step 1: Ciphertext Transmission */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] uppercase font-semibold text-muted-foreground">
                Ciphertext Block C₁ (16 Bytes in Transit)
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {tampered ? "TAMPERED BY ATTACKER" : "AUTHENTIC"}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5 p-3 rounded-xl bg-muted/40 border border-border font-mono text-[12px] text-center">
              {activeC1.map((b, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-lg border transition ${
                    tampered && idx === 15
                      ? "bg-rose-500 text-white font-bold border-rose-600 animate-pulse"
                      : "bg-background text-foreground border-border/80"
                  }`}
                  title={`Byte ${idx}: 0x${b.toString(16).padStart(2, "0")}`}
                >
                  {b.toString(16).padStart(2, "0").toUpperCase()}
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] font-mono text-muted-foreground">
              Byte index #15: {tampered ? "Flipped bit 0x77 ⊕ 0x01 = 0x76" : "Original unmodified byte 0x77"}
            </p>
          </div>

          <div className="rounded-xl bg-muted/20 border border-border p-3.5 text-[12px] space-y-1.5">
            <span className="font-mono font-semibold text-foreground block">CBC Mathematics:</span>
            <p className="font-mono text-muted-foreground">
              P₂ = D_K(C₂) ⊕ C₁
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Because block C₁ is XORed directly into the decrypted block D_K(C₂), flipping bit <code className="text-primary font-mono font-semibold">k</code> in C₁ unconditionally flips bit <code className="text-primary font-mono font-semibold">k</code> in P₂. The key is never needed!
            </p>
          </div>
        </div>

        {/* Step 2: Decryption Result at Server */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-1.5">
            <span className="font-mono text-[11px] uppercase font-semibold text-muted-foreground block">
              Server Decryption Result (P₂)
            </span>
            <div
              className={`p-4 rounded-xl border font-mono text-[15px] font-semibold transition ${
                isPrivileged
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-muted/50 border-border text-foreground"
              }`}
            >
              <span>role=user;auth=</span>
              <span
                className={`px-1.5 py-0.5 rounded font-bold ${
                  isPrivileged ? "bg-rose-600 text-white" : "bg-muted text-foreground"
                }`}
              >
                {decryptedChar}
              </span>
            </div>
          </div>

          {isPrivileged ? (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-2 text-rose-900">
              <div className="flex items-center gap-2 font-bold text-[13.5px]">
                <ShieldAlert className="size-4 text-rose-600" />
                <span>Privilege Escalation Achieved! (auth=1)</span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-rose-800">
                The server received the tampered ciphertext, ran AES-CBC decryption, and the plain bit flipped into <code className="font-mono font-bold">1</code>! The server now grants full administrative credentials to the attacker.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-1.5 text-muted-foreground text-[12.5px]">
              <span className="font-semibold text-foreground block">Normal Unprivileged User</span>
              <p>Click "Execute Bit-Flip in Ciphertext" to tamper with byte 15 in transit.</p>
            </div>
          )}

          <div className="rounded-xl bg-card border border-border/70 p-3 text-[12px] space-y-1 text-muted-foreground">
            <span className="text-foreground font-semibold font-mono block">Why AEAD Fixes This:</span>
            <p className="leading-relaxed">
              Authenticated Encryption (AES-GCM or ChaCha20-Poly1305) produces an immutable 128-bit authentication tag. If even 1 bit of ciphertext is modified, tag verification fails immediately and decryption halts before returning any plaintext.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
