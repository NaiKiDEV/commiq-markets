import {
  BASE_PRICES,
  VOLATILITY,
  type OhlcCandle,
  type Ticker,
  type TradingPair,
} from '@commiq-markets/shared';

const CANDLE_INTERVAL_MS = 60_000; // 1 minute

export class CandleGenerator {
  private currentCandles: Map<TradingPair, OhlcCandle> = new Map();
  private listeners: Set<(pair: TradingPair, candle: OhlcCandle) => void> = new Set();

  onCandle(listener: (pair: TradingPair, candle: OhlcCandle) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  processTick(ticker: Ticker) {
    const { pair, price, timestamp } = ticker;
    const candleTime = Math.floor(timestamp / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;

    const current = this.currentCandles.get(pair);

    if (!current || current.time !== candleTime) {
      // New candle period
      const candle: OhlcCandle = {
        time: candleTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: Math.random() * 1000,
      };
      this.currentCandles.set(pair, candle);
      this.emit(pair, candle);
    } else {
      // Update existing candle
      current.high = Math.max(current.high, price);
      current.low = Math.min(current.low, price);
      current.close = price;
      current.volume += Math.random() * 100;
      this.emit(pair, { ...current });
    }
  }

  generateHistory(pair: TradingPair, count: number): OhlcCandle[] {
    const candles: OhlcCandle[] = [];
    const now = Date.now();
    let price = BASE_PRICES[pair];
    const vol = VOLATILITY[pair];

    for (let i = count; i > 0; i--) {
      const time = Math.floor((now - i * CANDLE_INTERVAL_MS) / CANDLE_INTERVAL_MS) * CANDLE_INTERVAL_MS;
      const open = price;
      const moves = Array.from({ length: 10 }, () => price * (1 + (Math.random() - 0.5) * vol * 2));
      const high = Math.max(open, ...moves);
      const low = Math.min(open, ...moves);
      price = moves[moves.length - 1];
      const close = price;

      candles.push({
        time,
        open: Number(open.toPrecision(8)),
        high: Number(high.toPrecision(8)),
        low: Number(low.toPrecision(8)),
        close: Number(close.toPrecision(8)),
        volume: Math.round(Math.random() * 50000 + 10000),
      });
    }

    return candles;
  }

  private emit(pair: TradingPair, candle: OhlcCandle) {
    for (const listener of this.listeners) {
      listener(pair, candle);
    }
  }
}
