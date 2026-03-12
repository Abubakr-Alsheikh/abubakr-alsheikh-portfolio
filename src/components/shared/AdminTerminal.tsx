"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSquare, X } from "lucide-react";

interface AdminTerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminTerminal({ isOpen, onClose }: AdminTerminalProps) {
  const [history, setHistory] = useState<string[]>([
    "[SYS.INIT] Secure Terminal Access Granted.",
    "Type 'help' for available commands."
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
        response = "Commands: status, whoami, clear, exit, sudo rm -rf /";
        break;
      case "status":
        response = "All systems operational. Architecture: Abubakr Alsheikh.";
        break;
      case "whoami":
        response = "root // Guest User identified. Access Level: Read Only.";
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
          initial={{ opacity: 0, y: "-10%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-10%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl border-b border-[#3B82F6]/30 font-mono text-[#3B82F6] p-4 md:p-8 flex flex-col"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-0" />
          
          <div className="relative z-10 flex justify-between items-center border-b border-[#3B82F6]/20 pb-4 mb-4">
            <h2 className="text-sm md:text-lg font-bold tracking-widest flex items-center gap-3">
              <TerminalSquare className="w-5 h-5 text-[#F97316]" />
              ROOT_TERMINAL // OVERRIDE
            </h2>
            <button 
              onClick={onClose} 
              className="text-[#3B82F6]/50 hover:text-[#F97316] transition-colors p-2 flex items-center gap-2 text-xs tracking-widest"
            >
              [ESC] <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-hide text-xs md:text-sm">
            {history.map((line, i) => (
              <div key={i} className={line.startsWith(">") ? "text-slate-300 mt-2" : "text-[#3B82F6]/80 pl-4"}>
                {line}
              </div>
            ))}
            
            <form onSubmit={handleCommand} className="flex items-center gap-2 mt-4 text-slate-300">
              <span className="text-[#F97316]">root@arch:~#</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-1 bg-transparent outline-none border-none text-[#3B82F6] caret-[#F97316] w-full"
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
