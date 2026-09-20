import { Link } from "@tanstack/react-router";
import { BookOpen, Compass, Search, Trophy, Wrench } from "lucide-react";

type Props = {
  onOpenSearch: () => void;
};

export function MobileNavDock({ onOpenSearch }: Props) {
  return (
    <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="flex items-center justify-around rounded-2xl bg-card/90 px-2 py-2 border border-border/80 shadow-lg backdrop-blur-xl">
        <Link
          to="/"
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-muted-foreground transition active:scale-95 hover:text-foreground"
          activeProps={{ className: "text-foreground font-semibold" }}
        >
          <Compass className="size-4" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </Link>

        <Link
          to="/tracks/$trackId"
          params={{ trackId: "classical" }}
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-muted-foreground transition active:scale-95 hover:text-foreground"
          activeProps={{ className: "text-foreground font-semibold" }}
        >
          <BookOpen className="size-4" />
          <span className="text-[10px] tracking-tight">Curriculum</span>
        </Link>

        <Link
          to="/tools"
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-muted-foreground transition active:scale-95 hover:text-foreground"
          activeProps={{ className: "text-foreground font-semibold" }}
        >
          <Wrench className="size-4" />
          <span className="text-[10px] tracking-tight">Converters</span>
        </Link>

        <Link
          to="/challenges"
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-muted-foreground transition active:scale-95 hover:text-foreground"
          activeProps={{ className: "text-foreground font-semibold" }}
        >
          <Trophy className="size-4" />
          <span className="text-[10px] tracking-tight">Lab</span>
        </Link>

        <a
          href="/documentation.html"
          className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-muted-foreground transition active:scale-95 hover:text-foreground"
          title="Technical Documentation Manual"
        >
          <BookOpen className="size-4" />
          <span className="text-[10px] tracking-tight">Guide</span>
        </a>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-muted-foreground transition active:scale-95 hover:text-foreground"
        >
          <Search className="size-4" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>
      </nav>
    </div>
  );
}
