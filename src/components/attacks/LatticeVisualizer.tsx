import { useEffect, useRef, useState, useMemo } from "react";
import {
  Atom,
  CheckCircle2,
  ChevronRight,
  Compass,
  HelpCircle,
  Info,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

type Vec2 = [number, number];

// Matrix inverse helper for 2x2
function invert2x2(m: [Vec2, Vec2]): [Vec2, Vec2] | null {
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (Math.abs(det) < 1e-9) return null;
  const invDet = 1 / det;
  return [
    [m[1][1] * invDet, -m[0][1] * invDet],
    [-m[1][0] * invDet, m[0][0] * invDet],
  ];
}

// Multiply 2x2 matrix with 2D vector
function mulMatVec(m: [Vec2, Vec2], v: Vec2): Vec2 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1],
    m[1][0] * v[0] + m[1][1] * v[1],
  ];
}

export function LatticeVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fundamental orthogonal basis (Private Key basis)
  const baseV1: Vec2 = [36, 12];
  const baseV2: Vec2 = [-12, 36];

  // Active state
  const [basisPreset, setBasisPreset] = useState<"good" | "bad" | "extreme" | "custom">("good");
  const [skewFactor, setSkewFactor] = useState<number>(3);
  const [noiseRadius, setNoiseRadius] = useState<number>(12);
  const [showParallelepiped, setShowParallelepiped] = useState<boolean>(true);
  const [showBabaiPath, setShowBabaiPath] = useState<boolean>(true);
  const [isDraggingTarget, setIsDraggingTarget] = useState<boolean>(false);

  // True secret lattice point coordinates in basis: [a, b] => P = a*v1 + b*v2
  const [trueCoords, setTrueCoords] = useState<[number, number]>([1, 1]);

  // Target Vector offset from True Lattice Point (Noise vector e)
  const [noiseVec, setNoiseVec] = useState<Vec2>([9, -8]);

  // Derive active basis B = [b1, b2]
  const activeBasis: [Vec2, Vec2] = useMemo(() => {
    if (basisPreset === "good") {
      return [baseV1, baseV2];
    } else if (basisPreset === "bad") {
      // Skewed unimodular basis: b1 = baseV1 + 2*baseV2, b2 = baseV1 + 3*baseV2 (det = 1)
      const b1: Vec2 = [
        baseV1[0] + 2 * baseV2[0],
        baseV1[1] + 2 * baseV2[1],
      ];
      const b2: Vec2 = [
        baseV1[0] + 3 * baseV2[0],
        baseV1[1] + 3 * baseV2[1],
      ];
      return [b1, b2];
    } else if (basisPreset === "extreme") {
      // High skew: unimodular shear with skewFactor
      const k = skewFactor;
      const b1: Vec2 = [
        baseV1[0] + k * baseV2[0],
        baseV1[1] + k * baseV2[1],
      ];
      const b2: Vec2 = [
        (k - 1) * baseV1[0] + (k * (k - 1) + 1) * baseV2[0],
        (k - 1) * baseV1[1] + (k * (k - 1) + 1) * baseV2[1],
      ];
      return [b1, b2];
    } else {
      // Custom based on skewFactor
      const k = skewFactor;
      const b1: Vec2 = [baseV1[0] + k * baseV2[0], baseV1[1] + k * baseV2[1]];
      const b2: Vec2 = [baseV2[0], baseV2[1]];
      return [b1, b2];
    }
  }, [basisPreset, skewFactor]);

  // True lattice point P (in Cartesian coordinates relative to origin)
  const trueLatticePoint: Vec2 = useMemo(() => {
    return [
      trueCoords[0] * baseV1[0] + trueCoords[1] * baseV2[0],
      trueCoords[0] * baseV1[1] + trueCoords[1] * baseV2[1],
    ];
  }, [trueCoords]);

  // Target vector t = P + e
  const targetPoint: Vec2 = useMemo(() => {
    return [
      trueLatticePoint[0] + noiseVec[0],
      trueLatticePoint[1] + noiseVec[1],
    ];
  }, [trueLatticePoint, noiseVec]);

  // Babai's Round-Off Algorithm Computation
  const babaiResult = useMemo(() => {
    // Basis matrix B columns are b1 and b2
    const B_col: [Vec2, Vec2] = [
      [activeBasis[0][0], activeBasis[1][0]],
      [activeBasis[0][1], activeBasis[1][1]],
    ];

    const invB = invert2x2(B_col);
    if (!invB) {
      return {
        det: 0,
        rawCoords: [0, 0] as Vec2,
        roundedCoords: [0, 0] as [number, number],
        decodedPoint: [0, 0] as Vec2,
        distance: 0,
        isSuccess: false,
      };
    }

    const det = activeBasis[0][0] * activeBasis[1][1] - activeBasis[0][1] * activeBasis[1][0];

    // c = B^-1 * t
    const rawCoords = mulMatVec(invB, targetPoint);
    const roundedCoords: [number, number] = [
      Math.round(rawCoords[0]),
      Math.round(rawCoords[1]),
    ];

    // Decoded point v_hat = roundedCoords[0] * b1 + roundedCoords[1] * b2
    const decodedPoint: Vec2 = [
      roundedCoords[0] * activeBasis[0][0] + roundedCoords[1] * activeBasis[1][0],
      roundedCoords[0] * activeBasis[0][1] + roundedCoords[1] * activeBasis[1][1],
    ];

    // Distance to target
    const dx = targetPoint[0] - decodedPoint[0];
    const dy = targetPoint[1] - decodedPoint[1];
    const distance = Math.hypot(dx, dy);

    // Is it exact match to true point?
    const isSuccess =
      Math.abs(decodedPoint[0] - trueLatticePoint[0]) < 1e-4 &&
      Math.abs(decodedPoint[1] - trueLatticePoint[1]) < 1e-4;

    return {
      det,
      rawCoords,
      roundedCoords,
      decodedPoint,
      distance,
      isSuccess,
    };
  }, [activeBasis, targetPoint, trueLatticePoint]);

  // Update noise from radius slider
  const handleRadiusChange = (newRadius: number) => {
    setNoiseRadius(newRadius);
    if (newRadius === 0) {
      setNoiseVec([0, 0]);
      return;
    }
    const currentAngle = Math.atan2(noiseVec[1], noiseVec[0]) || 0.6;
    setNoiseVec([
      Math.round(Math.cos(currentAngle) * newRadius),
      Math.round(Math.sin(currentAngle) * newRadius),
    ]);
  };

  // Randomize noise vector
  const randomizeNoise = () => {
    const angle = Math.random() * Math.PI * 2;
    const r = noiseRadius || 12;
    setNoiseVec([
      Math.round(Math.cos(angle) * r),
      Math.round(Math.sin(angle) * r),
    ]);
  };

  // Run LLL Reduction simulation (resets bad basis back to good basis)
  const runLllReduction = () => {
    setBasisPreset("good");
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 360;
    const cssHeight = canvas.clientHeight || 360;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.scale(dpr, dpr);

    const originX = cssWidth / 2;
    const originY = cssHeight / 2;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Canvas background
    ctx.fillStyle = "#fcfdfd";
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Subtle coordinate grid lines
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    const gridStep = 24;
    for (let x = originX % gridStep; x < cssWidth; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssHeight);
      ctx.stroke();
    }
    for (let y = originY % gridStep; y < cssHeight; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssWidth, y);
      ctx.stroke();
    }

    // Main Axes
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(cssWidth, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, cssHeight);
    ctx.stroke();

    // Fundamental Parallelepiped around True Point or Origin
    if (showParallelepiped) {
      const b1 = activeBasis[0];
      const b2 = activeBasis[1];
      const center = trueLatticePoint;
      const ox = originX + center[0];
      const oy = originY - center[1];

      // Parallelepiped vertices: center +- 0.5*b1 +- 0.5*b2
      const p1: Vec2 = [ox - 0.5 * b1[0] - 0.5 * b2[0], oy + 0.5 * b1[1] + 0.5 * b2[1]];
      const p2: Vec2 = [ox + 0.5 * b1[0] - 0.5 * b2[0], oy - 0.5 * b1[1] + 0.5 * b2[1]];
      const p3: Vec2 = [ox + 0.5 * b1[0] + 0.5 * b2[0], oy - 0.5 * b1[1] - 0.5 * b2[1]];
      const p4: Vec2 = [ox - 0.5 * b1[0] + 0.5 * b2[0], oy + 0.5 * b1[1] - 0.5 * b2[1]];

      ctx.fillStyle = basisPreset === "good" ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.09)";
      ctx.strokeStyle = basisPreset === "good" ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.lineTo(p4[0], p4[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw all lattice points Lambda = { a*v1 + b*v2 | a,b in Z }
    ctx.fillStyle = "#64748b";
    const range = 7;
    for (let a = -range; a <= range; a++) {
      for (let b = -range; b <= range; b++) {
        const px = originX + a * baseV1[0] + b * baseV2[0];
        const py = originY - (a * baseV1[1] + b * baseV2[1]);
        if (px >= 0 && px <= cssWidth && py >= 0 && py <= cssHeight) {
          const isOrigin = a === 0 && b === 0;
          ctx.beginPath();
          ctx.arc(px, py, isOrigin ? 4 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isOrigin ? "#0f172a" : "#94a3b8";
          ctx.fill();
        }
      }
    }

    // Draw Basis Vector 1 (b1) - Emerald
    const b1 = activeBasis[0];
    const b1_x = originX + b1[0];
    const b1_y = originY - b1[1];
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(b1_x, b1_y);
    ctx.stroke();

    // Arrowhead for b1
    const angle1 = Math.atan2(-b1[1], b1[0]);
    ctx.fillStyle = "#059669";
    ctx.beginPath();
    ctx.moveTo(b1_x, b1_y);
    ctx.lineTo(b1_x - 8 * Math.cos(angle1 - Math.PI / 6), b1_y - 8 * Math.sin(angle1 - Math.PI / 6));
    ctx.lineTo(b1_x - 8 * Math.cos(angle1 + Math.PI / 6), b1_y - 8 * Math.sin(angle1 + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Draw Basis Vector 2 (b2) - Blue
    const b2 = activeBasis[1];
    const b2_x = originX + b2[0];
    const b2_y = originY - b2[1];
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(b2_x, b2_y);
    ctx.stroke();

    // Arrowhead for b2
    const angle2 = Math.atan2(-b2[1], b2[0]);
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.moveTo(b2_x, b2_y);
    ctx.lineTo(b2_x - 8 * Math.cos(angle2 - Math.PI / 6), b2_y - 8 * Math.sin(angle2 - Math.PI / 6));
    ctx.lineTo(b2_x - 8 * Math.cos(angle2 + Math.PI / 6), b2_y - 8 * Math.sin(angle2 + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label Origin
    ctx.fillStyle = "#0f172a";
    ctx.font = "10px monospace";
    ctx.fillText("(0,0)", originX + 6, originY + 14);

    // Label b1 and b2
    ctx.fillStyle = "#059669";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("b₁", b1_x + 6, b1_y - 4);
    ctx.fillStyle = "#2563eb";
    ctx.fillText("b₂", b2_x + 6, b2_y - 4);

    // True Lattice Point (P)
    const truePx = originX + trueLatticePoint[0];
    const truePy = originY - trueLatticePoint[1];
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(truePx, truePy, 7.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(truePx, truePy, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Target Vector t = P + e (Red Dot)
    const targetPx = originX + targetPoint[0];
    const targetPy = originY - targetPoint[1];

    // Noise Error vector line from P to t
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 1.75;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(truePx, truePy);
    ctx.lineTo(targetPx, targetPy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target point dot
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(targetPx, targetPy, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Label Target Point
    ctx.fillStyle = "#e11d48";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("t (Noisy)", targetPx + 8, targetPy - 6);

    // Babai Decoded Point (Estimated point v_hat)
    if (showBabaiPath) {
      const decodedPx = originX + babaiResult.decodedPoint[0];
      const decodedPy = originY - babaiResult.decodedPoint[1];

      // Draw reticle target around decoded point
      ctx.strokeStyle = babaiResult.isSuccess ? "#059669" : "#dc2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(decodedPx, decodedPy, 11, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(decodedPx - 14, decodedPy);
      ctx.lineTo(decodedPx + 14, decodedPy);
      ctx.moveTo(decodedPx, decodedPy - 14);
      ctx.lineTo(decodedPx, decodedPy + 14);
      ctx.stroke();

      // Line from Target to Decoded Guess
      ctx.strokeStyle = babaiResult.isSuccess ? "rgba(5, 150, 105, 0.7)" : "rgba(220, 38, 38, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(targetPx, targetPy);
      ctx.lineTo(decodedPx, decodedPy);
      ctx.stroke();
    }
  }, [
    activeBasis,
    baseV1,
    baseV2,
    basisPreset,
    showParallelepiped,
    showBabaiPath,
    trueLatticePoint,
    targetPoint,
    babaiResult,
  ]);

  // Mouse & Touch interaction on canvas (Drag / click / tap to reposition target point t)
  const updateTargetFromCoord = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const originX = rect.width / 2;
    const originY = rect.height / 2;

    const coordX = x - originX;
    const coordY = originY - y;

    // Relative to true lattice point
    const newNoiseX = Math.round(coordX - trueLatticePoint[0]);
    const newNoiseY = Math.round(coordY - trueLatticePoint[1]);
    setNoiseVec([newNoiseX, newNoiseY]);
    setNoiseRadius(Math.round(Math.hypot(newNoiseX, newNoiseY)));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingTarget(true);
    updateTargetFromCoord(e.clientX, e.clientY);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingTarget) return;
    updateTargetFromCoord(e.clientX, e.clientY);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingTarget(false);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (touch) {
      setIsDraggingTarget(true);
      updateTargetFromCoord(touch.clientX, touch.clientY);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!isDraggingTarget || !touch) return;
    updateTargetFromCoord(touch.clientX, touch.clientY);
  };

  const handleCanvasTouchEnd = () => {
    setIsDraggingTarget(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-semibold text-primary px-2 py-0.5 rounded-md bg-muted border border-border">
              POST-QUANTUM GEOMETRY
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              NIST FIPS 203 (ML-KEM / KYBER)
            </span>
          </div>
          <h3 className="font-sans text-[18px] font-bold text-foreground">
            2D Lattice Closest Vector Problem (CVP / LWE) Visualizer
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Interactive geometric workbench demonstrating how small Gaussian noise creates an asymmetric trapdoor between private orthogonal bases and public skewed bases.
          </p>
        </div>

        {/* Quick LLL Reduction Action */}
        {basisPreset !== "good" && (
          <button
            type="button"
            onClick={runLllReduction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[12px] font-semibold hover:bg-emerald-100 transition shadow-2xs shrink-0"
          >
            <Wand2 className="size-3.5" />
            <span>Apply LLL Reduction</span>
          </button>
        )}
      </div>

      {/* Preset Basis Switcher */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-foreground uppercase tracking-wider block">
          Lattice Basis Type (Public Key vs. Private Key Trapdoor)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setBasisPreset("good")}
            className={`p-3 rounded-xl border text-left transition ${
              basisPreset === "good"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-foreground ring-1 ring-emerald-500"
                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-foreground">Private Basis</span>
              <ShieldCheck className="size-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              Short, orthogonal vectors. Rounding decodes noise cleanly.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBasisPreset("bad")}
            className={`p-3 rounded-xl border text-left transition ${
              basisPreset === "bad"
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-foreground ring-1 ring-amber-500"
                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-foreground">Public Skewed</span>
              <ShieldAlert className="size-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              Unimodular sheared basis ($det=1$). Distorts Babai cell.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBasisPreset("extreme")}
            className={`p-3 rounded-xl border text-left transition ${
              basisPreset === "extreme"
                ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-foreground ring-1 ring-rose-500"
                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-foreground">High Skew</span>
              <Atom className="size-4 text-rose-600" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              Needle-thin parallel vectors. Decoding lands far off.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBasisPreset("custom")}
            className={`p-3 rounded-xl border text-left transition ${
              basisPreset === "custom"
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-foreground">Custom Slider</span>
              <Sliders className="size-4 text-primary" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              Adjust skew factor $k$ dynamically to watch shearing.
            </p>
          </button>
        </div>
      </div>

      {/* Main Interactive Workspace: Canvas + Live Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Visualizer Viewport */}
        <div className="lg:col-span-6 flex flex-col items-center p-4 rounded-xl bg-muted/20 border border-border space-y-3">
          <div className="relative w-full aspect-square max-w-[400px] border border-border rounded-xl overflow-hidden shadow-xs bg-white cursor-crosshair">
            <canvas
              ref={canvasRef}
              className="w-full h-full block touch-none"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onTouchCancel={handleCanvasTouchEnd}
            />
          </div>

          <div className="w-full flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Info className="size-3.5 text-primary shrink-0" />
              <span>Tap / Drag anywhere on the canvas to relocate target vector t</span>
            </span>
          </div>

          {/* Canvas Elements Legend */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono bg-card p-3 rounded-lg border border-border">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Vector b₁</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-600 shrink-0" />
              <span>Vector b₂</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border-2 border-emerald-500 bg-emerald-50 shrink-0" />
              <span>True Point P</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-600 shrink-0" />
              <span>Noisy Target t</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border border-dashed border-rose-500 shrink-0" />
              <span>Noise Error e</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Target className={`size-3 shrink-0 ${babaiResult.isSuccess ? "text-emerald-600" : "text-rose-600"}`} />
              <span>Babai Guess v̂</span>
            </span>
          </div>
        </div>

        {/* Dynamic Controls & Math Inspector */}
        <div className="lg:col-span-6 space-y-4">
          {/* Real-time Verdict Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition ${
              babaiResult.isSuccess
                ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 text-emerald-900 dark:text-emerald-300"
                : "bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 text-rose-900 dark:text-rose-300"
            }`}
          >
            {babaiResult.isSuccess ? (
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="size-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-[12.5px]">
              <span className="font-bold block text-[13.5px]">
                {babaiResult.isSuccess
                  ? "CVP / LWE Decryption Succeeded! (Private Key)"
                  : "CVP / LWE Decryption Failed! (Public Skewed Basis)"}
              </span>
              <p className="leading-relaxed">
                {babaiResult.isSuccess
                  ? `Babai's algorithm with the orthogonal basis projected the noisy target t directly onto the authentic secret lattice point (${trueCoords[0]}, ${trueCoords[1]}). The error vector is within the decoding radius.`
                  : `Due to the severe skew of the public basis, the fundamental parallelepiped is distorted into a long oblique sliver. Rounding the inverted coordinates projected onto a false distant lattice point (${babaiResult.roundedCoords[0]}, ${babaiResult.roundedCoords[1]}).`}
              </p>
            </div>
          </div>

          {/* Interactive Parameters Panel */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-4">
            <span className="font-semibold text-[13px] text-foreground block">
              Simulation Parameters & Sliders
            </span>

            {/* Noise Radius Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-foreground">Noise Magnitude ||e||:</span>
                <span className="font-mono font-semibold text-primary">{noiseRadius} px</span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                value={noiseRadius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10.5px] font-mono text-muted-foreground">
                <button
                  type="button"
                  onClick={() => handleRadiusChange(0)}
                  className="hover:text-foreground underline"
                >
                  0 (Zero Noise)
                </button>
                <button
                  type="button"
                  onClick={() => handleRadiusChange(10)}
                  className="hover:text-foreground underline"
                >
                  10 (LWE Radius)
                </button>
                <button
                  type="button"
                  onClick={() => handleRadiusChange(26)}
                  className="hover:text-foreground underline"
                >
                  26 (Excessive)
                </button>
                <button
                  type="button"
                  onClick={randomizeNoise}
                  className="flex items-center gap-1 hover:text-foreground text-primary font-semibold"
                >
                  <RefreshCw className="size-3" /> Randomize
                </button>
              </div>
            </div>

            {/* Skew Factor Slider (for Custom Preset) */}
            {(basisPreset === "custom" || basisPreset === "extreme") && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-foreground">Unimodular Skew Factor (k):</span>
                  <span className="font-mono font-semibold text-primary">k = {skewFactor}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={skewFactor}
                  onChange={(e) => setSkewFactor(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-muted-foreground">
                  Shears basis vector: $b_1 = v_1 + {skewFactor} v_2$, preserving lattice determinant $\det(\Lambda)$ while maximizing skewness.
                </p>
              </div>
            )}

            {/* Toggle Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border text-[12px]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showParallelepiped}
                  onChange={(e) => setShowParallelepiped(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span>Show Fundamental Parallelepiped 𝒫(B)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showBabaiPath}
                  onChange={(e) => setShowBabaiPath(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span>Show Babai Decoded Target</span>
              </label>
            </div>
          </div>

          {/* Mathematical Step-by-Step Breakdown */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2.5 font-mono text-[11.5px]">
            <div className="flex items-center justify-between text-foreground font-semibold border-b border-border pb-1.5">
              <span>Babai Round-Off Matrix Computation</span>
              <span className="text-[10.5px] text-muted-foreground font-normal">det(B) = {babaiResult.det}</span>
            </div>

            <div className="space-y-1 text-muted-foreground">
              <div>
                <strong className="text-foreground">Active Basis Matrix B:</strong>
                <div className="text-foreground/90 pl-2">
                  [ [{activeBasis[0][0]}, {activeBasis[1][0]}], [{activeBasis[0][1]}, {activeBasis[1][1]}] ]
                </div>
              </div>

              <div>
                <strong className="text-foreground">Target Vector t:</strong>
                <span className="text-foreground/90 ml-1.5">
                  [{targetPoint[0]}, {targetPoint[1]}] (True Point: [{trueLatticePoint[0]}, {trueLatticePoint[1]}])
                </span>
              </div>

              <div>
                <strong className="text-foreground">Continuous Coordinates (c = B⁻¹ · t):</strong>
                <div className="text-foreground/90 pl-2">
                  c₁ = {babaiResult.rawCoords[0].toFixed(3)} → ⌊c₁⌉ = {babaiResult.roundedCoords[0]}
                  <br />
                  c₂ = {babaiResult.rawCoords[1].toFixed(3)} → ⌊c₂⌉ = {babaiResult.roundedCoords[1]}
                </div>
              </div>

              <div className="pt-1 border-t border-border/70 flex items-center justify-between">
                <div>
                  <strong className="text-foreground">Decoded Vector v̂:</strong>
                  <span className="text-foreground/90 ml-1.5">
                    [{babaiResult.decodedPoint[0]}, {babaiResult.decodedPoint[1]}]
                  </span>
                </div>
                <div>
                  <strong className="text-foreground">Distance:</strong>
                  <span className="text-foreground/90 ml-1.5">{babaiResult.distance.toFixed(1)} px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Pedagogical Theory Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-[12px] leading-relaxed">
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Atom className="size-4 text-primary" />
            <span>Why Shor's Algorithm Fails</span>
          </div>
          <p className="text-muted-foreground">
            Shor's quantum algorithm uses the Quantum Fourier Transform (QFT) to find hidden periodic subgroups in 1D abelian groups (discrete logarithms & RSA factoring). High-dimensional lattices have no low-dimensional periodic trapdoor for Shor to exploit.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="size-4 text-emerald-600" />
            <span>Connection to ML-KEM (Kyber)</span>
          </div>
          <p className="text-muted-foreground">
            In NIST FIPS 203 (ML-KEM), public keys are polynomials $A \cdot s + e$ with small noise. Bob encrypts by adding error to a message point. Alice decrypts using her secret key to remove the noise and round to the nearest code point.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Compass className="size-4 text-blue-600" />
            <span>The Hardness of CVP in n = 768</span>
          </div>
          <p className="text-muted-foreground">
            While 2D lattices can be reduced in milliseconds using Gauss's algorithm, solving the Closest Vector Problem in n = 768 or 1024 dimensions requires searching through 2^O(n) vectors, proving quantum-secure.
          </p>
        </div>
      </div>
    </div>
  );
}
