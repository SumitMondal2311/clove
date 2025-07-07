import globals from 'globals';
import { config as baseConfig } from './base.js';

/** @type {import('eslint').Linter.Config[]} */

export const config = [
    {
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
    ...baseConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
