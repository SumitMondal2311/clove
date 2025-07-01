import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/web.ts', 'src/api.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    external: ['dotenv'],
    clean: true,
});
