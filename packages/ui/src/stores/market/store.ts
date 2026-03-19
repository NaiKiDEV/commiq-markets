import { createStore, sealStore } from '@naikidev/commiq';
import { withPatch } from '@naikidev/commiq-context';
import type { Ticker, TradingPair } from '@commiq-markets/shared';
import { MarketEvent } from '../events.js';

// Normalized state pattern: byPair (Record) + allPairs (ordered list)
export type MarketState = {
  byPair: Record<string, Ticker>;
  allPairs: TradingPair[];
  connected: boolean;
  lastUpdated: number | null;
};

const initialState: MarketState = {
  byPair: {},
  allPairs: [],
  connected: false,
  lastUpdated: null,
};

const _store = createStore<MarketState>(initialState)
  .useExtension(withPatch<MarketState>());

// Load initial snapshot — normalizes ticker array into byPair map
_store.addCommandHandler<{ tickers: Ticker[] }>('market:loadSnapshot', (ctx, cmd) => {
  const byPair: Record<string, Ticker> = {};
  const allPairs: TradingPair[] = [];

  for (const ticker of cmd.data.tickers) {
    byPair[ticker.pair] = ticker;
    allPairs.push(ticker.pair);
  }

  ctx.setState({ byPair, allPairs, connected: true, lastUpdated: Date.now() });
  ctx.emit(MarketEvent.SnapshotReceived, { tickers: cmd.data.tickers });
});

// Single ticker update from WebSocket — uses withPatch for partial update
_store.addCommandHandler<{ ticker: Ticker }>('market:updateTicker', (ctx, cmd) => {
  const { ticker } = cmd.data;
  ctx.patch({
    byPair: { ...ctx.state.byPair, [ticker.pair]: ticker },
    lastUpdated: ticker.timestamp,
  });
  ctx.emit(MarketEvent.PriceUpdated, { ticker });
});

// Connection status
_store.addCommandHandler<{ connected: boolean }>('market:setConnected', (ctx, cmd) => {
  ctx.patch({ connected: cmd.data.connected });
});

export const marketStore = sealStore(_store);
