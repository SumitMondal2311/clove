import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    external: ['@clove/env', '@clove/database'],
    clean: true,
});
