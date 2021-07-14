import { Component, createResource, Switch, Match } from 'solid-js';
import { City } from '@/types'

const request = () => fetch('/_api/base').then(response => response.json());

export const DataFetcher: Component = () => {
  const [data] = createResource<City, string>('base', request)

  return (
    <Switch fallback={"Failed to load"}>
      <Match when={data.loading}>Loading...</Match>
      <Match when={data()}>{({ city, ip }) =>
        <div>
          <p>
            You are now in {city} and your IP is {ip}
          </p>
          <small>(refresh the page)</small>
        </div>
      }</Match>
    </Switch>
  );
};
