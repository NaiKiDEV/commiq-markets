import { useMatchedPairs, useSearchQuery, useSetSearchQuery } from '../stores/search/hooks.js';
import { PriceTile } from './PriceTile.js';

export function MarketOverview() {
  const matchedPairs = useMatchedPairs();
  const query = useSearchQuery();
  const setQuery = useSetSearchQuery();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Markets</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pairs..."
          className="bg-surface rounded px-3 py-1 text-xs text-white placeholder-gray-600
                     outline-none focus:ring-1 focus:ring-accent-blue w-40"
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {matchedPairs.map((pair) => (
          <PriceTile key={pair} pair={pair} />
        ))}
        {matchedPairs.length === 0 && (
          <p className="text-xs text-gray-600 col-span-full text-center py-4">No pairs match your search</p>
        )}
      </div>
    </div>
  );
}
