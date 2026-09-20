import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Search,
  X,
  BookOpen,
  Wrench,
  Hash,
  Sparkles,
  Bot,
  ArrowRight,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Calculator,
  Compass,
  Trophy,
  Activity,
  Keyboard,
  ClipboardPlus,
  ChevronDown,
} from "lucide-react";
import { lessons, tracks, glossary } from "../content";
import { tools } from "../lib/tools";
import { challenges } from "../content/challenges";
import {
  evaluateCryptoMath,
  queryKnowledgeBase,
  type AssistantInsight,
} from "../lib/assistant";
import { inspectFormat } from "../lib/detector";
import { UniversalScratchpad, addScratchpadItem } from "@/components/UniversalScratchpad";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { MobileNavDock } from "@/components/MobileNavDock";

const ATTACK_LABS = [
  {
    id: "ecb",
    name: 'The ECB "Penguin" Flaw Visualizer',
    desc: "Why Electronic Codebook preserves macroscopic patterns and fails semantic security.",
    tag: "Structural Leakage",
    url: "/attacks",
  },
  {
    id: "cbc",
    name: "CBC Bit-Flipping Exploit Simulator",
    desc: "Active malleability in CBC decryption altering plaintext roles without knowing the secret key.",
    tag: "Malleability Attack",
    url: "/attacks",
  },
  {
    id: "dh",
    name: "Diffie-Hellman MITM Interceptor",
    desc: "Three-party simulation of active key substitution in unauthenticated DH exchanges.",
    tag: "Protocol Interception",
    url: "/attacks",
  },
  {
    id: "freq",
    name: "Frequency Analysis & Substitution Desk",
    desc: "Real-time Index of Coincidence (IC) and interactive monoalphabetic ciphertext cryptanalysis.",
    tag: "Cryptanalysis",
    url: "/attacks",
  },
  {
    id: "lattice",
    name: "2D Lattice Closest Vector Problem (CVP / LWE)",
    desc: "Interactive LWE lattice geometry: private orthogonal vs. public skewed basis decoding.",
    tag: "Post-Quantum",
    url: "/attacks",
  },
  {
    id: "tls",
    name: "TLS 1.3 Handshake & Packet Inspector",
    desc: "1-RTT handshake protocol, HKDF key schedule derivation, and MITM byte-flipping AEAD integrity check.",
    tag: "Protocol Security",
    url: "/handshake",
  },
  {
    id: "zkp",
    name: "Zero-Knowledge Proofs (ZKP) Playground",
    desc: "Schnorr 3-move identification (honest vs imposter) and interactive Graph 3-Coloring rounds.",
    tag: "Zero-Knowledge",
    url: "/zkp",
  },
  {
    id: "shamir",
    name: "Shamir (k, n) Threshold Secret Sharing",
    desc: "Interactive 2D polynomial plotting over GF(257), under-threshold secrecy, and Lagrange interpolation.",
    tag: "Threshold Crypto",
    url: "/tools/shamir-secret-sharing",
  },
  {
    id: "pqc",
    name: "Post-Quantum Lattice Studio (ML-KEM & ML-DSA)",
    desc: "FIPS 203 Kyber encapsulation, noise failure threshold, and FIPS 204 Dilithium rejection sampling.",
    tag: "Post-Quantum",
    url: "/pqc",
  },
  {
    id: "forensics",
    name: "Steganography & Digital Forensics Studio",
    desc: "8-bit plane slicer, LSB carrier injection & extraction, PSNR/MSE metrics, and file header inspection.",
    tag: "Forensics",
    url: "/forensics",
  },
  {
    id: "pipeline",
    name: "Crypto Pipeline Studio",
    desc: "Sequential multi-stage cipher & transform workbench with live intermediate entropy.",
    tag: "Workbench",
    url: "/pipeline",
  },
  {
    id: "benchmark",
    name: "Cryptographic Benchmark & SAC Arena",
    desc: "Browser hardware execution speeds & 128-bit Strict Avalanche Criterion matrix.",
    tag: "Benchmark",
    url: "/benchmark",
  },
  {
    id: "flashcards",
    name: "Spaced-Repetition Study Flashcards",
    desc: "60+ mathematically rigorous flashcards covering all 8 Stallings curriculum tracks.",
    tag: "Active Recall",
    url: "/flashcards",
  },
  {
    id: "notebook",
    name: "Lab Notebook & Cryptanalyst Ranking",
    desc: "Track completed curriculum, audit Cryptanalyst ranking, and generate verifiable SHA-256 certificates.",
    tag: "Portfolio",
    url: "/notebook",
  },
];

