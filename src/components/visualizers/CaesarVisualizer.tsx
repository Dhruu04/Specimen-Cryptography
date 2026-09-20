import { useMemo, useState } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function CaesarVisualizer({ values, resultOutput }: Props) {
  const text = (values["text"] ?? "HELLO").toUpperCase();
  const shift = Number.parseInt(values["shift"] ?? "3", 10) || 3;
  const normalizedShift = ((shift % 26) + 26) % 26;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(0);

  const mappedChars = useMemo(() => {
    return text.split("").map((ch, idx) => {
      const code = ch.charCodeAt(0);
      const isAlpha = code >= 65 && code <= 90;
      const originalPos = isAlpha ? code - 65 : -1;
      const targetPos = isAlpha ? (originalPos + normalizedShift) % 26 : -1;
      const cipherChar = isAlpha ? String.fromCharCode(65 + targetPos) : ch;
      return { ch, isAlpha, originalPos, targetPos, cipherChar, idx };
    });
  }, [text, normalizedShift]);

  const selectedMapping =
    activeCharIndex !== null && mappedChars[activeCharIndex]
      ? mappedChars[activeCharIndex]
      : mappedChars[0];

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Visual Shift Wheel & Mapping</span>
          <p className="text-[12px] text-muted-foreground">
            Modular shift: <code className="font-mono text-foreground font-semibold">C = (P + {normalizedShift}) mod 26</code>
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-[11px] font-mono ring-1 ring-border">
          <span className="text-muted-foreground">Shift Offset:</span>
          <span className="font-bold text-primary">+{normalizedShift}</span>
        </div>
      </div>

      {/* Interactive Text Stream */}
      <div className="mt-3.5">
        <span className="label-tiny mb-1.5 block">Interactive Character Flow (click a character to inspect):</span>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">
          {mappedChars.map((item, idx) => {
            const isSelected = (activeCharIndex ?? 0) === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCharIndex(idx)}
                className={`group flex flex-col items-center justify-center rounded-[10px] px-2.5 py-1.5 font-mono text-[13px] transition ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "bg-card text-foreground ring-1 ring-border hover:bg-muted"
                }`}
              >
                <span className="font-bold text-[14px]">{item.ch}</span>
                <span className="text-[10px] opacity-70">↓</span>
                <span className={`font-bold text-[13px] ${isSelected ? "text-primary-foreground" : "text-primary"}`}>
                  {item.cipherChar}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Letter Calculation Breakdown */}
      {selectedMapping && selectedMapping.isAlpha && (
        <div className="mt-4 rounded-[14px] bg-card p-3.5 ring-1 ring-border shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11.5px] font-medium text-foreground">
              Mathematical Step for Character #{selectedMapping.idx + 1} ('{selectedMapping.ch}')
            </span>
            <span className="font-mono text-[11px] text-primary">
              '{selectedMapping.ch}' ({selectedMapping.originalPos}) → '{selectedMapping.cipherChar}' ({selectedMapping.targetPos})
            </span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 font-mono text-[12px]">
            <div className="rounded-[10px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[10px] text-muted-foreground uppercase">1. Alphabet Index</span>
              <span className="font-semibold text-foreground">'{selectedMapping.ch}' = {selectedMapping.originalPos}</span>
            </div>
            <div className="rounded-[10px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[10px] text-muted-foreground uppercase">2. Add Key Modulo 26</span>
              <span className="font-semibold text-foreground">({selectedMapping.originalPos} + {normalizedShift}) % 26 = {selectedMapping.targetPos}</span>
            </div>
            <div className="rounded-[10px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[10px] text-muted-foreground uppercase">3. Cipher Character</span>
              <span className="font-semibold text-primary font-bold">Index {selectedMapping.targetPos} = '{selectedMapping.cipherChar}'</span>
            </div>
          </div>
        </div>
      )}

      {/* Dual Alphabet Alignment Ribbon */}
      <div className="mt-4">
        <span className="label-tiny mb-1.5 block">Dual Alphabet Alignment Ribbon (Plain vs Cipher):</span>
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-[560px] flex-col gap-1 rounded-[12px] bg-card p-2.5 ring-1 ring-border font-mono text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-12 shrink-0 font-medium text-muted-foreground">PLAIN:</span>
              <div className="flex flex-1 justify-between gap-0.5">
                {alphabet.map((letter, i) => {
                  const isCur = selectedMapping?.originalPos === i;
                  return (
                    <span
                      key={letter}
                      className={`grid size-5 place-items-center rounded ${
                        isCur ? "bg-primary font-bold text-primary-foreground" : "text-foreground/80 hover:bg-muted"
                      }`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-12 shrink-0 font-medium text-primary font-semibold">SHIFT:</span>
              <div className="flex flex-1 justify-between gap-0.5">
                {alphabet.map((_, i) => {
                  const shiftedLetter = alphabet[(i + normalizedShift) % 26];
                  const isCur = selectedMapping?.targetPos === (i + normalizedShift) % 26 && selectedMapping?.originalPos === i;
                  return (
                    <span
                      key={i}
                      className={`grid size-5 place-items-center rounded ${
                        isCur ? "bg-amber-600 font-bold text-white" : "text-primary hover:bg-muted"
                      }`}
                    >
                      {shiftedLetter}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
