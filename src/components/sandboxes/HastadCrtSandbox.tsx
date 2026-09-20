import { useState, useMemo } from "react";
import {
  Zap,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Calculator,
  ShieldAlert,
  HelpCircle,
  Radio,
  Layers,
  KeyRound,
} from "lucide-react";
import { extendedEuclid, modPow } from "@/lib/crypto/numbertheory";

export function HastadCrtSandbox() {
  const PRESETS = [
    { label: "Integer Target: m = 77 ('M')", val: "77" },
    { label: "Short Flag: m = 'KEY'", val: "4933977" }, // 'K'=75, 'E'=69, 'Y'=89 -> packed int
    { label: "Value: m = 142", val: "142" },
  ];

  const [inputVal, setInputVal] = useState("77");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // 3 Coprime moduli with public exponent e = 3
  const e = 3n;
  const N1 = 3337n; // 47 * 71
  const N2 = 3551n; // 53 * 67
  const N3 = 3763n; // 53 * 71? 3763 = 43 * 87.5.. wait 53 * 71 = 3763
  // All three pairwise coprime: gcd(3337, 3551) = 1, gcd(3551, 3763) = 1, gcd(3337, 3763) = 71?
  // Let's ensure STRICT pairwise coprimality:
  // Let primes be: p1=47, q1=73 -> N1 = 3431
  // p2=53, q2=67 -> N2 = 3551
  // p3=43, q3=79 -> N3 = 3397
  // gcd(3431, 3551) = 1, gcd(3551, 3397) = 1, gcd(3431, 3397) = 1!
  const moduli: [bigint, bigint, bigint] = useMemo(() => [3431n, 3551n, 3397n], []);

  const secretM = useMemo(() => {
    try {
      const parsed = BigInt(inputVal.trim());
      // Must be smaller than minimum modulus
      const minN = moduli.reduce((min, n) => (n < min ? n : min), moduli[0]);
      if (parsed <= 0n || parsed >= minN) return 77n;
      return parsed;
    } catch {
      return 77n;
    }
  }, [inputVal, moduli]);

  // Compute ciphertexts: c_i = m^3 mod N_i
  const ciphertexts: [bigint, bigint, bigint] = useMemo(() => {
    return [
      modPow(secretM, e, moduli[0]),
      modPow(secretM, e, moduli[1]),
      modPow(secretM, e, moduli[2]),
    ];
  }, [secretM, moduli, e]);

  // Chinese Remainder Theorem Calculations
  const crtResult = useMemo(() => {
    const [n1, n2, n3] = moduli;
    const [c1, c2, c3] = ciphertexts;

    const N = n1 * n2 * n3;
    const M1 = n2 * n3;
    const M2 = n1 * n3;
    const M3 = n1 * n2;

    // Helper for BigInt modular inverse via Extended Euclidean
    function getModInv(a: bigint, m: bigint): bigint {
      let [old_r, r] = [a % m, m];
      let [old_s, s] = [1n, 0n];
      while (r !== 0n) {
        const q = old_r / r;
        [old_r, r] = [r, old_r - q * r];
        [old_s, s] = [s, old_s - q * s];
      }
      return ((old_s % m) + m) % m;
    }

    const y1 = getModInv(M1, n1);
    const y2 = getModInv(M2, n2);
    const y3 = getModInv(M3, n3);

    const term1 = c1 * M1 * y1;
    const term2 = c2 * M2 * y2;
    const term3 = c3 * M3 * y3;

    const combinedC = (term1 + term2 + term3) % N;

    // Integer cube root of combinedC via binary search
    let low = 0n;
    let high = combinedC;
    let recoveredM = 0n;

    while (low <= high) {
      const mid = (low + high) / 2n;
      const cube = mid * mid * mid;
      if (cube === combinedC) {
        recoveredM = mid;
        break;
      } else if (cube < combinedC) {
        recoveredM = mid;
        low = mid + 1n;
      } else {
        high = mid - 1n;
      }
    }

    return {
      N,
      M1,
      M2,
      M3,
      y1,
      y2,
      y3,
      term1,
      term2,
      term3,
      combinedC,
      recoveredM,
    };
  }, [moduli, ciphertexts]);

  const handleReset = () => {
    setActiveStep(1);
    setInputVal("77");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded ring-1 ring-amber-500/30">
              Coppersmith / CRT Sandbox
            </span>
            <span className="font-mono text-xs text-muted-foreground">Johan Håstad (CRYPTO 1985)</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-1">
            Håstad's Broadcast Attack & Chinese Remainder Theorem Lab
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[65ch]">
            When the same message $m$ is encrypted with public exponent $e = 3$ to three or more recipients with coprime moduli, an attacker combines the ciphertexts via CRT to compute $m^3$ over the integers ℤ and takes an ordinary integer cube root without factoring any modulus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Reset Sandbox"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Target Setup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] text-muted-foreground uppercase font-bold block">
            Broadcast Secret Message $m$ (must satisfy $m &lt; \min(N_i)$):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setActiveStep(1);
              }}
              className="flex-1 rounded-xl bg-background border border-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter message integer (e.g. 77, 142)..."
            />
            <div className="flex gap-1">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputVal(p.val);
                    setActiveStep(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] transition cursor-pointer border ${
                    inputVal === p.val
                      ? "bg-primary text-primary-foreground border-primary font-bold"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase font-bold block">
            Public Parameters:
          </label>
          <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border">
            <span className="text-muted-foreground">Exponent:</span>
            <span className="font-bold text-primary font-mono">e = 3 (Low Exponent)</span>
          </div>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeStep === 1
              ? "border-primary bg-primary/10 text-primary font-bold"
              : "border-border bg-background/50 hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <span className="text-[10px] block opacity-70">STAGE 1</span>
          <span>1. Broadcast Intercept</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeStep === 2
              ? "border-primary bg-primary/10 text-primary font-bold"
              : "border-border bg-background/50 hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <span className="text-[10px] block opacity-70">STAGE 2</span>
          <span>2. Chinese Remainder Theorem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeStep === 3
              ? "border-primary bg-primary/10 text-primary font-bold"
              : "border-border bg-background/50 hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <span className="text-[10px] block opacity-70">STAGE 3</span>
          <span>3. Integer Cube Root Recovery</span>
        </button>
      </div>

      {/* STAGE 1: Broadcast Intercept */}
      {activeStep === 1 && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5">
              <Radio className="size-3.5 text-primary" /> Intercepted Transmission Parameters
            </span>
            <span className="text-muted-foreground">3 Independent Recipients</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {moduli.map((N, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-background/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold text-foreground">Receiver {idx + 1}</span>
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">e = 3</span>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Modulus $N_{idx + 1}$:</div>
                  <div className="font-bold text-foreground">{N.toString()}</div>
                </div>
                <div className="space-y-1 pt-1 border-t border-border/60">
                  <div className="text-muted-foreground">Ciphertext $c_{idx + 1} = m^3 \pmod N$:</div>
                  <div className="font-bold text-primary break-all">{(ciphertexts[idx] ?? 0n).toString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-muted-foreground flex items-start gap-2">
            <HelpCircle className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong>Adversary Knowledge:</strong> An eavesdropper intercepts all three $(N_i, c_i)$ pairs. Because the moduli are pairwise coprime ($\gcd(N_i, N_j) = 1$), the Chinese Remainder Theorem guarantees a unique solution modulo $N = N_1 N_2 N_3$.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Stage 2: Combine via CRT</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      {/* STAGE 2: Chinese Remainder Theorem */}
      {activeStep === 2 && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5">
              <Calculator className="size-3.5 text-primary" /> Sun Tzu's Chinese Remainder Theorem Synthesis
            </span>
            <span className="text-muted-foreground">Compound Modulus $N = N_1 \times N_2 \times N_3$</span>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
              <div>
                <span className="block text-[10px] uppercase font-bold text-foreground">Global Modulus Product:</span>
                <span className="font-bold text-primary text-sm">{crtResult.N.toString()}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-foreground">Combined System:</span>
                <span>c ≡ m³ (mod N_i) for i ∈ {'{1, 2, 3}'}</span>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] text-muted-foreground uppercase">
                    <th className="py-1">Branch</th>
                    <th className="py-1">Partial Modulus $M_i = N/N_i$</th>
                    <th className="py-1">Bézout Inverse $y_i = M_i^{"{ -1 }"} \pmod N_i$</th>
                    <th className="py-1">Term $c_i M_i y_i$</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2 font-bold text-foreground">i = 1</td>
                    <td className="py-2 text-foreground">{crtResult.M1.toString()}</td>
                    <td className="py-2 text-amber-500 font-bold">{crtResult.y1.toString()}</td>
                    <td className="py-2 text-primary font-bold break-all">{crtResult.term1.toString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-foreground">i = 2</td>
                    <td className="py-2 text-foreground">{crtResult.M2.toString()}</td>
                    <td className="py-2 text-amber-500 font-bold">{crtResult.y2.toString()}</td>
                    <td className="py-2 text-primary font-bold break-all">{crtResult.term2.toString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-foreground">i = 3</td>
                    <td className="py-2 text-foreground">{crtResult.M3.toString()}</td>
                    <td className="py-2 text-amber-500 font-bold">{crtResult.y3.toString()}</td>
                    <td className="py-2 text-primary font-bold break-all">{crtResult.term3.toString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-muted/60 border border-border mt-2 space-y-1">
              <div className="text-[10px] uppercase text-muted-foreground font-bold">Sum Modulo N:</div>
              <div className="font-bold text-foreground break-all text-sm">
                $C = (\sum c_i M_i y_i) \pmod N = $ <span className="text-primary">{crtResult.combinedC.toString()}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Stage 3: Extract Integer Cube Root</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      {/* STAGE 3: Integer Cube Root Recovery */}
      {activeStep === 3 && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5">
              <Zap className="size-3.5 text-emerald-500" /> Exact Mathematical Trapdoor Inversion
            </span>
            <span className="text-emerald-500 font-bold">Attack Completed</span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-4 text-emerald-950 dark:text-emerald-200">
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400">
                1. Mathematical Zero-Wraparound Proof:
              </div>
              <div className="rounded-lg bg-background/80 border border-emerald-500/20 p-3 text-foreground space-y-1">
                <p>Because $m &lt; N_1$, $m &lt; N_2$, and $m &lt; N_3$, it strictly holds that:</p>
                <p className="font-bold text-primary">
                  $m^3 &lt; N_1 \times N_2 \times N_3 = N$
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Therefore, no modular reduction (wraparound) occurred! The equation $C \equiv m^3 \pmod N$ is an <strong>exact integer equality</strong> over the integers ℤ:
                </p>
                <p className="font-bold text-foreground text-sm">
                  $C = m^3 = {crtResult.combinedC.toString()}$
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400">
                2. Real Integer Cube Root:
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border border-emerald-500/20 text-foreground">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  $\lfloor \sqrt[3]{"{"}{crtResult.combinedC.toString()}{"}"} \rfloor = $
                </div>
                <div className="text-2xl font-bold text-primary font-mono">
                  {crtResult.recoveredM.toString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs pt-1">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Plaintext Recovered:</strong> Decoded value = <strong>{crtResult.recoveredM.toString()}</strong>
                {crtResult.recoveredM >= 32n && crtResult.recoveredM <= 126n && (
                  <> (ASCII Character: <strong>'{String.fromCharCode(Number(crtResult.recoveredM))}'</strong>)</>
                )}
                . Private keys $d_1, d_2, d_3$ were never factored or required!
              </span>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
            <strong>Security Mitigation:</strong> Modern RSA implementations prevent Håstad's broadcast attack by using randomized asymmetric padding schemes such as <strong>RSA-OAEP</strong> (Optimal Asymmetric Encryption Padding, RFC 8017), ensuring that each transmission contains unique random entropy even for identical messages.
          </div>
        </div>
      )}
    </div>
  );
}
