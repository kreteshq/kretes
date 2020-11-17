import React, { useState } from 'react';

function App() {
  const [name, setName] = useState('Kretes');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 bg-white shadow">
        Hello, <span className="font-semibold">{name}</span>
      </div>
    </div>
  );
}

export { App };
