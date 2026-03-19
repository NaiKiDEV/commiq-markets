export function PanelError({ name, onRetry }: { name: string; onRetry?: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-surface-card rounded p-4">
      <div className="text-accent-red text-lg mb-1 font-mono">ERR</div>
      <h3 className="text-[11px] font-medium text-gray-300 mb-0.5">{name}</h3>
      <p className="text-[10px] text-gray-500 mb-2 font-mono">Panel crashed</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-2.5 py-1 text-[10px] font-mono bg-accent-blue/15
                     rounded text-accent-blue hover:bg-accent-blue/25 transition-colors"
        >
          RETRY
        </button>
      )}
    </div>
  );
}
