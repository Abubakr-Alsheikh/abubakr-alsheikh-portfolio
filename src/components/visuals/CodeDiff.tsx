"use client";

import React from "react";
import { useInView, useReducedMotion } from "framer-motion";
import type { ProjectDiffLine } from "@/lib/data/topProjects";

/**
 * A patch hunk that types itself out the first time the card is read.
 *
 * Only the line currently being written holds a cursor, and only one timer runs
 * per card — it stops itself the moment the hunk is complete, so a page of
 * cards costs nothing once they have all played.
 */

interface CodeDiffProps {
  file: string;
  lines: ProjectDiffLine[];
}

/** Milliseconds per character. Fast enough to read as a machine writing. */
const TYPE_MS = 9;

/** Extra beat between lines, so the hunk has a rhythm instead of a blur. */
const LINE_GAP_MS = 90;

const SIGN_STYLE: Record<string, { gutter: string; text: string; bar: string }> =
  {
    "+": {
      gutter: "text-[#3B82F6]",
      text: "text-slate-300",
      bar: "bg-[#3B82F6]/40",
    },
    "-": {
      gutter: "text-[#F97316]",
      text: "text-slate-500 line-through decoration-[#F97316]/30",
      bar: "bg-[#F97316]/40",
    },
    " ": { gutter: "text-slate-700", text: "text-slate-500", bar: "bg-transparent" },
  };

const CodeDiff = React.memo(({ file, lines }: CodeDiffProps) => {
  const prefersReducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });

  const total = React.useMemo(
    () => lines.reduce((n, l) => n + l.text.length, 0),
    [lines],
  );

  // One number drives the whole hunk: how many characters of it are written.
  const [written, setWritten] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;

    if (prefersReducedMotion) {
      setWritten(total);
      return;
    }

    let handle: number;
    let count = 0;

    const step = () => {
      count += 1;
      setWritten(count);
      if (count >= total) return;

      // Pause when the character just written completed a line.
      let consumed = 0;
      let atBoundary = false;
      for (const line of lines) {
        consumed += line.text.length;
        if (consumed === count) {
          atBoundary = true;
          break;
        }
      }

      handle = window.setTimeout(step, atBoundary ? LINE_GAP_MS : TYPE_MS);
    };

    handle = window.setTimeout(step, 220);
    return () => window.clearTimeout(handle);
  }, [inView, prefersReducedMotion, total, lines]);

  // Split the single character budget back across the lines.
  let remaining = written;
  const revealed = lines.map((line) => {
    const take = Math.max(0, Math.min(line.text.length, remaining));
    remaining -= take;
    return { line, take };
  });

  const done = written >= total;

  return (
    <div
      ref={ref}
      className="mb-10 border border-slate-800/80 bg-[#020617]"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-1.5">
        <span className="font-mono text-[9px] tracking-widest text-slate-600">
          {file}
        </span>
        <span className="font-mono text-[9px] tracking-widest text-slate-700">
          {done ? "PATCH APPLIED" : "WRITING"}
        </span>
      </div>

      <div className="overflow-x-auto px-3 py-2.5">
        {revealed.map(({ line, take }, i) => {
          const style = SIGN_STYLE[line.sign] ?? SIGN_STYLE[" "];
          const typing = take > 0 && take < line.text.length;

          return (
            <div
              key={i}
              className="flex items-start gap-2 font-mono text-[10px] leading-[1.6] whitespace-pre"
            >
              <span className={`w-2 shrink-0 select-none ${style.gutter}`}>
                {line.sign === " " ? "" : line.sign}
              </span>
              <span className={style.text}>
                {line.text.slice(0, take)}
                {typing && <span className="text-[#F97316]">▌</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CodeDiff.displayName = "CodeDiff";

export default CodeDiff;
