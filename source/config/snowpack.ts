import { SnowpackUserConfig } from 'snowpack';

export const SnowpackConfig = {
  root: process.cwd(),
  alias: {
    '@/components': './client/components',
    '@/hooks': './client/hooks',
    '@/graphql': './client/graphql',
    '@/types': './types',
  },
  mount: {
    'client/components': '/@/components/',
    'client/graphql': '/@/graphql/',
    'client/hooks': '/@/hooks/',
    'client/views': '/',
    stylesheets: '/stylesheets/',
    site: '/',
    static: { url: '/', static: true, resolve: false },
  },
  packageOptions: {},
  exclude: ['**/site/_api/**/*', '**/server/**/*'],
  devOptions: {
    hmr: true,
    port: 3333,
    open: 'none',
    output: 'stream',
  },
  buildOptions: {
    out: 'public',
    watch: false,
  },
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
  },
} as SnowpackUserConfig;
