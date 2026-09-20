import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TrackRail } from "@/components/TrackRail";
import { tracks } from "@/content";
import { tools } from "@/lib/tools";
import { Search, ArrowRight, Wrench } from "lucide-react";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "Converters & Laboratory — Specimen" },
      {
        name: "description",
        content:
          "Run every method yourself: Caesar, Enigma, AES State Matrix, SHA-256, HMAC, RSA, Diffie–Hellman, ECC, Miller–Rabin, and attack simulators.",
      },
      { property: "og:title", content: "Converters & Laboratory — Specimen" },
      {
        property: "og:description",
        content: "Live, step-by-step converters for ciphers, hashes, encodings, and number theory.",
      },
    ],
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  const [filterTrack, setFilterTrack] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const q = search.toLowerCase().trim();

  const filtered = tools.filter((t) => {
    const matchesTrack = filterTrack === "all" || t.trackId === filterTrack;
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q);
    return matchesTrack && matchesSearch;
  });

  return (
    <main className="mt-2 sm:mt-3 w-full space-y-4 sm:space-y-5 pb-10">
      <TrackRail />

      <section className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[9.5px] uppercase font-semibold text-primary px-2 py-0.5 rounded bg-muted border border-border">
              {tools.length} CONVERTERS
            </span>
            <span className="font-mono text-[9.5px] text-muted-foreground uppercase tracking-wider">
              CLIENT-SIDE WORKBENCH
            </span>
          </div>
          <h1 className="font-sans text-[24px] sm:text-[28px] font-bold tracking-tight text-foreground">
            Interactive Cryptography Laboratory
          </h1>
          <p className="mt-0.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            Each engine computes deterministically in your browser with a complete step-by-step mathematical trace. Zero telemetry or external requests.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search converters by name or algorithm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-card pl-8 pr-3 py-1.5 text-[12.5px] border border-border outline-none transition focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTrack("all")}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-mono font-medium transition cursor-pointer ${
                filterTrack === "all"
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted"
              }`}
            >
              All ({tools.length})
            </button>
            {tracks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterTrack(t.id)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-mono font-medium transition cursor-pointer ${
                  filterTrack === t.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                {t.shortName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Converter Grid */}
      <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((tool) => (
          <Link
            key={tool.id}
            to="/tools/$toolId"
            params={{ toolId: tool.id }}
            className="group flex flex-col justify-between rounded-xl bg-card p-3.5 sm:p-4 border border-border transition hover:border-foreground/30 hover:shadow-2xs active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase font-semibold text-primary px-1.5 py-0.5 rounded bg-muted border border-border">
                  {tool.trackId}
                </span>
                <span className="grid size-5.5 place-items-center rounded bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition border border-border">
                  <ArrowRight className="size-3" />
                </span>
              </div>
              <h3 className="mt-2 font-sans text-[14px] font-bold text-foreground group-hover:text-primary transition">
                {tool.name}
              </h3>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground line-clamp-2">
                {tool.tagline}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2 text-[10.5px] font-mono text-muted-foreground">
              <span>{tool.fields.length} parameter{tool.fields.length === 1 ? "" : "s"}</span>
              <span className="text-primary font-medium group-hover:underline">Launch engine →</span>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center rounded-xl bg-card border border-border">
            <Wrench className="mx-auto size-7 text-muted-foreground mb-1.5" />
            <p className="font-sans text-[14px] font-semibold text-foreground">No converters matched your filter</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Try clearing your search query or selecting "All".</p>
          </div>
        )}
      </section>
    </main>
  );
}
