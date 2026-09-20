import { useState } from "react";
import { ShieldAlert, Cpu, Sparkles, CheckCircle2, XCircle, Info, Calendar } from "lucide-react";

interface AlgoData {
  id: string;
  name: string;
  category: "Classical Public Key" | "Symmetric & Hash" | "Post-Quantum Standard";
  classicalBits: number;
  quantumBits: number;
  quantumThreat: "Shor's (Exponential)" | "Grover's (Quadratic)" | "Immune / Resistant";
  logicalQubits: number;
  physicalQubits: string;
  cnsaStatus: "Deprecated by 2030" | "Upgrade Required" | "Approved CNSA 2.0";
  notes: string;
}

const ALGORITHMS: AlgoData[] = [
  {
    id: "rsa-2048",
    name: "RSA-2048",
    category: "Classical Public Key",
    classicalBits: 112,
    quantumBits: 0,
    quantumThreat: "Shor's (Exponential)",
    logicalQubits: 4098,
    physicalQubits: "~4.1 Million",
    cnsaStatus: "Deprecated by 2030",
    notes: "Factoring breaks in O((log N)³) polynomial time via Shor's Quantum Fourier Transform.",
  },
  {
    id: "rsa-4096",
    name: "RSA-4096",
    category: "Classical Public Key",
    classicalBits: 128,
    quantumBits: 0,
    quantumThreat: "Shor's (Exponential)",
    logicalQubits: 8194,
    physicalQubits: "~8.2 Million",
    cnsaStatus: "Deprecated by 2030",
    notes: "Doubling key size only marginally increases quantum resource requirements.",
  },
  {
    id: "ecc-256",
    name: "ECC P-256 / Curve25519",
    category: "Classical Public Key",
    classicalBits: 128,
    quantumBits: 0,
    quantumThreat: "Shor's (Exponential)",
    logicalQubits: 2330,
    physicalQubits: "~2.4 Million",
    cnsaStatus: "Deprecated by 2030",
    notes: "Elliptic curve discrete logs require FEWER qubits to break than RSA-2048!",
  },
  {
    id: "aes-128",
    name: "AES-128",
    category: "Symmetric & Hash",
    classicalBits: 128,
    quantumBits: 64,
    quantumThreat: "Grover's (Quadratic)",
    logicalQubits: 2953,
    physicalQubits: "~3.0 Million",
    cnsaStatus: "Upgrade Required",
    notes: "Grover's search reduces effective security to 64 bits, which is insecure.",
  },
  {
    id: "aes-256",
    name: "AES-256",
    category: "Symmetric & Hash",
    classicalBits: 256,
    quantumBits: 128,
    quantumThreat: "Grover's (Quadratic)",
    logicalQubits: 6681,
    physicalQubits: "~7.0 Million",
    cnsaStatus: "Approved CNSA 2.0",
    notes: "128 bits of quantum security remains computationally unbreakable.",
  },
  {
    id: "sha-256",
    name: "SHA-256",
    category: "Symmetric & Hash",
    classicalBits: 256,
    quantumBits: 128,
    quantumThreat: "Grover's (Quadratic)",
    logicalQubits: 4000,
    physicalQubits: "~4.0 Million",
    cnsaStatus: "Upgrade Required",
    notes: "Preimage drops to 128 bits; collision drops to ~85 bits via BHT algorithm.",
  },
  {
    id: "ml-kem",
    name: "ML-KEM-768 (Kyber)",
    category: "Post-Quantum Standard",
    classicalBits: 192,
    quantumBits: 192,
    quantumThreat: "Immune / Resistant",
    logicalQubits: 0,
    physicalQubits: "Exponential Complexity",
    cnsaStatus: "Approved CNSA 2.0",
    notes: "NIST FIPS 203 Primary Standard. Module-LWE lattice reduction is exponential.",
  },
  {
    id: "ml-dsa",
    name: "ML-DSA-65 (Dilithium)",
    category: "Post-Quantum Standard",
    classicalBits: 192,
    quantumBits: 192,
    quantumThreat: "Immune / Resistant",
    logicalQubits: 0,
    physicalQubits: "Exponential Complexity",
    cnsaStatus: "Approved CNSA 2.0",
    notes: "NIST FIPS 204 Primary Signature Standard with Fiat–Shamir with Aborts.",
  },
  {
    id: "slh-dsa",
    name: "SLH-DSA-128 (SPHINCS+)",
    category: "Post-Quantum Standard",
    classicalBits: 128,
    quantumBits: 128,
    quantumThreat: "Immune / Resistant",
    logicalQubits: 0,
    physicalQubits: "Exponential Complexity",
    cnsaStatus: "Approved CNSA 2.0",
    notes: "NIST FIPS 205 Stateless Hash-Based Signatures; security rests purely on hashes.",
  },
];

