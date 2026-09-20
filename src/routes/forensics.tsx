import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Eye,
  Layers,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Download,
  RotateCcw,
  Binary,
  Maximize2,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  FileSearch,
  Activity,
  Image as ImageIcon,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { addScratchpadItem } from "@/components/UniversalScratchpad";

export const Route = createFileRoute("/forensics")({
  head: () => ({
    meta: [
      {
        title: "Steganography & Digital Forensics Studio — Specimen",
      },
      {
        name: "description",
        content:
          "Interactive 8-bit plane slicer, LSB carrier injection and extraction, lossless PNG export, PSNR/MSE metrics, and file header magic byte anomaly detection.",
      },
    ],
  }),
  component: SteganographyForensicsLabComponent,
});

// Known Magic Byte Signatures Database
const FILE_SIGNATURES: { name: string; hex: string; desc: string; eof?: string }[] = [
  { name: "JPEG Image", hex: "ffd8ff", desc: "Joint Photographic Experts Group", eof: "ffd9" },
  { name: "PNG Image", hex: "89504e470d0a1a0a", desc: "Portable Network Graphics", eof: "49454e44ae426082" },
  { name: "GIF Image", hex: "47494638", desc: "Graphics Interchange Format", eof: "003b" },
  { name: "PDF Document", hex: "25504446", desc: "Adobe Portable Document Format", eof: "2525454f46" },
  { name: "ZIP Archive", hex: "504b0304", desc: "PKZip Compressed Archive" },
  { name: "GZIP Compressed", hex: "1f8b", desc: "GNU zip archive" },
  { name: "7-Zip Archive", hex: "377abcaf271c", desc: "7-Zip File Format" },
  { name: "Windows PE / EXE", hex: "4d5a", desc: "DOS MZ / Windows Portable Executable" },
  { name: "Linux ELF", hex: "7f454c46", desc: "Executable and Linkable Format" },
];

