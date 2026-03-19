import { useMarketConnected } from '../stores/market/hooks.js';

export function ConnectionStatus() {
  const connected = useMarketConnected();

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-green' : 'bg-accent-red animate-pulse'}`}
      />
      <span className={connected ? 'text-gray-400' : 'text-accent-red'}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}
