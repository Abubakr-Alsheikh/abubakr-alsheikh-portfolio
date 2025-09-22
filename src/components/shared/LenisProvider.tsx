"use client";

import useLenis from "@/hooks/useLenis";
import { ReactNode } from "react";

const LenisProvider = ({ children }: { children: ReactNode }) => {
  // Call the hook to initialize and manage the Lenis instance
  useLenis();

  // This component doesn't render any of its own DOM elements,
  // it just provides the Lenis context via the hook.
  return <>{children}</>;
};

export default LenisProvider;