// Helper to generate high-detail procedural test targets
function generateProceduralTarget(type: "geometric" | "spectrum"): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  if (type === "geometric") {
    // High-frequency concentric circles, radial rays & gradients
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(0.5, "#64748b");
    grad.addColorStop(1, "#f8fafc");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    for (let r = 10; r <= 190; r += 12) {
      ctx.beginPath();
      ctx.arc(200, 200, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.beginPath();
      ctx.moveTo(200, 200);
      ctx.lineTo(200 + Math.cos(a) * 190, 200 + Math.sin(a) * 190);
      ctx.stroke();
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px monospace";
    ctx.fillText("SPECIMEN · OPTICAL TARGET", 80, 205);
  } else {
    // RGB Color spectrum ramp
    for (let x = 0; x < 400; x++) {
      for (let y = 0; y < 400; y++) {
        const r = Math.floor((x / 400) * 255);
        const g = Math.floor((y / 400) * 255);
        const b = Math.floor(((x + y) / 800) * 255);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  return canvas.toDataURL("image/png");
}

function SteganographyForensicsLabComponent() {
  const [activeTab, setActiveTab] = useState<"planes" | "lsb" | "file">("planes");

  return (
    <div className="mt-2 w-full space-y-4 pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-primary bg-muted px-2 py-0.2 rounded-md border border-border">
              Digital Forensics & Steganography
            </span>
            <span className="rounded-md bg-muted px-2 py-0.2 font-mono text-[9.5px] text-muted-foreground border border-border">
              Spatial & Structural Inspection
            </span>
          </div>
          <h1 className="mt-0.5 font-display text-[22px] sm:text-[26px] font-bold tracking-tight text-foreground">
            Steganography & Forensics Studio
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground max-w-2xl">
            Interactive bit-plane slicing, spatial LSB carrier injection & lossless PNG extraction,
            imperceptibility difference heatmaps, and file header magic byte anomaly detection.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-lg bg-muted/60 p-0.5 border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("planes")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer ${
              activeTab === "planes"
                ? "bg-card text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Bit-Plane Slicer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lsb")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer ${
              activeTab === "lsb"
                ? "bg-card text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Binary className="size-3.5" />
            <span>LSB Embedder & Extractor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer ${
              activeTab === "file"
                ? "bg-card text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSearch className="size-3.5" />
            <span>File & Magic Bytes</span>
          </button>
        </div>
      </div>

      {activeTab === "planes" && <BitPlaneSlicer />}
      {activeTab === "lsb" && <LSBStudio />}
      {activeTab === "file" && <FileForensicsInspector />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Bit-Plane Slicer
// ---------------------------------------------------------------------------
function BitPlaneSlicer() {
  const [selectedPlane, setSelectedPlane] = useState<number>(0); // 0 (LSB) to 7 (MSB)
  const [selectedChannel, setSelectedChannel] = useState<"all" | "r" | "g" | "b">("all");
  const [imageSrc, setImageSrc] = useState<string>("/logo.png");
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; name: string }>({
    width: 0,
    height: 0,
    name: "Default Specimen Emblem",
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Re-slice when image, plane, or channel changes
  useEffect(() => {
    let active = true;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Limit max processing dimensions to maintain high frame rates
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      canvas.width = w;
      canvas.height = h;
      setImageMeta((prev) => ({ ...prev, width: w, height: h }));

      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const bitMask = 1 << selectedPlane;

      for (let i = 0; i < data.length; i += 4) {
        const d0 = data[i] ?? 0;
        const d1 = data[i + 1] ?? 0;
        const d2 = data[i + 2] ?? 0;

        let bitVal = 0;
        if (selectedChannel === "r") {
          bitVal = (d0 & bitMask) ? 255 : 0;
          data[i] = bitVal;
          data[i + 1] = 0;
          data[i + 2] = 0;
        } else if (selectedChannel === "g") {
          bitVal = (d1 & bitMask) ? 255 : 0;
          data[i] = 0;
          data[i + 1] = bitVal;
          data[i + 2] = 0;
        } else if (selectedChannel === "b") {
          bitVal = (d2 & bitMask) ? 255 : 0;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = bitVal;
        } else {
          // Standard ITU-R BT.601 perceptual luminance
          const luma = 0.299 * d0 + 0.587 * d1 + 0.114 * d2;
          bitVal = (Math.round(luma) & bitMask) ? 255 : 0;
          data[i] = bitVal;
          data[i + 1] = bitVal;
          data[i + 2] = bitVal;
        }
        data[i + 3] = 255; // Force solid alpha for clear visibility
      }

      ctx.putImageData(imgData, 0, 0);
      setIsProcessing(false);
    };

    img.onerror = () => {
      // Fallback to geometric target if asset fails
      const fallback = generateProceduralTarget("geometric");
      setImageSrc(fallback);
      setImageMeta({ width: 400, height: 400, name: "Geometric Calibration Target" });
      setIsProcessing(false);
    };

    return () => {
      active = false;
    };
  }, [imageSrc, selectedPlane, selectedChannel]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImageSrc(event.target.result);
        setImageMeta({ width: 0, height: 0, name: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const loadPreset = (preset: "emblem" | "geometric" | "spectrum") => {
    if (preset === "emblem") {
      setImageSrc("/logo.png");
      setImageMeta({ width: 0, height: 0, name: "Specimen Emblem Logo" });
    } else if (preset === "geometric") {
      const url = generateProceduralTarget("geometric");
      setImageSrc(url);
      setImageMeta({ width: 400, height: 400, name: "Concentric Optical Target" });
    } else {
      const url = generateProceduralTarget("spectrum");
      setImageSrc(url);
      setImageMeta({ width: 400, height: 400, name: "RGB Spectral Gradient" });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Educational Guide Box */}
      <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5">
          <Info className="size-3.5 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            How Bit-Plane Slicing Works & What It Demonstrates
          </h2>
        </div>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
          Every 8-bit color byte is composed of eight binary digits representing powers of two:{" "}
          <code className="bg-muted px-1 py-0.2 rounded font-mono text-foreground font-semibold">
            b7·2⁷ + b6·2⁶ + ... + b1·2¹ + b0·2⁰
          </code>
          . Slicing decomposes the visual image into eight separate binary planes:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 space-y-1">
            <span className="font-bold text-foreground font-mono text-[11px] block">
              Bit 0 (Least Significant Bit - LSB):
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Carries a visual weight of only 1/256 (0.39% of total luminance). In natural images, Bit 0
              is indistinguishable from white noise. Cryptanalysts exploit this to hide secret payloads.
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 space-y-1">
            <span className="font-bold text-foreground font-mono text-[11px] block">
              Bit 7 (Most Significant Bit - MSB):
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Carries a visual weight of 128/256 (50.0% of total luminance). Bit 7 outlines the
              macroscopic geometry, edges, and contrast silhouettes of the carrier.
            </p>
          </div>
        </div>
      </div>

      {/* Control Strip & Upload Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 rounded-xl bg-card border border-border p-3.5">
        {/* Bit Plane Selector (0 to 7) */}
        <div className="lg:col-span-5 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-semibold text-muted-foreground uppercase">
            <span>Bit Plane Level</span>
            <span className="font-mono text-primary font-bold">
              Bit {selectedPlane} {selectedPlane === 0 ? "(LSB - Noise)" : selectedPlane === 7 ? "(MSB - Silhouette)" : `(Weight: ${1 << selectedPlane})`}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPlane(p)}
                className={`rounded-md py-2 sm:py-1.5 text-xs font-mono transition cursor-pointer ${
                  selectedPlane === p
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            Toggling between 0 and 7 illustrates the transition from random entropy to spatial silhouette.
          </span>
        </div>

        {/* Channel Filter */}
        <div className="lg:col-span-3 space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase">Color Channel</div>
          <div className="grid grid-cols-4 gap-1">
            {(["all", "r", "g", "b"] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                className={`rounded-md py-1.5 text-xs font-mono uppercase transition cursor-pointer ${
                  selectedChannel === ch
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                }`}
              >
                {ch === "all" ? "Luma" : ch}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            Isolate Red, Green, Blue, or Luma.
          </span>
        </div>

        {/* Upload Custom Image & Presets */}
        <div className="lg:col-span-4 space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Carrier Presets:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => loadPreset("emblem")}
                className="text-[10px] font-mono px-2 py-0.2 rounded bg-muted hover:bg-muted/80 text-foreground border border-border transition cursor-pointer"
              >
                Emblem
              </button>
              <button
                type="button"
                onClick={() => loadPreset("geometric")}
                className="text-[10px] font-mono px-2 py-0.2 rounded bg-muted hover:bg-muted/80 text-foreground border border-border transition cursor-pointer"
              >
                Target
              </button>
              <button
                type="button"
                onClick={() => loadPreset("spectrum")}
                className="text-[10px] font-mono px-2 py-0.2 rounded bg-muted hover:bg-muted/80 text-foreground border border-border transition cursor-pointer"
              >
                Spectrum
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="image/png, image/jpeg, image/webp, image/bmp"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted hover:bg-muted/80 py-1.5 text-xs font-semibold text-foreground transition cursor-pointer shadow-2xs"
          >
            <Upload className="size-3" />
            <span>Upload Custom Image</span>
          </button>
        </div>
      </div>

      {/* Sliced Output Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Source Specimen */}
        <div className="rounded-xl bg-card border border-border p-3.5 space-y-2 flex flex-col items-center shadow-2xs">
          <div className="flex items-center justify-between w-full">
            <span className="text-[11.5px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <ImageIcon className="size-3 text-primary" />
              <span>Original Source Carrier</span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
              {imageMeta.name} {imageMeta.width ? `(${imageMeta.width}×${imageMeta.height})` : ""}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 rounded-lg bg-muted/20 border border-border/70 w-full overflow-hidden min-h-[220px]">
            <img
              src={imageSrc}
              alt="Source"
              className="max-h-[200px] max-w-full object-contain rounded shadow-2xs"
            />
          </div>
        </div>

        {/* Sliced Bit-Plane Canvas */}
        <div className="rounded-xl bg-card border border-border p-3.5 space-y-2 flex flex-col items-center shadow-2xs">
          <div className="flex items-center justify-between w-full">
            <span className="text-[11.5px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Layers className="size-3 text-primary" />
              <span>Isolated Bit Plane {selectedPlane} ({selectedChannel.toUpperCase()})</span>
            </span>
            <span className="font-mono text-[9.5px] px-1.5 py-0.2 rounded bg-muted text-foreground border border-border font-bold">
              {isProcessing ? "Processing..." : "0 or 255"}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 rounded-lg bg-muted/20 border border-border/70 w-full overflow-hidden min-h-[220px]">
            <canvas
              ref={canvasRef}
              className="max-h-[200px] max-w-full object-contain rounded shadow-2xs bg-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. LSB Embedder & Extractor
// ---------------------------------------------------------------------------
function LSBStudio() {
  const [secretMessage, setSecretMessage] = useState<string>("FLAG{LSB_CARRIER_INJECTION_VERIFIED_1337}");
  const [extractedMessage, setExtractedMessage] = useState<string>("");
  const [extractStatus, setExtractStatus] = useState<"idle" | "success" | "none">("idle");
  const [carrierSrc, setCarrierSrc] = useState<string>("/logo.png");
  const [carrierName, setCarrierName] = useState<string>("Default Specimen Emblem");
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);
  const [psnr, setPsnr] = useState<number | null>(null);
  const [mse, setMse] = useState<number | null>(null);
  const [carrierDims, setCarrierDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stegoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const extractFileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize and draw carrier image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = carrierSrc;

    img.onload = () => {
      const orig = originalCanvasRef.current;
      const stego = stegoCanvasRef.current;
      const diff = diffCanvasRef.current;
      if (!orig || !stego || !diff) return;

      // Limit max size to 800px for instant responsive canvas manipulation
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      setCarrierDims({ w, h });

      orig.width = w;
      orig.height = h;
      stego.width = w;
      stego.height = h;
      diff.width = w;
      diff.height = h;

      const oCtx = orig.getContext("2d");
      const sCtx = stego.getContext("2d");
      const dCtx = diff.getContext("2d");
      if (!oCtx || !sCtx || !dCtx) return;

      oCtx.drawImage(img, 0, 0, w, h);
      sCtx.drawImage(img, 0, 0, w, h);
      dCtx.fillStyle = "#000000";
      dCtx.fillRect(0, 0, w, h);

      setIsEmbedded(false);
      setPsnr(null);
      setMse(null);
      setExtractedMessage("");
      setExtractStatus("idle");
    };

    img.onerror = () => {
      const fallback = generateProceduralTarget("geometric");
      setCarrierSrc(fallback);
      setCarrierName("Geometric Calibration Target");
    };
  }, [carrierSrc]);

  // Handle custom carrier image upload
  const handleCarrierUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setCarrierSrc(e.target.result);
        setCarrierName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Embed secret into LSB of Red, Green, Blue channels with magic header & 32-bit length
  const handleEmbed = () => {
    const orig = originalCanvasRef.current;
    const stego = stegoCanvasRef.current;
    const diff = diffCanvasRef.current;
    if (!orig || !stego || !diff) return;

    const oCtx = orig.getContext("2d");
    const sCtx = stego.getContext("2d");
    const dCtx = diff.getContext("2d");
    if (!oCtx || !sCtx || !dCtx) return;

    const origData = oCtx.getImageData(0, 0, orig.width, orig.height);
    const stegoData = sCtx.getImageData(0, 0, stego.width, stego.height);
    const diffData = dCtx.createImageData(orig.width, orig.height);

    // Convert string to bytes with 32-bit magic header 'STEG' (0x53, 0x54, 0x45, 0x47) + 32-bit length
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(secretMessage);
    const totalBytesLen = payloadBytes.length;

    const bits: number[] = [];
    // 32-bit Magic Header 'STEG'
    const magic = [0x53, 0x54, 0x45, 0x47];
    for (const m of magic) {
      for (let b = 7; b >= 0; b--) {
        bits.push((m >> b) & 1);
      }
    }

    // 32-bit length prefix
    for (let b = 31; b >= 0; b--) {
      bits.push((totalBytesLen >> b) & 1);
    }

    // Payload bits
    for (let i = 0; i < payloadBytes.length; i++) {
      const byte = payloadBytes[i] ?? 0;
      for (let b = 7; b >= 0; b--) {
        bits.push((byte >> b) & 1);
      }
    }

    const totalSamples = orig.width * orig.height * 3;
    if (bits.length > totalSamples) {
      alert(`Message too large! Needs ${bits.length} carrier bits, but image capacity is ${totalSamples} bits.`);
      return;
    }

    let bitIdx = 0;
    let sumSqDiff = 0;

    for (let i = 0; i < stegoData.data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const oldVal = origData.data[i + c] ?? 0;
        if (bitIdx < bits.length) {
          const bit = bits[bitIdx] ?? 0;
          const newVal = (oldVal & ~1) | bit;
          stegoData.data[i + c] = newVal;
          bitIdx++;

          const delta = Math.abs(newVal - oldVal);
          sumSqDiff += delta * delta;

          // Diff mask: amplify 1-bit difference to 255 (bright red)
          if (c === 0) diffData.data[i] = delta * 255;
          if (c === 1) diffData.data[i + 1] = delta * 255;
          if (c === 2) diffData.data[i + 2] = delta * 255;
        } else {
          stegoData.data[i + c] = oldVal;
          diffData.data[i + c] = 0;
        }
      }
      diffData.data[i + 3] = 255; // Alpha
    }

    sCtx.putImageData(stegoData, 0, 0);
    dCtx.putImageData(diffData, 0, 0);
    setIsEmbedded(true);

    const computedMse = sumSqDiff / totalSamples;
    setMse(computedMse);

    if (computedMse === 0) {
      setPsnr(99.99);
    } else {
      const computedPsnr = 10 * Math.log10((255 * 255) / computedMse);
      setPsnr(computedPsnr);
    }
  };

  // Download stego image as lossless PNG
  const handleDownloadStego = () => {
    const stego = stegoCanvasRef.current;
    if (!stego) return;
    const url = stego.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `stego_${carrierName.replace(/\.[^/.]+$/, "")}.png`;
    a.click();
  };

  // Extract from the active stego canvas
  const handleExtractFromCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Helper to read bits sequentially from RGB channels
    const readBits = (count: number, startBit: number): number[] => {
      const out: number[] = [];
      for (let i = 0; i < count; i++) {
        const globalBit = startBit + i;
        const pixelIdx = Math.floor(globalBit / 3) * 4;
        const channelOffset = globalBit % 3;
        const val = data[pixelIdx + channelOffset] ?? 0;
        out.push(val & 1);
      }
      return out;
    };

    // Check 32-bit Magic Header 'STEG'
    const magicBits = readBits(32, 0);
    const magicBytes: number[] = [];
    for (let i = 0; i < 4; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | (magicBits[i * 8 + j] ?? 0);
      }
      magicBytes.push(b);
    }

    const isMagicValid =
      magicBytes[0] === 0x53 &&
      magicBytes[1] === 0x54 &&
      magicBytes[2] === 0x45 &&
      magicBytes[3] === 0x47;

    if (!isMagicValid) {
      setExtractedMessage("No valid Specimen LSB magic header ('STEG') detected in this carrier image.");
      setExtractStatus("none");
      return;
    }

    // Read 32-bit length prefix
    const lenBits = readBits(32, 32);
    let len = 0;
    for (let i = 0; i < 32; i++) {
      len = (len << 1) | (lenBits[i] ?? 0);
    }

    if (len <= 0 || len > 500000) {
      setExtractedMessage("Invalid payload length header.");
      setExtractStatus("none");
      return;
    }

    // Read payload bytes
    const payloadBits = readBits(len * 8, 64);
    const payloadBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | (payloadBits[i * 8 + j] ?? 0);
      }
      payloadBytes[i] = b;
    }

    const decoder = new TextDecoder();
    const recoveredText = decoder.decode(payloadBytes);
    setExtractedMessage(recoveredText);
    setExtractStatus("success");
  };

  // Upload an external image directly for extraction
  const handleUploadForExtraction = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const ctx = tempCanvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          handleExtractFromCanvas(tempCanvas);
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const copyExtracted = () => {
    navigator.clipboard.writeText(extractedMessage);
  };

  return (
    <div className="space-y-6">
      {/* Theory & Operational Guide */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            How Spatial LSB Steganography & Verification Work
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Spatial Least Significant Bit (LSB) substitution is a fundamental data hiding technique where
          the lowest-order bit of each color byte is modified to carry a binary message stream:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="font-bold text-foreground font-mono block">1. Bitwise Masking:</span>
            <p className="text-muted-foreground leading-relaxed">
              The original byte <code className="text-foreground">x</code> is masked via{" "}
              <code className="bg-background px-1 py-0.5 rounded font-mono text-foreground">
                x' = (x &amp; ~1) | bit
              </code>
              . This introduces a maximum numerical change of ±1 out of 255 per color channel.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="font-bold text-foreground font-mono block">2. Header Architecture:</span>
            <p className="text-muted-foreground leading-relaxed">
              To guarantee lossless extraction, our embedder prepends a 32-bit magic header{" "}
              <code className="text-foreground font-mono">0x53544547 ('STEG')</code> followed by a 32-bit
              length prefix before writing the UTF-8 payload.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="font-bold text-foreground font-mono block">3. Fidelity Metrics (PSNR):</span>
            <p className="text-muted-foreground leading-relaxed">
              Peak Signal-to-Noise Ratio (PSNR) evaluates imperceptibility:{" "}
              <code className="bg-background px-1 py-0.5 rounded font-mono text-foreground">
                PSNR = 10 · log₁₀(255² / MSE)
              </code>
              . Any value exceeding 50.0 dB is considered mathematically invisible to the human eye.
            </p>
          </div>
        </div>
      </div>

      {/* Embedding Controls & Image Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl bg-card border border-border p-5">
        {/* Secret Message Input */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase">
            <span>Secret Payload to Inject</span>
            <span className="font-mono text-primary font-bold">
              {secretMessage.length} bytes ({(secretMessage.length * 8) + 64} bits with headers)
            </span>
          </div>
          <textarea
            rows={2}
            value={secretMessage}
            onChange={(e) => setSecretMessage(e.target.value)}
            className="w-full rounded-xl bg-background border border-border p-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Type confidential payload to embed into carrier LSBs..."
          />
        </div>

        {/* Carrier Controls & Upload */}
        <div className="lg:col-span-6 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Carrier Image: <span className="font-mono text-foreground lowercase">{carrierName}</span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {carrierDims.w ? `${carrierDims.w}×${carrierDims.h} px` : ""}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleCarrierUpload(e.target.files[0])}
            accept="image/png, image/jpeg, image/webp, image/bmp"
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted hover:bg-muted/80 py-2.5 text-xs font-medium text-foreground transition cursor-pointer"
            >
              <Upload className="size-3.5" />
              <span>Upload Carrier</span>
            </button>

            <button
              type="button"
              onClick={handleEmbed}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground py-2.5 text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-xs"
            >
              <Lock className="size-3.5" />
              <span>Embed LSB Payload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (When Embedded) */}
      {isEmbedded && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">
                Peak Signal-to-Noise Ratio
              </span>
              <div className="text-xl font-bold font-mono text-emerald-600">
                {psnr ? `${psnr.toFixed(2)} dB` : "—"}
              </div>
            </div>
            <Activity className="size-6 text-emerald-500" />
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">
                Mean Squared Error (MSE)
              </span>
              <div className="text-xl font-bold font-mono text-foreground">
                {mse !== null ? mse.toFixed(6) : "—"}
              </div>
            </div>
            <Sliders className="size-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">
                Optical Imperceptibility
              </span>
              <div className="text-sm font-bold font-mono text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="size-4" /> Near Perfect (&gt;50 dB)
              </div>
            </div>
            <ShieldCheck className="size-6 text-emerald-500" />
          </div>
        </div>
      )}

      {/* Tri-View Canvases: Original vs Stego vs Diff Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-card border border-border p-4 space-y-2 flex flex-col items-center shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase self-start">
            1. Original Carrier Image
          </span>
          <div className="flex-1 flex items-center justify-center p-2 rounded-xl bg-muted/20 border border-border/70 w-full min-h-[220px]">
            <canvas ref={originalCanvasRef} className="max-h-[200px] max-w-full object-contain rounded shadow-2xs" />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-2 flex flex-col items-center shadow-xs">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              2. Stego-Image (LSB Modified)
            </span>
            {isEmbedded && (
              <button
                type="button"
                onClick={handleDownloadStego}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 transition cursor-pointer"
                title="Download Lossless PNG"
              >
                <Download className="size-3" />
                <span>Save PNG</span>
              </button>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center p-2 rounded-xl bg-muted/20 border border-border/70 w-full min-h-[220px]">
            <canvas ref={stegoCanvasRef} className="max-h-[200px] max-w-full object-contain rounded shadow-2xs" />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-2 flex flex-col items-center shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase self-start">
            3. Difference Heatmap (Amplified 255×)
          </span>
          <div className="flex-1 flex items-center justify-center p-2 rounded-xl bg-muted/20 border border-border/70 w-full min-h-[220px]">
            <canvas ref={diffCanvasRef} className="max-h-[200px] max-w-full object-contain rounded shadow-2xs bg-black" />
          </div>
        </div>
      </div>

      {/* Extraction Workbench Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Unlock className="size-4 text-primary" />
              <span>Extraction Workbench</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Extract payloads directly from the live stego canvas, or upload an external PNG file to verify roundtrip extraction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={extractFileInputRef}
              onChange={(e) => e.target.files?.[0] && handleUploadForExtraction(e.target.files[0])}
              accept="image/png, image/webp, image/bmp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => extractFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition cursor-pointer"
            >
              <Upload className="size-3.5" />
              <span>Extract from External File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (stegoCanvasRef.current) {
                  handleExtractFromCanvas(stegoCanvasRef.current);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs"
            >
              <Unlock className="size-3.5" />
              <span>Extract from Active Canvas</span>
            </button>
          </div>
        </div>

        {/* Extraction Result Box */}
        {extractStatus !== "idle" && (
          <div
            className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
              extractStatus === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {extractStatus === "success" ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <HelpCircle className="size-4 text-amber-600" />
                )}
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  {extractStatus === "success" ? "Valid Payload Recovered" : "Extraction Result"}
                </span>
              </div>

              {extractStatus === "success" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyExtracted}
                    className="flex items-center gap-1 text-[10.5px] text-foreground hover:underline cursor-pointer"
                  >
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addScratchpadItem("Extracted Stego Payload", extractedMessage, "text")}
                    className="text-[10.5px] text-primary hover:underline cursor-pointer"
                  >
                    Send to Scratchpad
                  </button>
                </div>
              )}
            </div>

            <pre className="p-3 bg-card/80 border border-border/60 rounded-lg text-foreground whitespace-pre-wrap break-all text-xs font-mono">
              {extractedMessage}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. File Structure & Magic Byte Inspector
// ---------------------------------------------------------------------------
function FileForensicsInspector() {
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    size: number;
    hexHead: string;
    hexTail: string;
    matchedSig?: { name: string; desc: string } | undefined;
    hasAppendedData: boolean;
    appendedBytes: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;

      const bytes = new Uint8Array(buffer);
      const headBytes = bytes.slice(0, 32);
      const tailBytes = bytes.slice(Math.max(0, bytes.length - 32));

      const hexHead = Array.from(headBytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const hexTail = Array.from(tailBytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const headHexStr = Array.from(headBytes).map((b) => b.toString(16).padStart(2, "0")).join("");

      // Match signature
      const matched = FILE_SIGNATURES.find((sig) => headHexStr.startsWith(sig.hex));

      // Check EOF steganography
      let hasAppended = false;
      let appendedBytes = 0;
      if (matched?.eof) {
        const fullHexStr = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
        const eofIdx = fullHexStr.lastIndexOf(matched.eof);
        if (eofIdx !== -1) {
          const eofBytePos = (eofIdx + matched.eof.length) / 2;
          if (eofBytePos < bytes.length) {
            hasAppended = true;
            appendedBytes = bytes.length - eofBytePos;
          }
        }
      }

      setFileMeta({
        name: file.name,
        size: file.size,
        hexHead,
        hexTail,
        matchedSig: matched ? { name: matched.name, desc: matched.desc } : undefined,
        hasAppendedData: hasAppended,
        appendedBytes,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      {/* Educational Guide Box */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            How File Magic Bytes & EOF Delimiters Work
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Operating systems and security scanners verify file formats not by their extension (.png, .pdf),
          but by examining constant sequence bytes located at the absolute beginning (magic header) and end (trailer):
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="font-bold text-foreground font-mono block">Magic Byte Signatures:</span>
            <p className="text-muted-foreground leading-relaxed">
              For example, PNG files always begin with <code className="text-foreground font-mono">89 50 4E 47 0D 0A 1A 0A</code>.
              Malicious actors often mask file types by altering extensions (e.g. naming an executable .jpg).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-1.5">
            <span className="font-bold text-foreground font-mono block">Appended EOF Steganography (Polyglots):</span>
            <p className="text-muted-foreground leading-relaxed">
              Standard file parsers stop reading immediately after encountering the EOF marker (e.g., PNG <code className="text-foreground font-mono">IEND</code> chunk).
              Appending a ZIP archive or shellcode past this boundary produces a file that displays normally as an image but unpacks as a hidden archive when passed to unzippers.
            </p>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 hover:border-primary/50 transition bg-card cursor-pointer group shadow-xs"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        <FileSearch className="size-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
        <p className="text-sm font-semibold text-foreground">
          Click or drag any file to analyze magic bytes & structural headers
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Supports JPEG, PNG, GIF, PDF, ZIP, ELF, and Windows PE binaries.
        </p>
      </div>

      {/* Results */}
      {fileMeta && (
        <div className="space-y-5 rounded-2xl bg-card border border-border p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-2">
            <div>
              <div className="font-bold text-foreground text-base">{fileMeta.name}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {(fileMeta.size / 1024).toFixed(2)} KB ({fileMeta.size.toLocaleString()} bytes)
              </div>
            </div>

            {fileMeta.matchedSig ? (
              <span className="font-mono text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold self-start sm:self-auto">
                {fileMeta.matchedSig.name} Signature
              </span>
            ) : (
              <span className="font-mono text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold self-start sm:self-auto">
                Unknown Binary Format
              </span>
            )}
          </div>

          {/* Steganography Appended Warning */}
          {fileMeta.hasAppendedData ? (
            <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-800 dark:text-rose-300">
              <ShieldAlert className="size-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm block">Structural Anomaly: Appended Payload Detected!</strong>
                <p className="mt-1 leading-relaxed">
                  This file contains <strong>{fileMeta.appendedBytes.toLocaleString()} bytes</strong> of data
                  trailing past the official End-of-File (EOF) marker. In cybersecurity forensics, this strongly indicates an
                  appended secret payload, polyglot archive, or malware overlay.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong>Clean Structural Bounds:</strong> No trailing bytes detected past the EOF delimiter.
              </div>
            </div>
          )}

          {/* Hex Dumps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="space-y-1.5 p-3.5 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10.5px] uppercase text-muted-foreground font-semibold block">
                Header Bytes (Magic Signature)
              </span>
              <div className="text-foreground tracking-wider break-all">{fileMeta.hexHead}</div>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10.5px] uppercase text-muted-foreground font-semibold block">
                Trailer Bytes (End of File)
              </span>
              <div className="text-foreground tracking-wider break-all">{fileMeta.hexTail}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
