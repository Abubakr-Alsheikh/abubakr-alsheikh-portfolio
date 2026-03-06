import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CalSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";
import LenisProvider from "@/components/shared/LenisProvider";
import CursorAura from "@/components/shared/CursorAura";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Abubakr Alsheikh | Full-Stack Developer",
  description: "Transforming complex ideas into high-performance, intelligent digital products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={cn(
          "min-h-screen font-sans antialiased text-slate-200",
          "bg-[#020617] selection:bg-orange-500/30 selection:text-orange-200",
          inter.variable,
          CalSans.variable
        )}
      >
        <CursorAura />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
