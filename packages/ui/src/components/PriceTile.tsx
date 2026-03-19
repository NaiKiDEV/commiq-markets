import { useRef, useState } from "react";
import type { TradingPair } from "@commiq-markets/shared";
import { useTicker } from "../stores/market/hooks.js";
import { useSelectedPair, useSelectPair } from "../stores/ui/hooks.js";

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export function PriceTile({ pair }: { pair: TradingPair }) {
  const ticker = useTicker(pair);
  const selectedPair = useSelectedPair();
  const selectPair = useSelectPair();
  const isSelected = selectedPair === pair;
  const prevPriceRef = useRef<number | null>(null);
  const [flashClass, setFlashClass] = useState("");

  if (!ticker) return null;

  const prevPrice = prevPriceRef.current;
  if (prevPrice !== null && ticker.price !== prevPrice) {
    if (flashClass === "") {
      setFlashClass(
        ticker.price > prevPrice ? "animate-flash-green" : "animate-flash-red",
      );
    }
  }
  prevPriceRef.current = ticker.price;

  const isPositive = ticker.changePercent24h >= 0;

  return (
    <button
      onClick={() => selectPair(pair)}
      className={`shrink-0 flex items-center gap-2 px-2.5 py-1 rounded text-left transition-all duration-150 ${
        isSelected ? "bg-accent-blue/10" : "hover:bg-surface-hover"
      }`}
    >
      <span className="text-[11px] font-semibold text-gray-200">
        {pair.split("/")[0]}
      </span>
      <span
        className={`text-[11px] font-mono font-bold text-gray-100 ${flashClass}`}
        onAnimationEnd={() => setFlashClass("")}
      >
        ${formatPrice(ticker.price)}
      </span>
      <span
        className={`text-[10px] font-mono font-medium ${
          isPositive ? "text-accent-green" : "text-accent-red"
        }`}
      >
        {isPositive ? "+" : ""}
        {ticker.changePercent24h}%
      </span>
    </button>
  );
}
