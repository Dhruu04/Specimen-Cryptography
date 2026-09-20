import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function ZkpVisualizer({ values, resultOutput }: Props) {
  const secretX = Number.parseInt(values["secretX"] ?? "5", 10) || 5;
  const challengeE = Number.parseInt(values["challengeE"] ?? "4", 10) || 4;
  const p = 23;
  const g = 5;

  const modPow = (base: number, exp: number, mod: number) => {
    let res = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) res = (res * base) % mod;
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return res;
  };

  const y = modPow(g, secretX, p); // Public key
  const r = 7; // Nonce commitment
  const t = modPow(g, r, p); // Commitment value
  const s = (r + challengeE * secretX) % (p - 1); // Schnorr response

  const lhs = modPow(g, s, p);
  const rhs = (t * modPow(y, challengeE, p)) % p;
  const verified = lhs === rhs;

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Claus-Peter Schnorr Zero-Knowledge Proof (ZKP)</span>
          <p className="text-[12px] text-muted-foreground">
            3-Move Identification Protocol (Commitment → Challenge → Response)
          </p>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold ring-1 ${
          verified ? "bg-emerald-500/15 text-emerald-800 ring-emerald-500/30" : "bg-destructive/15 text-destructive ring-destructive/30"
        }`}>
          {verified ? (
            <>
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Proof Verified Valid</span>
            </>
          ) : (
            <>
              <XCircle className="size-3.5 text-destructive" />
              <span>Verification Failed</span>
            </>
          )}
        </div>
      </div>

      {/* Protocol Exchange Steps */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3 font-mono text-[11px]">
        {/* Step 1: Commitment */}
        <div className="rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <span className="text-[10px] text-primary font-bold uppercase block mb-1">1. Prover Commitment</span>
          <p className="text-muted-foreground text-[10.5px] mb-2">Prover chooses secret nonce r = {r}</p>
          <div className="rounded bg-background p-2 ring-1 ring-border">
            <span className="block text-[9.5px] text-muted-foreground uppercase">Commitment t:</span>
            <span className="font-bold text-foreground">t = g^r mod p = {g}^{r} mod {p} = <strong className="text-primary">{t}</strong></span>
          </div>
          <div className="mt-2 text-center text-primary text-[11px]">t sent to Verifier →</div>
        </div>

        {/* Step 2: Challenge */}
        <div className="rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <span className="text-[10px] text-amber-700 font-bold uppercase block mb-1">2. Verifier Challenge</span>
          <p className="text-muted-foreground text-[10.5px] mb-2">Verifier sends random scalar challenge</p>
          <div className="rounded bg-background p-2 ring-1 ring-border">
            <span className="block text-[9.5px] text-muted-foreground uppercase">Random Challenge e:</span>
            <span className="font-bold text-amber-800">e = {challengeE}</span>
          </div>
          <div className="mt-2 text-center text-amber-700 text-[11px]">← e sent to Prover</div>
        </div>

        {/* Step 3: Response & Verification */}
        <div className="rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block mb-1">3. Response & Verification</span>
          <p className="text-muted-foreground text-[10.5px] mb-2">Prover calculates response s</p>
          <div className="rounded bg-background p-2 ring-1 ring-border">
            <span className="block text-[9.5px] text-muted-foreground uppercase">Response s:</span>
            <span className="font-bold text-foreground">s = (r + e·x) mod (p-1) = {s}</span>
          </div>
          <div className="mt-2 text-center text-emerald-700 text-[11px]">s sent to Verifier →</div>
        </div>
      </div>

      {/* Verification Formula Check */}
      <div className="mt-4 rounded-[14px] bg-card p-3.5 ring-1 ring-border shadow-2xs font-mono text-[11.5px]">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="font-bold text-foreground text-[12px]">Verification Identity Check</span>
          <code className="text-primary font-bold">g^s ≡ t · y^e (mod p)</code>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 text-[11px]">
          <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
            <span className="block text-[9.5px] text-muted-foreground uppercase">Left Hand Side:</span>
            <span>g^s mod p = {g}^{s} mod {p} = <strong className="text-emerald-700 font-bold">{lhs}</strong></span>
          </div>
          <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
            <span className="block text-[9.5px] text-muted-foreground uppercase">Right Hand Side:</span>
            <span>t · y^e mod p = {t} · {y}^{challengeE} mod {p} = <strong className="text-emerald-700 font-bold">{rhs}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
