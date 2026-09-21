"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSquare, X } from "lucide-react";
import { contactData } from "@/lib/data";
import { streamChat } from "@/lib/chat/client";
import {
  MAX_INPUT_CHARS,
  type ChatAction,
  type ChatEvent,
  type SectionId,
  type WireMessage,
} from "@/lib/chat/protocol";

/**
 * The root terminal, docked as a drawer rather than a full-screen takeover.
 *
 * A drawer keeps the page visible behind it, which is the point: commands read
 * as operating the HUD you are looking at. It opens from the terminal button on
 * the nav bar, or from anywhere with the backtick key.
 *
 * Known commands answer locally. Anything else goes to ARCH, the agent behind
 * `/api/chat`, which reads the portfolio through its tools. Each tool it calls
 * prints as a log line, and page actions it takes (scrolling, drafting a
 * contact message) run here, because only the browser can touch the page.
 */

interface AdminTerminalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Scrolls the page through the nav's Lenis-aware handler. */
  onNavigate: (section: SectionId) => void;
}

type LineKind = "input" | "system" | "agent" | "trace" | "error";

interface Line {
  kind: LineKind;
  text: string;
}

const BANNER: Line[] = [
  { kind: "system", text: "[SYS.INIT] Secure terminal access granted." },
  {
    kind: "system",
    text: "ARCH online. Ask anything about Abubakr's work, or type 'help'.",
  },
];

const LINE_STYLE: Record<LineKind, string> = {
  input: "text-slate-300 mt-2",
  system: "text-[#3B82F6]/80 pl-4",
  agent: "text-slate-200 pl-4 whitespace-pre-wrap",
  trace: "text-[#3B82F6]/70 pl-4 text-[10px] md:text-[11px]",
  error: "text-[#F97316] pl-4",
};

/** Commands answered in the browser, without a model call. */
function localCommand(cmd: string): string | null {
  switch (cmd) {
    case "help":
      return "Commands: status, whoami, uptime, trace, contact, clear, exit. Anything else is a question for ARCH.";
    case "status":
      return "All systems operational. Architecture: Abubakr Alsheikh.";
    case "whoami":
      return "root // Guest user identified. Access level: read only.";
    case "uptime":
      return `Session up ${Math.floor(performance.now() / 1000)}s. Canopy nominal.`;
    case "trace":
      return "trace.field: 13 rails welded, 1 packet in flight, 0 seams open.";
    case "contact":
      return `${contactData.email} // or the form at the bottom of this page.`;
    case "sudo rm -rf /":
      return "Permission denied. Nice try, script kiddie.";
    default:
      return null;
  }
}

/** Writes the agent's draft into the contact form's message field. */
function prefillContact(message: string) {
  const field = document.getElementById("contact-message");
  if (field instanceof HTMLTextAreaElement) field.value = message;
}

export default function AdminTerminal({
  isOpen,
  onOpen,
  onClose,
  onNavigate,
}: AdminTerminalProps) {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [currentInput, setCurrentInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  /** The conversation as the API sees it. Only ever appended to. */
  const conversation = useRef<WireMessage[]>([]);
  const inflight = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const focus = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(focus);
  }, [isOpen]);

  // Keep the newest line in view as the log grows.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => () => inflight.current?.abort(), []);

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

  const push = (...added: Line[]) => setLines((prev) => [...prev, ...added]);

  const runAction = (action: ChatAction) => {
    if (action.name === "navigate") {
      onNavigate(action.section);
    } else {
      prefillContact(action.message);
      onNavigate("contact");
    }
  };

  const ask = async (question: string) => {
    const pending: WireMessage[] = [
      ...conversation.current,
      { role: "user", content: question },
    ];
    const controller = new AbortController();
    inflight.current = controller;
    setBusy(true);

    const onEvent = (event: ChatEvent) => {
      // After `clear`, a late event must not write into the fresh log.
      if (controller.signal.aborted) return;
      switch (event.type) {
        case "trace":
          push({ kind: "trace", text: `[agent] ${event.text}` });
          break;
        case "action":
          runAction(event.action);
          break;
        case "text":
          // Deltas extend the answer line; the first one after a trace opens it.
          setLines((prev) => {
            const last = prev.at(-1);
            if (last?.kind !== "agent") {
              return [...prev, { kind: "agent", text: event.delta }];
            }
            return [
              ...prev.slice(0, -1),
              { kind: "agent", text: last.text + event.delta },
            ];
          });
          break;
        case "done":
          // Committed only on success, so a failed turn never leaves a
          // question without an answer in the history.
          conversation.current = [...pending, ...event.messages];
          break;
        case "error":
          push({ kind: "error", text: `[ERR] ${event.message}` });
          break;
      }
    };

    try {
      await streamChat(pending, onEvent, controller.signal);
    } catch {
      if (!controller.signal.aborted) {
        push({
          kind: "error",
          text: `[ERR] Uplink failed. Reach Abubakr at ${contactData.email}.`,
        });
      }
    } finally {
      if (inflight.current === controller) inflight.current = null;
      setBusy(false);
    }
  };

  const handleCommand = (e: FormEvent) => {
    e.preventDefault();
    const input = currentInput.trim();
    if (!input) return;
    const cmd = input.toLowerCase();

    // clear and exit work mid-answer; everything else waits for it.
    if (cmd === "clear") {
      inflight.current?.abort();
      conversation.current = [];
      setLines([]);
      setCurrentInput("");
      return;
    }
    if (cmd === "exit") {
      setCurrentInput("");
      onClose();
      return;
    }
    if (busy) return;
    setCurrentInput("");

    push({ kind: "input", text: `> ${input}` });
    const local = localCommand(cmd);
    if (local !== null) {
      push({ kind: "system", text: local });
      return;
    }
    void ask(input);
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
              ROOT_TERMINAL // ARCH
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
            aria-live="polite"
            className="relative z-10 flex-1 overflow-y-auto flex flex-col gap-1.5 scrollbar-hide text-[11px] md:text-xs px-4 md:px-8 py-4"
          >
            {lines.map((line, i) => (
              <div key={i} className={LINE_STYLE[line.kind]}>
                {line.text}
              </div>
            ))}

            {busy && lines.at(-1)?.kind !== "agent" ? (
              <div className="pl-4 text-[#3B82F6]/70 animate-pulse">
                [agent] linking...
              </div>
            ) : null}

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
                maxLength={MAX_INPUT_CHARS}
                placeholder={busy ? "" : "ask about projects, skills, hiring..."}
                className="flex-1 bg-transparent outline-none border-none text-[#3B82F6] caret-[#F97316] w-full placeholder:text-slate-400"
                autoComplete="off"
                spellCheck="false"
                aria-label="Terminal command or question"
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
