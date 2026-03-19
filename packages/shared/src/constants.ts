import type { TradingPair } from './types.js';

export const TRADING_PAIRS: TradingPair[] = [
  'BTC/USD',
  'ETH/USD',
  'SOL/USD',
  'DOGE/USD',
  'ADA/USD',
  'XRP/USD',
];

export const BASE_PRICES: Record<TradingPair, number> = {
  'BTC/USD': 87250,
  'ETH/USD': 2030,
  'SOL/USD': 135,
  'DOGE/USD': 0.17,
  'ADA/USD': 0.72,
  'XRP/USD': 2.35,
};

export const VOLATILITY: Record<TradingPair, number> = {
  'BTC/USD': 0.002,
  'ETH/USD': 0.003,
  'SOL/USD': 0.005,
  'DOGE/USD': 0.008,
  'ADA/USD': 0.006,
  'XRP/USD': 0.004,
};

/** Price display precision per pair — { decimals, minMove } */
export const PRICE_PRECISION: Record<TradingPair, { precision: number; minMove: number }> = {
  'BTC/USD': { precision: 2, minMove: 0.01 },
  'ETH/USD': { precision: 2, minMove: 0.01 },
  'SOL/USD': { precision: 3, minMove: 0.001 },
  'DOGE/USD': { precision: 5, minMove: 0.00001 },
  'ADA/USD': { precision: 4, minMove: 0.0001 },
  'XRP/USD': { precision: 4, minMove: 0.0001 },
};

export const WS_PORT = 4200;
export const STARTING_CASH = 100_000;

export const CANDLE_INTERVAL_MS: Record<import('./types.js').CandleInterval, number> = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
};
