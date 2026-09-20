import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Wrench,
  Play,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowDown,
  ArrowUp,
  Download,
  Upload,
  Eye,
  Activity,
  Layers,
  Sparkles,
  ClipboardPlus,
  FileCode,
  Terminal,
  HelpCircle,
  Sliders,
  Share2,
} from "lucide-react";
import { addScratchpadItem } from "@/components/UniversalScratchpad";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Crypto Pipeline Studio & Multi-Stage Recipe Workbench — Specimen" },
      {
        name: "description",
        content:
          "CyberChef-inspired cryptanalysis recipe builder: chain multi-stage decoding, ciphers, and XOR transforms with real-time intermediate inspection.",
      },
    ],
  }),
  component: PipelineStudioComponent,
});

export type OpType =
  | "hex-decode"
  | "hex-encode"
  | "base64-decode"
  | "base64-encode"
  | "url-decode"
  | "url-encode"
  | "caesar"
  | "rot13"
  | "atbash"
  | "reverse"
  | "xor-text"
  | "xor-hex"
  | "strip-spaces"
  | "uppercase"
  | "lowercase"
  | "entropy"
  | "frequency";

export interface PipelineStep {
  id: string;
  op: OpType;
  param?: string | number | undefined;
  enabled: boolean;
}

const OP_METADATA: Record<
  OpType,
  { name: string; category: "Encodings" | "Classical" | "Logic" | "Transforms" | "Analysis"; desc: string }
> = {
  "hex-decode": { name: "Hex Decode", category: "Encodings", desc: "Converts hexadecimal bytes into UTF-8 text." },
  "hex-encode": { name: "Hex Encode", category: "Encodings", desc: "Converts text into lowercase hex byte stream." },
  "base64-decode": { name: "Base64 Decode", category: "Encodings", desc: "Decodes RFC 4648 Base64 strings." },
  "base64-encode": { name: "Base64 Encode", category: "Encodings", desc: "Encodes binary/text into Base64 format." },
  "url-decode": { name: "URL Decode", category: "Encodings", desc: "Replaces %XX escape sequences with ASCII characters." },
  "url-encode": { name: "URL Encode", category: "Encodings", desc: "Percent-encodes URI reserved characters." },
  "caesar": { name: "Caesar Shift", category: "Classical", desc: "Shifts alphabetical letters by a key (+1 to +25)." },
  "rot13": { name: "ROT13", category: "Classical", desc: "Involution 13-character rotation." },
  "atbash": { name: "Atbash Cipher", category: "Classical", desc: "Reverses the alphabet mapping (A↔Z, B↔Y)." },
  "reverse": { name: "Reverse String", category: "Transforms", desc: "Reverses character stream ordering." },
  "xor-text": { name: "XOR (Text Key)", category: "Logic", desc: "Byte-wise XOR with a repeating ASCII passphrase." },
  "xor-hex": { name: "XOR (Hex Key)", category: "Logic", desc: "Byte-wise XOR with repeating hexadecimal byte mask." },
  "strip-spaces": { name: "Strip Whitespace", category: "Transforms", desc: "Removes all spaces, tabs, and newlines." },
  "uppercase": { name: "Uppercase", category: "Transforms", desc: "Converts all letters to UPPERCASE." },
  "lowercase": { name: "Lowercase", category: "Transforms", desc: "Converts all letters to lowercase." },
  "entropy": { name: "Shannon Entropy", category: "Analysis", desc: "Evaluates information entropy in bits per symbol." },
  "frequency": { name: "Frequency Table", category: "Analysis", desc: "Generates letter count and frequency distribution." },
};

