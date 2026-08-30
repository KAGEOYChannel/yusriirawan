import React from 'react';
import ReactDOM from 'react-dom/client';
import PerkalianApp from './PerkalianApp';
import './index.css';

const rootElement = document.getElementById('perkalian-root') || document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PerkalianApp />
    </React.StrictMode>
  );
}
