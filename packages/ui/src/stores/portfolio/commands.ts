import { createCommand } from '@naikidev/commiq';
import type { OrderSide, TradingPair } from '@commiq-markets/shared';

export const PortfolioCommand = {
  updateHolding: (data: { pair: TradingPair; side: OrderSide; amount: number; price: number }) =>
    createCommand('portfolio:updateHolding', data),

  updatePrice: (pair: TradingPair, price: number) =>
    createCommand('portfolio:updatePrice', { pair, price }),

  recalculate: () =>
    createCommand('portfolio:recalculate', undefined),
};
