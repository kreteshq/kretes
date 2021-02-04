import { Handler, response } from 'kretes';

const { OK } = response;

const Cities = [
  { city: 'New York City', ip: '11.11.0.11' },
  { city: 'Paris', ip: '22.22.0.22' },
  { city: 'Warsaw', ip: '33.33.0.33' }
]

export const browse: Handler = ({ params }) => {
  const cityAtRandom = Cities[Math.floor(Math.random() * Cities.length)];
  return OK(cityAtRandom);
}
