import { createStore, sealStore } from '@naikidev/commiq';
import { withPatch } from '@naikidev/commiq-context';
import type { TradingPair } from '@commiq-markets/shared';
import { UiEvent } from '../events.js';

export type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
};

export type ReconnectInfo = {
  active: boolean;
  attempt: number;
  nextRetryMs: number;
};

export type UiState = {
  selectedPair: TradingPair;
  toasts: Toast[];
  reconnecting: ReconnectInfo | null;
};

const _store = createStore<UiState>({
  selectedPair: 'BTC/USD',
  toasts: [],
  reconnecting: null,
})
  .useExtension(withPatch<UiState>());

// Select a trading pair — withPatch for single-field update
_store.addCommandHandler<{ pair: TradingPair }>('ui:selectPair', (ctx, cmd) => {
  ctx.patch({ selectedPair: cmd.data.pair });
  ctx.emit(UiEvent.PairSelected, { pair: cmd.data.pair });
});

// Toast management
_store.addCommandHandler<{ message: string; type: Toast['type'] }>('ui:addToast', (ctx, cmd) => {
  const toast: Toast = {
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    message: cmd.data.message,
    type: cmd.data.type,
    timestamp: Date.now(),
  };
  ctx.patch({ toasts: [...ctx.state.toasts, toast] });
  ctx.emit(UiEvent.ToastAdded, toast);
});

_store.addCommandHandler<{ id: string }>('ui:removeToast', (ctx, cmd) => {
  ctx.patch({ toasts: ctx.state.toasts.filter((t) => t.id !== cmd.data.id) });
});

// Reconnection state
_store.addCommandHandler<{ attempt: number; nextRetryMs: number }>('ui:setReconnecting', (ctx, cmd) => {
  ctx.patch({ reconnecting: { active: true, attempt: cmd.data.attempt, nextRetryMs: cmd.data.nextRetryMs } });
});

_store.addCommandHandler('ui:clearReconnecting', (ctx) => {
  ctx.patch({ reconnecting: null });
});

export const uiStore = sealStore(_store);
