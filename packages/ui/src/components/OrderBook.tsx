import { useOrderBook } from '../stores/orderbook/hooks.js';
import { useChartStatus } from '../stores/chart/hooks.js';

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-px px-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="grid grid-cols-3 py-1 gap-2">
          <div className="h-2.5 bg-white/[0.03] rounded animate-pulse" style={{ width: `${55 + Math.random() * 35}%` }} />
          <div className="h-2.5 bg-white/[0.03] rounded animate-pulse ml-auto" style={{ width: `${40 + Math.random() * 40}%` }} />
          <div className="h-2.5 bg-white/[0.03] rounded animate-pulse ml-auto" style={{ width: `${45 + Math.random() * 35}%` }} />
        </div>
      ))}
    </div>
  );
}

export function OrderBook() {
  const { bids, asks, spread, spreadPercent } = useOrderBook();
  const chartStatus = useChartStatus();

  const isLoading = chartStatus === 'loading' && bids.length === 0 && asks.length === 0;

  const maxTotal = Math.max(
    asks[asks.length - 1]?.total ?? 0,
    bids[bids.length - 1]?.total ?? 0,
    1,
  );

  const visibleAsks = [...asks].reverse().slice(0, 10);
  const visibleBids = bids.slice(0, 10);

  return (
    <div className="h-full flex flex-col bg-surface-card rounded overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Order Book</span>
      </div>

      {/* Column labels */}
      <div className="shrink-0 grid grid-cols-3 text-[9px] text-gray-500 font-mono uppercase px-2.5 py-0.5 border-b border-white/[0.03]">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center">
          <SkeletonRows />
          <div className="py-1.5 flex justify-center">
            <div className="h-2.5 bg-white/[0.03] rounded animate-pulse w-20" />
          </div>
          <SkeletonRows />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {/* Asks */}
          <div className="space-y-px mt-auto">
            {visibleAsks.map((level, i) => (
              <div key={`ask-${i}`} className="relative grid grid-cols-3 text-[10px] py-px px-2.5">
                <div
                  className="absolute right-0 top-0 bottom-0 transition-all duration-300"
                  style={{
                    width: `${(level.total / maxTotal) * 100}%`,
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  }}
                />
                <span className="relative text-accent-red font-mono">{formatPrice(level.price)}</span>
                <span className="relative text-right text-gray-400 font-mono">{level.quantity.toFixed(4)}</span>
                <span className="relative text-right text-gray-500 font-mono">{level.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Spread */}
          <div className="shrink-0 text-center py-1 text-[10px] border-y border-white/[0.04] my-px">
            <span className="text-gray-400 font-mono">
              {formatPrice(spread)} <span className="text-gray-500">({spreadPercent.toFixed(3)}%)</span>
            </span>
          </div>

          {/* Bids */}
          <div className="space-y-px">
            {visibleBids.map((level, i) => (
              <div key={`bid-${i}`} className="relative grid grid-cols-3 text-[10px] py-px px-2.5">
                <div
                  className="absolute right-0 top-0 bottom-0 transition-all duration-300"
                  style={{
                    width: `${(level.total / maxTotal) * 100}%`,
                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  }}
                />
                <span className="relative text-accent-green font-mono">{formatPrice(level.price)}</span>
                <span className="relative text-right text-gray-400 font-mono">{level.quantity.toFixed(4)}</span>
                <span className="relative text-right text-gray-500 font-mono">{level.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {bids.length === 0 && (
            <p className="text-[10px] text-gray-600 text-center py-4 font-mono">No data</p>
          )}
        </div>
      )}
    </div>
  );
}
