// src/hooks/useBootSequence.ts
"use client";

import { useEffect } from "react";

export function useBootSequence() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const asciiArt = `
      ___  ___  _ __   ___  ___ 
     / __|/ _ \\| '_ \\ / __|/ _ \\
    | (__| (_) | | | \\__ \\  __/
     \\___|\\___/|_| |_|___/\\___|
    
    SYSTEM ARCHITECT: Abubakr Alsheikh
    STATUS: ONLINE & OPTIMAL
    `;

    const style1 = "color: #F97316; font-weight: bold; font-family: monospace; font-size: 14px;";
    const style2 = "color: #3B82F6; font-family: monospace; font-size: 12px;";
    const style3 = "color: #A855F7; font-family: monospace; font-size: 12px; font-style: italic;";

    console.log(`%c${asciiArt}`, style1);
    console.log("%c[SYS.LOG] Next.js Engine mounted successfully.", style2);
    console.log("%c[SYS.LOG] Atmospheric physics initialized.", style2);
    console.log("%c[SYS.TIP] Try the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A", style3);
    
  }, []);
}
