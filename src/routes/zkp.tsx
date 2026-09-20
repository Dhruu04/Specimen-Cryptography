import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { TrackRail } from "@/components/TrackRail";
import {
  DEFAULT_SCHNORR_PARAMS,
  generateSchnorrKeys,
  schnorrCommitHonest,
  schnorrCommitImposter,
  schnorrRespondHonest,
  schnorrVerify,
  fiatShamirChallenge,
  DEFAULT_GRAPH,
  commitGraphRound,
  verifyGraphRound,
  COLOR_HEX,
  COLOR_NAMES,
  type ColorId,
  type GraphEdge,
  type ZkpRoundCommitment,
} from "@/lib/crypto/zkp";
import { RotateCcw, Dices, Zap, CheckCircle2, XCircle, AlertTriangle, Check, X } from "lucide-react";

export const Route = createFileRoute("/zkp")({
  head: () => ({
    meta: [
      { title: "Zero-Knowledge Proofs (ZKP) Playground — Specimen" },
      {
        name: "description",
        content:
          "Interactive Zero-Knowledge Proofs simulator: Schnorr 3-move identification protocol, honest vs imposter modes, Fiat-Shamir heuristic, and interactive Graph 3-Coloring rounds.",
      },
      { property: "og:title", content: "Zero-Knowledge Proofs Playground — Specimen" },
    ],
  }),
  component: ZkpPage,
});

