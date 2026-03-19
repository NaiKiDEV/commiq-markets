import { createCommand } from '@naikidev/commiq';
import type { CandleInterval, OhlcCandle, TradingPair } from '@commiq-markets/shared';

export const ChartCommand = {
  loadPair: (pair: TradingPair) =>
    createCommand('chart:loadPair', { pair }),

  replaceCandles: (candles: OhlcCandle[], pair?: TradingPair) =>
    createCommand('chart:replaceCandles', { candles, pair }),

  appendCandle: (candle: OhlcCandle) =>
    createCommand('chart:appendCandle', { candle }),

  setInterval: (interval: CandleInterval) =>
    createCommand('chart:setInterval', { interval }),

  resetToSnapshot: () =>
    createCommand('chart:resetToSnapshot', undefined),
};
