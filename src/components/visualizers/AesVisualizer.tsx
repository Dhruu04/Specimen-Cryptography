import { useState } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function AesVisualizer({ values, resultOutput }: Props) {
  const [activeStage, setActiveStage] = useState<"input" | "subbytes" | "shiftrows" | "mixcolumns" | "addroundkey">("subbytes");

  // Sample state matrices (hex bytes)
  const matrices = {
    input: [
      ["32", "88", "31", "e0"],
      ["43", "5a", "31", "37"],
      ["f6", "30", "98", "07"],
      ["a8", "8d", "a2", "34"],
    ],
    subbytes: [
      ["23", "c4", "c7", "e1"],
      ["1a", "be", "c7", "9a"],
      ["42", "04", "46", "c5"],
      ["c2", "5d", "3a", "18"],
    ],
    shiftrows: [
      ["23", "c4", "c7", "e1"], // shifted 0
      ["be", "c7", "9a", "1a"], // shifted 1
      ["46", "c5", "42", "04"], // shifted 2
      ["18", "c2", "5d", "3a"], // shifted 3
    ],
    mixcolumns: [
      ["ba", "84", "e8", "1b"],
      ["75", "a4", "8d", "40"],
      ["f4", "8d", "06", "7d"],
      ["2c", "27", "b8", "8e"],
    ],
    addroundkey: [
      ["d4", "27", "11", "ae"],
      ["e0", "bf", "98", "f1"],
      ["b8", "b4", "5d", "e5"],
      ["1e", "41", "52", "30"],
    ],
  };

  const stageDescriptions = {
    input: {
      title: "Initial 128-bit State Matrix",
      math: "State[r, c] = Plaintext_byte[4*c + r]",
      desc: "16 bytes organized column-first into a 4×4 matrix.",
    },
    subbytes: {
      title: "SubBytes (Non-linear S-Box Substitution)",
      math: "S(a) = M · a⁻¹ ⊕ b in GF(2⁸) / (x⁸ + x⁴ + x³ + x + 1)",
      desc: "Each byte is mapped to its multiplicative inverse in the Galois Field GF(2⁸), followed by an affine transformation over GF(2) to resist linear and differential cryptanalysis.",
    },
    shiftrows: {
      title: "ShiftRows (Permutation / Diffusion)",
      math: "Row r is cyclically rotated left by r bytes (r = 0, 1, 2, 3)",
      desc: "Row 0 shifts 0, Row 1 shifts 1, Row 2 shifts 2, Row 3 shifts 3. Ensures inter-column diffusion.",
    },
    mixcolumns: {
      title: "MixColumns (Galois Field Polynomial Multiplication)",
      math: "s'(x) = a(x) ⊗ s(x) mod (x⁴ + 1) where a(x) = {03}x³ + {01}x² + {01}x + {02}",
      desc: "Treats each column as a four-term polynomial over GF(2⁸) multiplied modulo x⁴ + 1 by a fixed MDS matrix with branch number 5.",
    },
    addroundkey: {
      title: "AddRoundKey (Key Mixing)",
      math: "State[r, c] = State[r, c] ⊕ RoundKey[r, c]",
      desc: "Bitwise XOR with the 128-bit round subkey expanded via the Rijndael key schedule.",
    },
  };

  const curMatrix = matrices[activeStage];
  const curInfo = stageDescriptions[activeStage];

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">AES-128 Rijndael State Matrix Engine</span>
          <p className="text-[12px] text-muted-foreground">
            FIPS 197 Standard · 4×4 Byte Array Transformations in <code className="font-mono text-foreground font-semibold">GF(2⁸)</code>
          </p>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {(
          [
            ["input", "1. State Input"],
            ["subbytes", "2. SubBytes"],
            ["shiftrows", "3. ShiftRows"],
            ["mixcolumns", "4. MixColumns"],
            ["addroundkey", "5. AddRoundKey"],
          ] as const
        ).map(([stg, label]) => (
          <button
            key={stg}
            type="button"
            onClick={() => setActiveStage(stg)}
            className={`rounded-[10px] px-3 py-1.5 text-[11.5px] font-medium transition ${
              activeStage === stg
                ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                : "bg-card text-muted-foreground ring-1 ring-border hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stage Explanation Card */}
      <div className="mt-4 rounded-[14px] bg-card p-3.5 ring-1 ring-border shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-display text-[13.5px] font-semibold text-foreground">{curInfo.title}</span>
          <code className="rounded bg-background px-2 py-0.5 font-mono text-[11px] text-primary ring-1 ring-border">
            {curInfo.math}
          </code>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{curInfo.desc}</p>
      </div>

      {/* 4x4 Interactive State Grid */}
      <div className="mt-4 flex flex-col items-center">
        <span className="label-tiny mb-2">4×4 Byte State (16 Bytes / 128 Bits):</span>
        <div className="grid grid-cols-4 gap-2 rounded-[16px] bg-card p-3 ring-1 ring-border shadow-xs">
          {curMatrix.map((row, rIdx) =>
            row.map((byteHex, cIdx) => {
              // Highlight based on stage
              const isHighlighted =
                activeStage === "shiftrows"
                  ? rIdx > 0
                  : activeStage === "mixcolumns"
                  ? cIdx === 0
                  : true;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`flex size-12 sm:size-14 flex-col items-center justify-center rounded-[10px] font-mono transition ${
                    isHighlighted
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                      : "bg-background text-muted-foreground ring-1 ring-border"
                  }`}
                >
                  <span className="text-[13px] sm:text-[15px] font-bold tracking-wider">{byteHex}</span>
                  <span className="text-[8.5px] text-muted-foreground">s[{rIdx},{cIdx}]</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stallings GF(2^8) Irreducible Polynomial Note */}
      <div className="mt-4 rounded-[10px] bg-card/60 p-2.5 text-[11.5px] text-muted-foreground ring-1 ring-border/60">
        <strong className="text-foreground">Stallings Finite Field Insight:</strong> All MixColumns and SubBytes byte arithmetic is performed over the Galois Field $GF(2^8)$ using the irreducible polynomial $m(x) = x^8 + x^4 + x^3 + x + 1$ (hexadecimal <code className="font-mono text-primary font-bold">0x11B</code>).
      </div>
    </div>
  );
}
