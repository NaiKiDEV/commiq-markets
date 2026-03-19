import { useSelector } from '@naikidev/commiq-react';
import type { TradingPair } from '@commiq-markets/shared';
import { marketStore } from './store.js';

export function useMarketPairs() {
  return useSelector(marketStore, (s) => s.allPairs);
}

export function useTicker(pair: TradingPair) {
  return useSelector(marketStore, (s) => s.byPair[pair]);
}

export function useMarketConnected() {
  return useSelector(marketStore, (s) => s.connected);
}
