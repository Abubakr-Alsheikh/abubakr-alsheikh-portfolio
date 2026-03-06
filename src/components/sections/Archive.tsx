"use client";
import { motion } from "framer-motion";
import { Github, ExternalLink, Code2 } from "lucide-react";

type ArchiveProject = {
  title: string;
  description: string;
  stack: string[];
  link: string;
};

export default function Archive({ projects }: { projects: ArchiveProject[] }) {
  return (
    <section className="relative w-full py-20 bg-[#020617] px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
           <h3 className="text-2xl md:text-3xl font-bold text-white">Project Archive</h3>
           <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Code2 className="w-5 h-5" />
                 </div>
                 <div className="flex gap-3 text-slate-500">
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors"><Github className="w-5 h-5" /></a>
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors"><ExternalLink className="w-5 h-5" /></a>
                 </div>
              </div>

              <h4 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                {project.title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {project.stack.map((s, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
