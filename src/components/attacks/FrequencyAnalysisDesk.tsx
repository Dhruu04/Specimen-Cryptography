import { useMemo, useState } from "react";
import { BarChart3, RotateCcw, Sparkles } from "lucide-react";

const ENGLISH_FREQ: Record<string, number> = {
  E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3,
  L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5,
  V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.10, Z: 0.07,
};

const DEFAULT_CIPHERTEXT =
  "GWC NBY QILFX QUM GIXCFH QCNB NBY VILFX XCUF GUCNB QCNB NBY HYHNQILM.";

export function FrequencyAnalysisDesk() {
  const [ciphertext, setCiphertext] = useState(DEFAULT_CIPHERTEXT);
  const [substitutions, setSubstitutions] = useState<Record<string, string>>({});

  // Compute letter frequencies in ciphertext
  const { counts, totalLetters, sortedFreqs, ic } = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    const clean = ciphertext.toUpperCase();

    for (const char of clean) {
      if (char >= "A" && char <= "Z") {
        counts[char] = (counts[char] || 0) + 1;
        total++;
      }
    }

    // Index of coincidence: sum(fi * (fi - 1)) / (N * (N - 1))
    let sumProd = 0;
    for (const char in counts) {
      const f = counts[char] ?? 0;
      sumProd += f * (f - 1);
    }
    const icVal = total > 1 ? sumProd / (total * (total - 1)) : 0;

    const sortedFreqs = Object.entries(counts)
      .map(([char, count]) => ({
        char,
        count,
        pct: (count / (total || 1)) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return { counts, totalLetters: total, sortedFreqs, ic: icVal };
  }, [ciphertext]);

  const updateSub = (cipherChar: string, plainChar: string) => {
    setSubstitutions((prev) => {
      const next = { ...prev };
      if (!plainChar) {
        delete next[cipherChar];
      } else {
        next[cipherChar] = plainChar.toLowerCase();
      }
      return next;
    });
  };

  const resetSubs = () => setSubstitutions({});

  // Render decrypted view
  const renderedDecryption = useMemo(() => {
    return ciphertext.split("").map((c, i) => {
      const upper = c.toUpperCase();
      if (upper >= "A" && upper <= "Z") {
        const sub = substitutions[upper];
        if (sub) {
          return (
            <span key={i} className="font-bold text-primary bg-primary/15 px-0.5 rounded">
              {sub}
            </span>
          );
        }
        return (
          <span key={i} className="text-muted-foreground opacity-60">
            {c}
          </span>
        );
      }
      return <span key={i}>{c}</span>;
    });
  }, [ciphertext, substitutions]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-semibold text-primary px-2 py-0.5 rounded-md bg-muted border border-border">
              CLASSICAL CRYPTANALYSIS
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Frequency Distribution & IC
            </span>
          </div>
          <h3 className="font-sans text-[17px] font-bold text-foreground">
            Interactive Frequency Analysis & Substitution Workbench
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Break monoalphabetic substitution ciphers by exploiting the natural letter frequency signatures of natural language.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetSubs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-[12px] font-mono text-muted-foreground hover:text-foreground active:scale-95 transition"
          >
            <RotateCcw className="size-3" />
            <span>Reset Map</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ciphertext & Live Decryption */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-mono text-[11px] uppercase font-semibold text-muted-foreground">
                Intercepted Ciphertext
              </label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {totalLetters} Letters Analyzed
              </span>
            </div>
            <textarea
              rows={3}
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
              className="w-full rounded-xl bg-background p-3 font-mono text-[13px] border border-border outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          {/* Live Substitution Preview */}
          <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase font-semibold text-foreground">
                Live Plaintext Recovery
              </span>
              <span className="font-mono text-[10.5px] text-primary">
                {Object.keys(substitutions).length} / 26 mapped
              </span>
            </div>
            <div className="font-mono text-[14px] leading-relaxed p-3 rounded-lg bg-background border border-border break-words">
              {renderedDecryption}
            </div>
          </div>

          {/* Index of Coincidence Metric */}
          <div className="rounded-xl border border-border p-3.5 bg-card flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                Index of Coincidence (IC)
              </span>
              <span className="font-mono text-[16px] font-bold text-foreground">
                {ic.toFixed(4)}
              </span>
            </div>
            <div className="text-right text-[11px] font-mono text-muted-foreground">
              <p>English Monoalphabetic ≈ 0.0667</p>
              <p>Polyalphabetic / Random ≈ 0.0385</p>
            </div>
          </div>
        </div>

        {/* Right Column: Frequency Chart & Letter Substitution Matrix */}
        <div className="lg:col-span-6 space-y-4">
          <span className="font-mono text-[11px] uppercase font-semibold text-muted-foreground block">
            Most Frequent Cipher Letters vs Standard English
          </span>

          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
            {sortedFreqs.slice(0, 8).map(({ char, count, pct }) => (
              <div key={char} className="flex items-center gap-3 rounded-xl bg-muted/30 p-2 border border-border">
                <div className="grid size-8 place-items-center rounded-lg bg-foreground text-background font-mono font-bold text-[13px]">
                  {char}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span>Count: {count} ({pct.toFixed(1)}%)</span>
                    <span className="text-muted-foreground">Typical: E(12.7%), T(9.1%), A(8.2%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, pct * 4)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground">→</span>
                  <input
                    type="text"
                    maxLength={1}
                    value={substitutions[char] || ""}
                    onChange={(e) => updateSub(char, e.target.value)}
                    placeholder="?"
                    className="size-8 text-center rounded-lg bg-background border border-border font-mono font-bold text-[13px] uppercase outline-none focus:border-primary text-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-muted-foreground leading-relaxed">
            <strong>Cryptanalyst Tip:</strong> In standard English, the top frequency letters are <strong>E, T, A, O, I, N, S, H, R</strong>. Single-letter words are usually <em>A</em> or <em>I</em>. Common two-letter words are <em>OF, TO, IN, IS, IT</em>.
          </p>
        </div>
      </div>
    </div>
  );
}
