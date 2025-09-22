import { sanityFetch } from "@/sanity/lib/live";
import { HERO_QUERY } from "@/sanity/lib/queries";
import { HeroData } from "@/types";
import Hero from "@/components/sections/Hero";

export const revalidate = 60;

// The generic type for sanityFetch should be the wrapper object's structure
type SanityFetchResult = {
  data: HeroData;
  sourceMap: any;
  tags: string[];
};

export default async function Home() {
  // Fetch the entire result object from Sanity
  const heroFetchResult = await sanityFetch<SanityFetchResult>({
    query: HERO_QUERY,
    tags: ["hero"],
  });

  // Extract just the data payload
  const heroData = heroFetchResult.data;

  // Guard against null/undefined data from the CMS
  if (!heroData) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-cal text-2xl">Hero content not found.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between">
      {/*
        THE FIX: Pass the unwrapped 'heroData' object to the component.
        This now correctly matches the 'HeroProps' type.
      */}
      <Hero data={heroData} />

      {/* Other sections will go here later */}
    </main>
  );
}
