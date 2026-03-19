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

export const WS_PORT = 4200;
export const STARTING_CASH = 100_000;
