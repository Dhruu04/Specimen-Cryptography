import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TrackRail } from "@/components/TrackRail";
import { glossary } from "@/content";
import { Search } from "lucide-react";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Glossary — Specimen Cryptography Terms" },
      {
        name: "description",
        content:
          "Clear definitions of cryptography and security terms: plaintext, nonce, AEAD, forward secrecy, index of coincidence, and more.",
      },
      { property: "og:title", content: "Glossary — Specimen Cryptography Terms" },
      {
        property: "og:description",
        content: "Every term used in the notebook, defined and linked back to the lesson that introduces it.",
      },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const [search, setSearch] = useState("");
  const q = search.toLowerCase().trim();

  const filtered = glossary.filter(
    (entry) =>
      entry.term.toLowerCase().includes(q) ||
      entry.def.toLowerCase().includes(q) ||
      entry.lessonTitle.toLowerCase().includes(q),
  );

  return (
    <main className="mt-5 space-y-6">
      <TrackRail />

      <section>
        <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{glossary.length} terms defined</p>
        <h1 className="mt-1 font-display text-[30px] font-semibold leading-[1.08] text-foreground">
          Cryptography & Security Glossary
        </h1>
        <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-muted-foreground">
          The essential terminology of modern and classical cryptography, each paired with an authoritative definition and linked directly to the lesson where it is applied.
        </p>

        <div className="mt-4 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter terms or definitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[14px] bg-card pl-9 pr-3.5 py-2.5 text-[16px] sm:text-[13px] ring-1 ring-border outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <dl className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {filtered.map((entry) => (
          <div key={entry.term} className="rounded-[18px] bg-card p-4 ring-1 ring-border shadow-xs flex flex-col justify-between">
            <div>
              <dt className="font-display text-[15px] font-semibold text-primary">{entry.term}</dt>
              <dd className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/80">{entry.def}</dd>
            </div>
            <Link
              to="/lessons/$lessonId"
              params={{ lessonId: entry.lessonId }}
              className="mt-3 inline-flex items-center text-[11px] font-medium text-muted-foreground hover:text-primary transition"
            >
              Lesson: {entry.lessonTitle} →
            </Link>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-[18px] bg-card ring-1 ring-border">
            <p className="font-display text-[15px] font-semibold">No terms found matching "{search}"</p>
          </div>
        )}
      </dl>
    </main>
  );
}
