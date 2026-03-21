"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DeepSpaceEnvironment() {
  const [meteors, setMeteors] = useState<
    Array<{ id: number; top: number; right: number; delay: number; duration: number }>
  >([]);
  const [stars, setStars] = useState<
    Array<{ id: number; top: number; left: number; size: number; delay: number }>
  >([]);

  useEffect(() => {
    setMeteors(
      Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        top: Math.random() * 95,
        right: Math.random() * 80 - 20,
        delay: Math.random() * 12 + i * 1.5,
        duration: Math.random() * 1.5 + 2,
      }))
    );
    
    setStars(
      Array.from({ length: 600 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white will-change-[opacity]"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{
            duration: 3 + star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {meteors.map((meteor) => (
        <motion.div
          key={`meteor-${meteor.id}`}
          className="absolute w-[250px] h-[1px] bg-gradient-to-l from-transparent via-[#3B82F6] to-white will-change-[transform,opacity]"
          style={{
            top: `${meteor.top}%`,
            right: `${meteor.right}%`,
            rotate: "-35deg",
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: -2000, y: 1200 }}
          transition={{
            delay: meteor.delay,
            duration: meteor.duration,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.1, 0.8],
          }}
        />
      ))}
    </div>
  );
}
