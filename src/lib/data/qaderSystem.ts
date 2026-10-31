import type { HoloNode, HoloStep, HoloSystem } from "@/lib/holo";

/**
 * Qader is a company product, so this hologram is a stack map and nothing more:
 * the tools named on the public case study and what each kind of tool is for.
 * No routes, features, modules, data or figures from inside the product. A Scan
 * walks one layer's tools; it does not trace anything the product does.
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
): HoloNode => ({ id, shape, label, tech, detail, layer, x, z, size, tools: [label] });

const scan = (ids: [string, string, string][]): HoloStep[] =>
  ids.map(([to, title, caption]) => ({ to, title, caption, log: [to] }));

export const qaderSystem: HoloSystem = {
  title: "Qader_Stack_Manifest.exe",
  runLabel: "SCAN",
  badge: "Tools only",
  quietTech: true,
  plate: "disc",
  spine: true,
  camera: { yaw: 0.2, pitch: 0.34 },
  layers: [
    { id: "web", label: "WEB", summary: "The web app, in strict TypeScript.", y: 104 },
    { id: "api", label: "API", summary: "Modular backend services behind a documented contract.", y: 52 },
    { id: "live", label: "LIVE + JOBS", summary: "Real-time features, and slow work kept off the request path.", y: 0 },
    { id: "data", label: "DATA", summary: "A relational database that can also search by meaning.", y: -52 },
    { id: "ship", label: "INFRA", summary: "How it gets built, shipped and watched.", y: -104 },
  ],
  nodes: [
    node("nextjs", "hex", "NEXT.JS", "web framework", "React framework for the web app, with server rendering and routing.", "web", -66, 10),
    node("react", "orb", "REACT", "ui library", "The component model the whole interface is built from.", "web", 4, -26),
    node("ts", "cube", "TYPESCRIPT", "strict mode", "Types across the frontend, in strict mode, so whole classes of bug never ship.", "web", 66, 14),
    node("django", "gate", "DJANGO", "backend framework", "The Python framework the backend runs on, organised as modular apps.", "api", -66, 8, 15),
    node("drf", "gear", "DRF", "rest framework", "Django REST Framework, for the API layer on top of Django.", "api", 8, -26),
    node("openapi", "page", "OPENAPI", "api contract", "A documented contract, so frontend and backend agree on the API.", "api", 66, 12),
    node("channels", "bolt", "CHANNELS", "websockets", "Django Channels, which carries WebSockets for live features.", "live", -66, 8),
    node("celery", "stack", "CELERY", "job workers", "Workers that take slow jobs off the request path, so responses stay fast.", "live", 6, -26),
    node("redis", "funnel", "REDIS", "broker + cache", "Fast in-memory store, the kind of tool that sits behind jobs and live updates.", "live", 66, 12),
    node("postgres", "drum", "POSTGRESQL", "relational db", "The main relational database.", "data", -44, 4, 18),
    node("pgvector", "gem", "PGVECTOR", "vector search", "A PostgreSQL extension that stores embeddings and searches by similarity.", "data", 52, 2, 15),
    node("docker", "cube", "DOCKER", "containers", "Containers, so every environment runs the same thing.", "ship", -78, 14, 12),
    node("nginx", "funnel", "NGINX", "web server", "The web server and reverse proxy.", "ship", -34, -34, 12),
    node("actions", "terminal", "GH ACTIONS", "ci", "Continuous integration: GitHub Actions checks every change.", "ship", 22, -32, 12),
    node("prometheus", "bolt", "PROMETHEUS", "metrics", "Collects metrics from the running system.", "ship", 76, -6, 12),
    node("grafana", "screen", "GRAFANA", "dashboards", "Turns those metrics into dashboards.", "ship", 26, 34, 12),
  ],
  links: [],
  scenarios: [
    {
      id: "web",
      label: "Web",
      input: "web",
      start: "nextjs",
      amount: 0,
      steps: scan([
        ["nextjs", "Next.js", "Next.js: the React framework the web app is built on."],
        ["react", "React", "React: the component model behind the whole interface."],
        ["ts", "TypeScript", "TypeScript in strict mode, across the frontend."],
      ]),
    },
    {
      id: "api",
      label: "API",
      input: "api",
      start: "django",
      amount: 0,
      steps: scan([
        ["django", "Django", "Django: the Python framework the backend runs on, split into modular apps."],
        ["drf", "DRF", "Django REST Framework: the API layer, with thin views over a service layer."],
        ["openapi", "OpenAPI", "OpenAPI: a documented contract between backend and frontend."],
      ]),
    },
    {
      id: "live",
      label: "Live",
      input: "live",
      start: "channels",
      amount: 0,
      steps: scan([
        ["channels", "Channels", "Django Channels: WebSockets, for live features."],
        ["celery", "Celery", "Celery: workers that keep slow jobs off the request path."],
        ["redis", "Redis", "Redis: the fast in-memory store alongside them."],
      ]),
    },
    {
      id: "data",
      label: "Data",
      input: "data",
      start: "postgres",
      amount: 0,
      steps: scan([
        ["postgres", "Postgres", "PostgreSQL: the main database."],
        ["pgvector", "pgvector", "pgvector: stores embeddings inside PostgreSQL and searches by similarity."],
      ]),
    },
    {
      id: "ship",
      label: "Infra",
      input: "infra",
      start: "docker",
      amount: 0,
      steps: scan([
        ["docker", "Docker", "Docker: containers, so every environment runs the same thing."],
        ["nginx", "nginx", "nginx: the web server in front."],
        ["actions", "Actions", "GitHub Actions: continuous integration on every change."],
        ["prometheus", "Prometheus", "Prometheus: collects metrics."],
        ["grafana", "Grafana", "Grafana: turns those metrics into dashboards."],
      ]),
    },
  ],
};
