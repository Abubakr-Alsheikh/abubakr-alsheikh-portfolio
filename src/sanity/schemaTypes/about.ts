// src/sanity/schemaTypes/about.ts
import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "About Section",
  type: "document",
  // Make this a singleton document
  // __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      initialValue: "About Me",
    }),
    defineField({
      name: "profileImage",
      title: "Profile Image",
      description: "Image for the interactive card.",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description Paragraph",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "skills",
      title: "Skill Categories",
      type: "array",
      of: [
        {
          type: "object",
          name: "skillCategory",
          title: "Skill Category",
          fields: [
            { name: "categoryTitle", type: "string", title: "Category Title" },
            {
              name: "skillList",
              type: "array",
              title: "List of Skills",
              of: [{ type: "string" }],
            },
          ],
        },
      ],
    }),
  ],
});
