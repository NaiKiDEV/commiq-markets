import { useState } from 'react';
import type { OrderSide, OrderType } from '@commiq-markets/shared';
import { useSelectedPair } from '../stores/ui/hooks.js';
import { useTicker } from '../stores/market/hooks.js';
import { usePlaceOrder } from '../stores/order/hooks.js';
import { sendOrder } from '../transport/ws-bridge.js';

export function OrderPanel() {
  const selectedPair = useSelectedPair();
  const ticker = useTicker(selectedPair);
  const placeOrder = usePlaceOrder();
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const currentPrice = ticker?.price ?? 0;
  const effectivePrice = orderType === 'market' ? currentPrice : (parseFloat(limitPrice) || 0);
  const total = (parseFloat(amount) || 0) * effectivePrice;

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
    <div className="bg-surface-card rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Place Order
      </h2>

      {/* Buy/Sell toggle */}
      <div className="flex gap-1 mb-3 bg-surface rounded-lg p-1">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            side === 'buy'
              ? 'bg-accent-green text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            side === 'sell'
              ? 'bg-accent-red text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Market/Limit toggle */}
      <div className="flex gap-1 mb-4 bg-surface rounded-lg p-1">
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            orderType === 'market'
              ? 'bg-accent-blue text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            orderType === 'limit'
              ? 'bg-accent-blue text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Limit
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Price */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {orderType === 'market' ? 'Market Price' : 'Limit Price'}
          </label>
          {orderType === 'market' ? (
            <div className="bg-surface rounded px-3 py-2 text-sm font-mono text-gray-300">
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
              className="w-full bg-surface rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-600
                         outline-none focus:ring-1 focus:ring-accent-blue"
            />
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount</label>
          <input
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-surface rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-600
                       outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Total */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>Total</span>
          <span className="font-mono">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          type="submit"
          disabled={!amount || parseFloat(amount) <= 0 || (orderType === 'limit' && !effectivePrice)}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            side === 'buy'
              ? 'bg-accent-green hover:bg-accent-green/90 text-white'
              : 'bg-accent-red hover:bg-accent-red/90 text-white'
          }`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
          {orderType === 'limit' ? ' (Limit)' : ''}
        </button>
      </form>
    </div>
  );
}
