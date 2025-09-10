import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Removed StrictMode to prevent double rendering which can cause authentication issues
root.render(
  <App />
);
