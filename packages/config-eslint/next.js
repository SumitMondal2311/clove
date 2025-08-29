import pluginNext from "@next/eslint-plugin-next";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { config as baseConfig } from "./base.js";

export const config = [
    {
        plugins: {
            "react-hooks": pluginReactHooks,
        },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
        },
    },
    {
        plugins: {
            react: pluginReact,
        },
        rules: {
            ...pluginReact.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/no-unescaped-entities": "off",
        },
    },
    {
        plugins: {
            "@next/next": pluginNext,
        },
        rules: {
            ...pluginNext.configs["core-web-vitals"].rules,
            ...pluginNext.configs.recommended.rules,
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
                version: "detect",
            },
        },
    },
    {
        ignores: [".turbo", "node_modules", ".next", "next-env.d.ts"],
    },
];
