import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

export function EcbPenguinVisualizer() {
  const [mode, setMode] = useState<"plain" | "ecb" | "cbc" | "ctr">("ecb");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw the test pattern / image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw plain test graphic (Penguin silhouette / specimen shield)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Dark body silhouette
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 10, 55, 75, 0, 0, Math.PI * 2);
    ctx.fill();

    // White belly
    ctx.fillStyle = "#f3f4f6";
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 20, 32, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orange beak / eyes
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 40, 10, 0, Math.PI);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(w / 2 - 12, h / 2 - 50, 6, 0, Math.PI * 2);
    ctx.arc(w / 2 + 12, h / 2 - 50, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(w / 2 - 12, h / 2 - 50, 3, 0, Math.PI * 2);
    ctx.arc(w / 2 + 12, h / 2 - 50, 3, 0, Math.PI * 2);
    ctx.fill();

    if (mode === "plain") return;

    // Get pixel data
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const blockSize = 8; // 8x8 pixel blocks for visual clarity

    if (mode === "ecb") {
      // In ECB mode, identical input blocks encrypt to identical ciphertext blocks.
      // We hash/pseudorandomly map each distinct block color pattern to a deterministic pseudo-color.
      for (let by = 0; by < h; by += blockSize) {
        for (let bx = 0; bx < w; bx += blockSize) {
          // Calculate average luminance of this block to determine state
          let sum = 0;
          for (let y = 0; y < blockSize; y++) {
            for (let x = 0; x < blockSize; x++) {
              const idx = ((by + y) * w + (bx + x)) * 4;
              sum += data[idx] ?? 0;
            }
          }
          const avg = Math.floor(sum / (blockSize * blockSize));
          // Deterministic ECB substitute value for this block
          const ecbVal = (avg * 137 + 43) % 256;

          for (let y = 0; y < blockSize; y++) {
            for (let x = 0; x < blockSize; x++) {
              const idx = ((by + y) * w + (bx + x)) * 4;
              if (idx < data.length) {
                data[idx] = ecbVal;
                data[idx + 1] = (ecbVal + 30) % 256;
                data[idx + 2] = (ecbVal + 60) % 256;
              }
            }
          }
        }
      }
    } else if (mode === "cbc" || mode === "ctr") {
      // In CBC/CTR, chaining with an IV or PRF keystream produces true pseudorandom white noise
      // using an LCG seeded by IV
      let state = 0x12345678;
      for (let i = 0; i < data.length; i += 4) {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        const noise = (state >> 16) & 0xff;
        data[i] = noise;
        data[i + 1] = (noise * 3) & 0xff;
        data[i + 2] = (noise * 7) & 0xff;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [mode]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              STRUCTURAL LEAKAGE
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              NIST SP 800-38A
            </span>
          </div>
          <h3 className="font-sans text-[17px] font-bold text-foreground">
            The ECB "Penguin" Mode Flaw Visualizer
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Demonstrates why Electronic Codebook (ECB) mode preserves data structure and fails confidentiality.
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border">
          <button
            type="button"
            onClick={() => setMode("plain")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
              mode === "plain"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setMode("ecb")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
              mode === "ecb"
                ? "bg-rose-600 text-white shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ECB (Insecure)
          </button>
          <button
            type="button"
            onClick={() => setMode("cbc")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
              mode === "cbc"
                ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CBC (Chained)
          </button>
          <button
            type="button"
            onClick={() => setMode("ctr")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
              mode === "ctr"
                ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CTR / GCM
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Canvas Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border">
          <div className="p-2 bg-card rounded-lg shadow-sm border border-border">
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="rounded-md block bg-white"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
            <RefreshCw className="size-3.5 animate-spin text-muted-foreground/60" />
            <span>Mode active: <strong className="text-foreground uppercase">{mode}</strong></span>
          </div>
        </div>

        {/* Technical Explanation Panel */}
        <div className="space-y-4">
          {mode === "ecb" ? (
            <div className="rounded-xl bg-rose-50/70 border border-rose-200/80 p-4 space-y-2 text-rose-900">
              <div className="flex items-center gap-2 font-semibold text-[13.5px]">
                <ShieldAlert className="size-4 text-rose-600 shrink-0" />
                <span>Zero Semantic Diffusion (ECB Flaw)</span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-rose-800">
                Notice how the silhouette of the specimen is still completely visible! Because ECB mode encrypts each 128-bit block independently (C_i = E_k(P_i)), <strong>identical plaintext blocks always yield identical ciphertext blocks</strong>. Repeating background pixels and identical body segments preserve their structural outline.
              </p>
            </div>
          ) : mode === "cbc" || mode === "ctr" ? (
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-4 space-y-2 text-emerald-900">
              <div className="flex items-center gap-2 font-semibold text-[13.5px]">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Full Semantic Security & Semantic Diffusion</span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-emerald-800">
                The encrypted image is indistinguishable from true random noise. In {mode.toUpperCase()} mode with a unique Initialization Vector (IV), every block is chained or combined with a pseudorandom stream (C_i = E_k(P_i ⊕ C_i₋₁)), ensuring identical plaintext blocks produce radically different ciphertext.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-1.5">
              <span className="font-semibold text-[13.5px] text-foreground">Original Plaintext Specimen</span>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                Click <strong>ECB (Insecure)</strong> to watch how encrypting without chaining preserves macroscopic patterns, or <strong>CBC / CTR</strong> to see the proper semantic diffusion achieved by modern modes.
              </p>
            </div>
          )}

          <div className="rounded-xl bg-card border border-border/70 p-3.5 text-[12px] space-y-1 font-mono text-muted-foreground">
            <span className="text-foreground font-semibold block">William Stallings Rule (8th Ed., Ch. 7):</span>
            <p>
              "ECB is appropriate only for short messages (less than one block), such as transmitting an encryption key. For any multi-block message, Cipher Block Chaining (CBC) or an authenticated AEAD mode (GCM) must always be used."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
