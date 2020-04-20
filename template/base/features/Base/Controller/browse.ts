import { Handler } from 'kretes';
import { OK } from 'kretes/response';

const browse: Handler = ({ params }) => {
  return OK('Hello, Kretes!');
}

export = browse;
