/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages publicará la versión web de prueba en https://mikeljka.github.io/Zenit/space-harvest/ (repositorio MikelJka/Zenit; la mayúscula importa)
export default defineConfig({
  base: '/Zenit/space-harvest/',
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'] },
});
