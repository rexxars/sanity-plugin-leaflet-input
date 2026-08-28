// @env node

import {defineConfig} from 'tsdown'

const config = defineConfig({
  clean: true,
  css: {inject: true},
  deps: {neverBundle: ['react', 'react-dom', 'sanity']},
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  minify: false,
  platform: 'browser',
  sourcemap: true,
  target: 'es2022',
})

export {config as default}
