import { createStore, sealStore } from '@naikidev/commiq';
import { withPatch } from '@naikidev/commiq-context';
import type { TradingPair } from '@commiq-markets/shared';
import { TRADING_PAIRS } from '@commiq-markets/shared';
import { SearchEvent } from '../events.js';

export type SearchState = {
  query: string;
  matchedPairs: TradingPair[];
};

const _store = createStore<SearchState>({
  query: '',
  matchedPairs: [...TRADING_PAIRS],
}).useExtension(withPatch<SearchState>());

// notify: true → auto-emits a built-in "commandHandled" event (handledEvent feature)
_store.addCommandHandler<{ query: string }>(
  'search:setQuery',
  (ctx, cmd) => {
    const { query } = cmd.data;
    const matchedPairs = query.trim() === ''
      ? [...TRADING_PAIRS]
      : TRADING_PAIRS.filter((pair) =>
          pair.toLowerCase().includes(query.toLowerCase()),
        );
    ctx.patch({ query, matchedPairs });
    ctx.emit(SearchEvent.QueryChanged, { query });
    ctx.emit(SearchEvent.ResultsUpdated, { matchedPairs });
  },
  { notify: true },
);

export const searchStore = sealStore(_store);
