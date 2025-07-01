import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { config as baseConfig } from './base.js';

/** @type {import('eslint').Linter.Config[]} */

export const config = [
    {
        plugins: {
            react: pluginReact,
        },
        rules: {
            ...pluginReact.configs.recommended.rules,
            'react/display-name': 'off',
        },
    },
    {
        plugins: {
            'react-hooks': pluginReactHooks,
        },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
        },
    },
    ...baseConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
