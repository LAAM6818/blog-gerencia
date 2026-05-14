import { defineCollection } from "astro:content"
import { z } from "astro/zod"
import { glob } from "astro/loaders"

const blog = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: "./src/content",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    banner: z.string().optional(),
  }),
})

export const collections = { blog }