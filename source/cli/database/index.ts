import * as console from './console';
import * as create from './create';
import * as init from './init';
import * as reset from './reset';
import * as setup from './setup';
import * as start from './start';
import * as stop from './stop';
import * as seed from './seed';

export default function(_: any) {
  _.command([
    console,
    create,
    init,
    reset,
    setup,
    start,
    stop,
    seed,
  ])
  .demandCommand(1, 'You need at least one command before moving on')
}