require('marko/node-require');

const __current = process.cwd();
const isProduction = false;

require('lasso').configure({
  plugins: ['lasso-marko'],
  outputDir: __current + '/static',
  urlPrefix: "/",
  bundlingEnabled: isProduction, // Only enable bundling in production
  minify: isProduction, // Only minify JS and CSS code in production
  fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
});

function page(name, bindings) {
  const template = require(`${__current}/pages/${name}.marko`);
  return template.stream(bindings);
}

module.exports = { page };
