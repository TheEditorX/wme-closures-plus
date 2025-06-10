import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';

/** @type {import('eslint').Linter.Config[]} */
export default [
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  includeIgnoreFile(fileURLToPath(new URL('.eslintignore', import.meta.url))),
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    languageOptions: { globals: globals.browser },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: pluginReactHooks.configs.recommended.rules,
  },
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'linebreak-style': ['error', 'unix'],
    },
  },
];
