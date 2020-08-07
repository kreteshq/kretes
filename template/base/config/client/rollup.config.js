import ts from '@wessberg/rollup-plugin-ts';

export default {
  input: 'config/client/index.ts',
  output: {
    dir: 'public',
    sourcemap: true,
    paths: {
      tslib: '/modules/tslib.js'
    }
  },
  external: id => id.startsWith('/modules') || id == 'tslib',
  watch: {
    chokidar: true,
    exclude: 'node_modules/**'
  },
  plugins: [
    ts({ tsconfig: 'config/client/tsconfig.json' }),
  ]
};
