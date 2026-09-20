import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Trophy,
  CheckCircle2,
  Download,
  Printer,
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Wrench,
  Copy,
  Check,
  Share2,
  Trash2,
  Award,
  Lock,
  Compass,
  Hash,
  ExternalLink,
} from "lucide-react";
import { tracks, lessons } from "../content";
import { challenges } from "../content/challenges";
import { tools } from "../lib/tools";

export const Route = createFileRoute("/notebook")({
  head: () => ({
    meta: [
      {
        title: "Lab Notebook, Ranking & Certificate | Cypher Cryptographic Platform",
      },
      {
        name: "description",
        content:
          "Audit curriculum verification, track Cryptanalyst ranking tiers, log lab findings, and generate verifiable SHA-256 academic certificates.",
      },
    ],
  }),
  component: LabNotebookComponent,
});

interface CryptanalystTier {
  rank: number;
  title: string;
  minChallenges: number;
  minLessons: number;
  description: string;
  badgeCode: string;
}

const CRYPTANALYST_TIERS: CryptanalystTier[] = [
  {
    rank: 1,
    title: "Recruit Cryptanalyst",
    minChallenges: 0,
    minLessons: 0,
    description: "Initiated training in classical substitution, monoalphabetic frequency analysis, and basic encodings.",
    badgeCode: "TIER-I",
  },
  {
    rank: 2,
    title: "Cipher Operator",
    minChallenges: 4,
    minLessons: 6,
    description: "Proficient in polyalphabetic cryptanalysis, Kasiski inspection, Index of Coincidence, and rotor stepping.",
    badgeCode: "TIER-II",
  },
  {
    rank: 3,
    title: "Symmetric Specialist",
    minChallenges: 8,
    minLessons: 12,
    description: "Mastery over Feistel networks, AES Galois fields, CBC padding oracles, and Merkle-Damgård length extension.",
    badgeCode: "TIER-III",
  },
  {
    rank: 4,
    title: "Number Theorist",
    minChallenges: 12,
    minLessons: 18,
    description: "Capable of executing RSA-CRT exploitation, Håstad broadcast polynomial reduction, and discrete logarithm attacks.",
    badgeCode: "TIER-IV",
  },
  {
    rank: 5,
    title: "Protocol Exploiter",
    minChallenges: 18,
    minLessons: 24,
    description: "Advanced understanding of TLS 1.3 handshakes, replay vulnerabilities, zero-knowledge soundness, and side-channels.",
    badgeCode: "TIER-V",
  },
  {
    rank: 6,
    title: "Master Post-Quantum Cryptanalyst",
    minChallenges: 22,
    minLessons: 28,
    description: "Apex qualification: Deep lattice reduction, Kyber/Dilithium NTT arithmetic, and quantum-resistant architectures.",
    badgeCode: "TIER-VI / APEX",
  },
];

