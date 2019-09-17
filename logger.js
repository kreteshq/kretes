const color = require('chalk');
const { parse } = require('url');
const stackParser = require('error-stack-parser');

const explain = require('./explainer');

class Logger {
  static printRequestResponse(context) {
    const { request, response } = context;
    const { method } = request;
    const { pathname, _query } = parse(context.request.url, true); // TODO Test perf vs RegEx
    const { statusCode } = response;
    const statusMessage = '';

    console.log(
      color`{green ●} {magenta ${method}} {bold ${pathname}} -> {red ${statusCode}} ${statusMessage}`
    );
  }

  static printError(error, layer = 'General') {
    console.error(
      color`{red ●} {bold.red Error}{gray /}${layer}: {bold ${error.message}}
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
