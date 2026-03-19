import { useMatchedPairs, useSearchQuery, useSetSearchQuery } from '../stores/search/hooks.js';
import { PriceTile } from './PriceTile.js';

export function MarketOverview() {
  const matchedPairs = useMatchedPairs();
  const query = useSearchQuery();
  const setQuery = useSetSearchQuery();

  return (
    <div className="flex items-center gap-1.5 bg-surface-card rounded px-2 py-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 shrink-0 mr-1">
        Markets
      </span>
      <div className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0">
        {matchedPairs.map((pair) => (
          <PriceTile key={pair} pair={pair} />
        ))}
        {matchedPairs.length === 0 && (
          <span className="text-[10px] text-gray-500 px-2">No pairs match</span>
        )}
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="bg-surface rounded px-2 py-0.5 text-[11px] text-white placeholder-gray-600
                   outline-none focus:ring-1 focus:ring-accent-blue/40 w-24 shrink-0 font-mono"
      />
    </div>
  );
}
