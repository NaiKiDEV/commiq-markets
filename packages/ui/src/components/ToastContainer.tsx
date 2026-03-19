import { useState, useCallback } from 'react';
import { useEvent, useQueue } from '@naikidev/commiq-react';
import { uiStore } from '../stores/ui/store.js';
import { UiEvent } from '../stores/events.js';
import { UiCommand } from '../stores/ui/commands.js';
import { useToasts } from '../stores/ui/hooks.js';

const typeStyles: Record<string, string> = {
  success: 'bg-accent-green/10 text-accent-green',
  error: 'bg-accent-red/10 text-accent-red',
  info: 'bg-accent-blue/10 text-accent-blue',
};

export function ToastContainer() {
  const toasts = useToasts();
  const queue = useQueue(uiStore);
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());

  const dismissToast = useCallback((id: string) => {
    setDismissingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      queue(UiCommand.removeToast(id));
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, [queue]);

  // Auto-dismiss toasts after 4 seconds
  useEvent(uiStore, UiEvent.ToastAdded, (event) => {
    const { id } = event.data;
    setTimeout(() => dismissToast(id), 4000);
  });

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col gap-1.5 max-w-xs">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded px-3 py-2 text-[11px] font-medium shadow-xl backdrop-blur-sm ${
            dismissingIds.has(toast.id) ? 'animate-fade-out' : 'animate-slide-in'
          } ${typeStyles[toast.type] ?? typeStyles.info}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="opacity-50 hover:opacity-100 text-xs shrink-0"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
