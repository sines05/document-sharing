// FIX: Manually defining types for `import.meta.env` as a workaround for a configuration issue
// where Vite's client types could not be resolved.
// FIX: Wrap in `declare global` to augment the global type from within a module.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly BASE_URL: string;
    };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
