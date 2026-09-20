import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TrackRail } from "@/components/TrackRail";
import { getTrack, lessonsForTrack } from "@/content";
import { toolsForTrack } from "@/lib/tools";
import { challenges } from "@/content/challenges";
import { ArrowRight, Trophy } from "lucide-react";

export const Route = createFileRoute("/tracks/$trackId")({
  loader: ({ params }) => {
    const track = getTrack(params.trackId);
    if (!track) throw notFound();
    return { track };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Track unavailable — Specimen" }, { name: "robots", content: "noindex" }] };
    const { track } = loaderData;
    return {
      meta: [
        { title: `${track.name} — Specimen Study Track` },
        { name: "description", content: track.blurb },
        { property: "og:title", content: `${track.name} — Specimen Study Track` },
        { property: "og:description", content: track.blurb },
      ],
    };
  },
  component: TrackPage,
});

function TrackPage() {
  const { track } = Route.useLoaderData();
  const lessons = lessonsForTrack(track.id);
  const tools = toolsForTrack(track.id);
  const trackChallenges = challenges.filter((c) => c.trackId === track.id);

  return (
    <main className="mt-2 sm:mt-3 space-y-5 sm:space-y-6">
      <TrackRail activeId={track.id} />

      <section className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground uppercase tracking-wider">
            Curriculum Track
          </span>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            {lessons.length} Lessons · {tools.length} Converters
          </span>
        </div>
        <h1 className="font-sans text-[24px] sm:text-[28px] font-bold text-foreground tracking-tight">
          {track.name}
        </h1>
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">
          {track.intro}
        </p>
      </section>

      {trackChallenges.length > 0 && (
        <section className="rounded-xl bg-card p-3 sm:p-4 border border-border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
              <Trophy className="size-4" />
            </div>
            <div>
              <p className="font-sans text-[13.5px] font-semibold text-foreground">
                {trackChallenges.length} Cryptanalysis Challenge{trackChallenges.length === 1 ? "" : "s"}
              </p>
              <p className="text-[12px] text-muted-foreground">
                Put the mathematical concepts of {track.shortName} into practice against live cryptographic problems.
              </p>
            </div>
          </div>
          <Link
            to="/challenges"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-foreground px-3.5 py-1.5 font-sans text-[11.5px] font-medium text-background hover:bg-foreground/90 transition shadow-xs text-center shrink-0"
          >
            Solve Challenges
          </Link>
        </section>
      )}

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="label-tiny">Lessons in this track ({lessons.length})</p>
          <span className="font-mono text-[10.5px] text-muted-foreground">Sequential Study</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lessons.map((lesson, i) => (
            <Link
              key={lesson.id}
              to="/lessons/$lessonId"
              params={{ lessonId: lesson.id }}
              className="group rounded-xl bg-card p-3 sm:p-3.5 border border-border transition hover:border-foreground/40 hover:shadow-2xs active:scale-[0.99] flex items-start gap-2.5"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted font-mono text-[11px] font-semibold text-muted-foreground group-hover:bg-foreground group-hover:text-background transition">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="block font-sans text-[13.5px] font-semibold text-foreground group-hover:text-foreground transition truncate">
                    {lesson.title}
                  </span>
                  {lesson.formula?.badge && (
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.2 font-mono text-[9px] text-muted-foreground">
                      {lesson.formula.badge}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 block text-[11.5px] text-muted-foreground line-clamp-2 leading-snug">
                  {lesson.subtitle}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {tools.length > 0 && (
        <section className="space-y-2.5">
          <p className="label-tiny">Converters in this track ({tools.length})</p>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to="/tools/$toolId"
                params={{ toolId: tool.id }}
                className="group rounded-xl bg-card p-3 border border-border transition hover:border-foreground/40 hover:shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="block font-sans text-[13px] font-semibold text-foreground group-hover:text-primary transition">
                    {tool.name}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition" />
                </div>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground line-clamp-2">
                  {tool.tagline}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