export function QuantumThreatVisualizer() {
  const [selectedId, setSelectedId] = useState("rsa-2048");
  const selectedAlgo = ALGORITHMS.find((a) => a.id === selectedId) ?? ALGORITHMS[0]!;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldAlert className="size-4 text-primary" />
          <span>Quantum Vulnerability & Cryptographic Resource Matrix</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
          <Calendar className="size-3.5 text-primary" />
          <span>CNSA 2.0 Timeline (2025–2033)</span>
        </div>
      </div>

      {/* Algorithm Selector Pills */}
      <div className="flex flex-wrap gap-1.5">
        {ALGORITHMS.map((algo) => {
          const isSelected = algo.id === selectedId;
          const isPQC = algo.category === "Post-Quantum Standard";
          return (
            <button
              key={algo.id}
              type="button"
              onClick={() => setSelectedId(algo.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ring-1 ${
                isSelected
                  ? "bg-primary text-primary-foreground ring-primary font-semibold shadow-xs"
                  : isPQC
                  ? "bg-emerald-500/10 text-emerald-800 ring-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-card text-foreground ring-border/70 hover:bg-muted"
              }`}
            >
              {algo.name}
            </button>
          );
        })}
      </div>

      {/* Detailed Card for Selected Algorithm */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 rounded-xl bg-card p-4 ring-1 ring-border/80">
        <div className="sm:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">{selectedAlgo.name}</h4>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                selectedAlgo.quantumBits === 0
                  ? "bg-destructive/15 text-destructive"
                  : selectedAlgo.quantumBits < 100
                  ? "bg-amber-500/15 text-amber-800"
                  : "bg-emerald-500/15 text-emerald-800"
              }`}
            >
              {selectedAlgo.cnsaStatus}
            </span>
          </div>

          <p className="text-[11.5px] text-muted-foreground leading-relaxed">
            {selectedAlgo.notes}
          </p>

          {/* Security Comparison Bars */}
          <div className="space-y-2 pt-1">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-muted-foreground">Classical Security Strength</span>
                <span className="font-mono font-semibold text-foreground">
                  {selectedAlgo.classicalBits} bits
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, (selectedAlgo.classicalBits / 256) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-muted-foreground">Post-Quantum Security Strength</span>
                <span
                  className={`font-mono font-bold ${
                    selectedAlgo.quantumBits === 0
                      ? "text-destructive"
                      : selectedAlgo.quantumBits < 100
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedAlgo.quantumBits} bits
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full transition-all duration-300 ${
                    selectedAlgo.quantumBits === 0
                      ? "bg-destructive"
                      : selectedAlgo.quantumBits < 100
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (selectedAlgo.quantumBits / 256) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quantum Hardware Requirements */}
        <div className="sm:col-span-5 rounded-lg bg-muted/30 p-3 ring-1 ring-border/60 space-y-2">
          <div className="text-[11px] font-semibold text-foreground flex items-center gap-1">
            <Cpu className="size-3.5 text-primary" />
            <span>CRQC Breaking Requirements</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between border-b border-border/40 pb-1">
              <span className="text-muted-foreground">Attack Paradigm:</span>
              <span className="font-semibold text-foreground">{selectedAlgo.quantumThreat}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1">
              <span className="text-muted-foreground">Logical Qubits:</span>
              <span className="font-mono font-bold text-foreground">
                {selectedAlgo.logicalQubits > 0 ? selectedAlgo.logicalQubits.toLocaleString() : "None"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1">
              <span className="text-muted-foreground">Physical Qubits:</span>
              <span className="font-mono text-foreground">{selectedAlgo.physicalQubits}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-muted-foreground">PQC Readiness:</span>
              {selectedAlgo.quantumBits >= 128 ? (
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle2 className="size-3.5" /> Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold text-destructive">
                  <XCircle className="size-3.5" /> Obsolete
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CNSA 2.0 Strategic Roadmap */}
      <div className="rounded-xl bg-primary/5 p-3 ring-1 ring-primary/20 space-y-2">
        <div className="text-[11.5px] font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          <span>NSA Commercial National Security Algorithm Suite (CNSA 2.0) Deadlines</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
          <div className="rounded bg-card/80 p-2 ring-1 ring-border/50">
            <div className="font-bold text-primary">2025 – 2027: Software & Firmware</div>
            <div className="text-muted-foreground mt-0.5">
              OS updates, browsers, and network firmware must support hybrid PQC (X25519Kyber768).
            </div>
          </div>
          <div className="rounded bg-card/80 p-2 ring-1 ring-border/50">
            <div className="font-bold text-amber-700">2030: Mandatory PQC Default</div>
            <div className="text-muted-foreground mt-0.5">
              All newly procured systems must default exclusively to ML-KEM and ML-DSA.
            </div>
          </div>
          <div className="rounded bg-card/80 p-2 ring-1 ring-border/50">
            <div className="font-bold text-destructive">2033: Total Decommission</div>
            <div className="text-muted-foreground mt-0.5">
              Complete prohibition and removal of RSA, ECDH, ECDSA, and classic DH.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
