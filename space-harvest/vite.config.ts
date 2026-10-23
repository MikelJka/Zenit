/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// La versión web de prueba irá en https://mikeljka.github.io/Zenit/space-harvest/ (la mayúscula importa)
export default defineConfig({
  base: '/Zenit/space-harvest/',
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'] },
});
