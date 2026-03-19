import { createEvent } from '@naikidev/commiq';
import type { CandleInterval, OhlcCandle, Order, Ticker, TradingPair } from '@commiq-markets/shared';

// Market domain events
export const MarketEvent = {
  SnapshotReceived: createEvent<{ tickers: Ticker[] }>('market:snapshotReceived'),
  PriceUpdated: createEvent<{ ticker: Ticker }>('market:priceUpdated'),
};

// Chart domain events
export const ChartEvent = {
  PairSwitched: createEvent<{ pair: TradingPair }>('chart:pairSwitched'),
  CandleReceived: createEvent<{ candle: OhlcCandle }>('chart:candleReceived'),
  IntervalChanged: createEvent<{ interval: CandleInterval }>('chart:intervalChanged'),
};

// Order domain events
export const OrderEvent = {
  Placed: createEvent<{ order: Order }>('order:placed'),
  Accepted: createEvent<{ order: Order }>('order:accepted'),
  Filled: createEvent<{ order: Order }>('order:filled'),
  Rejected: createEvent<{ orderId: string; reason: string }>('order:rejected'),
};

// OrderBook domain events
export const OrderBookEvent = {
  SnapshotReceived: createEvent<{ pair: TradingPair }>('orderbook:snapshotReceived'),
  Updated: createEvent<{ pair: TradingPair }>('orderbook:updated'),
};

// Search domain events
export const SearchEvent = {
  QueryChanged: createEvent<{ query: string }>('search:queryChanged'),
  ResultsUpdated: createEvent<{ matchedPairs: TradingPair[] }>('search:resultsUpdated'),
};

// UI domain events
export const UiEvent = {
  PairSelected: createEvent<{ pair: TradingPair }>('ui:pairSelected'),
  ToastAdded: createEvent<{ id: string; message: string; type: 'success' | 'error' | 'info' }>('ui:toastAdded'),
};
