"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Database,
  Network,
  Terminal,
} from "lucide-react";
import { useRef } from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  link: string;
};

// --- Custom Interactive System Visuals ---

const ArchitectureVisual = () => (
  <div className="relative w-full h-full min-h-[300px] bg-[#020617] rounded-2xl border border-slate-800/60 overflow-hidden group flex items-center justify-center">
    {/* Blueprint Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px]" />

    <div className="relative z-10 flex items-center gap-6 sm:gap-12">
      {/* Node 1: Client */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
          <Network className="w-5 h-5 text-blue-400" />
        </div>
        <span className="text-[10px] font-mono text-slate-500">CLIENT</span>
      </motion.div>

      {/* Connection Line */}
      <div className="w-12 sm:w-20 h-px bg-slate-800 relative">
        <motion.div
          animate={{ x: ["0%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-1px] left-0 w-1/3 h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent"
        />
      </div>

      {/* Node 2: Core */}
      <motion.div
        animate={{ y: [2, -2, 2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-16 h-16 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.1)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all">
          <Terminal className="w-6 h-6 text-orange-400" />
        </div>
        <span className="text-[10px] font-mono text-orange-500/80">
          DJANGO_CORE
        </span>
      </motion.div>

      {/* Connection Line */}
      <div className="w-12 sm:w-20 h-px bg-slate-800 relative">
        <motion.div
          animate={{ x: ["0%", "100%"] }}
          transition={{
            duration: 1.5,
            delay: 0.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[-1px] left-0 w-1/3 h-[3px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
        />
      </div>

      {/* Node 3: Database */}
      <motion.div
        animate={{ y: [-1, 1, -1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
          <Database className="w-5 h-5 text-emerald-400" />
        </div>
        <span className="text-[10px] font-mono text-slate-500">POSTGRESQL</span>
      </motion.div>
    </div>
  </div>
);

const TerminalVisual = () => (
  <div className="relative w-full h-full min-h-[300px] bg-[#0A0F1C] rounded-2xl border border-slate-800/60 overflow-hidden group p-6">
    <div className="flex items-center gap-2 mb-6 border-b border-slate-800/80 pb-3">
      <div className="w-3 h-3 rounded-full bg-slate-700 group-hover:bg-red-500/80 transition-colors" />
      <div className="w-3 h-3 rounded-full bg-slate-700 group-hover:bg-yellow-500/80 transition-colors delay-75" />
      <div className="w-3 h-3 rounded-full bg-slate-700 group-hover:bg-green-500/80 transition-colors delay-150" />
      <span className="ml-2 text-xs font-mono text-slate-600">engine.py</span>
    </div>
    <div className="font-mono text-xs sm:text-sm space-y-2 text-slate-400">
      <p>
        <span className="text-purple-400">async def</span>{" "}
        <span className="text-blue-400">orchestrate_ai</span>(payload):
      </p>
      <p className="pl-4">
        context = <span className="text-orange-400">await</span>{" "}
        memory.fetch(payload.id)
      </p>
      <p className="pl-4">
        response = <span className="text-orange-400">await</span>{" "}
        openai.chat.create(
      </p>
      <p className="pl-8 text-slate-500">model="gpt-4o",</p>
      <p className="pl-8 text-slate-500">messages=context</p>
      <p className="pl-4">)</p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1] }}
        className="mt-4 text-emerald-400 flex items-center gap-2"
      >
        <span>&gt;</span>{" "}
        <span className="text-slate-300">
          sys.stdout: Pipeline executed successfully.
        </span>
      </motion.div>
      <motion.div
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="w-2 h-4 bg-orange-500 inline-block align-middle ml-1"
      />
    </div>
  </div>
);

const JSONVisual = () => (
  <div className="relative w-full h-full min-h-[300px] bg-[#020617] rounded-2xl border border-slate-800/60 overflow-hidden group p-6">
    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all" />
    <div className="font-mono text-xs sm:text-sm space-y-1 relative z-10">
      <p className="text-slate-500">// Fallback to local Ollama active</p>
      <p className="text-yellow-200">{"{"}</p>
      <p className="pl-4">
        <span className="text-purple-300">"status"</span>:{" "}
        <span className="text-green-300">200</span>,
      </p>
      <p className="pl-4">
        <span className="text-purple-300">"model"</span>:{" "}
        <span className="text-orange-300">"llama3-8b-instruct"</span>,
      </p>
      <p className="pl-4">
        <span className="text-purple-300">"payload"</span>: {"{"}
      </p>
      <motion.p
        initial={{ opacity: 0.5 }}
        whileHover={{ opacity: 1, x: 5 }}
        transition={{ duration: 0.2 }}
        className="pl-8"
      >
        <span className="text-blue-300">"player_state"</span>:{" "}
        <span className="text-orange-300">"combat_engaged"</span>,
      </motion.p>
      <motion.p
        initial={{ opacity: 0.5 }}
        whileHover={{ opacity: 1, x: 5 }}
        transition={{ duration: 0.2 }}
        className="pl-8"
      >
        <span className="text-blue-300">"enemy_hp"</span>:{" "}
        <span className="text-green-300">450</span>,
      </motion.p>
      <motion.p
        initial={{ opacity: 0.5 }}
        whileHover={{ opacity: 1, x: 5 }}
        transition={{ duration: 0.2 }}
        className="pl-8"
      >
        <span className="text-blue-300">"loot_generated"</span>:{" "}
        <span className="text-orange-300">true</span>
      </motion.p>
      <p className="pl-4">{"}"}</p>
      <p className="text-yellow-200">{"}"}</p>
    </div>
  </div>
);

export default function Projects({ data }: { data: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Continue the scroll trace from the About section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });
  const traceHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full py-32 bg-[#020617] px-6 md:px-12 lg:px-20 z-20"
    >
      {/* 1. SEAMLESS CONNECTION: The Continuing Trace Line */}
      <div className="absolute left-6 md:left-[5.2rem] top-0 bottom-0 w-px bg-slate-800/50 hidden lg:block">
        <motion.div
          style={{ height: traceHeight }}
          className="absolute top-0 left-[-1px] w-[3px] bg-gradient-to-b from-orange-500 via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.6)]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative lg:pl-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              System Modules <span className="text-slate-700">//</span> Deployed
              Architectures
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-cal text-slate-100 tracking-tight leading-[1.1]">
            The <span className="text-slate-600">Arsenal.</span>
          </h2>
        </motion.div>

        {/* Projects List */}
        <div className="flex flex-col gap-32">
          {data.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-16 items-center group"
            >
              {/* Left Column: Project Details */}
              <div className="xl:col-span-5 flex flex-col relative z-10 order-2 xl:order-1">
                {/* Node dot on the Trace Line (Visible on Desktop) */}
                <div className="absolute top-6 -left-[85px] w-3 h-3 rounded-full border-2 border-[#020617] bg-slate-700 group-hover:bg-orange-400 transition-colors duration-500 hidden lg:block" />

                <span className="text-sm font-mono text-orange-500 mb-4 tracking-widest">
                  {project.id}
                </span>

                <h3 className="text-3xl md:text-4xl font-cal text-slate-100 mb-6 tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-100 group-hover:to-slate-400 transition-all duration-500">
                  {project.title}
                </h3>

                <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light">
                  {project.description}
                </p>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2 mb-10">
                  {project.stack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-slate-800/30 border border-slate-700 text-xs font-medium text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Interaction Links */}
                <div className="flex items-center gap-6">
                  {project.link !== "#" && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group/link flex items-center gap-2 text-sm font-medium text-slate-100 hover:text-orange-500 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>Source Code</span>
                      <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Visuals */}
              <div className="xl:col-span-7 relative w-full aspect-[4/3] sm:aspect-[16/9] xl:aspect-[4/3] order-1 xl:order-2">
                {/* Decorative background glow behind the visual */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800/20 to-transparent rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-700 ease-out" />

                <div className="absolute inset-0 rounded-2xl overflow-hidden backdrop-blur-sm border border-slate-800/50 transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out">
                  {index === 0 && <ArchitectureVisual />}
                  {index === 1 && <TerminalVisual />}
                  {index === 2 && <JSONVisual />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Archive Button */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 pt-16 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <p className="text-slate-400 font-light text-center sm:text-left">
            Additional systems and legacy architectures{" "}
            <br className="hidden sm:block" /> are archived for review.
          </p>
          <a
            href="https://github.com/Abubakr-Alsheikh"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-3 text-slate-100 font-medium py-3 px-8 rounded-full border border-slate-700 bg-[#020617] hover:bg-slate-900 transition-colors duration-300 overflow-hidden"
          >
            <span className="relative z-10 text-sm tracking-wide uppercase">
              Access Full Archive
            </span>
            <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 text-orange-500" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
          </a>
        </motion.div> */}
      </div>
    </section>
  );
}
