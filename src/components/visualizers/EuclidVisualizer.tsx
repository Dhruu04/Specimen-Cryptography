import { useMemo } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function EuclidVisualizer({ values, resultOutput }: Props) {
  const a = Number.parseInt(values["a"] ?? "240", 10) || 240;
  const b = Number.parseInt(values["b"] ?? "46", 10) || 46;

  const rows = useMemo(() => {
    let rPrev = a;
    let rCurr = b;
    let sPrev = 1;
    let sCurr = 0;
    let tPrev = 0;
    let tCurr = 1;

    const tableau = [
      { step: 0, q: "-", r: rPrev, s: sPrev, t: tPrev, expr: `${rPrev} = (${a} × ${sPrev}) + (${b} × ${tPrev})` },
      { step: 1, q: "-", r: rCurr, s: sCurr, t: tCurr, expr: `${rCurr} = (${a} × ${sCurr}) + (${b} × ${tCurr})` },
    ];

    let step = 2;
    while (rCurr !== 0 && step < 25) {
      const q = Math.floor(rPrev / rCurr);
      const rNext = rPrev - q * rCurr;
      const sNext = sPrev - q * sCurr;
      const tNext = tPrev - q * tCurr;

      tableau.push({
        step,
        q: q.toString(),
        r: rNext,
        s: sNext,
        t: tNext,
        expr: `${rNext} = (${a} × ${sNext}) + (${b} × ${tNext})`,
      });

      rPrev = rCurr;
      rCurr = rNext;
      sPrev = sCurr;
      sCurr = sNext;
      tPrev = tCurr;
      tCurr = tNext;
      step++;
    }

    return tableau;
  }, [a, b]);

  const penultimateRow = rows.length > 2 ? rows[rows.length - 2] : undefined;
  const gcdVal = penultimateRow?.r ?? a;
  const sFinal = penultimateRow?.s ?? 1;
  const tFinal = penultimateRow?.t ?? 0;

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Bézout Extended Euclidean Tableau</span>
          <p className="text-[12px] text-muted-foreground">
            Linear combination: <code className="font-mono text-foreground font-semibold">as + bt = gcd(a, b)</code>
          </p>
        </div>
        <div className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/30">
          gcd({a}, {b}) = {gcdVal}
        </div>
      </div>

      {/* Resulting Identity */}
      <div className="mt-3.5 rounded-[12px] bg-card p-3 ring-1 ring-border shadow-2xs font-mono text-[12px]">
        <span className="text-[10px] text-muted-foreground uppercase block mb-1">Final Bézout Identity:</span>
        <p className="font-bold text-foreground">
          ({a} × <span className="text-primary">{sFinal}</span>) + ({b} × <span className="text-amber-700">{tFinal}</span>) = <span className="text-emerald-700">{gcdVal}</span>
        </p>
        {gcdVal === 1 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Since gcd is 1, modular inverse of {a} mod {b} is <code className="text-primary font-bold">{((sFinal % b) + b) % b}</code>!
          </p>
        )}
      </div>

      {/* Interactive Tableau Table */}
      <div className="mt-4 overflow-x-auto">
        <span className="label-tiny mb-2 block">Step-by-Step Quotient and Remainder Tableau:</span>
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-1.5 px-2">Step</th>
              <th className="py-1.5 px-2">Quotient (q)</th>
              <th className="py-1.5 px-2">Remainder (r)</th>
              <th className="py-1.5 px-2">Coeff s</th>
              <th className="py-1.5 px-2">Coeff t</th>
              <th className="py-1.5 px-2">Invariant Identity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, idx) => {
              const isGcdRow = idx === rows.length - 2;
              return (
                <tr
                  key={row.step}
                  className={isGcdRow ? "bg-emerald-500/10 font-bold text-emerald-950" : "hover:bg-muted/40"}
                >
                  <td className="py-1.5 px-2 text-muted-foreground">{row.step}</td>
                  <td className="py-1.5 px-2">{row.q}</td>
                  <td className="py-1.5 px-2 font-semibold text-foreground">{row.r}</td>
                  <td className="py-1.5 px-2 text-primary">{row.s}</td>
                  <td className="py-1.5 px-2 text-amber-700">{row.t}</td>
                  <td className="py-1.5 px-2 text-[10px] text-muted-foreground truncate">{row.expr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stallings Book Reference */}
      <div className="mt-3.5 rounded-[10px] bg-card/60 p-2.5 text-[11.5px] text-muted-foreground ring-1 ring-border/60">
        <strong className="text-foreground">William Stallings (Ch. 2 Theorem):</strong> For any integers $a$ and $b$, the greatest common divisor $d = \gcd(a,b)$ is the smallest positive integer that can be written in the form $as + bt$.
      </div>
    </div>
  );
}
