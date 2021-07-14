import { Component, createSignal, Switch, Match } from 'solid-js';
import { Counter } from './Counter';
import { DataFetcher } from './DataFetcher';

export const App: Component = () => {
  const [name] = createSignal('Kretes');

  return (
    <main class="container">
      <section class="content">
        <header>
          <img src="/huncwot.svg" width="120" />
          <h1 class="title">
            Hello, <a>{name}</a>!
          </h1>
          <p class="lead">
            This is the Solid.js setup. <br />
            Your application entry point is <code>site/_client.tsx</code>
          </p>

          <div class="grid grid-3">
            <a href="https://kretes.dev/docs/guide/" class="card">
              <h2>Documentation</h2>
            </a>
            <a href="https://kretes.dev/docs/tutorial/" class="card">
              <h2>Tutorial</h2>
            </a>
            <a href="https://www.solidjs.com" class="card">
              <h2>Solid.js Docs</h2>
            </a>
          </div>
        </header>

        <div class="grid grid-2">
          <div class="example">
            <div class="header">
              <h2>
                Example 1: Data Fetcher<br />
              </h2>
              <div>Located at <code>client/components/DataFetcher.tsx</code></div>
            </div>
            <DataFetcher />
          </div>

          <div class="example">
            <div class="header">
              <h2>
                Example 2: Counter<br />
              </h2>
              <div>Located at <code>client/components/Counter.tsx</code></div>
            </div>
            <Counter />
          </div>
        </div>

      </section>
    </main >
  );
};
