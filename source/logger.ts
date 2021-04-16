import util from 'util';
import color from 'chalk';
import { parse } from 'url';
import stackParser from 'error-stack-parser';
import httpstatus from 'http-status';

import * as explain from './explainer';
import { Request } from 'retes';

const displayStatusCode = statusCode =>
  ({
    2: color`{green ${statusCode}}`,
    3: color`{cyan ${statusCode}}`,
    4: color`{blue ${statusCode}}`
  }[~~(statusCode / 100)]);

export default class Logger {
  static printRequestResponse(context: Request) {
    const { response, params, method } = context;
    const { pathname, query } = parse(context.url, true); // TODO Test perf vs RegEx
    const { statusCode } = response;

    // obfuscate certain params
    const SensitiveParams = ['password']
    const paramsCopy = {...params};
    for (const p of SensitiveParams) {
      if (paramsCopy[p]) paramsCopy[p] = '(redacted)'
    }

    // hide internal requests for the browser
    if (!(pathname.startsWith("/_snowpack") || pathname.startsWith("/@/") || pathname.startsWith("/favicon.ico"))) {
      console.log(
        color`┌ {magenta ${method}} {bold ${pathname}} →  ${displayStatusCode(statusCode)} ${
          httpstatus[statusCode]
        }
└ {gray Params}
${util.inspect(paramsCopy, { compact: false, colors: true, sorted: true }).slice(2, -2)}`
      );
    }
  }

  static printError(error, layer = 'General') {
    console.error(
      color`  {bold.red Error} {bold.underline ${error.message}}
  {gray Explanation} \n  ${explain.forError(error)}
\n  {gray Stack trace}`
    );

    for (let message of stackParser.parse(error)) {
      console.error(color`  - {yellow ${message.functionName}}
    {bold ${message.fileName}}:{bold.underline.cyan ${message.lineNumber}}`);
    }
  }
}
