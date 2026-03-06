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
    frontend: "Delivering clean, reliable, and maintainable Next.js + Tailwind interfaces."
  },

  projects:[
    {
      title: "Enterprise Learning Platform",
      description: "Architected a highly scalable multi-app Django backend paired with a type-safe Next.js frontend. Engineered real-time WebSockets, granular role-based permissions, and asynchronous task processing with Celery.",
      stack:["Django", "Next.js", "Celery", "WebSockets", "Redis", "PostgreSQL"],
      image: "/projects/learning-platform.png",
    },
    {
      title: "PromptCraft: Dungeon Delver",
      description: "Engineered a robust Python/Flask backend with a dual-provider AI service (Ollama + Gemini). Utilized Pydantic schemas to compel deterministic structured JSON from LLMs for reliable game state parsing.",
      stack:["Flask", "LLM Integration", "Pydantic", "Zustand", "TypeScript"],
      image: "/projects/promptcraft.png",
    },
    {
      title: "Ghosn (غصن) - Smart Farming",
      description: "Built under hackathon pressure. A responsive UI enabling farmers to input complex data for AI processing. Features full RTL support, live AI chat, and a dynamic leaderboard system.",
      stack:["React", "Material-UI", ".NET", "Axios"],
      image: "/projects/ghosn.png",
    }
  ],

  journey:[
    {
      date: "Aug 2024 - Present",
      title: "Full-Stack Developer",
      subtitle: "Freelance @ Khamsat",
      description: "Developing and deploying full-stack e-commerce and LMS platforms. Architecting secure RESTful APIs with Django (DRF) and managing end-to-end VPS deployment.",
      tags: ["Next.js", "Django", "VPS", "REST APIs"],
      align: "left"
    },
    {
      date: "2021 - Present",
      title: "Concurrent IT Scholar",
      subtitle: "Aleppo Univ & SVU",
      description: "Simultaneously pursuing dual Bachelor's degrees in Information Technology Engineering, deeply cementing theoretical and architectural software concepts.",
      tags:["Software Architecture", "Algorithms", "System Design"],
      align: "right"
    },
    {
      date: "Sep 2021 - Jun 2023",
      title: "Software Engineering Diploma",
      subtitle: "1st Graduate (90.36%)",
      description: "Mastered the core fundamentals of software engineering. Graduated top of the class, setting the foundation for advanced full-stack web development.",
      tags: ["C#", "SQL Server", "Data Structures"],
      align: "left"
    }
  ],

  skills: {
    frontend:["Next.js", "React.js", "TypeScript", "Zustand", "TanStack Query", "Tailwind CSS", "Shadcn UI", "Framer Motion"],
    backend:["Django", "Django REST (DRF)", "Python", "PostgreSQL", "Redis", "Node.js", "C#", ".NET"],
    devops:["Docker", "VPS Management", "Celery", "WebSockets", "Nginx", "CI/CD", "Pytest", "Linux"]
  },

  certifications:[
    { issuer: "Meta", title: "Back-End Developer Specialization", date: "Feb 2025" },
    { issuer: "Meta", title: "Front-End Developer Specialization", date: "Jul 2024" },
    { issuer: "Univ of Michigan", title: "Django for Everybody", date: "Jan 2024" },
    { issuer: "EBTECH", title: "Odoo Developer", date: "Dec 2024" },
  ]
};
