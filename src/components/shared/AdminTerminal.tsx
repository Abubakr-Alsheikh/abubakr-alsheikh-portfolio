// src/components/shared/AdminTerminal.tsx
"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function AdminTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputCode, setInputCode] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(["[SYS.ADMIN] Terminal initialized. Type 'help' for commands."]);
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      setInputCode((prev) => {
        const newCode = [...prev, key].slice(-10);
        if (newCode.join(",") === KONAMI_CODE.join(",")) {
          setIsOpen(true);
          return [];
        }
        return newCode;
      });
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCommand = (e: FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const cmd = currentInput.trim().toLowerCase();
    let response = "";

    switch (cmd) {
      case "help":
        response = "Available commands: help, status, whoami, clear, exit, sudo rm -rf /";
        break;
      case "status":
        response = "All systems operational. Django Backend: ACTIVE. Next.js Frontend: ACTIVE.";
        break;
      case "whoami":
        response = "root // Guest User identified. Access Level: View Only.";
        break;
      case "clear":
        setHistory([]);
        setCurrentInput("");
        return;
      case "exit":
        setIsOpen(false);
        setCurrentInput("");
        return;
      case "sudo rm -rf /":
        response = "Permission denied. Nice try, hacker.";
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
          initial={{ opacity: 0, y: "-100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#020617]/95 backdrop-blur-xl border-b-2 border-orange-500 font-mono text-emerald-400 p-6 md:p-12 overflow-hidden flex flex-col"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-50" />
          
          <div className="flex justify-between items-center border-b border-emerald-500/30 pb-4 mb-4">
            <h2 className="text-xl font-bold tracking-widest text-emerald-500">ROOT_TERMINAL // OVERRIDE</h2>
            <button onClick={() => setIsOpen(false)} className="text-emerald-500/50 hover:text-emerald-400 text-sm tracking-widest">[CLOSE_ESC]</button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-hide">
            {history.map((line, i) => (
              <div key={i} className={line.startsWith(">") ? "text-emerald-200 mt-2" : "text-emerald-500/80 pl-4"}>
                {line}
              </div>
            ))}
            
            <form onSubmit={handleCommand} className="flex items-center gap-2 mt-4 text-emerald-200">
              <span>root@arch:~#</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-1 bg-transparent outline-none border-none text-emerald-400 caret-orange-500"
                autoComplete="off"
                spellCheck="false"
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
