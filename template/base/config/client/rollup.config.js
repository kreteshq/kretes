import ts from '@wessberg/rollup-plugin-ts';

export default {
  input: 'config/client/index.ts',
  output: {
    dir: 'public',
    sourcemap: true
  },
  watch: {
    chokidar: true,
    exclude: 'node_modules/**'
  },
  plugins: [
    ts({ tsconfig: 'config/client/tsconfig.json' })
  ]
};
