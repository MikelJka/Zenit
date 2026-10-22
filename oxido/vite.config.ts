/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages publica el juego en https://mikeljka.github.io/zenit/oxido/ (sitio de Zenit; cada juego en su subcarpeta)
export default defineConfig({
  base: '/zenit/oxido/',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    // Algunos tests generan 20 mapas grandes.
    testTimeout: 30_000,
  },
});
