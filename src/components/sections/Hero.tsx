"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { HeroData } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import { TextAnimate } from "../ui/text-animate";
import { HyperText } from "../ui/hyper-text";

// Props definition to accept data from Sanity
type HeroProps = {
  data: HeroData;
};

export default function Hero({ data }: HeroProps) {
  // Animation variants for the "blur-in" effect (for other elements)
  const blurInVariants = {
    hidden: { filter: "blur(10px)", opacity: 0, y: 20 },
    visible: { filter: "blur(0px)", opacity: 1, y: 0 },
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background Image with Duotone & Ken Burns Effect */}
      {data.profileImage && (
        <motion.div
          initial={{ scale: 1.1, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={urlFor(data.profileImage).url()}
            alt="Abubakr Alsheikh professional photo"
            fill
            className="object-cover object-top"
            // This is a CSS trick for the duotone effect from our brief
            style={{
              filter:
                "grayscale(100%) contrast(1.2) brightness(0.6) sepia(100%) hue-rotate(-190deg) saturate(500%)",
            }}
            priority
          />
          {/* Soft vignette overlay */}
          <div className="absolute inset-0 bg-background/60 bg-gradient-to-t from-background via-transparent to-background/20" />
        </motion.div>
      )}

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Main Headline with WordPullUp Effect */}
        <TextAnimate
          animation="blurIn"
          as="h1"
          className="font-cal text-5xl font-bold tracking-tighter text-foreground md:text-7xl lg:text-6xl"
        >
          {data.headline}
        </TextAnimate>
        {/* <HyperText animateOnHover={false}>{data.headline}</HyperText> */}
        {/* Sub-headline */}
        <motion.h2
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.5 }}
          variants={blurInVariants}
          className="mt-4 font-sans text-lg text-primary md:text-xl"
        >
          <HyperText
            animateOnHover={false}
            delay={700}
            className="font-sans text-lg md:text-xl"
          >
            {data.subheadline}
          </HyperText>
        </motion.h2>

        {/* Bio */}
        <motion.p
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.7 }}
          variants={blurInVariants}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-primary/90 md:text-lg"
        >
          {data.bio}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.9 }}
          variants={blurInVariants}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-accent to-orange-500 text-primary-foreground font-semibold shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-accent/50 hover:shadow-2xl"
          >
            {data.ctaPrimary}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-accent/50 bg-transparent text-primary transition-all duration-300 ease-in-out hover:scale-105 hover:bg-accent/10 hover:text-accent sm:w-auto"
          >
            {data.ctaSecondary}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
