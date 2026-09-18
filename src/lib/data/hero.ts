export interface HeroSpec {
  /** Short verb, shown as the row's key. */
  sys: string;
  label: string;
}

export const heroData = {
  /** The page's one availability signal. Deliberately open-ended. */
  status: "Open to new challenges",
  title1: "Engineering",
  title2: "systems &",
  title3: "interfaces.",
  lead: "I'm Abubakr Alsheikh, a systems-focused software engineer.",
  /**
   * How the work gets done, not which tools it uses: the stack changes per
   * project, and the full skill list lives in the Engine section. Each line
   * restates something about.ts or journey.ts already says.
   */
  specs: [
    { sys: "DESIGN", label: "systems, APIs & data models" },
    { sys: "BUILD", label: "end to end, on the stack that fits" },
    { sys: "SHIP", label: "to production, and keep it running" },
  ] satisfies HeroSpec[],
  primaryAction: "View my work",

  /**
   * The local-time instrument beside the profile card. Nothing biographical
   * goes here: rank, degrees and the rest are covered in About, and the hero
   * should not repeat them.
   */
  telemetry: {
    base: {
      city: "Aleppo, SY",
      timeZone: "Asia/Damascus",
      offset: "UTC+3",
    },
  },
};
