"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, GraduationCap, Medal } from "lucide-react";

type JourneyItem = {
  date: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  align: string;
};

const getIcon = (title: string) => {
  if (title.includes("Freelance")) return <Briefcase className="w-5 h-5" />;
  if (title.includes("Diploma")) return <Medal className="w-5 h-5" />;
  return <GraduationCap className="w-5 h-5" />;
};

export default function Journey({ data }: { data: JourneyItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 50%"],
  });

  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative w-full py-20 md:py-32 bg-[#020617] text-white overflow-hidden px-6">
      
      <div className="text-center mb-16 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500">Journey</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 max-w-xl mx-auto"
        >
          A timeline of relentless learning and shipping production code.
        </motion.p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        
        <div className="absolute left-[28px] md:left-[50%] top-0 bottom-0 w-[2px] bg-slate-800 -translate-x-1/2" />
        
        <motion.div 
          style={{ height }}
          className="absolute left-[28px] md:left-[50%] top-0 w-[2px] bg-gradient-to-b from-blue-500 via-orange-500 to-orange-600 -translate-x-1/2 shadow-[0_0_15px_rgba(249,115,22,0.6)] z-0" 
        />

        <div className="space-y-12 md:space-y-24 mt-10">
          {data.map((item, index) => (
            <div key={index} className={`relative flex flex-col md:flex-row items-center w-full ${item.align === "left" ? "md:flex-row-reverse" : ""}`}>
              
              <div className="hidden md:block w-5/12" />

              <div className="absolute left-[16px] md:left-[50%] -translate-x-1/2 flex items-center justify-center z-10">
                 <motion.div 
                   initial={{ scale: 0, opacity: 0 }}
                   whileInView={{ scale: 1, opacity: 1 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ type: "spring", stiffness: 200, damping: 10 }}
                   className="w-6 h-6 rounded-full bg-[#020617] border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] flex items-center justify-center"
                 >
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                 </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: item.align === "left" ? -50 : 50, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.1 }}
                className="ml-16 md:ml-0 w-full md:w-5/12 relative group"
              >
                <div className={`flex mb-2 ${item.align === "left" ? "md:justify-end" : "md:justify-start"}`}>
                    <span className="text-orange-500 font-mono text-xs tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                        {item.date}
                    </span>
                </div>

                <div className={`p-6 md:p-8 rounded-2xl border border-slate-800 bg-[#0F172A]/80 backdrop-blur-sm hover:border-slate-600 transition-colors duration-300 ${item.align === "left" ? "text-left md:text-right" : "text-left"}`}>
                    
                    <div className={`flex items-center gap-3 mb-3 ${item.align === "left" ? "md:flex-row-reverse" : "flex-row"}`}>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                             {getIcon(item.title)}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-100">{item.title}</h3>
                    </div>
                    
                    <h4 className="text-lg text-blue-400 mb-4 font-medium">{item.subtitle}</h4>
                    <p className="text-slate-400 leading-relaxed text-sm md:text-base mb-6">
                        {item.description}
                    </p>
                    
                    <div className={`flex flex-wrap gap-2 ${item.align === "left" ? "md:justify-end" : "justify-start"}`}>
                        {item.tags.map((tag, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-400 group-hover:text-slate-200 group-hover:border-slate-600 transition-colors">
                            {tag}
                            </span>
                        ))}
                    </div>
                </div>
              </motion.div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
