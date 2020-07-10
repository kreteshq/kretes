import { Handler, response } from 'kretes';

const { OK } = response;

export const browse: Handler = ({ params }) => {
  return OK('Hello, Kretes!');
}
