import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrackRail } from "@/components/TrackRail";
import { CheckCircle2, ChevronRight, HelpCircle, Search, ShieldAlert, ShieldCheck, Sparkles, XCircle } from "lucide-react";

export const Route = createFileRoute("/matrix")({
  head: () => ({
    meta: [
      { title: "Cryptographic Algorithm Matrix & Security Standards — Specimen" },
      {
        name: "description",
        content: "NIST FIPS and RFC standard comparison matrix: security bit levels, post-quantum readiness, key sizes, and interactive architectural decision wizard.",
      },
    ],
  }),
  component: MatrixPage,
});

interface PrimitiveSpec {
  name: string;
  category: "AEAD" | "Public Key KEM" | "Signature" | "Hash" | "Password KDF";
  securityBits: number;
  quantumStatus: "Quantum-Resistant" | "Broken by Shor" | "Halved by Grover";
  standard: string;
  recommended: boolean;
  useCase: string;
  antipatterns: string;
}

const PRIMITIVES: PrimitiveSpec[] = [
  {
    name: "AES-256-GCM",
    category: "AEAD",
    securityBits: 256,
    quantumStatus: "Halved by Grover",
    standard: "NIST SP 800-38D",
    recommended: true,
    useCase: "Primary standard for data at rest and high-speed hardware-accelerated TLS 1.3 encryption.",
    antipatterns: "Never repeat a (key, 96-bit nonce) pair; doing so completely destroys authenticity and confidentiality.",
  },
  {
    name: "ChaCha20-Poly1305",
    category: "AEAD",
    securityBits: 256,
    quantumStatus: "Halved by Grover",
    standard: "RFC 8439",
    recommended: true,
    useCase: "Mobile, IoT, and CPUs lacking hardware AES-NI instructions (used by WireGuard, Signal).",
    antipatterns: "Nonce reuse allows keystream reconstruction. Use XChaCha20 if generating nonces randomly.",
  },
  {
    name: "ML-KEM-768 (Kyber)",
    category: "Public Key KEM",
    securityBits: 192,
    quantumStatus: "Quantum-Resistant",
    standard: "NIST FIPS 203",
    recommended: true,
    useCase: "Primary post-quantum key encapsulation mechanism for hybrid TLS 1.3 and long-term confidentiality.",
    antipatterns: "Do not use as a digital signature; KEMs are strictly for secure key agreement.",
  },
  {
    name: "ML-DSA-65 (Dilithium)",
    category: "Signature",
    securityBits: 192,
    quantumStatus: "Quantum-Resistant",
    standard: "NIST FIPS 204",
    recommended: true,
    useCase: "Primary post-quantum digital signature algorithm for code signing, certificates, and identities.",
    antipatterns: "Signature sizes are large (~3.3 KB); design network protocols to accommodate multi-kilobyte packets.",
  },
  {
    name: "Ed25519",
    category: "Signature",
    securityBits: 128,
    quantumStatus: "Broken by Shor",
    standard: "RFC 8032",
    recommended: true,
    useCase: "High-performance classical digital signatures (SSH keys, Git commits, cryptocurrency transactions).",
    antipatterns: "Will be broken once cryptanalytically relevant quantum computers exist (prepare hybrid migration).",
  },
  {
    name: "RSA-3072 / 4096 (OAEP/PSS)",
    category: "Public Key KEM",
    securityBits: 128,
    quantumStatus: "Broken by Shor",
    standard: "RFC 8017",
    recommended: false,
    useCase: "Legacy public key infrastructure compatibility.",
    antipatterns: "Textbook RSA (c = m^e) and PKCS #1 v1.5 padding are vulnerable to Bleichenbacher's attack. Always use OAEP/PSS.",
  },
  {
    name: "SHA-256",
    category: "Hash",
    securityBits: 256,
    quantumStatus: "Halved by Grover",
    standard: "FIPS 180-4",
    recommended: true,
    useCase: "File integrity, digital signatures, HMAC, and Merkle tree state proofs.",
    antipatterns: "Never concatenate secret keys directly with data H(k || m); vulnerable to length-extension attacks. Use HMAC.",
  },
  {
    name: "Argon2id",
    category: "Password KDF",
    securityBits: 128,
    quantumStatus: "Quantum-Resistant",
    standard: "RFC 9106",
    recommended: true,
    useCase: "Primary standard for hashing passwords for storage and deriving encryption keys from user passphrases.",
    antipatterns: "Never use fast hashes (MD5, SHA-1, SHA-256) for passwords. Fast hashes are trivially cracked on GPUs.",
  },
];

