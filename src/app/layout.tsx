import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import LenisProvider from "@/components/shared/LenisProvider";
import CursorAura from "@/components/shared/CursorAura";

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
  maximumScale: 1,
};

// 2. ADVANCED METADATA & OPEN GRAPH
export const metadata: Metadata = {
  metadataBase: new URL("https://abubakr-alsheikh.netlify.app"),
  title: {
    default: "Abubakr Alsheikh | Software Engineer",
    template: "%s | Abubakr Alsheikh",
  },
  description:
    "Systems-focused Software Engineer specializing in scalable backend infrastructure, robust developer tooling, and modern full-stack applications.",
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
    description:
      "Architecting scalable backend infrastructure and robust full-stack applications.",
    siteName: "Abubakr Alsheikh Portfolio",
    images: [
      {
        url: "/og-image.jpg", // Create a 1200x630 image and put it in your /public folder
        width: 1200,
        height: 630,
        alt: "Abubakr Alsheikh - Software Engineer Portfolio System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abubakr Alsheikh | Software Engineer",
    description:
      "Architecting scalable backend infrastructure and robust full-stack applications.",
    images: ["/og-image.jpg"],
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
  return (
    <html lang="en" className="dark scroll-smooth max-w-full">
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
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
