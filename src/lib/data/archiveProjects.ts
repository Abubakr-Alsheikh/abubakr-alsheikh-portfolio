/**
 * Everything that is not a featured project, in two tiers.
 *
 * `archive` rows are real projects worth a look: they carry a preview, a
 * filterable kind and every link that still works. `legacy` rows are earlier
 * work kept as a record, folded away under the archive and shown one line
 * each. A project whose live site died keeps its source link and loses the
 * live one; never link a host that no longer serves the app.
 *
 * Client and company work follows the Qader rule: the general shape and the
 * tools, never the client's name, contacts or internal features. Code that
 * belongs to someone else gets no link at all.
 */

export type ProjectKind = "ai" | "backend" | "web" | "client" | "mobile" | "course";

/** Status flags shown as tags beside the kind. */
export type ProjectFlag = "unfinished" | "hackathon" | "team" | "company";

export interface ArchiveLinks {
  /** The running product. Only when it still works. */
  live?: string;
  /** Public source. Never for client or company code. */
  source?: string;
  /** Slug of this site's case study, when one exists. */
  caseStudy?: string;
}

export interface ArchiveProject {
  slug: string;
  title: string;
  year: number;
  tier: "archive" | "legacy";
  /** The first kind is the primary one; every kind is a filter match. */
  kinds: ProjectKind[];
  flags?: ProjectFlag[];
  /** One or two sentences. Legacy rows show only the first. */
  summary: string;
  stack: string[];
  links: ArchiveLinks;
  /** A 640x400 screenshot in public/. Without one the row draws a schematic. */
  preview?: string;
}

