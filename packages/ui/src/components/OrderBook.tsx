import { useOrderBook } from '../stores/orderbook/hooks.js';

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export function OrderBook() {
  const { bids, asks, spread, spreadPercent } = useOrderBook();

  const maxTotal = Math.max(
    asks[asks.length - 1]?.total ?? 0,
    bids[bids.length - 1]?.total ?? 0,
    1,
  );

  const visibleAsks = [...asks].reverse().slice(0, 10);
  const visibleBids = bids.slice(0, 10);

  return (
    <div className="bg-surface-card rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Order Book
      </h2>

      {/* Header */}
      <div className="grid grid-cols-3 text-[10px] text-gray-500 mb-1 px-1">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (reversed: lowest ask nearest to spread) */}
      <div className="space-y-px">
        {visibleAsks.map((level, i) => (
          <div key={`ask-${i}`} className="relative grid grid-cols-3 text-[11px] py-0.5 px-1">
            <div
              className="absolute right-0 top-0 bottom-0 bg-accent-red/10 transition-all duration-300"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-accent-red font-mono">{formatPrice(level.price)}</span>
            <span className="relative text-right text-gray-400 font-mono">{level.quantity.toFixed(4)}</span>
            <span className="relative text-right text-gray-500 font-mono">{level.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="text-center py-1.5 text-[11px] border-y border-gray-800 my-1">
        <span className="text-gray-500">Spread </span>
        <span className="font-mono text-gray-300">{formatPrice(spread)}</span>
        <span className="text-gray-600 ml-1">({spreadPercent.toFixed(3)}%)</span>
      </div>

      {/* Bids */}
      <div className="space-y-px">
        {visibleBids.map((level, i) => (
          <div key={`bid-${i}`} className="relative grid grid-cols-3 text-[11px] py-0.5 px-1">
            <div
              className="absolute right-0 top-0 bottom-0 bg-accent-green/10 transition-all duration-300"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-accent-green font-mono">{formatPrice(level.price)}</span>
            <span className="relative text-right text-gray-400 font-mono">{level.quantity.toFixed(4)}</span>
            <span className="relative text-right text-gray-500 font-mono">{level.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {bids.length === 0 && (
        <p className="text-xs text-gray-600 text-center py-4">No orderbook data</p>
      )}
    </div>
  );
}
