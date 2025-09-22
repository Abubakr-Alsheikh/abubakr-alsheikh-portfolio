import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CalSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Abubakr Alsheikh | Full-Stack Developer",
  description:
    "Transforming complex ideas into high-performance, intelligent digital products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          CalSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
