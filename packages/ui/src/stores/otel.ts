import { instrumentStore } from '@naikidev/commiq-otel';
import { marketStore } from './market/store.js';
import { chartStore } from './chart/store.js';
import { orderStore } from './order/store.js';
import { portfolioStore } from './portfolio/store.js';
import { uiStore } from './ui/store.js';
import { orderbookStore } from './orderbook/store.js';
import { searchStore } from './search/store.js';

// Instrument all stores with OpenTelemetry tracing
// Each command handled creates a span for observability
const cleanups = [
  instrumentStore(marketStore, { storeName: 'market' }),
  instrumentStore(chartStore, { storeName: 'chart' }),
  instrumentStore(orderStore, { storeName: 'order' }),
  instrumentStore(portfolioStore, { storeName: 'portfolio' }),
  instrumentStore(uiStore, { storeName: 'ui' }),
  instrumentStore(orderbookStore, { storeName: 'orderbook' }),
  instrumentStore(searchStore, { storeName: 'search' }),
];

export { cleanups };
