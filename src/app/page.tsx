"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { portfolioData } from "@/lib/data";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Archive from "@/components/sections/Archive";
import Journey from "@/components/sections/Journey";
import Engine from "@/components/sections/Engine";
import Horizon from "@/components/sections/Horizon";

import TelemetryNav from "@/components/shared/TelemetryNav";
import GLoadWarning from "@/components/shared/GLoadWarning";
import CompileStream from "@/components/shared/CompileStream";
import {
  BranchCenterToLeft,
  BranchLeftToCenter,
} from "@/components/shared/TraceRouters";
import DeepSpaceEnvironment from "@/components/visuals/DeepSpaceEnvironment";
import TraceField from "@/components/shared/TraceField";
import SystemBootSequence from "@/components/shared/SystemBootSequence";
import { useLenisInstance } from "@/components/shared/LenisProvider";

/**
 * The boot plays once per page load. Coming back from a case study is a
 * client-side navigation inside the same load, so it lands straight on the
 * page. A fresh load always starts false here, which matches the server
 * render, so this cannot cause a hydration mismatch.
 */
let bootedThisLoad = false;

export default function Home() {
  const [isBooting, setIsBooting] = useState(() => !bootedThisLoad);
  const lenis = useLenisInstance();

  useEffect(() => {
    if (!isBooting) bootedThisLoad = true;
  }, [isBooting]);

  // Returning to /#projects from a case study: land on the section.
  useEffect(() => {
    if (isBooting || !lenis || !window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) lenis.scrollTo(el, { immediate: true });
  }, [isBooting, lenis]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (isBooting) window.scrollTo(0, 0);

    if (isBooting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isBooting]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isBooting && (
          <SystemBootSequence onComplete={() => setIsBooting(false)} />
        )}
      </AnimatePresence>

      <main className="relative flex flex-col items-center w-full max-w-full min-h-screen overflow-x-clip selection:bg-[#3B82F6]/30 selection:text-[#3B82F6]">
        <DeepSpaceEnvironment />
        <TelemetryNav />
        <GLoadWarning />
        <CompileStream />

        <TraceField>
          <div className="w-full max-w-full relative z-10 flex flex-col">
            <Hero
              data={portfolioData.hero}
              contact={portfolioData.contact}
              isBooting={isBooting}
            />

            <About data={portfolioData.about} />
            <BranchCenterToLeft />

            <Projects data={portfolioData.topProjects} />
            <Archive projects={portfolioData.archiveProjects} />
            <Journey data={portfolioData.journey} />
            <BranchLeftToCenter />

            <Engine
              skills={portfolioData.skills}
              certs={portfolioData.certifications}
              badges={portfolioData.badges}
            />

            <Horizon contact={portfolioData.contact} />
          </div>
        </TraceField>
      </main>
    </>
  );
}
