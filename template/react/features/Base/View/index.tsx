import React, { useState } from 'react';
import { QueryCache, ReactQueryCacheProvider, useQuery } from 'react-query';

const queryCache = new QueryCache()

interface City {
  city: string
  ip: string
}

// This path is set in `features/Base/Controller/browse.ts`,
// this file contains an action that responds when
// triggering `/base`
const request = () => fetch('/base').then(response => response.json());

function App() {
  const [name] = useState('Kretes');
  const { data, isLoading, error } = useQuery<City, Error>('example', request);

  if (isLoading) return 'Loading...'
  if (error) return 'Error: ' + error.message;

  const { city, ip } = data;

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <div className="max-w-2xl mx-auto">
        <div className="text-3xl">
          Hello, <span className="font-semibold">{name}</span>
        </div>
        <div className="text-gray-400 text-lg">
          You are now in {city} and your IP is {ip}
        </div>
        <div className="text-gray-400">(refresh this page)</div>
      </div>
    </ReactQueryCacheProvider>
  );
}

export { App };
