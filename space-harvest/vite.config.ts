import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/Zenit/space-harvest/',
  test: { include: ['tests/**/*.test.ts'] },
});
