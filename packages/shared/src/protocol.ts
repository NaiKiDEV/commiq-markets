import type { CandleInterval, OhlcCandle, Order, OrderBookLevel, OrderSide, OrderType, Ticker, TradingPair } from './types.js';

// Server -> Client
export type ServerMessage =
  | { type: 'snapshot'; tickers: Ticker[]; candles: OhlcCandle[]; pair: TradingPair; interval: CandleInterval }
  | { type: 'ticker:update'; ticker: Ticker }
  | { type: 'candle:update'; pair: TradingPair; candle: OhlcCandle; interval: CandleInterval }
  | { type: 'order:accepted'; order: Order }
  | { type: 'order:filled'; order: Order }
  | { type: 'order:rejected'; orderId: string; reason: string }
  | { type: 'orderbook:snapshot'; pair: TradingPair; bids: OrderBookLevel[]; asks: OrderBookLevel[] }
  | { type: 'orderbook:update'; pair: TradingPair; bids: OrderBookLevel[]; asks: OrderBookLevel[] };

// Client -> Server
export type ClientMessage =
  | { type: 'subscribe:pair'; pair: TradingPair; interval?: CandleInterval }
  | { type: 'order:place'; id: string; pair: TradingPair; side: OrderSide; orderType: OrderType; amount: number; price: number }
  | { type: 'order:cancel'; orderId: string }
  | { type: 'subscribe:orderbook'; pair: TradingPair };
