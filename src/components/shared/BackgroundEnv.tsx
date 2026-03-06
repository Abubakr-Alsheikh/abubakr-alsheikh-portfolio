"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BackgroundEnv() {
  const { scrollYProgress } = useScroll();
  
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ["#020617", "#020617", "#0c0a09", "#020617"]
  );

  return (
    <motion.div style={{ backgroundColor: bgColor }} className="fixed inset-0 -z-50 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, 50, 0],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-[20%] -left-20 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"
      />
      
      <motion.div 
        animate={{ 
          x: [0, -80, 0], 
          y: [0, 100, 0],
          opacity: [0.1, 0.15, 0.1] 
        }}
        transition={{ duration: 25, repeat: Infinity, delay: 2 }}
        className="absolute top-[60%] -right-20 w-[600px] h-[600px] bg-orange-600/10 blur-[140px] rounded-full"
      />

      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -500]) }}
        className="absolute top-1/4 right-0 text-[20vw] font-black text-white/[0.02] select-none leading-none whitespace-nowrap"
      >
        FULLSTACK
      </motion.div>
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -800]) }}
        className="absolute top-[70%] left-[-5%] text-[20vw] font-black text-white/[0.01] select-none leading-none whitespace-nowrap"
      >
        ARCHITECT
      </motion.div>
    </motion.div>
  );
}
