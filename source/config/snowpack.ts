import { SnowpackUserConfig } from 'snowpack';

export const SnowpackConfig = {
  root: process.cwd(),
  alias: {
    '@/components': './app/components',
    '@/hooks': './app/hooks',
    '@/types': './app/types',
  },
  mount: {
    "app/components": '/@/components/',
    "app/hooks": '/@/hooks/',
    stylesheets: '/stylesheets/',
    site: '/',
    static: { url: '/', static: true, resolve: false },
  },
  packageOptions: {},
  exclude: [
    '**/site/_api/**/*', 
    '**/app/controllers/**/*',
  ],
  devOptions: {
    hmr: true,
    port: 3333,
    open: 'none',
    output: 'stream',
  },
  buildOptions: {
    out: 'public',
    watch: false
  },
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018'
  }
} as SnowpackUserConfig;