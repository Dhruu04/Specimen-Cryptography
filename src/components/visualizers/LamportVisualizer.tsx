import { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

export function LamportVisualizer() {
  const [msg1, setMsg1] = useState("PQC");
  const [msg2, setMsg2] = useState("ATTACK");
  const [showAttack, setShowAttack] = useState(false);

  // Simple pedagogical 8-bit hash
  const hashTo8Bits = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) & 0xff;
    }
    const bits: number[] = [];
    for (let i = 7; i >= 0; i--) {
      bits.push((h >>> i) & 1);
    }
    return bits;
  };

  const bits1 = hashTo8Bits(msg1);
  const bits2 = hashTo8Bits(msg2);

  // Generate 8 key pairs
  const keyPairs = Array.from({ length: 8 }).map((_, i) => ({
    sk0: `x_${i},0`,
    sk1: `x_${i},1`,
    pk0: `y_${i},0`,
    pk1: `y_${i},1`,
  }));

  // Analyze compromised key elements if second message is signed
  let compromisedCount = 0;
  for (let i = 0; i < 8; i++) {
    if (bits1[i] !== bits2[i]) {
      compromisedCount++;
    }
  }
  const forgeableCombinations = Math.pow(2, compromisedCount);

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <KeyRound className="size-4 text-primary" />
          <span>Lamport One-Time Signature (OTS) & Key Reuse Vulnerability</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAttack(!showAttack)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ring-1 ${
            showAttack
              ? "bg-destructive text-destructive-foreground ring-destructive"
              : "bg-muted/80 text-foreground ring-border/70 hover:bg-muted"
          }`}
        >
          <ShieldAlert className="size-3.5" />
          <span>{showAttack ? "Hide Re-use Attack" : "Simulate 2nd Signature Re-use Attack"}</span>
        </button>
      </div>

      {/* Message Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-card p-3 ring-1 ring-border/70 space-y-1.5">
          <div className="flex justify-between text-[11px] font-semibold text-foreground">
            <span>1st Message (Legitimate Signature)</span>
            <span className="font-mono text-primary">{bits1.join("")}</span>
          </div>
          <input
            type="text"
            value={msg1}
            onChange={(e) => setMsg1(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs font-mono"
            placeholder="Type message 1"
          />
        </div>

        {showAttack && (
          <div className="rounded-xl bg-destructive/10 p-3 ring-1 ring-destructive/30 space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-destructive">
              <span>2nd Message (Adversary Key Reuse)</span>
              <span className="font-mono">{bits2.join("")}</span>
            </div>
            <input
              type="text"
              value={msg2}
              onChange={(e) => setMsg2(e.target.value)}
              className="w-full rounded-md border border-destructive/40 bg-background px-2.5 py-1 text-xs font-mono"
              placeholder="Type message 2"
            />
          </div>
        )}
      </div>

      {/* Interactive Key Pair Grid */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-foreground">
          8-Bit Key Pairs & Revealed Preimages:
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {keyPairs.map((kp, idx) => {
            const b1 = bits1[idx] ?? 0;
            const b2 = bits2[idx] ?? 0;
            const isBothRevealed = showAttack && b1 !== b2;

            return (
              <div
                key={idx}
                className={`rounded-lg p-2 ring-1 text-center transition ${
                  isBothRevealed
                    ? "bg-destructive/15 ring-destructive/50 text-destructive"
                    : "bg-card ring-border/70 text-foreground"
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-muted-foreground mb-1">
                  Bit {idx}
                </div>

                {/* Secret Key 0 */}
                <div
                  className={`rounded px-1 py-0.5 font-mono text-[9px] mb-1 ${
                    b1 === 0 || (showAttack && b2 === 0)
                      ? isBothRevealed
                        ? "bg-destructive text-destructive-foreground font-bold"
                        : "bg-primary text-primary-foreground font-bold"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {kp.sk0}{b1 === 0 ? " [M1]" : showAttack && b2 === 0 ? " [M2]" : ""}
                </div>

                {/* Secret Key 1 */}
                <div
                  className={`rounded px-1 py-0.5 font-mono text-[9px] ${
                    b1 === 1 || (showAttack && b2 === 1)
                      ? isBothRevealed
                        ? "bg-destructive text-destructive-foreground font-bold"
                        : "bg-primary text-primary-foreground font-bold"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {kp.sk1}{b1 === 1 ? " [M1]" : showAttack && b2 === 1 ? " [M2]" : ""}
                </div>

                {isBothRevealed && (
                  <div className="mt-1 text-[8.5px] font-bold text-destructive">
                    BOTH LEAKED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attack Analysis Callout */}
      {showAttack ? (
        <div className="rounded-xl bg-destructive/10 p-3 ring-1 ring-destructive/30 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-destructive">
            <AlertTriangle className="size-4" />
            <span>Catastrophic Private Key Compromise:</span>
          </div>
          <div className="text-[11px] text-foreground leading-relaxed">
            By signing both <span className="font-mono font-bold text-destructive">"{msg1}"</span> and{" "}
            <span className="font-mono font-bold text-destructive">"{msg2}"</span>, you revealed both{" "}
            <span className="font-mono font-semibold">x_{"{i,0}"}</span> and{" "}
            <span className="font-mono font-semibold">x_{"{i,1}"}</span> on{" "}
            <span className="font-bold">{compromisedCount}</span> bit positions!
            An eavesdropper can now forge legitimate signatures for{" "}
            <span className="font-mono font-bold text-destructive">
              2^{compromisedCount} = {forgeableCombinations}
            </span>{" "}
            different message digests without ever knowing the master secret key.
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/25 flex items-start gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-foreground leading-relaxed">
            <span className="font-semibold text-emerald-800">One-Time Signature Invariant Intact: </span>
            Exactly 8 preimages are exposed (one per bit), leaving the opposite preimage completely hidden behind preimage-resistant hashes.
            To sign millions of messages without compromise, FIPS 205 (SLH-DSA / SPHINCS+) constructs a massive hyper-tree of randomized few-time signature subtrees.
          </div>
        </div>
      )}
    </div>
  );
}
