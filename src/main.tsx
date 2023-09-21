import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';

import './index.css';
import { OptionsProvider } from './hooks/useOptions.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsProvider>
      <App />
    </OptionsProvider>
  </React.StrictMode>
);
