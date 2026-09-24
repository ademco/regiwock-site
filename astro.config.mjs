// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL } from './src/config.ts';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
