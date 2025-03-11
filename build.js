const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./src/index.ts', './src/workers/race.ts'], // Adjust the entry point as needed
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    target: 'esnext',
    sourcemap: true,
}).catch(() => process.exit(1));
