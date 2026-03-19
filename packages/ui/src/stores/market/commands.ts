import { createCommand } from '@naikidev/commiq';
import type { Ticker } from '@commiq-markets/shared';

export const MarketCommand = {
  loadSnapshot: (tickers: Ticker[]) =>
    createCommand('market:loadSnapshot', { tickers }),

  updateTicker: (ticker: Ticker) =>
    createCommand('market:updateTicker', { ticker }),

  setConnected: (connected: boolean) =>
    createCommand('market:setConnected', { connected }),
};
