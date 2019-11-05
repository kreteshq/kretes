const TypeScriptConfig = require('tsconfig-paths-webpack-plugin');

module.exports = {
  devServer: {
    proxy: {
      '/rest': {
        target: 'http://localhost:5544',
        pathRewrite: { '^/rest': '' }
      },
      '/graphql': {
        target: 'http://localhost:5544'
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('ts')
      .use('ts-loader')
      .loader('ts-loader')
      .tap(options => {
        Object.assign(options || {}, { configFile: 'config/client/tsconfig.json' })
        return options
      })

    config.plugin('html').tap(args => {
      args[0].template = 'config/client/index.html';
      return args;
    });

    config.plugin('fork-ts-checker').tap(args => {
      args[0].tsconfig = 'config/client/tsconfig.json';
      return args;
    });

    config.resolve.alias.delete('@');
    config.resolve.plugin('tsconfig-paths').use(
      new TypeScriptConfig({
        configFile: 'config/client/tsconfig.json',
        baseUrl: '.'
      })
    );

    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule.use('vue-svg-loader').loader('vue-svg-loader');
  },

  css: {
    loaderOptions: {
      sass: {
        data: '@import "features/base/stylesheet/main.scss";'
      }
    }
  }
};
