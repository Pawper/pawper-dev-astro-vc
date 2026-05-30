import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Drafts live in src/content/logs/drafts/. They are loaded in dev (so they can be
// previewed on-site and edited via /edit) but excluded from production builds —
// dropping them from the collection here keeps them out of every consumer at once
// (index, /l/[slug], /ls/[slug], and all RSS feeds).
const logsPattern = import.meta.env.DEV ? '**/*.md' : ['**/*.md', '!drafts/**'];

const logs = defineCollection({
  loader: glob({ pattern: logsPattern, base: './src/content/logs' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    kicker: z.string(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    hook: z.string().optional(),
    devto: z.string().optional(),
    series: z.object({
      name: z.string(),
      part: z.number().optional(),
      total: z.number().optional(),
    }).optional(),
    noThumb: z.array(z.string()).optional(),
    mentor: z.boolean().optional(),
  }),
});

export const collections = { logs };
