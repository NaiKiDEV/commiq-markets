import { useCallback, useRef, useState } from "react";
import { useEvent } from "@naikidev/commiq-react";
import { marketStore } from "../stores/market/store.js";
import { MarketEvent } from "../stores/events.js";
import type { Ticker } from "@commiq-markets/shared";
import { PRICE_PRECISION } from "@commiq-markets/shared";

const MAX_ENTRIES = 40;

type FeedEntry = {
  id: number;
  ticker: Ticker;
  dir: "up" | "down" | "flat";
};

let seq = 0;

function formatPrice(ticker: Ticker): string {
  const fmt = PRICE_PRECISION[ticker.pair];
  const p = ticker.price;
  if (!fmt) return p.toFixed(2);
  return p >= 1000
    ? p.toLocaleString("en-US", {
        minimumFractionDigits: fmt.precision,
        maximumFractionDigits: fmt.precision,
      })
    : p.toFixed(fmt.precision);
}

export function ActivityFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const lastPriceRef = useRef<Record<string, number>>({});

  useEvent(
    marketStore,
    MarketEvent.PriceUpdated,
    useCallback((event) => {
      const { ticker } = event.data;
      const prev = lastPriceRef.current[ticker.pair];
      const dir =
        prev === undefined
          ? "flat"
          : ticker.price > prev
            ? "up"
            : ticker.price < prev
              ? "down"
              : "flat";
      lastPriceRef.current[ticker.pair] = ticker.price;

      setEntries((prev) => {
        const entry: FeedEntry = { id: seq++, ticker, dir };
        const next = [entry, ...prev];
        return next.length > MAX_ENTRIES ? next.slice(0, MAX_ENTRIES) : next;
      });
    }, []),
  );

  return (
    <div className="h-full flex flex-col bg-surface-card rounded overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-1 border-b border-white/[0.03]">
        <span className="text-[11px] font-medium text-gray-300">Activity</span>
        <span className="text-[9px] font-mono text-gray-600">LIVE</span>
      </div>

      {/* Feed */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] text-gray-600 font-mono">
              Waiting for ticks…
            </span>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-3 py-1 border-b border-white/[0.03]
                text-[10px] font-mono transition-colors hover:bg-surface-hover
                ${i === 0 ? "animate-slide-in-top" : ""}`}
            >
              {/* Direction indicator + pair */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[8px] leading-none ${
                    entry.dir === "up"
                      ? "text-accent-green"
                      : entry.dir === "down"
                        ? "text-accent-red"
                        : "text-gray-600"
                  }`}
                >
                  {entry.dir === "up" ? "▲" : entry.dir === "down" ? "▼" : "●"}
                </span>
                <span className="text-gray-400 w-16">
                  {entry.ticker.pair.replace("/USD", "")}
                </span>
              </div>

              {/* Price + change */}
              <div className="flex items-center gap-2 text-right">
                <span
                  className={
                    entry.dir === "up"
                      ? "text-accent-green"
                      : entry.dir === "down"
                        ? "text-accent-red"
                        : "text-gray-400"
                  }
                >
                  {formatPrice(entry.ticker)}
                </span>
                <span
                  className={`text-[9px] w-12 text-right ${
                    entry.ticker.changePercent24h >= 0
                      ? "text-accent-green/70"
                      : "text-accent-red/70"
                  }`}
                >
                  {entry.ticker.changePercent24h >= 0 ? "+" : ""}
                  {entry.ticker.changePercent24h.toFixed(2)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
