"use client";

import React from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { ProjectDiffLine } from "@/lib/data/topProjects";

/**
 * A patch hunk that applies itself the first time the card is read.
 *
 * Each line is laid out in full from the first paint (zero shift) and hidden
 * under a shutter. On view, one state flip starts a chain of CSS transitions:
 * a write head sweeps each shutter off in turn, removed lines then strike
 * through and dim, added lines take their tint and gutter bar. The shutter
 * moves by transform, so the whole reveal runs on the compositor.
 *
 * It replaced a per-character typewriter that set React state every 9ms per
 * card: a full re-render of the hunk ~110 times a second while it played.
 */

interface CodeDiffProps {
  file: string;
  lines: ProjectDiffLine[];
}

/** Stagger between lines, and the wipe each line takes. */
const LINE_STEP_MS = 140;
const WIPE_MS = 420;
/** Wait after the card lands before the first line goes. */
const LEAD_MS = 250;

const CodeDiff = React.memo(({ file, lines }: CodeDiffProps) => {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });
  const [settled, setSettled] = React.useState(false);

  const added = lines.filter((l) => l.sign === "+").length;
  const removed = lines.filter((l) => l.sign === "-").length;
  const applied = inView || !!reduce;

  // The header flips once the last line has landed. One timer, one render.
  React.useEffect(() => {
    if (!applied) return;
    if (reduce) {
      setSettled(true);
      return;
    }
    const total = LEAD_MS + (lines.length - 1) * LINE_STEP_MS + WIPE_MS;
    const t = window.setTimeout(() => setSettled(true), total);
    return () => window.clearTimeout(t);
  }, [applied, reduce, lines.length]);

  return (
    <div
      ref={ref}
      data-applied={applied || undefined}
      className="group/diff mb-10 border border-slate-800/80 bg-[#020617]"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 px-3 py-1.5 font-mono text-[9px] tracking-widest">
        <span className="truncate text-slate-600">{file}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-[#3B82F6]">+{added}</span>
          <span className="text-[#F97316]">-{removed}</span>
          <span
            className={`transition-colors duration-500 ${settled ? "text-slate-500" : "text-slate-700"}`}
          >
            {settled ? "APPLIED" : "STAGED"}
          </span>
        </span>
      </div>

      <div className="overflow-x-auto py-2">
        {lines.map((line, i) => {
          const isAdd = line.sign === "+";
          const isDel = line.sign === "-";
          const delay = reduce ? 0 : LEAD_MS + i * LINE_STEP_MS;
          // Strike and tint wait for this line's own wipe to finish.
          const after = reduce ? 0 : delay + WIPE_MS - 80;
          // Indentation stays out of the strike, as in a real diff view.
          const indent = line.text.match(/^\s*/)?.[0] ?? "";
          const code = line.text.slice(indent.length);

          return (
            <div
              key={i}
              className={`relative flex w-max min-w-full items-start gap-2 overflow-hidden px-3 font-mono text-[10px] leading-[1.7] whitespace-pre transition-colors duration-500 ${
                isAdd
                  ? "group-data-applied/diff:bg-[#3B82F6]/[0.07]"
                  : isDel
                    ? "group-data-applied/diff:bg-[#F97316]/[0.04]"
                    : ""
              }`}
              style={{ transitionDelay: `${after}ms` }}
            >
              {/* Gutter bar: grows in on changed lines once written. */}
              {(isAdd || isDel) && (
                <span
                  className={`absolute left-0 top-0 bottom-0 w-px origin-top scale-y-0 transition-transform duration-300 group-data-applied/diff:scale-y-100 ${isAdd ? "bg-[#3B82F6]" : "bg-[#F97316]/60"}`}
                  style={{ transitionDelay: `${after}ms` }}
                />
              )}

              <span
                className={`w-2 shrink-0 select-none ${isAdd ? "text-[#3B82F6]" : isDel ? "text-[#F97316]" : "text-slate-700"}`}
              >
                {line.sign === " " ? "" : line.sign}
              </span>
              <span className="shrink-0">{indent}</span>
              <span
                className={`-ml-2 transition-colors duration-500 ${
                  isAdd
                    ? "text-slate-300"
                    : isDel
                      ? "text-slate-400 line-through decoration-transparent group-data-applied/diff:text-slate-600 group-data-applied/diff:decoration-[#F97316]/50"
                      : "text-slate-500"
                }`}
                style={{ transitionDelay: `${after}ms` }}
              >
                {code}
              </span>

              {/* Shutter. Its left edge is the write head: it lights as the
                  line's turn comes, slides right and off, and uncovers the
                  line as it passes. */}
              <span
                className="pointer-events-none absolute inset-0 border-l border-transparent bg-[#020617] transition-[transform,border-color] ease-[cubic-bezier(0.65,0,0.35,1)] group-data-applied/diff:translate-x-[101%] group-data-applied/diff:border-[#F97316] motion-reduce:hidden"
                style={{
                  transitionDuration: `${WIPE_MS}ms, 0ms`,
                  transitionDelay: `${delay}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

CodeDiff.displayName = "CodeDiff";

export default CodeDiff;