const PRESET_RECIPES: { name: string; desc: string; sample: string; steps: { op: OpType; param?: any }[] }[] = [
  {
    name: "CTF Multi-Stage Unpacker",
    desc: "Strips spaces, hex-decodes, XORs with mask 0x5A, and Base64 decodes.",
    sample: "59 34 39 37 59 32 39 74 5a 57 31 70 62 6e 6c 5f 5a 6d 78 68 5a 77 3d 3d", // hex of Base64
    steps: [
      { op: "strip-spaces" },
      { op: "hex-decode" },
      { op: "base64-decode" },
    ],
  },
  {
    name: "Two-Time Pad / Cyclic XOR Drag",
    desc: "Decodes raw hex stream and XORs against candidate repeating key.",
    sample: "16131514050a11020419",
    steps: [
      { op: "strip-spaces" },
      { op: "hex-decode" },
      { op: "xor-text", param: "KEY" },
    ],
  },
  {
    name: "Caesar Frequency Buster",
    desc: "Applies Caesar shift -3, strips punctuation, and analyzes frequency profile.",
    sample: "WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ",
    steps: [
      { op: "caesar", param: 3 },
      { op: "uppercase" },
      { op: "frequency" },
    ],
  },
  {
    name: "JWT Token Extractor",
    desc: "Decodes standard JWT claims and inspects JSON format.",
    sample: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwicm9sZSI6ImFkbWluIn0.signature",
    steps: [
      { op: "url-decode" },
    ],
  },
];

// Calculation Helpers
function calcShannonEntropy(str: string): number {
  if (!str) return 0;
  const len = str.length;
  const freq: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const c = str[i] ?? "";
    if (c) freq[c] = (freq[c] || 0) + 1;
  }
  let h = 0;
  for (const c in freq) {
    const count = freq[c] ?? 0;
    const p = count / len;
    h -= p * Math.log2(p);
  }
  return parseFloat(h.toFixed(3));
}

function calcIndexOfCoincidence(str: string): number {
  const clean = str.toUpperCase().replace(/[^A-Z]/g, "");
  const N = clean.length;
  if (N <= 1) return 0;
  const counts: Record<string, number> = {};
  for (let i = 0; i < N; i++) {
    const c = clean[i] ?? "";
    if (c) counts[c] = (counts[c] || 0) + 1;
  }
  let sum = 0;
  for (const letter in counts) {
    const f = counts[letter] ?? 0;
    sum += f * (f - 1);
  }
  return parseFloat((sum / (N * (N - 1))).toFixed(4));
}

