"use client";

import { motion, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Database,
  FileText,
  Github,
  Globe,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import GeometricNeptune from "@/components/visuals/GeometricNeptune";
import PlanetTag from "@/components/visuals/PlanetTag";
import ProjectSchematic from "@/components/visuals/ProjectSchematic";
import { WarpLink } from "@/components/shared/PageTransition";
import TracePacket from "@/components/shared/TracePacket";
import { planetNotes } from "@/lib/data/planets";
import type { ArchiveProject, ProjectFlag, ProjectKind } from "@/lib/data/archiveProjects";
import { useTraceFill } from "@/hooks/useTraceFill";
import { useOffscreen } from "@/hooks/useOffscreen";

type Filter = "all" | ProjectKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "backend", label: "Backend" },
  { id: "web", label: "Web" },
  { id: "client", label: "Client" },
  { id: "mobile", label: "Mobile" },
  { id: "course", label: "Course" },
];

const KIND_LABEL: Record<ProjectKind, string> = {
  ai: "AI",
  backend: "Backend",
  web: "Web",
  client: "Client",
  mobile: "Mobile",
  course: "Coursework",
};

const FLAG_LABEL: Record<ProjectFlag, string> = {
  unfinished: "Unfinished",
  hackathon: "Hackathon",
  team: "Team",
  company: "Company",
  concept: "Concept",
};

const pad = (n: number) => String(n).padStart(2, "0");

const LINK =
  "flex items-center gap-1.5 border px-2.5 h-8 text-[10px] font-mono uppercase tracking-widest transition-colors group/link";
const ARROW =
  "w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform";

/** Screenshot when the project has one, otherwise a schematic of its kind. */
function Preview({ project, sizes }: { project: ArchiveProject; sizes: string }) {
  return project.preview ? (
    <Image
      src={project.preview}
      alt={`${project.title} screenshot`}
      fill
      sizes={sizes}
      className="object-cover object-top"
    />
  ) : (
    <ProjectSchematic kind={project.kinds[0]} slug={project.slug} year={project.year} />
  );
}

function Tags({ project }: { project: ArchiveProject }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {project.kinds.map((k) => (
        <span
          key={k}
          className="px-1.5 py-0.5 border border-slate-800 text-[9px] font-mono uppercase tracking-widest text-slate-400"
        >
          {KIND_LABEL[k]}
        </span>
      ))}
      {project.flags?.map((f) => (
        <span
          key={f}
          className={`px-1.5 py-0.5 border text-[9px] font-mono uppercase tracking-widest ${
            f === "unfinished"
              ? "border-[#F97316]/40 text-[#F97316]"
              : "border-[#3B82F6]/40 text-[#60A5FA]"
          }`}
        >
          {FLAG_LABEL[f]}
        </span>
      ))}
    </div>
  );
}

/** Every link the project still has, or a plain note that the code is private. */
function Links({ project, target }: { project: ArchiveProject; target: string }) {
  const { live, source, caseStudy } = project.links;
  if (!live && !source && !caseStudy) {
    return (
      <span className={`${LINK} border-slate-800 text-slate-400`}>
        <Lock className="w-3 h-3" />
        Private
      </span>
    );
  }
  return (
    <>
      {caseStudy && (
        <WarpLink
          href={`/projects/${caseStudy}`}
          warp={{ kicker: `${target} // Case_Study`, title: project.title }}
          className={`${LINK} border-[#F97316]/50 text-[#F97316] hover:bg-[#F97316]/10`}
        >
          <FileText className="w-3 h-3" />
          Case
          <ArrowUpRight className={ARROW} />
        </WarpLink>
      )}
      {live && (
        <a
          href={live}
          target="_blank"
          rel="noreferrer"
          className={`${LINK} border-slate-700 text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6]`}
        >
          <Globe className="w-3 h-3" />
          Live
          <ArrowUpRight className={ARROW} />
        </a>
      )}
      {source && (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className={`${LINK} border-slate-700 text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6]`}
        >
          <Github className="w-3 h-3" />
          Source
          <ArrowUpRight className={ARROW} />
        </a>
      )}
    </>
  );
}

