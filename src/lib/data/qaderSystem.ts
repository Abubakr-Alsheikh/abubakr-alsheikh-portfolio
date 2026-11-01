import type { HoloNode, HoloStep, HoloSystem } from "@/lib/holo";

/**
 * Qader is a company product, so this hologram shows how its public stack fits
 * together in the most general way: the tools named on the case study, wired
 * into flows any web app has, such as a login or a background job. The flows
 * are simplified on purpose, and the panel says so. Nothing here comes from
 * inside the product: no features, endpoints, modules, data or figures. The
 * paths in the trace are placeholders.
 */

const node = (
  id: string,
  shape: HoloNode["shape"],
  label: string,
  tech: string,
  detail: string,
  layer: string,
  x: number,
  z: number,
  size = 13,
  tools: string[] = [label],
): HoloNode => ({ id, shape, label, tech, detail, layer, x, z, size, tools });

/** One hop: where the packet goes, the name in the strip, and what travels there. */
const hop = (to: string, title: string, protocol: string, caption: string): HoloStep => ({
  to,
  title,
  caption,
  log: [`hop|${title}|${protocol}`],
});

const reply = (to: string, via: string[], title: string, protocol: string, caption: string): HoloStep => ({
  to,
  via,
  back: true,
  title,
  caption,
  log: [`back|${title}|${protocol}`],
});

