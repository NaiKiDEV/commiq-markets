import type { Order, OrderSide, OrderType, TradingPair } from '@commiq-markets/shared';
import type { MarketEngine } from './market-engine.js';

type OrderCallback = {
  onAccepted: (order: Order) => void;
  onFilled: (order: Order) => void;
  onRejected: (orderId: string, reason: string) => void;
};

type PendingOrder = {
  order: Order;
  callbacks: OrderCallback;
};

export class OrderEngine {
  private pendingOrders = new Map<string, PendingOrder>();

  constructor(private market: MarketEngine) {}

  placeOrder(
    id: string,
    pair: TradingPair,
    side: OrderSide,
    orderType: OrderType,
    amount: number,
    price: number,
    callbacks: OrderCallback,
  ) {
    if (amount <= 0) {
      callbacks.onRejected(id, 'Amount must be positive');
      return;
    }
    if (price <= 0) {
      callbacks.onRejected(id, 'Price must be positive');
      return;
    }

    // ~10% random rejection
    if (Math.random() < 0.1) {
      callbacks.onRejected(id, 'Insufficient liquidity');
      return;
    }

    const currentPrice = this.market.getPrice(pair);

    const order: Order = {
      id,
      pair,
      side,
      type: orderType,
      amount,
      price: orderType === 'market' ? currentPrice : price,
      status: 'accepted',
      createdAt: Date.now(),
      filledAt: null,
      filledPrice: null,
    };

    callbacks.onAccepted(order);

    if (orderType === 'market') {
      // Market orders: fill after short delay with slippage
      const delay = 500 + Math.random() * 1500;
      setTimeout(() => {
        const slippage = (Math.random() - 0.5) * currentPrice * 0.001;
        const filledOrder: Order = {
          ...order,
          status: 'filled',
          filledAt: Date.now(),
          filledPrice: Number((currentPrice + slippage).toPrecision(8)),
        };
        callbacks.onFilled(filledOrder);
      }, delay);
    } else {
      // Limit orders: store and wait for price crossing on tick
      this.pendingOrders.set(id, { order, callbacks });
    }
  }

  // Called on each market tick to check if limit orders should fill
  checkLimitOrders(pair: TradingPair, currentPrice: number) {
    for (const [id, { order, callbacks }] of this.pendingOrders) {
      if (order.pair !== pair) continue;

      const shouldFill =
        (order.side === 'buy' && currentPrice <= order.price) ||
        (order.side === 'sell' && currentPrice >= order.price);

      if (shouldFill) {
        this.pendingOrders.delete(id);
        callbacks.onFilled({
          ...order,
          status: 'filled',
          filledAt: Date.now(),
          filledPrice: order.price,
        });
      }
    }
  }

  cancelOrder(orderId: string): boolean {
    return this.pendingOrders.delete(orderId);
  }
}
