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
import GlobalTraceLine from "@/components/shared/GlobalTraceLine";
import TelemetryNav from "@/components/shared/TelemetryNav";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center w-full min-h-screen selection:bg-[#3B82F6]/30 selection:text-[#3B82F6]">
      {/* 1. Subtle Dark Atmosphere */}
      <BackgroundEnv />

      {/* 2. The Unbroken Trace Line */}
      {/* <GlobalTraceLine /> */}

      {/* 3. The Command Center (Navbar + Terminal) */}
      <TelemetryNav />

      <div className="w-full relative z-10">
        <Hero data={portfolioData.hero} />
        <About data={portfolioData.about} />
        <Projects data={portfolioData.topProjects} />
        <Archive projects={portfolioData.archiveProjects} />
        <Journey data={portfolioData.journey} />
        <Engine
          skills={portfolioData.skills}
          certs={portfolioData.certifications}
        />
        <Horizon />
      </div>
    </main>
  );
}
