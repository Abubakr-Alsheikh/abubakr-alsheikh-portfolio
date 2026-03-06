import { portfolioData } from "@/lib/data";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Journey from "@/components/sections/Journey";
import Engine from "@/components/sections/Engine";
import Horizon from "@/components/sections/Horizon";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between w-full bg-[#020617] overflow-x-hidden">
      <Hero data={portfolioData.hero} />
      <About data={portfolioData.about} />
      <Projects data={portfolioData.projects} />
      <Journey data={portfolioData.journey} />
      <Engine skills={portfolioData.skills} certs={portfolioData.certifications} />
      <Horizon />
    </main>
  );
}
