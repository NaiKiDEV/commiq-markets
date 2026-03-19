import { CommiqProvider } from "@naikidev/commiq-react";
import { CommiqDevtools } from "@naikidev/commiq-devtools";
import { marketStore } from "./stores/market/store.js";
import { chartStore } from "./stores/chart/store.js";
import { orderStore } from "./stores/order/store.js";
import { portfolioStore } from "./stores/portfolio/store.js";
import { uiStore } from "./stores/ui/store.js";
import { orderbookStore } from "./stores/orderbook/store.js";
import { searchStore } from "./stores/search/store.js";
import { Layout } from "./components/Layout.js";
import { MarketOverview } from "./components/MarketOverview.js";
import { PriceChart } from "./components/PriceChart.js";
import { OrderBook } from "./components/OrderBook.js";
import { OrderPanel } from "./components/OrderPanel.js";
import { BottomPanel } from "./components/BottomPanel.js";
import { ActivityFeed } from "./components/ActivityFeed.js";
import { ToastContainer } from "./components/ToastContainer.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { PanelError } from "./components/PanelError.js";

const stores = {
  market: marketStore,
  chart: chartStore,
  order: orderStore,
  portfolio: portfolioStore,
  ui: uiStore,
  orderbook: orderbookStore,
  search: searchStore,
};

// Stable fallback references — prevents ErrorBoundary re-renders from new function refs
const marketsFallback = (_err: Error, retry: () => void) => (
  <PanelError name="Markets" onRetry={retry} />
);
const chartFallback = (_err: Error, retry: () => void) => (
  <PanelError name="Price Chart" onRetry={retry} />
);
const orderbookFallback = (_err: Error, retry: () => void) => (
  <PanelError name="Order Book" onRetry={retry} />
);
const orderPanelFallback = (_err: Error, retry: () => void) => (
  <PanelError name="Order Panel" onRetry={retry} />
);
const bottomFallback = (_err: Error, retry: () => void) => (
  <PanelError name="Orders & Portfolio" onRetry={retry} />
);

export function App() {
  return (
    <>
      <Layout>
        {/* Ticker strip */}
        <div className="shrink-0">
          <ErrorBoundary fallback={marketsFallback}>
            <MarketOverview />
          </ErrorBoundary>
        </div>

        {/* Main area: chart + right sidebar */}
        <div className="flex-1 min-h-0 flex gap-1">
          {/* Chart (fills remaining width) */}
          <div className="flex-1 min-w-0">
            <ErrorBoundary fallback={chartFallback}>
              <PriceChart />
            </ErrorBoundary>
          </div>

          {/* Right sidebar: orderbook + order panel */}
          <div className="w-72 shrink-0 flex flex-col gap-1">
            <div className="flex-1 min-h-0">
              <ErrorBoundary fallback={orderbookFallback}>
                <OrderBook />
              </ErrorBoundary>
            </div>
            <div className="shrink-0">
              <ErrorBoundary fallback={orderPanelFallback}>
                <OrderPanel />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Bottom: tabbed orders/portfolio + activity feed */}
        <div className="shrink-0 h-40 flex gap-1">
          <div className="flex-1 min-w-0">
            <BottomPanel />
          </div>
          <div className="w-72 shrink-0">
            <ActivityFeed />
          </div>
        </div>
      </Layout>

      <ToastContainer />
      <CommiqDevtools stores={stores} />
    </>
  );
}