function LabNotebookComponent() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>([]);
  const [researcherName, setResearcherName] = useState<string>("Cryptographic Researcher");
  const [researcherNotes, setResearcherNotes] = useState<string>(
    `# Cryptographic Research Notebook & Verification Log\n\n## Objectives\n- Verify Stallings 8th Edition mathematical foundations.\n- Audit AES-256 S-Box non-linearity and Avalanche properties.\n- Benchmark ML-KEM-768 lattice encapsulation bounds against classical RSA-3072.\n\n## Key Observations\n- LSB steganography maintains >50 dB PSNR when embedding under 10% capacity.\n- ML-DSA rejection sampling guarantees zero secret key leakage across public signatures.`
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [certHash, setCertHash] = useState<string>("");
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedLessons = localStorage.getItem("cypher_completed_lessons");
      if (savedLessons) setCompletedLessons(JSON.parse(savedLessons));

      const savedChallenges = localStorage.getItem("cypher_solved_challenges");
      if (savedChallenges) setSolvedChallenges(JSON.parse(savedChallenges));

      const savedNotes = localStorage.getItem("cypher_researcher_notes");
      if (savedNotes) setResearcherNotes(savedNotes);

      const savedName = localStorage.getItem("cypher_researcher_name");
      if (savedName) setResearcherName(savedName);
    } catch {
      // ignore
    }
  }, []);

  // Completion stats
  const lessonPct = Math.round((completedLessons.length / lessons.length) * 100);
  const challengePct = Math.round((solvedChallenges.length / challenges.length) * 100);

  // Determine current Cryptanalyst Tier
  const currentTier = useMemo(() => {
    const cCount = solvedChallenges.length;
    const lCount = completedLessons.length;
    let earnedTier = CRYPTANALYST_TIERS[0]!;
    for (let i = CRYPTANALYST_TIERS.length - 1; i >= 0; i--) {
      const t = CRYPTANALYST_TIERS[i]!;
      if (cCount >= t.minChallenges && lCount >= t.minLessons) {
        earnedTier = t;
        break;
      }
    }
    return earnedTier;
  }, [solvedChallenges.length, completedLessons.length]);

  const nextTier = useMemo(() => {
    const nextIdx = CRYPTANALYST_TIERS.findIndex((t) => t.rank === currentTier.rank + 1);
    return nextIdx !== -1 ? CRYPTANALYST_TIERS[nextIdx] : null;
  }, [currentTier]);

  // Compute SHA-256 certificate verification fingerprint
  useEffect(() => {
    const computeFingerprint = async () => {
      const payload = `${researcherName}|TIER:${currentTier.rank}|LESSONS:${completedLessons.length}/${lessons.length}|CHALLENGES:${solvedChallenges.length}/${challenges.length}|PLATFORM:CYPHER-STALLINGS-8TH`;
      try {
        const buf = new TextEncoder().encode(payload);
        const hashBuf = await crypto.subtle.digest("SHA-256", buf);
        const hashArray = Array.from(new Uint8Array(hashBuf));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        setCertHash(hashHex.toUpperCase());
      } catch {
        setCertHash("E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855");
      }
    };
    computeFingerprint();
  }, [researcherName, currentTier.rank, completedLessons.length, solvedChallenges.length]);

  // Save notes and name
  const saveUserData = () => {
    try {
      localStorage.setItem("cypher_researcher_notes", researcherNotes);
      localStorage.setItem("cypher_researcher_name", researcherName);
      localStorage.setItem("cypher_completed_lessons", JSON.stringify(completedLessons));
      localStorage.setItem("cypher_solved_challenges", JSON.stringify(solvedChallenges));
    } catch {
      // ignore
    }
  };

  const toggleLesson = (id: string) => {
    setCompletedLessons((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("cypher_completed_lessons", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const markAllLessons = () => {
    const allIds = lessons.map((l) => l.id);
    setCompletedLessons(allIds);
    try {
      localStorage.setItem("cypher_completed_lessons", JSON.stringify(allIds));
    } catch {}
  };

  const resetAllProgress = () => {
    if (confirm("Reset all tracked progress in this browser?")) {
      setCompletedLessons([]);
      setSolvedChallenges([]);
      try {
        localStorage.removeItem("cypher_completed_lessons");
        localStorage.removeItem("cypher_solved_challenges");
      } catch {}
    }
  };

  // Markdown Export Generator
  const generateMarkdownReport = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let md = `# Cypher Cryptography Laboratory Notebook & Verification Dossier\n\n`;
    md += `**Researcher:** ${researcherName}  \n`;
    md += `**Date:** ${dateStr}  \n`;
    md += `**Cryptanalyst Rank:** ${currentTier.title} (${currentTier.badgeCode})  \n`;
    md += `**Curriculum Progress:** ${completedLessons.length} / ${lessons.length} lessons (${lessonPct}%)  \n`;
    md += `**CTF Challenges Solved:** ${solvedChallenges.length} / ${challenges.length} challenges (${challengePct}%)  \n`;
    md += `**SHA-256 Verification Digest:** \`${certHash}\`  \n\n`;
    md += `---\n\n`;
    md += `## Researcher Notes & Laboratory Log\n\n${researcherNotes}\n\n`;
    md += `---\n\n`;
    md += `## Curriculum Audit Status (Stallings Syllabus)\n\n`;

    tracks.forEach((tr) => {
      const trackLessons = lessons.filter((l) => l.trackId === tr.id);
      md += `### ${tr.name}\n\n`;
      trackLessons.forEach((l) => {
        const isDone = completedLessons.includes(l.id);
        md += `- [${isDone ? "x" : " "}] **${l.title}** — ${l.subtitle}\n`;
      });
      md += `\n`;
    });

    md += `---\n\n`;
    md += `## CTF Challenges & Exploits Log\n\n`;
    challenges.forEach((ch) => {
      const isDone = solvedChallenges.includes(ch.id);
      md += `- [${isDone ? "x" : " "}] **${ch.title}** (${ch.difficulty.toUpperCase()})\n`;
    });

    md += `\n---\n*Generated by Cypher Cryptographic Suite (100% Client-Side Private Workspace)*\n`;
    return md;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cypher_Lab_Notebook_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
              Portfolio & Laboratory Dossier
            </span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
              Progress & Verification
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Lab Notebook & Cryptanalyst Ranking
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Track curriculum verification, advance your Cryptanalyst tier, record laboratory findings,
            and generate verifiable SHA-256 academic certificates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 text-xs font-bold text-foreground transition cursor-pointer"
          >
            <Award className="size-3.5 text-primary" />
            <span>View Certificate</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 hover:bg-muted px-3 py-2 text-xs font-medium text-foreground transition cursor-pointer"
            title="Copy formatted Markdown"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied" : "Copy MD"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3.5 py-2 text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-xs"
          >
            <Download className="size-3.5" />
            <span>Download .MD</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 hover:bg-muted px-3 py-2 text-xs font-medium text-foreground transition cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Cryptanalyst Ranking Banner */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 border border-border bg-muted/50 rounded-lg">
                <Award className="size-6 text-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  CURRENT STANDING
                </div>
                <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                  <span>{currentTier.title}</span>
                  <span className="text-xs font-mono px-2 py-0.5 border border-border bg-muted rounded">
                    {currentTier.badgeCode}
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">{currentTier.description}</p>
          </div>

          {/* Next Tier Progression */}
          <div className="bg-muted/40 border border-border/80 p-4 rounded-xl min-w-[280px] space-y-2 font-mono text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>NEXT MILESTONE</span>
              <span className="text-foreground font-bold">
                {nextTier ? nextTier.title : "MAXIMUM RANK ACHIEVED"}
              </span>
            </div>
            {nextTier ? (
              <>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Challenges:</span>
                    <span className="text-foreground font-semibold">
                      {solvedChallenges.length} / {nextTier.minChallenges}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lessons:</span>
                    <span className="text-foreground font-semibold">
                      {completedLessons.length} / {nextTier.minLessons}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((solvedChallenges.length / (nextTier.minChallenges || 1) +
                            completedLessons.length / (nextTier.minLessons || 1)) /
                            2) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                All 6 curriculum certifications verified.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 print:grid-cols-3">
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Curriculum Lessons
            </span>
            <BookOpen className="size-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {completedLessons.length}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / {lessons.length} ({lessonPct}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${lessonPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              CTF Challenges Solved
            </span>
            <Trophy className="size-4 text-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {solvedChallenges.length}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / {challenges.length} ({challengePct}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-foreground h-full rounded-full transition-all duration-300"
              style={{ width: `${challengePct}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Available Tool Converters
            </span>
            <Wrench className="size-4 text-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{tools.length}</span>
            <span className="text-xs text-muted-foreground font-mono">Calculators & Visualizers</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Classical, Symmetric, Hashes, Asymmetric & PQC.
          </div>
        </div>
      </div>

      {/* Researcher Identity & Custom Notes */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-4 print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-primary" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Laboratory Log & Field Notes</h2>
              <p className="text-xs text-muted-foreground">
                Document your observations, cryptanalysis discoveries, and verification steps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <input
              type="text"
              value={researcherName}
              onChange={(e) => {
                setResearcherName(e.target.value);
                localStorage.setItem("cypher_researcher_name", e.target.value);
              }}
              className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs font-medium text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Researcher Name..."
            />
            <button
              type="button"
              onClick={saveUserData}
              className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition cursor-pointer"
            >
              <Save className="size-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={researcherNotes}
          onChange={(e) => {
            setResearcherNotes(e.target.value);
            localStorage.setItem("cypher_researcher_notes", e.target.value);
          }}
          className="w-full rounded-xl bg-background border border-border p-3.5 text-xs font-mono leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y print:border-none print:p-0"
          placeholder="Enter notes, experiment results, equations..."
        />
      </div>

      {/* Interactive Curriculum Checklist */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" /> Curriculum Syllabus Verification Checklist
            </h2>
            <p className="text-xs text-muted-foreground">
              Check off modules as you complete reading and lab exercises.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={markAllLessons}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
            >
              Mark All Complete
            </button>
            <button
              type="button"
              onClick={resetAllProgress}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-muted hover:bg-rose-500/20 text-rose-500 transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((tr) => {
            const trackLessons = lessons.filter((l) => l.trackId === tr.id);
            const doneCount = trackLessons.filter((l) => completedLessons.includes(l.id)).length;

            return (
              <div key={tr.id} className="space-y-2.5 rounded-xl border border-border/70 p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">{tr.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {doneCount} / {trackLessons.length}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {trackLessons.map((l) => {
                    const isDone = completedLessons.includes(l.id);
                    return (
                      <div
                        key={l.id}
                        onClick={() => toggleLesson(l.id)}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer border ${
                          isDone
                            ? "bg-primary/5 border-primary/20 text-foreground font-medium"
                            : "bg-background border-border/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                          className="rounded border-border accent-primary cursor-pointer"
                        />
                        <span className="truncate flex-1">{l.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formal Academic Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border-2 border-border max-w-3xl w-full p-8 md:p-12 shadow-2xl relative space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xs font-mono uppercase tracking-widest border border-border px-2.5 py-1 transition print:hidden cursor-pointer"
            >
              [Close]
            </button>

            {/* Academic Certificate Viewport */}
            <div className="border-4 border-double border-border p-8 md:p-10 space-y-8 text-center bg-background">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  <Award className="size-4 text-foreground" />
                  <span>Specimen Cryptographic Verification Institute</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-wider text-foreground">
                  Certificate of Cryptanalytic Standing
                </h2>
                <div className="w-24 h-0.5 bg-foreground mx-auto mt-2" />
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase font-mono text-muted-foreground">
                  This official academic credential certifies that
                </p>
                <div className="text-2xl md:text-3xl font-black font-sans tracking-tight text-foreground border-b border-border/60 pb-1 max-w-md mx-auto">
                  {researcherName || "Cryptographic Researcher"}
                </div>
                <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  has demonstrated verified competence in cryptographic engineering, mathematical
                  foundations, vulnerability analysis, and post-quantum transitions pursuant to the
                  William Stallings 8th Edition syllabus.
                </p>
              </div>

              <div className="bg-muted/40 border border-border p-4 max-w-md mx-auto space-y-1">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">
                  AWARDED CRYPTANALYST RANK
                </div>
                <div className="text-lg font-black font-mono text-foreground uppercase">
                  {currentTier.title}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Verification Level: {currentTier.badgeCode}
                </div>
              </div>

              {/* Metrics & Hash */}
              <div className="grid grid-cols-2 gap-4 text-left font-mono text-xs border-t border-border pt-4 max-w-md mx-auto">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Syllabus Modules</div>
                  <div className="font-bold text-foreground">
                    {completedLessons.length} / {lessons.length} Completed
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">CTF Exploits</div>
                  <div className="font-bold text-foreground">
                    {solvedChallenges.length} / {challenges.length} Solved
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-left font-mono text-[10px] border-t border-border pt-3 max-w-md mx-auto">
                <div className="text-muted-foreground uppercase flex items-center gap-1">
                  <Hash className="size-3 text-muted-foreground" />
                  <span>SHA-256 Verification Fingerprint</span>
                </div>
                <div className="break-all font-mono text-foreground/80 bg-muted/30 p-2 border border-border/50 text-[9px]">
                  {certHash}
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="flex items-center justify-between pt-6 border-t border-border text-xs font-mono text-muted-foreground">
                <div className="text-left">
                  <div className="text-foreground font-semibold">Cypher Kernel Registry</div>
                  <div className="text-[10px]">Client-Side Protocol Engine</div>
                </div>
                <div className="text-right">
                  <div className="text-foreground font-semibold">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-[10px]">Date of Certification</div>
                </div>
              </div>
            </div>

            {/* Print action inside modal */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 border border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
              >
                <Printer className="size-3.5" />
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
