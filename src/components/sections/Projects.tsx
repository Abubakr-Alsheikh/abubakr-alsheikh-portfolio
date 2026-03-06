"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Project = {
  title: string;
  description: string;
  stack: string[];
  link: string;
};

// --- Visual Placeholders (Same as before) ---
const LearningPlatformVisual = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-950 relative overflow-hidden group border border-slate-800/50 rounded-xl">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    <div className="relative w-3/4 h-3/4 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl flex flex-col overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
      <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center gap-2 px-3">
        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
      </div>
      <div className="flex-1 p-4 grid grid-cols-3 gap-3">
        <div className="col-span-1 bg-slate-800/50 rounded h-full animate-pulse"></div>
        <div className="col-span-2 flex flex-col gap-3">
          <div className="h-1/3 bg-blue-500/10 border border-blue-500/20 rounded"></div>
          <div className="h-2/3 bg-slate-800/50 rounded"></div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        Django + Next.js
      </div>
    </div>
  </div>
);

const PromptCraftVisual = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden group border border-slate-800/50 rounded-xl">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
    <div className="w-[90%] font-mono text-xs text-slate-300 p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-4 mb-4 text-slate-500 border-b border-slate-800 pb-2">
        <span>generate_loot.py</span>
      </div>
      <div className="space-y-1">
        <p>
          <span className="text-purple-400">class</span>{" "}
          <span className="text-yellow-300">LootItem</span>(BaseModel):
        </p>
        <p className="pl-4">
          name: <span className="text-blue-400">str</span>
        </p>
        <p className="pl-4">
          rarity: <span className="text-blue-400">float</span> ={" "}
          <span className="text-green-400">0.05</span>
        </p>
      </div>
    </div>
  </div>
);

const TelegramBotVisual = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden group border border-slate-800/50 rounded-xl">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
    <div className="w-[90%] font-mono text-xs text-slate-300 p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-4 mb-4 text-slate-500 border-b border-slate-800 pb-2">
         <span>bot_handler.py</span>
      </div>
      <div className="space-y-1">
        <p><span className="text-purple-400">async def</span> <span className="text-yellow-300">process_message</span>(msg):</p>
        <p className="pl-4">analysis = <span className="text-blue-400">await</span> openai.chat(msg)</p>
        <p className="pl-4 mb-2"><span className="text-green-400"># AI Response Generated</span></p>
        <p><span className="text-slate-500"># Sending to user...</span></p>
        <p><span className="text-green-500">{`>>> Telegram API: Delivered`}</span></p>
      </div>
    </div>
  </div>
);

export default function Projects({ data }: { data: Project[] }) {
  const content = data.map((project, index) => ({
    title: project.title,
    description: project.description,
    tags: project.stack,
    content: (
      <div className="h-full w-full flex items-center justify-center text-white">
        {index === 0 && <LearningPlatformVisual />}
        {index === 1 && <PromptCraftVisual />}
        {index === 2 && <TelegramBotVisual />}
      </div>
    ),
  }));

  return (
    // FIX: Removed 'overflow-hidden' here so sticky positioning works!
    <section className="relative w-full py-20 lg:py-32 bg-[#020617]">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full" />
          <span className="text-orange-500 font-mono text-sm tracking-wider uppercase">
            Featured Work
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          The <span className="text-slate-500">Arsenal</span>
        </motion.h2>
      </div>

      <div className="w-full">
        <StickyScroll content={content} />
      </div>

      {/* Button */}
      <div className="flex justify-center mt-20">
        <motion.a
          href="https://github.com/Abubakr-Alsheikh"
          target="_blank"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-2 px-8 py-3 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-medium hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer"
        >
          View Full Project Archive
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.a>
      </div>
    </section>
  );
}
