import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-mono font-medium text-slate-950 shadow-lg border border-amber-400">
      <WifiOff className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
      <span>DISPATCH OFFLINE MODE — CACHED TELEMETRY ACTIVE</span>
    </div>
  );
};
