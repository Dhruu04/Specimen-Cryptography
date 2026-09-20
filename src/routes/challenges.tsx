import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Trophy,
  ArrowRight,
  RotateCcw,
  Terminal,
  Zap,
  XCircle,
  Play,
  RefreshCw,
  Cpu,
  Check,
  Copy,
  Wrench,
  Search,
  Filter,
  Layers,
  ChevronDown,
  Sparkles,
  Calculator,
  Binary,
} from "lucide-react";
import { challenges, type Challenge } from "@/content/challenges";
import { TrackRail } from "@/components/TrackRail";
import { bytesToHex, bytesToBase64, toBytes, base64ToText, hexToText } from "@/lib/crypto/encoding";
import { gcdTrace, extendedEuclid, modInverseTool, modPow } from "@/lib/crypto/numbertheory";
import { PaddingOracleSandbox } from "@/components/sandboxes/PaddingOracleSandbox";
import { HastadCrtSandbox } from "@/components/sandboxes/HastadCrtSandbox";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Crypto Challenge Lab & Interactive CTF Sandbox — Specimen" },
      {
        name: "description",
        content:
          "Solve real cryptanalysis challenges: break ciphers, query live CBC padding oracles, run Håstad's broadcast CRT attacks, and reconstruct Shamir thresholds.",
      },
      { property: "og:title", content: "Crypto Challenge Lab & Interactive CTF Sandbox — Specimen" },
    ],
  }),
  component: ChallengesPage,
});