function executeStep(input: string, step: PipelineStep): { output: string; error?: string } {
  try {
    switch (step.op) {
      case "hex-decode": {
        const clean = input.replace(/\s+|0x/g, "");
        if (clean.length % 2 !== 0) return { output: input, error: "Odd number of hex nibbles" };
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < clean.length; i += 2) {
          bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
        }
        return { output: new TextDecoder().decode(bytes) };
      }
      case "hex-encode": {
        const bytes = new TextEncoder().encode(input);
        return {
          output: Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" "),
        };
      }
      case "base64-decode": {
        const clean = input.trim().replace(/-/g, "+").replace(/_/g, "/");
        return { output: atob(clean) };
      }
      case "base64-encode": {
        return { output: btoa(input) };
      }
      case "url-decode": {
        return { output: decodeURIComponent(input) };
      }
      case "url-encode": {
        return { output: encodeURIComponent(input) };
      }
      case "caesar": {
        const shift = Number(step.param ?? 3) % 26;
        const out = input.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= "Z" ? 65 : 97;
          const k = ((c.charCodeAt(0) - base - shift) % 26 + 26) % 26;
          return String.fromCharCode(k + base);
        });
        return { output: out };
      }
      case "rot13": {
        const out = input.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= "Z" ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
        return { output: out };
      }
      case "atbash": {
        const out = input.replace(/[a-zA-Z]/g, (c) => {
          const isUpper = c <= "Z";
          const code = c.charCodeAt(0);
          return String.fromCharCode(isUpper ? 65 + (90 - code) : 97 + (122 - code));
        });
        return { output: out };
      }
      case "reverse": {
        return { output: input.split("").reverse().join("") };
      }
      case "xor-text": {
        const key = String(step.param || "K");
        if (!key) return { output: input };
        const inBytes = new TextEncoder().encode(input);
        const keyBytes = new TextEncoder().encode(key);
        const outBytes = inBytes.map((b, i) => b ^ (keyBytes[i % keyBytes.length] ?? 0));
        return { output: new TextDecoder().decode(outBytes) };
      }
      case "xor-hex": {
        const keyHex = String(step.param || "00").replace(/\s+|0x/g, "");
        if (!keyHex) return { output: input };
        const keyBytes = new Uint8Array(keyHex.length / 2);
        for (let i = 0; i < keyHex.length; i += 2) {
          keyBytes[i / 2] = parseInt(keyHex.substring(i, i + 2), 16) || 0;
        }
        const inBytes = new TextEncoder().encode(input);
        const outBytes = inBytes.map((b, i) => b ^ (keyBytes[i % keyBytes.length] ?? 0));
        return { output: new TextDecoder().decode(outBytes) };
      }
      case "strip-spaces": {
        return { output: input.replace(/\s+/g, "") };
      }
      case "uppercase": {
        return { output: input.toUpperCase() };
      }
      case "lowercase": {
        return { output: input.toLowerCase() };
      }
      case "entropy": {
        const h = calcShannonEntropy(input);
        const ic = calcIndexOfCoincidence(input);
        return {
          output: `[Shannon Entropy: ${h} bits/char | Index of Coincidence: ${ic}]\n\n` + input,
        };
      }
      case "frequency": {
        const clean = input.toUpperCase().replace(/[^A-Z]/g, "");
        const freq: Record<string, number> = {};
        for (let i = 0; i < clean.length; i++) {
          const c = clean[i] ?? "";
          if (c) freq[c] = (freq[c] || 0) + 1;
        }
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const summary = sorted.map(([k, v]) => `${k}:${v} (${((v / (clean.length || 1)) * 100).toFixed(1)}%)`).join("  ");
        return { output: `[Frequencies: ${summary}]\n\n` + input };
      }
    }
  } catch (err: any) {
    return { output: input, error: err.message };
  }
}

