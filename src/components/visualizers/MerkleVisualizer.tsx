import React, { useState, useMemo } from "react";
import {
  buildMerkleTree,
  generateSPVProof,
  verifySPVProof,
  sha256Sync,
  type MerkleTreeState,
  type MerkleProofStep,
} from "@/lib/crypto/merkle";
import { Zap, X, CheckCircle2, XCircle, Plus } from "lucide-react";

type Props = {
  values?: Record<string, string>;
  resultOutput?: string;
};

const DEFAULT_TRANSACTIONS = [
  "Tx 0: Alice → Bob (5.00 BTC)",
  "Tx 1: Bob → Carol (2.50 BTC)",
  "Tx 2: Dave → Eve (1.10 BTC)",
  "Tx 3: Satoshi → Hal (50.00 BTC)",
];

export function MerkleVisualizer({ values }: Props) {
  // Configurable transactions
  const [transactions, setTransactions] = useState<string[]>(() => {
    const raw = values?.["transactions"];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch {
        const lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);
        if (lines.length >= 2) return lines;
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  const [selectedLeafIndex, setSelectedLeafIndex] = useState<number>(0);
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);
  const [tamperedText, setTamperedText] = useState<string>("Tx 0: Alice → MALORY (999.00 BTC)");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  // Authentic Merkle Tree
  const authenticTree: MerkleTreeState = useMemo(() => {
    return buildMerkleTree(transactions);
  }, [transactions]);

  // Tampered/Current Transactions
  const activeTransactions = useMemo(() => {
    return transactions.map((tx, idx) => {
      if (idx === tamperedIndex) return tamperedText;
      return tx;
    });
  }, [transactions, tamperedIndex, tamperedText]);

  // Active Merkle Tree
  const activeTree: MerkleTreeState = useMemo(() => {
    return buildMerkleTree(activeTransactions);
  }, [activeTransactions]);

  // SPV Proof for selected leaf in authentic tree
  const spvProof: MerkleProofStep[] = useMemo(() => {
    const safeIdx = Math.min(selectedLeafIndex, transactions.length - 1);
    return generateSPVProof(authenticTree, safeIdx);
  }, [authenticTree, selectedLeafIndex, transactions.length]);

  // Verification of SPV proof against selected leaf's current data
  const spvVerification = useMemo(() => {
    const leafData = activeTransactions[selectedLeafIndex] ?? "";
    return verifySPVProof(leafData, spvProof, authenticTree.root);
  }, [activeTransactions, selectedLeafIndex, spvProof, authenticTree.root]);

  // Audit path node identifiers for styling
  const auditPathHashes = useMemo(() => {
    const set = new Set<string>();
    spvProof.forEach((p) => set.add(p.hash));
    return set;
  }, [spvProof]);

  // Identify nodes affected by tamper cascade
  const tamperedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (tamperedIndex === null) return ids;

    let currIdx = tamperedIndex;
    for (let l = 0; l < activeTree.levels.length; l++) {
      const node = activeTree.levels[l]?.[currIdx];
      if (node) ids.add(node.id);
      currIdx = Math.floor(currIdx / 2);
    }
    return ids;
  }, [tamperedIndex, activeTree]);

  const handleEditSave = (index: number) => {
    if (!editText.trim()) return;
    const next = [...transactions];
    next[index] = editText.trim();
    setTransactions(next);
    setEditingIndex(null);
  };

  const addTransaction = () => {
    if (transactions.length >= 8) return;
    const next = [...transactions, `Tx ${transactions.length}: Node → Miner (0.05 BTC)`];
    setTransactions(next);
  };

  const removeTransaction = (idx: number) => {
    if (transactions.length <= 2) return;
    const next = transactions.filter((_, i) => i !== idx);
    setTransactions(next);
    if (selectedLeafIndex >= next.length) {
      setSelectedLeafIndex(0);
    }
    if (tamperedIndex === idx) {
      setTamperedIndex(null);
    }
  };

  const formatHashShort = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-6)}`;

  return (
    <div className="rounded-[18px] bg-card p-5 ring-1 ring-border shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Ralph Merkle (1979) Cryptographic Hash Tree
            </span>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              O(log₂ N) SPV Proofs
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground mt-0.5">
            Merkle Tree & Blockchain SPV Audit Path Explorer
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5 max-w-xl">
            Verify transaction inclusion inside a block header with logarithmic complexity. Test tamper resilience and watch hash cascades propagate instantly to the root.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tamperedIndex !== null ? (
            <button
              type="button"
              onClick={() => setTamperedIndex(null)}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 px-3 py-1.5 font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30 transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Clear Tamper</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTamperedIndex(0);
                setTamperedText("Tx 0: Alice → ATTACKER (1,000,000 BTC)");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/30 transition-colors cursor-pointer"
            >
              <Zap className="size-3.5" />
              <span>Tamper Tx 0 (Simulate Attack)</span>
            </button>
          )}

          <button
            type="button"
            onClick={addTransaction}
            disabled={transactions.length >= 8}
            className="flex items-center gap-1 rounded-lg bg-secondary hover:bg-secondary/80 px-3 py-1.5 font-mono text-[11px] font-semibold text-foreground ring-1 ring-border transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Add Tx</span>
          </button>
        </div>
      </div>

      {/* Block Header Banner */}
      <div className="rounded-xl bg-background/60 p-3.5 ring-1 ring-border/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-mono text-primary font-bold text-xs ring-1 ring-primary/20">
            BLK
          </div>
          <div>
            <div className="text-[10.5px] font-mono text-muted-foreground uppercase tracking-wider">
              Simulated Block #840,000 Header
            </div>
            <div className="text-xs font-mono font-bold text-foreground">
              Leaves: {transactions.length} Transactions | Tree Height: {activeTree.levels.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Block Header Merkle Root</div>
            <div className="font-mono text-xs font-bold text-emerald-500">
              {formatHashShort(authenticTree.root)}
            </div>
          </div>
          {tamperedIndex !== null && (
            <div className="text-right pl-3 border-l border-border/60">
              <div className="text-[10px] font-mono uppercase text-rose-500 font-bold">Tampered Root</div>
              <div className="font-mono text-xs font-bold text-rose-500">
                {formatHashShort(activeTree.root)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Visual Merkle Tree Diagram */}
      <div className="rounded-xl bg-neutral-950 p-4 ring-1 ring-border/80 overflow-x-auto">
        <div className="min-w-[650px] flex flex-col-reverse gap-6 items-center py-2">
          {activeTree.levels.map((level, levelIdx) => {
            const isRootLevel = levelIdx === activeTree.levels.length - 1;
            const isLeafLevel = levelIdx === 0;

            return (
              <div key={levelIdx} className="w-full flex flex-col items-center">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
                  {isRootLevel
                    ? "Level " + levelIdx + " — Merkle Root"
                    : isLeafLevel
                    ? "Level 0 — Transaction Hashes H(Tx)"
                    : `Level ${levelIdx} — Intermediate Branches`}
                </div>

                <div className="w-full flex justify-around items-center gap-2">
                  {level.map((node) => {
                    const isTamperedNode = tamperedNodeIds.has(node.id);
                    const isAuditSibling = auditPathHashes.has(node.hash);
                    const isSelectedLeaf = isLeafLevel && node.index === selectedLeafIndex;

                    return (
                      <div
                        key={node.id}
                        className={`flex-1 max-w-[180px] p-2 rounded-xl ring-1 transition-all text-center ${
                          isTamperedNode
                            ? "bg-rose-950/40 ring-rose-500/80 shadow-md shadow-rose-950/50"
                            : isSelectedLeaf
                            ? "bg-sky-950/50 ring-sky-400 shadow-md shadow-sky-950/50"
                            : isAuditSibling
                            ? "bg-emerald-950/40 ring-emerald-400 shadow-md shadow-emerald-950/50"
                            : "bg-neutral-900 ring-neutral-800"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                          <span className={isTamperedNode ? "text-rose-400 font-bold" : "text-neutral-400"}>
                            {isRootLevel ? "ROOT" : node.label}
                          </span>
                          {isAuditSibling && (
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">
                              SPV PROOF
                            </span>
                          )}
                          {isSelectedLeaf && (
                            <span className="text-[8px] bg-sky-500/20 text-sky-400 px-1 rounded font-bold">
                              VERIFIED TX
                            </span>
                          )}
                        </div>

                        <div className={`font-mono text-[11px] font-bold tracking-tight ${
                          isTamperedNode
                            ? "text-rose-400 line-through"
                            : isSelectedLeaf
                            ? "text-sky-400"
                            : isAuditSibling
                            ? "text-emerald-400"
                            : "text-neutral-200"
                        }`}>
                          {formatHashShort(node.hash)}
                        </div>

                        {isLeafLevel && (
                          <div className="mt-1 text-[9.5px] font-mono truncate text-neutral-400">
                            {node.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Manager & SPV Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transactions List */}
        <div className="rounded-xl bg-background/50 p-4 ring-1 ring-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Block Transactions ({transactions.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Click to select SPV Target
            </span>
          </div>

          <div className="space-y-2">
            {activeTransactions.map((tx, idx) => {
              const isSelected = idx === selectedLeafIndex;
              const isTampered = idx === tamperedIndex;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedLeafIndex(idx)}
                  className={`p-2.5 rounded-lg ring-1 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isTampered
                      ? "bg-rose-500/10 ring-rose-500/40"
                      : isSelected
                      ? "bg-sky-500/10 ring-sky-500/40"
                      : "bg-card ring-border hover:ring-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="radio"
                      name="spvLeaf"
                      checked={isSelected}
                      onChange={() => setSelectedLeafIndex(idx)}
                      className="accent-sky-400 cursor-pointer"
                    />
                    {editingIndex === idx ? (
                      <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 rounded bg-background px-2 py-0.5 text-xs font-mono ring-1 ring-border text-foreground"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleEditSave(idx)}
                          className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-mono truncate ${isTampered ? "text-rose-500 font-bold" : "text-foreground"}`}>
                        {tx}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {editingIndex !== idx && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(idx);
                          setEditText(transactions[idx] ?? "");
                        }}
                        className="text-[10.5px] font-mono text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-secondary"
                      >
                        Edit
                      </button>
                    )}
                    {transactions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeTransaction(idx)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-500 transition"
                        title="Remove transaction"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SPV Proof Calculation Breakdown */}
        <div className={`rounded-xl p-4 ring-1 flex flex-col justify-between ${
          spvVerification.isValid
            ? "bg-emerald-500/10 ring-emerald-500/30"
            : "bg-rose-500/10 ring-rose-500/30"
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 text-xs font-mono font-bold uppercase ${
                  spvVerification.isValid ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                }`}>
                  {spvVerification.isValid ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span>SPV Inclusion Proof Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-rose-500" />
                      <span>SPV Verification Failed</span>
                    </>
                  )}
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-muted-foreground">
                Proof Size: {spvProof.length} Hashes ({spvProof.length * 32} bytes)
              </span>
            </div>

            <p className="text-[12px] text-muted-foreground mb-3">
              A light client verifying <strong className="text-foreground">Tx {selectedLeafIndex}</strong> only requires <strong className="text-foreground">{spvProof.length} sibling hashes</strong> instead of downloading all {transactions.length} transactions:
            </p>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="bg-background/80 p-2 rounded-lg ring-1 ring-border">
                <span className="text-muted-foreground text-[10px] uppercase block">Target Leaf Hash:</span>
                <span className="font-bold text-foreground">
                  H(Tx_{selectedLeafIndex}) = {formatHashShort(sha256Sync(activeTransactions[selectedLeafIndex] ?? ""))}
                </span>
              </div>

              {spvProof.map((step, idx) => (
                <div key={idx} className="bg-background/80 p-2 rounded-lg ring-1 ring-border flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase block">{step.label}:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatHashShort(step.hash)}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Step {idx + 1}: {step.isRightSibling ? "Concat Right →" : "← Concat Left"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between font-mono text-[11px]">
            <span className="text-muted-foreground">Computed Root vs Header Root:</span>
            <span className={`font-bold ${spvVerification.isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {spvVerification.isValid ? "MATCH (Integrity Intact)" : "MISMATCH (Block Rejected)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
