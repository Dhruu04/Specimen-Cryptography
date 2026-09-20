import { useState } from "react";
import { ArrowRight, Lock, MessageSquare, ShieldAlert, ShieldCheck, User, Zap } from "lucide-react";

export function DhMitmSimulator() {
  const p = 23;
  const g = 5;

  // Private keys
  const [a, setA] = useState(6); // Alice's secret
  const [b, setB] = useState(15); // Bob's secret
  const [m, setM] = useState(9); // Mallory's secret

  // MITM Enabled toggle
  const [mitmActive, setMitmActive] = useState(true);

  // ModPow helper
  const modPow = (base: number, exp: number, mod: number) => {
    let res = 1;
    let b = base % mod;
    let e = exp;
    while (e > 0) {
      if (e % 2 === 1) res = (res * b) % mod;
      b = (b * b) % mod;
      e = Math.floor(e / 2);
    }
    return res;
  };

  // Public keys
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);
  const M = modPow(g, m, p);

  // Shared keys
  // If MITM active:
  // Alice thinks she talks to Bob: receives M instead of B
  const keyAlice = mitmActive ? modPow(M, a, p) : modPow(B, a, p);
  // Bob thinks he talks to Alice: receives M instead of A
  const keyBob = mitmActive ? modPow(M, b, p) : modPow(A, b, p);

  // Mallory's derived keys with both parties
  const keyMalloryAlice = modPow(A, m, p);
  const keyMalloryBob = modPow(B, m, p);

  // Interactive Message transmission
  const [aliceMessage, setAliceMessage] = useState("Transfer $500 to Bob");
  const [tamperedMessage, setTamperedMessage] = useState("Transfer $50,000 to Mallory");

  // Ciphertext simulation (Caesar shift using key)
  const shift = (str: string, k: number) =>
    str
      .split("")
      .map((c) => String.fromCharCode(c.charCodeAt(0) + (k % 10)))
      .join("");

  const unshift = (str: string, k: number) =>
    str
      .split("")
      .map((c) => String.fromCharCode(c.charCodeAt(0) - (k % 10)))
      .join("");

  const aliceCiphertext = shift(aliceMessage, keyAlice);
  const malloryDecrypted = mitmActive ? unshift(aliceCiphertext, keyMalloryAlice) : "";
  const bobReceivedCiphertext = mitmActive ? shift(tamperedMessage, keyMalloryBob) : aliceCiphertext;
  const bobDecrypted = unshift(bobReceivedCiphertext, keyBob);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              ACTIVE INTERCEPTION
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Diffie-Hellman MITM
            </span>
          </div>
          <h3 className="font-sans text-[17px] font-bold text-foreground">
            Diffie-Hellman Man-in-the-Middle (MITM) Simulator
          </h3>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Demonstrates why unauthenticated Diffie-Hellman is insecure against an active network eavesdropper.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMitmActive(!mitmActive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[12.5px] font-semibold transition shadow-xs ${
            mitmActive
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          <Zap className="size-3.5" />
          <span>{mitmActive ? "Mallory Interceptor: ACTIVE" : "Mallory Interceptor: INACTIVE (Direct)"}</span>
        </button>
      </div>

      {/* Domain Parameters */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border font-mono text-[12px]">
        <span className="text-muted-foreground">Public Parameters:</span>
        <span className="bg-background px-2 py-0.5 rounded border border-border">Prime p = {p}</span>
        <span className="bg-background px-2 py-0.5 rounded border border-border">Generator g = {g}</span>
      </div>

      {/* Three party topology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alice */}
        <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <User className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-[14px] text-foreground">Alice</h4>
              <span className="text-[11px] font-mono text-muted-foreground">Private a = {a}</span>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-[11.5px]">
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span className="text-muted-foreground">Public Key A:</span>
              <span className="font-bold text-foreground">gᵃ mod p = {A}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Negotiated Key:</span>
              <span className="font-bold text-primary">K_Alice = {keyAlice}</span>
            </div>
          </div>
        </div>

        {/* Mallory (Attacker) */}
        <div
          className={`rounded-xl border p-4 space-y-3 transition ${
            mitmActive ? "bg-rose-50/70 border-rose-200" : "bg-muted/10 border-border/40 opacity-40"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`grid size-8 place-items-center rounded-lg ${
                mitmActive ? "bg-rose-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <ShieldAlert className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-[14px] text-foreground">Mallory (Attacker)</h4>
              <span className="text-[11px] font-mono text-muted-foreground">Private m = {m}</span>
            </div>
          </div>

          {mitmActive ? (
            <div className="space-y-1.5 font-mono text-[11.5px] text-rose-900">
              <div className="flex justify-between border-b border-rose-200 pb-1">
                <span>Spoofed Key M:</span>
                <span className="font-bold">gᵐ mod p = {M}</span>
              </div>
              <div className="flex justify-between">
                <span>Key with Alice:</span>
                <span className="font-bold">K_AM = {keyMalloryAlice}</span>
              </div>
              <div className="flex justify-between">
                <span>Key with Bob:</span>
                <span className="font-bold">K_BM = {keyMalloryBob}</span>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">Passively watching traffic (unable to break discrete log).</p>
          )}
        </div>

        {/* Bob */}
        <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <User className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-[14px] text-foreground">Bob</h4>
              <span className="text-[11px] font-mono text-muted-foreground">Private b = {b}</span>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-[11.5px]">
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span className="text-muted-foreground">Public Key B:</span>
              <span className="font-bold text-foreground">gᵇ mod p = {B}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Negotiated Key:</span>
              <span className="font-bold text-primary">K_Bob = {keyBob}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Tampering Demonstration */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <h4 className="font-semibold text-[13.5px] text-foreground flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <span>Live Message Interception & Tampering Stream</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12.5px]">
          <div>
            <label className="font-mono text-[11px] text-muted-foreground block mb-1">
              Alice's Original Message:
            </label>
            <input
              type="text"
              value={aliceMessage}
              onChange={(e) => setAliceMessage(e.target.value)}
              className="w-full rounded-lg bg-background p-2 border border-border font-sans outline-none text-[13px]"
            />
          </div>

          {mitmActive && (
            <div>
              <label className="font-mono text-[11px] text-rose-700 font-semibold block mb-1">
                Mallory's Tampered Payload:
              </label>
              <input
                type="text"
                value={tamperedMessage}
                onChange={(e) => setTamperedMessage(e.target.value)}
                className="w-full rounded-lg bg-rose-50 border border-rose-300 p-2 font-sans outline-none text-[13px] text-rose-900 font-medium"
              />
            </div>
          )}

          <div>
            <label className="font-mono text-[11px] text-muted-foreground block mb-1">
              Bob Decrypted Result:
            </label>
            <div
              className={`p-2 rounded-lg font-sans text-[13px] font-semibold border ${
                mitmActive
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              {bobDecrypted}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border/80 p-4 text-[12.5px] text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Why Authentication is Required (Stallings Ch. 10):</strong> Plain Diffie-Hellman provides <em>zero identity authentication</em>. Mallory establishes independent keys with Alice and Bob. To prevent this, TLS 1.3 and SSH sign ephemeral DH keys using trusted public key certificates (ECDSA, Ed25519, or RSA).
      </div>
    </div>
  );
}
