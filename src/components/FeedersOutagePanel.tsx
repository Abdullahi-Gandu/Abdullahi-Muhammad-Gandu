import React, { useState } from 'react';
import {
  Zap,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Power,
  RotateCcw,
  Users,
  Building2,
  Hospital,
  Clock,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { FeederLine } from '../types/dispatch';
import { BreakerConfirmationModal } from './BreakerConfirmationModal';

export const FeedersOutagePanel: React.FC = () => {
  const {
    feeders,
    toggleFeederBreaker,
    emergencyShedFeeder,
    restoreAllFeeders,
    activeOperator,
  } = useDispatch();

  const [confirmingFeeder, setConfirmingFeeder] = useState<FeederLine | null>(null);

  const activeOutages = feeders.filter(
    (f) => f.breakerState !== 'CLOSED' || f.protectionTripped
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col font-mono">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              FutureX 11kV Receiving Feeders & Outage Management
            </h2>
            <p className="text-[11px] text-slate-400">
              Hadejia, Kafin Hausa, Auyo, Malam Madori, Guri, Kirikasamma, Kaugama, Birniwa (All 11kV)
            </p>
          </div>
        </div>

        {/* Emergency Load Shedding & Restoration Fast Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden lg:inline">Quick Actions:</span>
          <button
            onClick={() => emergencyShedFeeder('FDR-11K-05', 'Rotation Load Shedding')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950 hover:border-rose-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-rose-200 transition"
            title="Emergency shed Guri 11kV Feeder"
          >
            Shed Guri (-2.7MW)
          </button>
          <button
            onClick={() => emergencyShedFeeder('FDR-11K-07', 'Rotation Load Shedding')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950 hover:border-rose-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-rose-200 transition"
            title="Emergency shed Kaugama 11kV Feeder"
          >
            Shed Kaugama (-2.9MW)
          </button>
          <button
            onClick={restoreAllFeeders}
            className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            title="Close all 11kV breakers and restore power to all 8 towns"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore All 8 Feeders</span>
          </button>
        </div>
      </div>

      {/* Outage status callout if outages active */}
      {activeOutages.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-ping" />
            <span className="font-bold">
              {activeOutages.length} TOWN FEEDER OUTAGE{activeOutages.length > 1 ? 'S' : ''} ACTIVE —{' '}
              {activeOutages.reduce((sum, f) => sum + f.customersCount, 0).toLocaleString()} CUSTOMERS DE-ENERGIZED
            </span>
          </div>
          <span className="text-[11px] text-rose-300">
            Push alerts automatically transmitted to mobile & desktop terminals
          </span>
        </div>
      )}

      {/* The 8 Feeders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {feeders.map((feeder) => {
          const isEnergized = feeder.breakerState === 'CLOSED';
          const isTripped = feeder.breakerState === 'TRIPPED' || feeder.protectionTripped;
          const loadPct = (feeder.currentMW / feeder.ratedCapacityMW) * 100;
          const isOverloaded = loadPct > feeder.overloadThresholdPct;

          return (
            <div
              key={feeder.id}
              className={`rounded-xl border p-3.5 flex flex-col justify-between transition-colors shadow-sm relative ${
                isTripped
                  ? 'bg-rose-950/40 border-rose-700/80 ring-1 ring-rose-500/50'
                  : isOverloaded
                  ? 'bg-amber-950/40 border-amber-700/80'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Feeder Title & Priority Badge */}
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-100">{feeder.name}</span>
                      {feeder.isCriticalCustomer && (
                        <span
                          className="px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-300 border border-amber-700 text-[9px] font-bold uppercase flex items-center gap-0.5"
                          title="Priority Town Feeder (Emir Palace / Gen Hospital)"
                        >
                          <Hospital className="w-2.5 h-2.5" /> PRIORITY
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">11kV Feeder • {feeder.townName}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                      isTripped
                        ? 'bg-rose-900 text-rose-200 border-rose-700 animate-pulse'
                        : isOverloaded
                        ? 'bg-amber-900 text-amber-200 border-amber-700'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {isTripped ? 'OUTAGE' : isOverloaded ? 'OVERLOAD' : 'ENERGIZED'}
                  </span>
                </div>

                {/* Primary MW Output Display */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400">ACTIVE LOAD:</span>
                    <span className="text-xl font-extrabold text-slate-100">
                      {isEnergized ? feeder.currentMW.toFixed(1) : 0}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        / {feeder.ratedCapacityMW} MW
                      </span>
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isTripped
                          ? 'bg-slate-700'
                          : isOverloaded
                          ? 'bg-amber-500'
                          : 'bg-sky-500'
                      }`}
                      style={{ width: `${isEnergized ? Math.min(100, loadPct) : 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Load: {isEnergized ? loadPct.toFixed(1) : 0}%</span>
                    <span>Max: {feeder.ratedCapacityMW} MW</span>
                  </div>
                </div>

                {/* Feeder Electrical Parameters (Voltage, Current, Reactive, Customers) */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px]">
                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                    <span className="text-slate-400 text-[10px]">CURRENT</span>
                    <div className="font-semibold text-sky-300">
                      {isEnergized ? `${feeder.currentAmps} A` : '0 A'}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                    <span className="text-slate-400 text-[10px]">VOLTAGE</span>
                    <div className="font-semibold text-slate-200">
                      {isEnergized ? `${feeder.actualVoltageKV} kV` : '0.00 kV'}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                    <span className="text-slate-400 text-[10px]">REACTIVE</span>
                    <div className="font-semibold text-slate-200">
                      {isEnergized ? `${feeder.reactiveMVAR} MVAR` : '0 MVAR'}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px]">POPULATION</span>
                      <div className="font-semibold text-slate-200">
                        {feeder.customersCount.toLocaleString()}
                      </div>
                    </div>
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>

                {/* Trip reason if tripped */}
                {isTripped && feeder.tripReason && (
                  <div className="mt-2.5 p-2 rounded bg-rose-950/80 border border-rose-800 text-[11px] text-rose-300">
                    <div className="font-bold uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" /> Relay Target Trip:
                    </div>
                    <div className="text-[10px] mt-0.5">{feeder.tripReason}</div>
                  </div>
                )}
              </div>

              {/* Breaker Control Switch */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isEnergized
                        ? 'bg-emerald-400'
                        : isTripped
                        ? 'bg-rose-500 animate-ping'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span>11kV CB {feeder.breakerState}</span>
                </div>

                <button
                  onClick={() => setConfirmingFeeder(feeder)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border transition flex items-center gap-1 ${
                    isEnergized
                      ? 'bg-rose-950 hover:bg-rose-900 border-rose-800 text-rose-300'
                      : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{isEnergized ? 'Trip' : 'Close / Reclose'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Interlocking Modal */}
      {confirmingFeeder && (
        <BreakerConfirmationModal
          breaker={{
            type: 'feeder',
            id: confirmingFeeder.id,
            name: `${confirmingFeeder.name} (11kV)`,
            currentState: confirmingFeeder.breakerState,
            voltage: confirmingFeeder.ratedVoltageKV,
            currentMW: confirmingFeeder.currentMW,
          }}
          onConfirm={() => {
            toggleFeederBreaker(confirmingFeeder.id);
            setConfirmingFeeder(null);
          }}
          onCancel={() => setConfirmingFeeder(null)}
        />
      )}
    </div>
  );
};
