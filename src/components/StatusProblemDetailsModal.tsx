import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  MessageSquare,
  Thermometer,
  BatteryCharging,
  Gauge,
  Phone,
  Power,
  Hospital,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { smsDispatcher } from '../utils/smsNotifier';

interface StatusProblemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusProblemDetailsModal: React.FC<StatusProblemDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    metrics,
    feeders,
    transformers,
    alerts,
    soundMuted,
    toggleSound,
    restoreAllFeeders,
    toggleFeederBreaker,
    acknowledgeAllAlerts,
    activeOperator,
  } = useDispatch();

  if (!isOpen) return null;

  const trippedFeeders = feeders.filter(
    (f) => f.breakerState !== 'CLOSED' || f.protectionTripped
  );

  const overloadedFeeders = feeders.filter(
    (f) => f.breakerState === 'CLOSED' && (f.currentMW / f.ratedCapacityMW) * 100 > f.overloadThresholdPct
  );

  const highTempTransformers = transformers.filter(
    (t) => t.windingTempC > 85 || t.oilTempC > 80
  );

  const freqDeviation = metrics.frequencyHz - 50.0;
  const isFreqProblem = Math.abs(freqDeviation) > 0.25;

  const totalProblemsCount =
    trippedFeeders.length + overloadedFeeders.length + highTempTransformers.length + (isFreqProblem ? 1 : 0);

  const isAlarmSounding = !soundMuted && metrics.criticalAlertCount > 0;

  const handleManualSmsAlert = () => {
    let summary = '';
    if (trippedFeeders.length > 0) {
      summary = `${trippedFeeders.map((f) => `${f.townName} (Tripped: ${f.tripReason || 'Protection'})`).join(', ')}. Total ${trippedFeeders.reduce((s, f) => s + f.currentMW, 0).toFixed(1)}MW dropped.`;
    } else {
      summary = `Substation status: ${metrics.gridStatus}. Load: ${metrics.totalFeederLoadMW}MW. All systems monitored.`;
    }

    smsDispatcher.sendSMS({
      title: `STATUS REPORT [${metrics.gridStatus}]`,
      body: summary,
      type: trippedFeeders.length > 0 ? 'OUTAGE' : 'WARNING',
    });

    const uri = smsDispatcher.getNativeSmsUri(
      `[FutureX 132/33kV EMS] Status: ${metrics.gridStatus}\n${summary}\nOperator: ${activeOperator.name}`
    );
    window.open(uri, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-mono">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                metrics.gridStatus === 'NORMAL'
                  ? 'bg-emerald-500'
                  : metrics.gridStatus === 'ALERT'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500 animate-ping'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  FutureX Substation Health & Problem Diagnostics
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                    metrics.gridStatus === 'NORMAL'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : metrics.gridStatus === 'ALERT'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                  }`}
                >
                  {metrics.gridStatus} STATUS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live assessment of 132/33kV transformation, 8 town feeders, alarm siren, and SMS gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Siren & SMS Status Banner */}
        <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ALARM SIREN:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                isAlarmSounding
                  ? 'bg-rose-900 text-rose-200 border border-rose-700 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {isAlarmSounding ? 'SIREN ACTIVE (SOUNDING)' : 'ALARM OFF (INACTIVE)'}
            </span>
            {isAlarmSounding && (
              <button
                onClick={acknowledgeAllAlerts}
                className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-bold text-[10px] uppercase transition"
              >
                Silence Siren
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">SMS GATEWAY:</span>
            <span className="text-sky-400 font-bold flex items-center gap-1">
              <Phone className="w-3 h-3 text-sky-400" /> +2348067254663
            </span>
          </div>
        </div>

        {/* Problems List or Nominal Bill of Health */}
        <div className="my-4 space-y-3">
          {totalProblemsCount > 0 ? (
            <div className="space-y-3">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Active Electrical Problems Detected ({totalProblemsCount})
              </div>

              {/* 1. Tripped Town Feeders */}
              {trippedFeeders.map((feeder) => (
                <div
                  key={feeder.id}
                  className="p-3 rounded-lg bg-rose-950/40 border border-rose-700/80 text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-300 text-sm">{feeder.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-900 text-rose-200 text-[10px] font-bold">
                        11kV OUTAGE
                      </span>
                      {feeder.isCriticalCustomer && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-900 text-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                          <Hospital className="w-2.5 h-2.5" /> PRIORITY TOWN
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[10px]">Town: {feeder.townName}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2 rounded border border-rose-900/60">
                    <div>
                      <span className="text-slate-400">Trip Reason / Target:</span>
                      <div className="text-rose-300 font-semibold">{feeder.tripReason || 'Overcurrent / Earth Fault'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Load & Customer Impact:</span>
                      <div className="text-slate-200">
                        {feeder.currentMW} MW lost • {feeder.customersCount.toLocaleString()} customers de-energized
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">
                      Recommendation: Inspect line patrol, verify trip targets before closing.
                    </span>
                    <button
                      onClick={() => toggleFeederBreaker(feeder.id)}
                      className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase flex items-center gap-1 transition shadow"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Close & Re-energize {feeder.townName}</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* 2. Overloaded Feeders */}
              {overloadedFeeders.map((feeder) => (
                <div
                  key={feeder.id}
                  className="p-3 rounded-lg bg-amber-950/40 border border-amber-700/80 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">{feeder.name} Overload Warning</span>
                    <span className="text-[10px] text-amber-400 font-bold">
                      {((feeder.currentMW / feeder.ratedCapacityMW) * 100).toFixed(1)}% Capacity
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Feeder load is {feeder.currentMW} MW (rated {feeder.ratedCapacityMW} MW). Current is {feeder.currentAmps} A.
                  </p>
                </div>
              ))}

              {/* 3. High Temperature Transformers */}
              {highTempTransformers.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg bg-amber-950/40 border border-amber-700/80 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">{tx.name} High Temperature</span>
                    <span className="text-[10px] text-rose-400 font-bold">
                      Winding: {tx.windingTempC}°C | Oil: {tx.oilTempC}°C
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Transformer temperature elevated. Verify radiator cooling fans are running and monitor 33kV loading.
                  </p>
                </div>
              ))}

              {/* 4. Frequency Issue */}
              {isFreqProblem && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-700/80 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">National Grid Frequency Excursion</span>
                    <span className="text-[10px] text-amber-400 font-bold">{metrics.frequencyHz.toFixed(2)} Hz</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Frequency deviates by {freqDeviation > 0 ? `+${freqDeviation.toFixed(2)}` : freqDeviation.toFixed(2)} Hz from 50.00 Hz nominal standard.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>All Substation Systems Nominal (0 Active Problems)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-300">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">132kV INCOMING VOLTAGE</span>
                  <span className="font-bold text-sky-400">{metrics.incomingVoltage132kV} kV (Healthy)</span>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">33kV & 11kV BUS VOLTAGES</span>
                  <span className="font-bold text-purple-400">
                    33.2 kV / {metrics.busVoltage11kVA} kV (Within ±5% Band)
                  </span>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">RECEIVING 11kV FEEDERS</span>
                  <span className="font-bold text-emerald-400">All 8 Towns Energized ({metrics.totalFeederLoadMW} MW)</span>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">GRID FREQUENCY</span>
                  <span className="font-bold text-emerald-400">{metrics.frequencyHz.toFixed(2)} Hz (Stable)</span>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">110V DC BATTERY BANK</span>
                  <span className="font-bold text-emerald-400">{metrics.stationBatteryVoltDC}V DC (Float Charging)</span>
                </div>

                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">SF6 GAS PRESSURE</span>
                  <span className="font-bold text-sky-400">6.2 bar (Safe Quenching Pressure)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-1">
                Substation operating in full compliance with National Grid Code. Audio siren is OFF.
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {totalProblemsCount > 0 ? (
              <button
                onClick={() => {
                  restoreAllFeeders();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore System & Turn Alarm Off</span>
              </button>
            ) : (
              <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Normal Operating Envelope
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSmsAlert}
              className="px-3 py-1.5 rounded bg-sky-700 hover:bg-sky-600 text-white font-semibold flex items-center gap-1.5 transition"
              title="Send text message report to +2348067254663"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send SMS to +2348067254663</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