export const qaderSystem: HoloSystem = {
  title: "Qader_Stack_Flow.exe",
  runLabel: "FLOW",
  badge: "Simplified",
  plate: "disc",
  quietTech: true,
  camera: { yaw: 0.2, pitch: 0.34 },
  layers: [
    { id: "web", label: "WEB", summary: "What runs in front of the user: the web app, in strict TypeScript.", y: 104 },
    { id: "api", label: "API", summary: "The front gate and the backend behind it, with a documented contract between them and the web app.", y: 52 },
    { id: "live", label: "LIVE + JOBS", summary: "Real-time updates, and slow work kept off the request path.", y: 0 },
    { id: "data", label: "DATA", summary: "A relational database that can also search by meaning.", y: -52 },
    { id: "ship", label: "INFRA", summary: "How it gets built, shipped and watched.", y: -104 },
  ],
  nodes: [
    node("next", "hex", "NEXT.JS", "web framework", "The web app itself. It sends every request and shows every answer.", "web", -56, 10, 15),
    node("react", "orb", "REACT", "ui library", "Draws what the user sees from the data that comes back.", "web", 2, -26),
    node("ts", "cube", "TYPESCRIPT", "strict mode", "Types across the frontend, so whole classes of bug never ship.", "web", 80, 22, 12),
    node("nginx", "funnel", "NGINX", "web server", "The front gate. Every request comes through it and gets passed to the right place.", "api", -56, 10, 14),
    node("django", "gate", "DJANGO + DRF", "backend + rest api", "The backend. Django REST Framework checks each request and thin views hand it to a service layer.", "api", 18, 10, 16, ["Django", "Django REST Framework"]),
    node("openapi", "page", "OPENAPI", "api contract", "A documented contract, so frontend and backend agree on every request.", "api", 78, -8, 11),
    node("channels", "bolt", "CHANNELS", "websockets", "Django Channels holds WebSocket connections open for live updates.", "live", -56, 10, 14, ["Django Channels"]),
    node("redis", "hex", "REDIS", "broker + pub/sub", "A fast in-memory store that passes messages between the parts of the system.", "live", 18, -28, 13),
    node("celery", "stack", "CELERY", "job workers", "Workers that pick up slow jobs, so nobody waits on them.", "live", 78, -8, 14),
    node("postgres", "drum", "POSTGRESQL", "relational db", "The main database, where the records live.", "data", 18, 10, 19),
    node("pgvector", "gem", "PGVECTOR", "vector search", "A PostgreSQL extension that stores embeddings and finds things by similarity.", "data", 82, 12, 13),
    node("actions", "terminal", "GH ACTIONS", "ci", "Checks every change automatically before it can ship.", "ship", -74, 12, 13, ["GitHub Actions"]),
    node("docker", "cube", "DOCKER", "containers", "Packs the app into containers, so every environment runs the same thing.", "ship", -14, -30, 13),
    node("prometheus", "bolt", "PROMETHEUS", "metrics", "Collects metrics from the running system.", "ship", 44, 18, 13),
    node("grafana", "screen", "GRAFANA", "dashboards", "Turns those metrics into dashboards people can read.", "ship", 88, -16, 12),
  ],
  links: [
    ["next", "nginx"],
    ["next", "react"],
    ["next", "ts"],
    ["nginx", "django"],
    ["nginx", "channels"],
    ["django", "openapi"],
    ["django", "postgres"],
    ["django", "redis"],
    ["channels", "redis"],
    ["redis", "celery"],
    ["celery", "postgres"],
    ["postgres", "pgvector"],
    ["actions", "docker"],
    ["docker", "nginx"],
    ["prometheus", "grafana"],
    ["django", "prometheus"],
  ],
  scenarios: [
    {
      id: "login",
      label: "Login",
      input: "POST /login",
      start: "next",
      amount: 0,
      steps: [
        hop("next", "Next.js", "form", "You press Sign in. The web app sends your details over a secure connection."),
        hop("nginx", "nginx", "HTTPS", "nginx is the front gate: every request comes through here and gets passed along."),
        hop("django", "Django", "HTTP", "Django REST Framework checks the request is well formed, then looks for your account."),
        hop("postgres", "Postgres", "SQL", "PostgreSQL holds the account, so the backend can check who you are."),
        reply("next", ["django", "nginx"], "Signed in", "200 OK", "It matches, so the answer travels back up the same path and you are signed in."),
      ],
    },
    {
      id: "data",
      label: "Data",
      input: "GET /data",
      start: "next",
      amount: 0,
      steps: [
        hop("next", "Next.js", "fetch", "You open a page, and the web app asks for its data."),
        hop("nginx", "nginx", "HTTPS", "Same gate as before."),
        hop("django", "Django", "HTTP", "The backend confirms you are allowed to see this. The OpenAPI contract says exactly what the request and the answer look like."),
        hop("postgres", "Postgres", "SQL", "The database finds the records."),
        reply("next", ["django", "nginx"], "JSON", "200 OK", "The data comes back up as JSON."),
        hop("react", "React", "render", "React draws it on screen."),
      ],
    },
    {
      id: "search",
      label: "Search",
      input: "GET /search",
      start: "next",
      amount: 0,
      steps: [
        hop("next", "Next.js", "fetch", "You search for something, in your own words."),
        { ...hop("django", "Django", "HTTPS", "The request reaches the backend through nginx."), via: ["nginx"] },
        hop("postgres", "Postgres", "SQL", "A plain text match can miss what you meant, so the question goes to the database as a vector."),
        hop("pgvector", "pgvector", "embedding", "pgvector finds what is closest in meaning, not only in spelling."),
        reply("next", ["postgres", "django", "nginx"], "Results", "200 OK", "The closest matches come back, best first."),
      ],
    },
    {
      id: "live",
      label: "Live",
      input: "WS /live",
      start: "next",
      amount: 0,
      steps: [
        hop("next", "Next.js", "upgrade", "Instead of asking again and again, the web app opens a connection and keeps it open."),
        hop("nginx", "nginx", "WSS", "nginx lets the WebSocket through."),
        hop("channels", "Channels", "WebSocket", "Django Channels holds the connection, ready to push."),
        hop("redis", "Redis", "pub/sub", "When something changes anywhere in the system, the news passes through Redis."),
        reply("next", ["channels", "nginx"], "Update", "push", "It arrives on screen instantly, with no reload and no asking."),
      ],
    },
    {
      id: "job",
      label: "Job",
      input: "POST /job",
      start: "next",
      amount: 0,
      steps: [
        hop("next", "Next.js", "fetch", "You ask for something slow, like a big report."),
        { ...hop("django", "Django", "HTTPS", "The backend does not make you wait. It accepts the request and answers right away."), via: ["nginx"] },
        hop("redis", "Redis", "queue", "The job goes into a queue in Redis."),
        hop("celery", "Celery", "task", "A Celery worker picks it up and does the work in the background."),
        hop("postgres", "Postgres", "SQL", "The worker saves the result."),
        reply("next", ["celery", "redis", "channels", "nginx"], "Done", "push", "When it finishes, a live message tells the page, and the result appears."),
      ],
    },
    {
      id: "ship",
      label: "Ship",
      input: "git push",
      start: "actions",
      amount: 0,
      steps: [
        hop("actions", "Actions", "git push", "A change is pushed, and GitHub Actions checks it automatically."),
        hop("docker", "Docker", "build", "Docker packs it into containers, the same everywhere it runs."),
        hop("nginx", "nginx", "deploy", "The new version goes live behind nginx."),
        { ...hop("prometheus", "Prometheus", "scrape", "Prometheus keeps collecting metrics from the running system."), via: ["django"] },
        reply("grafana", [], "Grafana", "dashboard", "Grafana turns them into dashboards, so problems show up early."),
      ],
    },
  ],
};
