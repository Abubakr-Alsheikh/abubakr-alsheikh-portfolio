"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function BackgroundEnv() {
  const { scrollYProgress } = useScroll();
  
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.7, 0.9, 1],
    [
      "#020617",
      "#0B0F19",
      "#2E1065",
      "#9A3412",
      "#F97316"
    ]
  );

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }} 
      className="fixed inset-0 -z-50 overflow-hidden transition-colors duration-200"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <motion.div 
        style={{ opacity: useTransform(scrollYProgress, [0, 0.6], [1, 0]) }}
        className="absolute inset-0"
      >
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              opacity: Math.random() * 0.8 + 0.2,
              animation: `pulse-glow ${Math.random() * 3 + 2}s infinite alternate`
            }}
          />
        ))}
      </motion.div>

      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -1000]) }}
        className="absolute top-[20%] right-[-10%] text-[20vw] font-black text-white/[0.02] select-none leading-none tracking-tighter"
      >
        ARCHITECT
      </motion.div>
    </motion.div>
  );
}
