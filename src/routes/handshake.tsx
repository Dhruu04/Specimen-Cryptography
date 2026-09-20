import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { TrackRail } from "@/components/TrackRail";
import {
  createTls13Session,
  simulateMitmByteFlip,
  type TlsPacket,
  type TamperSimulationResult,
} from "@/lib/crypto/tls13";
import { Zap, ShieldAlert, Lock, X, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/handshake")({
  head: () => ({
    meta: [
      { title: "TLS 1.3 Handshake & Packet Inspector — Specimen" },
      {
        name: "description",
        content:
          "Interactive TLS 1.3 handshake packet inspector, HKDF-SHA256 key schedule derivation flowchart, and live MITM byte-flipping AEAD integrity check simulator.",
      },
      { property: "og:title", content: "TLS 1.3 Handshake & Packet Inspector — Specimen" },
    ],
  }),
  component: HandshakePage,
});

function HandshakePage() {
  const [sniHost, setSniHost] = useState<string>("api.crypto.terminal.internal");
  const session = useMemo(() => createTls13Session(sniHost), [sniHost]);

  const [selectedPacket, setSelectedPacket] = useState<TlsPacket>(() => session.packets[0]!);
  const [tamperedPacketId, setTamperedPacketId] = useState<string | null>(null);
  const [tamperResult, setTamperResult] = useState<TamperSimulationResult | null>(null);
  const [showHkdfSchedule, setShowHkdfSchedule] = useState<boolean>(true);

  const handleTamper = (packetId: string) => {
    setTamperedPacketId(packetId);
    const result = simulateMitmByteFlip(packetId);
    setTamperResult(result);
  };

  const clearTamper = () => {
    setTamperedPacketId(null);
    setTamperResult(null);
  };

  return (
    <main className="mt-2 space-y-4 pb-8">
      <TrackRail />

      <section className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-primary bg-muted px-2 py-0.2 rounded-md border border-border">Protocol Forensics</span>
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.2 font-mono text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            RFC 8446 (1-RTT & 0-RTT Handshake)
          </span>
        </div>
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight text-foreground">
          TLS 1.3 Handshake & Packet Inspector
        </h1>
        <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
          Inspect every packet exchanged during a complete 1-RTT TLS 1.3 handshake. Explore the HKDF-SHA256 key schedule derivation tree, and simulate MITM byte-flipping to watch AEAD tag verification abort malicious packets in real time.
        </p>
      </section>

      {/* SNI Host & Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-mono font-bold uppercase text-muted-foreground">Target SNI Host:</span>
          <input
            type="text"
            value={sniHost}
            onChange={(e) => setSniHost(e.target.value)}
            className="rounded-lg bg-background px-2.5 py-1 text-xs font-mono border border-border text-foreground w-60 outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHkdfSchedule(!showHkdfSchedule)}
            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 font-mono text-xs font-semibold text-foreground border border-border transition-colors cursor-pointer"
          >
            {showHkdfSchedule ? "Hide HKDF Schedule" : "Show HKDF Schedule"}
          </button>
          {tamperedPacketId ? (
            <button
              type="button"
              onClick={clearTamper}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 font-mono text-xs font-bold border border-rose-500/30 transition-colors cursor-pointer"
            >
              <X className="size-3" />
              <span>Clear MITM Tamper</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTamper("pkt-8")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Zap className="size-3" />
              <span>MITM: Flip 1 Byte in AppData Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Tamper Alert Banner */}
      {tamperResult && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-800 dark:text-rose-300 font-mono text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-rose-500" />
              <span>Connection Aborted: {tamperResult.alertName}</span>
            </span>
            <span>Offset: Byte #{tamperResult.byteOffset}</span>
          </div>
          <p className="text-[11.5px] opacity-90 leading-relaxed">{tamperResult.reason}</p>
          <div className="pt-1 text-[10.5px] flex gap-4 text-rose-600 dark:text-rose-400">
            <span>Original Byte: <code>{tamperResult.originalByteHex}</code></span>
            <span>Tampered Byte: <code>{tamperResult.tamperedByteHex}</code></span>
            <span>Receiver Action: <strong>Immediate TCP RST / Connection Termination</strong></span>
          </div>
        </div>
      )}

      {/* Protocol Swimlane & Packet Exchange */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Packets Stream */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase tracking-wider px-2">
            <span>Client (Browser)</span>
            <span>1-RTT Wire Handshake</span>
            <span>Server (Edge Gateway)</span>
          </div>

          <div className="space-y-2.5">
            {session.packets.map((pkt) => {
              const isSelected = selectedPacket.id === pkt.id;
              const isTampered = tamperedPacketId === pkt.id;
              const isFromClient = pkt.sender === "client";

              return (
                <div
                  key={pkt.id}
                  onClick={() => setSelectedPacket(pkt)}
                  className={`p-3 rounded-xl ring-1 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isTampered
                      ? "bg-rose-500/10 ring-rose-500/50"
                      : isSelected
                      ? "bg-primary/10 ring-primary/50 shadow-xs"
                      : "bg-card ring-border hover:ring-border/80"
                  }`}
                >
                  <div className={`flex items-center gap-2.5 ${isFromClient ? "" : "order-2"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      isFromClient ? "bg-sky-500/20 text-sky-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {isFromClient ? "C" : "S"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{pkt.name}</span>
                        {pkt.isEncrypted && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 ring-1 ring-neutral-700">
                            <Lock className="size-2.5 text-neutral-400" />
                            <span>Encrypted</span>
                          </span>
                        )}
                        {isTampered && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">
                            TAMPERED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                        {pkt.summary}
                      </p>
                    </div>
                  </div>

                  <div className={`font-mono text-[11px] text-muted-foreground shrink-0 ${isFromClient ? "" : "order-1"}`}>
                    {isFromClient ? "──▶" : "◀──"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Packet Inspector Drawer */}
        <div className="lg:col-span-5 rounded-xl bg-card p-4 ring-1 ring-border space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                Packet Inspector
              </span>
              <h3 className="font-mono text-sm font-bold text-foreground">
                {selectedPacket.name}
              </h3>
            </div>
            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded bg-background ring-1 ring-border text-muted-foreground">
              Content Type: {selectedPacket.contentType}
            </span>
          </div>

          {/* Key Details */}
          <div className="space-y-2 font-mono text-xs">
            <div className="bg-background/80 p-2.5 rounded-lg ring-1 ring-border space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase block">Protocol Version:</span>
              <span className="font-bold text-foreground">{selectedPacket.details.protocolVersion}</span>
            </div>

            {selectedPacket.details.cipherSuite && (
              <div className="bg-background/80 p-2.5 rounded-lg ring-1 ring-border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase block">Cipher Suite:</span>
                <span className="font-bold text-primary">{selectedPacket.details.cipherSuite}</span>
              </div>
            )}

            {selectedPacket.details.keyShareGroup && (
              <div className="bg-background/80 p-2.5 rounded-lg ring-1 ring-border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase block">ECDHE Key Share Group:</span>
                <span className="font-bold text-foreground">{selectedPacket.details.keyShareGroup}</span>
                {selectedPacket.details.publicKeySnippet && (
                  <span className="block text-[10px] text-muted-foreground truncate">
                    Pub: {selectedPacket.details.publicKeySnippet}
                  </span>
                )}
              </div>
            )}

            {selectedPacket.details.authTagSnippet && (
              <div className="bg-background/80 p-2.5 rounded-lg ring-1 ring-border space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase block">128-bit AEAD Auth Tag:</span>
                <span className="font-bold text-emerald-400">{selectedPacket.details.authTagSnippet}</span>
              </div>
            )}
          </div>

          {/* Hex Preview */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
              Wire Hex Dump:
            </span>
            <div className="rounded-lg bg-neutral-950 p-3 font-mono text-[11px] text-emerald-400 ring-1 ring-border/60 overflow-x-auto">
              {selectedPacket.hexPreview}
            </div>
          </div>

          {/* Action to Tamper Specific Packet */}
          <button
            type="button"
            onClick={() => handleTamper(selectedPacket.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-mono text-xs font-bold text-foreground ring-1 ring-border transition-colors cursor-pointer"
          >
            <Zap className="size-3.5 text-amber-500" />
            <span>Test Byte Flip on this Packet</span>
          </button>
        </div>
      </div>

      {/* HKDF Key Derivation Schedule (RFC 8446) */}
      {showHkdfSchedule && (
        <div className="rounded-xl bg-card p-5 ring-1 ring-border space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div>
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-primary font-bold">
                HKDF Key Schedule (RFC 8446 §7.1)
              </span>
              <h3 className="font-mono text-sm font-bold text-foreground">
                Cryptographic Secret Derivation Hierarchy
              </h3>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Hash: SHA-256 | PRF: HMAC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {session.hkdfTree.map((node, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-background/60 ring-1 ring-border/80 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{node.name}</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                    {node.label}
                  </span>
                </div>
                <div className="text-[10.5px] text-muted-foreground truncate">
                  Derived from: <span className="text-foreground">{node.derivedFrom}</span>
                </div>
                <div className="text-[10.5px] text-muted-foreground">
                  Secret: <code className="text-sky-400">{node.secretHex}...</code>
                </div>
                <div className="text-[10px] text-neutral-400 border-t border-border/40 pt-1">
                  {node.purpose}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
