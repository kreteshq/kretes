// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

const debug = require('debug')('server'); // eslint-disable-line no-unused-vars
const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs-extra');
const rollup = require('rollup');
const loadConfigFile = require('rollup/dist/loadConfigFile');
const WebSocket = require('ws');
const color = require('chalk');

const cwd = process.cwd();
const VERSION = require('../../package.json').version;

const client = async () => {
  console.log(
    color`{bold.blue ┌ Kretes} {bold ${VERSION}} \n{bold.blue └ }{blue Client-Side Compilation}\n  {grey Hot Reload} {green enabled}`
  );

  await fs.ensureDir(join(cwd, 'modules'));

  const template = join(cwd, 'config/client', 'index.html');
  const tmpl = (await fs.readFile(template)).toString('utf8');
  const bodyCloseTag = tmpl.lastIndexOf('</body>');
  let prefix = '';

  const bundles = ['index.js'];

  // FIXME Only in development
  const livereload = `
    var socket = new WebSocket("ws://localhost:35544/");

    socket.onmessage = function (event) {
      history.pushState(null, null, '/');
      location.reload();
    }
`
  const injected = [
    tmpl.slice(0, bodyCloseTag),
    ...bundles.map(b => `<script type="module" src="${prefix || ''}${b}"></script>\n`),
    `<script>${livereload}</script>`,
    tmpl.slice(bodyCloseTag, tmpl.length)
  ].join('');

  try {
    await new Promise((resolve, reject) => {
      const child = spawn('npx', ['snowpack', '--dest', 'modules'], {
        stdio: ['inherit', 'inherit', 'ignore']
      });
      child.on('exit', code => {
        if (code) reject(new Error('exit code 1'))
        else resolve();
      });
    });
  } catch (error) {
    console.log(error);
  }

  await fs.copy(join(cwd, 'modules'), join(cwd, 'public', 'modules'));
  await fs.outputFile(join(cwd, 'public', 'index.html'), injected);

  const wss = new WebSocket.Server({ port: 35544 });

  loadConfigFile(join(cwd, 'config/client/rollup.config.js'), { format: 'esm' })
    .then(async ({options, warnings}) => {
      console.log(`  ${warnings.count} warnings`);

      warnings.flush();

      const bundle = await rollup.rollup(options[0]);
      await Promise.all(options[0].output.map(bundle.write));

      const watcher = rollup.watch(options[0]);

      wss.on('connection', function connection(ws) {
        watcher.on('event', event => {
          if (event.code == 'END') ws.send('reload');
          if (event.code == 'ERROR') console.error(event.frame);
        });
      });

      console.log(color`  {bold.underline http://localhost:5544}`);
    });
};

module.exports = {
  builder: _ => _,
  handler: client
};
