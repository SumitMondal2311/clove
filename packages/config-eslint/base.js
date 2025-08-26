import js from "@eslint/js";
import configPrettier from "eslint-config-prettier";
import pluginTurbo from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export const config = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    configPrettier,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "error",
                },
            ],
        },
    },
    {
        plugins: {
            turbo: pluginTurbo,
        },
        rules: {
            "turbo/no-undeclared-env-vars": "warn",
        },
    },
];
