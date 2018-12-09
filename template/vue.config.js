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
      args[0].template = 'client/index.html';
      return args;
    });

    docs
      .rule('docs')
      .resourceQuery(/blockType=docs/)
      .type('javascript/auto')
      .use('docs')
      .loader('./config/loaders/docs.js')
      .end();
  }
};
