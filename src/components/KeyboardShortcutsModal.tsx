import { useEffect } from "react";
import { Keyboard, X, Sparkles, Navigation, BookOpen, Wrench, ShieldAlert } from "lucide-react";

export function KeyboardShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const SHORTCUT_GROUPS = [
    {
      category: "Global Navigation",
      icon: Navigation,
      items: [
        { keys: ["⌘", "K"], altKeys: ["Ctrl", "K"], desc: "Open Cryptographic Assistant & Math Solver" },
        { keys: ["Alt", "T"], desc: "Jump to Converters & Number Theory Solvers" },
        { keys: ["Alt", "A"], desc: "Jump to Adversarial Attack Simulators Lab" },
        { keys: ["Alt", "M"], desc: "Jump to Algorithm Matrix & Standards" },
        { keys: ["Alt", "C"], desc: "Jump to Cryptographic CTF Challenges" },
      ],
    },
    {
      category: "Curriculum Study",
      icon: BookOpen,
      items: [
        { keys: ["["], desc: "Navigate to Previous Lesson in Track" },
        { keys: ["]"], desc: "Navigate to Next Lesson in Track" },
      ],
    },
    {
      category: "Productivity & Pipeline",
      icon: Wrench,
      items: [
        { keys: ["Alt", "S"], desc: "Toggle Universal Cryptographic Scratchpad" },
        { keys: ["?"], desc: "Toggle this Keyboard Shortcuts Guide" },
        { keys: ["Esc"], desc: "Dismiss active modal or search dialog" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card p-5 sm:p-6 border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Keyboard className="size-4" />
            </div>
            <div>
              <h3 className="font-sans text-[16px] font-bold text-foreground leading-tight">
                Keyboard Shortcuts & Navigation
              </h3>
              <p className="text-[11.5px] text-muted-foreground">
                Power-user hotkeys for swift cryptographic analysis and study
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <group.icon className="size-3 text-primary" />
                <span>{group.category}</span>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 divide-y divide-border/60">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 text-[12px]">
                    <span className="text-foreground/90 font-medium">{item.desc}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="min-w-[20px] text-center px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10.5px] font-bold text-foreground shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-[11.5px] text-muted-foreground">
          <span>Press <kbd className="font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border border-border">?</kbd> anywhere to open this sheet</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-primary hover:underline text-[12px]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
