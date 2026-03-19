import { useSelector } from '@naikidev/commiq-react';
import { orderbookStore } from './store.js';

export function useOrderBook() {
  const bids = useSelector(orderbookStore, (s) => s.bids);
  const asks = useSelector(orderbookStore, (s) => s.asks);
  const spread = useSelector(orderbookStore, (s) => s.spread);
  const spreadPercent = useSelector(orderbookStore, (s) => s.spreadPercent);
  return { bids, asks, spread, spreadPercent };
}
