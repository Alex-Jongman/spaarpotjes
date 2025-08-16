// ESLint Flat Config for Spaarpot Frontend
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  // Ignore built output and dependencies
  { ignores: ['dist/**', 'node_modules/**'] },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript rules for source files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      // Browser globals for app code and tests
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Let TypeScript handle undefineds
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Node globals for config files
  {
    files: ['**/*.config.ts', 'vite.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
