import globals from "globals";
import { config as baseConfig } from "./base.js";

export const config = [
    ...baseConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        ignores: [".turbo", "node_modules", "dist", "generated"],
    },
];
