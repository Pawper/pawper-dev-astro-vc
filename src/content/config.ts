// eslint-disable-next-line @typescript-eslint/no-deprecated
import { defineCollection, z } from "astro:content";

const logs = defineCollection({
  type: "content",
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
      part: z.number(),
    }).optional(),
  }),
});

export const collections = { logs };
