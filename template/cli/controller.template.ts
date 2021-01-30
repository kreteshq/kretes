import { Handler, response } from 'kretes';

const { OK } = response;

export const ${action}: Handler = async ({ /* request params */ }) => {
  // body of your action

  return OK(/* response content */);
}
