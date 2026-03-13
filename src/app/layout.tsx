import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import LenisProvider from "@/components/shared/LenisProvider";
import CursorAura from "@/components/shared/CursorAura";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Abubakr Alsheikh | Full-Stack Architect",
  description: "Transforming complex ideas into high-performance, intelligent digital products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth overflow-x-hidden max-w-full">
      <body
        className={cn(
          "min-h-screen antialiased text-slate-200 overflow-x-hidden max-w-full",
          "bg-[#020617] selection:bg-orange-500/30 selection:text-orange-200",
          spaceGrotesk.variable,
          jetbrainsMono.variable
        )}
      >
        <CursorAura />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
