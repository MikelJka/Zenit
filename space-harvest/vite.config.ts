import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages: https://mikeljka.github.io/Zenit/space-harvest/ (el repositorio es MikelJka/Zenit, con mayúscula)
  base: '/Zenit/space-harvest/',
  test: { include: ['tests/**/*.test.ts'] },
});