function PipelineStudioComponent() {
  const [inputText, setInputText] = useState(
    "59 34 39 37 59 32 39 74 5a 57 31 70 62 6e 6c 5f 5a 6d 78 68 5a 77 3d 3d"
  );
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: "s1", op: "strip-spaces", enabled: true },
    { id: "s2", op: "hex-decode", enabled: true },
    { id: "s3", op: "base64-decode", enabled: true },
  ]);

  const [copied, setCopied] = useState(false);
  const [scratchpadSaved, setScratchpadSaved] = useState(false);

  // Execute pipeline step-by-step and keep track of intermediate results
  const stepResults = useMemo(() => {
    let current = inputText;
    return steps.map((step) => {
      if (!step.enabled) {
        return { stepId: step.id, output: current, entropy: calcShannonEntropy(current), error: undefined };
      }
      const res = executeStep(current, step);
      current = res.output;
      return {
        stepId: step.id,
        output: current,
        entropy: calcShannonEntropy(current),
        error: res.error,
      };
    });
  }, [inputText, steps]);

  const finalOutput = useMemo(() => {
    if (stepResults.length === 0) return inputText;
    return stepResults[stepResults.length - 1]?.output ?? inputText;
  }, [stepResults, inputText]);

  const addOperation = (op: OpType) => {
    const newStep: PipelineStep = {
      id: "step_" + Date.now() + Math.random(),
      op,
      enabled: true,
      param: op === "caesar" ? 3 : op === "xor-text" ? "KEY" : op === "xor-hex" ? "5A" : undefined,
    };
    setSteps((prev) => [...prev, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleStep = (id: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    )
      return;
    const target = direction === "up" ? index - 1 : index + 1;
    setSteps((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      const targetStep = copy[target];
      if (temp && targetStep) {
        copy[index] = targetStep;
        copy[target] = temp;
      }
      return copy;
    });
  };

  const updateParam = (id: string, val: any) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, param: val } : s)));
  };

  const handleCopyFinal = () => {
    navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToScratchpad = () => {
    addScratchpadItem(`Pipeline Output (${steps.map((s) => s.op).join(" → ")})`, finalOutput);
    setScratchpadSaved(true);
    setTimeout(() => setScratchpadSaved(false), 2000);
  };

  const loadPreset = (preset: (typeof PRESET_RECIPES)[0]) => {
    setInputText(preset.sample);
    setSteps(
      preset.steps.map((s, idx) => ({
        id: "preset_" + idx + "_" + Date.now(),
        op: s.op,
        param: s.param,
        enabled: true,
      }))
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-primary px-2.5 py-0.5 rounded-full bg-muted border border-border">
              MULTI-STAGE RECIPE WORKBENCH
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              CYBERCHEF ARCHITECTURE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
            Crypto Pipeline Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-[70ch]">
            Chain encodings, classical substitutions, byte-wise XOR operations, and Shannon entropy analyzers together. Inspect outputs and bit changes at every intermediate stage.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {PRESET_RECIPES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(p)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-mono text-xs transition cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Educational Callout: How to Build Cryptographic Pipelines */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl border border-border bg-muted shrink-0 text-foreground">
            <Layers className="size-4" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <span>How Cryptographic Multi-Stage Recipes Work</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Real-world cryptanalysis and forensics rarely involve a single transformation. Data is often stripped, hex-decoded, XOR-decrypted, and decompressed sequentially.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 font-mono text-[11px]">
              <div className="border border-border bg-background p-2.5 rounded-xl">
                <span className="font-bold text-foreground block uppercase">1. Add Operations</span>
                <span className="text-muted-foreground">Click any operation on the left (e.g. Hex Decode, XOR, ROT13) to append it to your active recipe.</span>
              </div>
              <div className="border border-border bg-background p-2.5 rounded-xl">
                <span className="font-bold text-foreground block uppercase">2. Order & Toggle</span>
                <span className="text-muted-foreground">Use the up/down arrows to reorder steps. Uncheck a step to bypass it without deleting your parameters.</span>
              </div>
              <div className="border border-border bg-background p-2.5 rounded-xl">
                <span className="font-bold text-foreground block uppercase">3. Inspect Intermediates</span>
                <span className="text-muted-foreground">Click the eye icon next to any step to view the raw intermediate output and character counts.</span>
              </div>
              <div className="border border-border bg-background p-2.5 rounded-xl">
                <span className="font-bold text-foreground block uppercase">4. Analyze Entropy</span>
                <span className="text-muted-foreground">Add "Shannon Entropy" to measure randomness (0 bits/symbol for uniform, up to 8 bits/byte for compressed/encrypted).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Operations Library (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <span className="font-mono text-[11px] uppercase font-bold text-foreground block tracking-wider">
              Operations Library
            </span>
            <p className="text-[11px] text-muted-foreground">
              Click any operation below to append it to your active pipeline:
            </p>

            <div className="space-y-3 font-mono text-xs">
              {(["Encodings", "Classical", "Logic", "Transforms", "Analysis"] as const).map((cat) => {
                const ops = (Object.keys(OP_METADATA) as OpType[]).filter(
                  (k) => OP_METADATA[k].category === cat
                );
                return (
                  <div key={cat} className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      {cat}
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {ops.map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => addOperation(op)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border/60 hover:border-foreground/30 transition flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <span>{OP_METADATA[op].name}</span>
                          <Plus className="size-3 text-muted-foreground group-hover:text-primary transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Active Recipe Stages (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" /> Active Pipeline ({steps.length} Steps)
              </span>
              <button
                type="button"
                onClick={() => setSteps([])}
                className="text-[10.5px] font-mono text-muted-foreground hover:text-rose-500 transition cursor-pointer"
              >
                Clear Recipe
              </button>
            </div>

            {/* Input Payload Textarea */}
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[10.5px] text-muted-foreground">
                <span>Input Payload</span>
                <span>{inputText.length} chars / {new TextEncoder().encode(inputText).length} bytes</span>
              </div>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type raw input to process..."
                className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            {/* Chained Pipeline Steps */}
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const meta = OP_METADATA[step.op];
                const res = stepResults[idx];
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border p-3.5 space-y-2.5 font-mono text-xs transition ${
                      step.enabled
                        ? "bg-muted/30 border-border"
                        : "bg-muted/10 border-border/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-foreground">{meta.name}</span>
                        <span className="text-[10px] text-muted-foreground">({meta.category})</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleStep(step.id)}
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition cursor-pointer ${
                            step.enabled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.enabled ? "Active" : "Disabled"}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(idx, "down")}
                          disabled={idx === steps.length - 1}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="p-1 text-muted-foreground hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Step Config Options */}
                    {step.op === "caesar" && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground text-[10.5px]">Shift Key:</span>
                        <input
                          type="number"
                          min={1}
                          max={25}
                          value={step.param ?? 3}
                          onChange={(e) => updateParam(step.id, parseInt(e.target.value))}
                          className="w-16 rounded bg-background border border-border px-2 py-1 text-xs"
                        />
                      </div>
                    )}

                    {step.op === "xor-text" && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground text-[10.5px]">Text Key:</span>
                        <input
                          type="text"
                          value={step.param ?? "KEY"}
                          onChange={(e) => updateParam(step.id, e.target.value)}
                          className="flex-1 rounded bg-background border border-border px-2 py-1 text-xs"
                        />
                      </div>
                    )}

                    {step.op === "xor-hex" && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground text-[10.5px]">Hex Key:</span>
                        <input
                          type="text"
                          value={step.param ?? "5A"}
                          onChange={(e) => updateParam(step.id, e.target.value)}
                          className="flex-1 rounded bg-background border border-border px-2 py-1 text-xs"
                        />
                      </div>
                    )}

                    {/* Stage Preview */}
                    <div className="rounded-lg bg-background p-2 border border-border/80 text-[11px] space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Stage Output Preview:</span>
                        <span>Entropy: {res?.entropy ?? 0} H</span>
                      </div>
                      <div className="font-mono text-foreground truncate select-all">
                        {res?.error ? (
                          <span className="text-rose-500 font-bold">[{res.error}]</span>
                        ) : (
                          res?.output || "<empty>"
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {steps.length === 0 && (
                <div className="text-center py-8 rounded-xl border border-dashed border-border p-4 text-xs font-mono text-muted-foreground space-y-1">
                  <p>Your pipeline is empty.</p>
                  <p className="text-[11px]">Click any operation on the left to begin chaining transformations.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Final Output & Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="size-3.5 text-primary" /> Final Pipeline Result
              </span>
              <span className="text-[10px] text-muted-foreground">
                Entropy: {calcShannonEntropy(finalOutput)} bits
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10.5px] text-muted-foreground">
                <span>Transformed Stream</span>
                <span>{finalOutput.length} chars</span>
              </div>
              <textarea
                rows={10}
                readOnly
                value={finalOutput}
                className="w-full rounded-xl bg-background border border-border p-3 text-xs focus:outline-none text-foreground select-all leading-relaxed"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyFinal}
                className="py-2 px-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copied" : "Copy Output"}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToScratchpad}
                className="py-2 px-3 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {scratchpadSaved ? <Check className="size-3.5 text-emerald-500" /> : <ClipboardPlus className="size-3.5" />}
                <span>{scratchpadSaved ? "Saved" : "To Scratchpad"}</span>
              </button>
            </div>

            {/* Pipeline Statistics Banner */}
            <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2 text-[11px]">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Cryptanalytic Telemetry:
              </span>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shannon Entropy:</span>
                <span className="font-bold text-foreground">{calcShannonEntropy(finalOutput)} / 8.0 bits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Index of Coincidence:</span>
                <span className="font-bold text-foreground">{calcIndexOfCoincidence(finalOutput)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Transforms:</span>
                <span className="font-bold text-primary">{steps.filter((s) => s.enabled).length} steps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
