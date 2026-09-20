import { useMemo } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function HillVisualizer({ values, resultOutput }: Props) {
  const text = (values["text"] ?? "ACT").toUpperCase().replace(/[^A-Z]/g, "");
  const k11 = Number.parseInt(values["k11"] ?? "9", 10) || 9;
  const k12 = Number.parseInt(values["k12"] ?? "4", 10) || 4;
  const k21 = Number.parseInt(values["k21"] ?? "5", 10) || 5;
  const k22 = Number.parseInt(values["k22"] ?? "7", 10) || 7;

  const det = (k11 * k22 - k12 * k21) % 26;
  const normDet = (det + 26) % 26;

  // Find inverse of det mod 26
  let invDet = 0;
  for (let i = 1; i < 26; i++) {
    if ((normDet * i) % 26 === 1) {
      invDet = i;
      break;
    }
  }

  const isInvertible = invDet !== 0;

  // Pair characters
  const pairs = useMemo(() => {
    const padded = text.length % 2 === 0 ? text : text + "X";
    const res = [];
    for (let i = 0; i < padded.length; i += 2) {
      const p1 = padded.charCodeAt(i) - 65;
      const p2 = padded.charCodeAt(i + 1) - 65;
      const c1 = (k11 * p1 + k12 * p2) % 26;
      const c2 = (k21 * p1 + k22 * p2) % 26;
      res.push({
        pairStr: padded.slice(i, i + 2),
        p1,
        p2,
        c1,
        c2,
        cStr: String.fromCharCode(65 + c1, 65 + c2),
      });
    }
    return res;
  }, [text, k11, k12, k21, k22]);

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Lester S. Hill 2×2 Matrix Polygraphic Engine</span>
          <p className="text-[12px] text-muted-foreground">
            Linear algebra over the ring <code className="font-mono text-foreground font-semibold">ℤ₂₆</code> (Stallings Ch. 3)
          </p>
        </div>
        <div className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold ring-1 ${
          isInvertible ? "bg-emerald-500/15 text-emerald-800 ring-emerald-500/30" : "bg-destructive/15 text-destructive ring-destructive/30"
        }`}>
          {isInvertible ? `Invertible (det=${normDet})` : `Singular det=${normDet}`}
        </div>
      </div>

      {/* 2x2 Key Matrix Display */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 font-mono text-[11.5px]">
        <div className="rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <span className="text-[10px] text-muted-foreground uppercase block mb-1">Key Matrix K:</span>
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-[26px] font-thin text-muted-foreground">[</span>
            <div className="grid grid-cols-2 gap-3 text-center text-[15px] font-bold text-primary">
              <span className="rounded bg-background p-1.5 ring-1 ring-border">{k11}</span>
              <span className="rounded bg-background p-1.5 ring-1 ring-border">{k12}</span>
              <span className="rounded bg-background p-1.5 ring-1 ring-border">{k21}</span>
              <span className="rounded bg-background p-1.5 ring-1 ring-border">{k22}</span>
            </div>
            <span className="text-[26px] font-thin text-muted-foreground">]</span>
          </div>
        </div>

        <div className="rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <span className="text-[10px] text-muted-foreground uppercase block mb-1">Determinant & Inversion:</span>
          <div className="space-y-1.5 text-[11px]">
            <p>det(K) = ({k11}×{k22}) - ({k12}×{k21}) = {k11 * k22 - k12 * k21} ≡ <strong className="text-foreground">{normDet} (mod 26)</strong></p>
            <p>gcd(det, 26) = {isInvertible ? "1 (coprime)" : "≠ 1 (invalid key!)"}</p>
            <p>det⁻¹ mod 26 = <strong className="text-primary font-bold">{invDet}</strong></p>
          </div>
        </div>
      </div>

      {/* Vector Pair Multiplications */}
      <div className="mt-4">
        <span className="label-tiny mb-2 block">Digraph Vector Transformations:</span>
        <div className="grid gap-2 sm:grid-cols-2 font-mono text-[11px]">
          {pairs.map((p, i) => (
            <div key={i} className="rounded-[10px] bg-card p-2.5 ring-1 ring-border shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground text-[10px]">Digraph #{i + 1}: "{p.pairStr}"</span>
                <span className="text-primary font-bold">→ "{p.cStr}"</span>
              </div>
              <div className="mt-1.5 space-y-0.5 text-[10.5px]">
                <p>c₁ = ({k11}×{p.p1} + {k12}×{p.p2}) mod 26 = <strong className="text-foreground">{p.c1}</strong> ('{p.cStr[0]}')</p>
                <p>c₂ = ({k21}×{p.p1} + {k22}×{p.p2}) mod 26 = <strong className="text-foreground">{p.c2}</strong> ('{p.cStr[1]}')</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
