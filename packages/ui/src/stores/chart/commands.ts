import { createCommand } from '@naikidev/commiq';
import type { OhlcCandle, TradingPair } from '@commiq-markets/shared';

export const ChartCommand = {
  loadPair: (pair: TradingPair) =>
    createCommand('chart:loadPair', { pair }),

  replaceCandles: (candles: OhlcCandle[]) =>
    createCommand('chart:replaceCandles', { candles }),

  appendCandle: (candle: OhlcCandle) =>
    createCommand('chart:appendCandle', { candle }),
};
