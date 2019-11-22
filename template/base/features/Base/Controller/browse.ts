import { Handler } from 'huncwot';
import { OK } from 'huncwot/response';

const browse: Handler = ({ params }) => {
  return OK('Hello, Huncwot!');
}

export = browse;
