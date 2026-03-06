"use client";
import React, { useRef } from "react";
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
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
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
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      // FIX 1: Added 'items-start' to ensure the flex children align at the top
      // FIX 2: Added 'relative' to establish the bounding box for sticky
      className="relative flex items-start justify-center space-x-10 rounded-md p-10 max-w-7xl mx-auto"
      ref={ref}
    >
      {/* Left Side: Text (Scrolls naturally) */}
      <div className="relative flex flex-col items-start px-4 w-full md:w-1/2">
        {content.map((item, index) => (
          <div
            key={item.title + index}
            className="my-20 min-h-[60vh] flex flex-col justify-center"
          >
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
              className="text-lg text-slate-400 mt-4 leading-relaxed"
            >
              {item.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: activeCard === index ? 1 : 0.3,
              }}
              className="flex flex-wrap gap-2 mt-6"
            >
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-mono font-medium rounded-full border border-slate-700 bg-slate-800/50 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Mobile Only Content */}
            <div
              className={cn(
                "block md:hidden mt-10 rounded-xl overflow-hidden h-60 w-full",
                contentClassName,
              )}
            >
              {item.content ?? null}
            </div>
          </div>
        ))}
        <div className="h-20" />
      </div>

      {/* Right Side: Visual (Sticky) */}
      {/* FIX 3: Increased top value to 'top-32' so it sits nicely in the viewport center */}
      <div
        className={cn(
          "hidden md:block w-1/2 h-[400px] sticky top-32 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800/50",
          contentClassName,
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
