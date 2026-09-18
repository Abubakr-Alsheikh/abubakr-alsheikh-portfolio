"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  buildLogData,
  type BuildLogLine,
  type BuildLogStatus,
} from "@/lib/data/buildLog";

/**
 * A build log that keeps compiling the page as you scroll it.
 *
 * Each section pushes its own scripted lines onto the stream the first time it
 * reaches the middle of the viewport, and the newest line types itself out a
 * character at a time. Revisiting a section does not replay it — a real build
 * log does not repeat work it has already done.
 *
 * Sits bottom-left, inset past the canopy's altitude ladder and clear of the
 * G-load strip (bottom-centre). Desktop only: at phone width it would fight
 * the content.
 */

/** Lines kept on screen. Older lines fall off the top. */
const WINDOW = 5;

/** Milliseconds per character of the line currently being typed. */
const TYPE_MS = 18;

/** Pause between one line finishing and the next starting. */
const LINE_GAP_MS = 140;

const STATUS_STYLE: Record<BuildLogStatus, string> = {
  ok: "text-[#3B82F6]",
  warn: "text-[#F97316]",
  run: "text-slate-500",
};

const STATUS_MARK: Record<BuildLogStatus, string> = {
  ok: "ok",
  warn: "!!",
  run: "..",
};

interface StreamLine extends BuildLogLine {
  /** Unique across the session so repeated ops still animate independently. */
  key: string;
  /** Characters of `detail` revealed so far. */
  typed: number;
}

const CompileStream = React.memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [lines, setLines] = React.useState<StreamLine[]>([]);

  // Sections already streamed, and the queue still waiting to be typed.
  const seen = React.useRef<Set<string>>(new Set());
  const queue = React.useRef<StreamLine[]>([]);
  const timer = React.useRef<number | null>(null);

  // Pump the queue one character at a time. Self-scheduling rather than a
  // free-running interval, so nothing ticks once the stream is idle.
  const pump = React.useCallback(() => {
    const next = queue.current[0];
    if (!next) {
      timer.current = null;
      return;
    }

    if (next.typed >= next.detail.length) {
      queue.current.shift();
      timer.current = window.setTimeout(pump, LINE_GAP_MS);
      return;
    }

    next.typed += 1;
    const snapshot = { ...next };
    setLines((prev) => {
      const rest = prev.filter((l) => l.key !== snapshot.key);
      return [...rest, snapshot].slice(-WINDOW);
    });

    timer.current = window.setTimeout(pump, TYPE_MS);
  }, []);

  const enqueue = React.useCallback(
    (sectionId: string) => {
      const script = buildLogData[sectionId];
      if (!script || seen.current.has(sectionId)) return;
      seen.current.add(sectionId);

      const staged = script.map((line, i) => ({
        ...line,
        key: `${sectionId}:${i}`,
        // Reduced motion gets the finished text with no typing pass.
        typed: prefersReducedMotion ? line.detail.length : 0,
      }));

      if (prefersReducedMotion) {
        setLines((prev) => [...prev, ...staged].slice(-WINDOW));
        return;
      }

      queue.current.push(...staged);
      if (timer.current === null) pump();
    },
    [pump, prefersReducedMotion],
  );

  React.useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) enqueue(entry.target.id);
        }
      },
      // A band across the middle of the viewport: a section reports in when it
      // is genuinely being read, not when its first pixel clears the fold.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));

    return () => {
      observer.disconnect();
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
      queue.current = [];
    };
  }, [enqueue]);

  if (lines.length === 0) return null;

  return (
    <div
      className="fixed bottom-10 left-28 z-[45] hidden w-[22rem] select-none lg:block"
      aria-hidden="true"
    >
      <div className="mb-1.5 flex items-center gap-2 border-b border-slate-800/60 pb-1">
        <div className="h-1 w-1 bg-[#3B82F6]" />
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-slate-600">
          build.stream
        </span>
      </div>

      <div className="flex flex-col gap-[3px]">
        <AnimatePresence initial={false}>
          {lines.map((line, i) => {
            const isNewest = i === lines.length - 1;
            const typing = line.typed < line.detail.length;

            return (
              <motion.div
                key={line.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{
                  // Older lines recede rather than vanish, so the stream reads
                  // as depth instead of a list that jumps.
                  opacity: isNewest ? 0.9 : 0.15 + (i / lines.length) * 0.35,
                  x: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-baseline gap-2 font-mono text-[9px] leading-tight tabular-nums"
              >
                <span className="text-slate-700">[{line.t}]</span>
                <span className="w-[4.5rem] shrink-0 text-slate-500">
                  {line.op}
                </span>
                <span className="truncate text-slate-400">
                  {line.detail.slice(0, line.typed)}
                  {typing ? (
                    <span className="text-[#F97316]">_</span>
                  ) : line.status ? (
                    <span className={`ml-2 ${STATUS_STYLE[line.status]}`}>
                      {STATUS_MARK[line.status]}
                    </span>
                  ) : null}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
});

CompileStream.displayName = "CompileStream";

export default CompileStream;
