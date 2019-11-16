import ts from "@wessberg/rollup-plugin-ts";
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const modules = () => ({
  resolveId(importee) {
    if (importee.startsWith('@')) {
      return { id: importee.replace('@', '.'), external: true };
    }
    return null;
  }
})

export default {
  input: 'config/client/index.ts',
  output: {
    dir: "public"
  },
  watch: {
    chokidar: true,
    exclude: 'node_modules/**'
  },
  plugins: [
    modules(),
    ts({ tsconfig: "config/client/tsconfig.json" }),
    serve('public'),
    livereload('public')
  ],
}
