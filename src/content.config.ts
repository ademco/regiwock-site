import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per item in src/content/work/. Create them with `npm run new`.
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    type: z.enum(['stream', 'music', 'post', 'drop']),
    title: z.string(),
    date: z.coerce.date(),
    url: z.string(),
    // iframe src for the click-to-load player; '' = derive from url (or link out)
    embed: z.string().default(''),
    // image URL or /thumbs/... path; '' = derive from url, else a typographic tile
    thumbnail: z.string().default(''),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { work };
