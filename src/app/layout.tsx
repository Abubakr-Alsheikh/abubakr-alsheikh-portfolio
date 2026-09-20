import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import LenisProvider from "@/components/shared/LenisProvider";
import CursorAura from "@/components/shared/CursorAura";
import CockpitCanopy from "@/components/shared/CockpitCanopy";
import TargetReticle from "@/components/shared/TargetReticle";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// 1. VIEWPORT CONFIGURATION
export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // No maximumScale: capping it blocks pinch zoom, which is the one control
  // a reader with low vision has on a page of 8px HUD labels.
};

/** One description for the page, the OG card and the Twitter card. */
const DESCRIPTION =
  "Systems-focused Software Engineer designing, building and shipping backends, developer tooling and full-stack applications.";

// 2. ADVANCED METADATA & OPEN GRAPH
export const metadata: Metadata = {
  metadataBase: new URL("https://abubakr-alsheikh.netlify.app"),
  title: {
    default: "Abubakr Alsheikh | Software Engineer",
    template: "%s | Abubakr Alsheikh",
  },
  description: DESCRIPTION,
  keywords: [
    "Abubakr Alsheikh",
    "Software Engineer",
    "Full-Stack Developer",
    "Django Developer",
    "Next.js Developer",
    "TypeScript",
    "Python Developer",
    "Syria",
    "Aleppo University",
    "Systems Architect",
  ],
  authors: [
    { name: "Abubakr Alsheikh", url: "https://github.com/Abubakr-Alsheikh" },
  ],
  creator: "Abubakr Alsheikh",
  publisher: "Abubakr Alsheikh",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://abubakr-alsheikh.netlify.app",
    title: "Abubakr Alsheikh | Software Engineer",
    // Same sentence as the page description above: a preview that promises
    // something the page does not say is worse than a plain one.
    description: DESCRIPTION,
    siteName: "Abubakr Alsheikh Portfolio",
    images: [
      {
        // The file in /public is a .png; pointing at .jpg served every
        // link preview a 404.
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Abubakr Alsheikh - Software Engineer Portfolio System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abubakr Alsheikh | Software Engineer",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// 3. JSON-LD STRUCTURED DATA (Schema.org)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Abubakr Alsheikh",
  jobTitle: "Software Engineer",
  url: "https://abubakr-alsheikh.netlify.app",
  sameAs: [
    "https://github.com/Abubakr-Alsheikh",
    "https://www.linkedin.com/in/abubakr-alsheikh/",
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Aleppo University",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Syrian Virtual University",
    },
  ],
  knowsAbout: [
    "Software Engineering",
    "Backend Architecture",
    "Django",
    "Next.js",
    "Python",
    "TypeScript",
    "System Design",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No `scroll-smooth` on <html>: the page is scrolled by Lenis, and the
  // native behaviour runs its own animation against it on every programmatic
  // scroll. See the smooth scroll contract in agents.md.
  return (
    <html lang="en" className="dark max-w-full">
      <body
        className={cn(
          "min-h-screen antialiased text-slate-200 overflow-x-clip max-w-full",
          "bg-[#020617] selection:bg-[#F97316]/30 selection:text-[#F97316]",
          spaceGrotesk.variable,
          jetbrainsMono.variable,
        )}
      >
        {/* Inject JSON-LD into the DOM */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <CursorAura />
        <CockpitCanopy />
        <TargetReticle />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
