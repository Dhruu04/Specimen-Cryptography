import { useState } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function RsaVisualizer({ values, resultOutput }: Props) {
  const p = Number.parseInt(values["p"] ?? "61", 10) || 61;
  const q = Number.parseInt(values["q"] ?? "53", 10) || 53;
  const e = Number.parseInt(values["e"] ?? "17", 10) || 17;
  const m = Number.parseInt(values["m"] ?? "65", 10) || 65;

  const n = p * q;
  const phi = (p - 1) * (q - 1);

  // Modular inverse of e mod phi
  let d = 0;
  for (let i = 1; i < phi; i++) {
    if ((e * i) % phi === 1) {
      d = i;
      break;
    }
  }

  // ModPow
  const modPow = (base: number, exp: number, mod: number) => {
    let res = 1;
    base = base % mod;
    let bExp = BigInt(exp);
    let bBase = BigInt(base);
    let bMod = BigInt(mod);
    let bRes = BigInt(1);
    while (bExp > 0n) {
      if (bExp % 2n === 1n) bRes = (bRes * bBase) % bMod;
      bExp = bExp / 2n;
      bBase = (bBase * bBase) % bMod;
    }
    return Number(bRes);
  };

  const c = modPow(m, e, n);
  const decryptedM = modPow(c, d, n);

  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      title: "1. Prime Selection",
      math: `p = ${p}, q = ${q}`,
      desc: "Two large distinct random prime numbers chosen by the key owner.",
      color: "border-primary",
    },
    {
      title: "2. Modulus & Euler Totient",
      math: `n = p × q = ${n} | φ(n) = (p-1)(q-1) = ${phi}`,
      desc: "n is made public. Factoring n back into p and q is computationally infeasible for 2048-bit numbers.",
      color: "border-primary",
    },
    {
      title: "3. Key Pair Derivation",
      math: `Public: (e=${e}, n=${n}) | Private: (d=${d}, n=${n})`,
      desc: `d is derived via Extended Euclidean Algorithm such that (e × d) ≡ 1 (mod φ(n)). Notice ${e} × ${d} = ${e * d} ≡ 1 (mod ${phi}).`,
      color: "border-amber-600",
    },
    {
      title: "4. Modular Encryption",
      math: `c ≡ m^e mod n ≡ ${m}^${e} mod ${n} ≡ ${c}`,
      desc: "The sender computes ciphertext c using the recipient's public key (e, n).",
      color: "border-primary",
    },
    {
      title: "5. Trapdoor Decryption",
      math: `m ≡ c^d mod n ≡ ${c}^${d} mod ${n} ≡ ${decryptedM}`,
      desc: "Only the recipient with secret exponent d can invert the trapdoor one-way permutation.",
      color: "border-emerald-600",
    },
  ];

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">RSA Trapdoor One-Way Permutation Engine</span>
          <p className="text-[12px] text-muted-foreground">
            Rivest-Shamir-Adleman · Modulus <code className="font-mono text-foreground font-semibold">n = {n}</code> · Euler Totient <code className="font-mono text-foreground font-semibold">φ(n) = {phi}</code>
          </p>
        </div>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="mt-4 grid gap-2 sm:grid-cols-5 font-mono text-[11px]">
        {steps.map((st, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveStep(i)}
            className={`flex flex-col rounded-[12px] p-2.5 text-left transition ring-1 ${
              activeStep === i
                ? "bg-primary/15 text-foreground ring-primary shadow-xs font-bold"
                : "bg-card text-muted-foreground ring-border hover:bg-muted"
            }`}
          >
            <span className="text-[10px] text-primary">{st.title.split(". ")[1]}</span>
            <span className="mt-1 text-[11.5px] font-bold text-foreground truncate">{st.math.split(" | ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Active Step Highlight Card */}
      {(() => {
        const fallbackStep = { title: "1. Prime Selection", math: "p, q", desc: "" };
        const currentStep = steps[activeStep] ?? steps[0] ?? fallbackStep;
        return (
          <div className="mt-4 rounded-[14px] bg-card p-3.5 ring-1 ring-border shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
              <span className="font-display text-[13px] font-semibold text-foreground">{currentStep.title}</span>
              <code className="rounded bg-background px-2 py-0.5 font-mono text-[11px] text-primary ring-1 ring-border">
                {currentStep.math}
              </code>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{currentStep.desc}</p>
          </div>
        );
      })()}

      {/* Mathematical Proof Accordion Box */}
      <div className="mt-3.5 rounded-[12px] bg-card/60 p-3 ring-1 ring-border/60 font-mono text-[11.5px]">
        <span className="text-[10.5px] uppercase font-bold text-primary block mb-1">Mathematical Correctness Proof (Euler's Theorem):</span>
        <p className="text-foreground/90 leading-relaxed">
          Because <code className="text-primary font-bold">e · d ≡ 1 (mod φ(n))</code>, there exists integer k such that <code className="text-primary">e · d = k·φ(n) + 1</code>.<br />
          Therefore: <code className="text-foreground font-semibold">c^d ≡ (m^e)^d ≡ m^(ed) ≡ m^(k·φ(n)+1) ≡ (m^φ(n))^k · m ≡ 1^k · m ≡ m (mod n)</code>.
        </p>
      </div>
    </div>
  );
}
