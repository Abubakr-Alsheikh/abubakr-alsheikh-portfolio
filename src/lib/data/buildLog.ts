/**
 * Build log streamed by `CompileStream` as each section comes into view.
 *
 * Keyed by the section's DOM id. Timestamps are authored rather than generated
 * so the stream is deterministic and reads like a real, ordered build.
 */

export type BuildLogStatus = "ok" | "warn" | "run";

export interface BuildLogLine {
  /** Elapsed build time, e.g. "0.412". */
  t: string;
  /** Verb column, e.g. "resolve". */
  op: string;
  /** Subject of the operation. */
  detail: string;
  status?: BuildLogStatus;
}

export const buildLogData: Record<string, BuildLogLine[]> = {
  hero: [
    { t: "0.004", op: "boot", detail: "hud.runtime -> attached", status: "ok" },
    { t: "0.019", op: "mount", detail: "sections/Hero.tsx" },
    { t: "0.026", op: "link", detail: "trace.field -> 13 rails", status: "ok" },
  ],
  about: [
    { t: "0.118", op: "resolve", detail: "lib/data/about.ts" },
    { t: "0.131", op: "hydrate", detail: "profile.manifest", status: "ok" },
    { t: "0.147", op: "raster", detail: "GeometricJupiter -> svg" },
  ],
  projects: [
    { t: "0.284", op: "resolve", detail: "lib/data/topProjects.ts" },
    { t: "0.301", op: "typecheck", detail: "0 errors, 0 warnings", status: "ok" },
    { t: "0.318", op: "link", detail: "qader.pipeline -> ok", status: "ok" },
    { t: "0.334", op: "emit", detail: "chunk projects 4.2kb", status: "ok" },
  ],
  archive: [
    { t: "0.452", op: "index", detail: "archive/*.meta -> 9 records" },
    { t: "0.468", op: "sort", detail: "by commit.timestamp desc" },
    { t: "0.477", op: "cache", detail: "archive.manifest warm", status: "ok" },
  ],
  journey: [
    { t: "0.601", op: "replay", detail: "journey.timeline 2019..2026" },
    { t: "0.624", op: "verify", detail: "milestone integrity", status: "ok" },
    { t: "0.639", op: "note", detail: "gap 2021 -> deferred", status: "warn" },
  ],
  engine: [
    { t: "0.770", op: "probe", detail: "skills.matrix -> 6 domains" },
    { t: "0.788", op: "bench", detail: "backend.throughput nominal", status: "ok" },
    { t: "0.803", op: "attest", detail: "certifications signed", status: "ok" },
  ],
  contact: [
    { t: "0.912", op: "open", detail: "uplink smtp://contact" },
    { t: "0.930", op: "handshake", detail: "channel secured", status: "ok" },
    { t: "0.944", op: "idle", detail: "awaiting transmission", status: "run" },
  ],
};
