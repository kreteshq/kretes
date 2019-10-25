// const path = require('path');
// const resolve = dir => path.join(__dirname, dir);

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
    const docs = config.module;

    config.plugin('html').tap(args => {
      args[0].template = 'config/client/index.html';
      return args;
    });

    config.plugin('fork-ts-checker').tap(args => {
      args[0].tsconfig = 'config/client/tsconfig.json';
      return args;
    });

    config.resolve.alias.delete('@');
    config.resolve
      .plugin('tsconfig-paths')
      .use(require('tsconfig-paths-webpack-plugin'));

    docs
      .rule('docs')
      .resourceQuery(/blockType=docs/)
      .type('javascript/auto')
      .use('docs')
      .loader('./config/loaders/docs.js')
      .end();

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
