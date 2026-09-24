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

  "max-cli": {
    context: "Open source · published on PyPI · docs on GitHub Pages",
    summary:
      "A terminal assistant that turns media, PDF, image and file chores into short commands you can remember.",
    problem:
      "Compressing a video, merging PDFs or tidying a downloads folder each means a different tool and a page of flags. Max puts those jobs behind one command, `max`, with sane defaults, and adds an undo for anything that touches your files.",
    architecture: [
      {
        name: "interface/",
        detail:
          "Typer command groups, one per domain: video, audio, PDF, images, files, grab, AI, config.",
      },
      {
        name: "core/engines/",
        detail:
          "The work itself: media, PDF, image, AI, network and file-organiser engines, plus a task queue for downloads.",
      },
      {
        name: "plugins/",
        detail:
          "A PluginManager that loads drop-in `.py` files from plugin folders and remembers which are enabled in ~/.max_cli/plugins.json.",
      },
      {
        name: "common/",
        detail:
          "Shared plumbing: the transaction log, retry, caching, events and the FFmpeg resolver.",
      },
    ],
    decisions: [
      {
        title: "File operations can be undone",
        body: "Each command that renames, moves or deletes files writes its operations as one JSON group in ~/.max_cli/transactions/. `max files undo` reverses the whole group. The log keeps 50 groups for 30 days.",
      },
      {
        title: "FFmpeg finds itself",
        body: "Video and audio commands check for FFmpeg on first use and offer to download it into ~/.max_cli/bin/, so a new user gets an install prompt in place of a missing-binary error.",
      },
      {
        title: "Plugins are just files",
        body: "Drop a Python file into a plugin folder and Max discovers it through importlib, runs its lifecycle hooks and registers its commands on the CLI.",
      },
      {
        title: "Any model, or none online",
        body: "The AI commands speak the OpenAI API, so they run against Gemini, OpenAI or a local Ollama model by changing the base URL and key.",
      },
      {
        title: "Tested where it runs",
        body: "CI lints with Ruff and runs Pytest with coverage on Ubuntu, macOS and Windows across Python 3.9 to 3.12. Separate workflows publish the docs and release to PyPI.",
      },
    ],
    facts: [
      { value: "21", label: "commands in the README" },
      { value: "12", label: "CI jobs: 3 OS × 4 Pythons" },
      { value: "19", label: "test modules" },
      { value: "120+", label: "commits" },
    ],
    sources: [
      "github.com/Abubakr-Alsheikh/max-cli README.md, pyproject.toml",
      ".github/workflows/ci.yml, docs.yml, release.yml",
      "src/max_cli/plugins/manager.py (commits fbe7581, ad67ce2)",
      "src/max_cli/common/transaction_log.py (commit 8e14b85)",
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
