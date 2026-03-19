import {
  TRADING_PAIRS,
  VOLATILITY,
  type OrderBookLevel,
  type TradingPair,
} from '@commiq-markets/shared';

export class OrderBookEngine {
  private books = new Map<TradingPair, { bids: OrderBookLevel[]; asks: OrderBookLevel[] }>();

  constructor() {
    for (const pair of TRADING_PAIRS) {
      this.books.set(pair, { bids: [], asks: [] });
    }
  }

  regenerate(pair: TradingPair, midPrice: number) {
    const vol = VOLATILITY[pair];
    const halfSpread = midPrice * vol * 0.5;
    const tickSize = midPrice * vol * 0.1;
    const baseQty = 50000 / midPrice;
    const levels = 12;

    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    let bidTotal = 0;
    let askTotal = 0;

    for (let i = 0; i < levels; i++) {
      // Bids: descending from just below mid
      const bidPrice = midPrice - halfSpread - i * tickSize;
      const bidQty = (baseQty / (1 + i * 0.3)) * (0.8 + Math.random() * 0.4);
      bidTotal += bidQty;
      bids.push({
        price: Number(bidPrice.toPrecision(8)),
        quantity: Number(bidQty.toFixed(4)),
        total: Number(bidTotal.toFixed(4)),
      });

      // Asks: ascending from just above mid
      const askPrice = midPrice + halfSpread + i * tickSize;
      const askQty = (baseQty / (1 + i * 0.3)) * (0.8 + Math.random() * 0.4);
      askTotal += askQty;
      asks.push({
        price: Number(askPrice.toPrecision(8)),
        quantity: Number(askQty.toFixed(4)),
        total: Number(askTotal.toFixed(4)),
      });
    }

    this.books.set(pair, { bids, asks });
  }

  getSnapshot(pair: TradingPair) {
    return this.books.get(pair) ?? { bids: [], asks: [] };
  }
}
