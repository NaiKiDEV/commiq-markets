import type { ServerMessage } from "@commiq-markets/shared";
import { matchEvent, BuiltinEvent } from "@naikidev/commiq";
import { WsClient } from "./ws-client.js";
import { marketStore } from "../stores/market/store.js";
import { chartStore } from "../stores/chart/store.js";
import { orderStore } from "../stores/order/store.js";
import { orderbookStore } from "../stores/orderbook/store.js";
import { uiStore } from "../stores/ui/store.js";
import { MarketCommand } from "../stores/market/commands.js";
import { ChartCommand } from "../stores/chart/commands.js";
import { OrderCommand } from "../stores/order/commands.js";
import { OrderBookCommand } from "../stores/orderbook/commands.js";
import { UiCommand } from "../stores/ui/commands.js";
import { ChartEvent } from "../stores/events.js";

// Bridge: inbound WS messages become commiq commands
function handleServerMessage(msg: ServerMessage) {
  switch (msg.type) {
    case "snapshot":
      // Discard stale snapshots (interval mismatch)
      if (msg.interval !== chartStore.state.interval) return;
      marketStore.queue(MarketCommand.loadSnapshot(msg.tickers));
      chartStore.queue(ChartCommand.replaceCandles(msg.candles, msg.pair));
      // Ensure orderbook is subscribed for the snapshot's pair
      wsClient?.send({ type: "subscribe:orderbook", pair: msg.pair });
      break;

    case "ticker:update":
      marketStore.queue(MarketCommand.updateTicker(msg.ticker));
      break;

    case "candle:update":
      // Only apply candles matching our current pair + interval
      if (
        chartStore.state.pair === msg.pair &&
        msg.interval === chartStore.state.interval
      ) {
        chartStore.queue(ChartCommand.appendCandle(msg.candle));
      }
      break;

    case "order:accepted":
      orderStore.queue(OrderCommand.accepted(msg.order));
      break;

    case "order:filled":
      orderStore.queue(OrderCommand.filled(msg.order));
      break;

    case "order:rejected":
      orderStore.queue(OrderCommand.rejected(msg.orderId, msg.reason));
      break;

    case "orderbook:snapshot":
      orderbookStore.queue(
        OrderBookCommand.loadSnapshot(msg.pair, msg.bids, msg.asks),
      );
      break;

    case "orderbook:update":
      orderbookStore.queue(
        OrderBookCommand.update(msg.pair, msg.bids, msg.asks),
      );
      break;
  }
}

let wsClient: WsClient | null = null;

export function initTransport(url: string) {
  wsClient = new WsClient(url, {
    onMessage: handleServerMessage,
    onConnect: () => {
      marketStore.queue(MarketCommand.setConnected(true));
      uiStore.queue(UiCommand.clearReconnecting());
    },
    onDisconnect: () => {
      marketStore.queue(MarketCommand.setConnected(false));
    },
    onReconnecting: (attempt, delayMs) => {
      uiStore.queue(UiCommand.setReconnecting(attempt, delayMs));
    },
  });

  // Outbound: when chart pair switches, subscribe with current interval
  chartStore.openStream((event) => {
    if (event.name === ChartEvent.PairSwitched.name) {
      const data = event.data as { pair: string };
      wsClient?.send({
        type: "subscribe:pair",
        pair: data.pair as any,
        interval: chartStore.state.interval,
      });
      wsClient?.send({ type: "subscribe:orderbook", pair: data.pair as any });
    }

    // On interval change, re-subscribe with new interval for current pair
    if (event.name === ChartEvent.IntervalChanged.name) {
      const pair = chartStore.state.pair;
      if (pair) {
        wsClient?.send({
          type: "subscribe:pair",
          pair,
          interval: chartStore.state.interval,
        });
      }
    }
  });

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
    type: "order:place",
    id: data.id,
    pair: data.pair as any,
    side: data.side as any,
    orderType: data.orderType as any,
    amount: data.amount,
    price: data.price,
  });
}
