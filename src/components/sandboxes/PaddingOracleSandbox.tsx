import { useState, useMemo, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  RefreshCw,
  Terminal,
  CheckCircle2,
  XCircle,
  Sliders,
  Cpu,
} from "lucide-react";

interface HttpLogEntry {
  id: number;
  time: string;
  byteIndex: number;
  testByteHex: string;
  status: 200 | 500;
  message: string;
}

export function PaddingOracleSandbox() {
  const PRESETS = [
    { label: "Standard CTF Flag", text: "FLAG{CBC_PWN!}" },
    { label: "Privileged Session", text: "admin=1;role=root" },
    { label: "Bank Wire Token", text: "PAY:$95000:VAULT" },
  ];

  const [customText, setCustomText] = useState("FLAG{CBC_PWN!}");

  // Format to 16 bytes with PKCS#7 padding
  const targetBytes = useMemo(() => {
    const raw = new TextEncoder().encode(customText.slice(0, 15));
    const padLen = 16 - (raw.length % 16);
    const padded = new Uint8Array(16);
    padded.set(raw);
    for (let i = raw.length; i < 16; i++) {
      padded[i] = padLen;
    }
    return padded;
  }, [customText]);

  // Mock internal block cipher key state: Intermediate state I = D_K(C1)
  // Let original IV C0 be a deterministic 16-byte array
  const originalIV = useMemo(() => {
    return new Uint8Array([0x2a, 0x9b, 0x14, 0x7e, 0x61, 0x82, 0xd4, 0x3f, 0x55, 0xaa, 0x12, 0x99, 0x48, 0xbc, 0x73, 0x10]);
  }, []);

  // I = Plaintext ^ originalIV
  const intermediate = useMemo(() => {
    const arr = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      arr[i] = (targetBytes[i] ?? 0) ^ (originalIV[i] ?? 0);
    }
    return arr;
  }, [targetBytes, originalIV]);

  // Attacker state
  const [activeByteIndex, setActiveByteIndex] = useState<number>(15);
  const [candidateByte, setCandidateByte] = useState<number>(0x00);
  const [recoveredIntermediate, setRecoveredIntermediate] = useState<(number | null)[]>(
    new Array(16).fill(null)
  );
  const [isAutoAttacking, setIsAutoAttacking] = useState<boolean>(false);
  const [attackSpeed] = useState<number>(120);
  const [logs, setLogs] = useState<HttpLogEntry[]>([]);
  const [lastOracleResult, setLastOracleResult] = useState<{ status: 200 | 500; message: string } | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Compute modified IV C'_0 for testing candidateByte at activeByteIndex
  const probeIV = useMemo(() => {
    const iv = new Uint8Array(16);
    const padVal = 16 - activeByteIndex;

    // Bytes before activeByteIndex: keep 0x00
    // Active byte: test candidateByte
    iv[activeByteIndex] = candidateByte;

    // Solved bytes to the right (j > activeByteIndex): set to I[j] ^ padVal
    for (let j = activeByteIndex + 1; j < 16; j++) {
      const knownI = recoveredIntermediate[j];
      iv[j] = knownI !== null && knownI !== undefined ? knownI ^ padVal : (originalIV[j] ?? 0);
    }

    return iv;
  }, [activeByteIndex, candidateByte, recoveredIntermediate, originalIV]);

  // Server Oracle Validation Function
  const queryServerOracle = (testIV: Uint8Array): { status: 200 | 500; message: string } => {
    // Decrypted test plaintext P' = I ^ testIV
    const pPrime = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      pPrime[i] = (intermediate[i] ?? 0) ^ (testIV[i] ?? 0);
    }

    // Check PKCS#7 padding on P'
    const lastByte = pPrime[15] ?? 0;
    if (lastByte === 0 || lastByte > 16) {
      return { status: 500, message: "HTTP 500: Invalid PKCS#7 padding byte (> 16 or 0)" };
    }

    for (let i = 16 - lastByte; i < 16; i++) {
      if ((pPrime[i] ?? 0) !== lastByte) {
        return { status: 500, message: `HTTP 500: Inconsistent PKCS#7 padding pattern (expected 0x${lastByte.toString(16).padStart(2, "0")})` };
      }
    }

    return {
      status: 200,
      message: `HTTP 200 OK: Valid PKCS#7 padding (ends in ${lastByte} byte(s) of 0x${lastByte.toString(16).padStart(2, "0")})`,
    };
  };

  const handleManualProbe = () => {
    const res = queryServerOracle(probeIV);
    setLastOracleResult(res);

    const padVal = 16 - activeByteIndex;
    const now = new Date().toTimeString().split(" ")[0] ?? "00:00:00";
    const newEntry: HttpLogEntry = {
      id: Date.now() + Math.random(),
      time: now,
      byteIndex: activeByteIndex,
      testByteHex: "0x" + candidateByte.toString(16).padStart(2, "0").toUpperCase(),
      status: res.status,
      message: res.message,
    };

    setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);

    if (res.status === 200) {
      const solvedI = candidateByte ^ padVal;
      setRecoveredIntermediate((prev) => {
        const next = [...prev];
        next[activeByteIndex] = solvedI;
        return next;
      });
    }
  };

  // Step crack single byte automatically
  const crackCurrentByte = () => {
    const padVal = 16 - activeByteIndex;
    const testIV = new Uint8Array(probeIV);

    for (let guess = 0; guess <= 255; guess++) {
      testIV[activeByteIndex] = guess;
      const res = queryServerOracle(testIV);
      if (res.status === 200) {
        const solvedI = guess ^ padVal;
        setCandidateByte(guess);
        setLastOracleResult(res);
        setRecoveredIntermediate((prev) => {
          const next = [...prev];
          next[activeByteIndex] = solvedI;
          return next;
        });

        const now = new Date().toTimeString().split(" ")[0] ?? "00:00:00";
        setLogs((prev) => [
          {
            id: Date.now(),
            time: now,
            byteIndex: activeByteIndex,
            testByteHex: "0x" + guess.toString(16).padStart(2, "0").toUpperCase(),
            status: 200,
            message: `MATCH: Intermediate byte I[${activeByteIndex}] = 0x${solvedI.toString(16).padStart(2, "0").toUpperCase()}`,
          },
          ...prev.slice(0, 49),
        ]);

        if (activeByteIndex > 0) {
          setActiveByteIndex(activeByteIndex - 1);
          setCandidateByte(0x00);
        }
        return;
      }
    }
  };

  // Auto crack all bytes
  useEffect(() => {
    let timer: any;
    if (isAutoAttacking) {
      if (activeByteIndex < 0) {
        setIsAutoAttacking(false);
        return;
      }

      timer = setTimeout(() => {
        crackCurrentByte();
      }, attackSpeed);
    }
    return () => clearTimeout(timer);
  }, [isAutoAttacking, activeByteIndex, attackSpeed, probeIV]);

  const handleReset = () => {
    setIsAutoAttacking(false);
    setActiveByteIndex(15);
    setCandidateByte(0x00);
    setRecoveredIntermediate(new Array(16).fill(null));
    setLogs([]);
    setLastOracleResult(null);
  };

  // Plaintext reconstructed so far
  const recoveredPlaintext = useMemo(() => {
    return recoveredIntermediate.map((I, idx) => {
      if (I === null || I === undefined) return "·";
      const P = I ^ (originalIV[idx] ?? 0);
      return P >= 32 && P <= 126 ? String.fromCharCode(P) : `\\x${P.toString(16).padStart(2, "0")}`;
    });
  }, [recoveredIntermediate, originalIV]);

  const solvedCount = recoveredIntermediate.filter((x) => x !== null).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded ring-1 ring-rose-500/30">
              Interactive Attack Sandbox
            </span>
            <span className="font-mono text-xs text-muted-foreground">Serge Vaudenay (EUROCRYPT 2002)</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-1">
            Vaudenay CBC Padding Oracle Exploitation Lab
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[65ch]">
            An active Man-in-the-Middle interceptor manipulates ciphertext block $C_0$ (IV) to trigger server PKCS#7 validation responses, systematically recovering intermediate state $I = D_K(C_1)$ and complete plaintext with zero key knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoAttacking(!isAutoAttacking)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              isAutoAttacking
                ? "bg-amber-500 text-amber-950 hover:bg-amber-400"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {isAutoAttacking ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            <span>{isAutoAttacking ? "Pause Attack" : "Auto Exploit All Bytes"}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition cursor-pointer"
            title="Reset Sandbox"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Target Setup & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] text-muted-foreground uppercase font-bold block">
            Target Plaintext (16-Byte PKCS#7 Block):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                handleReset();
              }}
              maxLength={15}
              className="flex-1 rounded-xl bg-background border border-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter plaintext to encrypt and attack..."
            />
            <div className="flex gap-1">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCustomText(p.text);
                    handleReset();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] transition cursor-pointer border ${
                    customText === p.text
                      ? "bg-primary text-primary-foreground border-primary font-bold"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase font-bold block">
            Attack Speed & Progress:
          </label>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-background border border-border">
            <span className="text-[11px] font-bold text-primary">{solvedCount} / 16 Bytes</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(solvedCount / 16) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 16-Byte Register State Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="size-3.5 text-primary" /> 16-Byte Block Cryptanalysis Registers
          </span>
          <span className="text-muted-foreground">Active Byte Target: Index {activeByteIndex} (Padding Pad: 0x{(16 - activeByteIndex).toString(16).padStart(2, "0")})</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-background/50 p-4 font-mono text-xs">
          <div className="min-w-[620px] space-y-3">
            {/* Column Indices */}
            <div className="grid grid-cols-17 gap-1 text-[10px] text-center font-bold text-muted-foreground">
              <span className="text-left">REG</span>
              {Array.from({ length: 16 }, (_, i) => (
                <span key={i} className={i === activeByteIndex ? "text-primary font-black underline" : ""}>
                  [{i}]
                </span>
              ))}
            </div>

            {/* Row 1: Original IV (C0) */}
            <div className="grid grid-cols-17 gap-1 items-center text-center">
              <span className="text-[10px] text-muted-foreground uppercase text-left font-bold">Orig IV (C0)</span>
              {Array.from(originalIV).map((b, i) => (
                <span key={i} className="p-1 rounded bg-muted/60 text-muted-foreground text-[11px]">
                  {b.toString(16).padStart(2, "0")}
                </span>
              ))}
            </div>

            {/* Row 2: Modified Probe IV (C'0) */}
            <div className="grid grid-cols-17 gap-1 items-center text-center">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase text-left font-bold">Probe (C'0)</span>
              {Array.from(probeIV).map((b, i) => (
                <span
                  key={i}
                  className={`p-1 rounded text-[11px] font-bold ${
                    i === activeByteIndex
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/50"
                      : i > activeByteIndex
                      ? "bg-muted/80 text-foreground"
                      : "bg-muted/30 text-muted-foreground/50"
                  }`}
                >
                  {b.toString(16).padStart(2, "0")}
                </span>
              ))}
            </div>

            {/* Row 3: Intermediate State I = D_K(C1) */}
            <div className="grid grid-cols-17 gap-1 items-center text-center">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase text-left font-bold">Inter (I)</span>
              {recoveredIntermediate.map((val, i) => (
                <span
                  key={i}
                  className={`p-1 rounded text-[11px] font-bold ${
                    val !== null
                      ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/40"
                      : "bg-muted/20 text-muted-foreground/30"
                  }`}
                >
                  {val !== null ? val.toString(16).padStart(2, "0") : "??"}
                </span>
              ))}
            </div>

            {/* Row 4: Recovered Plaintext P */}
            <div className="grid grid-cols-17 gap-1 items-center text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase text-left font-bold">Plain (P)</span>
              {recoveredPlaintext.map((char, i) => (
                <span
                  key={i}
                  className={`p-1.5 rounded text-[12px] font-bold ${
                    recoveredIntermediate[i] !== null
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40"
                      : "bg-muted/20 text-muted-foreground/30"
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Prober & Live HTTP Wire Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
        {/* Probing Station */}
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5">
              <Sliders className="size-3.5 text-primary" /> Active Byte Probe Console
            </span>
            <span className="text-muted-foreground text-[10.5px]">Index: {activeByteIndex}</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">Candidate Byte:</span>
                <span className="font-bold text-primary">
                  0x{candidateByte.toString(16).padStart(2, "0").toUpperCase()} ({candidateByte})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={candidateByte}
                onChange={(e) => setCandidateByte(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleManualProbe}
                className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition cursor-pointer"
              >
                Send Probe (POST /api/decrypt)
              </button>
              <button
                type="button"
                onClick={crackCurrentByte}
                className="px-3 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold transition cursor-pointer"
              >
                Auto-Find Byte
              </button>
            </div>

            {/* Oracle Last Result Banner */}
            {lastOracleResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  lastOracleResult.status === 200
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                }`}
              >
                {lastOracleResult.status === 200 ? (
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-500" />
                ) : (
                  <XCircle className="size-4 shrink-0 mt-0.5 text-rose-500" />
                )}
                <div>
                  <div className="font-bold">{lastOracleResult.message}</div>
                  {lastOracleResult.status === 200 && (
                    <div className="text-[11px] mt-1 text-emerald-700 dark:text-emerald-400">
                      Formula: I[{activeByteIndex}] = 0x{candidateByte.toString(16).padStart(2, "0")} ⊕ 0x{(16 - activeByteIndex).toString(16).padStart(2, "0")} = 0x{(candidateByte ^ (16 - activeByteIndex)).toString(16).padStart(2, "0")}.
                      P[{activeByteIndex}] = I[{activeByteIndex}] ⊕ C0[{activeByteIndex}] = '
                      {String.fromCharCode((candidateByte ^ (16 - activeByteIndex)) ^ (originalIV[activeByteIndex] ?? 0))}'.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live HTTP Wire Log */}
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5">
              <Terminal className="size-3.5 text-primary" /> Live HTTP Wire Telemetry Log
            </span>
            <span className="text-[10px] text-muted-foreground">{logs.length} Probes Recorded</span>
          </div>

          <div
            ref={logContainerRef}
            className="h-[180px] overflow-y-auto rounded-lg bg-muted/70 p-2.5 font-mono text-[10.5px] space-y-1.5 border border-border text-foreground"
          >
            {logs.length === 0 ? (
              <span className="text-muted-foreground italic block p-2">
                No probe telemetry captured yet. Send a probe or click "Auto Exploit" to monitor live requests...
              </span>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-tight">
                  <span className="text-muted-foreground shrink-0">{log.time}</span>
                  <span className="text-primary shrink-0">idx={log.byteIndex}</span>
                  <span className="text-amber-400 shrink-0">{log.testByteHex}</span>
                  <span
                    className={`shrink-0 font-bold ${
                      log.status === 200 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    [{log.status}]
                  </span>
                  <span className="text-muted-foreground truncate">{log.message}</span>
                </div>
              ))
            )}
          </div>

          <div className="text-[10.5px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border">
            <strong>Theoretical Guarantee:</strong> Each byte requires at most 256 requests. Total recovery of a 16-byte block requires at most $16 \times 256 = 4,096$ queries, breaking AES-CBC completely without knowing the 128-bit key.
          </div>
        </div>
      </div>
    </div>
  );
}
