import { createStore, sealStore } from '@naikidev/commiq';
import { withPatch } from '@naikidev/commiq-context';
import type { OrderSide, Position, TradingPair } from '@commiq-markets/shared';
import { STARTING_CASH } from '@commiq-markets/shared';
import { OrderEvent } from '../events.js';

export type PortfolioState = {
  holdings: Record<string, Position>;
  allHoldingPairs: TradingPair[];
  cashBalance: number;
  totalValue: number;
};

const _store = createStore<PortfolioState>({
  holdings: {},
  allHoldingPairs: [],
  cashBalance: STARTING_CASH,
  totalValue: STARTING_CASH,
})
  .useExtension(withPatch<PortfolioState>());

// Update holding when an order is filled (triggered via event bus)
type UpdateHoldingData = {
  pair: TradingPair;
  side: OrderSide;
  amount: number;
  price: number;
};

_store.addCommandHandler<UpdateHoldingData>('portfolio:updateHolding', (ctx, cmd) => {
  const { pair, side, amount, price } = cmd.data;
  const existing = ctx.state.holdings[pair];
  const cost = amount * price;

  if (side === 'buy') {
    const newAmount = (existing?.amount ?? 0) + amount;
    const existingCost = (existing?.amount ?? 0) * (existing?.avgEntryPrice ?? 0);
    const avgEntryPrice = (existingCost + cost) / newAmount;

    const position: Position = {
      pair,
      amount: newAmount,
      avgEntryPrice,
      currentPrice: price,
      unrealizedPnl: 0,
    };

    ctx.patch({
      holdings: { ...ctx.state.holdings, [pair]: position },
      allHoldingPairs: ctx.state.allHoldingPairs.includes(pair)
        ? ctx.state.allHoldingPairs
        : [...ctx.state.allHoldingPairs, pair],
      cashBalance: ctx.state.cashBalance - cost,
    });
  } else {
    // Sell
    if (!existing || existing.amount < amount) return;

    const newAmount = existing.amount - amount;
    const realizedPnl = (price - existing.avgEntryPrice) * amount;

    if (newAmount <= 0) {
      const { [pair]: _, ...rest } = ctx.state.holdings;
      ctx.patch({
        holdings: rest,
        allHoldingPairs: ctx.state.allHoldingPairs.filter((p) => p !== pair),
        cashBalance: ctx.state.cashBalance + cost,
      });
    } else {
      ctx.patch({
        holdings: {
          ...ctx.state.holdings,
          [pair]: { ...existing, amount: newAmount, currentPrice: price, unrealizedPnl: 0 },
        },
        cashBalance: ctx.state.cashBalance + cost,
      });
    }
  }
});

// Update current price for P&L calculation (triggered via event bus on price updates)
_store.addCommandHandler<{ pair: TradingPair; price: number }>('portfolio:updatePrice', (ctx, cmd) => {
  const { pair, price } = cmd.data;
  const holding = ctx.state.holdings[pair];
  if (!holding) return;

  const unrealizedPnl = (price - holding.avgEntryPrice) * holding.amount;
  ctx.patch({
    holdings: {
      ...ctx.state.holdings,
      [pair]: { ...holding, currentPrice: price, unrealizedPnl },
    },
  });
});

// Recalculate total portfolio value
_store.addCommandHandler('portfolio:recalculate', (ctx) => {
  let holdingsValue = 0;
  for (const pair of ctx.state.allHoldingPairs) {
    const h = ctx.state.holdings[pair];
    if (h) holdingsValue += h.amount * h.currentPrice;
  }
  ctx.patch({ totalValue: ctx.state.cashBalance + holdingsValue });
});

// addEventHandler: internal reaction to order fills (commiq feature showcase)
// The actual state mutation is driven by bus → portfolio:updateHolding command.
// This handler provides supplementary logging within the store itself.
_store.addEventHandler(OrderEvent.Filled, (ctx, event) => {
  const { order } = event.data;
  console.log(
    `[portfolio] Order filled: ${order.side} ${order.amount} ${order.pair}. Cash: $${ctx.state.cashBalance.toFixed(2)}`,
  );
});

export const portfolioStore = sealStore(_store);
