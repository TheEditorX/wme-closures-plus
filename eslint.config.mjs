import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';

/** @type {import('eslint').Linter.Config[]} */
export default [
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  {
    ignores: ['src/tampermonkey/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
    settings: {
      react: {
        version: '19.0',
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs['recommended-latest'],
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  eslintConfigPrettier,
];
