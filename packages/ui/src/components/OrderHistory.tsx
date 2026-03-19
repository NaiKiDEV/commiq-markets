import { useRef } from 'react';
import { useOrders } from '../stores/order/hooks.js';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  accepted: 'text-accent-blue',
  filled: 'text-accent-green',
  rejected: 'text-accent-red',
  cancelled: 'text-gray-500',
};

export function OrderHistory() {
  const orders = useOrders();
  const seenIdsRef = useRef<Set<string>>(new Set());

  return (
    <div className="bg-surface-card rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Order History
      </h2>

      {orders.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-4">No orders yet</p>
      ) : (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {orders.map((order) => {
            const isNew = !seenIdsRef.current.has(order.id);
            if (isNew) seenIdsRef.current.add(order.id);

            return (
              <div
                key={order.id}
                className={`flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-surface-hover ${
                  isNew ? 'animate-slide-down' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      order.side === 'buy' ? 'text-accent-green' : 'text-accent-red'
                    }`}
                  >
                    {order.side.toUpperCase()}
                  </span>
                  <span className="text-gray-300">{order.pair}</span>
                  <span className="text-gray-500 font-mono">{order.amount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-400">
                    ${(order.filledPrice ?? order.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                  <span className={`${statusColors[order.status] ?? 'text-gray-500'} capitalize transition-colors duration-300`}>
                    {order.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
