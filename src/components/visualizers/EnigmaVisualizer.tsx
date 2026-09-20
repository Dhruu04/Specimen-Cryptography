import { useState, useMemo } from "react";
import {
  RotateCcw,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Radio,
  Sliders,
  CheckCircle2,
} from "lucide-react";

type Props = {
  values?: Record<string, string>;
  resultOutput?: string;
};

// Historical Wehrmacht Enigma I / M3 Rotor Wirings & Turnovers
const ROTOR_WIRINGS: Record<string, { wiring: string; turnover: string }> = {
  I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", turnover: "Q" }, // turnover at Q (steps middle when moving Q->R)
  II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", turnover: "E" }, // turnover at E
  III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", turnover: "V" }, // turnover at V
  IV: { wiring: "ESOVPZJAYQUIRHXLNFTGKDCMWB", turnover: "J" }, // turnover at J
  V: { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", turnover: "Z" }, // turnover at Z
};

const REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

export function EnigmaVisualizer({ values }: Props) {
  // Configurable rotors
  const [leftRotor, setLeftRotor] = useState<string>("I");
  const [midRotor, setMidRotor] = useState<string>("II");
  const [rightRotor, setRightRotor] = useState<string>("III");

  // Positions (0-25)
  const [posLeft, setPosLeft] = useState<number>(0); // 'A'
  const [posMid, setPosMid] = useState<number>(0); // 'A'
  const [posRight, setPosRight] = useState<number>(0); // 'A'

  // Ring settings (Ringstellung 0-25)
  const [ringLeft] = useState<number>(0);
  const [ringMid] = useState<number>(0);
  const [ringRight] = useState<number>(0);

  // Plugboard pairs (e.g. "AQ", "WE")
  const [plugs, setPlugs] = useState<string[]>(["AB", "CD", "EF"]);
  const [newPlugA, setNewPlugA] = useState<string>("G");
  const [newPlugB, setNewPlugB] = useState<string>("H");

  // Active key and lamp
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeLamp, setActiveLamp] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ input: string; output: string }[]>([]);
  const [lastTrace, setLastTrace] = useState<
    { stage: string; inChar: string; outChar: string; note: string }[]
  >([]);

  // Plugboard lookup helper
  const plugboardMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of plugs) {
      if (p.length === 2) {
        const a = p[0] ?? "";
        const b = p[1] ?? "";
        if (a && b) {
          map[a] = b;
          map[b] = a;
        }
      }
    }
    return map;
  }, [plugs]);

  // Stepping mechanics including middle rotor double-stepping anomaly
  const stepRotors = (
    curL: number,
    curM: number,
    curR: number
  ): { nextL: number; nextM: number; nextR: number } => {
    const rNotch = (ROTOR_WIRINGS[rightRotor]?.turnover.charCodeAt(0) ?? 86) - 65;
    const mNotch = (ROTOR_WIRINGS[midRotor]?.turnover.charCodeAt(0) ?? 69) - 65;

    let nextL = curL;
    let nextM = curM;
    let nextR = (curR + 1) % 26;

    // Normal right-to-middle turnover
    const rightSteppedMid = curR === rNotch;

    // Double-stepping anomaly: if middle is at notch, it steps itself AND left rotor!
    const midDoubleStep = curM === mNotch;

    if (midDoubleStep) {
      nextM = (curM + 1) % 26;
      nextL = (curL + 1) % 26;
    } else if (rightSteppedMid) {
      nextM = (curM + 1) % 26;
    }

    return { nextL, nextM, nextR };
  };

  // Process a single character through the entire electrical circuit
  const pressKey = (char: string) => {
    const upper = char.toUpperCase();
    if (upper < "A" || upper > "Z") return;

    // 1. Mechanical rotor stepping occurs BEFORE electrical contact
    const { nextL, nextM, nextR } = stepRotors(posLeft, posMid, posRight);
    setPosLeft(nextL);
    setPosMid(nextM);
    setPosRight(nextR);

    // 2. Electrical signal tracing
    const trace: { stage: string; inChar: string; outChar: string; note: string }[] = [];

    // Stage 1: Key to Plugboard (Steckerbrett)
    const plugIn = upper;
    const plugOut = plugboardMap[plugIn] || plugIn;
    trace.push({
      stage: "Plugboard (Entry)",
      inChar: plugIn,
      outChar: plugOut,
      note: plugOut !== plugIn ? `Swapped by cable ${plugIn}↔${plugOut}` : "Direct pass-through",
    });

    // Rotor forward pass helper
    const forwardRotor = (inC: string, rotorKey: string, pos: number, ring: number) => {
      const wiring = ROTOR_WIRINGS[rotorKey]?.wiring ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const inIdx = (inC.charCodeAt(0) - 65 + pos - ring + 26) % 26;
      const wiredChar = wiring[inIdx] ?? "A";
      const outIdx = (wiredChar.charCodeAt(0) - 65 - pos + ring + 26) % 26;
      return String.fromCharCode(outIdx + 65);
    };

    // Reverse pass helper
    const reverseRotor = (inC: string, rotorKey: string, pos: number, ring: number) => {
      const wiring = ROTOR_WIRINGS[rotorKey]?.wiring ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const inIdx = (inC.charCodeAt(0) - 65 + pos - ring + 26) % 26;
      const targetChar = String.fromCharCode(inIdx + 65);
      const wireIdx = wiring.indexOf(targetChar);
      const outIdx = (wireIdx - pos + ring + 26) % 26;
      return String.fromCharCode(outIdx + 65);
    };

    // Stage 2: Fast Rotor (Right)
    const r3Out = forwardRotor(plugOut, rightRotor, nextR, ringRight);
    trace.push({
      stage: `Rotor ${rightRotor} (Right/Fast, Pos ${String.fromCharCode(nextR + 65)})`,
      inChar: plugOut,
      outChar: r3Out,
      note: "Forward pin translation",
    });

    // Stage 3: Middle Rotor
    const r2Out = forwardRotor(r3Out, midRotor, nextM, ringMid);
    trace.push({
      stage: `Rotor ${midRotor} (Middle, Pos ${String.fromCharCode(nextM + 65)})`,
      inChar: r3Out,
      outChar: r2Out,
      note: "Forward pin translation",
    });

    // Stage 4: Slow Rotor (Left)
    const r1Out = forwardRotor(r2Out, leftRotor, nextL, ringLeft);
    trace.push({
      stage: `Rotor ${leftRotor} (Left/Slow, Pos ${String.fromCharCode(nextL + 65)})`,
      inChar: r2Out,
      outChar: r1Out,
      note: "Forward pin translation",
    });

    // Stage 5: Reflector (UKW-B)
    const reflInIdx = r1Out.charCodeAt(0) - 65;
    const reflOut = REFLECTOR_B[reflInIdx] ?? "A";
    trace.push({
      stage: "Reflector UKW-B",
      inChar: r1Out,
      outChar: reflOut,
      note: `Never maps to self (${r1Out} ≠ ${reflOut})`,
    });

    // Stage 6: Reverse Left Rotor
    const rev1Out = reverseRotor(reflOut, leftRotor, nextL, ringLeft);
    trace.push({
      stage: `Rotor ${leftRotor} (Reverse)`,
      inChar: reflOut,
      outChar: rev1Out,
      note: "Reverse pin translation",
    });

    // Stage 7: Reverse Middle Rotor
    const rev2Out = reverseRotor(rev1Out, midRotor, nextM, ringMid);
    trace.push({
      stage: `Rotor ${midRotor} (Reverse)`,
      inChar: rev1Out,
      outChar: rev2Out,
      note: "Reverse pin translation",
    });

    // Stage 8: Reverse Right Rotor
    const rev3Out = reverseRotor(rev2Out, rightRotor, nextR, ringRight);
    trace.push({
      stage: `Rotor ${rightRotor} (Reverse)`,
      inChar: rev2Out,
      outChar: rev3Out,
      note: "Reverse pin translation",
    });

    // Stage 9: Return through Plugboard
    const finalLamp = plugboardMap[rev3Out] || rev3Out;
    trace.push({
      stage: "Plugboard (Return)",
      inChar: rev3Out,
      outChar: finalLamp,
      note: finalLamp !== rev3Out ? `Swapped by cable ${rev3Out}↔${finalLamp}` : "Direct pass-through",
    });

    // Stage 10: Lampboard
    trace.push({
      stage: "Lampboard",
      inChar: finalLamp,
      outChar: finalLamp,
      note: `Bulb '${finalLamp}' illuminates!`,
    });

    setActiveKey(upper);
    setActiveLamp(finalLamp);
    setLastTrace(trace);
    setTranscript((prev) => [...prev.slice(-20), { input: upper, output: finalLamp }]);
  };

  const handleAddPlug = () => {
    const a = newPlugA.toUpperCase();
    const b = newPlugB.toUpperCase();
    if (a === b) return;
    // Check if either is already plugged
    const existing = plugs.join("");
    if (existing.includes(a) || existing.includes(b)) return;
    setPlugs((prev) => [...prev, `${a}${b}`]);
  };

  const removePlug = (index: number) => {
    setPlugs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetPositions = () => {
    setPosLeft(0);
    setPosMid(0);
    setPosRight(0);
    setTranscript([]);
    setActiveKey(null);
    setActiveLamp(null);
    setLastTrace([]);
  };

  // Keyboard rows (German military QWERTZ layout)
  const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Z", "U", "I", "O"],
    ["A", "S", "D", "F", "G", "H", "J", "K"],
    ["P", "Y", "X", "C", "V", "B", "N", "M", "L"],
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded ring-1 ring-primary/30">
              Interactive Mechanical Wiring Model
            </span>
            <span className="text-muted-foreground text-[11px]">Wehrmacht Enigma I / M3</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-1 font-display">
            Mechanical Enigma Circuit & Rotor Simulator
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-[65ch]">
            Type or click keys on the QWERTZ board below. Mechanical pawls step the rotors, routing electric current through the Steckerbrett, three rotors, reflector, and back to light the lampboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetPositions}
            className="p-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
            title="Reset Rotors to A-A-A"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* 3 Rotors Mechanical Cylinders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="size-3.5 text-primary" /> Active Rotor Assembly (Walzenlage)
          </span>
          <span className="text-muted-foreground text-[10.5px]">Double-Stepping Anomaly Enabled</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rotor Left (Slow) */}
          <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3 flex flex-col items-center text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Rotor I (Left / Slow)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPosLeft((prev) => (prev + 25) % 26)}
                className="size-7 rounded bg-muted hover:bg-muted/80 text-foreground grid place-items-center cursor-pointer font-bold"
              >
                -
              </button>
              <div className="size-14 rounded-xl bg-primary/10 border-2 border-primary/40 grid place-items-center text-2xl font-black text-primary shadow-inner">
                {String.fromCharCode(posLeft + 65)}
              </div>
              <button
                type="button"
                onClick={() => setPosLeft((prev) => (prev + 1) % 26)}
                className="size-7 rounded bg-muted hover:bg-muted/80 text-foreground grid place-items-center cursor-pointer font-bold"
              >
                +
              </button>
            </div>
            <div className="text-[10.5px] text-muted-foreground">
              Turnover Notch: <strong className="text-foreground">{ROTOR_WIRINGS[leftRotor]?.turnover}</strong>
            </div>
          </div>

          {/* Rotor Middle (Double Stepping) */}
          <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3 flex flex-col items-center text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Rotor II (Middle)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPosMid((prev) => (prev + 25) % 26)}
                className="size-7 rounded bg-muted hover:bg-muted/80 text-foreground grid place-items-center cursor-pointer font-bold"
              >
                -
              </button>
              <div className="size-14 rounded-xl bg-primary/10 border-2 border-primary/40 grid place-items-center text-2xl font-black text-primary shadow-inner">
                {String.fromCharCode(posMid + 65)}
              </div>
              <button
                type="button"
                onClick={() => setPosMid((prev) => (prev + 1) % 26)}
                className="size-7 rounded bg-muted hover:bg-muted/80 text-foreground grid place-items-center cursor-pointer font-bold"
              >
                +
              </button>
            </div>
            <div className="text-[10.5px] text-muted-foreground">
              Turnover Notch: <strong className="text-foreground">{ROTOR_WIRINGS[midRotor]?.turnover}</strong> (Double-step)
            </div>
          </div>

          {/* Rotor Right (Fast / Every Keypress) */}
          <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3 flex flex-col items-center text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Rotor III (Right / Fast)</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPosRight((prev) => (prev + 25) % 26)}
                className="size-7 rounded bg-muted hover:bg-muted/80 text-foreground grid place-items-center cursor-pointer font-bold"
              >
                -
              </button>
              <div className="size-14 rounded-xl bg-primary/10 border-2 border-primary/40 grid place-items-center text-2xl font-black text-primary shadow-inner">
                {String.fromCharCode(posRight + 65)}
              </div>
              <button
                type="button"
                onClick={() => setPosRight((prev) => (prev + 1) % 26)}
                className="size-7 rounded bg-muted hover:bg-muted/80 text-foreground grid place-items-center cursor-pointer font-bold"
              >
                +
              </button>
            </div>
            <div className="text-[10.5px] text-muted-foreground">
              Turnover Notch: <strong className="text-foreground">{ROTOR_WIRINGS[rightRotor]?.turnover}</strong> (Steps middle)
            </div>
          </div>
        </div>
      </div>

      {/* Lampboard & Keyboard Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Lampboard (Illuminates outputs) */}
        <div className="rounded-xl border border-border bg-black/60 p-5 space-y-3 text-center">
          <span className="text-[10.5px] uppercase font-bold text-amber-500 tracking-wider block">
            Lampboard (Glühlampenfeld)
          </span>

          <div className="space-y-2 py-2">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
                {row.map((letter) => {
                  const isLit = activeLamp === letter;
                  return (
                    <div
                      key={letter}
                      className={`size-9 sm:size-10 rounded-full font-bold grid place-items-center text-sm transition-all duration-200 border ${
                        isLit
                          ? "bg-amber-400 text-amber-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-110"
                          : "bg-muted/30 text-muted-foreground/60 border-border/40"
                      }`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="text-[11px] text-muted-foreground">
            Current Lit Bulb:{" "}
            <strong className="text-amber-400 font-bold text-sm">
              {activeLamp || "—"}
            </strong>
          </div>
        </div>

        {/* Keyboard (Key input buttons) */}
        <div className="rounded-xl border border-border bg-background/60 p-5 space-y-3 text-center">
          <span className="text-[10.5px] uppercase font-bold text-foreground tracking-wider block">
            Keyboard (Tastatur — Click or Type)
          </span>

          <div className="space-y-2 py-2">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
                {row.map((letter) => {
                  const isPressed = activeKey === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => pressKey(letter)}
                      className={`size-9 sm:size-10 rounded-full font-bold grid place-items-center text-sm transition cursor-pointer border ${
                        isPressed
                          ? "bg-primary text-primary-foreground border-primary scale-95"
                          : "bg-card hover:bg-muted text-foreground border-border hover:border-foreground/30 shadow-2xs"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 px-2">
            <span>Last Pressed: <strong className="text-primary">{activeKey || "—"}</strong></span>
            <span>Tape Length: <strong>{transcript.length} chars</strong></span>
          </div>
        </div>
      </div>

      {/* Steckerbrett (Plugboard) Config */}
      <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/70 pb-2">
          <span className="text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5">
            <Sliders className="size-3.5 text-primary" /> Steckerbrett (Plugboard Cross-Wiring)
          </span>
          <span className="text-muted-foreground text-[10.5px]">{plugs.length} / 10 Active Cables</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {plugs.map((pair, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary font-bold text-xs"
            >
              <span>{pair[0]} ↔ {pair[1]}</span>
              <button
                type="button"
                onClick={() => removePlug(idx)}
                className="hover:text-rose-500 transition cursor-pointer ml-1"
                title="Disconnect cable"
              >
                ×
              </button>
            </span>
          ))}

          {plugs.length < 10 && (
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="text"
                maxLength={1}
                value={newPlugA}
                onChange={(e) => setNewPlugA(e.target.value.toUpperCase())}
                className="w-8 text-center rounded bg-background border border-border p-1 text-xs uppercase"
              />
              <span>↔</span>
              <input
                type="text"
                maxLength={1}
                value={newPlugB}
                onChange={(e) => setNewPlugB(e.target.value.toUpperCase())}
                className="w-8 text-center rounded bg-background border border-border p-1 text-xs uppercase"
              />
              <button
                type="button"
                onClick={handleAddPlug}
                className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border cursor-pointer"
              >
                Plug Cable
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 10-Stage Signal Trace Breakdown */}
      {lastTrace.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <span className="text-[11px] uppercase font-bold text-foreground tracking-wider flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-500" /> Complete Electrical Signal Route for '{activeKey}' → '{activeLamp}'
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
            {lastTrace.map((step, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  idx === 4
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                    : idx === 9
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "bg-background/80 border-border"
                }`}
              >
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">{step.stage}</div>
                  <div className="font-bold text-foreground">
                    {step.inChar} <span className="text-primary font-normal">→</span> {step.outChar}
                  </div>
                </div>
                <span className="text-[9.5px] text-muted-foreground text-right">{step.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Cipher Tape Output */}
      {transcript.length > 0 && (
        <div className="rounded-xl border border-border bg-background/50 p-3 space-y-1.5">
          <div className="flex justify-between text-[10.5px] text-muted-foreground">
            <span>Historical Teleprinter Tape (Plain / Cipher Stream):</span>
            <button
              type="button"
              onClick={() => setTranscript([])}
              className="hover:text-rose-500 cursor-pointer"
            >
              Clear Tape
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground font-bold">
              IN:  {transcript.map((t) => t.input).join("")}
            </div>
            <div className="text-primary font-bold text-sm">
              OUT: {transcript.map((t) => t.output).join("")}
            </div>
          </div>
        </div>
      )}

      {/* Historical Note */}
      <div className="rounded-xl bg-card p-3 border border-border text-[11px] text-muted-foreground space-y-1">
        <strong className="text-foreground">Reciprocal Symmetry:</strong> Enigma is an involution. If you reset the rotors to the original starting positions and enter the ciphertext, the exact plaintext is produced. Because of the reflector, <em>a letter can never encrypt to itself</em> ($E(x) \neq x$).
      </div>
    </div>
  );
}
