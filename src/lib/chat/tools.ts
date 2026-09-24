import {
  aboutData,
  archiveProjectsData,
  certificationsData,
  contactData,
  heroData,
  journeyData,
  skillsData,
  topProjectsData,
  caseStudiesData,
} from "@/lib/data";
import { SITE_URL } from "./config";
import { SECTIONS, type ChatAction, type SectionId } from "./protocol";

/**
 * The terminal agent's tool registry.
 *
 * The model starts every conversation knowing nothing about the portfolio. It
 * reads content through these tools, and every tool reads `src/lib/data/`, so
 * the chat can never drift from what the page says. To teach the agent a new
 * source, add one entry to `TOOLS`: the route, the prompt and the terminal
 * pick it up from here.
 *
 * Two kinds of tool:
 * - `server` tools return data. The route runs them and appends the result to
 *   the conversation as a `tool` message.
 * - `client` tools act on the page (scroll, prefill the form). The route cannot
 *   touch the page, so it forwards them to the terminal as an action and tells
 *   the model the action was dispatched.
 *
 * Results are compact JSON on purpose: every byte returned here is re-sent on
 * every later turn of the conversation.
 */

/**
 * A JSON Schema object, as the OpenAI tool format expects it. Type aliases,
 * not interfaces: the SDK wants an index signature, and only an alias gets
 * one implicitly.
 */
export type ToolParameters = {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties: false;
};

type JsonSchemaProperty = {
  type: "string";
  description: string;
  enum?: readonly string[];
};

type ToolArgs = Record<string, unknown>;

interface ToolBase {
  name: string;
  description: string;
  parameters: ToolParameters;
  /** One line for the terminal log, e.g. `projects.get("qader-platform-lms")`. */
  trace: (args: ToolArgs) => string;
}

export interface ServerTool extends ToolBase {
  side: "server";
  run: (args: ToolArgs) => unknown;
}

export interface ClientTool extends ToolBase {
  side: "client";
}

export type ChatTool = ServerTool | ClientTool;

// --- Helpers -----------------------------------------------------------------

const NO_ARGS: ToolParameters = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

/** Reads a string argument. The model can send anything, so never trust it. */
function str(args: ToolArgs, key: string, max = 200): string {
  const value = args[key];
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const hasLink = (link: string) => link && link !== "#";

// --- The index: every record, flattened once --------------------------------

interface Project {
  slug: string;
  title: string;
  tier: "featured" | "archive";
  stack: string[];
  description: string;
  link?: string;
  /** Public source, when there is one. */
  repo?: string;
  /** The running product. */
  live?: string;
  /** This site's write-up of the project. */
  caseStudy?: string;
}

const PROJECTS: Project[] = [
  ...topProjectsData.map((p) => ({
    slug: slugify(p.title),
    title: p.title,
    tier: "featured" as const,
    stack: p.stack,
    description: p.description,
    link: p.links.live ?? p.links.repo,
    repo: p.links.repo,
    live: p.links.live,
    caseStudy: caseStudiesData[p.slug]
      ? new URL(`/projects/${p.slug}`, SITE_URL).href
      : undefined,
  })),
  ...archiveProjectsData.map((p) => ({
    slug: slugify(p.title),
    title: p.title,
    tier: "archive" as const,
    stack: p.stack,
    description: p.description,
    link: hasLink(p.link) ? p.link : undefined,
  })),
];

interface SearchDoc {
  kind: "project" | "experience" | "education" | "certification" | "skill";
  /** What `get_project` or the matching tool takes to read the full record. */
  ref: string;
  title: string;
  text: string;
}

const SEARCH_DOCS: SearchDoc[] = [
  ...PROJECTS.map((p) => ({
    kind: "project" as const,
    ref: p.slug,
    title: p.title,
    text: `${p.title} ${p.stack.join(" ")} ${p.description}`,
  })),
  ...journeyData.map((j) => ({
    kind: j.subtitle.includes("Freelance")
      ? ("experience" as const)
      : ("education" as const),
    ref: "get_experience",
    title: `${j.title}, ${j.subtitle}`,
    text: `${j.title} ${j.subtitle} ${j.description} ${j.tags.join(" ")}`,
  })),
  ...certificationsData.map((c) => ({
    kind: "certification" as const,
    ref: "get_certifications",
    title: `${c.issuer} ${c.title}`,
    text: `${c.issuer} ${c.title}`,
  })),
  ...Object.entries(skillsData).flatMap(([group, items]) =>
    items.map((skill) => ({
      kind: "skill" as const,
      ref: "get_skills",
      title: skill,
      text: `${skill} ${group}`,
    })),
  ),
];

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9#+.]+/)
    .filter((t) => t.length > 1);

/**
 * Keyword search. Deliberately simple: the corpus is a few dozen records, and
 * the model rephrases and retries far better than any ranking tweak here.
 */
function search(query: string, limit = 8) {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  return SEARCH_DOCS.map((doc) => {
    const haystack = doc.text.toLowerCase();
    const title = doc.title.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 3;
      else if (haystack.includes(term)) score += 1;
    }
    return { doc, score };
  })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc }) => ({ kind: doc.kind, ref: doc.ref, title: doc.title }));
}

// --- The registry ------------------------------------------------------------

