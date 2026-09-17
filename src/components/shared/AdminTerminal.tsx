"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSquare, X } from "lucide-react";

/**
 * The root terminal, docked as a drawer rather than a full-screen takeover.
 *
 * A drawer keeps the page visible behind it, which is the point: commands read
 * as operating the HUD you are looking at. `TerminalHint` is the always-present
 * affordance bottom-right — without it nobody discovers the terminal at all.
 */

interface AdminTerminalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const BANNER = [
  "[SYS.INIT] Secure terminal access granted.",
  "Type 'help' for available commands.",
];

export default function AdminTerminal({
  isOpen,
  onOpen,
  onClose,
}: AdminTerminalProps) {
  const [history, setHistory] = useState<string[]>(BANNER);
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const focus = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(focus);
  }, [isOpen]);

  // Keep the newest line in view as the log grows.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [history]);

  // Backtick opens the drawer from anywhere; Escape closes it. Both are
  // ignored while the caret is in another field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typingElsewhere =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);

      if (e.key === "Escape" && isOpen) {
        onClose();
        return;
      }

      if (e.key === "`" && !isOpen && !typingElsewhere) {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onOpen, onClose]);

  const handleCommand = (e: FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const cmd = currentInput.trim().toLowerCase();
    let response = "";

    switch (cmd) {
      case "help":
        response =
          "Commands: status, whoami, uptime, trace, clear, exit, sudo rm -rf /";
        break;
      case "status":
        response = "All systems operational. Architecture: Abubakr Alsheikh.";
        break;
      case "whoami":
        response = "root // Guest user identified. Access level: read only.";
        break;
      case "uptime":
        response = `Session up ${Math.floor(performance.now() / 1000)}s. Canopy nominal.`;
        break;
      case "trace":
        response =
          "trace.field: 13 rails welded, 1 packet in flight, 0 seams open.";
        break;
      case "clear":
        setHistory([]);
        setCurrentInput("");
        return;
      case "exit":
        onClose();
        setCurrentInput("");
        return;
      case "sudo rm -rf /":
        response = "Permission denied. Nice try, script kiddie.";
        break;
      default:
        response = `Command not found: ${cmd}`;
    }

    setHistory((prev) => [...prev, `> ${currentInput}`, response]);
    setCurrentInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 260, mass: 0.7 }}
          className="fixed inset-x-0 bottom-0 z-[100] h-[45vh] min-h-[280px] bg-[#020617] border-t border-[#3B82F6]/30 font-mono text-[#3B82F6] flex flex-col shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.9)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-0" />

          <div className="relative z-10 flex justify-between items-center border-b border-[#3B82F6]/20 px-4 md:px-8 py-3">
            <h2 className="text-xs md:text-sm font-bold tracking-widest flex items-center gap-3">
              <TerminalSquare className="w-4 h-4 text-[#F97316]" />
              ROOT_TERMINAL // OVERRIDE
            </h2>
            <button
              onClick={onClose}
              className="text-[#3B82F6]/50 hover:text-[#F97316] transition-colors p-2 flex items-center gap-2 text-[10px] tracking-widest"
            >
              [ESC] <X className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={logRef}
            className="relative z-10 flex-1 overflow-y-auto flex flex-col gap-1.5 scrollbar-hide text-[11px] md:text-xs px-4 md:px-8 py-4"
          >
            {history.map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith(">")
                    ? "text-slate-300 mt-2"
                    : "text-[#3B82F6]/80 pl-4"
                }
              >
                {line}
              </div>
            ))}

            <form
              onSubmit={handleCommand}
              className="flex items-center gap-2 mt-3 text-slate-300"
            >
              <span className="text-[#F97316] shrink-0">root@arch:~#</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-1 bg-transparent outline-none border-none text-[#3B82F6] caret-[#F97316] w-full"
                autoComplete="off"
                spellCheck="false"
                aria-label="Terminal command input"
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The docked prompt. Bottom-right, inset past the canopy's right ladder and
 * clear of the build stream (bottom-left) and the G-load strip (bottom-centre).
 */
export function TerminalHint({
  isOpen,
  onOpen,
}: {
  isOpen: boolean;
  onOpen: () => void;
}) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          onClick={onOpen}
          className="fixed bottom-10 right-28 z-[60] hidden lg:flex items-center gap-2 border border-slate-800 bg-[#020617]/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 transition-colors hover:border-[#3B82F6]/50 hover:text-[#3B82F6]"
        >
          <span className="h-1 w-1 bg-[#F97316]" />
          root@arch:~#
          <span className="text-slate-700">press `</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
