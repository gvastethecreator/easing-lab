/// <reference types="vitest/config" />

import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite-plus';

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  resolve: {
    alias: {
      '@': workspaceRoot,
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          gsap: ['gsap'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['dist/**', 'coverage/**', 'logs/**', 'migrated_prompt_history/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
    },
  },
  lint: {
    ignorePatterns: ['dist/**', 'coverage/**', 'logs/**', 'migrated_prompt_history/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    experimentalSortPackageJson: true,
  },
  run: {
    cache: {
      scripts: true,
      tasks: true,
    },
  },
  staged: {
    '*.{ts,tsx,css,md,json,html}': 'vp check --fix',
  },
});
