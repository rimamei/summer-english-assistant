import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup';
import '@/assets/main.css';
import ErrorBoundary from '@/components/base/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>
  </React.StrictMode>
);
