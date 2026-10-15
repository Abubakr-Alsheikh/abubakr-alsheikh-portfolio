/**
 * The Services section: what a client can hire Abubakr for.
 *
 * Written for people who do not write code. Each package says what the
 * client gets in plain words first; the tools sit in `includes`, and every
 * package points at work already on this page (`proof`), so no claim stands
 * on its own.
 *
 * Prices and timelines are the owner's business decisions. A package with no
 * `startingAt` shows "Scoped per project"; fill it in (e.g. "$400") and the
 * card shows it. Never invent a figure here.
 */

export type ServiceIcon = "app" | "api" | "site" | "ai" | "ops";

export interface ServiceProof {
  label: string;
  /** A case study (`/projects/...`) or an anchor on the page (`#archive`). */
  href: string;
}

export interface Service {
  /** Reticle and readout id, e.g. "SVC.01". */
  id: string;
  title: string;
  icon: ServiceIcon;
  /** What the client gets, in plain words. */
  summary: string;
  includes: string[];
  proof: ServiceProof[];
  /** e.g. "$400". Leave out until the owner sets a price. */
  startingAt?: string;
  /** e.g. "2-3 weeks". Leave out until the owner sets one. */
  timeline?: string;
}

export interface ProcessStep {
  title: string;
  body: string;
}

export interface ServicesContent {
  kicker: string;
  titleLead: string;
  titleTrail: string;
  intro: string;
  arabicFirst: { label: string; body: string };
  services: Service[];
  custom: { title: string; body: string; action: string };
  process: ProcessStep[];
  quote: {
    unpriced: string;
    action: string;
    message: (service: string) => string;
  };
}

export const servicesData: ServicesContent = {
  kicker: "Service Manifest // Open Contracts",
  titleLead: "The",
  titleTrail: "Launchpad.",
  intro:
    "You bring the problem; I build the thing that solves it and keep it running. Every package below links to work you can open on this page.",

  arabicFirst: {
    label: "Arabic-first // RTL by default",
    body: "Right-to-left layouts and Arabic content are the starting point, with English as the second language, from the database to the screen. Qader, Mizan, Falak HR and Ghosn were all built this way.",
  },

  services: [
    {
      id: "SVC.01",
      title: "Web App or MVP",
      icon: "app",
      summary:
        "Your idea as a working product: sign-up, a dashboard and the core feature, live on the internet and ready for real users.",
      includes: [
        "Accounts, roles and permissions",
        "Admin dashboard for your team",
        "Database and API built to grow",
        "Deployed on your own domain",
      ],
      proof: [
        { label: "Mizan", href: "/projects/mizan" },
        { label: "Falak HR", href: "#archive" },
      ],
    },
    {
      id: "SVC.02",
      title: "Backend & API",
      icon: "api",
      summary:
        "The engine behind an app or website: data stored safely, fast answers, and the other services you use connected to it.",
      includes: [
        "Documented REST API",
        "PostgreSQL design and migrations",
        "Background jobs and scheduled tasks",
        "Third-party integrations",
      ],
      proof: [
        { label: "Qader", href: "/projects/qader" },
        { label: "NexusDesk AI", href: "#archive" },
      ],
    },
    {
      id: "SVC.03",
      title: "Landing Page or Company Site",
      icon: "site",
      summary:
        "A fast site that explains what you do and turns visitors into messages, in Arabic, English or both.",
      includes: [
        "Looks right on every screen size",
        "Arabic and English, right to left done properly",
        "Contact and booking forms",
        "Fast loading and search-engine basics",
      ],
      proof: [
        { label: "Coaching Booking Site", href: "#archive" },
        { label: "Falak HR", href: "#archive" },
      ],
    },
    {
      id: "SVC.04",
      title: "AI Features",
      icon: "ai",
      summary:
        "AI where it saves time: a chat that answers from your own content, voice or photo input, or a bot that does the routine work.",
      includes: [
        "Assistants that answer from your data",
        "Telegram bots",
        "Voice notes and photos turned into data",
        "Fallback between AI providers",
      ],
      proof: [
        { label: "Mizan", href: "/projects/mizan" },
        { label: "NanoManga Studio", href: "/projects/nanomanga-studio" },
        { label: "Max CLI", href: "/projects/max-cli" },
      ],
    },
    {
      id: "SVC.05",
      title: "Deployment & Care",
      icon: "ops",
      summary:
        "Keep it online and up to date: hosting set up properly, updates shipped safely, and problems caught before your users see them.",
      includes: [
        "Server setup with Docker and Nginx",
        "Automatic tests and deploys",
        "Monitoring and backups",
        "Monthly maintenance",
      ],
      proof: [
        { label: "Qader", href: "/projects/qader" },
        { label: "Mizan", href: "/projects/mizan" },
        { label: "Max CLI", href: "/projects/max-cli" },
      ],
    },
  ],

  custom: {
    title: "Not on the list?",
    body: "Describe the problem, not the stack. If I'm not the right fit for it, I'll tell you.",
    action: "Describe your project",
  },

  process: [
    {
      title: "Brief",
      body: "You describe the goal. I come back with questions, not a template.",
    },
    {
      title: "Plan",
      body: "Scope, stack, price and timeline agreed in writing before work starts.",
    },
    {
      title: "Build",
      body: "You follow progress on a live preview link, not screenshots.",
    },
    {
      title: "Launch",
      body: "Deployed, handed over with access and notes, and supported if you want it.",
    },
  ],

  quote: {
    /** Shown on a card with no `startingAt`. */
    unpriced: "Scoped per project",
    action: "Get a quote",
    /** Written into the contact form's message box. */
    message: (service: string) =>
      `Hi Abubakr, I'm interested in: ${service}.\n\nWhat I have in mind: `,
  },
};
