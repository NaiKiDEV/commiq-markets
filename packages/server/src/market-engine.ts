import {
  TRADING_PAIRS,
  BASE_PRICES,
  VOLATILITY,
  type Ticker,
  type TradingPair,
} from '@commiq-markets/shared';

type TickerState = {
  price: number;
  open24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
};

export class MarketEngine {
  private state: Map<TradingPair, TickerState> = new Map();
  private interval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(ticker: Ticker) => void> = new Set();

  constructor() {
    for (const pair of TRADING_PAIRS) {
      const price = BASE_PRICES[pair];
      this.state.set(pair, {
        price,
        open24h: price,
        high24h: price * 1.02,
        low24h: price * 0.98,
        volume24h: Math.random() * 1_000_000 + 500_000,
      });
    }
  }

  start() {
    this.interval = setInterval(() => {
      // Update 1-3 random pairs each tick
      const count = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...TRADING_PAIRS].sort(() => Math.random() - 0.5);

      for (let i = 0; i < count; i++) {
        const pair = shuffled[i];
        const ticker = this.tick(pair);
        for (const listener of this.listeners) {
          listener(ticker);
        }
      }
    }, 500 + Math.random() * 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  onTick(listener: (ticker: Ticker) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getAllTickers(): Ticker[] {
    return TRADING_PAIRS.map((pair) => this.buildTicker(pair));
  }

  getPrice(pair: TradingPair): number {
    return this.state.get(pair)!.price;
  }

  private tick(pair: TradingPair): Ticker {
    const s = this.state.get(pair)!;
    const vol = VOLATILITY[pair];

    // Random walk with mean-reversion toward base price
    const base = BASE_PRICES[pair];
    const meanReversion = (base - s.price) / base * 0.01;
    const noise = (Math.random() - 0.5) * 2 * vol;
    const change = s.price * (noise + meanReversion);

    s.price = Math.max(s.price + change, s.price * 0.5);
    s.high24h = Math.max(s.high24h, s.price);
    s.low24h = Math.min(s.low24h, s.price);
    s.volume24h += Math.random() * 10000;

    return this.buildTicker(pair);
  }

  private buildTicker(pair: TradingPair): Ticker {
    const s = this.state.get(pair)!;
    const change24h = s.price - s.open24h;
    return {
      pair,
      price: Number(s.price.toPrecision(8)),
      change24h: Number(change24h.toPrecision(6)),
      changePercent24h: Number(((change24h / s.open24h) * 100).toFixed(2)),
      high24h: Number(s.high24h.toPrecision(8)),
      low24h: Number(s.low24h.toPrecision(8)),
      volume24h: Math.round(s.volume24h),
      timestamp: Date.now(),
    };
  }
}
