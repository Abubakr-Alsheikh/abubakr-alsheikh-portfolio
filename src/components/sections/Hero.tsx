"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";

type HeroData = {
  badge: string;
  headingMain: string;
  headingGradient: string;
  subtext: string;
};

export default function Hero({ data }: { data: HeroData }) {
  const words = data.headingMain.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020617] px-6">
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x:[0, 60, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          scale:[1, 1.3, 1],
          x: [0, -70, 0],
          y:[0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-500/15 blur-[150px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto mt-16">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-slate-800/80 bg-slate-900/50 backdrop-blur-md mb-8 md:mb-12 shadow-sm shadow-orange-500/5"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          <span className="text-sm text-slate-300 font-medium tracking-wide">
            {data.badge}
          </span>
        </motion.div>

        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          <span className="inline-block mb-2 md:mb-4">
            {words.map((word, index) => (
              <motion.span key={index} variants={wordVariants} className="inline-block mr-3 md:mr-4">
                {word}
              </motion.span>
            ))}
          </span>
          <br />
          <motion.span
            initial={{ opacity: 0, filter: "blur(15px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 pb-2"
          >
            {data.headingGradient}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}
          className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed"
        >
          {data.subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.9 }}
          className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.6)] transition-all duration-300"
          >
            Explore My Work
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-transparent border border-slate-700 text-slate-300 font-semibold hover:border-blue-500 hover:text-white transition-all duration-300"
          >
            <Github className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            View GitHub
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}
