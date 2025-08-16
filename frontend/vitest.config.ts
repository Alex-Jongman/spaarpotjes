import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
      '../tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
