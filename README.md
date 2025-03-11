# js-worker-multi-threading

## Summary

- 

## Phases

- phase 1
    - I’m trying to use tsc to compile, but I found that it’s slower than expected and does not support tree shaking. After comparing it with esbuild, webpack (which supports only the browser), and parcel, I decided to use esbuild because it’s written in Go, which provides faster compilation.
        - Tree shaking is the term the JavaScript community uses for dead code elimination
        - In tree shaking, it cannot trace the worker file, so you need to add it manually.
- phase 2
    - 