// Inline Cryptanalysis Workbench inside challenge cards
function ChallengeWorkbench({ defaultText = "" }: { defaultText?: string }) {
  const [input, setInput] = useState(defaultText);
  const [op, setOp] = useState<"caesar" | "rot13" | "base64" | "hex" | "xor" | "modpow" | "gcd">("caesar");
  const [shift, setShift] = useState(3);
  const [xorKey, setXorKey] = useState("K");
  const [modA, setModA] = useState("3233");
  const [modB, setModB] = useState("4453");
  const [modM, setModM] = useState("23");

  const result = useMemo(() => {
    try {
      if (op === "rot13") {
        return input.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= "Z" ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
      }
      if (op === "caesar") {
        return input.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= "Z" ? 65 : 97;
          const k = ((c.charCodeAt(0) - base - shift) % 26 + 26) % 26;
          return String.fromCharCode(k + base);
        });
      }
      if (op === "base64") {
        const res = base64ToText(input.trim());
        return res.error ? `[${res.error}]` : res.output;
      }
      if (op === "hex") {
        const res = hexToText(input.replace(/\s+/g, ""));
        return res.error ? `[${res.error}]` : res.output;
      }
      if (op === "xor") {
        if (!xorKey) return input;
        const keyBytes = toBytes(xorKey);
        const inBytes = toBytes(input);
        const out = inBytes.map((b, i) => b ^ (keyBytes[i % keyBytes.length] ?? 0));
        return new TextDecoder().decode(new Uint8Array(out));
      }
      if (op === "modpow") {
        try {
          const a = BigInt(modA);
          const b = BigInt(modB);
          const m = BigInt(modM);
          if (m <= 0n) return "[Modulus must be > 0]";
          const r = modPow(a, b, m);
          return `${a}^${b} mod ${m} = ${r.toString()}`;
        } catch {
          return "[Arithmetic error]";
        }
      }
      if (op === "gcd") {
        try {
          let a = BigInt(modA);
          let b = BigInt(modB);
          const origA = a;
          const origB = b;
          while (b !== 0n) {
            const t = b;
            b = a % b;
            a = t;
          }
          const gcdVal = a < 0n ? -a : a;
          return `gcd(${origA}, ${origB}) = ${gcdVal.toString()}`;
        } catch {
          return "[Arithmetic error]";
        }
      }
    } catch (e: any) {
      return `[Error: ${e.message}]`;
    }
    return "";
  }, [input, op, shift, xorKey, modA, modB, modM]);

  return (
    <div className="rounded-xl bg-muted/40 border border-border/80 p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5">
          <Wrench className="size-3.5 text-primary" /> Decryption Workbench
        </span>
        <div className="flex flex-wrap gap-1">
          {(["caesar", "rot13", "base64", "hex", "xor", "modpow", "gcd"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setOp(mode)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition cursor-pointer ${
                op === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {op !== "modpow" && op !== "gcd" ? (
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type ciphertext to decrypt..."
          className="w-full rounded-lg bg-background border border-border p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : op === "modpow" ? (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground block">Base (a)</label>
            <input
              type="text"
              value={modA}
              onChange={(e) => setModA(e.target.value)}
              className="w-full rounded-lg bg-background border border-border p-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block">Exponent (b)</label>
            <input
              type="text"
              value={modB}
              onChange={(e) => setModB(e.target.value)}
              className="w-full rounded-lg bg-background border border-border p-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block">Modulus (m)</label>
            <input
              type="text"
              value={modM}
              onChange={(e) => setModM(e.target.value)}
              className="w-full rounded-lg bg-background border border-border p-1.5 text-xs"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground block">First Number (A)</label>
            <input
              type="text"
              value={modA}
              onChange={(e) => setModA(e.target.value)}
              className="w-full rounded-lg bg-background border border-border p-1.5 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block">Second Number (B)</label>
            <input
              type="text"
              value={modB}
              onChange={(e) => setModB(e.target.value)}
              className="w-full rounded-lg bg-background border border-border p-1.5 text-xs"
            />
          </div>
        </div>
      )}

      {op === "caesar" && (
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] text-muted-foreground">Shift: {shift}</span>
          <input
            type="range"
            min="1"
            max="25"
            value={shift}
            onChange={(e) => setShift(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-muted rounded appearance-none cursor-pointer accent-primary"
          />
        </div>
      )}

      {op === "xor" && (
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] text-muted-foreground">XOR Key:</span>
          <input
            type="text"
            value={xorKey}
            onChange={(e) => setXorKey(e.target.value)}
            className="w-32 rounded bg-background border border-border px-2 py-1 text-xs"
          />
        </div>
      )}

      <div className="p-2.5 rounded-lg bg-background border border-border text-foreground break-all">
        <span className="text-[10px] uppercase text-muted-foreground block font-bold mb-0.5">Live Output:</span>
        <span className="text-primary font-bold">{result || "[No output]"}</span>
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  solved,
  onSolved,
}: {
  challenge: Challenge;
  solved: boolean;
  onSolved: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [copied, setCopied] = useState(false);

  // Normalization logic: trim, upper, remove punctuation, allow both raw and FLAG{...}
  const normalize = (s: string) => {
    return s
      .trim()
      .toUpperCase()
      .replace(/^FLAG\{/, "")
      .replace(/\}$/, "")
      .replace(/[\s\-_.,;:'"{}]/g, "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userNorm = normalize(answer);
    const validNorms = [challenge.solution, ...(challenge.acceptedSolutions ?? [])].map(normalize);
    if (validNorms.includes(userNorm)) {
      setFeedback("correct");
      onSolved();
    } else {
      setFeedback("incorrect");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColors = {
    beginner: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    intermediate: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
    advanced: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
  };

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-4.5 shadow-2xs space-y-3.5 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2.5 border-b border-border/70 pb-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 font-mono text-[9.5px] uppercase font-semibold px-2 py-0.2 rounded-full border ${
                  difficultyColors[challenge.difficulty]
                }`}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {challenge.difficulty}
              </span>
              <span className="font-mono text-[9.5px] text-muted-foreground uppercase px-2 py-0.2 rounded-full bg-muted border border-border">
                {challenge.category}
              </span>
              <span className="font-mono text-[9.5px] text-muted-foreground uppercase tracking-wider">
                DOC #{challenge.id}
              </span>
            </div>
            <h2 className="mt-1.5 font-display text-[16px] sm:text-[17px] font-bold text-foreground">
              {challenge.title}
            </h2>
          </div>
          {solved && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="size-2.5 text-emerald-500" /> DECRYPTED
            </span>
          )}
        </div>

        {/* Story */}
        <p className="text-[13px] leading-relaxed text-foreground/90">{challenge.story}</p>

        {/* Intercepted Artifact Box (if available) */}
        {challenge.intercept && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Terminal className="size-3 text-primary" /> Intercepted Ciphertext / Parameters
              </span>
              <button
                type="button"
                onClick={() => handleCopy(challenge.intercept!)}
                className="flex items-center gap-1 text-[10.5px] font-mono text-muted-foreground hover:text-foreground px-1.5 py-0.2 rounded bg-muted hover:bg-muted/80 transition cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check className="size-2.5 text-emerald-500" /> : <Copy className="size-2.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-muted/40 p-2.5 font-mono text-[11.5px] text-foreground border border-border/80 whitespace-pre-wrap leading-relaxed select-all">
              {challenge.intercept}
            </pre>
          </div>
        )}

        {/* Question Prompt */}
        <div className="rounded-lg bg-muted/50 p-2.5 border border-border/60">
          <p className="font-mono text-[12px] font-medium text-foreground">
            OBJECTIVE: <span className="font-semibold text-primary">{challenge.question}</span>
          </p>
        </div>

        {/* Inline Decryption Workbench (Toggleable) */}
        {workbenchOpen && (
          <ChallengeWorkbench defaultText={challenge.intercept || ""} />
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="pt-0.5 flex flex-col sm:flex-row gap-1.5">
          <input
            type="text"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setFeedback(null);
            }}
            placeholder="Enter decrypted plaintext or calculated value..."
            className="flex-1 rounded-lg bg-background px-3 py-1.5 sm:py-2 font-mono text-[13px] border border-border outline-none transition focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 sm:py-2 font-mono text-[12px] font-semibold text-primary-foreground shadow-2xs hover:opacity-90 active:scale-98 transition cursor-pointer"
          >
            Verify Intercept
          </button>
        </form>

        {/* Feedback Notices */}
        {feedback === "correct" && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-[13px] text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span><strong>Correct!</strong> Intercept successfully decrypted and verified.</span>
          </div>
        )}

        {feedback === "incorrect" && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-[13px] text-rose-800 dark:text-rose-300 border border-rose-500/30 font-mono">
            <XCircle className="size-4 text-rose-500 shrink-0" />
            <span>Incorrect decipherment. Check your calculations, test with the workbench, or open the hint below.</span>
          </div>
        )}

        {/* Hints and Solutions Dropdowns */}
        {showHint && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3.5 text-[12.5px] leading-relaxed text-amber-900 dark:text-amber-300 border border-amber-500/30">
            <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div><strong>Hint / Strategy:</strong> {challenge.hint}</div>
          </div>
        )}

        {revealed && (
          <div className="rounded-xl bg-muted/40 p-4 text-[12.5px] leading-relaxed text-muted-foreground border border-border space-y-1">
            <p className="font-semibold text-foreground">
              Solution: <span className="font-mono text-primary font-bold">{challenge.solution}</span>
            </p>
            <p className="leading-relaxed">{challenge.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] pt-3 border-t border-border/60 mt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setWorkbenchOpen(!workbenchOpen)}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
          >
            <Wrench className="size-3.5 text-primary" />
            <span>{workbenchOpen ? "Close Workbench" : "Open Workbench"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
          >
            <Lightbulb className="size-3.5 text-amber-500" />
            <span>{showHint ? "Hide hint" : "Hint"}</span>
          </button>

          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
          >
            <HelpCircle className="size-3.5" />
            <span>{revealed ? "Hide solution" : "Solution"}</span>
          </button>
        </div>

        {challenge.toolId && (
          <Link
            to="/tools/$toolId"
            params={{ toolId: challenge.toolId }}
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          >
            <span>Launch {challenge.toolId}</span>
            <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
    </article>
  );
}

function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<"challenges" | "sandbox">("challenges");
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [solvedIds, setSolvedIds] = useState<string[]>([]);



  useEffect(() => {
    try {
      const saved = localStorage.getItem("cypher_solved_challenges");
      if (saved) setSolvedIds(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  const markSolved = (id: string) => {
    setSolvedIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem("cypher_solved_challenges", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const resetProgress = () => {
    if (confirm("Reset all CTF challenge progress?")) {
      setSolvedIds([]);
      try {
        localStorage.removeItem("cypher_solved_challenges");
      } catch {
        // Ignore
      }
    }
  };

  // Unique categories for filtering
  const allCategories = useMemo(() => {
    const cats = new Set(challenges.map((c) => c.category));
    return Array.from(cats);
  }, []);

  // Filter challenges based on difficulty, category, and search text
  const filtered = useMemo(() => {
    return challenges.filter((c) => {
      const matchesDiff = filter === "all" || c.difficulty === filter;
      const matchesCat = categoryFilter === "all" || c.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDiff && matchesCat && matchesSearch;
    });
  }, [filter, categoryFilter, searchQuery]);

  return (
    <main className="mt-2 w-full space-y-4 pb-8">
      <TrackRail />

      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[9.5px] uppercase font-semibold text-primary px-2 py-0.2 rounded-md bg-muted border border-border">
                CHALLENGE LAB & CTF ARENA
              </span>
              <span className="font-mono text-[9.5px] text-muted-foreground uppercase tracking-wider">
                APPLIED CRYPTANALYSIS
              </span>
            </div>
            <h1 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight text-foreground">
              Cryptanalysis Challenge Lab & CTF Sandbox
            </h1>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground max-w-[65ch]">
              Apply your brain and cryptographic knowledge. Decipher real intercepted artifacts, reverse mathematical trapdoors,
              execute Håstad broadcast attacks, exploit CBC padding oracles, and break compromised nonces.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start rounded-xl border border-border bg-card p-2.5 shadow-2xs">
            <div className="grid size-8 place-items-center rounded-lg bg-muted border border-border text-primary">
              <Trophy className="size-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">CTF Solved</div>
              <div className="text-base font-bold font-mono text-foreground leading-tight">
                {solvedIds.length} / {challenges.length}
              </div>
            </div>
            {solvedIds.length > 0 && (
              <button
                type="button"
                onClick={resetProgress}
                title="Reset progress"
                className="text-[10.5px] text-muted-foreground hover:text-foreground font-mono ml-2 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Educational Callout: How to Navigate the Cryptanalysis Arena */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg border border-border bg-muted shrink-0 text-foreground">
              <Zap className="size-3.5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-2">
                <span>How to Approach Cryptanalysis CTF Challenges</span>
              </div>
              <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                Cryptanalysis requires formulating mathematical hypotheses about intercepted data, identifying statistical anomalies or structural vulnerabilities, and testing transformations iteratively.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-[10.5px]">
                <div className="border border-border bg-background p-2 rounded-lg">
                  <span className="font-bold text-foreground block uppercase">1. Identify Artifacts</span>
                  <span className="text-muted-foreground">Inspect hex lengths, character sets, and delimiters (Base64 '=' or RSA moduli).</span>
                </div>
                <div className="border border-border bg-background p-2 rounded-lg">
                  <span className="font-bold text-foreground block uppercase">2. Use Inline Workbench</span>
                  <span className="text-muted-foreground">Click "Open Workbench" inside any card to test mod pow, XOR, or shifts on the fly.</span>
                </div>
                <div className="border border-border bg-background p-2 rounded-lg">
                  <span className="font-bold text-foreground block uppercase">3. Interactive Sandboxes</span>
                  <span className="text-muted-foreground">Query live CBC padding oracles or reconstruct RSA broadcasts via CRT below.</span>
                </div>
                <div className="border border-border bg-background p-2 rounded-lg">
                  <span className="font-bold text-foreground block uppercase">4. Progressive Hints</span>
                  <span className="text-muted-foreground">If stuck, reveal the hint for strategic direction, or inspect the mathematical proof.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle (Challenges vs CTF Sandboxes) */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("challenges")}
            className={`pb-2 px-3 font-mono text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === "challenges"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Intercept Challenges Catalog ({challenges.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sandbox")}
            className={`pb-2 px-3 font-mono text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "sandbox"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="size-3 text-amber-500" />
            Live Interactive CTF Sandboxes (Padding Oracle & Håstad CRT)
          </button>
        </div>
      </section>

      {/* ========================================== */}
      {/* TAB 1: Challenges Grid                     */}
      {/* ========================================== */}
      {activeTab === "challenges" && (
        <section className="space-y-3">
          {/* Controls: Search and Filters */}
          <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between pb-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges by topic, algorithm, or keyword..."
                className="w-full rounded-lg bg-background border border-border pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Difficulty Pills */}
            <div className="flex flex-wrap gap-1">
              {(["all", "beginner", "intermediate", "advanced"] as const).map((lvl) => {
                const count = lvl === "all" ? challenges.length : challenges.filter((c) => c.difficulty === lvl).length;
                const active = filter === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFilter(lvl)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium capitalize transition cursor-pointer ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/70"
                    }`}
                  >
                    {lvl} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] whitespace-nowrap transition cursor-pointer ${
                categoryFilter === "all"
                  ? "bg-foreground text-background font-bold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Categories
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-foreground text-background font-bold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Challenges Cards Grid */}
          <div className="grid gap-3.5 md:grid-cols-2 2xl:grid-cols-3 pt-1">
            {filtered.map((ch) => (
              <ChallengeCard
                key={ch.id}
                challenge={ch}
                solved={solvedIds.includes(ch.id)}
                onSolved={() => markSolved(ch.id)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 rounded-2xl bg-card border border-border p-6 space-y-2">
              <p className="text-sm font-semibold text-foreground">No challenges match your search filter</p>
              <p className="text-xs text-muted-foreground">Try clearing the search query or selecting "All Categories".</p>
            </div>
          )}
        </section>
      )}

      {/* ========================================== */}
      {/* TAB 2: Interactive CTF Sandboxes           */}
      {/* ========================================== */}
      {activeTab === "sandbox" && (
        <div className="space-y-8">
          <PaddingOracleSandbox />
          <HastadCrtSandbox />
        </div>
      )}
    </main>
  );
}
