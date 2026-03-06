"use client";
import React, { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    tags: string[];
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      className="h-[30rem] overflow-y-auto flex justify-center relative space-x-10 rounded-md p-10 no-scrollbar"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-3xl font-bold text-slate-100 mb-4"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-lg text-slate-400 max-w-sm mt-4 leading-relaxed"
              >
                {item.description}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                }} 
                className="flex flex-wrap gap-2 mt-6 max-w-sm"
            >
                  {item.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 text-xs font-mono font-medium rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-orange-500/50 hover:text-orange-400 transition-colors cursor-default">
                          {tag}
                      </span>
                  ))}
              </motion.div>
              
              <div className={cn("block md:hidden mt-6 rounded-xl overflow-hidden h-60 w-full", contentClassName)}>
                 {item.content ?? null}
              </div>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      
      <div
        className={cn(
          "hidden md:block h-80 w-[500px] rounded-2xl bg-slate-900 sticky top-10 overflow-hidden border border-slate-800/50",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
