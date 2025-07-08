import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/server.ts'],
    format: ['esm'],
    clean: true,
    outDir: 'dist',
    external: ['dotenv', '@clove/database', '@clove/logger'],
});
