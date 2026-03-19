import { usePortfolio } from '../stores/portfolio/hooks.js';

export function Portfolio() {
  const { positions, cashBalance, totalValue } = usePortfolio();

  return (
    <div className="bg-surface-card rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Portfolio
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface rounded-lg p-2.5">
          <div className="text-xs text-gray-500 mb-0.5">Total Value</div>
          <div className="text-sm font-mono font-bold">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-surface rounded-lg p-2.5">
          <div className="text-xs text-gray-500 mb-0.5">Cash</div>
          <div className="text-sm font-mono font-bold">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Positions */}
      {positions.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-2">No open positions</p>
      ) : (
        <div className="space-y-1">
          {positions.map((pos) =>
            pos ? (
              <div
                key={pos.pair}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-surface-hover"
              >
                <div>
                  <span className="font-semibold text-gray-200">{pos.pair}</span>
                  <span className="text-gray-500 ml-2 font-mono">{pos.amount.toFixed(4)}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-gray-300">
                    ${(pos.amount * pos.currentPrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`font-mono ${
                      pos.unrealizedPnl >= 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}
                  >
                    {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
