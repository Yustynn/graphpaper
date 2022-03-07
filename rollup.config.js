import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'

export default {
    input: 'src/index.js',
    output: {
      file: 'app.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
        json(),
        nodeResolve(),
        commonjs()
    ]
  };