import { useState } from "react";
import { Cpu, ArrowRight, ShieldCheck, RefreshCw, Key, CheckCircle2 } from "lucide-react";

export function KyberVisualizer() {
  const [level, setLevel] = useState<"512" | "768" | "1024">("768");
  const [messageBit, setMessageBit] = useState<0 | 1>(1);
  const [noiseMagnitude, setNoiseMagnitude] = useState(120);

  const q = 3329;
  const halfQ = 1665;
  const k = level === "512" ? 2 : level === "1024" ? 4 : 3;

  // Pedagogical scalar simulation of Alice and Bob's Module-LWE operations
  // Public A, Secret s, Error e
  const A = 1842;
  const s = 4;
  const e = 8;
  const t = (A * s + e) % q; // Alice's public key t

  // Bob's Ephemeral r, errors e1, e2
  const r = 3;
  const e1 = 6;
  const e2 = noiseMagnitude;

  // Ciphertext (u, v)
  const u = (A * r + e1) % q;
  const v = (t * r + e2 + halfQ * messageBit) % q;

  // Alice Decapsulates: diff = v - s * u
  const sDotU = (s * u) % q;
  let diff = (v - sDotU) % q;
  if (diff < 0) diff += q;

  const distTo0 = Math.min(diff, q - diff);
  const distToHalfQ = Math.abs(diff - halfQ);
  const recoveredBit = distTo0 < distToHalfQ ? 0 : 1;
  const isDecryptedCorrectly = recoveredBit === messageBit;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Cpu className="size-4 text-primary" />
          <span>FIPS 203: ML-KEM (Kyber) Module-LWE Simulator</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted/80 p-0.5 ring-1 ring-border/50">
          {(["512", "768", "1024"] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                level === lvl
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ML-KEM-{lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Parameter Controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl bg-card p-3 ring-1 ring-border/70">
        <div>
          <div className="text-[11px] font-semibold text-foreground mb-1">
            Plaintext Message Bit (m)
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMessageBit(0)}
              className={`flex-1 rounded-lg py-1.5 text-center font-mono font-bold transition ring-1 ${
                messageBit === 0
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-muted/40 text-muted-foreground ring-border hover:bg-muted"
              }`}
            >
              m = 0 (Encode 0)
            </button>
            <button
              type="button"
              onClick={() => setMessageBit(1)}
              className={`flex-1 rounded-lg py-1.5 text-center font-mono font-bold transition ring-1 ${
                messageBit === 1
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-muted/40 text-muted-foreground ring-border hover:bg-muted"
              }`}
            >
              m = 1 (Encode ⌈q/2⌋ = {halfQ})
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-foreground mb-1">
            <span>Noise Perturbation (e₂)</span>
            <span className="font-mono text-primary">±{noiseMagnitude} (Max Threshold: {Math.floor(q / 4)})</span>
          </div>
          <input
            type="range"
            min="10"
            max="950"
            step="10"
            value={noiseMagnitude}
            onChange={(e) => setNoiseMagnitude(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Decryption succeeds as long as noise stays strictly below q/4 = {Math.floor(q / 4)}.
          </div>
        </div>
      </div>

      {/* Pipeline Stages: Alice KeyGen -> Bob Encapsulation -> Alice Decapsulation */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Stage 1: Alice KeyGen */}
        <div className="rounded-xl bg-muted/20 p-3 ring-1 ring-border/60 space-y-2">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span className="flex items-center gap-1">
              <Key className="size-3.5 text-primary" />
              <span>1. Key Generation</span>
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] text-primary font-mono">
              Alice
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="rounded bg-card p-2 ring-1 ring-border/50">
              <div className="text-[10px] text-muted-foreground">Public Matrix A (Rank {k}×{k})</div>
              <div className="font-mono font-medium text-foreground">A = {A} mod {q}</div>
            </div>
            <div className="rounded bg-card p-2 ring-1 ring-border/50">
              <div className="text-[10px] text-muted-foreground">Secret Noise s, Error e</div>
              <div className="font-mono text-emerald-700">s = {s}, e = {e} (Private)</div>
            </div>
            <div className="rounded bg-primary/5 p-2 ring-1 ring-primary/20">
              <div className="text-[10px] text-primary font-semibold">Public Key t = As + e</div>
              <div className="font-mono font-bold text-primary">t = {t} (mod {q})</div>
            </div>
          </div>
        </div>

        {/* Stage 2: Bob Encapsulation */}
        <div className="rounded-xl bg-muted/20 p-3 ring-1 ring-border/60 space-y-2">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span className="flex items-center gap-1">
              <ArrowRight className="size-3.5 text-sky-600" />
              <span>2. Encapsulation</span>
            </span>
            <span className="rounded bg-sky-500/10 px-1.5 py-0.2 text-[10px] text-sky-600 font-mono">
              Bob
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="rounded bg-card p-2 ring-1 ring-border/50">
              <div className="text-[10px] text-muted-foreground">Ephemeral r, Errors e₁, e₂</div>
              <div className="font-mono text-foreground">r = {r}, e₁ = {e1}, e₂ = {e2}</div>
            </div>
            <div className="rounded bg-card p-2 ring-1 ring-border/50">
              <div className="text-[10px] text-muted-foreground">Ciphertext Vector u = Aᵀr + e₁</div>
              <div className="font-mono font-medium text-foreground">u = {u}</div>
            </div>
            <div className="rounded bg-sky-500/5 p-2 ring-1 ring-sky-500/20">
              <div className="text-[10px] text-sky-600 font-semibold">
                Ciphertext Scalar v = tᵀr + e₂ + ⌈q/2⌋m
              </div>
              <div className="font-mono font-bold text-sky-600">v = {v}</div>
            </div>
          </div>
        </div>

        {/* Stage 3: Alice Decapsulation */}
        <div className="rounded-xl bg-muted/20 p-3 ring-1 ring-border/60 space-y-2">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span className="flex items-center gap-1">
              <RefreshCw className="size-3.5 text-amber-600" />
              <span>3. Decapsulation</span>
            </span>
            <span className="rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] text-amber-600 font-mono">
              Alice
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="rounded bg-card p-2 ring-1 ring-border/50">
              <div className="text-[10px] text-muted-foreground">Inner Product sᵀu</div>
              <div className="font-mono text-foreground">s·u = {sDotU}</div>
            </div>
            <div className="rounded bg-card p-2 ring-1 ring-border/50">
              <div className="text-[10px] text-muted-foreground">Difference d = v - sᵀu</div>
              <div className="font-mono font-bold text-foreground">d = {diff}</div>
            </div>
            <div
              className={`rounded p-2 ring-1 ${
                isDecryptedCorrectly
                  ? "bg-emerald-500/10 text-emerald-800 ring-emerald-500/30"
                  : "bg-destructive/10 text-destructive ring-destructive/30"
              }`}
            >
              <div className="text-[10px] font-semibold">Decoded Bit: {recoveredBit}</div>
              <div className="text-[9.5px]">
                {isDecryptedCorrectly
                  ? `Success: Closest to ${recoveredBit === 0 ? "0" : halfQ}`
                  : `Failed: Noise exceeded threshold`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fujisaki-Okamoto Verification Banner */}
      <div className="rounded-xl bg-card p-3 ring-1 ring-border/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <div className="text-[11px]">
            <span className="font-semibold text-foreground">Fujisaki–Okamoto (FO) Transform: </span>
            <span className="text-muted-foreground">
              Alice re-encrypts the recovered payload and strictly verifies c' === c before releasing the shared key.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-semibold shrink-0">
          <CheckCircle2 className="size-3.5" />
          <span>IND-CCA2 SECURE</span>
        </div>
      </div>
    </div>
  );
}
