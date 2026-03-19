import { createEventBus, createCommand } from '@naikidev/commiq';
import { marketStore } from './market/store.js';
import { chartStore } from './chart/store.js';
import { orderStore } from './order/store.js';
import { portfolioStore } from './portfolio/store.js';
import { uiStore } from './ui/store.js';
import { orderbookStore } from './orderbook/store.js';
import { searchStore } from './search/store.js';
import { OrderEvent, MarketEvent, UiEvent } from './events.js';

export const bus = createEventBus();

// Connect all stores to the bus
bus.connect(marketStore);
bus.connect(chartStore);
bus.connect(orderStore);
bus.connect(portfolioStore);
bus.connect(uiStore);
bus.connect(orderbookStore);
bus.connect(searchStore);

// ── Cross-store coordination ──

// OrderFilled -> update portfolio holdings
bus.on(OrderEvent.Filled, (event) => {
  const { order } = event.data;
  portfolioStore.queue(
    createCommand('portfolio:updateHolding', {
      pair: order.pair,
      side: order.side,
      amount: order.amount,
      price: order.filledPrice ?? order.price,
    }),
  );
});

// PriceUpdated -> update portfolio P&L for held pairs
bus.on(MarketEvent.PriceUpdated, (event) => {
  portfolioStore.queue(
    createCommand('portfolio:updatePrice', {
      pair: event.data.ticker.pair,
      price: event.data.ticker.price,
    }),
  );
});

// PairSelected -> load chart for new pair
bus.on(UiEvent.PairSelected, (event) => {
  chartStore.queue(createCommand('chart:loadPair', { pair: event.data.pair }));
});

// OrderPlaced -> info toast
bus.on(OrderEvent.Placed, (event) => {
  const { order } = event.data;
  uiStore.queue(
    createCommand('ui:addToast', {
      message: `Order placed: ${order.side.toUpperCase()} ${order.amount} ${order.pair}`,
      type: 'info' as const,
    }),
  );
});

// OrderFilled -> success toast
bus.on(OrderEvent.Filled, (event) => {
  const { order } = event.data;
  uiStore.queue(
    createCommand('ui:addToast', {
      message: `Filled: ${order.side.toUpperCase()} ${order.amount} ${order.pair} @ $${order.filledPrice}`,
      type: 'success' as const,
    }),
  );
});

// OrderRejected -> error toast
bus.on(OrderEvent.Rejected, (event) => {
  uiStore.queue(
    createCommand('ui:addToast', {
      message: `Rejected: ${event.data.reason}`,
      type: 'error' as const,
    }),
  );
});
