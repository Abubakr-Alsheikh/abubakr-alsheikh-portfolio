import { portfolioData } from "@/lib/data";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Archive from "@/components/sections/Archive";
import Journey from "@/components/sections/Journey";
import Engine from "@/components/sections/Engine";
import Horizon from "@/components/sections/Horizon";

// Global Infrastructure
import BackgroundEnv from "@/components/shared/BackgroundEnv";
import TelemetryNav from "@/components/shared/TelemetryNav";
import { BranchCenterToLeft, BranchLeftToCenter } from "@/components/shared/TraceRouters";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center w-full max-w-full min-h-screen overflow-x-clip selection:bg-[#3B82F6]/30 selection:text-[#3B82F6]">
      <BackgroundEnv />
      <TelemetryNav />

      <div className="w-full max-w-full relative z-10 flex flex-col">
        <Hero data={portfolioData.hero} />
        
        {/* CENTER TRACE ACTIVE */}
        <About data={portfolioData.about} />
        <BranchCenterToLeft />
        
        {/* LEFT TRACE ACTIVE */}
        <Projects data={portfolioData.topProjects} />
        <Archive projects={portfolioData.archiveProjects} />
        <Journey data={portfolioData.journey} />
        <BranchLeftToCenter />
        
        {/* CENTER TRACE ACTIVE */}
        <Engine
          skills={portfolioData.skills}
          certs={portfolioData.certifications}
        />
        <Horizon />
      </div>
    </main>
  );
}
