export type TradingPair = 'BTC/USD' | 'ETH/USD' | 'SOL/USD' | 'DOGE/USD' | 'ADA/USD' | 'XRP/USD';

export type Ticker = {
  pair: TradingPair;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
};

export type OhlcCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'accepted' | 'filled' | 'rejected' | 'cancelled';

export type Order = {
  id: string;
  pair: TradingPair;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price: number;
  status: OrderStatus;
  createdAt: number;
  filledAt: number | null;
  filledPrice: number | null;
};

export type CandleInterval = '1m' | '5m' | '15m' | '1h';

export type OrderBookLevel = {
  price: number;
  quantity: number;
  total: number;
};

export type Position = {
  pair: TradingPair;
  amount: number;
  avgEntryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
};
