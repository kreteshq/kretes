import React from 'react';
import { render } from "react-dom";
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient()

import { App } from 'Base/View';

render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById('app')!
);
