import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type MouseEventParams,
  type Time,
} from 'lightweight-charts';
import { useEvent, useQueue } from '@naikidev/commiq-react';
import { PRICE_PRECISION, type CandleInterval, type TradingPair } from '@commiq-markets/shared';
import { useChartCandles, useChartPair, useChartStatus, useChartInterval } from '../stores/chart/hooks.js';
import { useTicker } from '../stores/market/hooks.js';
import { useSelectedPair } from '../stores/ui/hooks.js';
import { chartStore } from '../stores/chart/store.js';
import { marketStore } from '../stores/market/store.js';
import { ChartCommand } from '../stores/chart/commands.js';
import { MarketEvent } from '../stores/events.js';

const INTERVALS: CandleInterval[] = ['1m', '5m', '15m', '1h'];

type OhlcOverlay = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function formatPrice(price: number, pair?: TradingPair | null): string {
  if (pair && PRICE_PRECISION[pair]) {
    const { precision } = PRICE_PRECISION[pair];
    return price >= 1000
      ? price.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision })
      : price.toFixed(precision);
  }
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toFixed(0);
}

export function PriceChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const candles = useChartCandles();
  const pair = useChartPair();
  const status = useChartStatus();
  const interval = useChartInterval();
  const selectedPair = useSelectedPair();
  const ticker = useTicker(selectedPair);
  const queue = useQueue(chartStore);

  const [crosshairData, setCrosshairData] = useState<OhlcOverlay | null>(null);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number | null>(null);

  // useEvent showcase: flash price on MarketEvent.PriceUpdated
  useEvent(marketStore, MarketEvent.PriceUpdated, useCallback((event) => {
    const { ticker: t } = event.data;
    if (t.pair !== selectedPair) return;
    const prev = prevPriceRef.current;
    if (prev !== null && prev !== t.price) {
      setPriceFlash(t.price > prev ? 'up' : 'down');
      setTimeout(() => setPriceFlash(null), 400);
    }
    prevPriceRef.current = t.price;
  }, [selectedPair]));

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#141822' },
        textColor: '#9ca3af',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.02)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        timeVisible: true,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.time || !param.seriesData) {
        setCrosshairData(null);
        return;
      }
      const candleData = param.seriesData.get(candleSeries) as CandlestickData<Time> | undefined;
      const volData = param.seriesData.get(volumeSeries) as HistogramData<Time> | undefined;
      if (candleData && 'open' in candleData) {
        setCrosshairData({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volData?.value ?? 0,
        });
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Update price format when pair changes
  useEffect(() => {
    if (!candleSeriesRef.current || !pair) return;
    const fmt = PRICE_PRECISION[pair];
    if (fmt) {
      candleSeriesRef.current.applyOptions({
        priceFormat: { type: 'price', precision: fmt.precision, minMove: fmt.minMove },
      });
    }
  }, [pair]);

  // Update data when candles change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    const candleData: CandlestickData<Time>[] = candles.map((c) => ({
      time: (c.time / 1000) as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData<Time>[] = candles.map((c) => ({
      time: (c.time / 1000) as Time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  const change = ticker?.changePercent24h ?? 0;
  const isPositive = change >= 0;

  return (
    <div className="h-full flex flex-col bg-surface-card rounded overflow-hidden">
      {/* Header bar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-200">
            {pair ?? 'Select a pair'}
          </span>

          {/* Live price with flash */}
          {ticker && (
            <span
              className={`text-sm font-mono font-bold transition-colors duration-300 ${
                priceFlash === 'up'
                  ? 'text-accent-green'
                  : priceFlash === 'down'
                    ? 'text-accent-red'
                    : 'text-white'
              }`}
            >
              {formatPrice(ticker.price, pair)}
            </span>
          )}

          {/* 24h change */}
          {ticker && (
            <span className={`text-[11px] font-mono font-medium ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          )}

          {/* 24h stats */}
          {ticker && (
            <div className="hidden lg:flex items-center gap-2.5 text-[10px] ml-1">
              <span className="text-gray-500">H <span className="text-gray-400 font-mono">{formatPrice(ticker.high24h, pair)}</span></span>
              <span className="text-gray-500">L <span className="text-gray-400 font-mono">{formatPrice(ticker.low24h, pair)}</span></span>
              <span className="text-gray-500">Vol <span className="text-gray-400 font-mono">{formatVolume(ticker.volume24h)}</span></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Timeframe buttons */}
          <div className="flex gap-px bg-surface rounded">
            {INTERVALS.map((tf) => (
              <button
                key={tf}
                onClick={() => queue(ChartCommand.setInterval(tf))}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors ${
                  interval === tf
                    ? 'bg-accent-blue/15 text-accent-blue'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={() => queue(ChartCommand.resetToSnapshot())}
            className="px-1.5 py-0.5 text-[10px] font-mono text-gray-500 hover:text-gray-300
                       bg-surface rounded transition-colors"
            title="Reset chart to last snapshot (replaceState)"
          >
            RST
          </button>

          {status === 'loading' && (
            <span className="text-[10px] text-gray-500 animate-pulse font-mono">LOAD</span>
          )}
        </div>
      </div>

      {/* OHLC crosshair overlay */}
      <div className="shrink-0 h-5 flex items-center gap-3 px-3 text-[10px] font-mono border-t border-white/[0.03]">
        {crosshairData ? (
          <>
            <span className="text-gray-500">O <span className="text-gray-300">{formatPrice(crosshairData.open, pair)}</span></span>
            <span className="text-gray-500">H <span className="text-gray-300">{formatPrice(crosshairData.high, pair)}</span></span>
            <span className="text-gray-500">L <span className="text-gray-300">{formatPrice(crosshairData.low, pair)}</span></span>
            <span className="text-gray-500">C <span className={crosshairData.close >= crosshairData.open ? 'text-accent-green' : 'text-accent-red'}>
              {formatPrice(crosshairData.close, pair)}
            </span></span>
            <span className="text-gray-500">V <span className="text-gray-300">{formatVolume(crosshairData.volume)}</span></span>
          </>
        ) : (
          <span className="text-gray-600">Hover chart for OHLCV</span>
        )}
      </div>

      {/* Chart fills remaining space */}
      <div className="flex-1 min-h-0 relative">
        {status === 'loading' && candles.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-card">
            <div className="space-y-2.5 w-3/5">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-2 bg-white/[0.03] rounded animate-pulse"
                     style={{ width: `${40 + Math.random() * 50}%` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
