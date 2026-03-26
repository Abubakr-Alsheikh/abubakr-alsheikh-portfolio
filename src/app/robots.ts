import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/", // Block crawlers from accidental private directories
    },
    sitemap: "https://abubakr-alsheikh.netlify.app/sitemap.xml",
  };
}
