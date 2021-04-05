import * as schedule from './schedule';
import * as start from './start';

export default function(_: any) {
  _.command([
    schedule,
    start,
  ])
}