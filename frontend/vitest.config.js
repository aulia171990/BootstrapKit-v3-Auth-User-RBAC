import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/design-system/__tests__/setup.js'],
    include: ['src/design-system/**/*.test.{js,jsx}', 'src/passenger/**/*.test.{js,jsx}'],
  },
});
