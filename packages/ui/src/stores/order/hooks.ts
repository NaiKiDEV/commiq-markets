import { useSelector, useQueue } from '@naikidev/commiq-react';
import type { OrderSide, OrderType, TradingPair } from '@commiq-markets/shared';
import { orderStore } from './store.js';
import { OrderCommand } from './commands.js';

export function useOrders() {
  const byId = useSelector(orderStore, (s) => s.byId);
  const allIds = useSelector(orderStore, (s) => s.allIds);
  return allIds.map((id) => byId[id]);
}

export function usePlaceOrder() {
  const queue = useQueue(orderStore);

  return (pair: TradingPair, side: OrderSide, type: OrderType, amount: number, price: number) => {
    const id = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    queue(OrderCommand.place({ id, pair, side, type, amount, price }));
    return id;
  };
}
