import React from 'react';
import {
  Zap,
  Activity,
  AlertTriangle,
  ShieldAlert,
  BatteryCharging,
  Gauge,
  TrendingUp,
  TrendingDown,
  Layers,
  Thermometer,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';

export const GridOverviewCard: React.FC<{ onNavigateToAlerts?: () => void }> = ({
  onNavigateToAlerts,
}) => {
  const { metrics, feeders, restoreAllFeeders, emergencyShedFeeder, openStatusModal } = useDispatch();

  const loadRatioPct =
    metrics.totalCapacityMW > 0 ? (metrics.totalFeederLoadMW / metrics.totalCapacityMW) * 100 : 0;
  const freqDiff = metrics.frequencyHz - 50.0;
  const isFreqWarning = Math.abs(freqDiff) > 0.15;
  const isFreqCritical = Math.abs(freqDiff) > 0.4;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
      {/* 1. Substation Power & Load Balance */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> FutureX Power
          </span>
          <span className="text-[10px] bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
            8 Feeders (11kV)
          </span>
        </div>

        <div className="my-3 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400">132kV INCOMING:</span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-100">
                {metrics.totalIncomingMW}{' '}
                <span className="text-xs font-normal text-slate-400">MW</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400">11kV DEMAND:</span>
              <div className="text-xl sm:text-2xl font-extrabold text-sky-400">
                {metrics.totalFeederLoadMW}{' '}
                <span className="text-xs font-normal text-slate-400">MW</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Station Capacity: {metrics.totalCapacityMW} MW</span>
              <span>Load: {loadRatioPct.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  loadRatioPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, loadRatioPct)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
          <span>TX Loss: ~0.6 MW</span>
          <span className="text-emerald-400 font-semibold">Available: +{(metrics.totalCapacityMW - metrics.totalFeederLoadMW).toFixed(1)} MW</span>
        </div>
      </div>

      {/* 2. Substation Bus Voltages */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" /> Busbar Voltages
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
            REGULATED
          </span>
        </div>

        <div className="my-2 space-y-1.5 text-xs">
          <div className="flex justify-between items-center p-1.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">132kV Incoming Line:</span>
            <span className="font-bold text-sky-400">{metrics.incomingVoltage132kV} kV</span>
          </div>
          <div className="flex justify-between items-center p-1.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">33kV Substation Bus:</span>
            <span className="font-bold text-amber-400">{metrics.busVoltage33kV} kV</span>
          </div>
          <div className="flex justify-between items-center p-1.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">11kV Busbars (A / B):</span>
            <span className="font-bold text-purple-400">
              {metrics.busVoltage11kVA} / {metrics.busVoltage11kVB} kV
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
          <span>Target: 11.00 kV ±5%</span>
          <span className="text-slate-300">PF: {metrics.powerFactor}</span>
        </div>
      </div>

      {/* 3. Grid Frequency & System Auxiliaries */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Frequency & DC Aux
          </span>
          <span className="text-[10px] text-slate-400">Nominal 50.00 Hz</span>
        </div>

        <div className="my-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`text-2xl font-black tracking-tight ${
                isFreqCritical
                  ? 'text-rose-400 animate-pulse'
                  : isFreqWarning
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {metrics.frequencyHz.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">Hz</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] mt-1 text-slate-400">
            <span>RoCoF: {metrics.rocofHzPerSec} Hz/s</span>
            <span>Amb: {metrics.ambientTempC}°C</span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="bg-slate-950 p-1 rounded border border-slate-800 text-slate-300">
              Battery: <strong className="text-emerald-400">{metrics.stationBatteryVoltDC}V DC</strong>
            </div>
            <div className="bg-slate-950 p-1 rounded border border-slate-800 text-slate-300">
              SF6: <strong className="text-sky-400">6.2 bar</strong>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
          <span>Tripping Coils: ARMED</span>
          <span className="text-emerald-400">Float Charging</span>
        </div>
      </div>

      {/* 4. Receiving 11kV Feeders Outage Summary */}
      <div
        className={`rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden border ${
          metrics.outageCount > 0
            ? 'bg-rose-950/40 border-rose-800/80'
            : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert
              className={`w-3.5 h-3.5 ${
                metrics.outageCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            />
            11kV Outages
          </span>
          {metrics.outageCount > 0 ? (
            <span className="text-[10px] font-bold bg-rose-900 text-rose-200 px-2 py-0.5 rounded border border-rose-700 animate-pulse">
              {metrics.outageCount} TRIPPED
            </span>
          ) : (
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              ALL 8 HEALTHY
            </span>
          )}
        </div>

        <div className="my-2 space-y-2">
          {metrics.outageCount > 0 ? (
            <div className="text-xs text-rose-300 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Feeder tripped on protection!
              </p>
              <p className="text-[10px] text-slate-300">
                Automated push notification sent with haptic pulse to phones.
              </p>
              <button
                onClick={restoreAllFeeders}
                className="w-full mt-2 py-1 px-2 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium uppercase tracking-wide transition"
              >
                Restore All 8 Feeders
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-300 space-y-1">
              <p className="text-emerald-400 font-semibold">8 Town Feeders Energized</p>
              <p className="text-[10px] text-slate-400">
                Hadejia, Kafin Hausa, Auyo, Malam Madori, Guri, Kirikasamma, Kaugama, Birniwa.
              </p>
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => emergencyShedFeeder('FDR-11K-01', 'UFLS Stage 1 Shed')}
                  className="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-[10px] text-slate-300 hover:text-rose-200 transition"
                  title="Shed Hadejia 11kV Feeder"
                >
                  Shed Hadejia
                </button>
                <button
                  onClick={() => emergencyShedFeeder('FDR-11K-02', 'UFLS Stage 2 Shed')}
                  className="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-[10px] text-slate-300 hover:text-rose-200 transition"
                  title="Shed Kafin Hausa 11kV Feeder"
                >
                  Shed K/Hausa
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={openStatusModal}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer text-[10px]"
          >
            Diagnostics ({metrics.outageCount} Outages)
          </button>
          {onNavigateToAlerts && (
            <button
              onClick={onNavigateToAlerts}
              className="text-sky-400 hover:text-sky-300 underline text-[11px]"
            >
              Alarm Log ({metrics.criticalAlertCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
