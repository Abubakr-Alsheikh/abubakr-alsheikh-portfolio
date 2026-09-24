/**
 * The featured projects: the cards in the Projects section, and the index the
 * case-study pages under /projects/[slug] are built from.
 *
 * `code` is the excerpt `CodeDiff` plays inside each card. It must be a real
 * hunk from a real commit in the project's public repo, copied verbatim, with
 * `commit` naming it. Six lines is the readable ceiling at the card's width,
 * so take a contiguous run of six, never a stitched-together one. A project
 * with no public source has no `code`, and the card shows none; never write a
 * plausible-looking diff to fill the space.
 *
 * `links` holds only URLs that exist. Each one becomes a button, and a missing
 * key means no button.
 */
export type DiffSign = "+" | "-" | " ";

export interface ProjectDiffLine {
  sign: DiffSign;
  text: string;
}

export interface ProjectCode {
  file: string;
  /** Short SHA of the commit the hunk comes from. */
  commit: string;
  lines: ProjectDiffLine[];
}

export interface ProjectLinks {
  /** Public source. Leave out for private or client code. */
  repo?: string;
  /** The running product. */
  live?: string;
  /** Published documentation, when the project has its own. */
  docs?: string;
}

export interface TopProject {
  id: string;
  /** URL segment of the case-study page. */
  slug: string;
  title: string;
  description: string;
  stack: string[];
  links: ProjectLinks;
  code?: ProjectCode;
}

export const topProjectsData: TopProject[] = [
  {
    id: "SYS.MOD_01",
    slug: "qader",
    title: "Qader Platform (LMS)",
    description:
      "Architected a highly scalable, modular backend infrastructure featuring versioned RESTful APIs. Established a modern, type-safe frontend with robust i18n support, engineered for production-grade reliability using asynchronous task processing.",
    stack: ["Django", "Next.js", "Celery", "PostgreSQL", "WebSockets"],
    links: { live: "https://qader.vip/" },
  },
  {
    id: "SYS.MOD_02",
    slug: "max-cli",
    title: "Max CLI: Developer Tool",
    description:
      "Designed and published an open-source, framework-agnostic CLI for automating complex developer workflows. Created an extensible custom plugin system and established a robust CI/CD pipeline utilizing GitHub Actions for automated testing.",
    stack: ["Python", "Typer", "FFmpeg", "Pytest", "GitHub Actions"],
    links: {
      repo: "https://github.com/Abubakr-Alsheikh/max-cli",
      docs: "https://abubakr-alsheikh.github.io/max-cli/",
    },
    code: {
      file: "src/max_cli/plugins/manager.py",
      commit: "ad67ce2",
      lines: [
        { sign: " ", text: "    def discover_plugins(self) -> List[Type[Plugin]]:" },
        { sign: " ", text: "        plugins: List[Type[Plugin]] = []" },
        { sign: " ", text: "        for plugin_dir in self._plugin_dirs:" },
        { sign: "-", text: "            if not plugin_dir.exists():" },
        { sign: "+", text: "            plugins.extend(self._discover_plugins_in_dir(plugin_dir))" },
        { sign: "+", text: "        return plugins" },
      ],
    },
  },
  {
    id: "SYS.MOD_03",
    slug: "nanomanga-studio",
    title: "NanoManga Studio",
    description:
      "Built an interactive, AI-driven web application capable of dynamically generating cohesive multi-page assets. Engineered a complex multi-modal prompting architecture with 'visual memory' to maintain strict data and narrative consistency.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Gemini API"],
    links: {
      repo: "https://github.com/Abubakr-Alsheikh/nanomanga-studio",
      live: "https://nanomanga-studio.vercel.app",
    },
    code: {
      file: "app/api/generate/route.ts",
      commit: "5a3cc6a",
      lines: [
        { sign: "+", text: "    if (baseImages && baseImages.length > 0) {" },
        { sign: "+", text: "      baseImages.forEach(imgBase64 => {" },
        { sign: "+", text: "        promptParts.push({" },
        { sign: "+", text: "          inlineData: {" },
        { sign: "+", text: "            mimeType: 'image/png', // Assuming PNG for now, can be made dynamic" },
        { sign: "+", text: "            data: imgBase64," },
      ],
    },
  },
  {
    id: "SYS.MOD_04",
    slug: "school-management-system",
    title: "School Management System",
    description:
      "Developed a comprehensive administrative desktop application managing complex operational schedules. Designed and normalized a robust relational database schema utilizing custom SQL scripts for strict data validation alongside stateful UI components.",
    stack: ["C#", "Windows Forms", "Oracle Database", "SQL"],
    links: {
      repo: "https://github.com/Abubakr-Alsheikh/school-management-system",
    },
    code: {
      file: "Classes/SchoolDatabase.cs",
      commit: "b8b2edb",
      lines: [
        { sign: "+", text: "    public static DataTable ExecuteQuery(string query, OracleParameter[] parameters = null) {" },
        { sign: "+", text: "        DataTable dataTable = new DataTable();" },
        { sign: "+", text: "" },
        { sign: "+", text: "        using (OracleConnection connection = new OracleConnection(connectionString)) {" },
        { sign: "+", text: "            using (OracleCommand command = new OracleCommand(query, connection)) {" },
        { sign: "+", text: "                if (parameters != null) {" },
      ],
    },
  },
];
