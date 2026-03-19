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
    <div className="shrink-0 bg-accent-yellow/15 rounded px-3 py-1.5">
      <div className="flex items-center justify-center gap-2 text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-pulse" />
        <span className="text-accent-yellow font-medium">
          Reconnecting
          {reconnecting.attempt > 1 && (
            <span className="text-accent-yellow/70 font-mono"> #{reconnecting.attempt}</span>
          )}
        </span>
        {countdown > 0 && (
          <span className="font-mono text-accent-yellow/70">{countdown}s</span>
        )}
      </div>
    </div>
  );
}
