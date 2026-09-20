import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";
import { TrackRail } from "@/components/TrackRail";
import { getTrack, lessons } from "@/content";
import { getTool, toolsForTrack } from "@/lib/tools";

export const Route = createFileRoute("/tools/$toolId")({
  loader: ({ params }) => {
    const tool = getTool(params.toolId);
    if (!tool) throw notFound();
    return { tool: { id: tool.id, name: tool.name, tagline: tool.tagline, trackId: tool.trackId } };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Converter unavailable — Cryptex" }, { name: "robots", content: "noindex" }] };
    const { tool } = loaderData;
    return {
      meta: [
        { title: `${tool.name} converter — Cryptex` },
        { name: "description", content: `${tool.tagline}. Run it live and follow every step of the calculation.` },
        { property: "og:title", content: `${tool.name} converter — Cryptex` },
        { property: "og:description", content: `${tool.tagline}. Runs entirely in your browser.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { tool: meta } = Route.useLoaderData();
  const tool = getTool(meta.id)!;
  const track = getTrack(tool.trackId);
  const related = lessons.filter((l) => l.toolId === tool.id);
  const siblings = toolsForTrack(tool.trackId).filter((t) => t.id !== tool.id);

  return (
    <main className="mt-5 w-full space-y-6 pb-12">
      <TrackRail activeId={tool.trackId} />

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-wider font-semibold text-primary px-2.5 py-0.5 rounded-full bg-muted border border-border">
            {track?.name}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Workbench
          </span>
        </div>
        <h1 className="font-display text-[30px] sm:text-[36px] font-bold leading-[1.08] text-foreground tracking-tight">
          {tool.name}
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
          {tool.tagline}. Run live computations and inspect the mathematical step-by-step trace locally in your browser.
        </p>
      </section>

      <div>
        <ToolPanel tool={tool} />
      </div>

      {related.length > 0 && (
        <section className="space-y-3 pt-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Curriculum Theory & Deep Dive
          </p>
          <div className="space-y-2">
            {related.map((lesson) => (
              <Link
                key={lesson.id}
                to="/lessons/$lessonId"
                params={{ lessonId: lesson.id }}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-card p-4 border border-border transition hover:border-foreground/30 hover:shadow-xs"
              >
                <div className="min-w-0">
                  <span className="block font-display text-[15px] font-semibold text-foreground group-hover:text-primary transition">
                    {lesson.title}
                  </span>
                  <span className="block text-[12.5px] text-muted-foreground truncate mt-0.5">
                    {lesson.subtitle}
                  </span>
                </div>
                <span className="text-[12px] font-mono text-primary group-hover:underline shrink-0">
                  Read specimen →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="space-y-3 pt-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Related Converters in {track?.name}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {siblings.map((sibling) => (
              <Link
                key={sibling.id}
                to="/tools/$toolId"
                params={{ toolId: sibling.id }}
                className="group rounded-2xl bg-card p-4 border border-border transition hover:border-foreground/30 hover:shadow-xs"
              >
                <span className="block font-display text-[14px] font-semibold text-foreground group-hover:text-primary transition">
                  {sibling.name}
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-muted-foreground line-clamp-2">
                  {sibling.tagline}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
