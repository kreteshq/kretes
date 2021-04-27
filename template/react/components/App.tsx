import React, { useState } from 'react';
import { useQuery } from 'react-query';

import { City } from '../types';

// This path is set at `site/_api/base/browse.ts`,
// this file contains an action that responds when
// triggering `/base`
const request = () => fetch('/_api/base').then(response => response.json());

export const App: React.FC = () => {
  const [name] = useState('Kretes');
  const { data, isLoading, error } = useQuery<City, Error>('example', request);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { city, ip } = data as City;

  return (
    <main>
      <section>
        <header>
          <h1>
            Hello, <span className="font-semibold">{name}</span>
          </h1>
          <div>
            You are now in {city} and your IP is {ip}
          </div>
          <small>(refresh this page)</small>
        </header>
      </section>
    </main>
  );
}
