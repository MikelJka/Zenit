import { defineConfig } from 'vite';

// Base de GitHub Pages: https://mikeljka.github.io/Zenit/space-harvest/
export default defineConfig({
  base: '/Zenit/space-harvest/',
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'] },
});
