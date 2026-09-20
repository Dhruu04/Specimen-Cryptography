import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Layers,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  Hash,
  Scale,
  Activity,
  Binary,
  Maximize2,
} from "lucide-react";

export const Route = createFileRoute("/pqc")({
  component: PostQuantumLabComponent,
});

// Modular arithmetic helper functions
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// Centered modulo for noise visualizer [-q/2, q/2]
function centerMod(n: number, m: number): number {
  const r = mod(n, m);
  return r > m / 2 ? r - m : r;
}

// Polynomial multiplication modulo (X^n + 1) and mod q
function polyMulMod(a: number[], b: number[], n: number, q: number): number[] {
  const res = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const deg = i + j;
      const ai = a[i] ?? 0;
      const bj = b[j] ?? 0;
      const coeff = (ai * bj) % q;
      if (deg < n) {
        res[deg] = mod((res[deg] ?? 0) + coeff, q);
      } else {
        // X^n = -1 in Z_q[X]/(X^n + 1)
        res[deg - n] = mod((res[deg - n] ?? 0) - coeff, q);
      }
    }
  }
  return res;
}

function polyAdd(a: number[], b: number[], q: number): number[] {
  return a.map((val, i) => mod((val ?? 0) + (b[i] ?? 0), q));
}

function polySub(a: number[], b: number[], q: number): number[] {
  return a.map((val, i) => mod((val ?? 0) - (b[i] ?? 0), q));
}

// Centered binomial distribution sampler B_eta
function sampleBinomial(eta: number): number {
  let sum = 0;
  for (let i = 0; i < eta; i++) {
    sum += Math.random() > 0.5 ? 1 : 0;
    sum -= Math.random() > 0.5 ? 1 : 0;
  }
  return sum;
}

