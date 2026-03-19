import { useState } from 'react';
import type { OrderSide, OrderType } from '@commiq-markets/shared';
import { useSelectedPair } from '../stores/ui/hooks.js';
import { useTicker } from '../stores/market/hooks.js';
import { usePlaceOrder } from '../stores/order/hooks.js';
import { useCashBalance, useHolding } from '../stores/portfolio/hooks.js';
import { sendOrder } from '../transport/ws-bridge.js';

const QUICK_FILL = [0.25, 0.5, 0.75, 1] as const;

export function OrderPanel() {
  const selectedPair = useSelectedPair();
  const ticker = useTicker(selectedPair);
  const placeOrder = usePlaceOrder();
  const cashBalance = useCashBalance();
  const holding = useHolding(selectedPair);
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const currentPrice = ticker?.price ?? 0;
  const effectivePrice = orderType === 'market' ? currentPrice : (parseFloat(limitPrice) || 0);
  const total = (parseFloat(amount) || 0) * effectivePrice;

  const availableBalance = side === 'buy' ? cashBalance : (holding?.amount ?? 0);
  const maxAmount = side === 'buy'
    ? (effectivePrice > 0 ? cashBalance / effectivePrice : 0)
    : (holding?.amount ?? 0);

  const handleQuickFill = (pct: number) => {
    const qty = maxAmount * pct;
    if (qty > 0) setAmount(qty.toPrecision(6));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(amount);
    if (!qty || qty <= 0 || !effectivePrice) return;

    const orderId = placeOrder(selectedPair, side, orderType, qty, effectivePrice);

    sendOrder({
      id: orderId,
      pair: selectedPair,
      side,
      orderType,
      amount: qty,
      price: effectivePrice,
    });

    setAmount('');
    if (orderType === 'limit') setLimitPrice('');
  };

  return (
    <div className="bg-surface-card rounded p-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Order</span>
        <span className="text-[10px] font-mono text-gray-400">
          {side === 'buy'
            ? `$${availableBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
            : `${availableBalance.toFixed(4)} ${selectedPair.split('/')[0]}`
          }
        </span>
      </div>

      {/* Buy/Sell toggle */}
      <div className="flex gap-px mb-2 bg-surface rounded overflow-hidden">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-1.5 text-[11px] font-semibold transition-colors ${
            side === 'buy'
              ? 'bg-accent-green/15 text-accent-green'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-1.5 text-[11px] font-semibold transition-colors ${
            side === 'sell'
              ? 'bg-accent-red/15 text-accent-red'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Market/Limit toggle */}
      <div className="flex gap-px mb-2.5 bg-surface rounded overflow-hidden">
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-1 text-[10px] font-semibold transition-colors ${
            orderType === 'market'
              ? 'bg-accent-blue/15 text-accent-blue'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-1 text-[10px] font-semibold transition-colors ${
            orderType === 'limit'
              ? 'bg-accent-blue/15 text-accent-blue'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Limit
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Price */}
        <div>
          <label className="block text-[10px] text-gray-500 mb-0.5 font-mono uppercase">
            {orderType === 'market' ? 'Price' : 'Limit'}
          </label>
          {orderType === 'market' ? (
            <div className="bg-surface rounded px-2 py-1.5 text-[11px] font-mono text-gray-300">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
          ) : (
            <input
              type="number"
              step="any"
              min="0"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={currentPrice.toString()}
              className="w-full bg-surface rounded px-2 py-1.5 text-[11px] font-mono
                         text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-accent-blue/30"
            />
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[10px] text-gray-500 mb-0.5 font-mono uppercase">Amount</label>
          <input
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-surface rounded px-2 py-1.5 text-[11px] font-mono
                       text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-accent-blue/30"
          />
        </div>

        {/* Quick-fill pills */}
        <div className="flex gap-px">
          {QUICK_FILL.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleQuickFill(pct)}
              className="flex-1 py-0.5 text-[9px] font-mono font-semibold text-gray-500 bg-surface
                         hover:text-gray-300 hover:bg-surface-hover
                         transition-colors first:rounded-l last:rounded-r"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between text-[10px] px-0.5">
          <span className="font-mono uppercase text-gray-500">Total</span>
          <span className="font-mono text-gray-300">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="submit"
          disabled={!amount || parseFloat(amount) <= 0 || (orderType === 'limit' && !effectivePrice)}
          className={`w-full py-2 rounded font-semibold text-[11px] uppercase tracking-wide transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed ${
            side === 'buy'
              ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30'
              : 'bg-accent-red/20 text-accent-red hover:bg-accent-red/30'
          }`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
          {orderType === 'limit' ? ' Limit' : ''}
        </button>
      </form>
    </div>
  );
}
