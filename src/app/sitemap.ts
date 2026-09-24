import { MetadataRoute } from "next";
import { caseStudiesData } from "@/lib/data/caseStudies";

const SITE = "https://abubakr-alsheikh.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://abubakr-alsheikh.netlify.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...Object.keys(caseStudiesData).map((slug) => ({
      url: `${SITE}/projects/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
