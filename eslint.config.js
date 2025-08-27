import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        browser: true,
        node: true,
        es2021: true,
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'no-undef': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/sw.js',
      'public/workbox-*.js',
      'dist/**',
      'build/**',
      'coverage/**',
    ],
  },
];
