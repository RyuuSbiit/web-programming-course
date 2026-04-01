import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: [
      'e2e/**',
      'node_modules/**',
      'mock-server/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        'e2e/**',
        'mock-server/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'generated/**'
      ],
    },
  },
});
