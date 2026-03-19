import { createCommand } from '@naikidev/commiq';
import { createEffects } from '@naikidev/commiq-effects';
import { portfolioStore } from './portfolio/store.js';
import { searchStore } from './search/store.js';
import { orderStore } from './order/store.js';
import { MarketEvent, SearchEvent, OrderEvent } from './events.js';

// ── Portfolio: debounced recalculation ──
// Price updates fire rapidly; total value recalc only needs to happen every 500ms
const portfolioEffects = createEffects(portfolioStore);

portfolioEffects.on(
  MarketEvent.PriceUpdated,
  (_data, ctx) => {
    ctx.queue(createCommand('portfolio:recalculate', undefined));
  },
  { debounce: 500 },
);

// ── Search: restartOnNew ──
// When search query changes rapidly (typing), restart the filter effect
// Previous in-flight filter is cancelled and restarted with latest query
const searchEffects = createEffects(searchStore);

searchEffects.on(
  SearchEvent.QueryChanged,
  async (data, ctx) => {
    // In a real app this could be an API call; restartOnNew ensures
    // rapid typing only processes the final query
    console.log('[search:effect] Filtering for:', data.query);
  },
  { restartOnNew: true, debounce: 200 },
);

// ── Orders: cancelOn ──
// Monitor pending orders — cancel monitoring when any order fills
const orderEffects = createEffects(orderStore);

orderEffects.on(
  OrderEvent.Placed,
  async (data, ctx) => {
    console.log('[order:effect] Monitoring order:', data.order.id);
  },
  { cancelOn: OrderEvent.Filled },
);

export { portfolioEffects, searchEffects, orderEffects };
