import React, { useState } from 'react';
import { QueryCache, ReactQueryCacheProvider, useQuery } from 'react-query';

const queryCache = new QueryCache()

const request = () => fetch('https://freegeoip.app/json/').then(response => response.json());

function App() {
  const [name, setName] = useState('Kretes');
  const { data, isLoading, error } = useQuery('ip', request);

  if (isLoading) return 'Loading...'
  if (error) return 'Error: ' + error.message;

  const { country_name, city, ip } = data;

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <div className="max-w-2xl mx-auto">
        <div className="text-xl">
          Hello, <span className="font-semibold">{name}</span>
        </div>
        <div className="text-gray-400">
          You are now in {country_name}, {city} and your IP is {ip}
        </div>
      </div>
    </ReactQueryCacheProvider>
  );
}

export { App };
