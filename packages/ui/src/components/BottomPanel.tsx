import { memo, useCallback, useRef, useState } from "react";
import { useEvent } from "@naikidev/commiq-react";
import { useOrders } from "../stores/order/hooks.js";
import {
  usePortfolio,
  useCashBalance,
  useTotalValue,
} from "../stores/portfolio/hooks.js";
import { orderStore } from "../stores/order/store.js";
import { OrderEvent } from "../stores/events.js";

const statusColors: Record<string, string> = {
  pending: "text-yellow-400",
  accepted: "text-accent-blue",
  filled: "text-accent-green",
  rejected: "text-accent-red",
  cancelled: "text-gray-500",
};

type Tab = "orders" | "portfolio";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-[11px] text-gray-600 font-mono">{message}</span>
    </div>
  );
}

const OrdersTab = memo(function OrdersTab({
  flashedId,
}: {
  flashedId: string | null;
}) {
  const orders = useOrders();
  const seenIdsRef = useRef<Set<string>>(new Set());

  if (orders.length === 0) return <EmptyState message="No orders yet" />;

  return (
    <>
      {orders.map((order) => {
        const isNew = !seenIdsRef.current.has(order.id);
        if (isNew) seenIdsRef.current.add(order.id);
        const isFlashed = flashedId === order.id;

        return (
          <div
            key={order.id}
            className={`flex items-center justify-between text-[11px] py-1.5 px-3 transition-colors duration-500
              border-b border-white/[0.03] ${isFlashed ? "bg-accent-green/10" : "hover:bg-surface-hover"}
              ${isNew ? "animate-slide-down" : ""}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`font-mono font-semibold text-[10px] w-7 ${
                  order.side === "buy" ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {order.side.toUpperCase()}
              </span>
              <span className="text-gray-300">{order.pair}</span>
              <span className="text-gray-500 font-mono">{order.amount}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-gray-400">
                $
                {(order.filledPrice ?? order.price).toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </span>
              <span
                className={`font-mono uppercase text-[9px] w-14 text-right ${statusColors[order.status] ?? "text-gray-500"}`}
              >
                {order.status}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
});

const PortfolioTab = memo(function PortfolioTab() {
  const { positions } = usePortfolio();

  if (positions.length === 0) return <EmptyState message="No open positions" />;

  return (
    <>
      {positions.map(
        (pos) =>
          pos && (
            <div
              key={pos.pair}
              className="flex items-center justify-between text-[11px] py-1.5 px-3
                border-b border-white/[0.03] hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-gray-200">{pos.pair}</span>
                <span className="text-gray-500 font-mono">
                  {pos.amount.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-gray-400">
                  $
                  {(pos.amount * pos.currentPrice).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span
                  className={`font-mono text-[10px] w-16 text-right ${
                    pos.unrealizedPnl >= 0
                      ? "text-accent-green"
                      : "text-accent-red"
                  }`}
                >
                  {pos.unrealizedPnl >= 0 ? "+" : ""}$
                  {pos.unrealizedPnl.toFixed(2)}
                </span>
              </div>
            </div>
          ),
      )}
    </>
  );
});

const PortfolioSummary = memo(function PortfolioSummary() {
  const cashBalance = useCashBalance();
  const totalValue = useTotalValue();

  return (
    <div className="flex items-center gap-3 text-[10px] font-mono pr-2">
      <span className="text-gray-500">
        Cash{" "}
        <span className="text-gray-300">
          ${cashBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </span>
      </span>
      <span className="text-gray-500">
        Total{" "}
        <span className="text-gray-100 font-semibold">
          ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </span>
      </span>
    </div>
  );
});

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [flashedId, setFlashedId] = useState<string | null>(null);

  // useEvent showcase: flash-highlight the filled order row
  useEvent(
    orderStore,
    OrderEvent.Filled,
    useCallback((event) => {
      const { order } = event.data;
      setFlashedId(order.id);
      setActiveTab("orders");
      setTimeout(() => setFlashedId(null), 800);
    }, []),
  );

  return (
    <div className="h-full flex flex-col bg-surface-card rounded overflow-hidden">
      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-0 px-1 pt-1">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === "orders"
              ? "text-gray-200 bg-surface"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-3 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === "portfolio"
              ? "text-gray-200 bg-surface"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Portfolio
        </button>
        <div className="flex-1" />
        <PortfolioSummary />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "orders" && <OrdersTab flashedId={flashedId} />}
        {activeTab === "portfolio" && <PortfolioTab />}
      </div>
    </div>
  );
}
