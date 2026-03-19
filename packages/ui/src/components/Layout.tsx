import type { ReactNode } from 'react';
import { ConnectionStatus } from './ConnectionStatus.js';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface-card border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">
              Commiq <span className="text-accent-blue">Markets</span>
            </h1>
            <span className="text-xs text-gray-600 bg-surface px-2 py-0.5 rounded">
              powered by commiq
            </span>
          </div>
          <ConnectionStatus />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        {children}
      </main>
    </div>
  );
}
