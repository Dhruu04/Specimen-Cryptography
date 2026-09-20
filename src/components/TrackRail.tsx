import { Link } from "@tanstack/react-router";
import { tracks, lessonsForTrack } from "@/content";
import {
  Atom,
  Binary,
  Calculator,
  Hash,
  KeyRound,
  Lock,
  Scroll,
  ShieldAlert,
} from "lucide-react";

export function TrackRail({ activeId }: { activeId?: string }) {
  const getTrackIcon = (id: string) => {
    switch (id) {
      case "classical":
        return <Scroll className="size-3.5 shrink-0" />;
      case "encoding":
        return <Binary className="size-3.5 shrink-0" />;
      case "symmetric":
        return <Lock className="size-3.5 shrink-0" />;
      case "hashing":
        return <Hash className="size-3.5 shrink-0" />;
      case "publickey":
        return <KeyRound className="size-3.5 shrink-0" />;
      case "postquantum":
        return <Atom className="size-3.5 shrink-0" />;
      case "numbertheory":
        return <Calculator className="size-3.5 shrink-0" />;
      case "security":
        return <ShieldAlert className="size-3.5 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative my-1.5">
      <nav
        className="no-scrollbar -mx-3 flex items-center gap-1.5 overflow-x-auto px-3 py-1 sm:-mx-5 sm:px-5 md:mx-0 md:px-0 xl:flex-wrap overscroll-x-contain touch-pan-x"
        aria-label="Topic tracks"
      >
        {tracks.map((track) => {
          const active = track.id === activeId;
          const count = lessonsForTrack(track.id).length;
          return (
            <Link
              key={track.id}
              to="/tracks/$trackId"
              params={{ trackId: track.id }}
              className={
                active
                  ? "flex shrink-0 items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 text-[11.5px] font-medium text-background shadow-xs transition"
                  : "flex shrink-0 items-center gap-1.5 rounded-md bg-card px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground border border-border transition hover:bg-muted hover:text-foreground active:scale-98"
              }
            >
              {getTrackIcon(track.id)}
              <span>{track.shortName}</span>
              <span
                className={`rounded px-1.5 py-0.2 font-mono text-[9.5px] ${
                  active
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
