/**
 * Long-form write-ups behind /projects/[slug], keyed by `TopProject.slug`.
 *
 * Every sentence here has to trace back to a real source: the project's
 * README, its source tree or commits, the live site, or, for private client
 * work, the owner's own account of it. `sources` lists where each write-up
 * came from, so the next edit can be checked against them. A project without
 * an entry gets no case-study page and no CASE_STUDY button; that beats a
 * page padded out with guesses.
 *
 * Company products (Qader) are not the owner's to disclose. Their entries
 * give the general shape and the tools only: no module counts, internal
 * features, customers, numbers or unreleased work, and no claim that the
 * owner owns the code.
 */

export interface CaseStudyLayer {
  name: string;
  detail: string;
}

export interface CaseStudyDecision {
  title: string;
  body: string;
}

export interface CaseStudyFact {
  value: string;
  label: string;
}

export interface CaseStudy {
  /** One line on what kind of project this was, and where it lives. */
  context: string;
  /** The project in a sentence. */
  summary: string;
  problem: string;
  architecture: CaseStudyLayer[];
  decisions: CaseStudyDecision[];
  /** Headline figures. Left out for company products. */
  facts?: CaseStudyFact[];
  /** Where the content above was taken from. Not rendered. */
  sources: string[];
}

export const caseStudiesData: Record<string, CaseStudy> = {
  qader: {
    context:
      "Company product · full-stack software engineer · live at qader.vip",
    summary:
      "An Arabic-first exam-prep platform for the Saudi market, for students and for schools.",
    problem:
      "Saudi students prepare for national exams. Qader serves them in Arabic by default, right to left, with English as the second language, alongside the teachers, parents and schools around them.",
    architecture: [
      {
        name: "Backend",
        detail:
          "Django and Django REST Framework, organised as modular domain apps behind a documented OpenAPI contract.",
      },
      {
        name: "Real-time and jobs",
        detail:
          "Django Channels for WebSockets, Celery workers for background jobs, and Redis.",
      },
      {
        name: "Data",
        detail: "PostgreSQL with pgvector.",
      },
      {
        name: "Web",
        detail:
          "Next.js, React and strict TypeScript, Arabic first with right-to-left layouts.",
      },
      {
        name: "Infrastructure",
        detail:
          "Docker, nginx, GitHub Actions CI, and Prometheus and Grafana for monitoring.",
      },
    ],
    decisions: [
      {
        title: "A modular backend",
        body: "Each domain lives in its own app, with business logic in a service layer and thin API views on top.",
      },
      {
        title: "Heavy work off the request path",
        body: "Slow jobs run on Celery workers, so API responses stay fast.",
      },
      {
        title: "Real-time where it matters",
        body: "Live features run over WebSockets through Django Channels.",
      },
      {
        title: "Arabic first",
        body: "Right to left is the default layout and English is the second language, on the backend and the web app alike.",
      },
    ],
    sources: [
      "Owner's account of his role (Sep 2026); general structure and tools only",
      "qader.vip",
    ],
  },

  mizan: {
    context: "Own product · free to use · live on Netlify · source private",
    summary:
      "A household money companion: log spending in seconds from Telegram or the web, and get one number back, what you can safely spend today.",
    problem:
      "I kept my family's budget in an Excel sheet for four years, then stopped. Entering a purchase meant opening a laptop and finding the row, and only one person could do it, so the rest of the family never joined in. Mizan's goal is a purchase logged in under five seconds from apps the family already uses, turned into a number everyone trusts.",
    architecture: [
      {
        name: "Clients",
        detail:
          "A Telegram bot that takes text, voice notes and receipt photos, and a right-to-left Next.js PWA with a quick-entry keypad. Both call the same services.",
      },
      {
        name: "API",
        detail:
          "A Hono app mounted inside Next.js at /api/v1, with zod schemas that drive validation, types and the OpenAPI output. Routes stay thin and hand off to a service layer, then to Drizzle repositories.",
      },
      {
        name: "AI",
        detail:
          "The Vercel AI SDK over free tiers: Gemini Flash-Lite, then Gemini Flash, then two Groq models for text; Groq Whisper, then Gladia, then Gemini for voice.",
      },
      {
        name: "Data",
        detail: "Supabase Postgres and Auth through Drizzle, with SQL migrations.",
      },
      {
        name: "Operations",
        detail:
          "Netlify through OpenNext, a service worker built with Serwist, Sentry for errors, and scheduled GitHub Actions for jobs and the weekly backup.",
      },
    ],
    decisions: [
      {
        title: "Code before the model",
        body: "A pattern parser reads the common cases, such as \"bread 500\" or a currency exchange, in Arabic or Latin digits. Only what it cannot read goes to a model, which keeps free quotas for the hard messages.",
      },
      {
        title: "A message never waits on one quota",
        body: "A limit, an outage, a timeout or an answer that misses the schema moves the message to the next provider in the chain. A real bug stops instead, keeps the message for review, and tells the sender the fault is ours.",
      },
      {
        title: "Money keeps the rate of its day",
        body: "Amounts are numeric columns, never floats, and every transaction stores its currency, its rate to the base currency and its base amount. Prices move fast, so history keeps the rate that applied when the money was spent.",
      },
      {
        title: "Access is checked in the service layer",
        body: "The ORM connects with full rights, so database row policies cannot be the guard. Every service checks household membership before it reads or writes.",
      },
      {
        title: "A webhook that answers fast and once",
        body: "The Telegram route checks the secret header in constant time, records each update_id once so a retry is ignored, answers at once and does the work in Next.js after().",
      },
      {
        title: "Weekly encrypted backups",
        body: "A scheduled workflow takes an encrypted pg_dump every Friday and keeps it for 90 days.",
      },
    ],
    facts: [
      { value: "3", label: "languages: Arabic, English, Turkish" },
      { value: "102", label: "test files" },
      { value: "24", label: "database migrations" },
      { value: "114", label: "commits" },
    ],
    sources: [
      "Private repo Abubakr-Alsheikh/mizan: README.md, docs/01-product.md, docs/02-architecture.md, docs/08-decisions-and-risks.md (decisions 2, 8, 41)",
      "src/server/ai/pattern-parser.ts, src/server/api/routes/telegram.ts, src/server/telegram/secret.ts, .github/workflows/backup.yml",
      "drizzle/*.sql, messages/{ar,en,tr}.json, git log (2026-09-20 to 2026-10-13)",
      "mizans.netlify.app",
    ],
  },

  "max-cli": {
    context: "Open source · v1.2.0 on PyPI · docs on GitHub Pages",
    summary:
      "A terminal assistant that turns media, PDF, image, download and file chores into short commands, and runs them for you from plain words.",
    problem:
      "Compressing a video, merging PDFs or tidying a downloads folder each means a different tool and a page of flags. Max puts those jobs behind one command, `max`, with sane defaults, lets you ask for them in plain words, and keeps an undo for anything that touches your files.",
    architecture: [
      {
        name: "core/catalog/",
        detail:
          "One description per action: its parameters, defaults, danger level and batch rules. The CLI, the dashboard and the agent all read it, so they offer the same options.",
      },
      {
        name: "core/operations/ + engines/",
        detail:
          "The work behind each action, over engines for FFmpeg, PDF, images, AI providers, downloads and the background task queue.",
      },
      {
        name: "core/agent/",
        detail:
          "The AI agent: Max's own commands as its tools, a path scope it cannot leave, plans shown before multi-step work, and batch and parallel runs.",
      },
      {
        name: "interface/",
        detail:
          "Typer command groups for video, audio, images, PDF, grab, files, AI, queue, tools, config and plugins, plus a Textual dashboard that a bare `max` opens.",
      },
      {
        name: "common/ + plugins/",
        detail:
          "Shared plumbing (atomic writes, file locks, the undo log) and a loader for drop-in plugin files.",
      },
    ],
    decisions: [
      {
        title: "One catalog, three front ends",
        body: "Every action is described once. The command line, the dashboard and the agent are three views of the same catalog running the same operations, so a new action appears in all three.",
      },
      {
        title: "The agent only uses Max",
        body: "`max \"sort my Music folder by artist\"` plans with Max's own commands and nothing else. It stays inside the folders you name, asks before it moves, overwrites or deletes, and `max ai undo` puts back its last request.",
      },
      {
        title: "File operations can be undone",
        body: "Each command that renames, moves or deletes files writes its operations as one group in an undo log. The log keeps 50 groups for 30 days.",
      },
      {
        title: "A main model and a fallback",
        body: "You pick a main AI and a fallback from OpenAI, OpenRouter, Gemini or a local Ollama model. When the main one fails, Max switches to the fallback.",
      },
      {
        title: "Tested where it runs",
        body: "CI runs Pytest on Ubuntu, macOS and Windows across Python 3.9 to 3.12, holds type errors under a mypy baseline that may not rise, and builds the package. Separate workflows publish the docs and release to PyPI.",
      },
    ],
    facts: [
      { value: "73", label: "commands in the README" },
      { value: "14", label: "CI jobs per push" },
      { value: "92", label: "test modules" },
      { value: "417", label: "commits" },
    ],
    sources: [
      "github.com/Abubakr-Alsheikh/max-cli README.md (command table, cheat sheets, \"How the code fits together\"), CHANGELOG.md, pyproject.toml (v1.2.0)",
      ".github/workflows/ci.yml (3 OS x 4 Pythons, typecheck, build), docs.yml, release.yml",
      "src/max_cli/plugins/manager.py (commit ad67ce2), src/max_cli/common/transaction_log.py",
      "git log at ba834d6 (2026-10-13)",
    ],
  },

  "nanomanga-studio": {
    context:
      "Hackathon entry · Google Nano Banana (Gemini 2.5 Flash Image) Hackathon · live on Vercel",
    summary:
      "A studio that takes a one-line idea to finished, downloadable manga pages with Gemini.",
    problem:
      "An image model draws one picture at a time and forgets the last one. A manga needs the same faces, clothes and places to hold from page to page, so each new page has to see what came before it.",
    architecture: [
      {
        name: "Planning",
        detail:
          "gemini-2.5-flash acts as story editor and returns the whole plan as strict JSON: summary, characters, environments and a page-by-page plot.",
      },
      {
        name: "Assets",
        detail:
          "The image model draws character sheets and empty environment shots from the plan, under separate concept-artist and background-artist prompts.",
      },
      {
        name: "Pages",
        detail:
          "gemini-2.5-flash-image-preview draws each page from a panel script plus earlier pages and the relevant asset sheets.",
      },
      {
        name: "Next.js route handlers",
        detail:
          "Seven API routes behind the UI: one for image generation, six for the inspire and planning steps.",
      },
    ],
    decisions: [
      {
        title: "Visual memory",
        body: "A page request is multi-modal. It sends the text prompt, then the previous pages as images, then the sheets for the characters and places on that page, and tells the model to use them for continuity.",
      },
      {
        title: "The plan is the source of truth",
        body: "Everything downstream reads the JSON plan. You can edit names, plot points and descriptions in it before a single image is drawn.",
      },
      {
        title: "Pages stay editable",
        body: "Click any page to view it full size, download it, or change its prompt and redraw it. The redraw still sees the pages before it.",
      },
      {
        title: "Models are configuration",
        body: "The text and image model names come from environment variables, so a newer model is a deploy setting and not a code change.",
      },
    ],
    facts: [
      { value: "2", label: "Gemini models" },
      { value: "7", label: "API routes" },
    ],
    sources: [
      "github.com/Abubakr-Alsheikh/nanomanga-studio README.md",
      "app/api/generate/route.ts (commit 5a3cc6a), lib/gemini.ts (commit 53f72cb)",
      "app/api/* and components/* file tree",
    ],
  },

  "school-management-system": {
    context: "University assignment · Windows desktop app · Oracle Database",
    summary:
      "A desktop system for running a school's records: students, staff, classes, grades and weekly schedules.",
    problem:
      "A school keeps its students, staff, classes, grades and timetable in separate places. This app puts them in one Oracle database behind a single Windows Forms interface.",
    architecture: [
      {
        name: "Forms",
        detail:
          "24 Windows Forms, grouped by domain: students and enrolment, employees and roles, classes, schedules, grades and grade components.",
      },
      {
        name: "Models",
        detail:
          "Plain C# classes for Student, Employee, Classes, Schedule and Semester.",
      },
      {
        name: "SchoolDatabase",
        detail:
          "One static gateway with ExecuteQuery and ExecuteNonQuery. Every form reads and writes through it.",
      },
      {
        name: "Oracle",
        detail: "Oracle Database 11g or later through Oracle.ManagedDataAccess.",
      },
    ],
    decisions: [
      {
        title: "One way into the database",
        body: "Forms never open their own connection. They hand SQL and an OracleParameter array to SchoolDatabase, which owns the connection, the command and error handling.",
      },
      {
        title: "Grades are built from parts",
        body: "A grade is made of components, and the components have their own form, apart from the grades built from them.",
      },
      {
        title: "Schedules are slots",
        body: "A schedule entry ties a class to a classroom and session on a day of the week, with a start and end time.",
      },
    ],
    facts: [
      { value: "24", label: "forms" },
      { value: "5", label: "model classes" },
    ],
    sources: [
      "github.com/Abubakr-Alsheikh/school-management-system README.md",
      "Classes/SchoolDatabase.cs, Classes/Schedule.cs (commit b8b2edb)",
      "Froms/* file tree",
    ],
  },
};
