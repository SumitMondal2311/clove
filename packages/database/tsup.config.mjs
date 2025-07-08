import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    dts: true,
    format: ['esm'],
    clean: true,
});
