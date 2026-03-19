import type { ServerMessage } from '@commiq-markets/shared';
import { matchEvent, BuiltinEvent } from '@naikidev/commiq';
import { WsClient } from './ws-client.js';
import { marketStore } from '../stores/market/store.js';
import { chartStore } from '../stores/chart/store.js';
import { orderStore } from '../stores/order/store.js';
import { orderbookStore } from '../stores/orderbook/store.js';
import { MarketCommand } from '../stores/market/commands.js';
import { ChartCommand } from '../stores/chart/commands.js';
import { OrderCommand } from '../stores/order/commands.js';
import { OrderBookCommand } from '../stores/orderbook/commands.js';
import { ChartEvent } from '../stores/events.js';

// Bridge: inbound WS messages become commiq commands
function handleServerMessage(msg: ServerMessage) {
  switch (msg.type) {
    case 'snapshot':
      marketStore.queue(MarketCommand.loadSnapshot(msg.tickers));
      chartStore.queue(ChartCommand.replaceCandles(msg.candles));
      break;

    case 'ticker:update':
      marketStore.queue(MarketCommand.updateTicker(msg.ticker));
      break;

    case 'candle:update':
      if (chartStore.state.pair === msg.pair) {
        chartStore.queue(ChartCommand.appendCandle(msg.candle));
      }
      break;

    case 'order:accepted':
      orderStore.queue(OrderCommand.accepted(msg.order));
      break;

    case 'order:filled':
      orderStore.queue(OrderCommand.filled(msg.order));
      break;

    case 'order:rejected':
      orderStore.queue(OrderCommand.rejected(msg.orderId, msg.reason));
      break;

    case 'orderbook:snapshot':
      orderbookStore.queue(OrderBookCommand.loadSnapshot(msg.pair, msg.bids, msg.asks));
      break;

    case 'orderbook:update':
      orderbookStore.queue(OrderBookCommand.update(msg.pair, msg.bids, msg.asks));
      break;
  }
}

let wsClient: WsClient | null = null;

export function initTransport(url: string) {
  wsClient = new WsClient(url, {
    onMessage: handleServerMessage,
    onConnect: () => {
      marketStore.queue(MarketCommand.setConnected(true));
    },
    onDisconnect: () => {
      marketStore.queue(MarketCommand.setConnected(false));
    },
  });

  // Outbound: when chart pair switches, subscribe to both candles and orderbook
  chartStore.openStream((event) => {
    if (event.name === ChartEvent.PairSwitched.name) {
      const data = event.data as { pair: string };
      wsClient?.send({ type: 'subscribe:pair', pair: data.pair as any });
      wsClient?.send({ type: 'subscribe:orderbook', pair: data.pair as any });
    }
  });

  // Dev logging with matchEvent + BuiltinEvent (commiq feature showcase)
  if (import.meta.env.DEV) {
    orderStore.openStream((event) => {
      if (matchEvent(event, BuiltinEvent.CommandHandled)) {
        console.log('[order:stream] Command handled:', event.data);
      }
    });

    orderbookStore.openStream((event) => {
      if (matchEvent(event, BuiltinEvent.CommandHandled)) {
        console.log('[orderbook:stream] Command handled:', event.data);
      }
    });
  }

  wsClient.connect();
  return wsClient;
}

export function getWsClient() {
  return wsClient;
}

export function sendOrder(data: {
  id: string;
  pair: string;
  side: string;
  orderType: string;
  amount: number;
  price: number;
}) {
  wsClient?.send({
    type: 'order:place',
    id: data.id,
    pair: data.pair as any,
    side: data.side as any,
    orderType: data.orderType as any,
    amount: data.amount,
    price: data.price,
  });
}
