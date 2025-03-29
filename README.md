# js-worker-multi-threading

## Summary

- 

## Reference

- https://notes.andywu.tw/2021/node-js%E5%AF%A6%E4%BD%9Cmutex%E4%BA%92%E6%96%A5%E9%8E%96%E9%98%B2%E6%AD%A2%E7%B7%A9%E5%AD%98%E6%93%8A%E7%A9%BF/

## Phases

- phase 1
    - I’m trying to use tsc to compile, but I found that it’s slower than expected and does not support tree shaking. After comparing it with esbuild, webpack (which supports only the browser), and parcel, I decided to use esbuild because it’s written in Go, which provides faster compilation.
        - Tree shaking is the term the JavaScript community uses for dead code elimination
        - In tree shaking, it cannot trace the worker file, so you need to add it manually.