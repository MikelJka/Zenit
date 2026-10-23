/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages publica la versión web de prueba en https://mikeljka.github.io/Zenit/space-harvest/
export default defineConfig({
  base: '/Zenit/space-harvest/',
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'] },
});
