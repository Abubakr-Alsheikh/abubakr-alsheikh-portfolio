export interface JourneyEntry {
  date: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  /** Slug of a case study under /projects, when the role has one. */
  caseStudy?: string;
}

export const journeyData: JourneyEntry[] = [
  {
    date: "2025 — PRESENT",
    title: "Full-Stack Software Engineer",
    subtitle: "Qader // E-Learning Platform",
    description:
      "Full-stack engineer on Qader, an Arabic-first exam-prep platform for the Saudi market. I work across the backend, the web frontend and the infrastructure: APIs, real-time features, deployment and monitoring.",
    tags: ["Django", "Next.js", "Real-Time Systems", "DevOps"],
    caseStudy: "qader",
  },
  {
    date: "AUG 2024 — PRESENT",
    title: "Full-Stack Developer",
    subtitle: "Khamsat // Freelance",
    description:
      "Engineered and deployed a diverse portfolio of full-stack applications by evaluating project requirements and selecting the optimal technology stack. Managed the complete lifecycle from API architecture to VPS production deployments.",
    tags: ["System Architecture", "API Design", "VPS Deployment", "Full-Stack"],
  },
  {
    date: "DEC 2023 — PRESENT",
    title: "IT Engineering (B.Sc.)",
    subtitle: "Aleppo University // System Design Focus",
    description:
      "Deepening theoretical knowledge in algorithms, advanced software engineering methodologies, and complex system design.",
    tags: ["Software Engineering", "Advanced Algorithms", "Computer Networks"],
  },
  {
    date: "OCT 2021 — PRESENT",
    title: "IT Engineering (B.Sc.)",
    subtitle: "Syrian Virtual University // Concurrent Degree",
    description:
      "Pursuing a second simultaneous Bachelor's degree, demonstrating an exceptional capacity for high-volume academic processing and time management.",
    tags: ["Data Structures", "Operating Systems", "Mathematics"],
  },
  {
    date: "SEP 2021 — JUN 2023",
    title: "Software Engineering Diploma",
    subtitle: "Valedictorian // 90.36% Final Grade",
    description:
      "Mastered core computer science fundamentals, object-oriented programming, and relational database design. Graduated 1st in the cohort.",
    tags: ["C#", "MS SQL Server", ".NET Framework"],
  },
];
