import { render } from 'solid-js/web';
import { App } from '@/components';

const dispose = render(
  () => <App />, 
  document.getElementById('app')!
);