const util = require('util');
const color = require('chalk');
const { parse } = require('url');
const stackParser = require('error-stack-parser');
const httpstatus = require('http-status');

const explain = require('./explainer');

const displayStatusCode = statusCode =>
  ({
    2: color`{green ${statusCode}}`,
    3: color`{cyan ${statusCode}}`,
    4: color`{blue ${statusCode}}`
  }[~~(statusCode / 100)]);

class Logger {
  static printRequestResponse(context) {
    const { request, response, params } = context;
    const { method } = request;
    const { pathname, _query } = parse(context.request.url, true); // TODO Test perf vs RegEx
    const { statusCode } = response;

    console.log(
      color`┌ {magenta ${method}} {bold ${pathname}} → ${displayStatusCode(statusCode)} ${
        httpstatus[statusCode]
      }
└ {gray Params}
${util.inspect(params, { compact: false, colors: true, sorted: true }).slice(2, -2)}`
    );
  }

  static printError(error, layer = 'General') {
    console.error(
      color`  {bold.red Error} {bold.underline ${error.message}}
  {gray Explanation} \n  ${explain.for(error)}
\n  {gray Stack trace}`
    );

    for (let message of stackParser.parse(error)) {
      console.error(color`  - {yellow ${message.functionName}}
    {bold ${message.fileName}}:{bold.underline.cyan ${message.lineNumber}}`);
    }
  }
}

module.exports = Logger;
