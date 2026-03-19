import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { initTransport } from './transport/ws-bridge.js';
import './index.css';

// Initialize event bus wiring (side-effect import)
import './stores/bus.js';
// Initialize effects (side-effect import)
import './stores/effects.js';
// Initialize OpenTelemetry instrumentation (side-effect import)
import './stores/otel.js';

// Connect to WebSocket server
initTransport(`ws://localhost:4200`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
