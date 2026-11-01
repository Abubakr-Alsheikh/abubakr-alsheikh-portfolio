"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { HOLO_SIZE, HOLO_SIZE_WITH_INSTRUMENT } from "./holoSize";

/**
 * A project's hologram, loaded when it comes near the screen.
 *
 * Each one is about 1,000 lines of engine and data and draws a few hundred paths,
 * and a visitor may never scroll to most of them. So none are in the page's
 * HTML or its first bundle. The frame holds the panel's exact size until the
 * real thing mounts, so nothing shifts when it does, and the trace rails beside
 * it measure the same page either way.
 */

/** Starts loading this far ahead, so a normal scroll arrives at a drawn panel. */
const LOAD_MARGIN = "900px 0px";

function Frame({ slug }: { slug: string }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full h-full ${slug === "mizan" ? HOLO_SIZE : HOLO_SIZE_WITH_INSTRUMENT} bg-[#020617] border border-slate-800 flex flex-col`}
    >
      <div className="h-8 border-b border-slate-800 flex items-center px-4 gap-2 shrink-0">
        <div className="w-1.5 h-1.5 bg-slate-700" />
        <div className="w-1.5 h-1.5 bg-[#3B82F6]/60" />
        <div className="w-1.5 h-1.5 bg-[#F97316]/60" />
      </div>
    </div>
  );
}

const load = (slug: string, loader: () => Promise<{ default: ComponentType }>) =>
  dynamic(loader, { ssr: false, loading: () => <Frame slug={slug} /> });

const VISUALS: Record<string, ComponentType> = {
  qader: load("qader", () => import("./QaderVisual")),
  mizan: load("mizan", () => import("./MizanVisual")),
  "max-cli": load("max-cli", () => import("./MaxCLIVisual")),
  "nanomanga-studio": load("nanomanga-studio", () => import("./NanoMangaVisual")),
  "school-management-system": load("school-management-system", () => import("./SchoolManagementVisual")),
};

export default function LazyVisual({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: LOAD_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Visual = VISUALS[slug];
  if (!Visual) return null;
  return (
    <div ref={ref} className="w-full h-full">
      {near ? <Visual /> : <Frame slug={slug} />}
    </div>
  );
}
