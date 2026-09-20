import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrackRail } from "@/components/TrackRail";
import { EcbPenguinVisualizer } from "@/components/attacks/EcbPenguinVisualizer";
import { CbcBitFlipSimulator } from "@/components/attacks/CbcBitFlipSimulator";
import { DhMitmSimulator } from "@/components/attacks/DhMitmSimulator";
import { FrequencyAnalysisDesk } from "@/components/attacks/FrequencyAnalysisDesk";
import { LatticeVisualizer } from "@/components/attacks/LatticeVisualizer";
import { AlertOctagon, BarChart3, Lock, ShieldAlert, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/attacks")({
  head: () => ({
    meta: [
      { title: "Attack & Cryptanalysis Laboratory — Specimen" },
      {
        name: "description",
        content: "Simulate and visualize real-world cryptographic attacks: ECB image leakage, CBC bit-flipping, Diffie-Hellman MITM, frequency analysis, and lattice CVP.",
      },
    ],
  }),
  component: AttacksPage,
});

function AttacksPage() {
  const [activeTab, setActiveTab] = useState<"ecb" | "cbc" | "dh" | "freq" | "lattice">("ecb");

  return (
    <main className="mt-2 w-full space-y-4 pb-8">
      <TrackRail />

      <section className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] uppercase font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            SIMULATED ATTACK LAB
          </span>
          <span className="font-mono text-[9.5px] text-muted-foreground uppercase tracking-wider">
            LIVE ADVERSARIAL WORKBENCH
          </span>
        </div>
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight text-foreground">
          Interactive Cryptanalytic Attack Simulators
        </h1>
        <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
          Cryptography is defined by what it resists. Execute real attacks locally in your browser to understand why modern standards enforce authentication, nonces, and post-quantum hardness.
        </p>

        {/* Attack Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 border-b border-border pb-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("ecb")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition cursor-pointer ${
              activeTab === "ecb"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ShieldAlert className="size-3" />
            <span>ECB Penguin Leakage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cbc")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition cursor-pointer ${
              activeTab === "cbc"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Lock className="size-3" />
            <span>CBC Bit-Flipping</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dh")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition cursor-pointer ${
              activeTab === "dh"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Zap className="size-3" />
            <span>Diffie-Hellman MITM</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("freq")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition cursor-pointer ${
              activeTab === "freq"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="size-3" />
            <span>Frequency Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lattice")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition cursor-pointer ${
              activeTab === "lattice"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="size-3" />
            <span>Post-Quantum Lattice CVP</span>
          </button>
        </div>
      </section>

      {/* Render Active Simulator */}
      <section className="pt-2">
        {activeTab === "ecb" && <EcbPenguinVisualizer />}
        {activeTab === "cbc" && <CbcBitFlipSimulator />}
        {activeTab === "dh" && <DhMitmSimulator />}
        {activeTab === "freq" && <FrequencyAnalysisDesk />}
        {activeTab === "lattice" && <LatticeVisualizer />}
      </section>
    </main>
  );
}
