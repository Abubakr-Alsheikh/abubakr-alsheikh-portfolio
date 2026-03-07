import { portfolioData } from "@/lib/data";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Archive from "@/components/sections/Archive";
import Journey from "@/components/sections/Journey";
import Engine from "@/components/sections/Engine";
import Horizon from "@/components/sections/Horizon";
import BackgroundEnv from "@/components/shared/BackgroundEnv";
import ScrollLine from "@/components/shared/ScrollLine";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center w-full min-h-screen">
      <BackgroundEnv />
      <ScrollLine />

      <div className="w-full space-y-0 relative z-10">
        <Hero data={portfolioData.hero} />

        <About data={portfolioData.about} />

        <Projects data={portfolioData.topProjects} />

        <Archive projects={portfolioData.archiveProjects} />

        <div className="">
          <Journey data={portfolioData.journey} />
        </div>

        <Engine
          skills={portfolioData.skills}
          certs={portfolioData.certifications}
        />
        <Horizon />
      </div>
    </main>
  );
}
