import { useState } from "react";

type Props = {
  values: Record<string, string>;
  resultOutput: string;
};

export function DiffieHellmanVisualizer({ values, resultOutput }: Props) {
  const p = Number.parseInt(values["p"] ?? "23", 10) || 23;
  const g = Number.parseInt(values["g"] ?? "5", 10) || 5;
  const a = Number.parseInt(values["a"] ?? "6", 10) || 6;
  const b = Number.parseInt(values["b"] ?? "15", 10) || 15;

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

  const A = modPow(g, a, p); // Alice public
  const B = modPow(g, b, p); // Bob public
  const sA = modPow(B, a, p); // Alice secret
  const sB = modPow(A, b, p); // Bob secret

  return (
    <div className="rounded-[18px] bg-background/80 p-4 ring-1 ring-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <span className="text-[10.5px] uppercase tracking-wider text-primary font-medium">Diffie-Hellman Key Agreement Visualizer</span>
          <p className="text-[12px] text-muted-foreground">
            Public Base: <code className="font-mono text-foreground font-semibold">g = {g}</code> · Modulus: <code className="font-mono text-foreground font-semibold">p = {p}</code>
          </p>
        </div>
        <div className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/30">
          Shared Secret: S = {sA}
        </div>
      </div>

      {/* 3-Column Protocol Board (Alice, Public Wire / Eve, Bob) */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3 font-mono text-[11px]">
        {/* Alice Column */}
        <div className="rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="font-bold text-primary text-[12px]">Alice</span>
            <span className="text-[9.5px] text-muted-foreground">Endpoint A</span>
          </div>
          <div className="mt-2.5 space-y-2">
            <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[9.5px] text-muted-foreground uppercase">1. Private Secret Exponent</span>
              <span className="font-bold text-foreground">a = {a}</span>
            </div>
            <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[9.5px] text-muted-foreground uppercase">2. Calculate Public Key</span>
              <span className="font-semibold text-foreground">A = {g}^{a} mod {p} = <strong className="text-primary">{A}</strong></span>
            </div>
            <div className="rounded-[8px] bg-emerald-500/10 p-2 ring-1 ring-emerald-500/25">
              <span className="block text-[9.5px] text-emerald-800 uppercase">3. Derive Shared Secret</span>
              <span className="font-bold text-emerald-900">S = B^{a} mod {p} = {B}^{a} mod {p} = {sA}</span>
            </div>
          </div>
        </div>

        {/* Public Insecure Wire / Eve Column */}
        <div className="rounded-[14px] bg-amber-500/5 p-3 ring-1 ring-amber-500/25">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
            <span className="font-bold text-amber-800 text-[12px]">Insecure Wire (Eve)</span>
            <span className="text-[9.5px] text-amber-700">Interceptable</span>
          </div>
          <div className="mt-2.5 space-y-2">
            <div className="rounded-[8px] bg-card/80 p-2 ring-1 ring-border">
              <span className="block text-[9.5px] text-muted-foreground uppercase">Public Transmission A → B</span>
              <span className="font-bold text-primary">A = {A}</span>
            </div>
            <div className="rounded-[8px] bg-card/80 p-2 ring-1 ring-border">
              <span className="block text-[9.5px] text-muted-foreground uppercase">Public Transmission B → A</span>
              <span className="font-bold text-primary">B = {B}</span>
            </div>
            <div className="rounded-[8px] bg-card/80 p-2 ring-1 ring-border text-[10.5px] leading-relaxed text-muted-foreground">
              Eve sees <code className="text-foreground">p={p}, g={g}, A={A}, B={B}</code>, but cannot compute <code className="text-emerald-700 font-bold">S={sA}</code> without solving <strong className="text-foreground">Discrete Logarithm</strong>!
            </div>
          </div>
        </div>

        {/* Bob Column */}
        <div className="rounded-[14px] bg-card p-3 ring-1 ring-border shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <span className="font-bold text-primary text-[12px]">Bob</span>
            <span className="text-[9.5px] text-muted-foreground">Endpoint B</span>
          </div>
          <div className="mt-2.5 space-y-2">
            <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[9.5px] text-muted-foreground uppercase">1. Private Secret Exponent</span>
              <span className="font-bold text-foreground">b = {b}</span>
            </div>
            <div className="rounded-[8px] bg-background p-2 ring-1 ring-border">
              <span className="block text-[9.5px] text-muted-foreground uppercase">2. Calculate Public Key</span>
              <span className="font-semibold text-foreground">B = {g}^{b} mod {p} = <strong className="text-primary">{B}</strong></span>
            </div>
            <div className="rounded-[8px] bg-emerald-500/10 p-2 ring-1 ring-emerald-500/25">
              <span className="block text-[9.5px] text-emerald-800 uppercase">3. Derive Shared Secret</span>
              <span className="font-bold text-emerald-900">S = A^{b} mod {p} = {A}^{b} mod {p} = {sB}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discrete Log Security Insight */}
      <div className="mt-3.5 rounded-[10px] bg-card/60 p-2.5 text-[11.5px] text-muted-foreground ring-1 ring-border/60">
        <strong className="text-foreground">Computational Diffie-Hellman (CDH) Assumption (Stallings Ch. 10):</strong> Given g^a mod p and g^b mod p, computing g^(ab) mod p is believed to be computationally equivalent to computing discrete logarithms a or b.
      </div>
    </div>
  );
}
