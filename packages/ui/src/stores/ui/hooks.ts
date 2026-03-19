import { useSelector, useQueue } from '@naikidev/commiq-react';
import type { TradingPair } from '@commiq-markets/shared';
import { uiStore } from './store.js';
import { UiCommand } from './commands.js';

export function useSelectedPair() {
  return useSelector(uiStore, (s) => s.selectedPair);
}

export function useSelectPair() {
  const queue = useQueue(uiStore);
  return (pair: TradingPair) => queue(UiCommand.selectPair(pair));
}

export function useToasts() {
  return useSelector(uiStore, (s) => s.toasts);
}
