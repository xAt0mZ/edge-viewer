import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';

import './index.css';
import { OptionsProvider } from './hooks/useOptions.tsx';
import { LinksProvider } from './hooks/useLinks.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsProvider>
      <LinksProvider>
        <App />
      </LinksProvider>
    </OptionsProvider>
  </React.StrictMode>
);
