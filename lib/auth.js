const basicAuth = require('basic-auth');

function auth({ users }) {
  return async (context, next) => {
    const credentials = basicAuth(context.request);

    if (credentials && credentials.name && credentials.pass && check(credentials)) {
      await next();
    } else {
      context.response.setHeader('WWW-Authenticate', 'Basic realm=Authorization Required');
      context.response.statusCode = 401;
      context.body = "";
    }
  }

  // closure over `users`
  function check({ name, pass }) {
    for (let k in users) {
      if (name === k && pass == users[k]) {
        return true
      }
    }
    return false
  }
}

module.exports = auth;
