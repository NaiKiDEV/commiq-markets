import { useSelector } from '@naikidev/commiq-react';
import type { TradingPair } from '@commiq-markets/shared';
import { portfolioStore } from './store.js';

export function usePortfolio() {
  const holdings = useSelector(portfolioStore, (s) => s.holdings);
  const allHoldingPairs = useSelector(portfolioStore, (s) => s.allHoldingPairs);
  const cashBalance = useSelector(portfolioStore, (s) => s.cashBalance);
  const totalValue = useSelector(portfolioStore, (s) => s.totalValue);

  return {
    positions: allHoldingPairs.map((pair) => holdings[pair]),
    cashBalance,
    totalValue,
  };
}

export function useCashBalance() {
  return useSelector(portfolioStore, (s) => s.cashBalance);
}

export function useTotalValue() {
  return useSelector(portfolioStore, (s) => s.totalValue);
}

export function useHolding(pair: TradingPair) {
  return useSelector(portfolioStore, (s) => s.holdings[pair] ?? null);
}
