// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import color from 'chalk';
import { Argv } from 'yargs';
import WebSocket from 'ws';

import Kretes from '../';
import { __compiled } from '../util';
import { App } from '../manifest';

const VERSION = require('../../package.json').version;

export const start = async ({ port, database, snowpack = null }) => {
  const { routes } = require(__compiled('app/routes/index'));
  const { middlewares } = require(__compiled('app/middlewares/index'));

  const app = new Kretes({ routes, middlewares, isDatabase: database, snowpack });
  const server = await app.start(port);

  const wss = new WebSocket.Server({ server });
  wss.on('connection', (socket) => {
    App.WebSockets.add(socket);
    socket.send(JSON.stringify({ type: 'connected' }));

    socket.on('close', () => App.WebSockets.delete(socket));
  });

  wss.on('error', (error: Error & { code: string }) => {
    if (error.code !== 'EADDRINUSE') {
      console.error(`ws error:`);
      console.error(error);
    }
  });

  const onExit = async (_signal) => {
    console.log(color`  {grey Stoping...}`);
    // await app.stop() FIXME is this really necessary?!
    process.exit(0);
  };

  process.on('SIGINT', onExit);
  process.on('SIGTERM', onExit);

  return app;
};

export async function handler({ port, database }: { port: number, database: boolean }) {
  console.log(`${color.bold.blue('Kretes'.padStart(10))} ` + color`{bold ${VERSION}}`);

  await start({ port, database })
}

export const builder = (_: Argv) => _
  .option('port', { alias: 'p', default: 5544 })
  .option('production', { type: 'boolean', default: false })
  .option('database', { type: 'boolean' });
