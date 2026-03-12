"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function BackgroundEnv() {
  const { scrollYProgress } = useScroll();
  
  const bgColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["#020617", "#0c0806"]
  );

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }} 
      className="fixed inset-0 -z-50 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:64px_64px]" />
    </motion.div>
  );
}
