"use client";

import Hologram, { type HoloRun } from "./Hologram";
import { nanoSystem } from "@/lib/data/nanoSystem";

/**
 * NanoManga's drawing board beside its hologram. It shows what each stage makes:
 * the JSON plan, a character sheet, then manga pages that ink in panel by panel.
 * Take visual memory offline and the face changes in every panel, which is the
 * problem the project solves, seen instead of explained. Drawn here as line art,
 * standing in for the model's output.
 */

const PLAN_JSON = [
  "{",
  '  "title": "Dead Letters",',
  '  "characters": [{',
  '    "name": "Mio",',
  '    "look": "short hair, courier cap"',
  "  }],",
  '  "environments": ["night street"],',
  '  "plot": ["page 1", "page 2"]',
  "}",
];

/** One head. `variant` 0 is Mio; the others are who a forgetful model draws. */
function Head({ cx, cy, r, variant, tone }: { cx: number; cy: number; r: number; variant: number; tone: string }) {
  const eye = r * 0.32;
  return (
    <g fill="none" stroke={tone} strokeWidth={1}>
      <circle cx={cx} cy={cy} r={r} />
      {variant === 0 && (
        <>
          {/* Courier cap and a short fringe. */}
          <path d={`M${cx - r} ${cy - r * 0.2} A${r} ${r} 0 0 1 ${cx + r} ${cy - r * 0.2} Z`} fill={tone} fillOpacity={0.35} />
          <path d={`M${cx + r * 0.7} ${cy - r * 0.2} L${cx + r * 1.5} ${cy - r * 0.05}`} />
        </>
      )}
      {variant === 1 && (
        // Long hair.
        <path d={`M${cx - r} ${cy} C${cx - r * 1.5} ${cy + r * 1.3} ${cx - r * 0.8} ${cy + r * 1.5} ${cx - r * 0.7} ${cy + r * 1.2} M${cx + r} ${cy} C${cx + r * 1.5} ${cy + r * 1.3} ${cx + r * 0.8} ${cy + r * 1.5} ${cx + r * 0.7} ${cy + r * 1.2} M${cx - r} ${cy - r * 0.1} Q${cx} ${cy - r * 1.5} ${cx + r} ${cy - r * 0.1}`} />
      )}
      {variant === 2 && (
        // Spikes.
        <path d={`M${cx - r} ${cy - r * 0.3} L${cx - r * 0.7} ${cy - r * 1.5} L${cx - r * 0.2} ${cy - r * 0.9} L${cx + r * 0.2} ${cy - r * 1.7} L${cx + r * 0.5} ${cy - r * 0.9} L${cx + r} ${cy - r * 1.4} L${cx + r} ${cy - r * 0.3}`} />
      )}
      {variant === 3 && (
        // Bald, with glasses.
        <path d={`M${cx - r * 0.7} ${cy} h${r * 0.5} M${cx + r * 0.2} ${cy} h${r * 0.5} M${cx - r * 0.2} ${cy} h${r * 0.4}`} />
      )}
      <circle cx={cx - eye} cy={cy + r * 0.12} r={r * 0.1} fill={tone} stroke="none" />
      <circle cx={cx + eye} cy={cy + r * 0.12} r={r * 0.1} fill={tone} stroke="none" />
      <path d={`M${cx - r * 0.2} ${cy + r * 0.5} Q${cx} ${cy + r * 0.66} ${cx + r * 0.2} ${cy + r * 0.5}`} />
    </g>
  );
}

/** Panels as [x, y, width, height] in the page's 90x120 box. */
const PANELS: [number, number, number, number][] = [
  [4, 4, 46, 46],
  [54, 4, 32, 46],
  [4, 54, 82, 62],
];

function Page({
  number,
  inked,
  drift,
}: {
  number: number;
  inked: boolean;
  /** No visual memory: a different face in every panel. */
  drift: boolean;
}) {
  return (
    <figure className="h-full min-h-0 min-w-0 flex-1 flex flex-col">
      <svg viewBox="0 0 90 120" preserveAspectRatio="xMidYMid meet" className="flex-1 min-h-0 w-full" aria-hidden="true">
        {PANELS.map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="#0B1226" stroke={inked ? "#94A3B8" : "#334155"} strokeWidth={1} />
            <g
              className="transition-opacity duration-500"
              style={{ opacity: inked ? 1 : 0, transitionDelay: `${i * 450}ms` }}
            >
              <Head
                cx={x + w / 2}
                cy={y + h * 0.48}
                r={Math.min(w, h) * 0.26}
                variant={drift ? ((number + i) % 3) + 1 : 0}
                tone={drift ? "#EF4444" : "#E2E8F0"}
              />
            </g>
          </g>
        ))}
      </svg>
      <figcaption className={`shrink-0 text-center text-[8px] tracking-widest ${drift && inked ? "text-red-400" : "text-slate-400"}`}>
        PAGE {number}{inked && drift ? " · NO MEMORY" : ""}
      </figcaption>
    </figure>
  );
}

function DrawingBoard({ run }: { run: HoloRun }) {
  const id = run.scenario.id;
  const step = run.steps[run.stepIndex];
  const reachedPage = step?.to === "page" || run.finished;
  const memoryOff = run.offline.has("memory");

  return (
    <div className="h-full flex flex-col">
      <div className="h-6 shrink-0 flex items-center justify-between px-2 border-b border-slate-800 text-[9px] tracking-widest text-slate-400">
        <span>DRAWING BOARD</span>
        <span className="text-[#F97316]">{id === "plan" ? "plan.json" : id === "sheets" ? "sheet_mio" : "pages"}</span>
      </div>
      <div className="flex-1 min-h-0 p-2">
        {id === "plan" && (
          <pre className="h-full overflow-hidden text-[9px] leading-[13px] text-slate-300 whitespace-pre-wrap">
            {step?.to === "plan" || run.finished ? PLAN_JSON.join("\n") : step?.to === "editor" ? PLAN_JSON.slice(0, 4).join("\n") : "waiting for the editor..."}
          </pre>
        )}
        {id === "sheets" && (
          <svg viewBox="0 0 90 120" preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden="true">
            <rect x={4} y={4} width={82} height={112} fill="#0B1226" stroke="#94A3B8" strokeWidth={1} strokeDasharray={run.finished ? undefined : "3 3"} />
            {(step?.to === "sheets" || run.finished) && (
              <>
                <Head cx={30} cy={40} r={15} variant={0} tone="#E2E8F0" />
                <Head cx={64} cy={40} r={11} variant={0} tone="#94A3B8" />
                <path d="M18 112 L22 72 Q30 62 38 72 L42 112 M58 112 L60 72 Q64 66 70 72 L72 112" fill="none" stroke="#94A3B8" strokeWidth={1} />
                <text x={45} y={16} fill="#94A3B8" fontSize={6} textAnchor="middle" letterSpacing={1}>MIO</text>
              </>
            )}
          </svg>
        )}
        {(id === "page1" || id === "page2") && (
          <div className="h-full flex flex-row sm:flex-col gap-2">
            <Page number={1} inked={id === "page2" || reachedPage} drift={memoryOff} />
            <Page number={2} inked={id === "page2" && reachedPage} drift={memoryOff} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function NanoMangaVisual() {
  return <Hologram system={nanoSystem} instrument={(run) => <DrawingBoard run={run} />} />;
}
