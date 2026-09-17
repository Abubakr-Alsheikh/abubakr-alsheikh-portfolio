/**
 * `codeDiff` is the excerpt `CodeDiff` types out inside each project card.
 * Keep it short — six lines is the readable ceiling at the card's width — and
 * keep it true to the project's real stack. A diff that could belong to any
 * codebase is worse than no diff at all.
 */
export type DiffSign = "+" | "-" | " ";

export interface ProjectDiffLine {
  sign: DiffSign;
  text: string;
}

export const topProjectsData = [
  {
    id: "SYS.MOD_01",
    title: "Qader Platform (LMS)",
    description:
      "Architected a highly scalable, modular backend infrastructure featuring versioned RESTful APIs. Established a modern, type-safe frontend with robust i18n support, engineered for production-grade reliability using asynchronous task processing.",
    stack: ["Django", "Next.js", "Celery", "PostgreSQL", "WebSockets"],
    link: "https://qader.vip/",
    codeFile: "api/v1/attempts/services.py",
    codeDiff: [
      { sign: " ", text: "class AttemptService:" },
      { sign: "-", text: "    def score(self, attempt):" },
      { sign: "-", text: "        return sum(q.is_correct for q in attempt.questions)" },
      { sign: "+", text: "    @transaction.atomic" },
      { sign: "+", text: "    def score(self, attempt: Attempt) -> ScoreReport:" },
      { sign: "+", text: "        grade_attempt.delay(attempt.pk)" },
    ] as ProjectDiffLine[],
  },
  {
    id: "SYS.MOD_02",
    title: "Max CLI: Developer Tool",
    description:
      "Designed and published an open-source, framework-agnostic CLI for automating complex developer workflows. Created an extensible custom plugin system and established a robust CI/CD pipeline utilizing GitHub Actions for automated testing.",
    stack: ["Python", "Typer", "FFmpeg", "Pytest", "GitHub Actions"],
    link: "https://github.com/Abubakr-Alsheikh/max-cli",
    codeFile: "max/plugins/registry.py",
    codeDiff: [
      { sign: " ", text: "def discover() -> dict[str, Plugin]:" },
      { sign: "-", text: '    return {p.name: p for p in BUILTIN}' },
      { sign: "+", text: '    found = entry_points(group="max.plugins")' },
      { sign: "+", text: "    return {" },
      { sign: "+", text: "        ep.name: ep.load()() for ep in found" },
      { sign: "+", text: "    }" },
    ] as ProjectDiffLine[],
  },
  {
    id: "SYS.MOD_03",
    title: "NanoManga Studio",
    description:
      "Built an interactive, AI-driven web application capable of dynamically generating cohesive multi-page assets. Engineered a complex multi-modal prompting architecture with 'visual memory' to maintain strict data and narrative consistency.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Gemini API"],
    link: "https://github.com/Abubakr-Alsheikh/nanomanga-studio",
    codeFile: "lib/generation/visualMemory.ts",
    codeDiff: [
      { sign: " ", text: "export async function renderPanel(" },
      { sign: " ", text: "  script: PanelScript," },
      { sign: "-", text: ") { return gemini.image(script.prompt); }" },
      { sign: "+", text: "  memory: VisualMemory," },
      { sign: "+", text: ") {" },
      { sign: "+", text: "  return gemini.image(memory.anchor(script));" },
    ] as ProjectDiffLine[],
  },
  {
    id: "SYS.MOD_04",
    title: "School Management System",
    description:
      "Developed a comprehensive administrative desktop application managing complex operational schedules. Designed and normalized a robust relational database schema utilizing custom SQL scripts for strict data validation alongside stateful UI components.",
    stack: ["C#", "Windows Forms", "Oracle Database", "SQL"],
    link: "https://github.com/Abubakr-Alsheikh/school-management-system",
    codeFile: "Data/ScheduleRepository.cs",
    codeDiff: [
      { sign: " ", text: "public IEnumerable<Slot> ForTeacher(int id)" },
      { sign: "-", text: '    => _db.Query($"... WHERE t_id = {id}");' },
      { sign: "+", text: "{" },
      { sign: "+", text: '    using var cmd = _db.Command(ForTeacherSql);' },
      { sign: "+", text: '    cmd.Parameters.Add(":t_id", id);' },
      { sign: "+", text: "    return Read(cmd);" },
    ] as ProjectDiffLine[],
  },
];
