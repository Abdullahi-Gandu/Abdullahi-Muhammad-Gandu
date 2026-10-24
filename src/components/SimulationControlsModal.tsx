import React from 'react';
import {
  Sparkles,
  Zap,
  Flame,
  Activity,
  RotateCcw,
  ShieldAlert,
  X,
  TrendingDown,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';

interface SimulationControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationControlsModal: React.FC<SimulationControlsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { runScenario, activeScenario } = useDispatch();

  if (!isOpen) return null;

  const handleSelectScenario = (
    key: 'normal' | 'hadejia-trip' | 'kafin-hausa-trip' | 'tx-overheat' | 'grid-low-freq' | 'irrigation-surge'
  ) => {
    runScenario(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-mono">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              FutureX 132/33kV Emergency Drills & Outage Injection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Inject power house and grid disturbances to test real-time SCADA telemetry,
          automated push notifications, audible sirens, and dispatch restoration procedures:
        </p>

        <div className="space-y-2.5 text-xs">
          {/* Scenario 1: Hadejia Trip */}
          <button
            onClick={() => handleSelectScenario('hadejia-trip')}
            className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-600 hover:bg-rose-950/20 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-500" />
                1. Hadejia 11kV Feeder Overcurrent Trip (Line Outage)
              </span>
              <span className="text-[10px] text-rose-400 font-bold uppercase">Critical Push</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Phase B-C fault on Hadejia town distribution line. CB-11K-01 trips on Relay 50/51. 5.2 MW dropped, 68,000 customers off. Fires push alert & alarm siren.
            </p>
          </button>

          {/* Scenario 2: Kafin Hausa Earth Fault */}
          <button
            onClick={() => handleSelectScenario('kafin-hausa-trip')}
            className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-600 hover:bg-rose-950/20 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                2. Kafin Hausa 11kV Earth Fault Trip
              </span>
              <span className="text-[10px] text-rose-400 font-bold uppercase">51N Trip</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tree branch contact trips Kafin Hausa line on earth fault 51N. 4.1 MW dropped. 42,000 customers off.
            </p>
          </button>

          {/* Scenario 3: Transformer Overheat */}
          <button
            onClick={() => handleSelectScenario('tx-overheat')}
            className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-600 hover:bg-amber-950/20 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                3. Power Transformer T1A (60MVA) High Winding Temp (&gt;95°C)
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase">Thermal Alarm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Winding temp exceeds 95°C. Cooling fans turn on. Operator alerted to transfer 33kV load to Transformer T2A.
            </p>
          </button>

          {/* Scenario 4: National Grid Low Frequency */}
          <button
            onClick={() => handleSelectScenario('grid-low-freq')}
            className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-600 hover:bg-sky-950/20 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                4. National Grid Low Frequency (49.32 Hz)
              </span>
              <span className="text-[10px] text-sky-400 font-bold uppercase">Under-Freq</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Frequency drops below standard tolerance. Operators prepare Under-Frequency Load Shedding (UFLS).
            </p>
          </button>

          {/* Scenario 5: Reset All */}
          <button
            onClick={() => handleSelectScenario('normal')}
            className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-600 hover:bg-emerald-950/20 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                Reset: Restore All 8 Feeders to Normal Operation
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Nominal 50.00 Hz</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Re-energizes all 8 town feeders (Hadejia, Kafin Hausa, Auyo, Malam Madori, Guri, Kirikasamma, Kaugama, Birniwa).
            </p>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">
            Current: <strong className="text-sky-400">{activeScenario}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
