import { defineConfig } from 'vite';

export default defineConfig({
  // Ruta relativa para poder publicar en una subcarpeta (GitHub Pages).
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
