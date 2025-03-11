const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./src/index.ts', './src/workers/race.ts'], // worker 需要是獨立的檔案，才能分開使用。
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    target: 'esnext',
    sourcemap: true,
}).catch(() => process.exit(1));
