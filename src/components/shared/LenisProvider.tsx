"use client";

import useLenis from "@/hooks/useLenis";
import type Lenis from "lenis";
import { createContext, useContext, type ReactNode } from "react";

/**
 * Publishes the page's Lenis instance so navigation can scroll through the same
 * engine the wheel does. `null` until Lenis has mounted, and on the server —
 * callers fall back to a native jump rather than assuming it exists.
 */
const LenisContext = createContext<Lenis | null>(null);

export const useLenisInstance = () => useContext(LenisContext);

const LenisProvider = ({ children }: { children: ReactNode }) => {
  const lenis = useLenis();

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
};

export default LenisProvider;
