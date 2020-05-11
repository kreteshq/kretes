const nearley = require('nearley');
const grammar = require('./interface.js');

const parser = input => {
  const p = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  p.feed(input);
  return p.results[0];
};

module.exports = {
  parser
};
