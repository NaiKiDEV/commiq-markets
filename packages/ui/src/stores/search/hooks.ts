import { useSelector, useQueue } from '@naikidev/commiq-react';
import { searchStore } from './store.js';
import { SearchCommand } from './commands.js';

export function useSearchQuery() {
  return useSelector(searchStore, (s) => s.query);
}

export function useMatchedPairs() {
  return useSelector(searchStore, (s) => s.matchedPairs);
}

export function useSetSearchQuery() {
  const queue = useQueue(searchStore);
  return (query: string) => queue(SearchCommand.setQuery(query));
}
