import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { FileText, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/guide")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      window.location.replace("/documentation.html");
    }
  },
  head: () => ({
    meta: [
      { title: "Technical Manual & Guide — Specimen Cryptography Lab" },
      {
        name: "description",
        content:
          "Comprehensive technical manual, specifications, and architecture guide covering all 8 curriculum tracks, 75 lessons, and 81 cryptographic converters in Specimen.",
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  useEffect(() => {
    window.location.replace("/documentation.html");
  }, []);

  return (
    <main className="mt-12 space-y-6 max-w-xl mx-auto px-4 text-center">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4">
        <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-primary px-2.5 py-0.5 rounded-full bg-muted border border-border">
          REDIRECTING TO TECHNICAL MANUAL
        </span>
        <h1 className="font-sans text-[22px] font-bold text-foreground">
          Opening Specimen Documentation...
        </h1>
        <p className="text-[13px] text-muted-foreground">
          You are being redirected to the comprehensive reference manual. If you are not redirected automatically, click below:
        </p>
        <div className="pt-2">
          <a
            href="/documentation.html"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground hover:opacity-90 active:scale-95 transition"
          >
            <FileText className="size-4" />
            <span>Open Technical Manual Now</span>
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </main>
  );
}
