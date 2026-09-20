import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  RotateCw,
  Check,
  X,
  Shuffle,
  Filter,
  BrainCircuit,
  GraduationCap,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Info,
  Lightbulb,
} from "lucide-react";
import { addScratchpadItem } from "@/components/UniversalScratchpad";
import { TrackRail } from "@/components/TrackRail";
import { FLASHCARDS_DATA, Flashcard } from "@/content/flashcardsData";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      {
        title: "Cryptographic Flashcards & Spaced Repetition | Cypher",
      },
      {
        name: "description",
        content:
          "Over 185+ mathematically rigorous flashcards mapped to the William Stallings curriculum. Master classical cryptanalysis, AES/ChaCha internals, RSA/ECC mathematics, post-quantum lattices, and zero-knowledge proofs.",
      },
    ],
  }),
  component: FlashcardsView,
});

export default function FlashcardsView() {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"study" | "grid">("study");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Spaced-repetition mastery status persisted in localStorage
  const [mastery, setMastery] = useState<Record<string, "known" | "review">>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cypher_flashcards_mastery");
      if (saved) {
        setMastery(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveMastery = (cardId: string, status: "known" | "review") => {
    const updated = { ...mastery, [cardId]: status };
    setMastery(updated);
    try {
      localStorage.setItem("cypher_flashcards_mastery", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetProgress = () => {
    if (confirm("Reset all flashcard mastery progress? This action cannot be undone.")) {
      setMastery({});
      try {
        localStorage.removeItem("cypher_flashcards_mastery");
      } catch {
        // Ignore
      }
    }
  };

  // Distinct tracks
  const tracks = useMemo(() => {
    const map = new Map<string, string>();
    FLASHCARDS_DATA.forEach((c) => {
      if (!map.has(c.trackId)) {
        map.set(c.trackId, c.trackName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  // Filtered card list
  const filteredCards = useMemo(() => {
    return FLASHCARDS_DATA.filter((c) => {
      if (selectedTrack !== "all" && c.trackId !== selectedTrack) return false;
      if (difficultyFilter !== "all" && c.difficulty !== difficultyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = c.question.toLowerCase().includes(q);
        const matchA = c.answer.toLowerCase().includes(q);
        const matchP = c.keyPoints.some((p) => p.toLowerCase().includes(q));
        const matchF = c.formula ? c.formula.toLowerCase().includes(q) : false;
        return matchQ || matchA || matchP || matchF;
      }
      return true;
    });
  }, [selectedTrack, difficultyFilter, searchQuery]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filteredCards.length, selectedTrack, difficultyFilter]);

  const currentCard = filteredCards[currentIndex] || null;

  // Deck statistics
  const stats = useMemo(() => {
    const total = FLASHCARDS_DATA.length;
    let known = 0;
    let review = 0;
    FLASHCARDS_DATA.forEach((c) => {
      if (mastery[c.id] === "known") known++;
      else if (mastery[c.id] === "review") review++;
    });
    const untouched = total - known - review;
    const masteryPct = total > 0 ? Math.round((known / total) * 100) : 0;
    return { total, known, review, untouched, masteryPct };
  }, [mastery]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    if (filteredCards.length > 1) {
      const randomIndex = Math.floor(Math.random() * filteredCards.length);
      setCurrentIndex(randomIndex);
    }
  };

  const copyCardToScratchpad = (card: Flashcard) => {
    addScratchpadItem(
      `Flashcard: ${card.question.slice(0, 32)}...`,
      `Q: ${card.question}\n\nA: ${card.answer}\n\n${card.formula ? `Formula: ${card.formula}\n\n` : ""}Key Takeaways:\n${card.keyPoints.map((k) => `- ${k}`).join("\n")}`,
      "text"
    );
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1" && currentCard) {
        saveMastery(currentCard.id, "review");
        handleNext();
      } else if (e.key === "2" && currentCard) {
        saveMastery(currentCard.id, "known");
        handleNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentCard, filteredCards.length]);

  return (
    <div className="mt-2 w-full space-y-4 pb-8 font-sans selection:bg-foreground selection:text-background">
      <TrackRail />

      {/* Header */}
      <div className="border-b border-border pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider text-muted-foreground font-mono mb-1">
            <BrainCircuit className="w-3.5 h-3.5 text-foreground" />
            <span>Academic Rigor · Spaced Repetition & Active Recall</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight uppercase text-foreground">
            Cryptographic Flashcards
          </h1>
          <p className="text-muted-foreground text-[13px] mt-0.5 max-w-2xl">
            {FLASHCARDS_DATA.length} mathematically rigorous flashcards mapped directly to the
            William Stallings 8th Edition curriculum. Test theoretical foundations, algorithmic mechanics,
            modular arithmetic proofs, and cryptanalytic vulnerabilities.
          </p>
        </div>

        {/* Global Progress Widget */}
        <div className="bg-card border border-border p-2.5 rounded-xl min-w-[240px] shadow-2xs self-start md:self-auto">
          <div className="flex justify-between items-center text-[10.5px] font-mono text-muted-foreground mb-1.5">
            <span className="font-semibold uppercase tracking-wider">Curriculum Mastery</span>
            <span className="text-foreground font-bold">{stats.masteryPct}%</span>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${stats.masteryPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
            <div className="border border-border bg-muted/30 p-1 rounded-md">
              <span className="text-foreground font-bold text-xs block">{stats.known}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Mastered</span>
            </div>
            <div className="border border-border bg-muted/30 p-1 rounded-md">
              <span className="text-foreground font-bold text-xs block">{stats.review}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Review</span>
            </div>
            <div className="border border-border bg-muted/30 p-1 rounded-md">
              <span className="text-foreground font-bold text-xs block">{stats.untouched}</span>
              <span className="text-[9px] text-muted-foreground uppercase">New</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Callout: How Spaced Repetition & Active Recall Work */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg border border-border bg-muted shrink-0 text-foreground">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px] flex items-center gap-2">
              <span>How to Master Cryptographic Concepts with Active Recall</span>
            </div>
            <p className="text-muted-foreground text-[11.5px] leading-relaxed">
              Active recall forces cognitive retrieval before checking the answer, strengthening neural pathways and long-term retention.
              Before clicking to flip or pressing <kbd className="border border-border bg-muted px-1 py-0.2 font-mono text-[9.5px] text-foreground rounded">Space</kbd>,
              mentally articulate the formal proof, formula, or cipher flaw.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-[10.5px]">
              <div className="border border-border bg-background p-2 rounded-lg">
                <span className="font-bold text-foreground block uppercase">1. Formulate</span>
                <span className="text-muted-foreground">State the formal algebra or attack mechanism out loud.</span>
              </div>
              <div className="border border-border bg-background p-2 rounded-lg">
                <span className="font-bold text-foreground block uppercase">2. Flip [Space]</span>
                <span className="text-muted-foreground">Verify against notation & key takeaways.</span>
              </div>
              <div className="border border-border bg-background p-2 rounded-lg">
                <span className="font-bold text-foreground block uppercase">3. Needs Review [1]</span>
                <span className="text-muted-foreground">Marks card for recurring review in this session.</span>
              </div>
              <div className="border border-border bg-background p-2 rounded-lg">
                <span className="font-bold text-foreground block uppercase">4. Mastered [2]</span>
                <span className="text-muted-foreground">Increments your verified curriculum score.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 text-xs font-mono rounded-lg">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="bg-transparent text-foreground outline-none cursor-pointer"
            >
              <option value="all">
                All Tracks ({FLASHCARDS_DATA.length})
              </option>
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 text-xs font-mono">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-transparent text-foreground outline-none cursor-pointer"
            >
              <option value="all">
                All Difficulties
              </option>
              <option value="Fundamental">
                Fundamental
              </option>
              <option value="Intermediate">
                Intermediate
              </option>
              <option value="Advanced">
                Advanced
              </option>
              <option value="Expert">
                Expert
              </option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 text-xs font-mono w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search concepts or proofs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-foreground outline-none w-full placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          <button
            onClick={() => setViewMode(viewMode === "study" ? "grid" : "study")}
            className="px-2.5 py-1 rounded-lg border border-border hover:border-foreground bg-card text-foreground text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
          >
            {viewMode === "study" ? (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>Study Mode</span>
              </>
            )}
          </button>

          <button
            onClick={handleShuffle}
            title="Shuffle deck"
            className="p-1.5 rounded-lg border border-border hover:border-foreground bg-card text-foreground transition-colors cursor-pointer shadow-2xs"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetProgress}
            title="Reset mastery progress"
            className="p-1.5 rounded-lg border border-border hover:border-foreground bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {filteredCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground font-mono bg-card">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm">No flashcards match the active filters or search criteria.</p>
            <button
              onClick={() => {
                setSelectedTrack("all");
                setDifficultyFilter("all");
                setSearchQuery("");
              }}
              className="mt-3 px-3 py-1.5 rounded-lg border border-foreground bg-foreground text-background text-xs uppercase tracking-wider font-mono font-bold cursor-pointer shadow-2xs"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "study" && currentCard ? (
          /* Single Card Study Mode */
          <div className="space-y-3.5">
            {/* Session Indicator */}
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-bold">
                  CARD {currentIndex + 1} / {filteredCards.length}
                </span>
                <span className="text-border">|</span>
                <span className="uppercase text-foreground">{currentCard.trackName}</span>
                <span className="text-border">|</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9.5px] uppercase font-bold border ${
                    currentCard.difficulty === "Expert"
                      ? "border-foreground bg-foreground text-background"
                      : currentCard.difficulty === "Advanced"
                      ? "border-foreground/60 text-foreground bg-muted"
                      : "border-border text-muted-foreground bg-muted/40"
                  }`}
                >
                  {currentCard.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {mastery[currentCard.id] === "known" && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-foreground font-bold">
                    <Check className="w-3 h-3 text-emerald-600" /> MASTERED
                  </span>
                )}
                {mastery[currentCard.id] === "review" && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-bold">
                    <RotateCw className="w-3 h-3 text-amber-600" /> NEEDS REVIEW
                  </span>
                )}
              </div>
            </div>

            {/* Flashcard Frame */}
            <div
              onClick={() => setIsFlipped((f) => !f)}
              className="group cursor-pointer perspective relative min-h-[260px] md:min-h-[300px] bg-card rounded-xl border border-border hover:border-foreground/60 transition-all p-5 sm:p-6 flex flex-col justify-between select-none shadow-2xs"
            >
              {/* Card Header Status */}
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-foreground inline-block" />
                  <span className="font-bold text-foreground text-[11px]">
                    {isFlipped ? "ANSWER & MATHEMATICAL PROOF" : "QUESTION / PROMPT"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors text-[11px]">
                  <Eye className="w-3 h-3" />
                  <span>Click or press SPACE to flip</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="my-auto py-4">
                {!isFlipped ? (
                  /* Front: Question */
                  <div className="space-y-3">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug tracking-tight">
                      {currentCard.question}
                    </h2>
                    <p className="text-muted-foreground text-xs font-mono">
                      Formulate the formal theorem, algebraic identity, or cryptanalytic vulnerability before flipping.
                    </p>
                  </div>
                ) : (
                  /* Back: Answer, Formula & Takeaways */
                  <div className="space-y-4">
                    <p className="text-sm md:text-base text-foreground leading-relaxed">
                      {currentCard.answer}
                    </p>

                    {currentCard.formula && (
                      <div className="bg-muted border border-border p-3 rounded-lg font-mono text-xs text-foreground overflow-x-auto">
                        <div className="text-[9.5px] text-muted-foreground uppercase tracking-widest mb-0.5 font-bold">
                          FORMAL NOTATION / ALGEBRAIC PROOF
                        </div>
                        <code className="font-bold">{currentCard.formula}</code>
                      </div>
                    )}

                    <div>
                      <div className="text-[9.5px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 font-bold">
                        CRITICAL TAKEAWAYS
                      </div>
                      <ul className="space-y-1 text-xs text-foreground font-mono">
                        {currentCard.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-foreground font-bold select-none">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Bar */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="text-[11px]">CARD ID: {currentCard.id}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyCardToScratchpad(currentCard);
                  }}
                  className="hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>{copiedId === currentCard.id ? "SAVED TO PAD" : "TO SCRATCHPAD"}</span>
                </button>
              </div>
            </div>

            {/* Interactive Response Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-lg border border-border hover:border-foreground bg-card text-foreground text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-lg border border-border hover:border-foreground bg-card text-foreground text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Spaced Repetition Grading */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    saveMastery(currentCard.id, "review");
                    handleNext();
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-border hover:border-foreground bg-muted text-foreground text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCw className="w-3 h-3 text-amber-600" />
                  <span>Need Review [1]</span>
                </button>

                <button
                  onClick={() => {
                    saveMastery(currentCard.id, "known");
                    handleNext();
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-foreground bg-foreground text-background hover:bg-foreground/90 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Mastered [2]</span>
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-center text-[10.5px] font-mono text-muted-foreground pt-1">
              Shortcuts: <kbd className="border border-border bg-muted px-1 py-0.2 rounded text-foreground">Space</kbd> Flip ·{" "}
              <kbd className="border border-border bg-muted px-1 py-0.2 rounded text-foreground">←</kbd> Prev ·{" "}
              <kbd className="border border-border bg-muted px-1 py-0.2 rounded text-foreground">→</kbd> Next ·{" "}
              <kbd className="border border-border bg-muted px-1 py-0.5 text-foreground">1</kbd> Review Later ·{" "}
              <kbd className="border border-border bg-muted px-1 py-0.5 text-foreground">2</kbd> Mastered
            </div>
          </div>
        ) : (
          /* Catalog / Grid View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCards.map((card, idx) => {
              const status = mastery[card.id];
              return (
                <div
                  key={card.id}
                  className="border border-border bg-card p-4 rounded-xl flex flex-col justify-between hover:border-foreground/60 transition-colors shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2">
                      <span className="uppercase font-semibold text-foreground">{card.trackName}</span>
                      <span
                        className={`px-1 py-0.5 text-[9px] uppercase border ${
                          card.difficulty === "Expert"
                            ? "border-foreground bg-foreground text-background font-bold"
                            : "border-border text-muted-foreground bg-muted/40"
                        }`}
                      >
                        {card.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground mb-3 line-clamp-2">
                      {card.question}
                    </h3>

                    <p className="text-xs text-muted-foreground font-sans line-clamp-3 mb-4 leading-relaxed">
                      {card.answer}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      {status === "known" ? (
                        <span className="text-[10px] text-foreground flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> MASTERED
                        </span>
                      ) : status === "review" ? (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <RotateCw className="w-3 h-3" /> REVIEW
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60">UNSTUDIED</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentIndex(idx);
                        setViewMode("study");
                      }}
                      className="text-foreground hover:underline flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold cursor-pointer"
                    >
                      <span>Study</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
