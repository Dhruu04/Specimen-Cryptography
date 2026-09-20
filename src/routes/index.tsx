import { createFileRoute, Link } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";
import { TrackRail } from "@/components/TrackRail";
import { lessonsForTrack, tracks, totalLessons } from "@/content";
import { getTool, tools } from "@/lib/tools";
import { Trophy, ArrowRight, ShieldCheck, BookOpen, Wrench, ShieldAlert } from "lucide-react";
import { challenges } from "@/content/challenges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Specimen — Master Cryptography & Cyber Security" },
      {
        name: "description",
        content:
          "Comprehensive interactive study notebook covering classical ciphers, AES, RSA, ECC, hashing, number theory, and attack vectors with step-by-step mathematical converters.",
      },
      { property: "og:title", content: "Specimen — Master Cryptography by Running It" },
      {
        property: "og:description",
        content:
          "Every algorithm, cipher, and number-theory concept, with step-by-step live converters you can test in the browser.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const caesar = getTool("caesar");

  return (
    <main className="space-y-6 sm:space-y-8">
      <TrackRail />

      {/* High-Density Command Center Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Core Mission & Quick Nav */}
        <div className="lg:col-span-7 rounded-2xl bg-card p-4.5 sm:p-6 border border-border shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Specimen Emblem"
                  className="size-7 shrink-0 rounded-full border border-border/80 shadow-2xs bg-white"
                />
                <span className="font-sans text-[13px] font-bold text-foreground">Specimen Laboratory</span>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] font-medium text-foreground/80 border border-border">
                {tracks.length} Tracks · {totalLessons} Lessons · {tools.length} Converters · {challenges.length} Challenges
              </span>
              <span className="flex items-center gap-1 rounded-full bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                <ShieldCheck className="size-3 text-emerald-600" /> 100% Client-Side
              </span>
            </div>

            <h1 className="font-sans text-[26px] sm:text-[32px] font-bold leading-tight text-foreground tracking-tight">
              Cryptography & Cyber Security, worked out by hand
            </h1>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Explore the mathematical logic behind every cipher, hash function, and attack vector. Trace Galois field arithmetic in AES, solve Bézout’s identity in Euclid's algorithm, witness Miller–Rabin primality tests, and examine post-quantum lattice reductions.
            </p>
          </div>

          <div className="pt-1 flex flex-wrap gap-2">
            <Link
              to="/tracks/$trackId"
              params={{ trackId: "classical" }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-[12.5px] font-medium text-background hover:bg-foreground/90 transition shadow-xs active:scale-98 whitespace-nowrap"
            >
              <BookOpen className="size-3.5" />
              <span>Curriculum</span>
            </Link>
            <Link
              to="/tools"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground border border-border hover:bg-muted transition active:scale-98 whitespace-nowrap"
            >
              <Wrench className="size-3.5 text-muted-foreground" />
              <span>Converters ({tools.length})</span>
            </Link>
            <Link
              to="/challenges"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground border border-border hover:bg-muted transition active:scale-98 whitespace-nowrap"
            >
              <Trophy className="size-3.5 text-foreground/70" />
              <span>Challenge Lab</span>
            </Link>
          </div>
        </div>

        {/* Right: Challenge Hub & Attack Simulator Quick Launch */}
        <div className="lg:col-span-5 rounded-2xl bg-card p-4.5 sm:p-5 border border-border shadow-xs flex flex-col justify-between space-y-3.5">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground text-background">
                  <Trophy className="size-3.5" />
                </div>
                <span className="font-sans text-[13px] font-bold text-foreground">
                  Cryptanalysis Challenge Lab
                </span>
              </div>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-foreground uppercase tracking-wider">
                {challenges.length} Scenarios
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Test your skills with real cryptographic challenges: exploit two-time pad keystream reuse, recover low-exponent RSA plaintexts, and break classical transposition ciphers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/70 text-[11px]">
            <Link
              to="/attacks"
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/70 hover:bg-muted hover:border-border transition group"
            >
              <div>
                <span className="block font-medium text-foreground group-hover:text-primary">Attack Lab</span>
                <span className="text-[10px] text-muted-foreground">ECB, CBC, DH MITM</span>
              </div>
              <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition" />
            </Link>
            <Link
              to="/handshake"
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/70 hover:bg-muted hover:border-border transition group"
            >
              <div>
                <span className="block font-medium text-foreground group-hover:text-primary">TLS Inspector</span>
                <span className="text-[10px] text-muted-foreground">1-RTT Handshake</span>
              </div>
              <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition" />
            </Link>
          </div>

          <Link
            to="/challenges"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-[12px] font-medium text-background hover:bg-foreground/90 transition shadow-xs text-center"
          >
            <span>Enter Challenge Lab</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>

      {/* Featured Live Converter */}
      {caesar && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="label-tiny">Interactive Laboratory Specimen</span>
              <span className="font-mono text-[10px] text-muted-foreground">Live Execution</span>
            </div>
            <Link to="/tools" className="text-[11.5px] text-muted-foreground hover:text-foreground font-medium transition flex items-center gap-1">
              <span>All {tools.length} converters</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
          <ToolPanel tool={caesar} compact />
        </section>
      )}

      {/* Compact Curriculum Tracks Grid */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="label-tiny">Curriculum Tracks ({tracks.length})</span>
            <span className="font-mono text-[10px] text-muted-foreground">Foundations to Frontiers</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">{totalLessons} Total Lessons</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((track, i) => (
            <Link
              key={track.id}
              to="/tracks/$trackId"
              params={{ trackId: track.id }}
              className="group rounded-xl bg-card p-3 sm:p-3.5 border border-border transition hover:border-foreground/40 hover:shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted font-mono text-[11px] font-semibold text-muted-foreground group-hover:bg-foreground group-hover:text-background transition">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="block font-sans text-[13.5px] font-semibold text-foreground group-hover:text-foreground transition truncate">
                      {track.name}
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.2 font-mono text-[9.5px] text-muted-foreground">
                      {lessonsForTrack(track.id).length}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground line-clamp-2">
                    {track.blurb}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Jump Converters */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="label-tiny">Advanced Laboratory Engines</span>
          <Link to="/tools" className="text-[11.5px] text-muted-foreground hover:text-foreground font-medium transition flex items-center gap-1">
            <span>View all {tools.length}</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { id: "enigma", name: "Enigma Machine" },
            { id: "aes-state", name: "AES State & Rounds" },
            { id: "rsa-suite", name: "RSA Suite & OAEP" },
            { id: "dh-mitm", name: "Diffie–Hellman & MITM" },
            { id: "ecc-point", name: "Elliptic Curves (ECC)" },
            { id: "merkle-tree", name: "Merkle Trees" },
            { id: "euclid-tableau", name: "Euclid Bézout Tableau" },
            { id: "padding-oracle", name: "Padding Oracle Attack" },
            { id: "chacha20", name: "ChaCha20 ARX" },
            { id: "timing-attack", name: "Timing Attack Demo" },
            { id: "zkp-schnorr", name: "Zero-Knowledge Proof" },
            { id: "base58", name: "Base58 (Bitcoin)" },
          ].map(({ id, name }) => {
            const tool = getTool(id);
            if (!tool) return null;
            return (
              <Link
                key={id}
                to="/tools/$toolId"
                params={{ toolId: id }}
                className="group rounded-xl bg-card p-2.5 border border-border transition hover:border-primary/40 hover:bg-muted/40"
              >
                <span className="block font-sans text-[12.5px] font-semibold text-foreground group-hover:text-primary transition truncate">
                  {tool.name}
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-tight text-muted-foreground line-clamp-2">
                  {tool.tagline}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
