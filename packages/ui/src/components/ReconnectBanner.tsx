import { useState, useEffect } from 'react';
import { useReconnecting } from '../stores/ui/hooks.js';

export function ReconnectBanner() {
  const reconnecting = useReconnecting();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!reconnecting) return;

    setCountdown(Math.ceil(reconnecting.nextRetryMs / 1000));
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [reconnecting]);

  if (!reconnecting) return null;

  return (
    <div className="bg-yellow-900/30 border-b border-yellow-700/40 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-yellow-300">
          Connection lost — reconnecting
          {reconnecting.attempt > 1 && (
            <span className="text-yellow-500"> (attempt {reconnecting.attempt})</span>
          )}
        </span>
        {countdown > 0 && (
          <span className="font-mono text-yellow-500 text-xs">
            {countdown}s
          </span>
        )}
      </div>
    </div>
  );
}
