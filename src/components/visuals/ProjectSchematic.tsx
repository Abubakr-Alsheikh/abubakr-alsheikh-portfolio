import React, { useId } from "react";
import type { ProjectKind } from "@/lib/data/archiveProjects";

/**
 * Stand-in preview for a project with no screenshot: a small blueprint of what
 * kind of thing it is, drawn from the project's primary kind. It is a diagram
 * of the category, not a claim about the project's internals, so it carries
 * the slug and year and nothing invented.
 *
 * The viewBox is 16:10 like the screenshots, and the panel keeps that aspect,
 * so nothing is stretched. Strokes are non-scaling and sit near one screen
 * pixel. Static SVG: the only motion is the scan line the row adds on hover.
 */

const LINE = "#334155";
const COLD = "#3B82F6";
const HOT = "#F97316";

const stroke = {
  fill: "none",
  vectorEffect: "non-scaling-stroke" as const,
  strokeWidth: 1,
};

function Box({ x, y, w, h, tone = LINE, label }: {
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: string;
  label?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} stroke={tone} {...stroke} />
      <rect x={x - 0.6} y={y - 0.6} width={1.2} height={1.2} fill={tone} />
      {label && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 1.6}
          textAnchor="middle"
          fill="#94A3B8"
          fontSize={4.4}
          fontFamily="var(--font-mono)"
          letterSpacing={0.4}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function Backend() {
  return (
    <g>
      <Box x={14} y={38} w={30} h={20} tone={COLD} label="API" />
      <Box x={66} y={18} w={30} h={20} label="QUEUE" />
      <Box x={66} y={58} w={30} h={20} tone={HOT} label="DB" />
      <Box x={118} y={18} w={28} h={20} label="WORKER" />
      <path d="M44 48 H55 V28 H66 M55 48 V68 H66 M96 28 H118" stroke={COLD} {...stroke} />
      <path d="M132 38 V68 H96" stroke={LINE} strokeDasharray="2 2" {...stroke} />
    </g>
  );
}

function Ai() {
  const ring = [0, 60, 120, 180, 240, 300].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: 80 + Math.cos(r) * 34, y: 50 + Math.sin(r) * 26 };
  });
  return (
    <g>
      <ellipse cx={80} cy={50} rx={34} ry={26} stroke={LINE} strokeDasharray="1.5 2.5" {...stroke} />
      {ring.map((p, i) => (
        <g key={i}>
          <path d={`M80 50 L${p.x.toFixed(1)} ${p.y.toFixed(1)}`} stroke={i % 2 ? LINE : COLD} {...stroke} />
          <rect x={p.x - 3} y={p.y - 3} width={6} height={6} stroke={i === 1 ? HOT : COLD} {...stroke} fill="#020617" />
        </g>
      ))}
      <Box x={68} y={42} w={24} h={16} tone={HOT} label="LLM" />
    </g>
  );
}

function Web() {
  return (
    <g>
      <rect x={16} y={12} width={128} height={76} stroke={LINE} {...stroke} />
      <path d="M16 20 H144" stroke={LINE} {...stroke} />
      {[21, 26, 31].map((x) => (
        <rect key={x} x={x} y={15} width={2.5} height={2.5} fill={x === 21 ? HOT : LINE} />
      ))}
      <rect x={24} y={27} width={56} height={5} fill={COLD} opacity={0.6} />
      <rect x={24} y={36} width={40} height={3} fill={LINE} />
      <rect x={24} y={42} width={22} height={6} stroke={HOT} {...stroke} />
      <rect x={92} y={27} width={44} height={22} stroke={COLD} {...stroke} />
      {[24, 63, 102].map((x) => (
        <rect key={x} x={x} y={56} width={34} height={24} stroke={LINE} {...stroke} />
      ))}
    </g>
  );
}

function Mobile() {
  return (
    <g>
      <rect x={62} y={8} width={36} height={84} rx={5} stroke={LINE} {...stroke} />
      <path d="M74 12 H86" stroke={LINE} {...stroke} />
      <rect x={67} y={17} width={26} height={12} fill={COLD} opacity={0.5} />
      {[34, 46, 58, 70].map((y, i) => (
        <g key={y}>
          <rect x={67} y={y} width={8} height={8} stroke={i === 0 ? HOT : LINE} {...stroke} />
          <rect x={78} y={y + 1.5} width={15} height={2} fill={LINE} />
          <rect x={78} y={y + 5} width={9} height={1.5} fill={LINE} />
        </g>
      ))}
      <path d="M40 50 H58 M102 50 H120" stroke={COLD} strokeDasharray="2 2" {...stroke} />
    </g>
  );
}

function Course() {
  return (
    <g>
      <rect x={24} y={14} width={112} height={72} stroke={LINE} {...stroke} />
      <path d="M24 22 H136" stroke={LINE} {...stroke} />
      <rect x={130} y={16} width={3.5} height={3.5} stroke={HOT} {...stroke} />
      {[30, 42, 54].map((y) => (
        <g key={y}>
          <rect x={32} y={y} width={22} height={3} fill={LINE} />
          <rect x={58} y={y - 2} width={40} height={7} stroke={COLD} {...stroke} />
        </g>
      ))}
      <rect x={104} y={30} width={24} height={31} stroke={LINE} {...stroke} />
      <rect x={32} y={70} width={20} height={8} stroke={HOT} {...stroke} />
    </g>
  );
}

const DRAWINGS: Record<ProjectKind, () => React.JSX.Element> = {
  backend: Backend,
  ai: Ai,
  web: Web,
  client: Web,
  mobile: Mobile,
  course: Course,
};

function ProjectSchematic({ kind, slug, year }: { kind: ProjectKind; slug: string; year: number }) {
  const Drawing = DRAWINGS[kind];
  // Many schematics share the page; each grid pattern needs its own id.
  const grid = `grid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id={grid} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0 H0 V10" stroke="#0f172a" {...stroke} />
        </pattern>
      </defs>
      <rect width="160" height="100" fill={`url(#${grid})`} />
      <Drawing />
      <text x={6} y={96} fill="#94A3B8" fontSize={4} fontFamily="var(--font-mono)" letterSpacing={0.5}>
        {`${slug.toUpperCase()} // ${year}`}
      </text>
    </svg>
  );
}

export default React.memo(ProjectSchematic);
