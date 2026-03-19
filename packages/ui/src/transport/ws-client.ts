import type { ClientMessage, ServerMessage } from '@commiq-markets/shared';

export type WsClientCallbacks = {
  onMessage: (msg: ServerMessage) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onReconnecting?: (attempt: number, delayMs: number) => void;
};

export class WsClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private reconnectAttempt = 0;

  constructor(
    private url: string,
    private callbacks: WsClientCallbacks,
  ) {}

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
      this.reconnectAttempt = 0;
      this.callbacks.onConnect();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ServerMessage;
        this.callbacks.onMessage(msg);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.callbacks.onDisconnect();
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect() {
    this.reconnectAttempt++;
    this.callbacks.onReconnecting?.(this.reconnectAttempt, this.reconnectDelay);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
      this.connect();
    }, this.reconnectDelay);
  }
}
