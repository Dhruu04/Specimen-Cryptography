import { useState } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function EccVisualizer({ values, resultOutput }: Props) {
  const a = Number.parseInt(values["a"] ?? "2", 10) || 2;
  const b = Number.parseInt(values["b"] ?? "3", 10) || 3;
  const p = Number.parseInt(values["p"] ?? "97", 10) || 97;
  const px = Number.parseInt(values["px"] ?? "3", 10) || 3;
  const py = Number.parseInt(values["py"] ?? "6", 10) || 6;
  const k = Number.parseInt(values["k"] ?? "2", 10) || 2;

  // Tangent slope for 2P mod p
  const modInverse = (val: number, mod: number) => {
    let m0 = mod, y = 0, x = 1;
    if (mod === 1) return 0;
    while (val > 1) {
      let q = Math.floor(val / mod);
      let t = mod;
      mod = val % mod;
      val = t;
      t = y;
      y = x - q * y;
      x = t;
    }
    if (x < 0) x += m0;
    return x;
  };

  let slope = 0;
  let doubleX = 0;
  let doubleY = 0;
  try {
    const num = (3 * px * px + a) % p;
    const den = (2 * py) % p;
    const invDen = modInverse((den + p) % p, p);
    slope = (((num * invDen) % p) + p) % p;
    doubleX = (((slope * slope - 2 * px) % p) + p) % p;
    doubleY = (((slope * (px - doubleX) - py) % p) + p) % p;
  } catch {
    // fallback
  }

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Elliptic Curve Weierstrass Point Doubling & Addition</span>
          <p className="text-[12px] text-muted-foreground">
            Equation: <code className="font-mono text-foreground font-semibold">y² ≡ x³ + {a}x + {b} (mod {p})</code>
          </p>
        </div>
        <div className="rounded-full bg-card px-3 py-1 font-mono text-[11px] text-primary ring-1 ring-border font-bold">
          Generator P = ({px}, {py})
        </div>
      </div>

      {/* SVG Curve Geometry Plot */}
      <div className="mt-4 flex flex-col items-center">
        <span className="label-tiny mb-2">Continuous Curve Representation y² = x³ - 3x + 3 (Abelian Group Law):</span>
        <div className="w-full max-w-lg rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <svg viewBox="-60 -50 120 100" className="w-full h-44 overflow-visible">
            {/* Axis */}
            <line x1="-55" y1="0" x2="55" y2="0" stroke="currentColor" strokeWidth="0.75" className="text-border" />
            <line x1="0" y1="-45" x2="0" y2="45" stroke="currentColor" strokeWidth="0.75" className="text-border" />

            {/* Smooth Weierstrass cubic curve: y = +/- sqrt(x^3 - 3x + 3) */}
            <path
              d="M -30 -40 C -15 -10, -5 -5, 0 -8 C 5 -10, 20 -25, 40 -40 M -30 40 C -15 10, -5 5, 0 8 C 5 10, 20 25, 40 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/70"
            />

            {/* Secant / Tangent line */}
            <line x1="-35" y1="-25" x2="45" y2="35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-amber-600" />

            {/* Point P */}
            <circle cx="-15" cy="-10" r="3.5" className="fill-primary stroke-white stroke-2" />
            <text x="-25" y="-14" className="font-mono text-[8px] fill-foreground font-bold">P({px},{py})</text>

            {/* Point Q */}
            <circle cx="10" cy="9" r="3.5" className="fill-primary stroke-white stroke-2" />
            <text x="14" y="8" className="font-mono text-[8px] fill-foreground font-bold">Q</text>

            {/* Intersect point -R */}
            <circle cx="30" cy="24" r="3" className="fill-muted-foreground stroke-white stroke-1.5" />
            <text x="33" y="24" className="font-mono text-[7px] fill-muted-foreground">-R</text>

            {/* Reflected point R = P + Q */}
            <line x1="30" y1="24" x2="30" y2="-24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-primary/50" />
            <circle cx="30" cy="-24" r="4" className="fill-emerald-600 stroke-white stroke-2" />
            <text x="34" y="-22" className="font-mono text-[8px] fill-emerald-800 font-bold">R = P + Q</text>
          </svg>
        </div>
      </div>

      {/* Discrete Field GF(p) Arithmetic Breakdown */}
      <div className="mt-4 rounded-[14px] bg-card p-3.5 ring-1 ring-border shadow-2xs font-mono text-[11.5px]">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="font-bold text-foreground text-[12px]">Algebraic Step: Point Doubling 2P = P + P</span>
          <span className="text-primary font-bold">2P = ({doubleX}, {doubleY})</span>
        </div>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2 text-[11px]">
          <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
            <span className="block text-[9.5px] text-muted-foreground uppercase">Tangent Slope λ</span>
            <code className="text-foreground">λ = (3x₁² + a)/(2y₁) mod p = {slope}</code>
          </div>
          <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
            <span className="block text-[9.5px] text-muted-foreground uppercase">Point Coordinates (x₃, y₃)</span>
            <code className="text-foreground">x₃ = λ² - 2x₁ mod p = {doubleX}<br />y₃ = λ(x₁ - x₃) - y₁ mod p = {doubleY}</code>
          </div>
        </div>
      </div>

      {/* ECDLP Hardness Note */}
      <div className="mt-3.5 rounded-[10px] bg-card/60 p-2.5 text-[11.5px] text-muted-foreground ring-1 ring-border/60">
        <strong className="text-foreground">Elliptic Curve Discrete Logarithm Problem (ECDLP):</strong> Given $P$ and $Q = k \cdot P$, finding the scalar multiplier $k$ requires $O(\sqrt{p})$ operations via Pollard's Rho, enabling a 256-bit ECC key (like Bitcoin's secp256k1) to match the security of a 3072-bit RSA key!
      </div>
    </div>
  );
}
