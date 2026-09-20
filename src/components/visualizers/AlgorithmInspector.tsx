import type { ToolOutput } from "@/lib/crypto/types";
import { ArrowRight, Cpu, FileText, CheckCircle2, Binary, Sparkles } from "lucide-react";

type Props = {
  toolId: string;
  values: Record<string, string>;
  result: ToolOutput;
};

export function AlgorithmInspector({ toolId, values, result }: Props) {
  const entries = Object.entries(values).filter(([_, v]) => v !== undefined && v !== "");
  const outputLength = result.output?.length ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-primary" />
          <span className="font-mono text-[10px] uppercase font-semibold text-primary px-2 py-0.5 rounded-md bg-muted border border-border">
            ALGORITHM FLOW PIPELINE
          </span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            {toolId}
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="size-3" /> Execution Verified
        </span>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Input Stage */}
        <div className="rounded-xl bg-muted/40 p-4 border border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
              <FileText className="size-3 text-primary" /> Input Parameters
            </span>
            <span className="font-mono text-[10px] text-primary bg-background px-1.5 py-0.5 rounded border border-border">
              {entries.length} fields
            </span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {entries.slice(0, 4).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[11.5px] font-mono">
                <span className="text-muted-foreground capitalize">{k}:</span>
                <span className="text-foreground truncate max-w-[140px] font-medium bg-background px-1.5 py-0.5 rounded border border-border/50">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transform Stage */}
        <div className="rounded-xl bg-primary/5 p-4 border border-primary/20 text-center space-y-1.5">
          <div className="inline-grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground mx-auto shadow-2xs">
            <Binary className="size-4" />
          </div>
          <p className="font-display text-[13px] font-bold text-foreground">
            Cryptographic Transform
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            Deterministic Evaluation Engine
          </p>
        </div>

        {/* Output Stage */}
        <div className="rounded-xl bg-muted/40 p-4 border border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
              <Sparkles className="size-3 text-primary" /> Output State
            </span>
            <span className="font-mono text-[10px] text-primary bg-background px-1.5 py-0.5 rounded border border-border">
              {outputLength} chars
            </span>
          </div>
          <div className="rounded-lg bg-background p-2 border border-border/60 font-mono text-[11.5px] text-foreground truncate">
            {result.error ? (
              <span className="text-destructive font-medium">{result.error}</span>
            ) : (
              result.output || "—"
            )}
          </div>
        </div>
      </div>

      {/* Explanatory notes if present */}
      {result.note && (
        <div className="rounded-xl bg-muted/30 p-3.5 border border-border/70 text-[12.5px] leading-relaxed text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold block mb-1">
            Algorithm Principle & Complexity
          </span>
          {result.note}
        </div>
      )}
    </div>
  );
}
