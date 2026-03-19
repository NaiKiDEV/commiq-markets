import { useRef, useState } from 'react';
import type { TradingPair } from '@commiq-markets/shared';
import { useTicker } from '../stores/market/hooks.js';
import { useSelectedPair, useSelectPair } from '../stores/ui/hooks.js';

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export function PriceTile({ pair }: { pair: TradingPair }) {
  const ticker = useTicker(pair);
  const selectedPair = useSelectedPair();
  const selectPair = useSelectPair();
  const isSelected = selectedPair === pair;
  const prevPriceRef = useRef<number | null>(null);
  const [flashClass, setFlashClass] = useState('');

  if (!ticker) return null;

  // Flash on price change
  const prevPrice = prevPriceRef.current;
  if (prevPrice !== null && ticker.price !== prevPrice) {
    if (flashClass === '') {
      setFlashClass(ticker.price > prevPrice ? 'animate-flash-green' : 'animate-flash-red');
    }
  }
  prevPriceRef.current = ticker.price;

  const isPositive = ticker.changePercent24h >= 0;

  return (
    <button
      onClick={() => selectPair(pair)}
      className={`p-3 rounded-lg text-left transition-all duration-200 ${
        isSelected
          ? 'bg-surface-hover ring-1 ring-accent-blue'
          : 'bg-surface-card hover:bg-surface-hover'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm">{pair}</span>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            isPositive ? 'text-accent-green bg-accent-green/10' : 'text-accent-red bg-accent-red/10'
          }`}
        >
          {isPositive ? '+' : ''}{ticker.changePercent24h}%
        </span>
      </div>
      <div
        className={`text-lg font-mono font-bold rounded px-1 -mx-1 ${flashClass}`}
        onAnimationEnd={() => setFlashClass('')}
      >
        ${formatPrice(ticker.price)}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Vol: {(ticker.volume24h / 1000).toFixed(0)}K
      </div>
    </button>
  );
}