function ZkpPage() {
  const [activeTab, setActiveTab] = useState<"schnorr" | "graph">("schnorr");

  // ==========================================
  // 1. Schnorr Identification State
  // ==========================================
  const params = DEFAULT_SCHNORR_PARAMS;
  const [secretX, setSecretX] = useState<number>(37);
  const [isImposter, setIsImposter] = useState<boolean>(false);
  const [guessedC, setGuessedC] = useState<number>(12);

  // Derived key pair
  const keys = useMemo(() => generateSchnorrKeys(params, secretX), [params, secretX]);

  // Round steps
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [nonceR, setNonceR] = useState<number>(109);
  const [fakeS, setFakeS] = useState<number>(55);
  const [commitmentR, setCommitmentR] = useState<number>(() => {
    return schnorrCommitHonest(params, 37, 109).R;
  });
  const [challengeC, setChallengeC] = useState<number>(42);
  const [responseS, setResponseS] = useState<number>(0);
  const [useFiatShamir, setUseFiatShamir] = useState<boolean>(false);

  const startNewSchnorrRound = (imposter = isImposter) => {
    setStep(1);
    if (!imposter) {
      const randR = Math.floor(5 + Math.random() * 800);
      setNonceR(randR);
      const com = schnorrCommitHonest(params, keys.x, randR);
      setCommitmentR(com.R);
    } else {
      const randFakeS = Math.floor(5 + Math.random() * 800);
      setFakeS(randFakeS);
      const com = schnorrCommitImposter(params, keys.y, guessedC, randFakeS);
      setCommitmentR(com.R);
    }
  };

  const generateChallenge = () => {
    let c = 0;
    if (useFiatShamir) {
      c = fiatShamirChallenge(params, keys.y, commitmentR);
    } else {
      c = Math.floor(1 + Math.random() * 100);
    }
    setChallengeC(c);
    setStep(2);
  };

  const sendResponse = () => {
    if (!isImposter) {
      const s = schnorrRespondHonest(params, keys.x, nonceR, challengeC);
      setResponseS(s);
    } else {
      // Imposter already committed to fakeS
      setResponseS(fakeS);
    }
    setStep(3);
  };

  const verificationResult = useMemo(() => {
    return schnorrVerify(params, keys.y, commitmentR, challengeC, responseS);
  }, [params, keys.y, commitmentR, challengeC, responseS]);

  // ==========================================
  // 2. Graph 3-Coloring State
  // ==========================================
  const graph = DEFAULT_GRAPH;
  const [isGraphCheating, setIsGraphCheating] = useState<boolean>(false);
  const [roundCommitment, setRoundCommitment] = useState<ZkpRoundCommitment>(() => commitGraphRound(graph, false));
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [revealedResult, setRevealedResult] = useState<ReturnType<typeof verifyGraphRound> | null>(null);
  const [roundHistory, setRoundHistory] = useState<{ round: number; edge: string; passed: boolean }[]>([]);

  const startNewGraphRound = (cheating = isGraphCheating) => {
    const newCommit = commitGraphRound(graph, cheating);
    setRoundCommitment(newCommit);
    setSelectedEdge(null);
    setRevealedResult(null);
  };

  const challengeEdge = (edge: GraphEdge) => {
    setSelectedEdge(edge);
    const result = verifyGraphRound(roundCommitment, edge);
    setRevealedResult(result);
    setRoundHistory((prev) => [
      {
        round: prev.length + 1,
        edge: `(${edge.u}, ${edge.v})`,
        passed: result.isValid,
      },
      ...prev.slice(0, 19),
    ]);
  };

  const runMultiRounds = (count: number) => {
    let currentCommit = roundCommitment;
    const newHist: { round: number; edge: string; passed: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      currentCommit = commitGraphRound(graph, isGraphCheating);
      const randEdge = graph.edges[Math.floor(Math.random() * graph.edges.length)]!;
      const res = verifyGraphRound(currentCommit, randEdge);
      newHist.push({
        round: roundHistory.length + i + 1,
        edge: `(${randEdge.u}, ${randEdge.v})`,
        passed: res.isValid,
      });
      if (!res.isValid) break; // Cheater caught!
    }

    setRoundCommitment(currentCommit);
    setRoundHistory((prev) => [...newHist.reverse(), ...prev].slice(0, 30));
  };

  // Soundness calculation: (1 - 1/|E|)^k
  const totalRounds = roundHistory.length;
  const numEdges = graph.edges.length;
  const cheatUndetectedProb = Math.pow(1 - 1 / numEdges, totalRounds);

  return (
    <main className="mt-5 space-y-6">
      <TrackRail />

      <section>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Interactive Cryptography</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary ring-1 ring-primary/20">
            Goldwasser-Micali-Rackoff (1985)
          </span>
        </div>
        <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.08] text-foreground">
          Zero-Knowledge Proofs (ZKP) Playground
        </h1>
        <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-muted-foreground">
          Prove the validity of a computational statement without revealing any information beyond its truth. Experience the three foundational pillars of zero-knowledge: <strong className="text-foreground">Completeness</strong>, <strong className="text-foreground">Soundness</strong>, and <strong className="text-foreground">Zero-Knowledge</strong>.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("schnorr")}
          className={`pb-3 px-4 font-mono text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === "schnorr"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          1. Schnorr Identification Protocol (Discrete Log)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("graph")}
          className={`pb-3 px-4 font-mono text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === "graph"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          2. Graph 3-Coloring ZKP (NP-Complete Commitment)
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: Schnorr Identification Protocol     */}
      {/* ========================================== */}
      {activeTab === "schnorr" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-card ring-1 ring-border">
            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                Prover Persona Mode:
              </label>
              <div className="flex rounded-lg p-0.5 bg-background ring-1 ring-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsImposter(false);
                    startNewSchnorrRound(false);
                  }}
                  className={`flex-1 py-1 text-center font-mono text-xs rounded-md font-bold transition-colors cursor-pointer ${
                    !isImposter ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  Honest Prover
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsImposter(true);
                    startNewSchnorrRound(true);
                  }}
                  className={`flex-1 py-1 text-center font-mono text-xs rounded-md font-bold transition-colors cursor-pointer ${
                    isImposter ? "bg-rose-500/20 text-rose-400" : "text-muted-foreground"
                  }`}
                >
                  Imposter (Malicious)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                Secret Key x (Honest only):
              </label>
              <input
                type="number"
                disabled={isImposter}
                value={secretX}
                onChange={(e) => {
                  setSecretX(Number(e.target.value));
                  startNewSchnorrRound();
                }}
                className="w-full rounded-md bg-background px-2.5 py-1 text-xs font-mono ring-1 ring-border text-foreground disabled:opacity-40"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                Challenge Generation:
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="fiatShamir"
                  checked={useFiatShamir}
                  onChange={(e) => setUseFiatShamir(e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
                <label htmlFor="fiatShamir" className="text-xs font-mono text-foreground cursor-pointer">
                  Fiat-Shamir Heuristic H(g||y||R)
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => startNewSchnorrRound()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 font-mono text-xs font-bold text-foreground ring-1 ring-border transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset Round</span>
              </button>
            </div>
          </div>

          {/* Group Parameters & Public Key */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-background/50 ring-1 ring-border/80 font-mono text-xs">
            <div className="flex items-center gap-4">
              <span>Prime p = <strong>{params.p}</strong></span>
              <span>Generator g = <strong>{params.g}</strong></span>
              <span>
                Public Key y = g^x mod p = <strong>{keys.y}</strong>
              </span>
            </div>
            {isImposter ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded ring-1 ring-rose-500/30">
                <AlertTriangle className="size-3.5 text-rose-400" />
                <span>Imposter does not know x={secretX} (attempting to forge proof)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded ring-1 ring-emerald-500/30">
                <Check className="size-3.5 text-emerald-400" />
                <span>Honest Prover holds private key x={secretX}</span>
              </span>
            )}
          </div>

          {/* Protocol 3-Move Swimlane */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Commitment */}
            <div className={`p-4 rounded-xl ring-1 transition-all ${
              step >= 1 ? "bg-card ring-primary/40 shadow-xs" : "bg-card/40 ring-border opacity-60"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-primary">Move 1: Commitment</span>
                <span className="text-[10px] font-mono text-muted-foreground">Prover → Verifier</span>
              </div>
              <h3 className="font-mono text-sm font-bold text-foreground">
                Commitment R = g^r mod p
              </h3>
              <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
                {isImposter
                  ? `Imposter guesses challenge ĉ = ${guessedC} and calculates fake R = g^s · y^(-ĉ) mod p = ${commitmentR}`
                  : `Honest prover picks secret ephemeral nonce r = ${nonceR} and computes R = ${params.g}^${nonceR} mod ${params.p} = ${commitmentR}`}
              </p>

              <div className="mt-3 p-2 rounded bg-background ring-1 ring-border font-mono text-xs">
                <span className="text-muted-foreground block text-[10px]">Published Commitment R:</span>
                <span className="font-bold text-primary">{commitmentR}</span>
              </div>

              {step === 1 && (
                <button
                  type="button"
                  onClick={generateChallenge}
                  className="mt-4 w-full py-1.5 rounded-lg bg-primary hover:bg-primary/90 font-mono text-xs font-bold text-primary-foreground transition-colors cursor-pointer"
                >
                  Verifier Sends Challenge →
                </button>
              )}
            </div>

            {/* Step 2: Challenge */}
            <div className={`p-4 rounded-xl ring-1 transition-all ${
              step >= 2 ? "bg-card ring-primary/40 shadow-xs" : "bg-card/40 ring-border opacity-60"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-400">Move 2: Challenge</span>
                <span className="text-[10px] font-mono text-muted-foreground">Verifier → Prover</span>
              </div>
              <h3 className="font-mono text-sm font-bold text-foreground">
                Challenge c ∈ [1..100]
              </h3>
              <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
                {useFiatShamir
                  ? `Non-interactive hash: c = SHA256(g || y || R) mod (p-1) = ${challengeC}`
                  : `Interactive random coin flip chosen by verifier: c = ${challengeC}`}
              </p>

              <div className="mt-3 p-2 rounded bg-background ring-1 ring-border font-mono text-xs">
                <span className="text-muted-foreground block text-[10px]">Verifier Challenge c:</span>
                <span className="font-bold text-sky-400">{challengeC}</span>
              </div>

              {step === 2 && (
                <button
                  type="button"
                  onClick={sendResponse}
                  className="mt-4 w-full py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Prover Sends Response s →
                </button>
              )}
            </div>

            {/* Step 3: Response */}
            <div className={`p-4 rounded-xl ring-1 transition-all ${
              step >= 3 ? "bg-card ring-primary/40 shadow-xs" : "bg-card/40 ring-border opacity-60"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">Move 3: Response</span>
                <span className="text-[10px] font-mono text-muted-foreground">Prover → Verifier</span>
              </div>
              <h3 className="font-mono text-sm font-bold text-foreground">
                Response s = (r + c·x) mod (p-1)
              </h3>
              <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
                {isImposter
                  ? `Imposter cannot compute (r + c·x) without x. Must submit preset fake s = ${fakeS}.`
                  : `Honest calculation: s = (${nonceR} + ${challengeC} · ${secretX}) mod ${params.p - 1} = ${responseS}`}
              </p>

              <div className="mt-3 p-2 rounded bg-background ring-1 ring-border font-mono text-xs">
                <span className="text-muted-foreground block text-[10px]">Response s:</span>
                <span className="font-bold text-emerald-400">{responseS}</span>
              </div>

              {step === 3 && (
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-mono text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Verify Schnorr Proof</span>
                </button>
              )}
            </div>
          </div>

          {/* Verification Drilldown */}
          {step >= 3 && (
            <div className={`p-4 rounded-xl ring-1 font-mono text-xs ${
              verificationResult.isValid
                ? "bg-emerald-500/10 ring-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-500/10 ring-rose-500/30 text-rose-800 dark:text-rose-300"
            }`}>
              <div className="flex items-center justify-between border-b border-current/20 pb-2 mb-2 font-bold text-sm">
                <span className="flex items-center gap-1.5">
                  {verificationResult.isValid ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span>Verification Satisfied: g^s ≡ R · y^c (mod p)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-rose-500" />
                      <span>Verification Failed: g^s ≢ R · y^c (mod p)</span>
                    </>
                  )}
                </span>
                <span className="text-xs">
                  {verificationResult.isValid ? "PROVER ACCEPTED" : "IMPOSTER REJECTED"}
                </span>
              </div>
              <p className="text-[11.5px] opacity-90">{verificationResult.formula}</p>
              {isImposter && !verificationResult.isValid && (
                <p className="mt-2 text-[11px] text-rose-400 font-semibold">
                  The imposter guessed ĉ = {guessedC}, but the verifier issued c = {challengeC}. Without the secret key x, the algebraic relationship collapsed!
                </p>
              )}
              {isImposter && verificationResult.isValid && (
                <p className="mt-2 text-[11px] text-amber-400 font-semibold">
                  Lucky imposter! The verifier happened to choose the exact guessed c = {guessedC}. In production with 256-bit challenges, this occurs with probability 2⁻²⁵⁶ (effectively impossible).
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: Graph 3-Coloring Interactive ZKP   */}
      {/* ========================================== */}
      {activeTab === "graph" && (
        <div className="space-y-6">
          {/* Graph Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-card ring-1 ring-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-primary">Prover Integrity:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsGraphCheating(false);
                    startNewGraphRound(false);
                  }}
                  className={`px-3 py-1 text-xs font-mono rounded-lg font-bold transition-colors cursor-pointer ${
                    !isGraphCheating ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" : "text-muted-foreground"
                  }`}
                >
                  Honest Coloring (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGraphCheating(true);
                    startNewGraphRound(true);
                  }}
                  className={`px-3 py-1 text-xs font-mono rounded-lg font-bold transition-colors cursor-pointer ${
                    isGraphCheating ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30" : "text-muted-foreground"
                  }`}
                >
                  Cheater (Conflict on Edge 0-1)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startNewGraphRound()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 font-mono text-xs font-bold text-foreground ring-1 ring-border transition-colors cursor-pointer"
              >
                <Dices className="size-3.5" />
                <span>New Commitment</span>
              </button>
              <button
                type="button"
                onClick={() => runMultiRounds(10)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 font-mono text-xs font-bold text-primary-foreground transition-colors cursor-pointer"
              >
                <Zap className="size-3.5" />
                <span>Run 10 Random Rounds</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG Graph Canvas */}
            <div className="lg:col-span-2 rounded-xl bg-neutral-950 p-4 ring-1 ring-border/80 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                <span>Select an edge to challenge prover commitment</span>
                <span>Vertices: {graph.vertices.length} | Edges: {graph.edges.length}</span>
              </div>

              <svg viewBox="0 0 400 320" className="w-full max-w-md h-72">
                {/* Edges */}
                {graph.edges.map((edge) => {
                  const u = graph.vertices[edge.u]!;
                  const v = graph.vertices[edge.v]!;
                  const isSelected = selectedEdge && selectedEdge.u === edge.u && selectedEdge.v === edge.v;

                  return (
                    <g key={`${edge.u}-${edge.v}`} className="cursor-pointer" onClick={() => challengeEdge(edge)}>
                      <line
                        x1={u.x}
                        y1={u.y}
                        x2={v.x}
                        y2={v.y}
                        stroke={isSelected ? "#38bdf8" : "#475569"}
                        strokeWidth={isSelected ? 3.5 : 2}
                        className="transition-all"
                      />
                      {/* Clickable transparent wider hitbox */}
                      <line
                        x1={u.x}
                        y1={u.y}
                        x2={v.x}
                        y2={v.y}
                        stroke="transparent"
                        strokeWidth={16}
                      />
                    </g>
                  );
                })}

                {/* Vertices */}
                {graph.vertices.map((vertex) => {
                  const isOpened =
                    selectedEdge && (selectedEdge.u === vertex.id || selectedEdge.v === vertex.id);
                  const colorId = roundCommitment.permutedColors[vertex.id] as ColorId;
                  const hexColor = isOpened ? COLOR_HEX[colorId] : "#1e293b";

                  return (
                    <g key={vertex.id}>
                      <circle
                        cx={vertex.x}
                        cy={vertex.y}
                        r={18}
                        fill={hexColor}
                        stroke={isOpened ? "#ffffff" : "#64748b"}
                        strokeWidth={2}
                        className="transition-all duration-300"
                      />
                      <text
                        x={vertex.x}
                        y={vertex.y + 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={11}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {isOpened ? COLOR_NAMES[colorId]?.slice(0, 1) : "?"}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="w-full mt-2 flex justify-center gap-4 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block ring-1 ring-white/20" />
                  Locked Commitment Box (SHA256)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                  Challenged Edge & Opened Boxes
                </span>
              </div>
            </div>

            {/* Verification & Soundness Panel */}
            <div className="space-y-4">
              {revealedResult && selectedEdge ? (
                <div className={`p-4 rounded-xl ring-1 font-mono text-xs ${
                  revealedResult.isValid
                    ? "bg-emerald-500/10 ring-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-500/10 ring-rose-500/30 text-rose-800 dark:text-rose-300"
                }`}>
                  <div className="flex items-center justify-between font-bold text-sm mb-2">
                    <span className="flex items-center gap-1.5">
                      {revealedResult.isValid ? (
                        <>
                          <CheckCircle2 className="size-4 text-emerald-500" />
                          <span>Valid Edge Coloring</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-4 text-rose-500" />
                          <span>Cheater Caught</span>
                        </>
                      )}
                    </span>
                    <span>Edge ({selectedEdge.u}, {selectedEdge.v})</span>
                  </div>
                  <div className="space-y-1 text-[11.5px]">
                    <div>V_{selectedEdge.u}: <strong>{COLOR_NAMES[revealedResult.uColor]}</strong></div>
                    <div>V_{selectedEdge.v}: <strong>{COLOR_NAMES[revealedResult.vColor]}</strong></div>
                    <div className="pt-2 text-[10.5px] opacity-80 border-t border-current/20">
                      Commitments match SHA256 hashes. Distinct colors verified without revealing remaining 3 vertices!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-card ring-1 ring-border font-mono text-xs text-muted-foreground text-center">
                  Click any edge on the graph to challenge the prover's commitment.
                </div>
              )}

              {/* Soundness Metric */}
              <div className="p-4 rounded-xl bg-card ring-1 ring-border space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase text-[10px] font-bold">Soundness Guarantee:</span>
                  <span className="text-primary font-bold">{totalRounds} Rounds Played</span>
                </div>

                <div className="space-y-1 text-[11.5px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Single-round cheat odds:</span>
                    <span className="font-bold">1 - 1/|E| = {((1 - 1 / numEdges) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Undetected after {totalRounds} rounds:</span>
                    <span className="font-bold text-sky-400">
                      {(cheatUndetectedProb * 100).toExponential(2)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-background rounded-full h-2 overflow-hidden ring-1 ring-border">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, (1 - cheatUndetectedProb) * 100))}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground text-center">
                  Confidence in Prover's Knowledge: {((1 - cheatUndetectedProb) * 100).toFixed(2)}%
                </div>
              </div>

              {/* Round History Log */}
              <div className="p-3 rounded-xl bg-background/50 ring-1 ring-border/80 font-mono text-xs max-h-48 overflow-y-auto">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Round History:</span>
                {roundHistory.length === 0 ? (
                  <span className="text-muted-foreground text-[11px]">No rounds played yet.</span>
                ) : (
                  <div className="space-y-1">
                    {roundHistory.map((item) => (
                      <div key={item.round} className="flex items-center justify-between text-[11px]">
                        <span>Round #{item.round} Edge {item.edge}</span>
                        <span className={`flex items-center gap-1 font-bold ${item.passed ? "text-emerald-500" : "text-rose-500"}`}>
                          {item.passed ? <Check className="size-3" /> : <X className="size-3" />}
                          <span>{item.passed ? "PASSED" : "CAUGHT"}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