export const archiveProjectsData: ArchiveProject[] = [
  {
    slug: "nexusdesk-ai",
    title: "NexusDesk AI",
    year: 2026,
    tier: "archive",
    kinds: ["backend", "ai"],
    summary:
      "Support-ticket service that triages each ticket with an LLM on a background queue. The model's JSON is validated against the database enums, and failed jobs retry with backoff before a ticket is marked failed.",
    stack: ["Express", "TypeScript", "Prisma", "PostgreSQL", "BullMQ", "Zod", "Jest"],
    links: { source: "https://github.com/Abubakr-Alsheikh/nexusdesk-ai" },
  },
  {
    slug: "little-lemon-mobile",
    title: "Little Lemon Android",
    year: 2026,
    tier: "archive",
    kinds: ["mobile", "course"],
    summary:
      "Restaurant app from the Meta Android capstone: onboarding, a searchable menu with category filters and a profile screen, with the menu fetched over the network and cached locally.",
    stack: ["Kotlin", "Jetpack Compose", "Ktor", "Room"],
    links: { source: "https://github.com/Abubakr-Alsheikh/little-lemon-mobile" },
  },
  {
    slug: "falak-hr",
    title: "Falak HR",
    year: 2025,
    tier: "archive",
    kinds: ["client", "web", "backend"],
    flags: ["unfinished"],
    summary:
      "Arabic HR platform for a Saudi firm: a public site with a four-step service-request wizard and job applications, and a dashboard with role-based permissions. The engagement ended before launch; the public site is still up.",
    stack: ["React", "TypeScript", "Tailwind CSS", "Django REST Framework", "JWT"],
    links: { live: "https://falak-human-resources.netlify.app/" },
    preview: "/projects/previews/falak-hr.webp",
  },
  {
    slug: "smart-markdown-pro",
    title: "Smart Markdown Pro",
    year: 2025,
    tier: "archive",
    kinds: ["ai", "web"],
    summary:
      "Local-first markdown editor with AI formatting, right-to-left support and PDF export rendered on the server in headless Chromium.",
    stack: ["Next.js", "TypeScript", "Zustand", "Puppeteer", "KaTeX"],
    links: { source: "https://github.com/Abubakr-Alsheikh/smart-markdown-pro" },
    preview: "/projects/previews/smart-markdown-pro.webp",
  },
  {
    slug: "promptcraft-dungeon",
    title: "PromptCraft: Dungeon Delver",
    year: 2025,
    tier: "archive",
    kinds: ["ai", "web"],
    summary:
      "Text adventure narrated by an LLM, running a local Ollama model with Gemini as the fallback and parsing every reply into strict Pydantic schemas.",
    stack: ["Flask", "Next.js", "Zustand", "Pydantic"],
    links: { source: "https://github.com/Abubakr-Alsheikh/promptcraft-dungeon" },
    preview: "/projects/previews/promptcraft-dungeon.webp",
  },
  {
    slug: "ghosn",
    title: "Ghosn (غصن): Smart Farming",
    year: 2025,
    tier: "archive",
    kinds: ["web", "ai"],
    flags: ["hackathon", "team"],
    summary:
      "SalamHack 2025 entry built by a team of four. My part was the React frontend: a multi-step form for farm data, the cultivation-plan view and the live chat against the .NET API.",
    stack: ["React", "Material UI", "Axios", ".NET"],
    links: { source: "https://github.com/Abubakr-Alsheikh/Ghosn" },
    preview: "/projects/previews/ghosn.webp",
  },
  {
    slug: "coaching-booking",
    title: "Coaching Booking Site",
    year: 2025,
    tier: "archive",
    kinds: ["client", "web", "backend"],
    summary:
      "Booking site for a life coach: session slots generated across time zones, checks against double booking, and email notifications, all managed from the Django admin.",
    stack: ["Django", "Tailwind CSS", "Flowbite"],
    links: {},
  },
  {
    slug: "telegram-assistant",
    title: "Telegram Assistant Bot",
    year: 2025,
    tier: "archive",
    kinds: ["ai", "backend"],
    flags: ["company"],
    summary:
      "Asynchronous Telegram bot built for a company, backed by OpenAI and SQLite. The code belongs to the client, so there is no link.",
    stack: ["Python", "Asyncio", "OpenAI", "SQLite"],
    links: {},
  },
  {
    slug: "school-management-system",
    title: "School Management System",
    year: 2024,
    tier: "archive",
    kinds: ["course"],
    summary:
      "University assignment: a Windows Forms app for school records on Oracle, with every query routed through one parameterised database gateway.",
    stack: ["C#", "Windows Forms", "Oracle", "SQL"],
    links: {
      source: "https://github.com/Abubakr-Alsheikh/school-management-system",
      caseStudy: "school-management-system",
    },
  },

  // ---- Legacy: earlier work, one line each ----------------------------------
  {
    slug: "askvid",
    title: "AskVid",
    year: 2024,
    tier: "legacy",
    kinds: ["ai", "web"],
    summary: "Upload a video, get a transcript, a summary and answers to questions about it.",
    stack: ["Django", "AssemblyAI", "Gemini"],
    links: {
      source: "https://github.com/Abubakr-Alsheikh/e-commerce-website/tree/main/ask_yourtube",
    },
  },
  {
    slug: "e-commerce-store",
    title: "E-Commerce Store",
    year: 2024,
    tier: "legacy",
    kinds: ["web", "backend"],
    summary: "Django storefront with a cart, coupons, orders and Stripe checkout.",
    stack: ["Django", "Bootstrap", "Stripe"],
    links: { source: "https://github.com/Abubakr-Alsheikh/e-commerce-website" },
  },
  {
    slug: "screen-scene",
    title: "Screen Scene",
    year: 2024,
    tier: "legacy",
    kinds: ["web"],
    summary: "Movie discovery site with search on top of the TMDB API.",
    stack: ["Django", "Tailwind CSS", "TMDB API"],
    links: {
      source: "https://github.com/Abubakr-Alsheikh/e-commerce-website/tree/main/screen_scene",
    },
  },
  {
    slug: "intellido",
    title: "IntelliDo",
    year: 2024,
    tier: "legacy",
    kinds: ["ai", "web"],
    summary: "To-do app that pulls tasks out of pasted text with an LLM.",
    stack: ["React", "Redux Toolkit", "Material UI"],
    links: { source: "https://github.com/Abubakr-Alsheikh/intellido" },
  },
  {
    slug: "book-inventory",
    title: "Book Inventory System",
    year: 2024,
    tier: "legacy",
    kinds: ["web", "course"],
    summary: "Inventory app with full CRUD and role-based access.",
    stack: ["ASP.NET", "C#", "SQL Server"],
    links: { source: "https://github.com/Abubakr-Alsheikh/online-book-inventory-system" },
  },
  {
    slug: "kuu-library",
    title: "Kuu Library",
    year: 2024,
    tier: "legacy",
    kinds: ["web", "backend"],
    summary: "Library system with search, categories, an audit log and a staff dashboard.",
    stack: ["Django"],
    links: { source: "https://github.com/Abubakr-Alsheikh/my-kuu-library" },
  },
  {
    slug: "sama-media",
    title: "Sama Media Website",
    year: 2023,
    tier: "legacy",
    kinds: ["web", "course"],
    summary: "Graduation project: a company website with its own admin panel for the content.",
    stack: ["PHP", "MySQL", "JavaScript"],
    links: { source: "https://github.com/Abubakr-Alsheikh/sama-media-website" },
  },
];
