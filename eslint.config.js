// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import pluginQuery from '@tanstack/eslint-plugin-query';

export default defineConfig([
  ...pluginQuery.configs["flat/recommended"],
  expoConfig,
  {
    ignores: ["dist/*"],
  },
]);
