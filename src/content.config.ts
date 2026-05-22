import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const logs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/logs' }),
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
  }),
});

export const collections = { logs };
