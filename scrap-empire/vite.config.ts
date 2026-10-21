/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages publica la versión web de prueba en https://mikeljka.github.io/IdleScrapyard/
export default defineConfig({
  // Con CAPACITOR=1 (paquete de Android) la web se sirve desde dentro de la app, con rutas relativas.
  base: process.env.CAPACITOR ? './' : '/IdleScrapyard/',
  build: { target: 'es2022' },
  test: { include: ['tests/**/*.test.ts'] },
});
