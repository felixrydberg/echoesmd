import { defineCollection, z } from 'astro:content';

const changelog = defineCollection({
  type: 'content',
  schema: z.object({
    "release-date": z.string(),
    "version": z.string(),
    "early-access": z.boolean(),
    "published": z.boolean(),
  }),
})

export const collections = { 
  changelog
};
