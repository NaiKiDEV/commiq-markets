import type { ReactNode } from "react";
import { ConnectionStatus } from "./ConnectionStatus.js";
import { ReconnectBanner } from "./ReconnectBanner.js";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full flex flex-col overflow-hidden p-1 gap-1">
      {/* Header */}
      <header className="shrink-0 h-10 bg-surface-card rounded flex justify-between items-center px-3 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <h1 className="text-sm font-bold tracking-tight text-gray-100">
            commiq<span className="text-accent-blue">::</span>
            <span className="text-gray-400 font-medium">markets</span>
          </h1>
          <span className="text-[9px] text-gray-500 font-mono bg-surface px-1.5 py-1 leading-none rounded">
            v1.0
          </span>
        </div>
        <ConnectionStatus />
      </header>

      <ReconnectBanner />

      {/* Content fills remaining viewport */}
      <div className="flex-1 min-h-0 flex flex-col gap-1">{children}</div>
    </div>
  );
}
