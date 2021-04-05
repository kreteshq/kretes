import * as build from './build';
import * as start from './start';

export default function(_: any) {
  _.command([
    build,
    start,
  ])
}