function PostQuantumLabComponent() {
  const [activeTab, setActiveTab] = useState<"kem" | "rejection" | "cvp">("kem");

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
              NIST FIPS 203 & 204 Laboratory
            </span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
              Post-Quantum
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Post-Quantum Lattice Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Interactive mathematics of Learning With Errors (LWE), Ring/Module lattice arithmetic,
            ML-KEM (Kyber) encapsulation, and ML-DSA (Dilithium) rejection sampling.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-muted/60 p-1 border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("kem")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              activeTab === "kem"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="size-3.5" />
            <span>ML-KEM (Kyber)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rejection")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              activeTab === "rejection"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="size-3.5" />
            <span>ML-DSA (Rejection Sampling)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cvp")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              activeTab === "cvp"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span>2D CVP Geometry</span>
          </button>
        </div>
      </div>

      {activeTab === "kem" && <MLKEMVisualizer />}
      {activeTab === "rejection" && <MLDSARejectionVisualizer />}
      {activeTab === "cvp" && <LatticeCVPVisualizer />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. ML-KEM (Kyber) Ring-LWE Visualizer
// ---------------------------------------------------------------------------
function MLKEMVisualizer() {
  const [degree, setDegree] = useState<number>(4);
  const [modulus, setModulus] = useState<number>(17); // 17, 257, or 3329
  const [eta, setEta] = useState<number>(2);
  const [noiseMultiplier, setNoiseMultiplier] = useState<number>(1.0);
  const [messageBits, setMessageBits] = useState<number[]>([1, 0, 1, 1]);
  const [seed, setSeed] = useState<number>(1);

  // Resize message bits when degree changes
  const currentMsg = useMemo(() => {
    const bits = [...messageBits];
    while (bits.length < degree) bits.push(0);
    return bits.slice(0, degree);
  }, [messageBits, degree]);

  // Generate Key & Ciphertext
  const sim = useMemo(() => {
    // Generate Public Matrix/Polynomial A
    const a: number[] = [];
    for (let i = 0; i < degree; i++) {
      a.push(Math.floor((Math.sin(seed * 100 + i * 37) * 0.5 + 0.5) * modulus) % modulus);
    }

    // Generate Secret s and Error e with centered binomial noise
    const s: number[] = [];
    const e: number[] = [];
    for (let i = 0; i < degree; i++) {
      s.push(mod(sampleBinomial(eta), modulus));
      const baseErr = sampleBinomial(eta);
      const scaledErr = Math.round(baseErr * noiseMultiplier);
      e.push(mod(scaledErr, modulus));
    }

    // Public Key t = A * s + e mod (X^n + 1, q)
    const as = polyMulMod(a, s, degree, modulus);
    const t = polyAdd(as, e, modulus);

    // Encapsulation
    // Sample r, e1, e2
    const r: number[] = [];
    const e1: number[] = [];
    const e2: number[] = [];
    for (let i = 0; i < degree; i++) {
      r.push(mod(sampleBinomial(eta), modulus));
      e1.push(mod(Math.round(sampleBinomial(eta) * noiseMultiplier), modulus));
      e2.push(mod(Math.round(sampleBinomial(eta) * noiseMultiplier), modulus));
    }

    // Message encoding: m_poly = round(q / 2) * bit
    const halfQ = Math.round(modulus / 2);
    const mPoly = currentMsg.map((b) => mod(b * halfQ, modulus));

    // Ciphertext: u = A * r + e1
    // v = t * r + e2 + mPoly
    const ar = polyMulMod(a, r, degree, modulus);
    const u = polyAdd(ar, e1, modulus);

    const tr = polyMulMod(t, r, degree, modulus);
    const vWithoutM = polyAdd(tr, e2, modulus);
    const v = polyAdd(vWithoutM, mPoly, modulus);

    // Decapsulation:
    // dec = v - s * u mod (X^n + 1, q)
    const su = polyMulMod(s, u, degree, modulus);
    const noisySignal = polySub(v, su, modulus);

    // Threshold decoding: if closer to halfQ than 0, bit is 1, else 0
    const decodedBits: number[] = [];
    const noiseValues: number[] = [];
    const failureIndexes: number[] = [];

    for (let i = 0; i < degree; i++) {
      const val = noisySignal[i] ?? 0;
      const dist0 = Math.min(val, modulus - val);
      const distHalf = Math.abs(val - halfQ);
      const bit = distHalf < dist0 ? 1 : 0;
      decodedBits.push(bit);

      // Noise calculation: distance from expected center
      const expectedCenter = (currentMsg[i] ?? 0) === 1 ? halfQ : 0;
      const noise = centerMod(val - expectedCenter, modulus);
      noiseValues.push(noise);

      if (bit !== (currentMsg[i] ?? 0)) {
        failureIndexes.push(i);
      }
    }

    return {
      a,
      s,
      e,
      t,
      r,
      e1,
      e2,
      u,
      v,
      noisySignal,
      decodedBits,
      noiseValues,
      failureIndexes,
      halfQ,
    };
  }, [degree, modulus, eta, noiseMultiplier, currentMsg, seed]);

  const toggleBit = (idx: number) => {
    const next = [...currentMsg];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setMessageBits(next);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-card border border-border">
        {/* Modulus q */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Modulus (q)</span>
            <span className="font-mono text-foreground font-bold">q = {modulus}</span>
          </label>
          <div className="flex gap-1">
            {[17, 257, 3329].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setModulus(q)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-mono transition cursor-pointer ${
                  modulus === q
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {q === 3329 ? "3329 (FIPS)" : q}
              </button>
            ))}
          </div>
          <span className="text-[10.5px] text-muted-foreground block">
            {modulus === 3329 ? "NIST Kyber-512/768 prime" : modulus === 257 ? "Byte-friendly prime" : "Toy educational prime"}
          </span>
        </div>

        {/* Ring Degree n */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Ring Degree (n)</span>
            <span className="font-mono text-foreground font-bold">n = {degree}</span>
          </label>
          <div className="flex gap-1">
            {[4, 8, 16].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setDegree(n);
                  setMessageBits((prev) => {
                    const next = [...prev];
                    while (next.length < n) next.push(Math.random() > 0.5 ? 1 : 0);
                    return next.slice(0, n);
                  });
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-mono transition cursor-pointer ${
                  degree === n
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="text-[10.5px] text-muted-foreground block">
            Quotient ring Z_{modulus}[X] / (X^{degree} + 1)
          </span>
        </div>

        {/* Noise Multiplier (Failure Simulation) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sliders className="size-3 text-primary" /> Noise Variance
            </span>
            <span className={`font-mono text-xs font-bold ${noiseMultiplier > 1.8 ? "text-rose-500" : "text-primary"}`}>
              {noiseMultiplier.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.5"
            step="0.1"
            value={noiseMultiplier}
            onChange={(e) => setNoiseMultiplier(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[10.5px] text-muted-foreground block">
            Increase to cross failure threshold (q / 4 = {Math.round(modulus / 4)})
          </span>
        </div>

        {/* Reseed Button */}
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground py-2 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Resample Noise & Matrix</span>
          </button>
        </div>
      </div>

      {/* Message Bit Selector */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Binary className="size-4 text-primary" /> Message Bit Vector m ∈ &#123;0, 1&#125;^{degree}
            </h3>
            <p className="text-xs text-muted-foreground">
              Click individual bits to flip them. Each bit is mapped to &#123;0, ⌈q/2⌋&#125; in the polynomial ring.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setMessageBits(Array.from({ length: degree }, () => (Math.random() > 0.5 ? 1 : 0)))
            }
            className="text-[11px] font-mono px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
          >
            Randomize Bits
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentMsg.map((bit, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleBit(idx)}
              className={`flex flex-col items-center justify-center rounded-xl p-2.5 border min-w-[54px] transition cursor-pointer ${
                bit === 1
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-muted/50 text-foreground border-border hover:border-primary/40 font-mono"
              }`}
            >
              <span className="text-[10px] opacity-70">m[{idx}]</span>
              <span className="text-base">{bit}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Protocol Walkthrough Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stage 1: Key Generation */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                1
              </span>
              <h3 className="font-semibold text-sm text-foreground">Key Generation</h3>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              Alice
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                Public Seed Matrix A(X)
              </span>
              <div className="text-foreground truncate font-medium">
                [{sim.a.join(", ")}]
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase block mb-1 font-semibold">
                Secret Vector s & Noise e (Small)
              </span>
              <div className="text-foreground truncate">
                s = [{sim.s.join(", ")}]
              </div>
              <div className="text-muted-foreground truncate text-[11px] mt-0.5">
                e = [{sim.e.join(", ")}]
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase block mb-1 font-semibold">
                Public Key t = A·s + e (mod q)
              </span>
              <div className="text-foreground font-semibold truncate">
                [{sim.t.join(", ")}]
              </div>
            </div>
          </div>
        </div>

        {/* Stage 2: Encapsulation */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                2
              </span>
              <h3 className="font-semibold text-sm text-foreground">Encapsulation</h3>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              Bob
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                Random Ephemeral r & Errors e1, e2
              </span>
              <div className="text-foreground truncate">
                r = [{sim.r.join(", ")}]
              </div>
              <div className="text-muted-foreground truncate text-[11px] mt-0.5">
                e1 = [{sim.e1.join(", ")}], e2 = [{sim.e2.join(", ")}]
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase block mb-1 font-semibold">
                Ciphertext Vector u = A·r + e1
              </span>
              <div className="text-foreground font-medium truncate">
                [{sim.u.join(", ")}]
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase block mb-1 font-semibold">
                Ciphertext Scalar v = t·r + e2 + ⌈q/2⌋·m
              </span>
              <div className="text-foreground font-semibold truncate">
                [{sim.v.join(", ")}]
              </div>
            </div>
          </div>
        </div>

        {/* Stage 3: Decapsulation & Recovery */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                3
              </span>
              <h3 className="font-semibold text-sm text-foreground">Decapsulation</h3>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              Alice
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                Noise Cancellation (v - s·u mod q)
              </span>
              <div className="text-foreground truncate">
                signal = [{sim.noisySignal.join(", ")}]
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                A·s cancels A·r! Remaining is (e·r - s·e1 + e2) + ⌈q/2⌋·m.
              </p>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                sim.failureIndexes.length === 0
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-semibold">
                  Recovered Bits m'
                </span>
                {sim.failureIndexes.length === 0 ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="size-3" /> 100% Match
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                    <XCircle className="size-3" /> Error in {sim.failureIndexes.length} bit(s)
                  </span>
                )}
              </div>
              <div className="text-foreground font-bold text-sm tracking-wider">
                [{sim.decodedBits.join(", ")}]
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Noise Distribution & Failure Boundary Chart */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="size-4 text-primary" /> Noise Bound vs Decryption Failure Threshold
            </h3>
            <p className="text-xs text-muted-foreground">
              Correctness requires total noise |noise| &lt; ⌊q / 4⌋ ({Math.floor(modulus / 4)}). When noise exceeds
              this threshold, the bit snaps to the wrong center.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500" /> Normal Noise
            </span>
            <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
              <span className="size-2 rounded-full bg-rose-500" /> Error Threshold (±{Math.floor(modulus / 4)})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 pt-2">
          {sim.noiseValues.map((noise, idx) => {
            const threshold = Math.floor(modulus / 4);
            const isError = Math.abs(noise) > threshold;
            const percent = Math.min(100, Math.round((Math.abs(noise) / threshold) * 100));

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-between rounded-xl p-3 border text-center transition ${
                  isError
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300"
                    : "bg-muted/40 border-border text-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground font-mono">
                  <span>idx {idx}</span>
                  <span className="font-semibold text-foreground">m={currentMsg[idx]}</span>
                </div>

                <div className="my-2">
                  <span className="font-mono text-base font-bold">
                    {noise > 0 ? `+${noise}` : noise}
                  </span>
                  <span className="text-[10px] block opacity-70 font-mono">
                    max ±{threshold}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isError ? "bg-rose-500" : percent > 75 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. ML-DSA (Dilithium) Rejection Sampling Visualizer
// ---------------------------------------------------------------------------
function MLDSARejectionVisualizer() {
  const [samplesCount] = useState<number>(40);
  const [gamma1, setGamma1] = useState<number>(64); // Boundary
  const [beta, setBeta] = useState<number>(18); // Secret norm bound
  const [rejectionMode, setRejectionMode] = useState<boolean>(true);

  // Generate signature candidate vectors: z = y + c * s
  const candidates = useMemo(() => {
    const list: {
      id: number;
      y: number;
      cs: number;
      z: number;
      accepted: boolean;
      leaksInfo: boolean;
    }[] = [];

    // True secret s has a biased offset (e.g. +8)
    const secretOffset = 8;

    for (let i = 0; i < samplesCount; i++) {
      // y sampled uniformly from [-gamma1, gamma1]
      const y = Math.floor(Math.random() * (2 * gamma1 + 1)) - gamma1;
      // c * s has small bounded norm
      const cs = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * beta) + secretOffset;
      const z = y + cs;

      // In Dilithium: accept if ||z||_infinity < gamma1 - beta
      const threshold = gamma1 - beta;
      const accepted = Math.abs(z) < threshold;

      list.push({
        id: i,
        y,
        cs,
        z,
        accepted,
        leaksInfo: !accepted && Math.abs(z) <= gamma1 + beta,
      });
    }

    return list;
  }, [samplesCount, gamma1, beta]);

  const acceptedCount = candidates.filter((c) => c.accepted).length;
  const acceptanceRate = ((acceptedCount / samplesCount) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              The "Fiat-Shamir with Aborts" Paradigm (Lyubashevsky / Dilithium)
            </h2>
          </div>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-muted text-foreground border border-border">
            FIPS 204
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In classical signatures (like Schnorr or ECDSA), $s$ is protected by the discrete logarithm trapdoor.
          In lattice schemes, if a signer outputs $z = y + c \cdot s$, the statistical distribution of $z$ is
          shifted by $c \cdot s$. <strong>Without rejection sampling, an attacker averaging many signatures directly recovers the secret key $s$!</strong>
          Dilithium solves this by restarting if $z$ falls within $\beta$ of the boundary $\gamma_1$.
        </p>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-card border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Uniform Bound (γ₁)</span>
            <span className="font-mono text-foreground">{gamma1}</span>
          </div>
          <input
            type="range"
            min="32"
            max="128"
            value={gamma1}
            onChange={(e) => setGamma1(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[10.5px] text-muted-foreground">Signer samples y uniformly in [-γ₁, γ₁]</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Secret Norm Bound (β)</span>
            <span className="font-mono text-foreground">{beta}</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            value={beta}
            onChange={(e) => setBeta(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[10.5px] text-muted-foreground">Maximum contribution of challenge c·s</span>
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/50 border border-border">
            <span className="text-xs font-medium text-foreground">Rejection Filter</span>
            <button
              type="button"
              onClick={() => setRejectionMode(!rejectionMode)}
              className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition cursor-pointer ${
                rejectionMode
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {rejectionMode ? "ACTIVE (Secure)" : "DISABLED (Leaking)"}
            </button>
          </div>
        </div>
      </div>

      {/* Acceptance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Acceptance Rate</span>
            <div className="text-xl font-bold font-mono text-foreground">{acceptanceRate}%</div>
          </div>
          <CheckCircle2 className="size-6 text-emerald-500" />
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Safe Zone Bound</span>
            <div className="text-xl font-bold font-mono text-foreground">
              [-{gamma1 - beta}, +{gamma1 - beta}]
            </div>
          </div>
          <Scale className="size-6 text-primary" />
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Secret Bias Leakage</span>
            <div className={`text-xl font-bold font-mono ${rejectionMode ? "text-emerald-500" : "text-rose-500"}`}>
              {rejectionMode ? "0.00 (Zero)" : "+8.24 (Compromised)"}
            </div>
          </div>
          {rejectionMode ? <ShieldCheck className="size-6 text-emerald-500" /> : <ShieldAlert className="size-6 text-rose-500" />}
        </div>
      </div>

      {/* Candidate Samples Scatter View */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Signature Samples Distribution (y vs z)
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            {candidates.length} simulated attempts
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {candidates.map((c) => {
            const isKept = rejectionMode ? c.accepted : true;
            return (
              <div
                key={c.id}
                className={`p-2 rounded-lg border text-center font-mono text-xs transition ${
                  isKept
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 opacity-60"
                }`}
                title={`y=${c.y}, c*s=${c.cs}, z=${c.z}`}
              >
                <div className="text-[9px] opacity-70">#{c.id}</div>
                <div className="font-bold my-0.5">{c.z}</div>
                <div className="text-[9px]">
                  {isKept ? "ACCEPT" : "REJECT"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. 2D CVP Lattice Geometry Visualizer
// ---------------------------------------------------------------------------
function LatticeCVPVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [basisType, setBasisType] = useState<"good" | "bad">("good");
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number }>({ x: 3.4, y: 2.7 });

  // Basis vectors
  // Good basis (orthogonal, short)
  const goodB1 = { x: 2, y: 0 };
  const goodB2 = { x: 0, y: 2 };

  // Bad basis (skewed, long)
  const badB1 = { x: 4, y: 2 };
  const badB2 = { x: 6, y: 4 };

  const activeB1 = basisType === "good" ? goodB1 : badB1;
  const activeB2 = basisType === "good" ? goodB2 : badB2;

  // Closest lattice point calculation using Babai rounding
  const closestPoint = useMemo(() => {
    // Solve [x, y] = c1 * b1 + c2 * b2
    const det = activeB1.x * activeB2.y - activeB1.y * activeB2.x;
    if (Math.abs(det) < 0.0001) return { x: 0, y: 0 };

    const c1 = (targetPoint.x * activeB2.y - targetPoint.y * activeB2.x) / det;
    const c2 = (activeB1.x * targetPoint.y - activeB1.y * targetPoint.x) / det;

    const roundC1 = Math.round(c1);
    const roundC2 = Math.round(c2);

    return {
      x: roundC1 * activeB1.x + roundC2 * activeB2.x,
      y: roundC1 * activeB1.y + roundC2 * activeB2.y,
      c1: roundC1,
      c2: roundC2,
    };
  }, [targetPoint, activeB1, activeB2]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 30; // 30px per unit
    const originX = width / 2;
    const originY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw Grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let x = -10; x <= 10; x++) {
      ctx.beginPath();
      ctx.moveTo(originX + x * scale, 0);
      ctx.lineTo(originX + x * scale, height);
      ctx.stroke();
    }
    for (let y = -10; y <= 10; y++) {
      ctx.beginPath();
      ctx.moveTo(0, originY - y * scale);
      ctx.lineTo(width, originY - y * scale);
      ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Draw Lattice Points for integer linear combinations
    ctx.fillStyle = "#3b82f6";
    for (let i = -8; i <= 8; i++) {
      for (let j = -8; j <= 8; j++) {
        const lx = i * goodB1.x + j * goodB2.x;
        const ly = i * goodB1.y + j * goodB2.y;
        const px = originX + lx * scale;
        const py = originY - ly * scale;
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw Active Basis Vectors
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + activeB1.x * scale, originY - activeB1.y * scale);
    ctx.stroke();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + activeB2.x * scale, originY - activeB2.y * scale);
    ctx.stroke();

    // Draw Closest Found Lattice Point
    const solX = originX + closestPoint.x * scale;
    const solY = originY - closestPoint.y * scale;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(solX, solY, 7, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw Target Point in Red
    const tgtX = originX + targetPoint.x * scale;
    const tgtY = originY - targetPoint.y * scale;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(tgtX, tgtY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Connect Target to Closest Found Point
    ctx.strokeStyle = "#10b981";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tgtX, tgtY);
    ctx.lineTo(solX, solY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [basisType, targetPoint, activeB1, activeB2, closestPoint, goodB1, goodB2]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5 rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="size-4 text-primary" /> Basis & Trapdoor Geometry
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In lattice cryptography (GGH, NTRU, LWE), the private key is a "good" (nearly orthogonal) basis.
            The public key is a scrambled, "bad" (skewed) basis spanning the exact same lattice.
          </p>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Select Basis View</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBasisType("good")}
                className={`flex-1 rounded-xl p-3 text-xs font-medium border transition text-left cursor-pointer ${
                  basisType === "good"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <div className="font-bold">Private Basis</div>
                <div className="text-[10.5px] opacity-80 mt-0.5">Orthogonal & Short</div>
              </button>

              <button
                type="button"
                onClick={() => setBasisType("bad")}
                className={`flex-1 rounded-xl p-3 text-xs font-medium border transition text-left cursor-pointer ${
                  basisType === "bad"
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <div className="font-bold">Public Basis</div>
                <div className="text-[10.5px] opacity-80 mt-0.5">Skewed & Elongated</div>
              </button>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs p-3 rounded-xl bg-muted/40 border border-border">
            <div className="flex justify-between text-violet-600 dark:text-violet-400 font-semibold">
              <span>Vector b₁:</span>
              <span>({activeB1.x}, {activeB1.y})</span>
            </div>
            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
              <span>Vector b₂:</span>
              <span>({activeB2.x}, {activeB2.y})</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-foreground">
              <span>Closest Found Point:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ({closestPoint.x}, {closestPoint.y})
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
              <span>Target Point X</span>
              <span className="font-mono text-foreground font-bold">{targetPoint.x.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.1"
              value={targetPoint.x}
              onChange={(e) => setTargetPoint((p) => ({ ...p, x: parseFloat(e.target.value) }))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
              <span>Target Point Y</span>
              <span className="font-mono text-foreground font-bold">{targetPoint.y.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.1"
              value={targetPoint.y}
              onChange={(e) => setTargetPoint((p) => ({ ...p, y: parseFloat(e.target.value) }))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* 2D Canvas */}
        <div className="md:col-span-2 rounded-2xl bg-card border border-border p-4 flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={600}
            height={440}
            className="w-full max-w-[600px] h-auto rounded-xl bg-background border border-border/70 shadow-inner"
          />
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" /> Target Ciphertext Point t
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" /> Babai Closest Point
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-500" /> Lattice Points (Λ)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
