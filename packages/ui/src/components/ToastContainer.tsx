import { useState, useCallback } from 'react';
import { useEvent, useQueue } from '@naikidev/commiq-react';
import { uiStore } from '../stores/ui/store.js';
import { UiEvent } from '../stores/events.js';
import { UiCommand } from '../stores/ui/commands.js';
import { useToasts } from '../stores/ui/hooks.js';

const typeStyles: Record<string, string> = {
  success: 'border-accent-green/30 bg-accent-green/10',
  error: 'border-accent-red/30 bg-accent-red/10',
  info: 'border-accent-blue/30 bg-accent-blue/10',
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

  // Auto-dismiss toasts after 4 seconds — uses useEvent to react to new toasts
  useEvent(uiStore, UiEvent.ToastAdded, (event) => {
    const { id } = event.data;
    setTimeout(() => dismissToast(id), 4000);
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border rounded-lg px-4 py-3 text-sm shadow-lg ${
            dismissingIds.has(toast.id) ? 'animate-fade-out' : 'animate-slide-in'
          } ${typeStyles[toast.type] ?? typeStyles.info}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-500 hover:text-gray-300 text-xs"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
