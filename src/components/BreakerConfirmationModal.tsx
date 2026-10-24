import React from 'react';
import { AlertTriangle, ShieldCheck, Power, X } from 'lucide-react';
import { BreakerState } from '../types/dispatch';

interface BreakerConfirmationModalProps {
  breaker: {
    type: 'unit' | 'feeder';
    id: string;
    name: string;
    currentState: BreakerState;
    voltage: number;
    currentMW: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export const BreakerConfirmationModal: React.FC<BreakerConfirmationModalProps> = ({
  breaker,
  onConfirm,
  onCancel,
}) => {
  const willClose = breaker.currentState !== 'CLOSED';
  const actionText = willClose ? 'CLOSE & ENERGIZE' : 'TRIP & DE-ENERGIZE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {willClose ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            )}
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Switchgear Dispatch Interlock
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs">
          <p className="text-slate-300">
            Please confirm dispatch operation for high-voltage switchgear:
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Equipment:</span>
              <span className="font-bold text-white">{breaker.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Operating Voltage:</span>
              <span className="text-sky-400">{breaker.voltage} kV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Flow:</span>
              <span className="text-amber-400">{breaker.currentMW} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Status:</span>
              <span className={breaker.currentState === 'CLOSED' ? 'text-emerald-400' : 'text-rose-400'}>
                {breaker.currentState}
              </span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-slate-800">
              <span className="text-slate-300">Action:</span>
              <span className={willClose ? 'text-emerald-400' : 'text-rose-400'}>
                {actionText}
              </span>
            </div>
          </div>

          {!willClose && (
            <p className="text-rose-400 text-[11px] leading-relaxed bg-rose-950/60 p-2 rounded border border-rose-800/60">
              ⚠️ Warning: Tripping this breaker will disconnect {breaker.currentMW} MW of power
              and generate an immediate automated outage alert to all monitoring devices.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition ${
              willClose
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Confirm {actionText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
