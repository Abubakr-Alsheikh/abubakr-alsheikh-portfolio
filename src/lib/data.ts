export const portfolioData = {
  hero: {
    badge: "Available for freelance & full-time",
    headingMain: "I transform complex ideas into",
    headingGradient: "high-performance digital products.",
    subtext: "Hi, I'm Abubakr Alsheikh. A Full-Stack Engineer in Aleppo, Syria, architecting scalable Django backends and crafting fluid Next.js interfaces.",
  },
  
  about: {
    aiArchitecture: "Integrating cloud LLMs (Gemini/OpenAI) and local models (Ollama) into scalable Django backends.",
    grade: "90.36%",
    diploma: "1st Graduate • Software Engineering Diploma",
    location: "Aleppo, Syria",
    languages: "Arabic (Native) • English (C1)",
    scholar: "Pursuing dual IT Engineering degrees simultaneously at Aleppo University & SVU.",
    frontend: "Delivering clean, reliable, and maintainable Next.js + TypeScript interfaces."
  },

  topProjects: [
    {
      title: "Learning Management System",
      description: "Architected a scalable Django backend with a modular multi-app structure, versioned RESTful API, and a custom administrative dashboard with granular permissions.",
      stack: ["Django", "Next.js", "Celery", "Redis", "PostgreSQL", "WebSockets", "Pytest"],
      link: "#",
    },
    {
      title: "Advanced Telegram Bot",
      description: "Highly modular system utilizing Asyncio and OpenAI. Features personalized feedback, automated content deployment via CLI, and dynamic PDF/video generation.",
      stack: ["Python", "Asyncio", "OpenAI API", "SQLite", "Pandas", "DocxTemplate"],
      link: "https://github.com/Abubakr-Alsheikh/",
    },
    {
      title: "PromptCraft: Dungeon Delver",
      description: "Dual-provider AI service orchestrating local (Ollama) and cloud (Gemini) LLMs with intelligent fallback logic and deterministic JSON parsing.",
      stack: ["Flask", "Next.js", "Zustand", "Pydantic", "TypeScript"],
      link: "#",
    }
  ],

  archiveProjects: [
    {
      title: "Ghosn (غصن) - AI Smart Farming",
      description: "Hackathon winner. Developed a responsive UI for environmental data processing and live AI chat interaction.",
      stack: ["React", "Material-UI", ".NET", "Axios"],
      link: "#"
    },
    {
      title: "IntelliDo: AI To-Do App",
      description: "AI-driven task management integrated with Gemini API for text/media task suggestions.",
      stack: ["React", "Django RF", "Redux Toolkit", "JWT"],
      link: "#"
    },
    {
      title: "AskVid: Video AI Chat",
      description: "Summarization and transcription of video/audio content using AssemblyAI and Google Gemini.",
      stack: ["Django", "Python", "AssemblyAI", "Gemini API"],
      link: "#"
    },
    {
      title: "Screen Scene: Movie Discovery",
      description: "Dynamic movie website featuring TMDB API integration and local storage optimization.",
      stack: ["Django", "Tailwind CSS", "JavaScript", "TMDB API"],
      link: "#"
    },
    {
      title: "E-Commerce Backend",
      description: "Secure cart and order management system with coupon logic and autocomplete search.",
      stack: ["Django", "Python", "Bootstrap"],
      link: "#"
    },
    {
      title: "Book Inventory System",
      description: "Full CRUD operations and user authentication built with ASP.NET and SQL Server.",
      stack: ["ASP.NET", "C#", "MS SQL Server", "Bootstrap"],
      link: "#"
    }
  ],

  journey: [
    {
      date: "Aug 2024 - Present",
      title: "Full-Stack Developer",
      subtitle: "Freelance @ Khamsat",
      description: "Developing and deploying full-stack e-commerce and LMS platforms. Managing end-to-end deployment lifecycle on VPS.",
      tags: ["Next.js", "Django", "VPS", "REST APIs"],
      align: "left"
    },
    {
      date: "2021 - Present",
      title: "Concurrent IT Scholar",
      subtitle: "Aleppo Univ & SVU",
      description: "Dual Bachelor's degrees in IT Engineering, cementing theoretical system design and algorithms.",
      tags: ["Software Architecture", "Algorithms", "System Design"],
      align: "right"
    },
    {
      date: "2021 - 2023",
      title: "Software Engineering Diploma",
      subtitle: "1st Graduate (90.36%)",
      description: "Mastered core CS fundamentals, algorithms, and database design.",
      tags: ["C#", "SQL Server", "Data Structures"],
      align: "left"
    }
  ],

  skills: {
    frontend: ["Next.js", "React.js", "TypeScript", "JavaScript", "TanStack Query", "Zustand", "Redux Toolkit", "Shadcn UI", "Material UI"],
    backend: ["Django", "Django REST Framework", "OpenAPI", "Python", "Node.js", ".NET", "C#", "PHP"],
    devops: ["PostgreSQL", "MySQL", "Redis", "Docker", "Git", "Nginx", "VPS Management", "CI/CD", "Celery", "WebSockets", "Pytest", "Figma"]
  },

  certifications: [
    { issuer: "Meta", title: "Android Developer Prof. Cert", date: "Oct 2025" },
    { issuer: "Meta", title: "Database Engineer Specialization", date: "Oct 2025" },
    { issuer: "Meta", title: "Back-End Developer Specialization", date: "Feb 2025" },
    { issuer: "Meta", title: "Front-End Developer Specialization", date: "Jul 2024" },
    { issuer: "EBTECH", title: "Odoo Developer", date: "Dec 2024" },
    { issuer: "U-Michigan", title: "Django for Everybody", date: "Jan 2024" },
    { issuer: "U-Michigan", title: "Python for Everybody", date: "Sep 2023" }
  ]
};
