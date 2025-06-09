import globals from 'globals';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/no-unknown-property': ['error', { 
        ignore: [
          'args',
          'attach',
          'position',
          'rotation',
          'scale',
          'intensity',
          'groundColor',
          'castShadow',
          'receiveShadow',
          'shadow-mapSize',
          'shadow-bias',
          'shadow-camera-far',
          'penumbra',
          'roughness',
          'metalness',
          'envMapIntensity',
          'object'
        ] 
      }],
      'react/prop-types': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
