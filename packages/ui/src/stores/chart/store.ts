import { createStore, sealStore } from '@naikidev/commiq';
import type { CandleInterval, OhlcCandle, TradingPair } from '@commiq-markets/shared';
import { ChartEvent } from '../events.js';

export type ChartState = {
  pair: TradingPair | null;
  candles: OhlcCandle[];
  interval: CandleInterval;
  lastSnapshot: OhlcCandle[];
  status: 'idle' | 'loading' | 'error';
};

const _store = createStore<ChartState>({
  pair: null,
  candles: [],
  interval: '1m',
  lastSnapshot: [],
  status: 'idle',
});

// Interruptable: when user rapidly switches pairs, previous loads are cancelled
_store.addCommandHandler<{ pair: TradingPair }>(
  'chart:loadPair',
  async (ctx, cmd) => {
    ctx.setState({ ...ctx.state, pair: cmd.data.pair, status: 'loading', candles: [], lastSnapshot: [] });
    ctx.emit(ChartEvent.PairSwitched, { pair: cmd.data.pair });
  },
  { interruptable: true },
);

// Replace all candles (from snapshot response), optionally setting the pair
_store.addCommandHandler<{ candles: OhlcCandle[]; pair?: TradingPair }>('chart:replaceCandles', (ctx, cmd) => {
  const next: ChartState = {
    ...ctx.state,
    candles: cmd.data.candles,
    lastSnapshot: cmd.data.candles,
    status: 'idle',
  };
  if (cmd.data.pair) next.pair = cmd.data.pair;
  ctx.setState(next);
});

// Append/update latest candle (real-time)
_store.addCommandHandler<{ candle: OhlcCandle }>('chart:appendCandle', (ctx, cmd) => {
  const { candle } = cmd.data;
  const candles = [...ctx.state.candles];
  const lastIdx = candles.length - 1;

  if (lastIdx >= 0 && candles[lastIdx].time === candle.time) {
    candles[lastIdx] = candle;
  } else {
    candles.push(candle);
  }

  ctx.setState({ ...ctx.state, candles });
  ctx.emit(ChartEvent.CandleReceived, { candle });
});

// Set interval: clears candles, sets loading, emits IntervalChanged
_store.addCommandHandler<{ interval: CandleInterval }>('chart:setInterval', (ctx, cmd) => {
  const { interval } = cmd.data;
  if (interval === ctx.state.interval) return;
  ctx.setState({ ...ctx.state, interval, candles: [], lastSnapshot: [], status: 'loading' });
  ctx.emit(ChartEvent.IntervalChanged, { interval });
});

// Reset to last snapshot using replaceState (commiq showcase)
_store.addCommandHandler('chart:resetToSnapshot', (ctx) => {
  if (ctx.state.lastSnapshot.length === 0) return;
  // Use the internal store's replaceState for a full state swap — commiq feature showcase
  _store.replaceState({ ...ctx.state, candles: ctx.state.lastSnapshot, status: 'idle' });
});

export const chartStore = sealStore(_store);
