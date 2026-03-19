import { createStore, sealStore } from '@naikidev/commiq';
import type { OhlcCandle, TradingPair } from '@commiq-markets/shared';
import { ChartEvent } from '../events.js';

export type ChartState = {
  pair: TradingPair | null;
  candles: OhlcCandle[];
  status: 'idle' | 'loading' | 'error';
};

const _store = createStore<ChartState>({
  pair: null,
  candles: [],
  status: 'idle',
});

// Interruptable: when user rapidly switches pairs, previous loads are cancelled
_store.addCommandHandler<{ pair: TradingPair }>(
  'chart:loadPair',
  async (ctx, cmd) => {
    ctx.setState({ ...ctx.state, pair: cmd.data.pair, status: 'loading', candles: [] });
    ctx.emit(ChartEvent.PairSwitched, { pair: cmd.data.pair });

    // The actual candle data arrives via WS snapshot response.
    // This command signals the switch; ws-bridge sends subscribe:pair to server.
    // The interruptable flag ensures rapid switches cancel pending handlers.
  },
  { interruptable: true },
);

// Replace all candles (from snapshot response)
_store.addCommandHandler<{ candles: OhlcCandle[] }>('chart:replaceCandles', (ctx, cmd) => {
  ctx.setState({ ...ctx.state, candles: cmd.data.candles, status: 'idle' });
});

// Append/update latest candle (real-time)
_store.addCommandHandler<{ candle: OhlcCandle }>('chart:appendCandle', (ctx, cmd) => {
  const { candle } = cmd.data;
  const candles = [...ctx.state.candles];
  const lastIdx = candles.length - 1;

  if (lastIdx >= 0 && candles[lastIdx].time === candle.time) {
    // Update existing candle
    candles[lastIdx] = candle;
  } else {
    // New candle period
    candles.push(candle);
  }

  ctx.setState({ ...ctx.state, candles });
  ctx.emit(ChartEvent.CandleReceived, { candle });
});

export const chartStore = sealStore(_store);