const STANDARDS = [
  {
    name: "AES-256-GCM",
    category: "AEAD",
    desc: "Industry standard hardware-accelerated authenticated symmetric encryption.",
    url: "/matrix",
  },
  {
    name: "ChaCha20-Poly1305",
    category: "AEAD",
    desc: "High-performance software AEAD cipher for devices lacking AES-NI.",
    url: "/matrix",
  },
  {
    name: "ML-KEM-768 (Kyber)",
    category: "Post-Quantum KEM",
    desc: "NIST FIPS 203 primary lattice-based key encapsulation standard.",
    url: "/matrix",
  },
  {
    name: "ML-DSA-65 (Dilithium)",
    category: "Signature",
    desc: "NIST FIPS 204 primary lattice-based post-quantum digital signature.",
    url: "/matrix",
  },
  {
    name: "Ed25519",
    category: "Signature",
    desc: "Edwards-curve digital signature algorithm resisting side-channel timing attacks.",
    url: "/matrix",
  },
  {
    name: "Argon2id",
    category: "Password KDF",
    desc: "RFC 9106 memory-hard password hashing standard resisting GPU/ASIC attacks.",
    url: "/matrix",
  },
];

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-[22px] bg-card p-6 text-center ring-1 ring-border shadow-sm">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">page missing</p>
        <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight">This page isn't in the notebook</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          The lesson or converter you asked for doesn't exist.
        </p>
        <Link
          to="/"
          className="clay mt-5 inline-flex items-center justify-center rounded-[12px] bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
        >
          Back to the index
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-[22px] bg-card p-6 text-center ring-1 ring-border shadow-sm">
        <h1 className="font-display text-[20px] font-semibold tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Something went wrong. Try again, or head back to the index.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="clay inline-flex items-center justify-center rounded-[12px] bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-[12px] bg-background px-4 py-2.5 text-[13px] font-medium text-foreground ring-1 ring-border"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function GlobalSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [insight, setInsight] = useState<AssistantInsight | null>(null);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Evaluate query with Assistant engine
  useEffect(() => {
    if (!query.trim()) {
      setInsight(null);
      return;
    }

    let active = true;
    startTransition(() => {
      evaluateCryptoMath(query).then((res) => {
        if (!active) return;
        if (res) {
          setInsight(res);
        } else {
          const kbRes = queryKnowledgeBase(query);
          setInsight(kbRes);
        }
      });
    });

    return () => {
      active = false;
    };
  }, [query]);

  const q = query.toLowerCase().trim();

  // Instant Format and Shannon Entropy Auto-Detection (must be called unconditionally)
  const formatDetection = useMemo(() => {
    if (!open || !q || q.length < 2) return null;
    return inspectFormat(query);
  }, [open, query, q]);

  if (!open) return null;

  const handleCopyOutput = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter lessons
  const matchingLessons = q
    ? lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.subtitle.toLowerCase().includes(q) ||
          l.body.some((b) => b.toLowerCase().includes(q)),
      )
    : [];

  // Filter tools
  const matchingTools = q
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q),
      )
    : [];

  // Filter Attack Labs
  const matchingAttacks = q
    ? ATTACK_LABS.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.desc.toLowerCase().includes(q) ||
          a.tag.toLowerCase().includes(q),
      )
    : [];

  // Filter Standards
  const matchingStandards = q
    ? STANDARDS.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      )
    : [];

  // Filter Glossary
  const matchingGlossary = q
    ? glossary.filter(
        (g) =>
          g.term.toLowerCase().includes(q) ||
          g.def.toLowerCase().includes(q),
      )
    : [];

  // Filter Challenges
  const matchingChallenges = q
    ? challenges.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.story.toLowerCase().includes(q) ||
          c.question.toLowerCase().includes(q),
      )
    : [];

  const PROMPT_SUGGESTIONS = [
    { label: "gcd(1071, 462)", icon: Calculator, category: "Math" },
    { label: "inv(3, 11)", icon: Zap, category: "Math" },
    { label: "pow(7, 13, 29)", icon: Calculator, category: "Math" },
    { label: "sha256 'specimen'", icon: Hash, category: "Hash" },
    { label: "Why is ECB mode broken?", icon: ShieldAlert, category: "Exploit" },
    { label: "Which cipher to encrypt files?", icon: ShieldCheck, category: "Standard" },
    { label: "Can quantum computers break RSA?", icon: Compass, category: "PQC" },
    { label: "How to store passwords?", icon: Bot, category: "Best Practice" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/20 p-3 pt-12 backdrop-blur-xs sm:pt-20">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[24px] bg-card p-4 sm:p-5 ring-1 ring-border shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Assistant Search Bar Header */}
        <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Ask a question, enter a formula (e.g. gcd(48,18), inv(3,11)), or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[16px] sm:text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted active:scale-95 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Results Area */}
        <div className="max-h-[65vh] overflow-y-auto space-y-5 pr-1 text-[13px]">
          {/* Smart Prompt Suggestions when input is empty */}
          {!q && (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11.5px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="size-3.5 text-primary" /> Assistant Quick Prompts & Calculators
                </span>
                <span className="text-[10.5px] font-mono">Click to test</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setQuery(item.label)}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted px-2.5 py-1.5 text-[12px] font-mono text-foreground hover:border-primary/40 transition"
                  >
                    <item.icon className="size-3 text-primary shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-[12px] text-muted-foreground leading-relaxed flex items-start gap-2.5">
                <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>Specimen Assistant is active.</strong> You can calculate GCDs, modular inverses, fast powers, compute SHA-256 hashes, or ask conceptual questions about NIST FIPS standards and cryptographic attacks.
                </p>
              </div>
            </div>
          )}

          {/* AI Cryptographic Assistant Briefing / Calculation Card */}
          {insight && (
            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-6 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Bot className="size-3.5" />
                  </div>
                  <span className="font-bold text-foreground text-[14px]">
                    {insight.title}
                  </span>
                </div>
                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 shrink-0">
                  {insight.badge}
                </span>
              </div>

              <p className="text-[12.5px] leading-relaxed text-foreground/90">
                {insight.summary}
              </p>

              {/* Calculation Output with One-Click Copy */}
              {insight.output && (
                <div className="flex items-center justify-between rounded-xl bg-card border border-border p-2.5 font-mono text-[12px]">
                  <span className="truncate pr-2 text-foreground font-semibold">
                    {insight.output}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyOutput(insight.output!)}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition shrink-0"
                  >
                    {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              )}

              {/* Step-by-Step Trace */}
              {insight.steps && insight.steps.length > 0 && (
                <div className="rounded-xl bg-card/60 border border-border/80 p-2.5 space-y-1 font-mono text-[11px]">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Execution Trace</span>
                  {insight.steps.map((st, i) => (
                    <div key={i} className="flex items-center justify-between text-muted-foreground py-0.5">
                      <span className="text-foreground">{st.label}</span>
                      <span>{st.detail}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Antipattern Alert */}
              {insight.antipattern && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 p-2.5 text-[11.5px] text-rose-900 dark:text-rose-300">
                  <ShieldAlert className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <p>{insight.antipattern}</p>
                </div>
              )}

              {/* Standard Citation & Action Link */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60 text-[11px]">
                {insight.standard && (
                  <span className="font-mono text-muted-foreground">
                    Citation: <strong className="text-foreground">{insight.standard}</strong>
                  </span>
                )}
                {insight.actionUrl && (
                  <Link
                    to={insight.actionUrl}
                    onClick={onClose}
                    className="flex items-center gap-1 font-semibold text-primary hover:underline ml-auto"
                  >
                    <span>{insight.actionLabel || "Explore Tool"}</span>
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Instant Format & Shannon Entropy Inspector Card */}
          {formatDetection && (formatDetection.detectedType !== "ascii" || formatDetection.raw.length >= 6) && (
            <div className="rounded-2xl border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-[13.5px] block">
                      Auto-Detected: {formatDetection.typeLabel}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{formatDetection.description}</span>
                  </div>
                </div>
                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 shrink-0">
                  {formatDetection.badge}
                </span>
              </div>

              {/* Decoded Interpretation Preview */}
              {formatDetection.decodedPreview && (
                <div className="rounded-xl bg-card border border-border p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Decoded Payload & Structure</span>
                    <button
                      type="button"
                      onClick={() => handleCopyOutput(formatDetection.decodedPreview || "")}
                      className="hover:text-foreground flex items-center gap-1 font-mono text-[10.5px] lowercase"
                    >
                      <Copy className="size-3" />
                      <span>{copied ? "copied" : "copy"}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap break-all max-h-36 overflow-y-auto bg-muted/40 p-2 rounded-lg">
                    {formatDetection.decodedPreview}
                  </pre>
                </div>
              )}

              {/* Candidate Algorithms if Hash */}
              {formatDetection.possibleHashes && formatDetection.possibleHashes.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Candidate Hash Algorithms ({formatDetection.hashCandidate?.bits} bits):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {formatDetection.possibleHashes.map((h) => (
                      <span key={h} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-card border border-border text-foreground">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shannon Entropy & Statistical Metrics */}
              <div className="rounded-xl bg-card border border-border p-3 space-y-2">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="font-semibold text-foreground">Shannon Entropy:</span>
                  <span className="font-mono font-bold text-primary">
                    {formatDetection.entropy.bitsPerByte} / 8.00 bits/byte ({formatDetection.entropy.classification})
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      formatDetection.entropy.bitsPerByte < 3.8
                        ? "bg-emerald-500"
                        : formatDetection.entropy.bitsPerByte <= 6.2
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${(formatDetection.entropy.bitsPerByte / 8) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-muted-foreground pt-0.5">
                  <span>{formatDetection.entropy.description}</span>
                  {formatDetection.stats?.indexOfCoincidence !== undefined && (
                    <span className="font-mono font-medium text-foreground">
                      IC: {formatDetection.stats.indexOfCoincidence}
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Representation Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                {formatDetection.representations.ascii && (
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Decoded ASCII</span>
                    <span className="text-foreground truncate block font-sans">{formatDetection.representations.ascii}</span>
                  </div>
                )}
                {formatDetection.representations.hex && (
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Hex (Base16)</span>
                    <span className="text-foreground truncate block">{formatDetection.representations.hex}</span>
                  </div>
                )}
                {formatDetection.representations.base64 && (
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Base64 (RFC 4648)</span>
                    <span className="text-foreground truncate block">{formatDetection.representations.base64}</span>
                  </div>
                )}
                {formatDetection.representations.decimal && (
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Decimal Value</span>
                    <span className="text-foreground truncate block">{formatDetection.representations.decimal}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60 text-[11px]">
                <button
                  type="button"
                  onClick={() => addScratchpadItem(`Detected ${formatDetection.typeLabel}`, formatDetection.raw)}
                  className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground active:scale-95 transition"
                >
                  <ClipboardPlus className="size-3 text-primary" />
                  <span>Send to Scratchpad</span>
                </button>
                <div className="flex items-center gap-3 ml-auto">
                  {formatDetection.suggestedActions[0] && (
                    <Link
                      to={formatDetection.suggestedActions[0].url}
                      onClick={onClose}
                      className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <span>{formatDetection.suggestedActions[0].label}</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  )}
                  <Link
                    to="/tools/$toolId"
                    params={{ toolId: "format-inspector" }}
                    search={{ input: formatDetection.raw }}
                    onClick={onClose}
                    className="flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <span>Full Inspector</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Attack Simulators & Workbenches */}
          {matchingAttacks.length > 0 && (
            <div>
              <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="size-3 text-rose-600" /> Attack Simulators & Labs ({matchingAttacks.length})
              </p>
              <div className="space-y-1.5">
                {matchingAttacks.map((att) => (
                  <Link
                    key={att.id}
                    to={att.url}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 border border-border hover:border-primary/40 hover:bg-muted/40 transition group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{att.name}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          {att.tag}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5">{att.desc}</p>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Converters & Tools */}
          {matchingTools.length > 0 && (
            <div>
              <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench className="size-3 text-primary" /> Converters & Solvers ({matchingTools.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {matchingTools.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.id}
                    to="/tools/$toolId"
                    params={{ toolId: tool.id }}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-background px-3 py-2 border border-border hover:border-primary/40 hover:bg-muted/40 transition"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-foreground block truncate text-[12.5px]">{tool.name}</span>
                      <span className="text-[11px] text-muted-foreground block truncate">{tool.tagline}</span>
                    </div>
                    <span className="font-mono text-[10px] text-primary shrink-0">Run</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Lessons */}
          {matchingLessons.length > 0 && (
            <div>
              <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="size-3 text-emerald-600" /> Curriculum Lessons ({matchingLessons.length})
              </p>
              <div className="space-y-1.5">
                {matchingLessons.slice(0, 5).map((lesson) => (
                  <Link
                    key={lesson.id}
                    to="/lessons/$lessonId"
                    params={{ lessonId: lesson.id }}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 border border-border hover:border-primary/40 hover:bg-muted/40 transition group"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-foreground block truncate">{lesson.title}</span>
                      <span className="text-[11.5px] text-muted-foreground block truncate">{lesson.subtitle}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[10.5px] text-primary flex items-center gap-1">
                      Read <ArrowRight className="size-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Standards Matrix */}
          {matchingStandards.length > 0 && (
            <div>
              <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-blue-600" /> Standards & Algorithms ({matchingStandards.length})
              </p>
              <div className="space-y-1.5">
                {matchingStandards.map((std) => (
                  <Link
                    key={std.name}
                    to={std.url}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-background px-3 py-2 border border-border hover:border-primary/40 hover:bg-muted/40 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{std.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {std.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{std.desc}</p>
                    </div>
                    <span className="font-mono text-[10px] text-primary">Matrix</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTF Challenges */}
          {matchingChallenges.length > 0 && (
            <div>
              <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Trophy className="size-3 text-amber-600" /> CTF Challenges ({matchingChallenges.length})
              </p>
              <div className="space-y-1.5">
                {matchingChallenges.slice(0, 3).map((ch) => (
                  <Link
                    key={ch.id}
                    to="/challenges"
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-background px-3 py-2 border border-border hover:border-primary/40 hover:bg-muted/40 transition"
                  >
                    <div>
                      <span className="font-semibold text-foreground text-[12.5px]">{ch.title}</span>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{ch.story}</p>
                    </div>
                    <span className="font-mono text-[10px] text-amber-600 font-semibold uppercase shrink-0 ml-2">
                      {ch.difficulty}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Glossary Terms */}
          {matchingGlossary.length > 0 && (
            <div>
              <p className="text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Hash className="size-3 text-primary" /> Glossary Definitions ({matchingGlossary.length})
              </p>
              <div className="space-y-1.5">
                {matchingGlossary.slice(0, 4).map((g) => (
                  <Link
                    key={g.term}
                    to="/lessons/$lessonId"
                    params={{ lessonId: g.lessonId }}
                    onClick={onClose}
                    className="block rounded-xl bg-background px-3 py-2 border border-border hover:border-primary/40 hover:bg-muted/40 transition"
                  >
                    <span className="font-semibold text-primary">{g.term}: </span>
                    <span className="text-[11.5px] text-muted-foreground">{g.def}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty Search State */}
          {q &&
            !insight &&
            matchingLessons.length === 0 &&
            matchingTools.length === 0 &&
            matchingAttacks.length === 0 &&
            matchingStandards.length === 0 &&
            matchingGlossary.length === 0 &&
            matchingChallenges.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <Bot className="size-8 text-muted-foreground/50 mx-auto" />
                <p className="text-[13.5px] font-semibold text-foreground">
                  No direct answers or matching modules for "{query}"
                </p>
                <p className="text-[12px] text-muted-foreground max-w-sm mx-auto">
                  Try asking a mathematical question like <code className="font-mono text-primary">gcd(240, 46)</code>, <code className="font-mono text-primary">inv(7, 26)</code>, or a topic like <em>AES</em>, <em>ECB</em>, <em>Diffie-Hellman</em>, <em>Kyber</em>, or <em>RSA</em>.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function SiteHeader({
  onOpenSearch,
  onOpenShortcuts,
}: {
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}) {
  const router = useRouter();
  const [labsOpen, setLabsOpen] = useState(false);
  const currentPath = router.state.location.pathname;
  const isLabActive =
    currentPath.startsWith("/attacks") ||
    currentPath.startsWith("/handshake") ||
    currentPath.startsWith("/zkp") ||
    currentPath.startsWith("/pqc") ||
    currentPath.startsWith("/forensics") ||
    currentPath.startsWith("/pipeline") ||
    currentPath.startsWith("/benchmark") ||
    currentPath.startsWith("/flashcards");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-3 sm:px-5">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2 transition hover:opacity-90 shrink-0"
        >
          <img
            src="/logo.png"
            alt="Specimen Logo"
            className="size-6 rounded-full border border-border/80 shadow-2xs object-cover transition group-hover:scale-105 bg-white"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[13.5px] font-semibold tracking-tight text-foreground">
              Specimen
            </span>
            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[9px] font-medium text-muted-foreground border border-border/80">
              lab
            </span>
          </div>
        </Link>

        {/* Minimal Search & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1 text-[11.5px] text-muted-foreground border border-border/60 transition hover:bg-muted hover:text-foreground hover:border-border w-28 sm:w-44 md:w-52 justify-between group cursor-pointer"
            title="Search or ask assistant (⌘K)"
          >
            <span className="flex items-center gap-1.5">
              <Search className="size-3 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
              <span className="hidden sm:inline text-muted-foreground/90 group-hover:text-foreground transition-colors">Search or ask...</span>
              <span className="sm:hidden">Search</span>
            </span>
            <kbd className="hidden font-mono text-[9px] text-muted-foreground/80 sm:inline rounded bg-background/80 px-1 py-0.2 border border-border/70">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:grid size-7 place-items-center rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 transition cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="size-3.5" />
          </button>

          {/* Clean Segmented Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            <Link
              to="/tracks/$trackId"
              params={{ trackId: "classical" }}
              className="rounded-md px-2 py-1 text-[12px] font-normal text-muted-foreground transition hover:text-foreground hover:bg-muted/50"
              activeProps={{ className: "rounded-md bg-muted text-foreground font-medium" }}
            >
              Curriculum
            </Link>
            <Link
              to="/tools"
              className="rounded-md px-2 py-1 text-[12px] font-normal text-muted-foreground transition hover:text-foreground hover:bg-muted/50"
              activeProps={{ className: "rounded-md bg-muted text-foreground font-medium" }}
            >
              Converters
            </Link>

            {/* Labs & Interactive Studios Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setLabsOpen(true)}
              onMouseLeave={() => setLabsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setLabsOpen(!labsOpen)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[12px] transition hover:text-foreground hover:bg-muted/50 cursor-pointer ${
                  isLabActive ? "bg-muted text-foreground font-medium" : "text-muted-foreground font-normal"
                }`}
              >
                <span>Labs & CTF</span>
                <ChevronDown className={`size-3 transition-transform opacity-70 ${labsOpen ? "rotate-180" : ""}`} />
              </button>

              {labsOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-card/95 p-1.5 border border-border shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <Link
                    to="/attacks"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">Attack Lab</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Exploits</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">ECB Penguin, CBC Flip, DH MITM, Lattice</span>
                  </Link>
                  <Link
                    to="/handshake"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">TLS 1.3 Inspector</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Wire</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">1-RTT Handshake wire frames & HKDF</span>
                  </Link>
                  <Link
                    to="/zkp"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">ZKP Playground</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Proofs</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Schnorr 3-move & Graph 3-Coloring</span>
                  </Link>
                  <Link
                    to="/pqc"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">Post-Quantum Lab</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Lattice</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">ML-KEM Kyber & ML-DSA Dilithium</span>
                  </Link>
                  <Link
                    to="/forensics"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">Steganography Studio</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Forensics</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Bit-plane slicing, LSB & Magic bytes</span>
                  </Link>
                  <Link
                    to="/pipeline"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition border-t border-border/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">Pipeline Studio</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Workbench</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Multi-stage sequential recipe chain</span>
                  </Link>
                  <Link
                    to="/challenges"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">CTF Challenges</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Cryptanalysis</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Interactive CTF sandboxes & exploits</span>
                  </Link>
                  <Link
                    to="/flashcards"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">Flashcards Deck</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Recall</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">60+ cards across 8 Stallings tracks</span>
                  </Link>
                  <Link
                    to="/benchmark"
                    onClick={() => setLabsOpen(false)}
                    className="flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-muted transition border-t border-border/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold text-foreground">Benchmark & SAC</span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Hardware</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Web Crypto speeds & 128-bit SAC matrix</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/matrix"
              className="rounded-md px-2 py-1 text-[12px] font-normal text-muted-foreground transition hover:text-foreground hover:bg-muted/50"
              activeProps={{ className: "rounded-md bg-muted text-foreground font-medium" }}
            >
              Standards
            </Link>
            <Link
              to="/notebook"
              className="rounded-md px-2 py-1 text-[12px] font-normal text-muted-foreground transition hover:text-foreground hover:bg-muted/50"
              activeProps={{ className: "rounded-md bg-muted text-foreground font-medium" }}
            >
              Notebook
            </Link>
            <Link
              to="/glossary"
              className="rounded-md px-2 py-1 text-[12px] font-normal text-muted-foreground transition hover:text-foreground hover:bg-muted/50"
              activeProps={{ className: "rounded-md bg-muted text-foreground font-medium" }}
            >
              Glossary
            </Link>
            <a
              href="/documentation.html"
              className="rounded-md px-2 py-1 text-[12px] font-normal text-muted-foreground transition hover:text-foreground hover:bg-muted/50"
            >
              Guide
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          setShortcutsOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-body text-foreground selection:bg-primary/20 selection:text-primary flex flex-col">
        <SiteHeader
          onOpenSearch={() => setSearchOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />
        <div className="flex-1 w-full max-w-[1920px] mx-auto px-3 pb-20 pt-2 sm:px-5 sm:pb-14 sm:pt-3 md:px-6 lg:px-8 xl:px-10">
          <Outlet />
          <footer className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border pt-3.5 pb-2 gap-2 text-[11.5px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Specimen Logo" className="size-4 rounded-full border border-border" />
              <span>Specimen · Interactive Cryptography & Cyber Security Laboratory</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/documentation.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition underline font-mono text-[11px]"
              >
                Docs (Manual)
              </a>
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                className="hover:text-foreground transition underline font-mono text-[11px]"
              >
                Shortcuts (?)
              </button>
              <span className="font-mono text-[10.5px]">learn · run · verify</span>
            </div>
          </footer>
        </div>

        {/* Floating Universal Cryptographic Scratchpad Dock */}
        <UniversalScratchpad />

        {/* Floating Mobile Bottom Navigation Dock */}
        <MobileNavDock onOpenSearch={() => setSearchOpen(true)} />

        {/* Global Search Modal */}
        <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Global Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </div>
    </QueryClientProvider>
  );
}
