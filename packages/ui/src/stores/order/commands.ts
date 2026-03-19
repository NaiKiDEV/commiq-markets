import { createCommand } from '@naikidev/commiq';
import type { Order, OrderSide, OrderType, TradingPair } from '@commiq-markets/shared';

export const OrderCommand = {
  place: (data: {
    id: string;
    pair: TradingPair;
    side: OrderSide;
    type: OrderType;
    amount: number;
    price: number;
  }) => createCommand('order:place', data),

  accepted: (order: Order) =>
    createCommand('order:accepted', { order }),

  filled: (order: Order) =>
    createCommand('order:filled', { order }),

  rejected: (orderId: string, reason: string) =>
    createCommand('order:rejected', { orderId, reason }),
};
