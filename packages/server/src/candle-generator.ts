import {
  BASE_PRICES,
  CANDLE_INTERVAL_MS,
  VOLATILITY,
  type CandleInterval,
  type OhlcCandle,
  type Ticker,
  type TradingPair,
} from '@commiq-markets/shared';

const ALL_INTERVALS: CandleInterval[] = ['1m', '5m', '15m', '1h'];

export class CandleGenerator {
  // Keyed by `${pair}:${interval}`
  private currentCandles: Map<string, OhlcCandle> = new Map();
  private listeners: Set<(pair: TradingPair, candle: OhlcCandle, interval: CandleInterval) => void> = new Set();

  onCandle(listener: (pair: TradingPair, candle: OhlcCandle, interval: CandleInterval) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  processTick(ticker: Ticker) {
    const { pair, price, timestamp } = ticker;

    // Bucket each tick into all 4 interval candles
    for (const interval of ALL_INTERVALS) {
      const ms = CANDLE_INTERVAL_MS[interval];
      const candleTime = Math.floor(timestamp / ms) * ms;
      const key = `${pair}:${interval}`;

      const current = this.currentCandles.get(key);

      if (!current || current.time !== candleTime) {
        const candle: OhlcCandle = {
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: Math.random() * 1000,
        };
        this.currentCandles.set(key, candle);
        this.emit(pair, candle, interval);
      } else {
        current.high = Math.max(current.high, price);
        current.low = Math.min(current.low, price);
        current.close = price;
        current.volume += Math.random() * 100;
        this.emit(pair, { ...current }, interval);
      }
    }
  }

  generateHistory(pair: TradingPair, count: number, interval: CandleInterval = '1m'): OhlcCandle[] {
    const candles: OhlcCandle[] = [];
    const now = Date.now();
    const ms = CANDLE_INTERVAL_MS[interval];
    let price = BASE_PRICES[pair];
    const vol = VOLATILITY[pair];

    for (let i = count; i > 0; i--) {
      const time = Math.floor((now - i * ms) / ms) * ms;
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

  private emit(pair: TradingPair, candle: OhlcCandle, interval: CandleInterval) {
    for (const listener of this.listeners) {
      listener(pair, candle, interval);
    }
  }
}
