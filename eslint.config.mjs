import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';
import tanstackQuery from '@tanstack/eslint-plugin-query';

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
      '@tanstack/query': tanstackQuery
    },
    rules: {
      '@tanstack/query/no-unstable-deps': 'error'
    }
  }
];

export default eslintConfig;
