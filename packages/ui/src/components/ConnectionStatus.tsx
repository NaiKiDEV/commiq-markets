import { memo } from 'react';
import { useMarketConnected } from '../stores/market/hooks.js';

export const ConnectionStatus = memo(function ConnectionStatus() {
  const connected = useMarketConnected();

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono">
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-accent-green' : 'bg-accent-red animate-pulse'}`}
      />
      <span className={connected ? 'text-gray-400' : 'text-accent-red'}>
        {connected ? 'LIVE' : 'DOWN'}
      </span>
    </div>
  );
});
