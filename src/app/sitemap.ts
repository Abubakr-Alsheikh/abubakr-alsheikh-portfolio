import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://abubakr-alsheikh.netlify.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    // If you add a /blog or /projects page later, you append them here.
  ];
}
