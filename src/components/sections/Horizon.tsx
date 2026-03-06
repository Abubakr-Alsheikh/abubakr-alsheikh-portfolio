"use client";
import { useRef, useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, FileText, Mail } from "lucide-react";

const MagneticButton = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    x.set(middleX * 0.3); 
    y.set(middleY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative inline-block"
    >
      {children}
    </motion.div>
  );
};

const ScrambleLink = ({ text, href, icon: Icon }: { text: string; href: string, icon?: any }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+";

  const handleMouseEnter = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      onMouseEnter={handleMouseEnter} 
      className="flex items-center gap-2 text-slate-400 hover:text-orange-500 font-mono text-sm transition-colors group"
    >
      {Icon && <Icon className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />}
      <span>{displayText}</span>
    </a>
  );
};

export default function Horizon() {
  return (
    <section className="relative w-full min-h-[85vh] bg-[#020617] flex flex-col items-center justify-end overflow-hidden pt-32 pb-10 px-6">
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[140%] h-[60vh] bg-gradient-to-t from-orange-600/20 via-blue-900/10 to-transparent blur-[120px] pointer-events-none" 
      />

      <div className="relative z-10 flex flex-col items-center text-center mb-auto mt-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-sm text-slate-300 font-medium">Available for new opportunities</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.9]"
        >
          Let&apos;s Architect <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-600">The Future.</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg md:text-2xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          Whether you need a scalable Django backend, a fluid Next.js frontend, or both.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.4, type: "spring" }}
        >
            <MagneticButton>
              <a href="mailto:AbubakrAlsheikh@outlook.com" className="group relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_0_50px_-10px_rgba(249,115,22,0.5)] cursor-pointer overflow-hidden transition-transform duration-500 hover:scale-105">
                  
                  <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out" />
                  
                  <div className="relative z-10 flex flex-col items-center gap-2">
                      <Mail className="w-8 h-8 md:w-10 md:h-10 mb-2" />
                      <span className="text-xl md:text-2xl font-bold">Say Hello</span>
                      <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
              </a>
            </MagneticButton>
        </motion.div>

      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-slate-500 text-sm">
          <span>© 2026 Abubakr Alsheikh.</span>
          <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-700" />
          <span>Built with Next.js, Tailwind & Framer Motion.</span>
        </div>

        <div className="flex items-center gap-8">
          <ScrambleLink text="GITHUB" href="https://github.com/Abubakr-Alsheikh/" icon={Github} />
          <ScrambleLink text="LINKEDIN" href="https://www.linkedin.com/in/abubakr-alsheikh-dev/" icon={Linkedin} />
          <ScrambleLink text="RESUME" href="#" icon={FileText} />
        </div>

      </div>
    </section>
  );
}