function ArchiveRow({
  project,
  target,
  onActivate,
}: {
  project: ArchiveProject;
  target: string;
  onActivate: () => void;
}) {
  return (
    <motion.article
      data-hud-target={target}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3 }}
      className="group relative grid grid-cols-[1fr_auto] md:grid-cols-[4.5rem_1fr_auto] xl:grid-cols-[4.5rem_1fr] gap-x-5 gap-y-3 py-6 pl-6 pr-4 border-b border-slate-800 transition-colors duration-300 hover:bg-[#3B82F6]/[0.04] data-[hud-locked]:bg-[#3B82F6]/[0.04]"
    >
      {/* Trace hardware: a node on the rail, a branch to the row, and a bar
          down the row's left edge, lit as the row crosses the centre line. */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50% 0px -50% 0px" }}
        className="absolute inset-0 pointer-events-none hidden md:block"
      >
        <motion.div
          variants={{
            hidden: { backgroundColor: "#020617" },
            visible: { backgroundColor: "#3B82F6", transition: { duration: 0.1 } },
          }}
          className="absolute top-[38px] -left-[4rem] w-2 h-2 rounded-sm -translate-x-[4px] -translate-y-[4px] z-10 border border-[#3B82F6]/60 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
        <div className="absolute top-[38px] -left-[4rem] w-[4rem] h-px bg-slate-800 -translate-y-[0.5px]">
          <motion.div
            variants={{
              hidden: { scaleX: 0 },
              visible: { scaleX: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } },
            }}
            className="w-full h-full bg-[#3B82F6] origin-left shadow-[0_0_10px_#3B82F6]"
          />
        </div>
        <motion.div
          variants={{
            hidden: { scaleY: 0 },
            visible: { scaleY: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.4 } },
          }}
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#3B82F6] origin-top shadow-[0_0_10px_#3B82F6]"
        />
      </motion.div>

      <span className="hidden md:block md:row-span-2 pt-1 text-xs font-mono tracking-widest text-slate-400 group-hover:text-[#F97316] group-data-[hud-locked]:text-[#F97316] transition-colors">
        {project.year}
      </span>

      {/* Head: beside the thumbnail on phones, so the text below gets the
          full width instead of a strip next to it. */}
      <div className="min-w-0 flex flex-col gap-3 self-center md:self-start">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="md:hidden text-[10px] font-mono tracking-widest text-slate-400">
            {project.year}
          </span>
          <h4 className="text-lg md:text-xl font-space font-bold text-slate-100 group-hover:text-[#F97316] group-data-[hud-locked]:text-[#F97316] transition-colors">
            {project.title}
          </h4>
        </div>
        <Tags project={project} />
      </div>

      <div className="col-span-2 md:col-span-1 md:col-start-2 min-w-0 flex flex-col gap-3">
        <p className="text-slate-400 text-sm font-mono leading-relaxed max-w-2xl">
          {project.summary}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-[10px] md:text-[11px] font-mono text-slate-400 tracking-wide">
            {project.stack.map((s) => `[${s}]`).join(" ")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Links project={project} target={target} />
          </div>
        </div>
      </div>

      {/* Below xl the preview lives in the row. It lights when hovered, or
          when the reticle locks the row on a phone (data-hud-locked); the
          size never changes, so a lock cannot shift the page. */}
      <div className="xl:hidden col-start-2 row-start-1 md:col-start-3 md:row-span-2 relative w-24 sm:w-36 md:w-44 aspect-[16/10] self-start border border-slate-800 bg-[#020617] overflow-hidden grayscale opacity-60 transition-[filter,opacity,border-color] duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:border-[#3B82F6]/60 group-data-[hud-locked]:grayscale-0 group-data-[hud-locked]:opacity-100 group-data-[hud-locked]:border-[#F97316]/60">
        <Preview project={project} sizes="(min-width: 768px) 176px, (min-width: 640px) 144px, 96px" />
        <div className="hidden group-hover:block group-data-[hud-locked]:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hud-traverse-y [--hud-dur:2.4s] absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(59,130,246,0.35)_50%,transparent_55%)]" />
        </div>
      </div>
    </motion.article>
  );
}

