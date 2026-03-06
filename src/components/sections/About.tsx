// src/components/sections/About.tsx
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { AboutData } from '@/types';
import { urlFor } from '@/sanity/lib/image';

// Interactive Components
// import { EvervaultCard } from '@/components/aceternity/evervault-card';
import AnimatedShinyText from '@/components/magicui/animated-shiny-text';

type AboutProps = {
  data: AboutData;
};

export default function About({ data }: AboutProps) {
  const blurInVariants = {
    hidden: { filter: 'blur(10px)', opacity: 0, y: 20 },
    visible: { filter: 'blur(0px)', opacity: 1, y: 0 },
  };

  return (
    <section
      id="about"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
        variants={blurInVariants}
        className="text-center font-cal text-4xl md:text-5xl"
      >
        {data.title}
      </motion.h2>

      <div className="mt-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Interactive Image */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          variants={blurInVariants}
        >
          {/* <EvervaultCard className="h-[450px] md:h-[550px]">
            <Image
              src={urlFor(data.profileImage).url()}
              alt="Profile picture of Abubakr Alsheikh"
              fill
              className="object-cover object-top"
            />
          </EvervaultCard> */}
        </motion.div>

        {/* Right Column: Text and Skills */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          variants={blurInVariants}
          className="flex flex-col gap-8"
        >
          <p className="text-lg leading-relaxed text-primary/80">
            {data.description}
          </p>

          <div className="flex flex-col gap-6">
            {data.skills?.map((skillCategory) => (
              <div key={skillCategory._key}>
                <AnimatedShinyText className="mb-3 inline-flex items-center justify-center">
                  <h3 className="text-xl font-semibold text-primary">
                    {skillCategory.categoryTitle}
                  </h3>
                </AnimatedShinyText>
                <div className="flex flex-wrap gap-2">
                  {skillCategory.skillList?.map((skill) => (
                    <div
                      key={skill}
                      className="rounded-md border border-primary/20 bg-card px-3 py-1 text-sm text-primary/90 transition-colors hover:border-accent hover:text-accent"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
