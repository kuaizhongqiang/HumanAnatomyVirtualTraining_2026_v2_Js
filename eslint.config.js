import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// 不引 globals 包，只声明实际用到的运行时全局，缺了会被 no-undef 抓到
const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
};

const browserGlobals = {
  console: 'readonly',
  window: 'readonly',
  document: 'readonly',
  localStorage: 'readonly',
  setTimeout: 'readonly',
};

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'release/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: browserGlobals },
  },
  {
    files: ['**/*.mjs', '*.config.ts', '*.config.js', 'eslint.config.js'],
    languageOptions: { globals: nodeGlobals },
  },
);
