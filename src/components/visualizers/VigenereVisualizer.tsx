import { useMemo, useState } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function VigenereVisualizer({ values, resultOutput }: Props) {
  const text = (values["text"] ?? "CRYPTO").toUpperCase().replace(/[^A-Z]/g, "");
  const key = (values["key"] ?? "KEY").toUpperCase().replace(/[^A-Z]/g, "") || "A";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [showFullMatrix, setShowFullMatrix] = useState<boolean>(false);

  // Repeat key to match text length
  const pairs = useMemo(() => {
    return text.split("").map((pChar, i) => {
      const kChar = key[i % key.length] ?? "A";
      const pVal = pChar.charCodeAt(0) - 65;
      const kVal = kChar.charCodeAt(0) - 65;
      const cVal = (pVal + kVal) % 26;
      const cChar = String.fromCharCode(65 + cVal);
      return { idx: i, pChar, kChar, pVal, kVal, cVal, cChar };
    });
  }, [text, key]);

  const activePair = pairs[activeIdx] ?? pairs[0];

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Interactive Tabula Recta & Polyalphabetic Lattice</span>
          <p className="text-[12px] text-muted-foreground">
            Intersection rule: <code className="font-mono text-foreground font-semibold">C = (Plaintext + Key) mod 26</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFullMatrix(!showFullMatrix)}
          className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-foreground ring-1 ring-border hover:bg-muted"
        >
          {showFullMatrix ? "Hide Full 26×26 Grid" : "Show Full 26×26 Tabula Recta"}
        </button>
      </div>

      {/* Stream Pairs */}
      <div className="mt-3.5">
        <span className="label-tiny mb-1.5 block">Keystream Alignment (click a column to inspect):</span>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">
          {pairs.map((pair, idx) => {
            const isSel = idx === (activeIdx ?? 0);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`flex flex-col items-center justify-center rounded-[10px] px-2.5 py-1.5 font-mono text-[12px] transition ${
                  isSel
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "bg-card text-foreground ring-1 ring-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase opacity-70">P:</span>
                  <span className="font-bold">{pair.pChar}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] opacity-80">
                  <span className="text-[9px] uppercase">K:</span>
                  <span>{pair.kChar}</span>
                </div>
                <span className="text-[9px] opacity-60">↓</span>
                <div className="flex items-center gap-1 font-bold">
                  <span className="text-[9px] uppercase opacity-70">C:</span>
                  <span className={isSel ? "text-primary-foreground" : "text-primary"}>{pair.cChar}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Intersection Explainer */}
      {activePair && (
        <div className="mt-4 rounded-[14px] bg-card p-3.5 ring-1 ring-border shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[12px] font-semibold text-foreground">
              Coordinate Lookup for Position #{activePair.idx + 1}
            </span>
            <span className="font-mono text-[11px] text-primary">
              Row '{activePair.kChar}' ∩ Col '{activePair.pChar}' → Cell '{activePair.cChar}'
            </span>
          </div>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-3 font-mono text-[12px]">
            <div className="rounded-[10px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[10px] text-muted-foreground uppercase">Row (Key Letter)</span>
              <span className="font-semibold text-foreground">Row '{activePair.kChar}' (offset {activePair.kVal})</span>
            </div>
            <div className="rounded-[10px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[10px] text-muted-foreground uppercase">Column (Plain Letter)</span>
              <span className="font-semibold text-foreground">Col '{activePair.pChar}' (offset {activePair.pVal})</span>
            </div>
            <div className="rounded-[10px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[10px] text-muted-foreground uppercase">Sum mod 26</span>
              <span className="font-bold text-primary">({activePair.pVal} + {activePair.kVal}) % 26 = {activePair.cVal} ('{activePair.cChar}')</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabula Recta Grid */}
      {showFullMatrix && (
        <div className="mt-4 overflow-x-auto rounded-[14px] bg-card p-3 ring-1 ring-border">
          <span className="label-tiny mb-2 block">Trithemius / Vigenère Tabula Recta (26 × 26):</span>
          <div className="inline-block min-w-[580px] font-mono text-[10px]">
            {/* Header row (Columns = Plaintext) */}
            <div className="flex border-b border-border pb-1">
              <span className="w-6 shrink-0 text-center font-bold text-muted-foreground">K\P</span>
              {alphabet.map((colL, cIdx) => (
                <span
                  key={cIdx}
                  className={`w-5 shrink-0 text-center font-bold ${
                    activePair && activePair.pVal === cIdx ? "bg-primary text-primary-foreground rounded-xs" : "text-muted-foreground"
                  }`}
                >
                  {colL}
                </span>
              ))}
            </div>

            {/* Rows (Rows = Key) */}
            {alphabet.map((rowL, rIdx) => {
              const isSelectedRow = activePair && activePair.kVal === rIdx;
              return (
                <div
                  key={rIdx}
                  className={`flex items-center py-0.5 ${
                    isSelectedRow ? "bg-primary/10 rounded-xs" : ""
                  }`}
                >
                  <span
                    className={`w-6 shrink-0 text-center font-bold ${
                      isSelectedRow ? "text-primary font-black" : "text-muted-foreground"
                    }`}
                  >
                    {rowL}
                  </span>
                  {alphabet.map((_, cIdx) => {
                    const cellLetter = alphabet[(rIdx + cIdx) % 26];
                    const isIntersection =
                      activePair && activePair.kVal === rIdx && activePair.pVal === cIdx;
                    return (
                      <span
                        key={cIdx}
                        className={`w-5 shrink-0 text-center ${
                          isIntersection
                            ? "bg-amber-600 text-white font-black rounded-xs shadow-xs scale-110"
                            : isSelectedRow && activePair && activePair.pVal === cIdx
                            ? "bg-primary/20 text-foreground"
                            : isSelectedRow
                            ? "text-primary font-medium"
                            : activePair && activePair.pVal === cIdx
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground/70"
                        }`}
                      >
                        {cellLetter}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
