import { useSelector } from '@naikidev/commiq-react';
import { chartStore } from './store.js';

export function useChartCandles() {
  return useSelector(chartStore, (s) => s.candles);
}

export function useChartPair() {
  return useSelector(chartStore, (s) => s.pair);
}

export function useChartStatus() {
  return useSelector(chartStore, (s) => s.status);
}

export function useChartInterval() {
  return useSelector(chartStore, (s) => s.interval);
}
