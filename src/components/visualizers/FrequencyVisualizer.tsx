import { useMemo } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function FrequencyVisualizer({ values, resultOutput }: Props) {
  const text = (values["text"] ?? "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG").toUpperCase();

  const englishFreqs: Record<string, number> = {
    E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1, R: 6.0,
    D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2, G: 2.0, Y: 2.0,
    P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.1, Z: 0.07,
  };

  const alphabet = "ETAOINSHRDLCUMWFGYPBVKJXQZ".split("");

  const { counts, total, ioc, chiSquare } = useMemo(() => {
    const rawCounts: Record<string, number> = {};
    let letterTotal = 0;
    for (const ch of text) {
      if (ch >= "A" && ch <= "Z") {
        rawCounts[ch] = (rawCounts[ch] ?? 0) + 1;
        letterTotal++;
      }
    }

    // Index of Coincidence = sum(n_i * (n_i - 1)) / (N * (N - 1))
    let sumPairs = 0;
    for (const c of Object.values(rawCounts)) {
      sumPairs += c * (c - 1);
    }
    const computedIoc =
      letterTotal > 1 ? sumPairs / (letterTotal * (letterTotal - 1)) : 0;

    // Chi-square
    let chi = 0;
    if (letterTotal > 0) {
      for (const [letter, expectedPct] of Object.entries(englishFreqs)) {
        const observed = rawCounts[letter] ?? 0;
        const expected = (expectedPct / 100) * letterTotal;
        chi += Math.pow(observed - expected, 2) / (expected || 0.001);
      }
    }

    return { counts: rawCounts, total: letterTotal, ioc: computedIoc, chiSquare: chi };
  }, [text]);

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Statistical Cryptanalysis & Frequency Spectrum</span>
          <p className="text-[12px] text-muted-foreground">
            Total letters analyzed: <code className="font-mono text-foreground font-semibold">{total}</code>
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="rounded-full bg-card px-2.5 py-1 text-primary ring-1 ring-border font-bold">
            IoC: {ioc.toFixed(4)}
          </span>
          <span className="rounded-full bg-card px-2.5 py-1 text-muted-foreground ring-1 ring-border">
            χ²: {chiSquare.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Metric Indicators */}
      <div className="mt-3.5 grid gap-2 sm:grid-cols-2 font-mono text-[11.5px]">
        <div className="rounded-[10px] bg-card p-2.5 ring-1 ring-border shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-[10.5px]">Index of Coincidence (IoC):</span>
            <span className="font-bold text-foreground">{ioc.toFixed(4)}</span>
          </div>
          <div className="mt-1 flex justify-between text-[9.5px] text-muted-foreground">
            <span>Random: ~0.0385</span>
            <span className={ioc >= 0.06 ? "text-emerald-700 font-bold" : "text-muted-foreground"}>
              English: ~0.0667
            </span>
          </div>
        </div>

        <div className="rounded-[10px] bg-card p-2.5 ring-1 ring-border shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-[10.5px]">Chi-Squared Goodness of Fit:</span>
            <span className="font-bold text-primary">{chiSquare.toFixed(1)}</span>
          </div>
          <p className="mt-1 text-[9.5px] text-muted-foreground">
            {chiSquare < 35 ? "Close match to standard English plaintext" : "Distorted distribution (Polyalphabetic or Transposition)"}
          </p>
        </div>
      </div>

      {/* Comparative Histogram */}
      <div className="mt-4">
        <span className="label-tiny mb-2 block">Observed vs Standard English Frequencies (ETAOIN SHRDLU Order):</span>
        <div className="space-y-1.5 overflow-x-auto">
          {alphabet.slice(0, 14).map((letter) => {
            const obsCount = counts[letter] ?? 0;
            const obsPct = total > 0 ? (obsCount / total) * 100 : 0;
            const expPct = englishFreqs[letter] ?? 0;

            return (
              <div key={letter} className="flex items-center gap-2 font-mono text-[10.5px]">
                <span className="w-4 font-bold text-foreground">{letter}</span>
                {/* Visual Bar pair */}
                <div className="flex-1 space-y-0.5">
                  {/* Observed Bar */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 rounded bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(100, obsPct * 6)}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{obsPct.toFixed(1)}% ({obsCount})</span>
                  </div>
                  {/* English Standard Bar */}
                  <div className="flex items-center gap-1.5 opacity-60">
                    <div
                      className="h-1.5 rounded bg-muted-foreground/50 transition-all duration-300"
                      style={{ width: `${Math.min(100, expPct * 6)}%` }}
                    />
                    <span className="text-[8.5px] text-muted-foreground">{expPct}% std</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Al-Kindi Historical Note */}
      <div className="mt-3.5 rounded-[10px] bg-card/60 p-2.5 text-[11.5px] text-muted-foreground ring-1 ring-border/60">
        <strong className="text-foreground">Fred B. Wrixon & Stallings Historical Reference:</strong> Frequency analysis was pioneered in 9th-century Baghdad by polymath <strong className="text-foreground">Al-Kindi</strong> in <em>A Manuscript on Deciphering Cryptographic Messages</em>, decisively shattering monoalphabetic substitution ciphers.
      </div>
    </div>
  );
}
