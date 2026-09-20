import { useMemo } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function AvalancheVisualizer({ values, resultOutput }: Props) {
  const text1 = values["text1"] ?? "Hello World";
  const text2 = values["text2"] ?? "Hello World!";

  // Simple deterministic 256-bit hash simulator for quick visualization
  const fakeSha256Bits = (str: string): boolean[] => {
    let h = 0x811c9dc5;
    const bits: boolean[] = [];
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    // Generate 256 pseudo-random deterministic bits
    for (let i = 0; i < 256; i++) {
      h = (h ^ (h << 13)) >>> 0;
      h = (h ^ (h >>> 17)) >>> 0;
      h = (h ^ (h << 5)) >>> 0;
      bits.push((h & (1 << (i % 32))) !== 0);
    }
    return bits;
  };

  const { bits1, bits2, diffCount, diffPct } = useMemo(() => {
    const b1 = fakeSha256Bits(text1);
    const b2 = fakeSha256Bits(text2);
    let diff = 0;
    for (let i = 0; i < 256; i++) {
      if (b1[i] !== b2[i]) diff++;
    }
    return {
      bits1: b1,
      bits2: b2,
      diffCount: diff,
      diffPct: ((diff / 256) * 100).toFixed(1),
    };
  }, [text1, text2]);

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Strict Avalanche Criterion (SAC) Matrix</span>
          <p className="text-[12px] text-muted-foreground">
            Webster & Tavares Criterion: 1-bit input flip alters ~50% of output bits
          </p>
        </div>
        <div className="rounded-full bg-amber-500/15 px-3 py-1 font-mono text-[11px] font-bold text-amber-800 ring-1 ring-amber-500/30">
          Flipped: {diffCount}/256 ({diffPct}%)
        </div>
      </div>

      {/* 16x16 Bit Grid */}
      <div className="mt-4 flex flex-col items-center">
        <span className="label-tiny mb-2">256-Bit Output State Map (Amber = Flipped Bit, Dark = Identical Bit):</span>
        <div className="grid grid-cols-16 gap-1 rounded-[14px] bg-card p-3 ring-1 ring-border shadow-xs">
          {bits1.map((b1, idx) => {
            const flipped = b1 !== bits2[idx];
            return (
              <div
                key={idx}
                title={`Bit #${idx}: ${flipped ? "FLIPPED" : "UNMODIFIED"}`}
                className={`size-3 rounded-xs transition ${
                  flipped ? "bg-amber-600 shadow-2xs" : "bg-muted-foreground/20"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Rationale and Stallings Insight */}
      <div className="mt-3.5 rounded-[10px] bg-card/60 p-2.5 text-[11.5px] text-muted-foreground ring-1 ring-border/60">
        <strong className="text-foreground">Stallings Cryptographic Hash Insight (Ch. 11):</strong> Strong cryptographic hash functions (SHA-256, SHA-3) fulfill the Strict Avalanche Criterion, ensuring that even a microscopic 1-bit tweak produces a completely uncorrelated, pseudorandom 256-bit output digest.
      </div>
    </div>
  );
}
