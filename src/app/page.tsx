"use client";

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
import MasterThread from "@/components/shared/MasterThread";
import AdminTerminal from "@/components/shared/AdminTerminal";
import { useBootSequence } from "@/hooks/useBootSequence";

export default function Home() {
  useBootSequence();

  return (
    <main className="relative flex flex-col w-full min-h-screen">
      <BackgroundEnv />
      
      <TelemetryNav />
      
      <MasterThread />

      <AdminTerminal />

      <div className="w-full space-y-0 relative z-10 flex flex-col items-center">
        <Hero data={portfolioData.hero} />
        <About data={portfolioData.about} />
        <Projects data={portfolioData.topProjects} />
        <Archive projects={portfolioData.archiveProjects} />
        <Journey data={portfolioData.journey} />
        <Engine skills={portfolioData.skills} certs={portfolioData.certifications} />
        <Horizon />
      </div>
    </main>
  );
}
