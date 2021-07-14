import { h, FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';

import { City } from '@/types';

export const App: FunctionComponent = () => {
  const [name] = useState('Kretes');
  const [counter, setCounter] = useState(1);

  return (
    <main class="container">
      <section class="content">
        <header>
          <img src="/huncwot.svg" width="120" />
          <h1 class="title">
            Hello, <a>{name}</a>!
          </h1>
          <p class="lead">
            This is the Preact setup. <br />
            Your application entry point is <code>site/_client.tsx</code>
          </p>

          <div class="grid grid-3">
            <a href="https://kretes.dev/docs/guide/" class="card">
              <h2>Documentation</h2>
            </a>
            <a href="https://kretes.dev/docs/tutorial/" class="card">
              <h2>Tutorial</h2>
            </a>
            <a href="https://preactjs.com" class="card">
              <h2>Preact Docs</h2>
            </a>
          </div>

          <div>
            <h2>{counter}</h2>
            <p>
              <a class="button" href="#" onClick={() => setCounter(counter - 1)}><b>Dec</b></a>
              <a class="button" href="#" onClick={() => setCounter(counter + 1)}><b>Inc</b></a>
            </p>
            <small>(play with the counter)</small>
          </div>
        </header>
      </section>
    </main >
  );
}
