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
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        right: Math.random() * 50 - 20,
        delay: Math.random() * 8 + i * 3,
        duration: Math.random() * 2 + 3,
      })),
    );
    setStars(
      Array.from({ length: 75 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
      })),
    );
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-[200vh] pointer-events-none z-0 overflow-hidden mask-fade-bottom">
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
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
          className="absolute w-[150px] h-[1px] bg-gradient-to-l from-transparent via-[#3B82F6] to-white"
          style={{
            top: `${meteor.top}%`,
            right: `${meteor.right}%`,
            rotate: "-35deg",
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: -800, y: 500 }}
          transition={{
            delay: meteor.delay,
            duration: meteor.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
