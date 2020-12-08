import { Handler, response } from 'kretes';

const { OK } = response;

const Cities = [
  { city: 'New York City', ip: '1.1.0.1' },
  { city: 'Paris', ip: '2.2.0.2' },
  { city: 'Warsaw', ip: '3.3.0.3' }
]

export const browse: Handler = ({ params }) => {
  const cityAtRandom = Cities[Math.floor(Math.random() * Cities.length)];
  return OK(cityAtRandom);
}
