import { createStore, sealStore } from '@naikidev/commiq';
import { withGuard, withDefer, withAssert } from '@naikidev/commiq-context';
import type { Order, OrderSide, OrderType, TradingPair } from '@commiq-markets/shared';
import { OrderEvent } from '../events.js';

// Normalized order state
export type OrderState = {
  byId: Record<string, Order>;
  allIds: string[];
};

const initialState: OrderState = {
  byId: {},
  allIds: [],
};

const _store = createStore<OrderState>(initialState)
  .useExtension(withGuard<OrderState>())
  .useExtension(withDefer<OrderState>())
  .useExtension(withAssert<OrderState>());

type PlaceOrderData = {
  id: string;
  pair: TradingPair;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price: number;
};

// Place order — optimistic update with guard validation
_store.addCommandHandler<PlaceOrderData>('order:place', (ctx, cmd) => {
  const { id, pair, side, type, amount, price } = cmd.data;

  // Guard validations (runtime, user-facing)
  ctx.guard(amount > 0, 'Amount must be positive');
  ctx.guard(price > 0, 'Price must be positive');

  // Assert invariants (dev-only, programmer errors)
  ctx.assert(pair.includes('/'), 'Pair must contain /');
  if (type === 'limit') {
    ctx.assert(price !== 0, 'Limit orders must have an explicit price');
  }

  // Optimistic: add order with 'pending' status immediately
  const order: Order = {
    id,
    pair,
    side,
    type,
    amount,
    price,
    status: 'pending',
    createdAt: Date.now(),
    filledAt: null,
    filledPrice: null,
  };

  ctx.setState({
    byId: { ...ctx.state.byId, [id]: order },
    allIds: [id, ...ctx.state.allIds],
  });

  ctx.emit(OrderEvent.Placed, { order });

  // Deferred cleanup: log for tracing
  ctx.defer(() => {
    console.log(`[order] Placed order ${id} for ${side} ${amount} ${pair}`);
  });
});

// Server accepted the order
_store.addCommandHandler<{ order: Order }>('order:accepted', (ctx, cmd) => {
  const { order } = cmd.data;
  if (!ctx.state.byId[order.id]) return;

  ctx.setState({
    ...ctx.state,
    byId: { ...ctx.state.byId, [order.id]: { ...ctx.state.byId[order.id], status: 'accepted' } },
  });
  ctx.emit(OrderEvent.Accepted, { order });
});

// Server confirmed fill — update order, emit event for bus
_store.addCommandHandler<{ order: Order }>('order:filled', (ctx, cmd) => {
  const { order } = cmd.data;
  if (!ctx.state.byId[order.id]) return;

  ctx.setState({
    ...ctx.state,
    byId: {
      ...ctx.state.byId,
      [order.id]: {
        ...order,
        status: 'filled',
      },
    },
  });
  ctx.emit(OrderEvent.Filled, { order });
});

// Server rejected — rollback optimistic update
_store.addCommandHandler<{ orderId: string; reason: string }>('order:rejected', (ctx, cmd) => {
  const { orderId, reason } = cmd.data;
  if (!ctx.state.byId[orderId]) return;

  // Remove the optimistic order
  const { [orderId]: _, ...remaining } = ctx.state.byId;
  ctx.setState({
    byId: remaining,
    allIds: ctx.state.allIds.filter((id) => id !== orderId),
  });

  ctx.emit(OrderEvent.Rejected, { orderId, reason });
});

export const orderStore = sealStore(_store);
