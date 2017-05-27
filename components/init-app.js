const template = require('./init-app.marko');
const { join } = require('path');

const cwd = process.cwd();
const path = join(cwd, 'assets', 'stylesheets', 'main.css');

module.exports = (input, out) => {
  template.render({ path }, out);
};
