import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */

export const config = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        ignores: ['dist', 'node_modules', '.next'],
    },
];