function MatrixPage() {
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Diagnostic Wizard State
  const [wizardGoal, setWizardGoal] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PRIMITIVES.filter((p) => {
      const matchCat = filterCat === "all" || p.category === filterCat;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.useCase.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [filterCat, search]);

  return (
    <main className="mt-5 w-full space-y-8 pb-12">
      <TrackRail />

      <section className="space-y-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-primary px-2.5 py-0.5 rounded-full bg-muted border border-border">
            STANDARDS & PRAGMATISM
          </span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            NIST & IETF GUIDANCE
          </span>
        </div>
        <h1 className="font-display text-[30px] sm:text-[36px] font-bold tracking-tight text-foreground">
          Cryptographic Algorithm Security Matrix
        </h1>
        <p className="max-w-3xl text-[14px] leading-relaxed text-muted-foreground">
          Authoritative technical breakdown of standard cryptographic primitives: security bit-strengths, quantum vulnerability profiles, recommended production applications, and common implementation hazards.
        </p>
      </section>

      {/* Interactive Architectural Decision Wizard */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-display text-[16.5px] font-bold text-foreground">
            Architectural Decision Wizard: "What Primitive Should I Use?"
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: "passwords", label: "Password Storage" },
            { id: "transit", label: "Data in Transit (TLS/Network)" },
            { id: "rest", label: "Data at Rest (Disk/Database)" },
            { id: "signatures", label: "Digital Signatures & Identity" },
            { id: "pqc", label: "Post-Quantum Migration" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setWizardGoal(item.id)}
              className={`px-3.5 py-2 rounded-xl text-[12.5px] font-medium transition border ${
                wizardGoal === item.id
                  ? "bg-primary text-primary-foreground font-semibold border-primary shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {wizardGoal && (
          <div className="rounded-xl bg-muted/40 border border-border p-4.5 space-y-2 mt-2">
            {wizardGoal === "passwords" && (
              <>
                <h3 className="font-bold text-[14px] text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Recommendation: Argon2id (RFC 9106)</span>
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Winner of the Password Hashing Competition. Highly memory-hard, rendering GPU and ASIC dictionary attacks economically infeasible. Configure with a minimum of 64 MiB memory, 3 iterations, and 4 parallel lanes.
                </p>
                <p className="text-[12px] font-mono text-rose-700 bg-rose-50 p-2 rounded-md border border-rose-200">
                  ANTIPATTERN: Never hash passwords with SHA-256, MD5, or plain HMAC. A modern GPU calculates billions of SHA-256 hashes per second.
                </p>
              </>
            )}

            {wizardGoal === "transit" && (
              <>
                <h3 className="font-bold text-[14px] text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Recommendation: TLS 1.3 with X25519 + ML-KEM Hybrid Exchange & AES-256-GCM</span>
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Modern TLS 1.3 negotiates ephemeral keys with forward secrecy. Combining classical X25519 with post-quantum ML-KEM protects against "Harvest Now, Decrypt Later" adversaries.
                </p>
              </>
            )}

            {wizardGoal === "rest" && (
              <>
                <h3 className="font-bold text-[14px] text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Recommendation: AES-256-GCM or XChaCha20-Poly1305</span>
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Always use an AEAD mode. If encrypting billions of records with random nonces, prefer XChaCha20-Poly1305 due to its 192-bit extended nonce, virtually eliminating nonce collision risk.
                </p>
              </>
            )}

            {wizardGoal === "signatures" && (
              <>
                <h3 className="font-bold text-[14px] text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Recommendation: Ed25519 (Classical) / ML-DSA-65 (Post-Quantum)</span>
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Ed25519 offers tiny 64-byte deterministic signatures immune to signature malleability and weak random number generation. For long-lived code signing certificates, evaluate NIST FIPS 204 (ML-DSA).
                </p>
              </>
            )}

            {wizardGoal === "pqc" && (
              <>
                <h3 className="font-bold text-[14px] text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Recommendation: NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)</span>
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Finalized by NIST in August 2024. Use hybrid modes during the transition period to guarantee security against both classical zero-days and future quantum computers.
                </p>
              </>
            )}
          </div>
        )}
      </section>

      {/* Comparative Specification Matrix */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {["all", "AEAD", "Public Key KEM", "Signature", "Hash", "Password KDF"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCat(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-lg font-mono text-[12px] font-medium transition ${
                  filterCat === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                {cat === "all" ? "All Primitives" : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter matrix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 rounded-lg bg-card border border-border text-[12.5px] outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-[13px]">
              <thead className="border-b border-border bg-muted/50 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Security Strength</th>
                  <th className="py-3 px-4">Quantum Threat</th>
                  <th className="py-3 px-4">Standard</th>
                  <th className="py-3 px-4">Production Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((p) => (
                  <tr key={p.name} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {p.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] font-semibold text-primary">
                      {p.securityBits}-bit
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-md border ${
                          p.quantumStatus === "Quantum-Resistant"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : p.quantumStatus === "Broken by Shor"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {p.quantumStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {p.standard}
                    </td>
                    <td className="py-3 px-4 text-[12px] leading-relaxed text-muted-foreground max-w-sm">
                      {p.useCase}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
