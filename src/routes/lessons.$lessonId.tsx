import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ToolPanel } from "@/components/ToolPanel";
import { TrackRail } from "@/components/TrackRail";
import { getLesson, getTrack, lessonNeighbours, lessonNumber, lessonsForTrack } from "@/content";
import { getTool } from "@/lib/tools";
import {
  ArrowLeft,
  ArrowRight,
  Wrench,
  Trophy,
  Copy,
  Check,
  BookOpen,
  Sigma,
  CheckCircle2,
  Bookmark,
  Layers,
  Calculator,
  ShieldAlert,
  ExternalLink,
  Code,
  HelpCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { challenges } from "@/content/challenges";
import { getCodeRecipeForLesson } from "@/content/codebook";
import { getQuizForLesson } from "@/content/quizzes";

export const Route = createFileRoute("/lessons/$lessonId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.lessonId);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Lesson unavailable — Specimen" }, { name: "robots", content: "noindex" }] };
    const { lesson } = loaderData;
    const description = `${lesson.subtitle}. ${lesson.body[0]?.slice(0, 110) ?? ""}…`;
    return {
      meta: [
        { title: `${lesson.title} — Specimen` },
        { name: "description", description },
        { property: "og:title", content: `${lesson.title} — Specimen` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LessonPage,
});

type SectionTab = "all" | "theory" | "formula" | "example" | "pitfalls" | "code" | "quiz" | "references" | "glossary";

function LessonPage() {
  const { lesson } = Route.useLoaderData();
  const navigate = useNavigate();
  const track = getTrack(lesson.trackId);
  const number = lessonNumber(lesson);
  const total = lessonsForTrack(lesson.trackId).length;
  const { prev, next } = lessonNeighbours(lesson);
  const tool = lesson.toolId ? getTool(lesson.toolId) : undefined;
  const relatedChallenge = challenges.find((c) => c.toolId === lesson.toolId || c.trackId === lesson.trackId);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionTab>("all");
  const [mobileTab, setMobileTab] = useState<"notes" | "tool">("notes");

  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("specimen_bookmarked_lessons");
      const list: string[] = saved ? JSON.parse(saved) : [];
      return list.includes(lesson.id);
    } catch {
      return false;
    }
  });

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("specimen_completed_lessons");
      const list: string[] = saved ? JSON.parse(saved) : [];
      return list.includes(lesson.id);
    } catch {
      return false;
    }
  });

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem("specimen_bookmarked_lessons");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(lesson.id)) {
        list = list.filter((id) => id !== lesson.id);
        setIsBookmarked(false);
      } else {
        list.push(lesson.id);
        setIsBookmarked(true);
      }
      localStorage.setItem("specimen_bookmarked_lessons", JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  const toggleCompleted = () => {
    try {
      const saved = localStorage.getItem("specimen_completed_lessons");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(lesson.id)) {
        list = list.filter((id) => id !== lesson.id);
        setIsCompleted(false);
      } else {
        list.push(lesson.id);
        setIsCompleted(true);
      }
      localStorage.setItem("specimen_completed_lessons", JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  // Keyboard navigation [ and ]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "[" && prev) {
        e.preventDefault();
        navigate({ to: "/lessons/$lessonId", params: { lessonId: prev.id } });
      } else if (e.key === "]" && next) {
        e.preventDefault();
        navigate({ to: "/lessons/$lessonId", params: { lessonId: next.id } });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next, navigate]);

  const exportStudyNotes = async () => {
    let md = `# ${lesson.title}\n\n`;
    md += `**Track**: ${track?.name || lesson.trackId} | **Lesson #${number}**\n\n`;
    md += `## Summary\n${lesson.subtitle}\n\n`;
    md += `## Key Concepts\n`;
    lesson.body.forEach((b) => {
      md += `- ${b}\n`;
    });
    if (lesson.formula) {
      md += `\n## Mathematical Formulation\n`;
      if (lesson.formula.badge) md += `**${lesson.formula.badge}**\n`;
      md += `\`\`\`latex\n${lesson.formula.expr}\n\`\`\`\n`;
      if (lesson.formula.note) md += `${lesson.formula.note}\n`;
    }
    if (lesson.pitfalls && lesson.pitfalls.length > 0) {
      md += `\n## Critical Pitfalls & Antipatterns\n`;
      lesson.pitfalls.forEach((p) => {
        md += `- ${p}\n`;
      });
    }
    if (lesson.references && lesson.references.length > 0) {
      md += `\n## Authoritative References\n`;
      lesson.references.forEach((r) => {
        md += `- [${r.title}](${r.url}) (${r.source})\n`;
      });
    }
    if (lesson.glossary && lesson.glossary.length > 0) {
      md += `\n## Defined Glossary Terms\n`;
      lesson.glossary.forEach((g) => {
        md += `- **${g.term}**: ${g.def}\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(md);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
    } catch {
      // Fallback
    }
  };

  const codeRecipe = getCodeRecipeForLesson(lesson.id);
  const [selectedLang, setSelectedLang] = useState<"python" | "rust" | "go" | "typescript">("typescript");
  const [copiedCode, setCopiedCode] = useState(false);

  const quizQuestions = getQuizForLesson(lesson.id);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    if (quizAnswers[qId] !== undefined) return; // already answered
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const hasFormula = Boolean(lesson.formula);
  const hasExample = Boolean(lesson.workedExample);
  const hasPitfalls = Boolean(lesson.pitfalls && lesson.pitfalls.length > 0);
  const hasReferences = Boolean(lesson.references && lesson.references.length > 0);
  const hasGlossary = Boolean(lesson.glossary && lesson.glossary.length > 0);

  return (
    <main className="mt-2 sm:mt-3 space-y-4 w-full pb-10">
      <TrackRail activeId={lesson.trackId} />

      {/* Lesson Header Toolbar */}
      <section className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Link
              to="/tracks/$trackId"
              params={{ trackId: lesson.trackId }}
              className="font-mono text-[10px] font-semibold tracking-wider text-primary px-2 py-0.5 rounded bg-muted border border-border hover:bg-muted/80 transition"
            >
              SPECIMEN #{String(number).padStart(2, "0")}
            </Link>
            <span className="font-mono text-[10.5px] text-muted-foreground uppercase tracking-wider">
              {track?.name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({String(number).padStart(2, "0")} / {String(total).padStart(2, "0")})
            </span>
          </div>

          {/* Action Tools: Bookmark, Complete, Export Notes */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={toggleBookmark}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border transition active:scale-95 cursor-pointer ${
                isBookmarked
                  ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold"
                  : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
              }`}
              title="Bookmark this lesson"
            >
              <Bookmark className={`size-3.5 ${isBookmarked ? "fill-amber-600 text-amber-600" : ""}`} />
              <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>

            <button
              type="button"
              onClick={toggleCompleted}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border transition active:scale-95 cursor-pointer ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold"
                  : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
              }`}
              title="Mark lesson completed"
            >
              <CheckCircle2 className={`size-3.5 ${isCompleted ? "text-emerald-600" : ""}`} />
              <span>{isCompleted ? "Completed" : "Complete"}</span>
            </button>

            <button
              type="button"
              onClick={exportStudyNotes}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition active:scale-95 cursor-pointer"
              title="Copy formatted lesson notes in Markdown"
            >
              {copiedNotes ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <FileText className="size-3.5 text-primary" />
                  <span>Export</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <h1 className="font-sans text-[24px] sm:text-[28px] font-bold leading-tight text-foreground tracking-tight">
            {lesson.title}
          </h1>
          <p className="mt-0.5 max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">
            {lesson.subtitle}
          </p>
        </div>

        {/* Sticky Minimalist Section Navigation Filter */}
        <div className="sticky top-11 z-20 -mx-3 px-3 sm:-mx-5 sm:px-5 py-1.5 bg-background/90 backdrop-blur-md border-b border-border/70 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSection("all")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
              activeSection === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Layers className="size-3" />
            <span>Complete</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("theory")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
              activeSection === "theory"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <BookOpen className="size-3" />
            <span>Theory</span>
          </button>

          {hasFormula && (
            <button
              type="button"
              onClick={() => setActiveSection("formula")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                activeSection === "formula"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Sigma className="size-3" />
              <span>Formulation</span>
            </button>
          )}

          {hasExample && (
            <button
              type="button"
              onClick={() => setActiveSection("example")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                activeSection === "example"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Calculator className="size-3" />
              <span>Worked Example</span>
            </button>
          )}

          {hasPitfalls && (
            <button
              type="button"
              onClick={() => setActiveSection("pitfalls")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                activeSection === "pitfalls"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <ShieldAlert className="size-3" />
              <span>Pitfalls ({lesson.pitfalls?.length})</span>
            </button>
          )}

          {codeRecipe && (
            <button
              type="button"
              onClick={() => setActiveSection("code")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                activeSection === "code"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Code className="size-3" />
              <span>Code (4 Langs)</span>
            </button>
          )}

          {quizQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveSection("quiz")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                activeSection === "quiz"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <HelpCircle className="size-3" />
              <span>Quiz ({quizQuestions.length})</span>
            </button>
          )}

          {hasReferences && (
            <button
              type="button"
              onClick={() => setActiveSection("references")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                activeSection === "references"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <ExternalLink className="size-3" />
              <span>References ({lesson.references?.length})</span>
            </button>
          )}

          {hasGlossary && (
            <button
              type="button"
              onClick={() => setActiveSection("glossary")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0 ${
                activeSection === "glossary"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Bookmark className="size-3" />
              <span>Glossary ({lesson.glossary?.length})</span>
            </button>
          )}
        </div>
      </section>

      {/* Mobile Switcher between Lesson Theory & Interactive Lab Engine */}
      {tool && (
        <div className="xl:hidden flex items-center p-1 bg-muted/80 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setMobileTab("notes")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition cursor-pointer ${
              mobileTab === "notes"
                ? "bg-card text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="size-3.5" />
            <span>Lesson Theory</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("tool")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition cursor-pointer ${
              mobileTab === "tool"
                ? "bg-card text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="size-3.5 text-primary" />
            <span>Interactive Lab ({tool.name})</span>
          </button>
        </div>
      )}

      {/* Main Content Workspace Layout */}
      <div className={tool ? "grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-start" : "max-w-4xl mx-auto space-y-4"}>
        <div className={tool ? `xl:col-span-7 2xl:col-span-8 space-y-4 ${mobileTab === "notes" ? "block" : "hidden xl:block"}` : "space-y-4"}>
          {/* Section 1: Mathematical Formulation (if applicable) */}
          {lesson.formula && (activeSection === "all" || activeSection === "formula") && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider font-semibold text-primary px-2 py-0.5 rounded bg-muted">
                    MATHEMATICAL FORMULATION
                  </span>
                  {lesson.formula.badge && (
                    <span className="font-mono text-[9.5px] text-muted-foreground px-2 py-0.5 rounded border border-border">
                      {lesson.formula.badge}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!lesson.formula) return;
                    try {
                      await navigator.clipboard.writeText(lesson.formula.expr);
                      setCopiedFormula(true);
                      setTimeout(() => setCopiedFormula(false), 2000);
                    } catch {
                      // Ignore
                    }
                  }}
                  className="flex items-center gap-1 rounded bg-background px-2 py-0.5 text-[10.5px] font-mono text-muted-foreground border border-border hover:text-foreground active:scale-95 transition"
                >
                  {copiedFormula ? (
                    <>
                      <Check className="size-3 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy Expr</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-3 rounded-lg bg-muted/40 p-3 border border-border/60">
                <p className="break-words font-mono text-[14px] sm:text-[15px] text-primary font-bold leading-relaxed tracking-tight">
                  {lesson.formula.expr}
                </p>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
                {lesson.formula.note}
              </p>
            </section>
          )}

          {/* Section 2: Theory & Deep Background */}
          {(activeSection === "all" || activeSection === "theory") && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/70">
                <BookOpen className="size-4 text-primary" />
                <h2 className="font-sans text-[14px] font-bold text-foreground">
                  Curriculum Theory & Principles
                </h2>
              </div>
              <div className="space-y-3">
                {lesson.body.map((paragraph, i) => (
                  <p key={i} className="text-[14px] leading-relaxed text-foreground/90 font-normal">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Worked Mathematical Specimen */}
          {(activeSection === "all" || activeSection === "example") && lesson.workedExample && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 text-primary" />
                  <span className="font-mono text-[9.5px] uppercase tracking-wider font-semibold text-primary px-2 py-0.5 rounded bg-muted">
                    WORKED MATHEMATICAL SPECIMEN
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Step-by-step breakdown
                </span>
              </div>

              <div>
                <h2 className="font-sans text-[15px] font-bold text-foreground">
                  {lesson.workedExample.title}
                </h2>
              </div>

              <div className="space-y-2">
                {lesson.workedExample.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-start gap-2 rounded-lg bg-muted/30 p-3 border border-border/60"
                  >
                    <span className="shrink-0 font-mono text-[10.5px] font-bold text-primary px-2 py-0.5 rounded bg-background border border-border shadow-2xs self-start">
                      {step.label}
                    </span>
                    <p className="text-[12.5px] leading-relaxed text-foreground/90 font-mono sm:font-sans">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-primary/5 p-3 border border-primary/20 flex items-start gap-2.5">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider font-semibold text-primary block">
                    Specimen Outcome
                  </span>
                  <p className="text-[12px] leading-relaxed text-foreground/90 mt-0.5 font-medium">
                    {lesson.workedExample.outcome}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Section 4: Operational Key Points */}
          {(activeSection === "all" || activeSection === "theory") && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/70">
                <CheckCircle2 className="size-4 text-primary" />
                <h2 className="font-sans text-[14px] font-bold text-foreground">
                  Core Operational Key Points
                </h2>
              </div>
              <ul className="space-y-2">
                {lesson.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-foreground">
                    <span className="grid size-5 shrink-0 place-items-center rounded bg-muted font-mono text-[10px] font-bold text-primary border border-border mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Section 5: Beginner Pitfalls & Traps */}
          {(activeSection === "all" || activeSection === "pitfalls") && lesson.pitfalls && lesson.pitfalls.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-border/70">
                <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
                <h2 className="font-sans text-[14px] font-bold text-foreground">
                  Beginner Pitfalls & Security Traps
                </h2>
                <span className="ml-auto font-mono text-[9.5px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                  {lesson.pitfalls.length} Critical Traps
                </span>
              </div>
              <div className="space-y-2">
                {lesson.pitfalls.map((pitfall, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-amber-500/5 p-2.5 border border-amber-500/20 text-[12.5px]"
                  >
                    <span className="grid size-4 shrink-0 place-items-center rounded bg-amber-500/15 font-mono text-[9.5px] font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                      !
                    </span>
                    <p className="leading-relaxed text-foreground/90">{pitfall}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 6: Authoritative Open References */}
          {(activeSection === "all" || activeSection === "references") && lesson.references && lesson.references.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border/70">
                <ExternalLink className="size-4 text-primary" />
                <h2 className="font-sans text-[14px] font-bold text-foreground">
                  Authoritative Open References & Primary Sources
                </h2>
                <span className="ml-auto font-mono text-[9.5px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full font-semibold">
                  100% Free & Open Access
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {lesson.references.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between rounded-lg bg-muted/30 hover:bg-muted/60 p-3 border border-border/70 transition hover:border-foreground/30"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-primary px-1.5 py-0.5 rounded bg-muted border border-border">
                          {ref.source}
                        </span>
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.2 rounded bg-background border border-border/50">
                          {ref.type}
                        </span>
                      </div>
                      <h3 className="font-sans text-[12.5px] font-bold text-foreground group-hover:text-primary transition group-hover:underline leading-snug">
                        {ref.title}
                      </h3>
                      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                        {ref.description}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-1.5 border-t border-border/50 flex items-center justify-between text-[10.5px] font-mono text-primary font-medium">
                      <span>Open Document</span>
                      <span className="transition group-hover:translate-x-0.5">↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Section 7: Defined Terms / Glossary */}
          {lesson.glossary && lesson.glossary.length > 0 && (activeSection === "all" || activeSection === "glossary") && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/70">
                <Bookmark className="size-4 text-primary" />
                <h2 className="font-sans text-[14px] font-bold text-foreground">
                  Specimen Glossary & Lexicon
                </h2>
              </div>
              <dl className="grid gap-2.5 sm:grid-cols-2">
                {lesson.glossary.map((entry) => (
                  <div key={entry.term} className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="font-sans text-[13px] font-semibold text-primary">{entry.term}</dt>
                    <dd className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{entry.def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Section: Production Hardened Codebook */}
          {codeRecipe && (activeSection === "all" || activeSection === "code") && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <Code className="size-4 text-primary" />
                  <span className="font-mono text-[9.5px] uppercase tracking-wider font-semibold text-primary px-2 py-0.5 rounded bg-muted">
                    PRODUCTION HARDENED RECIPES
                  </span>
                  <span className="font-mono text-[9.5px] text-muted-foreground px-2 py-0.5 rounded border border-border">
                    {codeRecipe.standard}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const snippet = codeRecipe.snippets[selectedLang];
                    if (!snippet) return;
                    try {
                      await navigator.clipboard.writeText(snippet.code);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    } catch {
                      // Ignore
                    }
                  }}
                  className="flex items-center gap-1 font-mono text-[10.5px] text-muted-foreground hover:text-foreground transition active:scale-95"
                >
                  {copiedCode ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div>
                <h2 className="font-sans text-[14.5px] font-bold text-foreground">
                  {codeRecipe.algorithmName}
                </h2>
                <p className="mt-1 text-[11.5px] font-mono text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-200">
                  {codeRecipe.antipattern}
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 border-b border-border/60 pb-2">
                {(["python", "rust", "go", "typescript"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition cursor-pointer ${
                      selectedLang === lang
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="text-[11.5px] text-muted-foreground">
                  {codeRecipe.snippets[selectedLang]?.notes}
                </p>
                <div className="rounded-lg bg-muted/40 p-3 border border-border/70 overflow-x-auto">
                  <pre className="font-mono text-[11.5px] leading-relaxed text-foreground">
                    <code>{codeRecipe.snippets[selectedLang]?.code}</code>
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* Section: Checkpoint Knowledge Check */}
          {quizQuestions.length > 0 && (activeSection === "all" || activeSection === "quiz") && (
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-4 text-primary" />
                  <span className="font-mono text-[9.5px] uppercase tracking-wider font-semibold text-primary px-2 py-0.5 rounded bg-muted">
                    CHECKPOINT KNOWLEDGE CHECK
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {Object.keys(quizAnswers).length} / {quizQuestions.length} Answered
                </span>
              </div>

              <div className="space-y-4">
                {quizQuestions.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div key={q.id} className="space-y-2.5 rounded-lg bg-muted/20 p-3.5 border border-border/60">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase font-semibold text-muted-foreground">
                          Question {qIdx + 1} · {q.topic}
                        </span>
                        {isAnswered && (
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                              isCorrect
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            <span>{isCorrect ? "Correct" : "Incorrect"}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-sans text-[13.5px] font-semibold text-foreground leading-snug">
                        {q.question}
                      </h3>

                      <div className="grid gap-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selectedOpt === optIdx;
                          let btnStyle = "bg-background text-foreground/90 border-border hover:bg-muted/50";
                          if (isAnswered) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = "bg-emerald-50 text-emerald-900 border-emerald-300 font-medium";
                            } else if (isThisSelected) {
                              btnStyle = "bg-rose-50 text-rose-900 border-rose-300 font-medium";
                            } else {
                              btnStyle = "bg-background text-muted-foreground/60 border-border/40 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-[12px] transition flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && optIdx === q.correctIndex && (
                                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                              )}
                              {isAnswered && isThisSelected && optIdx !== q.correctIndex && (
                                <XCircle className="size-3.5 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className="rounded-lg bg-background p-3 border border-border/80 text-[11.5px] leading-relaxed text-muted-foreground">
                          <strong className="text-foreground block font-mono text-[10.5px] mb-0.5">
                            Explanation:
                          </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Sticky Column for Interactive Laboratory Converter */}
        {tool && (
          <aside className={`xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-20 space-y-3.5 ${mobileTab === "tool" ? "block" : "hidden xl:block"}`}>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Wrench className="size-3 text-primary" /> Interactive Laboratory
                </p>
                <Link
                  to="/tools/$toolId"
                  params={{ toolId: tool.id }}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Full workbench →
                </Link>
              </div>
              <ToolPanel tool={tool} compact />
            </section>

            {relatedChallenge && (
              <section className="rounded-xl border border-border bg-card p-3.5 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-7 shrink-0 place-items-center rounded-md bg-muted border border-border text-primary">
                    <Trophy className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-sans text-[12.5px] font-semibold text-foreground">
                      Cryptanalysis Challenge
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                      "{relatedChallenge.title}"
                    </p>
                  </div>
                </div>
                <Link
                  to="/challenges"
                  className="shrink-0 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background hover:bg-foreground/90 active:scale-95 transition text-center"
                >
                  Solve →
                </Link>
              </section>
            )}
          </aside>
        )}
      </div>

      {!tool && relatedChallenge && (
        <section className="max-w-4xl mx-auto rounded-xl border border-border bg-card p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted border border-border text-primary">
              <Trophy className="size-4" />
            </div>
            <div>
              <p className="font-sans text-[13.5px] font-semibold text-foreground">
                Apply concepts in the Cryptanalysis Lab
              </p>
              <p className="text-[12px] text-muted-foreground">
                Challenge "{relatedChallenge.title}" tests the methods analyzed in this specimen.
              </p>
            </div>
          </div>
          <Link
            to="/challenges"
            className="shrink-0 rounded-lg bg-foreground px-3 py-1.5 text-[11.5px] font-medium text-background hover:bg-foreground/90 active:scale-95 transition text-center"
          >
            Solve Challenge →
          </Link>
        </section>
      )}

      {/* Compact Track Navigation Footer */}
      <nav className="border-t border-border pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Curriculum Navigation · Press [ or ]
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {prev ? (
            <Link
              to="/lessons/$lessonId"
              params={{ lessonId: prev.id }}
              className="group flex items-center gap-2.5 rounded-xl bg-card p-3 border border-border transition hover:border-foreground/30 hover:shadow-2xs active:scale-98"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background transition border border-border">
                <ArrowLeft className="size-3.5" />
              </span>
              <div className="min-w-0">
                <span className="block text-[9.5px] font-mono uppercase tracking-wider text-muted-foreground">Previous</span>
                <span className="block font-sans text-[13px] font-medium text-foreground truncate">{prev.title}</span>
              </div>
            </Link>
          ) : <div />}

          {next && (
            <Link
              to="/lessons/$lessonId"
              params={{ lessonId: next.id }}
              className="group flex items-center justify-between gap-2.5 rounded-xl bg-card p-3 border border-border transition hover:border-foreground/30 hover:shadow-2xs active:scale-98 sm:col-start-2"
            >
              <div className="min-w-0">
                <span className="block text-[9.5px] font-mono uppercase tracking-wider text-muted-foreground">Next</span>
                <span className="block font-sans text-[13px] font-medium text-foreground truncate">{next.title}</span>
              </div>
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background transition border border-border">
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
