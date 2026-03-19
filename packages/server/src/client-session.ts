import type WebSocket from 'ws';
import type { CandleInterval, ClientMessage, ServerMessage, TradingPair } from '@commiq-markets/shared';
import type { MarketEngine } from './market-engine.js';
import type { CandleGenerator } from './candle-generator.js';
import type { OrderEngine } from './order-engine.js';
import type { OrderBookEngine } from './orderbook-engine.js';

export class ClientSession {
  subscribedPair: TradingPair = 'BTC/USD';
  subscribedInterval: CandleInterval = '1m';
  subscribedOrderbookPair: TradingPair | null = null;

  constructor(
    private ws: WebSocket,
    private market: MarketEngine,
    private candles: CandleGenerator,
    private orders: OrderEngine,
    private orderbook: OrderBookEngine,
  ) {}

  send(msg: ServerMessage) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  handleMessage(raw: string) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'subscribe:pair':
        this.subscribedPair = msg.pair;
        if (msg.interval) this.subscribedInterval = msg.interval;
        // Send historical candles for the new pair at requested interval
        const history = this.candles.generateHistory(msg.pair, 100, this.subscribedInterval);
        this.send({
          type: 'snapshot',
          tickers: this.market.getAllTickers(),
          candles: history,
          pair: msg.pair,
          interval: this.subscribedInterval,
        });
        break;

      case 'order:place':
        this.orders.placeOrder(
          msg.id,
          msg.pair,
          msg.side,
          msg.orderType,
          msg.amount,
          msg.price,
          {
            onAccepted: (order) => this.send({ type: 'order:accepted', order }),
            onFilled: (order) => this.send({ type: 'order:filled', order }),
            onRejected: (id, reason) => this.send({ type: 'order:rejected', orderId: id, reason }),
          },
        );
        break;

      case 'order:cancel':
        this.orders.cancelOrder(msg.orderId);
        break;

      case 'subscribe:orderbook':
        this.subscribedOrderbookPair = msg.pair;
        const book = this.orderbook.getSnapshot(msg.pair);
        this.send({ type: 'orderbook:snapshot', pair: msg.pair, bids: book.bids, asks: book.asks });
        break;
    }
  }

  sendSnapshot() {
    const tickers = this.market.getAllTickers();
    const candles = this.candles.generateHistory(this.subscribedPair, 100, this.subscribedInterval);
    this.send({
      type: 'snapshot',
      tickers,
      candles,
      pair: this.subscribedPair,
      interval: this.subscribedInterval,
    });
  }
}
