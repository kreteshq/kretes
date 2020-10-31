import path from 'path';
import stackTrace from 'stack-trace';
import { promises as fs } from 'fs';
import cookie from 'cookie';
import { Request } from 'retes';

import { render } from './view';

const startingSlashRegex = /\\|\//;

interface Error {
  name: string;
  message: string;
  stack?: string;
  status?: string;
}

export default class HTMLifiedError {
  codeRange: number;
  skipHeaders: string[];
  error: Error;
  request: Request;

  constructor(error, request) {
    this.codeRange = 5;
    this.skipHeaders = ['cookie', 'connection', 'dnt'];
    this.error = error;
    this.request = request;
  }

  async provideSnippetForFrame(frame) {
    const path = frame.getFileName().replace(/dist\/webpack:\//g, '');

    const content = await fs.readFile(path, 'utf-8');
    const lines = content.split(/\r?\n/);
    const lineNumber = frame.getLineNumber();

    return {
      pre: lines.slice(Math.max(0, lineNumber - (this.codeRange + 1)), lineNumber - 1),
      line: lines[lineNumber - 1],
      post: lines.slice(lineNumber, lineNumber + this.codeRange)
    };
  }

  async parse() {
    const stack = stackTrace.parse(this.error);

    return Promise.all(
      stack.map(async frame => {
        if (this.isNode(frame)) {
          return frame;
        }

        const context = await this.provideSnippetForFrame(frame);
        frame.context = context;

        return frame;
      })
    );
  }

  getContext(frame) {
    if (!frame.context) return {};

    const { pre, line, post } = frame.context;
    return {
      start: frame.getLineNumber() - (pre || []).length,
      pre: pre.join('\n'),
      line,
      post: post.join('\n')
    };
  }

  constructCSSClasses(frame, index) {
    const classes = [];

    if (index === 0) classes.push('active');
    if (!frame.isApp) classes.push('native-frame');

    return classes.join(' ');
  }

  convertFrameToObject(frame) {
    const relativeFileName =
      frame.getFileName().indexOf(process.cwd()) > -1
        ? frame
          .getFileName()
          .replace(process.cwd(), '')
          .replace(startingSlashRegex, '')
        : frame.getFileName();

    return {
      file: relativeFileName,
      filePath: frame.getFileName(),
      method: frame.getFunctionName(),
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
      context: this.getContext(frame),
      isModule: this.isNodeModule(frame),
      isNative: this.isNode(frame),
      isApp: this.isApp(frame),
      classes: null
    };
  }

  isNode(frame) {
    if (frame.isNative()) return true;

    const filename = frame.getFileName() || '';
    return !path.isAbsolute(filename) && filename[0] !== '.';
  }

  isApp(frame) {
    return !this.isNode(frame) && !this.isNodeModule(frame);
  }

  isNodeModule(frame) {
    return (frame.getFileName() || '').indexOf('node_modules' + path.sep) > -1;
  }

  convertFramesToObjects(stack, callback) {
    const { message, name, status } = this.error;
    return {
      message,
      name,
      status,
      request: null,
      frames:
        stack instanceof Array === true
          ? stack.filter(frame => frame.getFileName()).map(callback)
          : []
    };
  }

  convertRequestToObject() {
    const headers = [];

    for (let header in this.request.headers) {
      if (this.skipHeaders.includes(header)) continue;

      headers.push({
        key: header.toUpperCase(),
        value: this.request.headers[header]
      });
    }

    // @ts-ignore
    const parsedCookies = cookie.parse(this.request.headers.cookie || '');
    const cookies = Object.keys(parsedCookies).map(key => ({ key, value: parsedCookies[key] }));
    const { url, method } = this.request;

    return { url, method, headers, cookies };
  }

  async generate() {
    const stack = await this.parse();

    const context = this.convertFramesToObjects(stack, (frame, index) => {
      const serializedFrame = this.convertFrameToObject(frame);
      serializedFrame.classes = this.constructCSSClasses(serializedFrame, index);
      return serializedFrame;
    });

    context.request = this.convertRequestToObject();

    const resources = path.join(__dirname, '..', 'resources');
    const filepath = path.join(resources, 'error.html');
    const content = await fs.readFile(filepath, 'utf-8');

    return render(content, { context, paths: [resources] });
  }
}
