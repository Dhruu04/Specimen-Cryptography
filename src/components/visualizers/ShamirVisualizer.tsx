import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  generateShamirSetup,
  lagrangeInterpolateSecret,
  evaluateRealLagrange,
  evaluatePolynomial,
  SHAMIR_PRIME,
  type ShamirShare,
  type ShamirSetup,
} from "@/lib/crypto/shamir";
import { Dices, Zap, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Props = {
  values?: Record<string, string>;
  resultOutput?: string;
};

export function ShamirVisualizer({ values }: Props) {
  // Configurable parameters
  const [secretVal, setSecretVal] = useState<number>(() => {
    const init = Number.parseInt(values?.["secret"] ?? "42", 10);
    return isNaN(init) ? 42 : Math.min(255, Math.max(0, init));
  });
  const [thresholdK, setThresholdK] = useState<number>(() => {
    const init = Number.parseInt(values?.["threshold"] ?? "3", 10);
    return isNaN(init) ? 3 : Math.min(6, Math.max(2, init));
  });
  const [totalN, setTotalN] = useState<number>(() => {
    const init = Number.parseInt(values?.["total"] ?? "5", 10);
    return isNaN(init) ? 5 : Math.min(8, Math.max(thresholdK, init));
  });

  // Selected shares for recovery
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set([0, 1, 2]));
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);
  const [tamperedValue, setTamperedValue] = useState<number>(100);

  // Setup state
  const [setup, setSetup] = useState<ShamirSetup>(() =>
    generateShamirSetup(secretVal, thresholdK, totalN, SHAMIR_PRIME)
  );

  // Regenerate setup on parameter changes
  const handleRegenerate = (s = secretVal, k = thresholdK, n = totalN) => {
    const newSetup = generateShamirSetup(s, k, n, SHAMIR_PRIME);
    setSetup(newSetup);
    // Select the first k shares by default
    const initialSelected = new Set<number>();
    for (let i = 0; i < Math.min(k, n); i++) {
      initialSelected.add(i);
    }
    setSelectedIndices(initialSelected);
    setTamperedIndex(null);
  };

  const handleSecretChange = (newS: number) => {
    const safeS = Math.min(255, Math.max(0, newS));
    setSecretVal(safeS);
    handleRegenerate(safeS, thresholdK, totalN);
  };

  const handleThresholdChange = (newK: number) => {
    const safeK = Math.min(6, Math.max(2, newK));
    const safeN = Math.max(safeK, totalN);
    setThresholdK(safeK);
    setTotalN(safeN);
    handleRegenerate(secretVal, safeK, safeN);
  };

  const handleTotalChange = (newN: number) => {
    const safeN = Math.min(8, Math.max(thresholdK, newN));
    setTotalN(safeN);
    handleRegenerate(secretVal, thresholdK, safeN);
  };

  // Compute effective shares taking tampering into account
  const effectiveShares: ShamirShare[] = useMemo(() => {
    return setup.shares.map((share, idx) => {
      if (idx === tamperedIndex) {
        return { x: share.x, y: tamperedValue };
      }
      return share;
    });
  }, [setup.shares, tamperedIndex, tamperedValue]);

  // Selected shares for reconstruction
  const activeShares: ShamirShare[] = useMemo(() => {
    return Array.from(selectedIndices)
      .sort((a, b) => a - b)
      .map((idx) => effectiveShares[idx])
      .filter((s): s is ShamirShare => s !== undefined);
  }, [selectedIndices, effectiveShares]);

  // Reconstruction via Lagrange interpolation over GF(257)
  const reconstruction = useMemo(() => {
    if (activeShares.length < thresholdK) {
      return {
        recoveredSecret: null,
        success: false,
        steps: [
          `Threshold k = ${thresholdK}, but only ${activeShares.length} share(s) selected.`,
          `Under-threshold secrecy: Any secret S' ∈ [0..255] is mathematically equally likely!`,
          `Perfect Information-Theoretic Security guaranteed by Adi Shamir (1979).`,
        ],
      };
    }
    const result = lagrangeInterpolateSecret(activeShares, setup.prime);
    const success = result.secret === setup.secret && tamperedIndex === null;
    return {
      recoveredSecret: result.secret,
      success,
      steps: result.steps,
    };
  }, [activeShares, thresholdK, setup.prime, setup.secret, tamperedIndex]);

  // Toggle a share selection
  const toggleShare = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  // Canvas plotting
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Padding & Viewport
    const padX = 45;
    const padY = 30;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const maxX = totalN + 0.5;
    const maxY = SHAMIR_PRIME + 15;

    const toScreenX = (x: number) => padX + (x / maxX) * plotW;
    const toScreenY = (y: number) => padY + plotH - (y / maxY) * plotH;

    // Clear background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= totalN; x++) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, padY);
      ctx.lineTo(sx, height - padY);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`x=${x}`, sx, height - padY + 16);
    }

    const yMarks = [0, 64, 128, 192, 256];
    for (const y of yMarks) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(padX, sy);
      ctx.lineTo(width - padX, sy);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${y}`, padX - 8, sy + 3);
    }

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.stroke();

    // If activeShares < threshold: render family of 4 alternate candidate curves passing through active shares
    if (activeShares.length > 0 && activeShares.length < thresholdK) {
      const candidateColors = [
        "rgba(244, 63, 94, 0.4)",
        "rgba(234, 179, 8, 0.4)",
        "rgba(168, 85, 247, 0.4)",
        "rgba(59, 130, 246, 0.4)",
      ];
      const dummySecrets = [30, 95, 160, 225];

      dummySecrets.forEach((fakeSecret, idx) => {
        const dummyShares = [{ x: 0, y: fakeSecret }, ...activeShares];
        ctx.strokeStyle = candidateColors[idx % candidateColors.length]!;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();

        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * (totalN + 0.3);
          const y = evaluateRealLagrange(dummyShares, x);
          const sx = toScreenX(x);
          const sy = toScreenY(Math.max(0, Math.min(maxY, y)));
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Render the true polynomial continuous curve
    if (activeShares.length >= thresholdK) {
      ctx.strokeStyle = reconstruction.success ? "#10b981" : "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = reconstruction.success ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)";
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const steps = 140;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * (totalN + 0.3);
        const y = evaluateRealLagrange(activeShares, x);
        const sx = toScreenX(x);
        const sy = toScreenY(Math.max(0, Math.min(maxY, y)));
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Plot Secret on Y-axis (x = 0, y = S)
    const secretScreenX = toScreenX(0);
    const secretScreenY = toScreenY(setup.secret);

    ctx.fillStyle = "#38bdf8";
    ctx.shadowColor = "rgba(56, 189, 248, 0.8)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(secretScreenX, secretScreenY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(` S = f(0) = ${setup.secret}`, secretScreenX + 8, secretScreenY - 4);

    // Plot all share points
    effectiveShares.forEach((share, idx) => {
      const isSelected = selectedIndices.has(idx);
      const isTampered = idx === tamperedIndex;
      const sx = toScreenX(share.x);
      const sy = toScreenY(share.y);

      // Connect point to x-axis with subtle dashed line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, height - padY);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw point
      ctx.beginPath();
      ctx.arc(sx, sy, isSelected ? 7 : 5, 0, Math.PI * 2);

      if (isTampered) {
        ctx.fillStyle = "#f43f5e";
        ctx.shadowColor = "rgba(244, 63, 94, 0.8)";
        ctx.shadowBlur = 8;
      } else if (isSelected) {
        ctx.fillStyle = "#10b981";
        ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "#64748b";
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label point
      ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.6)";
      ctx.font = isSelected ? "bold 11px monospace" : "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`P${idx + 1}(${share.x}, ${share.y})`, sx, sy - 10);
    });
  }, [setup, activeShares, effectiveShares, selectedIndices, thresholdK, totalN, reconstruction, tamperedIndex]);

  return (
    <div className="rounded-[18px] bg-card p-5 ring-1 ring-border shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Adi Shamir (1979) Threshold Cryptosystem
            </span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary ring-1 ring-primary/20">
              GF({SHAMIR_PRIME})
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground mt-0.5">
            ({thresholdK}, {totalN}) Threshold Polynomial Secret Sharing
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5 max-w-xl">
            Any <strong className="text-foreground">{thresholdK}</strong> or more shares unlock the master secret via Lagrange interpolation. Any subset of <strong className="text-foreground">{thresholdK - 1}</strong> shares reveals exactly <strong className="text-foreground">zero bits</strong> of information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleRegenerate()}
            className="flex items-center gap-1.5 rounded-lg bg-secondary hover:bg-secondary/80 px-3 py-1.5 font-mono text-[11px] font-semibold text-foreground ring-1 ring-border transition-colors cursor-pointer"
          >
            <Dices className="size-3.5" />
            <span>New Random Setup</span>
          </button>
        </div>
      </div>

      {/* Control sliders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-background/50 p-4 rounded-xl ring-1 ring-border/60">
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1.5">
            <span className="text-muted-foreground">Master Secret S:</span>
            <span className="font-bold text-sky-400">{secretVal} (0x{secretVal.toString(16).toUpperCase()})</span>
          </div>
          <input
            type="range"
            min={0}
            max={255}
            value={secretVal}
            onChange={(e) => handleSecretChange(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
          <span className="text-[10px] text-muted-foreground">Constant term: f(0) = S</span>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1.5">
            <span className="text-muted-foreground">Threshold (k):</span>
            <span className="font-bold text-primary">{thresholdK} shares</span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            value={thresholdK}
            onChange={(e) => handleThresholdChange(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <span className="text-[10px] text-muted-foreground">Degree of polynomial: d = k - 1 = {thresholdK - 1}</span>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1.5">
            <span className="text-muted-foreground">Total Shares (n):</span>
            <span className="font-bold text-foreground">{totalN} participants</span>
          </div>
          <input
            type="range"
            min={thresholdK}
            max={8}
            value={totalN}
            onChange={(e) => handleTotalChange(Number(e.target.value))}
            className="w-full accent-foreground cursor-pointer"
          />
          <span className="text-[10px] text-muted-foreground">Generated points (x = 1..n)</span>
        </div>
      </div>

      {/* 2D Canvas Curve Plotter */}
      <div className="rounded-xl overflow-hidden ring-1 ring-border/80 bg-neutral-950 p-3">
        <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              Secret f(0) = {setup.secret}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Active Share
            </span>
            {activeShares.length < thresholdK && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-4 h-0.5 border-t border-dashed border-amber-400 inline-block" />
                Infinite Undetermined Polynomials (Information Secrecy)
              </span>
            )}
          </div>
          <span>Galois Field Prime p = {SHAMIR_PRIME}</span>
        </div>
        <canvas ref={canvasRef} className="w-full h-64 rounded-lg block cursor-crosshair" />
      </div>

      {/* Interactive Share Selectors & Tamper Simulation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Participants & Distributed Key Shares ({selectedIndices.size} of {totalN} Selected)
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Click cards to select/deselect shares for reconstruction
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {effectiveShares.map((share, idx) => {
            const isSelected = selectedIndices.has(idx);
            const isTampered = idx === tamperedIndex;

            return (
              <div
                key={share.x}
                onClick={() => toggleShare(idx)}
                className={`group relative rounded-xl p-3 ring-1 transition-all cursor-pointer ${
                  isTampered
                    ? "bg-rose-500/10 ring-rose-500/40"
                    : isSelected
                    ? "bg-emerald-500/10 ring-emerald-500/40 shadow-xs"
                    : "bg-background/60 ring-border hover:ring-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-foreground">
                    Share #{share.x}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="mt-2 font-mono text-[11px] space-y-0.5">
                  <div className="text-muted-foreground">x = {share.x}</div>
                  <div className={`font-bold ${isTampered ? "text-rose-400" : isSelected ? "text-emerald-400" : "text-foreground"}`}>
                    y = {share.y}
                  </div>
                </div>

                {/* Tamper Button */}
                <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  {isTampered ? (
                    <button
                      type="button"
                      onClick={() => setTamperedIndex(null)}
                      className="text-[10px] text-rose-400 hover:underline font-mono"
                    >
                      Reset Share
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTamperedIndex(idx);
                        setTamperedValue((share.y + 37) % SHAMIR_PRIME);
                      }}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-amber-400 font-mono transition-colors"
                    >
                      <Zap className="size-3 text-amber-500" />
                      <span>Corrupt Byte</span>
                    </button>
                  )}
                  {isTampered && <span className="text-[9px] font-mono text-rose-500 font-bold">TAMPERED</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lagrange Reconstruction & Math Proof Output */}
      <div className={`rounded-xl p-4 ring-1 ${
        reconstruction.success
          ? "bg-emerald-500/10 ring-emerald-500/30"
          : activeShares.length >= thresholdK
          ? "bg-rose-500/10 ring-rose-500/30"
          : "bg-amber-500/10 ring-amber-500/30"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase">
              {reconstruction.success ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Secret Successfully Reconstructed</span>
                </>
              ) : activeShares.length >= thresholdK ? (
                <>
                  <XCircle className="size-4 text-rose-500" />
                  <span>Reconstruction Failed (Tampered Share Detected)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-4 text-amber-500" />
                  <span>Insufficient Shares for Recovery</span>
                </>
              )}
            </span>
          </div>
          {reconstruction.recoveredSecret !== null && (
            <div className="font-mono text-xs font-bold">
              Recovered S: <span className="text-lg font-extrabold">{reconstruction.recoveredSecret}</span>
              {reconstruction.success && (
                <span className="ml-2 text-emerald-400 text-[11px]">(= Target Secret {setup.secret})</span>
              )}
            </div>
          )}
        </div>

        {/* Formula Display */}
        <div className="mt-3 font-mono text-[11px] space-y-1.5 text-muted-foreground">
          <div className="text-foreground font-semibold">
            Lagrange Interpolation Formula over GF({setup.prime}):
          </div>
          <div className="bg-background/80 p-2.5 rounded-lg ring-1 ring-border text-foreground font-mono text-[11px] overflow-x-auto">
            S = f(0) = ∑ᵢ yᵢ · ℓᵢ(0) = ∑ᵢ yᵢ · ∏_{`j≠i`} (-xⱼ) / (xᵢ - xⱼ) (mod {setup.prime})
          </div>

          <div className="space-y-1 pt-2">
            {reconstruction.steps.map((step, idx) => (
              <div key={idx} className="leading-relaxed">
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
