/**
 * The Engine's three skill streams, also returned by the terminal agent's
 * get_skills. Every item is backed by the owner's repos or shipped work
 * (checked against their dependency files, Oct 2026). Something he is only
 * studying, like AWS, belongs in certifications as in progress, not here.
 */
export const skillsData = {
  frontend: [
    "TypeScript",
    "Next.js",
    "React.js",
    "JavaScript",
    "Tailwind CSS",
    "Shadcn/ui",
    "Zustand",
    "TanStack Query",
    "Redux Toolkit",
    "Material UI",
    "Zod",
    "Vite",
    "Kotlin / Jetpack Compose",
  ],
  backend: [
    "Python",
    "Django / DRF",
    "Node.js / Express.js",
    "Hono",
    "C# / ASP.NET Core",
    "PHP",
    "RESTful APIs",
    "OpenAPI",
    "WebSockets",
    "Celery",
    "BullMQ",
    "OpenAI / Gemini APIs",
    "Vercel AI SDK",
    "System Design",
  ],
  devops: [
    "PostgreSQL",
    "Supabase",
    "Redis",
    "Drizzle ORM",
    "Prisma",
    "MySQL",
    "SQL Server",
    "Oracle DB",
    "Docker",
    "GitHub Actions CI/CD",
    "Netlify / Vercel",
    "Nginx",
    "Linux Servers",
    "VPS Deployment",
    "Sentry",
    "Pytest / Vitest / Jest",
  ],
};
