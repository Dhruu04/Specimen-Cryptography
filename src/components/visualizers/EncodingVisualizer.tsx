import { useMemo } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function EncodingVisualizer({ values, resultOutput }: Props) {
  const text = values["text"] ?? "Man";
  const b64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  const { bytes, bitStream, sextets } = useMemo(() => {
    const rawBytes: number[] = [];
    let bits = "";
    for (let i = 0; i < text.length; i++) {
      const b = text.charCodeAt(i) & 0xff;
      rawBytes.push(b);
      bits += b.toString(2).padStart(8, "0");
    }

    // Pad bitstream to multiple of 6
    const padLen = (6 - (bits.length % 6)) % 6;
    const paddedBits = bits + "0".repeat(padLen);

    const rawSextets: { bits: string; val: number; char: string }[] = [];
    for (let i = 0; i < paddedBits.length; i += 6) {
      const chunk = paddedBits.slice(i, i + 6);
      const val = Number.parseInt(chunk, 2);
      rawSextets.push({ bits: chunk, val, char: b64Chars[val] ?? "=" });
    }

    return { bytes: rawBytes, bitStream: bits, sextets: rawSextets };
  }, [text]);

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">RFC 4648 Bit-Regrouping & Packing</span>
          <p className="text-[12px] text-muted-foreground">
            3 Bytes (24 Bits) → 4 Sextets (4 × 6 Bits)
          </p>
        </div>
        <div className="rounded-full bg-card px-3 py-1 font-mono text-[11px] font-bold text-primary ring-1 ring-border">
          Output: {resultOutput || "—"}
        </div>
      </div>

      {/* Layer 1: 8-Bit Octets */}
      <div className="mt-4">
        <span className="label-tiny mb-1.5 block">1. Input Characters & 8-Bit Octets:</span>
        <div className="flex flex-wrap gap-2 font-mono text-[11px]">
          {bytes.map((b, idx) => (
            <div key={idx} className="rounded-[10px] bg-card p-2 ring-1 ring-border shadow-2xs">
              <span className="block font-bold text-foreground">'{text[idx]}' (0x{b.toString(16).toUpperCase()})</span>
              <span className="mt-0.5 block text-primary font-mono text-[10px]">{b.toString(2).padStart(8, "0")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer 2: 6-Bit Base64 Sextets */}
      <div className="mt-4">
        <span className="label-tiny mb-1.5 block">2. Regrouped 6-Bit Sextets & Base64 Alphabet Lookup:</span>
        <div className="flex flex-wrap gap-2 font-mono text-[11px]">
          {sextets.map((s, idx) => (
            <div key={idx} className="rounded-[10px] bg-primary/10 p-2 ring-1 ring-primary/25 shadow-2xs">
              <span className="block text-[9.5px] text-muted-foreground uppercase">Sextet #{idx + 1}</span>
              <span className="block font-mono text-[11px] font-bold text-foreground">{s.bits}</span>
              <span className="mt-1 block font-bold text-primary text-[13px]">Index {s.val} → '{s.char}'</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
