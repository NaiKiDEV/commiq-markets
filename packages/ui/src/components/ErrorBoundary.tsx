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

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // Only re-render if error state changed or children reference changed
    return (
      nextState.hasError !== this.state.hasError ||
      nextState.error !== this.state.error ||
      nextProps.children !== this.props.children
    );
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
        <div className="h-full flex flex-col items-center justify-center bg-surface-card rounded p-4">
          <div className="text-accent-red text-lg mb-1 font-mono">ERR</div>
          <h3 className="text-[11px] font-medium text-gray-300 mb-0.5">Something went wrong</h3>
          <p className="text-[10px] text-gray-500 mb-2 font-mono">{this.state.error?.message}</p>
          <button
            onClick={this.handleRetry}
            className="px-2.5 py-1 text-[10px] font-mono bg-accent-blue/15
                       rounded text-accent-blue hover:bg-accent-blue/25 transition-colors"
          >
            RETRY
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
