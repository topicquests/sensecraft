// eslint.config.mjs
import pluginVue from 'eslint-plugin-vue';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
  // configureVueProject,
} from '@vue/eslint-config-typescript';
// import globals from 'globals';
import parser from 'vue-eslint-parser';
import cucumber from 'eslint-plugin-cucumber';

// configureVueProject({});

export default defineConfigWithVueTs(
  {
    ignores: ['dist', '.quasar', 'node_modules'],
  },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommendedTypeChecked,
  {
    ignores: ['dist', '.quasar', 'node_modules'],
    plugins: {
      pluginVue,
      cucumber,
    },
    languageOptions: {
      globals: {
        // ...globals.browser,
        ga: 'readonly',
        __statics: 'readonly',
        process: 'readonly',
        server_url: 'readonly',
      },

      ecmaVersion: 'latest',
      sourceType: 'module',

      parser: parser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'prefer-promise-reject-errors': 'warn',
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': ['off'],
    },
  },
);
