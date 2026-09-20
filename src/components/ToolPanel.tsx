import { useEffect, useMemo, useState } from "react";
import type { Tool } from "@/lib/tools";
import type { ToolOutput } from "@/lib/crypto/types";
import { Check, Copy, Eye, ListOrdered, RotateCcw, ClipboardPlus, FileCode } from "lucide-react";
import { AlgorithmVisualizer } from "./visualizers";
import { addScratchpadItem } from "./UniversalScratchpad";

type Props = { tool: Tool; compact?: boolean };

export function ToolPanel({ tool, compact = false }: Props) {
  const initial = useMemo(
    () => Object.fromEntries(tool.fields.map((f) => [f.name, f.default])),
    [tool],
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [result, setResult] = useState<ToolOutput>({ output: "" });
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTraceMd, setCopiedTraceMd] = useState(false);
  const [addedToScratchpad, setAddedToScratchpad] = useState(false);
  const [activeTab, setActiveTab] = useState<"visual" | "trace">("visual");

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      setPending(true);
      try {
        const out = await tool.run((name) => values[name] ?? "");
        if (!cancelled) setResult(out);
      } catch (e) {
        if (!cancelled) setResult({ output: "", error: (e as Error).message });
      } finally {
        if (!cancelled) setPending(false);
      }
    };
    void compute();
    return () => {
      cancelled = true;
    };
  }, [tool, values]);

  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));
  const resetDefaults = () => setValues(initial);

  const copyOutput = async () => {
    const textToCopy = result.error ? result.error : result.output;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const sendOutputToScratchpad = () => {
    if (!result.output) return;
    addScratchpadItem(`${tool.name} Output`, result.output);
    setAddedToScratchpad(true);
    setTimeout(() => setAddedToScratchpad(false), 2000);
  };

  const copyTraceAsMarkdown = async () => {
    if (!result.steps || result.steps.length === 0) return;
    let md = `### ${tool.name} Trace\n\n| Step | Operation / Label | Detail |\n| :--- | :--- | :--- |\n`;
    result.steps.forEach((st, i) => {
      md += `| ${i + 1} | \`${st.label.replace(/\|/g, "\\|")}\` | ${st.detail ? st.detail.replace(/\|/g, "\\|") : ""} |\n`;
    });
    if (result.output) {
      md += `\n**Final Result**: \`${result.output}\`\n`;
    }
    await navigator.clipboard.writeText(md);
    setCopiedTraceMd(true);
    setTimeout(() => setCopiedTraceMd(false), 2000);
  };

  const inputClass =
    "mt-1 w-full rounded-lg bg-background px-3 py-1.5 sm:py-2 font-mono text-[13px] text-foreground border border-border outline-none transition focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20";

  return (
    <section className={`rounded-xl border border-border bg-card ${compact ? "p-3.5 sm:p-4" : "p-4 sm:p-5"} shadow-2xs`}>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-mono text-[9.5px] uppercase font-semibold text-primary px-1.5 py-0.2 rounded bg-muted border border-border">
              LAB ENGINE
            </span>
            <span className="font-mono text-[9.5px] text-muted-foreground uppercase tracking-wider">
              {tool.trackId}
            </span>
          </div>
          <h2 className="font-display text-[16px] sm:text-[18px] font-bold text-foreground">
            {tool.name}
          </h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">{tool.tagline}</p>
        </div>
        <button
          type="button"
          onClick={resetDefaults}
          className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/30 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition active:scale-95 cursor-pointer"
          title="Reset to sample values"
        >
          <RotateCcw className="size-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Field Inputs */}
      <div className="mt-3.5 space-y-3">
        {tool.fields.map((f) => (
          <div key={f.name}>
            <label className="block text-[12px] font-semibold text-foreground">
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <textarea
                rows={3}
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                className={inputClass}
              />
            ) : f.type === "select" && f.options ? (
              <select
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                className={inputClass}
              >
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                min={f.min}
                max={f.max}
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                className={inputClass}
              />
            )}
            {f.hint && (
              <p className="mt-1 text-[11px] text-muted-foreground">{f.hint}</p>
            )}
          </div>
        ))}
      </div>

      {/* Real-time Calculated Output */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            {tool.outputLabel}
          </span>
          {result.output && !result.error && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={sendOutputToScratchpad}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground active:scale-95 transition cursor-pointer"
                title="Send output to Scratchpad (Alt+S)"
              >
                {addedToScratchpad ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Saved to Pad!</span>
                  </>
                ) : (
                  <>
                    <ClipboardPlus className="size-3 text-primary" />
                    <span>To Scratchpad</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={copyOutput}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <output
          className={
            result.error
              ? "mt-1.5 block whitespace-pre-wrap rounded-lg bg-destructive/5 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-destructive border border-destructive/20"
              : "mt-1.5 block whitespace-pre-wrap break-words rounded-lg bg-muted/40 px-3 py-2 font-mono text-[12.5px] leading-relaxed tracking-wide text-foreground border border-border"
          }
        >
          {result.error ?? (result.output || "—")}
        </output>
      </div>

      {/* Interactive Tabs for Visualizer vs Step Trace */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex w-full sm:w-auto items-center gap-1 rounded-lg bg-muted/60 p-0.5 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1 rounded-md px-3 py-1 text-[11.5px] font-medium transition active:scale-98 cursor-pointer ${
                activeTab === "visual"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="size-3" />
              <span>Visualizer & Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("trace")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1 rounded-md px-3 py-1 text-[11.5px] font-medium transition active:scale-98 cursor-pointer ${
                activeTab === "trace"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListOrdered className="size-3" />
              <span>Step Trace ({result.steps?.length ?? 0})</span>
            </button>
          </div>

          {activeTab === "trace" && result.steps && result.steps.length > 0 && (
            <button
              type="button"
              onClick={copyTraceAsMarkdown}
              className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted px-2.5 py-1 rounded-lg border border-border transition self-end sm:self-auto"
              title="Copy step trace formatted as a Markdown table"
            >
              {copiedTraceMd ? (
                <>
                  <Check className="size-3 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Table Copied!</span>
                </>
              ) : (
                <>
                  <FileCode className="size-3 text-primary" />
                  <span>Copy Markdown Table</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab 1: Interactive Algorithm Visualizer */}
        {activeTab === "visual" && (
          <div className="mt-4">
            <AlgorithmVisualizer toolId={tool.id} values={values} result={result} />
          </div>
        )}

        {/* Tab 2: Mathematical Step Trace */}
        {activeTab === "trace" && (
          <div className="mt-3">
            {result.steps && result.steps.length > 0 ? (
              <div className="space-y-1.5">
                {result.steps.map((step, i) => (
                  <div
                    key={`${step.label}-${i}`}
                    className="flex items-start gap-2.5 rounded-lg bg-muted/35 p-2.5 border border-border"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded bg-card font-mono text-[10px] font-semibold text-foreground border border-border">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap break-words font-mono text-[12px] font-semibold text-foreground">{step.label}</p>
                      {step.detail && (
                        <p className="mt-0.5 whitespace-pre-wrap break-words text-[11.5px] text-muted-foreground leading-relaxed">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-muted/20 p-4 text-center text-[11.5px] text-muted-foreground border border-border">
                No step trace for this conversion.
              </div>
            )}
          </div>
        )}
      </div>

      {result.note && !result.error && (
        <p className="mt-3 border-t border-border pt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
          {result.note}
        </p>
      )}
    </section>
  );
}

