import { useState } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function BlockModesVisualizer({ values, resultOutput }: Props) {
  const [activeMode, setActiveMode] = useState<"ecb" | "cbc" | "ctr" | "gcm">("cbc");

  const modeData = {
    ecb: {
      name: "Electronic Codebook (ECB)",
      formula: "C_i = E_K(P_i)",
      parallel: "Fully parallelizable for both encrypt & decrypt",
      security: "CRITICAL FLAW: Leaks patterns! Identical plaintext blocks yield identical ciphertext blocks (ECB Penguin effect). Never use for multi-block messages.",
      blocks: [
        { p: "Plaintext 1", op: "E_K(P1)", c: "Ciphertext 1" },
        { p: "Plaintext 2", op: "E_K(P2)", c: "Ciphertext 2" },
        { p: "Plaintext 1", op: "E_K(P1)", c: "Ciphertext 1 (Exact duplicate!)" },
      ],
    },
    cbc: {
      name: "Cipher Block Chaining (CBC)",
      formula: "C_i = E_K(P_i ⊕ C_{i-1}) with C₀ = IV",
      parallel: "Sequential encryption (cannot parallelize); Decryption is parallelizable.",
      security: "Requires unpredictable random IV. Vulnerable to Padding Oracle attacks if MAC is not verified first (MAC-then-Encrypt anti-pattern).",
      blocks: [
        { p: "Plaintext 1 ⊕ IV", op: "E_K(P1 ⊕ IV)", c: "Ciphertext 1" },
        { p: "Plaintext 2 ⊕ C1", op: "E_K(P2 ⊕ C1)", c: "Ciphertext 2" },
        { p: "Plaintext 3 ⊕ C2", op: "E_K(P3 ⊕ C2)", c: "Ciphertext 3" },
      ],
    },
    ctr: {
      name: "Counter Mode (CTR)",
      formula: "C_i = P_i ⊕ E_K(Nonce || Counter_i)",
      parallel: "Fully parallelizable for both encryption and decryption! Random access supported.",
      security: "Turns block cipher into stream cipher. CRITICAL: Never reuse (Key, Nonce) pair, or C1 ⊕ C2 = P1 ⊕ P2 leaks plaintexts completely.",
      blocks: [
        { p: "Plaintext 1", op: "⊕ E_K(Nonce || 0)", c: "Ciphertext 1" },
        { p: "Plaintext 2", op: "⊕ E_K(Nonce || 1)", c: "Ciphertext 2" },
        { p: "Plaintext 3", op: "⊕ E_K(Nonce || 2)", c: "Ciphertext 3" },
      ],
    },
    gcm: {
      name: "Galois/Counter Mode (GCM - AEAD)",
      formula: "CTR Encryption + GHASH over GF(2¹²⁸)",
      parallel: "Fully parallelizable with hardware acceleration (AES-NI + CLMUL).",
      security: "Gold Standard of modern cryptography (used in TLS 1.3). Provides Authenticated Encryption with Associated Data (AEAD). Detects any ciphertext tampering.",
      blocks: [
        { p: "Plaintext 1", op: "CTR Enc + GHASH", c: "Ciphertext 1" },
        { p: "Plaintext 2", op: "CTR Enc + GHASH", c: "Ciphertext 2" },
        { p: "Auth Tag", op: "GHASH(A, C, len) ⊕ E_K(J₀)", c: "128-bit Authentication Tag" },
      ],
    },
  };

  const cur = modeData[activeMode];

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">NIST SP 800-38A Block Cipher Modes of Operation</span>
          <p className="text-[12px] text-muted-foreground">
            Structural chaining and stream transformations (Stallings Ch. 7)
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {(["ecb", "cbc", "ctr", "gcm"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setActiveMode(m)}
            className={`rounded-[10px] px-3 py-1.5 text-[11.5px] font-medium transition ${
              activeMode === m
                ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                : "bg-card text-muted-foreground ring-1 ring-border hover:bg-muted"
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Mode Overview Card */}
      <div className="mt-4 rounded-[14px] bg-card p-3.5 ring-1 ring-border shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
          <span className="font-display text-[13.5px] font-semibold text-foreground">{cur.name}</span>
          <code className="rounded bg-background px-2 py-0.5 font-mono text-[11px] text-primary ring-1 ring-border">
            {cur.formula}
          </code>
        </div>
        <div className="mt-2.5 space-y-1.5 text-[12px] text-muted-foreground">
          <p><strong className="text-foreground">Parallelism:</strong> {cur.parallel}</p>
          <p><strong className="text-foreground">Security Evaluation:</strong> {cur.security}</p>
        </div>
      </div>

      {/* Visual Block Chain Diagram */}
      <div className="mt-4">
        <span className="label-tiny mb-2 block">Block Execution Sequence:</span>
        <div className="grid gap-2.5 sm:grid-cols-3 font-mono text-[11px]">
          {cur.blocks.map((b, i) => (
            <div key={i} className="flex flex-col rounded-[12px] bg-card p-2.5 ring-1 ring-border shadow-2xs">
              <span className="text-[9.5px] text-muted-foreground uppercase">Block #{i + 1}</span>
              <div className="mt-1 rounded bg-background p-1.5 ring-1 ring-border text-center font-semibold text-foreground">
                {b.p}
              </div>
              <div className="my-1 text-center text-primary text-[10px]">↓ {b.op} ↓</div>
              <div className="rounded bg-primary/10 p-1.5 ring-1 ring-primary/25 text-center font-bold text-primary truncate">
                {b.c}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
