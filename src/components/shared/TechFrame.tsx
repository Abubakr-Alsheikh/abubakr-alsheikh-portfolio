// src/components/shared/TechFrame.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TechFrameProps {
  children: ReactNode;
  className?: string;
  accentColor?: string;
}

export default function TechFrame({ children, className, accentColor = "text-slate-500" }: TechFrameProps) {
  return (
    <div className={cn("relative group", className)}>
      <svg className={cn("absolute -top-[1px] -left-[1px] w-4 h-4 transition-colors duration-300 z-10", accentColor, "group-hover:text-white")} fill="none" viewBox="0 0 16 16">
        <path d="M0 16V0H16" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <svg className={cn("absolute -top-[1px] -right-[1px] w-4 h-4 transition-colors duration-300 z-10", accentColor, "group-hover:text-white")} fill="none" viewBox="0 0 16 16">
        <path d="M0 0H16V16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 4L16 0" stroke="currentColor" strokeWidth="1" />
      </svg>

      <svg className={cn("absolute -bottom-[1px] -left-[1px] w-4 h-4 transition-colors duration-300 z-10", accentColor, "group-hover:text-white")} fill="none" viewBox="0 0 16 16">
        <path d="M16 16H0V0" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <svg className={cn("absolute -bottom-[1px] -right-[1px] w-4 h-4 transition-colors duration-300 z-10", accentColor, "group-hover:text-white")} fill="none" viewBox="0 0 16 16">
        <path d="M0 16H16V0" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>

      <div className="relative w-full h-full bg-[#020617]/40 backdrop-blur-md border border-slate-800/40 p-6 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
