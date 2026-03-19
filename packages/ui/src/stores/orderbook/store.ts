import { createStore, sealStore, createCommand } from '@naikidev/commiq';
import { withPatch } from '@naikidev/commiq-context';
import type { OrderBookLevel, TradingPair } from '@commiq-markets/shared';
import { OrderBookEvent, UiEvent } from '../events.js';

export type OrderBookState = {
  pair: TradingPair | null;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
};

const _store = createStore<OrderBookState>({
  pair: null,
  bids: [],
  asks: [],
  spread: 0,
  spreadPercent: 0,
}).useExtension(withPatch<OrderBookState>());

function calcSpread(bids: OrderBookLevel[], asks: OrderBookLevel[]) {
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = bestAsk > 0 ? (spread / bestAsk) * 100 : 0;
  return { spread, spreadPercent };
}

_store.addCommandHandler<{ pair: TradingPair; bids: OrderBookLevel[]; asks: OrderBookLevel[] }>(
  'orderbook:loadSnapshot',
  (ctx, cmd) => {
    const { pair, bids, asks } = cmd.data;
    const { spread, spreadPercent } = calcSpread(bids, asks);
    ctx.setState({ pair, bids, asks, spread, spreadPercent });
    ctx.emit(OrderBookEvent.SnapshotReceived, { pair });
  },
);

_store.addCommandHandler<{ pair: TradingPair; bids: OrderBookLevel[]; asks: OrderBookLevel[] }>(
  'orderbook:update',
  (ctx, cmd) => {
    const { pair, bids, asks } = cmd.data;
    if (ctx.state.pair !== pair) return;
    const { spread, spreadPercent } = calcSpread(bids, asks);
    ctx.patch({ bids, asks, spread, spreadPercent });
    ctx.emit(OrderBookEvent.Updated, { pair });
  },
);

_store.addCommandHandler('orderbook:clear', (ctx) => {
  ctx.setState({ pair: null, bids: [], asks: [], spread: 0, spreadPercent: 0 });
});

// addEventHandler: react to pair selection WITHIN the store (commiq feature showcase)
// When a new pair is selected via the UI, clear the orderbook so stale data isn't shown
_store.addEventHandler(UiEvent.PairSelected, (ctx) => {
  ctx.queue(createCommand('orderbook:clear', undefined));
});

export const orderbookStore = sealStore(_store);
