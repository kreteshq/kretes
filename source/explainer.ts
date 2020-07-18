// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import __ from 'chalk';

const explanations = {
  'relation "(\\w+)" does not exist': matches =>
    __`I cannot find the table named {underline ${matches[1]}} in your database. Have you run {underline kretes database setup} before starting the application?`,
  'connect ECONNREFUSED 127.0.0.1:5432': _matches =>
    'It looks like you haven\'t started your database server.'
};

const wrap = (text, prepand = '', width = 80) =>
  text.replace(
    new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'),
    `$1\n${prepand}`
  );

export const forError = error => {
  for (let [pattern, explanation] of Object.entries(explanations)) {
    let matches = error.message.match(pattern);
    if (matches) return wrap(explanation(matches), '  ');
  }
  return wrap('(missing)', '  ');
}
