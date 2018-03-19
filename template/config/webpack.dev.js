const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    overlay: true,
    open: true,
    inline: true,
    hot: true,
    proxy: {
      '/rest': {
        target: 'http://localhost:5544',
        pathRewrite: {'^/rest' : ''}
      },
      '/graphql': {
        target: 'http://localhost:5544'
      }
    },
    watchOptions: {
      poll: false
    }
  },
  devtool: '#eval-source-map',
});
