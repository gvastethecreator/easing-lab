/// <reference types="vitest/config" />

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const config = {
  plugins: [...react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
            return 'react';
          }

          if (id.includes('/node_modules/gsap/')) {
            return 'gsap';
          }

          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      'dist/**',
      'coverage/**',
      'logs/**',
      'migrated_prompt_history/**',
    ],
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
};

export default config;
