/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages publica el juego en https://mikeljka.github.io/Zenit/space-harvest/ (cada juego en su subcarpeta)
export default defineConfig({
  base: '/Zenit/space-harvest/',
  build: { target: 'es2022', chunkSizeWarningLimit: 2000 },
  test: { include: ['tests/**/*.test.ts'] },
});
