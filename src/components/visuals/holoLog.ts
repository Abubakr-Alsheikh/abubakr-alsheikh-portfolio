import type { HoloRun } from "./Hologram";

/**
 * A run's log so far, in order, with its question and answer printed where they
 * happened. A step past the question was approved, even if the visitor walked
 * there with the Next button and never answered it.
 */
export function logLines(run: HoloRun): string[] {
  const lines: string[] = [];
  run.steps.slice(0, run.stepIndex + 1).forEach((step, i) => {
    if (step.log) lines.push(...step.log);
    if (!step.confirm) return;
    lines.push(`? ${step.confirm.question} [y/N]`);
    const answered = run.answer ?? (i < run.stepIndex ? true : null);
    if (answered !== null) lines.push(answered ? "> y" : "> n");
  });
  return lines;
}
