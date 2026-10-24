import React from 'react';
import {
  Layers,
  Thermometer,
  Sliders,
  Wind,
  Gauge,
  BatteryCharging,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';

export const SubstationTransformersPanel: React.FC = () => {
  const {
    transformers,
    adjustTransformerTap,
    toggleCoolingFans,
    metrics,
  } = useDispatch();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            FutureX Substation Power & Injection Transformers (132/33kV & 33/11kV)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Total Transformation: 2 x 60MVA (132/33kV) + 2 x 15MVA (33/11kV)
        </span>
      </div>

      {/* Auxiliary DC and SF6 banner */}
      <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] block">132kV SF6 GAS PRESSURE</span>
          <div className="text-base font-bold text-sky-400 flex items-center gap-1.5 mt-0.5">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span>6.2 bar (Normal)</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">110V DC BATTERY BANK</span>
          <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span>{metrics.stationBatteryVoltDC} V DC (Float)</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">AMBIENT SHIFT TEMP</span>
          <div className="text-base font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>{metrics.ambientTempC} °C</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block">BUCHHOLZ & SURGE RELAYS</span>
          <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ARMED & HEALTHY</span>
          </div>
        </div>
      </div>

      {/* Transformers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {transformers.map((tx) => {
          const isHighTemp = tx.windingTempC > 85;
          const isCriticalTemp = tx.windingTempC > 95;

          return (
            <div
              key={tx.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-colors shadow-sm relative ${
                isCriticalTemp
                  ? 'bg-rose-950/40 border-rose-700'
                  : isHighTemp
                  ? 'bg-amber-950/40 border-amber-700'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">{tx.name}</h3>
                    <span className="text-[10px] text-slate-400">{tx.designation}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                      isCriticalTemp
                        ? 'bg-rose-900 text-rose-200 border-rose-700 animate-pulse'
                        : isHighTemp
                        ? 'bg-amber-900 text-amber-200 border-amber-700'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                {/* Rating & Load */}
                <div className="mt-3 p-2.5 rounded bg-slate-900/90 border border-slate-800">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400">LOADING:</span>
                    <span className="text-xl font-extrabold text-slate-100">
                      {tx.activeMW}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        MW ({tx.loadPct}%)
                      </span>
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        tx.loadPct > 90 ? 'bg-rose-500' : tx.loadPct > 75 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${Math.min(100, tx.loadPct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Voltage: {tx.highKV} / {tx.lowKV} kV</span>
                    <span>Rating: {tx.ratingMVA} MVA</span>
                  </div>
                </div>

                {/* Temperatures Display */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400" /> OIL TEMP
                    </span>
                    <span
                      className={`font-semibold ${
                        tx.oilTempC > 80 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {tx.oilTempC}°C
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-rose-400" /> WINDING
                    </span>
                    <span
                      className={`font-semibold ${
                        isCriticalTemp
                          ? 'text-rose-400 animate-pulse'
                          : isHighTemp
                          ? 'text-amber-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {tx.windingTempC}°C
                    </span>
                  </div>
                </div>

                {/* Cooling Fans Status & Toggle */}
                <div className="mt-3 flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind className={`w-3.5 h-3.5 ${tx.coolingFansRunning ? 'text-sky-400 animate-spin' : 'text-slate-500'}`} />
                    COOLING FANS
                  </span>
                  <button
                    onClick={() => toggleCoolingFans(tx.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                      tx.coolingFansRunning
                        ? 'bg-sky-950 text-sky-400 border border-sky-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tx.coolingFansRunning ? 'RUNNING' : 'STANDBY'}
                  </button>
                </div>
              </div>

              {/* On-Load Tap Changer (OLTC) Control */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center text-[11px] mb-2">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-400" /> OLTC TAP CHANGER:
                  </span>
                  <span className="font-bold text-amber-300">
                    TAP {tx.tapPosition} / {tx.tapMax}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustTransformerTap(tx.id, -1)}
                    disabled={tx.tapPosition <= tx.tapMin}
                    className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                    title="Lower Tap (-1.25% secondary voltage)"
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>Lower Tap</span>
                  </button>
                  <button
                    onClick={() => adjustTransformerTap(tx.id, 1)}
                    disabled={tx.tapPosition >= tx.tapMax}
                    className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                    title="Raise Tap (+1.25% secondary voltage)"
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>Raise Tap</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
