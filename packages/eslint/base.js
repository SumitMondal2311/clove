import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */

export const config = [
    {
        ignores: ['.turbo', 'node_modules', 'dist', '.next'],
    },
    js.configs.recommended,
    prettier,
    ...tseslint.configs.recommended,
];
