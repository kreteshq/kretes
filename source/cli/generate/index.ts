import * as controller from './controller';
import * as component from './component';
import * as type from './type';
import * as password from './password-hash';

export default function(_: any) {
  _.command([
    controller,
    component,
    type,
    password
  ])
}