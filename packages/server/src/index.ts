import { WebSocketServer } from 'ws';
import { WS_PORT } from '@commiq-markets/shared';
import { MarketEngine } from './market-engine.js';
import { CandleGenerator } from './candle-generator.js';
import { OrderEngine } from './order-engine.js';
import { OrderBookEngine } from './orderbook-engine.js';
import { ClientSession } from './client-session.js';

const market = new MarketEngine();
const candles = new CandleGenerator();
const orders = new OrderEngine(market);
const orderbook = new OrderBookEngine();

const wss = new WebSocketServer({ port: WS_PORT });
const sessions = new Set<ClientSession>();

// Forward ticks to candle generator, orderbook, limit order checks, and all clients
market.onTick((ticker) => {
  candles.processTick(ticker);
  orderbook.regenerate(ticker.pair, ticker.price);
  orders.checkLimitOrders(ticker.pair, ticker.price);

  for (const session of sessions) {
    session.send({ type: 'ticker:update', ticker });

    // Send orderbook updates to subscribed clients
    if (session.subscribedOrderbookPair === ticker.pair) {
      const book = orderbook.getSnapshot(ticker.pair);
      session.send({ type: 'orderbook:update', pair: ticker.pair, bids: book.bids, asks: book.asks });
    }
  }
});

// Forward candle updates to subscribed clients
candles.onCandle((pair, candle) => {
  for (const session of sessions) {
    if (session.subscribedPair === pair) {
      session.send({ type: 'candle:update', pair, candle });
    }
  }
});

wss.on('connection', (ws) => {
  const session = new ClientSession(ws, market, candles, orders, orderbook);
  sessions.add(session);

  // Send initial snapshot
  session.sendSnapshot();

  ws.on('message', (data) => {
    session.handleMessage(data.toString());
  });

  ws.on('close', () => {
    sessions.delete(session);
  });

  console.log(`Client connected (${sessions.size} total)`);
});

market.start();
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
