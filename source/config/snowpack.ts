import { SnowpackUserConfig } from 'snowpack';

export const SnowpackConfig = {
  root: process.cwd(),
  alias: {
    '@/components': './components',
    '@/hooks': './hooks',
    '@/types': './types',
  },
  mount: {
    components: '/@/components/',
    hooks: '/@/hooks/',
    site: '/',
    public: { url: '/', static: true, resolve: false },
  },
  packageOptions: {},
  exclude: ['**/site/_api/**/*', '**/controllers/**/*'],
  devOptions: {
    hmr: true,
    port: 3333,
    open: 'none',
    output: 'stream',
  },
  buildOptions: {
    out: 'public',
    watch: false
  }
} as SnowpackUserConfig;