export const TOOLS: ChatTool[] = [
  {
    side: "server",
    name: "search_portfolio",
    description:
      "Keyword search across projects, experience, education, certifications and skills. Use it when the question names a technology, domain or topic. Each hit names the tool or project slug that holds the full record.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keywords, e.g. 'realtime websockets' or 'AI'.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    trace: (args) => `portfolio.search("${str(args, "query")}")`,
    run: (args) => {
      const hits = search(str(args, "query"));
      return hits.length > 0 ? { hits } : { hits: [], note: "No match." };
    },
  },
  {
    side: "server",
    name: "get_profile",
    description:
      "Who Abubakr is: summary, how he works, availability, strengths, location and languages.",
    parameters: NO_ARGS,
    trace: () => "profile.read()",
    run: () => ({
      name: "Abubakr Alsheikh",
      summary: heroData.lead,
      availability: heroData.status,
      approach: heroData.specs.map((s) => `${s.sys}: ${s.label}`),
      manifesto: aboutData.manifesto,
      strengths: aboutData.capabilities.map((c) => ({
        title: c.title,
        detail: c.description,
      })),
      location: contactData.location,
    }),
  },
  {
    side: "server",
    name: "list_projects",
    description:
      "Lists projects with slug, title and stack. 'featured' are the four flagship systems, 'archive' the smaller builds.",
    parameters: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          enum: ["featured", "archive", "all"],
          description: "Which projects to list. Defaults to 'all'.",
        },
      },
      additionalProperties: false,
    },
    trace: (args) => `projects.list(${str(args, "scope") || "all"})`,
    run: (args) => {
      const scope = str(args, "scope") || "all";
      return PROJECTS.filter((p) => scope === "all" || p.tier === scope).map(
        (p) => ({ slug: p.slug, title: p.title, tier: p.tier, stack: p.stack }),
      );
    },
  },
  {
    side: "server",
    name: "get_project",
    description:
      "Full record for one project: what it does, how it is built, the stack and its link. Takes a slug from list_projects or search_portfolio.",
    parameters: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Project slug." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
    trace: (args) => `projects.get("${str(args, "slug")}")`,
    run: (args) => {
      const slug = slugify(str(args, "slug"));
      const project =
        PROJECTS.find((p) => p.slug === slug) ??
        PROJECTS.find((p) => p.slug.includes(slug) && slug.length > 2);
      return (
        project ?? {
          error: "Unknown slug.",
          slugs: PROJECTS.map((p) => p.slug),
        }
      );
    },
  },
  {
    side: "server",
    name: "get_experience",
    description: "Work history and education, newest first.",
    parameters: NO_ARGS,
    trace: () => "journey.read()",
    run: () => journeyData,
  },
  {
    side: "server",
    name: "get_skills",
    description:
      "Technologies Abubakr has shipped with, grouped. A sample, not a boundary: he picks up whatever a project needs.",
    parameters: NO_ARGS,
    trace: () => "skills.read()",
    run: () => skillsData,
  },
  {
    side: "server",
    name: "get_certifications",
    description: "Certifications with issuer, date and verification link.",
    parameters: NO_ARGS,
    trace: () => "certs.read()",
    run: () =>
      certificationsData.map((c) => ({
        issuer: c.issuer,
        title: c.title,
        date: c.inProgress ? "in progress" : c.date,
        verify: c.verifyLink,
      })),
  },
  {
    side: "server",
    name: "get_contact",
    description:
      "How to reach Abubakr: email, profiles, resume link, and the contact form on this page.",
    parameters: NO_ARGS,
    trace: () => "comms.read()",
    run: () => ({
      email: contactData.email,
      socials: contactData.socials.map((s) => ({ name: s.name, url: s.url })),
      // Absolute: given "/resume.pdf" the model guessed a domain for it.
      resume: new URL(contactData.resumeLink, SITE_URL).href,
      location: contactData.location,
      form: "The contact form at the bottom of this page delivers straight to his inbox.",
    }),
  },
  {
    side: "client",
    name: "navigate",
    description:
      "Scrolls the page behind the terminal to a section. Use it when the visitor asks to see something, alongside your answer.",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: SECTIONS,
          description:
            "hero=top, about=profile, projects=featured, archive=other projects, journey=experience, engine=skills and certifications, contact=form.",
        },
      },
      required: ["section"],
      additionalProperties: false,
    },
    trace: (args) => `nav.goto(${str(args, "section")})`,
  },
  {
    side: "client",
    name: "prefill_contact",
    description:
      "Writes a draft into the contact form's message field and scrolls to it, for a visitor who wants to get in touch. The visitor reviews and sends it.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The draft, in the visitor's voice, under 600 characters.",
        },
      },
      required: ["message"],
      additionalProperties: false,
    },
    trace: () => "comms.draft()",
  },
];

const BY_NAME = new Map(TOOLS.map((tool) => [tool.name, tool]));

export const getTool = (name: string) => BY_NAME.get(name);

/**
 * The `tools` array for the API, built once. Its order and bytes never change
 * between requests, which keeps the prompt prefix cacheable.
 */
export const TOOL_DEFINITIONS = TOOLS.map((tool) => ({
  type: "function" as const,
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  },
}));

/** Parses the model's argument string. Malformed JSON becomes no arguments. */
export function parseArgs(raw: string): ToolArgs {
  try {
    const parsed: unknown = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as ToolArgs)
      : {};
  } catch {
    return {};
  }
}

/** Validates a client tool call into an action, or `null` if malformed. */
export function toAction(name: string, args: ToolArgs): ChatAction | null {
  if (name === "navigate") {
    const section = str(args, "section") as SectionId;
    return SECTIONS.includes(section) ? { name, section } : null;
  }
  if (name === "prefill_contact") {
    const message = str(args, "message", 600);
    return message ? { name, message } : null;
  }
  return null;
}
