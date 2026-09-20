import { useState } from "react";
import { Grid, Sparkles, AlertCircle, Compass, HelpCircle } from "lucide-react";

export function LatticeVisualizer() {
  const [basisType, setBasisType] = useState<"good" | "bad">("good");
  const [targetX, setTargetX] = useState(4.2);
  const [targetY, setTargetY] = useState(3.8);
  const [showNoiseCloud, setShowNoiseCloud] = useState(true);
  const [noiseLevel, setNoiseLevel] = useState(0.4);

  // Good Basis: short, nearly orthogonal
  // Bad Basis: long, highly skewed
  const b1 = basisType === "good" ? [2, 1] : [5, 4];
  const b2 = basisType === "good" ? [-1, 2] : [4, 3];

  // Generate 2D lattice points: v = a*b1 + b*b2 for a, b in [-3, 3]
  const latticePoints: { x: number; y: number; a: number; b: number }[] = [];
  for (let a = -3; a <= 3; a++) {
    for (let b = -3; b <= 3; b++) {
      const x = a * b1[0]! + b * b2[0]!;
      const y = a * b1[1]! + b * b2[1]!;
      if (Math.abs(x) <= 12 && Math.abs(y) <= 12) {
        latticePoints.push({ x, y, a, b });
      }
    }
  }

  // Find Closest Vector (CVP) using exhaustive search among points
  let closest = latticePoints[0] ?? { x: 0, y: 0, a: 0, b: 0 };
  let minDistance = Infinity;
  for (const pt of latticePoints) {
    const dist = Math.hypot(pt.x - targetX, pt.y - targetY);
    if (dist < minDistance) {
      minDistance = dist;
      closest = pt;
    }
  }

  // Coordinate mapping for SVG (Center is (150, 150), scale is 11px per unit)
  const svgSize = 300;
  const center = 150;
  const scale = 11;
  const toSvgX = (x: number) => center + x * scale;
  const toSvgY = (y: number) => center - y * scale;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Grid className="size-4 text-primary" />
          <span>2D Lattice & Closest Vector Problem (CVP)</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted/80 p-0.5 ring-1 ring-border/50">
          <button
            type="button"
            onClick={() => setBasisType("good")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              basisType === "good"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Good Basis (Orthogonal)
          </button>
          <button
            type="button"
            onClick={() => setBasisType("bad")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              basisType === "bad"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bad Basis (Skewed)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        {/* SVG Plane Canvas */}
        <div className="sm:col-span-7 flex flex-col items-center justify-center rounded-xl bg-muted/20 p-2 ring-1 ring-border/60">
          <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="w-full max-w-[300px] aspect-square overflow-visible select-none"
          >
            {/* Grid axes */}
            <line
              x1={0}
              y1={center}
              x2={svgSize}
              y2={center}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={1}
            />
            <line
              x1={center}
              y1={0}
              x2={center}
              y2={svgSize}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={1}
            />

            {/* Lattice fundamental parallelepiped */}
            <polygon
              points={`
                ${toSvgX(0)},${toSvgY(0)}
                ${toSvgX(b1[0]!)},${toSvgY(b1[1]!)}
                ${toSvgX(b1[0]! + b2[0]!)},${toSvgY(b1[1]! + b2[1]!)}
                ${toSvgX(b2[0]!)},${toSvgY(b2[1]!)}
              `}
              fill="currentColor"
              fillOpacity={0.06}
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeDasharray="3 3"
            />

            {/* Lattice points */}
            {latticePoints.map((pt, i) => {
              const isClosest = pt.x === closest.x && pt.y === closest.y;
              return (
                <g key={i}>
                  {showNoiseCloud && (
                    <circle
                      cx={toSvgX(pt.x)}
                      cy={toSvgY(pt.y)}
                      r={noiseLevel * scale * 1.5}
                      fill="currentColor"
                      fillOpacity={0.04}
                      className="text-primary"
                    />
                  )}
                  <circle
                    cx={toSvgX(pt.x)}
                    cy={toSvgY(pt.y)}
                    r={isClosest ? 4.5 : 2.5}
                    fill={isClosest ? "var(--primary)" : "currentColor"}
                    fillOpacity={isClosest ? 1 : 0.4}
                  />
                </g>
              );
            })}

            {/* Basis vectors */}
            <line
              x1={toSvgX(0)}
              y1={toSvgY(0)}
              x2={toSvgX(b1[0]!)}
              y2={toSvgY(b1[1]!)}
              stroke="var(--primary)"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
            <line
              x1={toSvgX(0)}
              y1={toSvgY(0)}
              x2={toSvgX(b2[0]!)}
              y2={toSvgY(b2[1]!)}
              stroke="#0ea5e9"
              strokeWidth={2}
            />

            {/* Target vector t */}
            <line
              x1={toSvgX(0)}
              y1={toSvgY(0)}
              x2={toSvgX(targetX)}
              y2={toSvgY(targetY)}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
            <circle
              cx={toSvgX(targetX)}
              cy={toSvgY(targetY)}
              r={5}
              fill="#f59e0b"
              className="cursor-pointer"
            />

            {/* Line from Target to Closest Lattice Point */}
            <line
              x1={toSvgX(targetX)}
              y1={toSvgY(targetY)}
              x2={toSvgX(closest.x)}
              y2={toSvgY(closest.y)}
              stroke="var(--primary)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          </svg>
          <div className="mt-1 text-[10px] text-muted-foreground text-center">
            Orange Dot: Target <span className="font-mono">t</span> | Green: Closest Vector{" "}
            <span className="font-mono">v ∈ Λ</span>
          </div>
        </div>

        {/* Interactive Controls & Metrics */}
        <div className="sm:col-span-5 space-y-3">
          <div className="rounded-lg bg-card p-3 ring-1 ring-border/70 space-y-2">
            <div className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              <Compass className="size-3.5 text-primary" />
              <span>Current Basis Vectors</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="rounded bg-muted/40 p-1.5">
                <div className="text-[9.5px] text-muted-foreground">Vector b₁</div>
                <div className="text-primary font-bold">({b1[0]}, {b1[1]})</div>
              </div>
              <div className="rounded bg-muted/40 p-1.5">
                <div className="text-[9.5px] text-muted-foreground">Vector b₂</div>
                <div className="text-sky-600 font-bold">({b2[0]}, {b2[1]})</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {basisType === "good"
                ? "Good Basis: Orthogonal and short. Allows fast Babai nearest-plane decoding (Secret Key)."
                : "Bad Basis: Long and skewed. Finding closest vector is computationally hard in high dimensions (Public Key)."}
            </div>
          </div>

          <div className="rounded-lg bg-card p-3 ring-1 ring-border/70 space-y-2">
            <div className="text-[11px] font-semibold text-foreground flex items-center justify-between">
              <span>Target Point (t)</span>
              <span className="font-mono text-primary">
                ({targetX.toFixed(1)}, {targetY.toFixed(1)})
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">X Coordinate:</span>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.2"
                  value={targetX}
                  onChange={(e) => setTargetX(parseFloat(e.target.value))}
                  className="w-28 accent-primary"
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Y Coordinate:</span>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.2"
                  value={targetY}
                  onChange={(e) => setTargetY(parseFloat(e.target.value))}
                  className="w-28 accent-primary"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-3 ring-1 ring-border/70 space-y-2">
            <div className="text-[11px] font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                <span>LWE Gaussian Noise Cloud</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNoiseCloud(!showNoiseCloud)}
                className="text-[10px] font-mono text-primary underline"
              >
                {showNoiseCloud ? "Hide" : "Show"}
              </button>
            </div>
            {showNoiseCloud && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Perturbation (σ):</span>
                  <span className="font-mono text-foreground">{noiseLevel.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.1"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="text-[9.5px] text-muted-foreground">
                  In LWE, noise hides the exact lattice point. Only the short private basis can cancel the error.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 p-2.5 ring-1 ring-primary/20 flex items-start gap-2">
        <AlertCircle className="size-4 shrink-0 text-primary mt-0.5" />
        <div className="text-[11px] text-foreground space-y-0.5">
          <div className="font-semibold">Why Quantum Computers Cannot Break Lattices:</div>
          <div className="text-muted-foreground leading-relaxed">
            Shor's algorithm exploits the algebraic periodicity of groups (factoring and discrete logarithms). High-dimensional lattices (n ≥ 512) lack hidden subgroup periods; the shortest vector problem requires navigating non-periodic geometric spaces where quantum computers offer no known polynomial speedup.
          </div>
        </div>
      </div>
    </div>
  );
}
