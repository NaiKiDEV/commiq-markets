import { useCallback, useRef, useState } from 'react';
import { useEvent } from '@naikidev/commiq-react';
import { useOrders } from '../stores/order/hooks.js';
import { orderStore } from '../stores/order/store.js';
import { OrderEvent } from '../stores/events.js';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  accepted: 'text-accent-blue',
  filled: 'text-accent-green',
  rejected: 'text-accent-red',
  cancelled: 'text-gray-600',
};

export function OrderHistory() {
  const orders = useOrders();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [flashedId, setFlashedId] = useState<string | null>(null);

  // useEvent showcase: flash-highlight the filled order row
  useEvent(orderStore, OrderEvent.Filled, useCallback((event) => {
    const { order } = event.data;
    setFlashedId(order.id);
    setTimeout(() => setFlashedId(null), 800);
  }, []));

  return (
    <div className="h-full flex flex-col bg-surface-card border border-surface-border rounded overflow-hidden">
      <div className="shrink-0 px-2.5 py-1.5 border-b border-surface-border">
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">Orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-gray-700 font-mono">No orders</span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {orders.map((order) => {
            const isNew = !seenIdsRef.current.has(order.id);
            if (isNew) seenIdsRef.current.add(order.id);
            const isFlashed = flashedId === order.id;

            return (
              <div
                key={order.id}
                className={`flex items-center justify-between text-[10px] py-1 px-2.5 transition-colors duration-500
                  border-b border-surface-border/50 ${
                  isFlashed
                    ? 'bg-accent-green/10'
                    : 'hover:bg-surface-hover'
                } ${isNew ? 'animate-slide-down' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-semibold ${
                      order.side === 'buy' ? 'text-accent-green' : 'text-accent-red'
                    }`}
                  >
                    {order.side.toUpperCase()}
                  </span>
                  <span className="text-gray-400 font-medium">{order.pair}</span>
                  <span className="text-gray-600 font-mono">{order.amount}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-gray-500">
                    ${(order.filledPrice ?? order.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                  <span className={`font-mono uppercase text-[9px] ${statusColors[order.status] ?? 'text-gray-600'}`}>
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
