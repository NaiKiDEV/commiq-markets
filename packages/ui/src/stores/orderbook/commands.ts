import { createCommand } from '@naikidev/commiq';
import type { OrderBookLevel, TradingPair } from '@commiq-markets/shared';

export const OrderBookCommand = {
  loadSnapshot: (pair: TradingPair, bids: OrderBookLevel[], asks: OrderBookLevel[]) =>
    createCommand('orderbook:loadSnapshot', { pair, bids, asks }),

  update: (pair: TradingPair, bids: OrderBookLevel[], asks: OrderBookLevel[]) =>
    createCommand('orderbook:update', { pair, bids, asks }),

  clear: () =>
    createCommand('orderbook:clear', undefined),
};
