import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://minecraft-server.example.com',
  integrations: [],
  prefetch: {
    defaultStrategy: 'hover'
  }
});