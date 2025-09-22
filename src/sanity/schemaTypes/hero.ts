import { defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero Section",
  type: "document",
  // Make this a singleton document
  // __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    defineField({
      name: "headline",
      title: "Headline (Your Name)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Sub-headline",
      description: "e.g., 'Full-Stack Developer | AI Enthusiast'",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Short Bio",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctaPrimary",
      title: "Primary Call-to-Action Text",
      description: "Text for the main button, e.g., 'View My Work'",
      type: "string",
    }),
    defineField({
      name: "ctaSecondary",
      title: "Secondary Call-to-Action Text",
      description: "Text for the secondary button, e.g., 'Get My CV'",
      type: "string",
    }),
    defineField({
      name: "profileImage",
      title: "Profile Image",
      type: "image",
      options: {
        hotspot: true, // Enables better cropping
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "headline",
    },
  },
});
