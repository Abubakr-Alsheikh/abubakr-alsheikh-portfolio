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

import BackgroundEnv from "@/components/shared/BackgroundEnv";
import TelemetryNav from "@/components/shared/TelemetryNav";
import { BranchCenterToLeft, BranchLeftToCenter } from "@/components/shared/TraceRouters";
import DeepSpaceEnvironment from "@/components/visuals/DeepSpaceEnvironment";
import SystemBootSequence from "@/components/shared/SystemBootSequence";

export default function Home() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

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
        
        <BackgroundEnv />
        <DeepSpaceEnvironment />
        <TelemetryNav />

        <div className="w-full max-w-full relative z-10 flex flex-col">
          <Hero data={portfolioData.hero} isBooting={isBooting} />
          
          <About data={portfolioData.about} />
          <BranchCenterToLeft />
          
          <Projects data={portfolioData.topProjects} />
          <Archive projects={portfolioData.archiveProjects} />
          <Journey data={portfolioData.journey} />
          <BranchLeftToCenter />
          
          <Engine skills={portfolioData.skills} certs={portfolioData.certifications} />
          <Horizon />
        </div>
      </main>
    </>
  );
}
