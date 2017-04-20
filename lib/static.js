const debug = require('debug')('huncwot:static');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs-extra"));
const path = require('path');
const assert = require('assert');

function static(root, opts = { index: 'index.html' }) {
  assert(root, 'you need to specify `root` directory');

  debug('"%s" %j', root, opts);
  return async (ctx, next) => {
    if (ctx.request.method === 'HEAD' || ctx.request.method == 'GET') {

      try {
        let file = path.join(root, ctx.request.url);
        let stats = await fs.statAsync(file);

        if (stats.isDirectory()) {
          return next();
        }

        ctx.response.setHeader('Content-Type', 'application/html');
        ctx.response.setHeader('Content-Length', stats.size);
        ctx.body = fs.createReadStream(file);
      } catch (error) {
        console.log(error.message);
        return next();
      }

      // return send(ctx, ctx.path, opts).then(done => {
      //   if (!done) {
      //     return next();
      //   }
      // });
    } else {
      return next();
    }
  }
}

module.exports = static;
