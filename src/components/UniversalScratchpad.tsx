import { useEffect, useState } from "react";
import {
  Clipboard,
  Copy,
  Check,
  Trash2,
  Send,
  Plus,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X,
  FileText,
  KeyRound,
  Hash,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { inspectFormat } from "@/lib/detector";

export interface ScratchpadItem {
  id: string;
  label: string;
  value: string;
  timestamp: number;
  type?: "hex" | "base64" | "hash" | "text" | "key";
}

const STORAGE_KEY = "specimen_scratchpad_items";
const VISIBILITY_KEY = "specimen_scratchpad_visible";

// Global dispatcher helper so any component can add to scratchpad
export function addScratchpadItem(label: string, value: string, type?: ScratchpadItem["type"]) {
  const event = new CustomEvent("specimen:add_scratchpad", {
    detail: { label, value, type },
  });
  window.dispatchEvent(event);
}

export function UniversalScratchpad() {
  const [items, setItems] = useState<ScratchpadItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendMenuId, setSendMenuId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        // Initial default specimen starter items
        const initial: ScratchpadItem[] = [
          {
            id: "specimen-init-1",
            label: "Specimen Plaintext",
            value: "Attack at dawn; use AES-GCM with unique nonce.",
            timestamp: Date.now() - 3600000,
            type: "text",
          },
          {
            id: "specimen-init-2",
            label: "Test 256-bit Key (Hex)",
            value: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            timestamp: Date.now() - 1800000,
            type: "key",
          },
        ];
        setItems(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Save to localStorage when items change
  const saveItems = (newItems: ScratchpadItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // Ignore storage error
    }
  };

  // Listen for global custom events
  useEffect(() => {
    const handleGlobalAdd = (e: Event) => {
      const customEvent = e as CustomEvent<{ label: string; value: string; type?: ScratchpadItem["type"] }>;
      if (!customEvent.detail) return;
      const { label, value, type } = customEvent.detail;
      const detected = inspectFormat(value);
      const inferredType = type || (detected.detectedType === "hash" ? "hash" : detected.detectedType === "hex" ? "hex" : detected.detectedType === "base64" ? "base64" : "text");
      const newItem: ScratchpadItem = {
        id: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        label: label || "Extracted Snippet",
        value,
        timestamp: Date.now(),
        type: inferredType,
      };
      saveItems([newItem, ...items]);
      setIsMinimized(false);
      setIsOpen(true);
    };

    window.addEventListener("specimen:add_scratchpad", handleGlobalAdd);
    return () => window.removeEventListener("specimen:add_scratchpad", handleGlobalAdd);
  }, [items]);

  // Global hotkey Alt+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setIsMinimized((prev) => !prev);
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Clear all items from your persistent cryptographic scratchpad?")) {
      saveItems([]);
    }
  };

  const handleAddItem = () => {
    if (!newValue.trim()) return;
    const detected = inspectFormat(newValue.trim());
    const newItem: ScratchpadItem = {
      id: "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      label: newLabel.trim() || `Snippet (${detected.typeLabel})`,
      value: newValue.trim(),
      timestamp: Date.now(),
      type: detected.detectedType === "hash" ? "hash" : detected.detectedType === "hex" ? "hex" : detected.detectedType === "base64" ? "base64" : "text",
    };
    saveItems([newItem, ...items]);
    setNewLabel("");
    setNewValue("");
    setShowAddForm(false);
  };

  const handleSendToTool = (toolId: string, val: string) => {
    setSendMenuId(null);
    navigate({
      to: "/tools/$toolId",
      params: { toolId },
      search: () => ({ input: val }),
    });
  };

  return (
    <aside aria-label="Cryptographic Scratchpad" className="fixed bottom-16 right-3 sm:bottom-4 sm:right-4 z-40">
      {/* Minimized Dock Trigger Pill */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-card border border-border/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[12px] font-medium text-foreground shadow-lg hover:border-primary/50 hover:bg-muted/50 transition active:scale-95 group"
          title="Toggle Scratchpad (Alt+S)"
        >
          <Clipboard className="size-4 text-primary shrink-0 transition group-hover:scale-110" />
          <span className="font-semibold">Scratchpad</span>
          <span className="font-mono text-[10.5px] rounded-full bg-primary/10 text-primary px-2 py-0.2 font-semibold">
            {items.length}
          </span>
          <kbd className="hidden sm:inline-block font-mono text-[9.5px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            Alt+S
          </kbd>
        </button>
      ) : (
        /* Expanded Floating Workbench Drawer */
        <div className="w-[calc(100vw-24px)] max-w-[340px] sm:w-[400px] max-h-[70vh] sm:max-h-[520px] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Clipboard className="size-3.5" />
              </div>
              <div>
                <span className="text-[13px] font-bold text-foreground block leading-tight">
                  Cryptographic Scratchpad
                </span>
                <span className="text-[10.5px] text-muted-foreground">
                  Persistent pipeline & clipboard ({items.length} items)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="grid size-7 place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                title="Add custom item"
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="grid size-7 place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                title="Minimize (Alt+S)"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>

          {/* Quick Add Snippet Form */}
          {showAddForm && (
            <div className="p-3 bg-muted/20 border-b border-border space-y-2 text-[12px]">
              <input
                type="text"
                placeholder="Item label (e.g. Alice Public Key)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full rounded-lg bg-background px-2.5 py-1.5 border border-border text-foreground outline-none text-[12px]"
              />
              <textarea
                placeholder="Paste key, hex string, ciphertext, or message..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-background p-2 border border-border text-foreground font-mono text-[11px] outline-none resize-none"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-muted-foreground hover:text-foreground text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-[11px] shadow-2xs hover:bg-primary/90 transition"
                >
                  Save to Scratchpad
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[360px] text-[12px]">
            {items.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground space-y-1">
                <Clipboard className="size-6 mx-auto text-muted-foreground/50 mb-1.5" />
                <p className="font-semibold text-foreground text-[12.5px]">Your scratchpad is empty</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  Save outputs from any converter or attack lab, or click + to add keys and test data.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/80 bg-background/80 p-2.5 space-y-1.5 hover:border-primary/40 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-[12px] truncate pr-2">
                      {item.label}
                    </span>
                    <span className="font-mono text-[9.5px] uppercase font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0 border border-border">
                      {item.type || "text"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2 font-mono text-[11px] text-foreground/90 break-all select-all border border-border/50 max-h-20 overflow-y-auto">
                    {item.value}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>

                    <div className="flex items-center gap-1">
                      {/* Send to Tool Pipeline Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setSendMenuId(sendMenuId === item.id ? null : item.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-muted text-primary font-semibold text-[10.5px] transition"
                          title="Pipe into another tool"
                        >
                          <Send className="size-3" />
                          <span>Pipe</span>
                        </button>

                        {/* Pipeline Destination Popover */}
                        {sendMenuId === item.id && (
                          <div className="absolute right-0 bottom-6 z-50 w-44 rounded-xl bg-card border border-border p-1.5 shadow-xl space-y-1 text-[11px] animate-in fade-in zoom-in-95">
                            <span className="px-2 py-1 text-[10px] uppercase font-semibold text-muted-foreground block">
                              Send output to:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSendToTool("format-inspector", item.value)}
                              className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted text-left text-foreground"
                            >
                              <span>Format Inspector</span>
                              <Sparkles className="size-3 text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendToTool("sha256", item.value)}
                              className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted text-left text-foreground"
                            >
                              <span>SHA-256 Hash</span>
                              <Hash className="size-3 text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendToTool("base64", item.value)}
                              className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted text-left text-foreground"
                            >
                              <span>Base64 Converter</span>
                              <FileText className="size-3 text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendToTool("hex", item.value)}
                              className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted text-left text-foreground"
                            >
                              <span>Hex Converter</span>
                              <KeyRound className="size-3 text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendToTool("aes-state", item.value)}
                              className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted text-left text-foreground"
                            >
                              <span>AES State Engine</span>
                              <ShieldCheck className="size-3 text-primary" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Copy Action */}
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.value)}
                        className="grid size-6 place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Copy to clipboard"
                      >
                        {copiedId === item.id ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="grid size-6 place-items-center rounded-md hover:bg-rose-50 hover:text-rose-600 text-muted-foreground transition"
                        title="Delete item"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Saved in local storage</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="hover:text-rose-600 transition underline text-[10.5px]"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
