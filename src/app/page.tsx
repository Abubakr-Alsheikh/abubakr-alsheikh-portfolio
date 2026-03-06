import { sanityFetch } from "@/sanity/lib/live";
import { HERO_QUERY, ABOUT_QUERY } from "@/sanity/lib/queries"; // 1. Import ABOUT_QUERY
import { HeroData, AboutData } from "@/types"; // 2. Import AboutData
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About"; // 3. Import About component

export const revalidate = 60;

// The generic type for sanityFetch should be the wrapper object's structure
type SanityFetchResult = {
  data: HeroData;
  sourceMap: any;
  tags: string[];
};

export default async function Home() {
  // Use Promise.all to fetch data concurrently for better performance
  const [heroFetchResult, aboutDataResult] = await Promise.all([
    sanityFetch<HeroData>({ query: HERO_QUERY, tags: ["hero"] }),
    sanityFetch<AboutData>({ query: ABOUT_QUERY, tags: ["about"] }),
  ]);
  const heroData = heroFetchResult.data;
  const aboutData = aboutDataResult.data;

  // Guards for both data sources
  if (!heroData) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-cal text-2xl">Content is not available.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between">
      <Hero data={heroData} />
      <About data={aboutData} />
    </main>
  );
}
