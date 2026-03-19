import { usePortfolio } from '../stores/portfolio/hooks.js';

export function Portfolio() {
  const { positions, cashBalance, totalValue } = usePortfolio();

  return (
    <div className="h-full flex flex-col bg-surface-card border border-surface-border rounded overflow-hidden">
      {/* Header with summary inline */}
      <div className="shrink-0 flex items-center justify-between px-2.5 py-1.5 border-b border-surface-border">
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">Portfolio</span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-gray-600">
            Cash <span className="text-gray-400">${cashBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </span>
          <span className="text-gray-600">
            Total <span className="text-white font-semibold">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </span>
        </div>
      </div>

      {/* Positions */}
      {positions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-gray-700 font-mono">No positions</span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {positions.map((pos) =>
            pos ? (
              <div
                key={pos.pair}
                className="flex items-center justify-between text-[10px] py-1 px-2.5
                           border-b border-surface-border/50 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-300">{pos.pair}</span>
                  <span className="text-gray-600 font-mono">{pos.amount.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-gray-500">
                    ${(pos.amount * pos.currentPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span
                    className={`font-mono text-[9px] ${
                      pos.unrealizedPnl >= 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}
                  >
                    {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