/** xl and up: one screen beside the list showing whichever row is active. */
function Monitor({ project }: { project: ArchiveProject }) {
  return (
    <div className="hidden xl:block sticky top-28 z-10 border border-slate-800 bg-[#020617]">
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#3B82F6]/60" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#F97316]/60" />
      <div className="h-8 border-b border-slate-800 flex items-center justify-between px-3">
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-slate-700" />
          <div className="hud-pulse [--hud-dur:2s] w-1.5 h-1.5 bg-[#3B82F6]" />
          <div className="w-1.5 h-1.5 bg-[#F97316]" />
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest truncate pl-3">
          Preview // {project.slug}
        </span>
      </div>

      <motion.div
        key={project.slug}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="relative aspect-[16/10] border-b border-slate-800 overflow-hidden">
          <Preview project={project} sizes="400px" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="hud-traverse-y [--hud-dur:4s] absolute inset-0 bg-[linear-gradient(to_bottom,transparent_46%,rgba(59,130,246,0.25)_50%,transparent_54%)]" />
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="text-xl font-space font-bold text-slate-100 leading-tight">
              {project.title}
            </h4>
            <span className="text-xs font-mono text-[#F97316] tracking-widest">
              {project.year}
            </span>
          </div>
          <Tags project={project} />
          <dl className="grid grid-cols-3 gap-px bg-slate-800 border border-slate-800 text-[9px] font-mono uppercase tracking-widest">
            {(["live", "source", "caseStudy"] as const).map((key) => (
              <div key={key} className="bg-[#020617] px-2 py-1.5 flex flex-col gap-0.5">
                <dt className="text-slate-400">{key === "caseStudy" ? "Case" : key}</dt>
                <dd className={project.links[key] ? "text-[#3B82F6]" : "text-slate-400"}>
                  {project.links[key] ? "Online" : "None"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </div>
  );
}

function LegacyRow({ project, target }: { project: ArchiveProject; target: string }) {
  return (
    <li
      data-hud-target={target}
      className="group grid grid-cols-[3rem_1fr_auto] md:grid-cols-[4.5rem_15rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-3 pl-6 pr-4 border-b border-slate-800/70 hover:bg-[#3B82F6]/[0.04]"
    >
      <span className="text-[11px] font-mono text-slate-400">{project.year}</span>
      <span className="text-sm font-space font-bold text-slate-200 group-hover:text-[#F97316] transition-colors">
        {project.title}
      </span>
      <span className="col-start-2 md:col-start-auto row-start-2 md:row-start-auto text-xs font-mono text-slate-400 leading-relaxed">
        {project.summary}{" "}
        <span className="text-slate-400">{project.stack.map((s) => `[${s}]`).join(" ")}</span>
      </span>
      {project.links.source ? (
        <a
          href={project.links.source}
          target="_blank"
          rel="noreferrer"
          className="col-start-3 md:col-start-4 row-start-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-300 hover:text-[#3B82F6] transition-colors group/link"
        >
          <Github className="w-3 h-3" />
          Source
          <ArrowUpRight className={ARROW} />
        </a>
      ) : (
        <span />
      )}
    </li>
  );
}

export default function Archive({ projects }: { projects: ArchiveProject[] }) {
  const traceRef = useRef<HTMLDivElement>(null);
  const { fill, progress, packetOpacity } = useTraceFill(traceRef);
  // Neptune drifts upward as the section passes through centre.
  const neptuneDrift = useTransform(progress, [0, 1], [60, -60]);
  // The monitor's scan line and the row previews loop; freeze them off screen.
  const { ref: sectionRef, offscreen } = useOffscreen<HTMLElement>();

  const archive = projects.filter((p) => p.tier === "archive");
  const legacy = projects.filter((p) => p.tier === "legacy");

  const [filter, setFilter] = useState<Filter>("all");
  const [activeSlug, setActiveSlug] = useState(archive[0]?.slug);
  const [legacyOpen, setLegacyOpen] = useState(false);

  const count = (f: Filter) =>
    f === "all" ? archive.length : archive.filter((p) => p.kinds.includes(f)).length;
  const shown = filter === "all" ? archive : archive.filter((p) => p.kinds.includes(filter));
  const active = shown.find((p) => p.slug === activeSlug) ?? shown[0];

  return (
    <section
      ref={sectionRef}
      data-offscreen={offscreen || undefined}
      id="archive"
      className="relative w-full flex justify-center z-0"
    >
      {/* No scroll anchoring here: the layer stretches with the section, so
          when the legacy drawer opens Neptune re-centres, and Chrome, anchored
          to it, scrolled the page 272px to follow it. */}
      <motion.div
        style={{ y: neptuneDrift }}
        className="absolute inset-0 pointer-events-none [overflow-anchor:none]"
      >
        <GeometricNeptune />
      </motion.div>

      <div className="w-full max-w-7xl mx-auto relative pt-16 pb-16">
        <div
          ref={traceRef}
          className="absolute left-[4rem] top-0 bottom-0 w-px bg-slate-800/50 hidden md:block z-0"
        >
          <motion.div
            style={{ height: fill }}
            className="w-full bg-[#3B82F6] origin-top relative shadow-[0_0_15px_#3B82F6]"
          >
            <TracePacket opacity={packetOpacity} label="ARCHIVE" tone="blue" />
          </motion.div>
        </div>

        <div className="pl-6 md:pl-[8rem] pr-6 md:pr-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-10 flex justify-between items-end gap-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  System Logs // Field Archive
                </span>
              </div>
              <h3 className="text-4xl md:text-6xl font-space font-bold text-slate-100 tracking-tighter leading-[1]">
                The <span className="text-slate-500">Archive.</span>
              </h3>
            </div>
            {/* The open space near Neptune is here, beside the header. */}
            <PlanetTag note={planetNotes.neptune} planet="neptune" align="right" className="relative" />
          </motion.div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div role="group" aria-label="Filter the archive by type" className="flex flex-wrap gap-2">
              {FILTERS.filter((f) => count(f.id) > 0).map((f) => {
                const on = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFilter(f.id)}
                    data-hud-target={`ARCH.FILTER.${f.id.toUpperCase()}`}
                    className={`h-8 px-3 border text-[10px] font-mono uppercase tracking-widest transition-colors ${
                      on
                        ? "border-[#F97316] bg-[#F97316]/10 text-[#F97316]"
                        : "border-slate-800 text-slate-400 hover:border-[#3B82F6] hover:text-[#3B82F6]"
                    }`}
                  >
                    {f.label}
                    <span className="ml-2">
                      {pad(count(f.id))}
                    </span>
                  </button>
                );
              })}
            </div>
            <span aria-live="polite" className="text-[10px] font-mono uppercase tracking-widest text-[#3B82F6]">
              {pad(shown.length)} Records
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-8 border-t-2 border-slate-800">
              {shown.map((project) => {
                const target = `ARCH.${pad(archive.indexOf(project) + 1)}`;
                return (
                  <ArchiveRow
                    key={project.slug}
                    project={project}
                    target={target}
                    onActivate={() => setActiveSlug(project.slug)}
                  />
                );
              })}

              {/* Legacy: earlier work, folded away until asked for. */}
              {legacy.length > 0 && (
                <div className="mt-10">
                  <button
                    type="button"
                    aria-expanded={legacyOpen}
                    aria-controls="archive-legacy"
                    onClick={() => setLegacyOpen((o) => !o)}
                    data-hud-target="ARCH.LEGACY"
                    className="w-full flex items-center justify-between gap-4 h-12 pl-6 pr-4 border border-slate-800 hover:border-[#3B82F6] text-left transition-colors group"
                  >
                    <span className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-slate-300 group-hover:text-[#3B82F6] transition-colors">
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-300 ${legacyOpen ? "rotate-90" : ""}`}
                      />
                      Earlier work // {pad(legacy.length)} Records
                    </span>
                    <span className="hidden sm:block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      {legacyOpen ? "Collapse" : "Kept as a record"}
                    </span>
                  </button>
                  <div
                    id="archive-legacy"
                    inert={!legacyOpen}
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                      legacyOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <ul className="overflow-hidden">
                      {legacy.map((project, i) => (
                        <LegacyRow key={project.slug} project={project} target={`LGCY.${pad(i + 1)}`} />
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {active && (
              <div className="hidden xl:block xl:col-span-4">
                <Monitor project={active} />
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-wrap items-center justify-between gap-4"
          >
            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
              EOF // End of Logs
            </p>
            <a
              href="https://github.com/Abubakr-Alsheikh"
              target="_blank"
              rel="noreferrer"
              data-hud-target="ARCH.REPOSITORY"
              className="flex items-center gap-2 text-[#3B82F6] hover:text-[#F97316] font-mono text-xs uppercase tracking-widest transition-colors group"
            >
              Inspect Full Repository
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
