import { CommiqProvider } from '@naikidev/commiq-react';
import { CommiqDevtools } from '@naikidev/commiq-devtools';
import { marketStore } from './stores/market/store.js';
import { chartStore } from './stores/chart/store.js';
import { orderStore } from './stores/order/store.js';
import { portfolioStore } from './stores/portfolio/store.js';
import { uiStore } from './stores/ui/store.js';
import { orderbookStore } from './stores/orderbook/store.js';
import { searchStore } from './stores/search/store.js';
import { Layout } from './components/Layout.js';
import { MarketOverview } from './components/MarketOverview.js';
import { PriceChart } from './components/PriceChart.js';
import { OrderBook } from './components/OrderBook.js';
import { OrderPanel } from './components/OrderPanel.js';
import { OrderHistory } from './components/OrderHistory.js';
import { Portfolio } from './components/Portfolio.js';
import { ToastContainer } from './components/ToastContainer.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { PanelError } from './components/PanelError.js';

const stores = {
  market: marketStore,
  chart: chartStore,
  order: orderStore,
  portfolio: portfolioStore,
  ui: uiStore,
  orderbook: orderbookStore,
  search: searchStore,
};

export function App() {
  return (
    <CommiqProvider stores={stores}>
      <Layout>
        {/* Market tickers across the top */}
        <ErrorBoundary fallback={(err, retry) => <PanelError name="Market Overview" onRetry={retry} />}>
          <MarketOverview />
        </ErrorBoundary>

        {/* Main grid: chart + right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          <div className="lg:col-span-3">
            <ErrorBoundary fallback={(err, retry) => <PanelError name="Price Chart" onRetry={retry} />}>
              <PriceChart />
            </ErrorBoundary>
          </div>
          <div className="space-y-4">
            <ErrorBoundary fallback={(err, retry) => <PanelError name="Order Book" onRetry={retry} />}>
              <OrderBook />
            </ErrorBoundary>
            <ErrorBoundary fallback={(err, retry) => <PanelError name="Order Panel" onRetry={retry} />}>
              <OrderPanel />
            </ErrorBoundary>
          </div>
        </div>

        {/* Bottom row: orders + portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <ErrorBoundary fallback={(err, retry) => <PanelError name="Order History" onRetry={retry} />}>
            <OrderHistory />
          </ErrorBoundary>
          <ErrorBoundary fallback={(err, retry) => <PanelError name="Portfolio" onRetry={retry} />}>
            <Portfolio />
          </ErrorBoundary>
        </div>
      </Layout>

      <ToastContainer />
      <CommiqDevtools stores={stores} />
    </CommiqProvider>
  );
}
