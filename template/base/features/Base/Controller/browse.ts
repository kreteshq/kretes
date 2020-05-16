import { Handler, response } from 'kretes';

const { OK } = response;

const browse: Handler = ({ params }) => {
  return OK('Hello, Kretes!');
}

export = browse;
