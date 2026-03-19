export function PanelError({ name, onRetry }: { name: string; onRetry?: () => void }) {
  return (
    <div className="bg-surface-card rounded-lg p-6 text-center">
      <div className="text-accent-red text-2xl mb-2">&#x26A0;</div>
      <h3 className="text-sm font-semibold text-gray-300 mb-1">{name}</h3>
      <p className="text-xs text-gray-500 mb-3">This panel encountered an error</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs bg-accent-blue rounded-md text-white hover:bg-accent-blue/90 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
