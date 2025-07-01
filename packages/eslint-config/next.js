import pluginNext from '@next/eslint-plugin-next';
import { config as reactConfig } from './react.js';

/** @type {import('eslint').Linter.Config[]} */

export const config = [
    {
        plugins: {
            '@next/next': pluginNext,
        },
        rules: {
            ...pluginNext.configs['core-web-vitals'].rules,
            ...pluginNext.configs.recommended.rules,
        },
    },
    ...reactConfig,
];
