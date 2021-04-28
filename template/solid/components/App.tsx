import { Component, createResource, createSignal, Switch, Match } from 'solid-js';
import { City } from '../types'

const request = () => fetch('/_api/base').then(response => response.json());

export const App: Component = () => {
  const [name] = createSignal('Kretes');
  const [data] = createResource<City, string>('base', request)
  const [count, setCount] = createSignal(1);
  const increment = (by = 1) => setCount(count() + by);
  const decrement = (by = 1) => setCount(count() - by);

  return (
    <main>
      <section>
        <Switch fallback={"Failed to load"}>
          <Match when={data.loading}>Loading...</Match>
          <Match when={data.error}>Something Went Wrong</Match>
          <Match when={data()}>{({ city, ip }) =>
            <header>
              <img src="/huncwot.svg" width="120" />
              <h1>
                Hello, <span className="font-semibold">{name}</span>
              </h1>
              <div>
                You are now in {city} and your IP is {ip}
              </div>
              <small>(refresh the page)</small>
              <hr />
              <h2>{count()}</h2>
              <p>
                <a href="#" onClick={() => decrement()}><b>Dec</b></a>
                <a href="#" onClick={() => increment()}><b>Inc</b></a>
              </p>
              <small>(play with the counter)</small>
            </header>
          }</Match>
        </Switch>
      </section>
    </main>
  );
};