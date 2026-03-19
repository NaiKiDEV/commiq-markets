import { Component, type ReactNode } from 'react';

type Props = {
  fallback?: (error: Error, retry: () => void) => ReactNode;
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }
      return (
        <div className="bg-surface-card rounded-lg p-6 text-center">
          <div className="text-accent-red text-2xl mb-2">&#x26A0;</div>
          <h3 className="text-sm font-semibold text-gray-300 mb-1">Something went wrong</h3>
          <p className="text-xs text-gray-500 mb-3">{this.state.error?.message}</p>
          <button
            onClick={this.handleRetry}
            className="px-3 py-1.5 text-xs bg-accent-blue rounded-md text-white hover:bg-accent-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
