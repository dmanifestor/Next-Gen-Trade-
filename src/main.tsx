import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party background rejection noise (e.g. Firebase Installations / Analytics 400 in iframe sandboxes)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    if (
      msg.includes('installations/request-failed') ||
      msg.includes('Installations: Create Installation request failed') ||
      msg.includes('Firebase: Error (auth/cancelled-popup-request)')
    ) {
      event.preventDefault();
      console.warn('Handled external rejection:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
