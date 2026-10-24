import React, { useState } from 'react';
import { useDispatch } from '../context/DispatchContext';
import { BreakerState } from '../types/dispatch';
import { BreakerConfirmationModal } from './BreakerConfirmationModal';
import { Zap, Layers } from 'lucide-react';

export const SingleLineDiagram: React.FC = () => {
  const {
    feeders,
    transformers,
    toggleFeederBreaker,
    adjustTransformerTap,
    metrics,
  } = useDispatch();

  const [selectedBreaker, setSelectedBreaker] = useState<{
    type: 'unit' | 'feeder';
    id: string;
    name: string;
    currentState: BreakerState;
    voltage: number;
    currentMW: number;
  } | null>(null);

  const handleBreakerClick = (
    id: string,
    name: string,
    currentState: BreakerState,
    voltage: number,
    currentMW: number
  ) => {
    setSelectedBreaker({
      type: 'feeder',
      id,
      name,
      currentState,
      voltage,
      currentMW,
    });
  };

  const handleConfirmBreaker = () => {
    if (selectedBreaker) {
      toggleFeederBreaker(selectedBreaker.id);
      setSelectedBreaker(null);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              FutureX 132/33/11kV Substation Single Line Diagram (SLD)
            </h2>
            <span className="text-[10px] text-slate-400">
              132kV Incoming $\rightarrow$ 132/33kV Power Transformers $\rightarrow$ 33/11kV Injection $\rightarrow$ 8 Receiving 11kV Feeders
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300"></span>
            <span>Closed (Energized)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-300 animate-pulse"></span>
            <span>Tripped / Outage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-sky-400"></span>
            <span>132kV Bus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-amber-400"></span>
            <span>33kV Bus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-purple-400"></span>
            <span>11kV Busbars</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative overflow-x-auto overflow-y-hidden py-4 scrollbar-thin">
        <div className="min-w-[960px]">
          <svg viewBox="0 0 1020 540" className="w-full h-auto select-none font-mono">
            <defs>
              <pattern id="futurexGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="bus132kVFx" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="bus33kVFx" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="bus11kVFx" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            {/* Background */}
            <rect width="1020" height="540" fill="#070c18" />
            <rect width="1020" height="540" fill="url(#futurexGrid)" opacity="0.5" />

            {/* ---------------- 1. TOP: INCOMING 132kV GRID TRANSMISSION LINE ---------------- */}
            <line x1={510} y1={20} x2={510} y2={65} stroke="#38bdf8" strokeWidth="3" />
            <polygon points="505,20 515,20 510,10" fill="#38bdf8" />
            <text x={510} y={35} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">
              132kV INCOMING NATIONAL GRID TIE [{metrics.incomingVoltage132kV} kV]
            </text>

            {/* 132kV Incomer Breaker CB-132-IN */}
            <rect x={498} y={65} width={24} height={18} rx={3} fill="#10b981" stroke="#6ee7b7" strokeWidth="2" />
            <text x={510} y={78} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
              CL
            </text>
            <line x1={510} y1={83} x2={510} y2={110} stroke="#38bdf8" strokeWidth="3" />

            {/* ---------------- 2. 132kV MAIN SUBSTATION BUSBAR ---------------- */}
            <rect x={120} y={110} width={780} height={8} rx={2} fill="url(#bus132kVFx)" />
            <text x={130} y={103} fill="#38bdf8" fontSize="11" fontWeight="bold">
              FUTUREX 132 kV MAIN BUSBAR [{metrics.incomingVoltage132kV} kV]
            </text>

            {/* ---------------- 3. POWER TRANSFORMERS T1A & T2A (132/33kV 60MVA) ---------------- */}
            {/* T1A Link */}
            <line x1={320} y1={118} x2={320} y2={150} stroke="#38bdf8" strokeWidth="2.5" />
            <g className="cursor-pointer">
              <circle cx={320} cy={162} r={12} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx={320} cy={176} r={12} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
              <text x={340} y={166} fill="#fbbf24" fontSize="10" fontWeight="bold">
                T1A (60 MVA)
              </text>
              <text x={340} y={178} fill="#94a3b8" fontSize="9">
                132/33kV • Tap {transformers[0]?.tapPosition} • {transformers[0]?.loadPct}%
              </text>
            </g>
            <line x1={320} y1={188} x2={320} y2={220} stroke="#fbbf24" strokeWidth="2.5" />

            {/* T2A Link */}
            <line x1={700} y1={118} x2={700} y2={150} stroke="#38bdf8" strokeWidth="2.5" />
            <g className="cursor-pointer">
              <circle cx={700} cy={162} r={12} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx={700} cy={176} r={12} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
              <text x={720} y={166} fill="#fbbf24" fontSize="10" fontWeight="bold">
                T2A (60 MVA)
              </text>
              <text x={720} y={178} fill="#94a3b8" fontSize="9">
                132/33kV • Tap {transformers[1]?.tapPosition} • {transformers[1]?.loadPct}%
              </text>
            </g>
            <line x1={700} y1={188} x2={700} y2={220} stroke="#fbbf24" strokeWidth="2.5" />

            {/* ---------------- 4. 33kV INTERMEDIATE BUSBAR ---------------- */}
            <rect x={180} y={220} width={660} height={7} rx={2} fill="url(#bus33kVFx)" />
            <text x={190} y={213} fill="#fbbf24" fontSize="11" fontWeight="bold">
              33 kV INTERMEDIATE BUSBAR [{metrics.busVoltage33kV} kV]
            </text>

            {/* ---------------- 5. INJECTION TRANSFORMERS TR-1 & TR-2 (33/11kV 15MVA) ---------------- */}
            {/* TR-1 (Supplies 11kV Bus A) */}
            <line x1={320} y1={227} x2={320} y2={255} stroke="#fbbf24" strokeWidth="2.5" />
            <g>
              <circle cx={320} cy={265} r={10} fill="none" stroke="#fbbf24" strokeWidth="2" />
              <circle cx={320} cy={277} r={10} fill="none" stroke="#c084fc" strokeWidth="2" />
              <text x={340} y={270} fill="#c084fc" fontSize="9" fontWeight="bold">
                TR-1 (15MVA) 33/11kV
              </text>
            </g>
            <line x1={320} y1={287} x2={320} y2={320} stroke="#c084fc" strokeWidth="2.5" />

            {/* TR-2 (Supplies 11kV Bus B) */}
            <line x1={700} y1={227} x2={700} y2={255} stroke="#fbbf24" strokeWidth="2.5" />
            <g>
              <circle cx={700} cy={265} r={10} fill="none" stroke="#fbbf24" strokeWidth="2" />
              <circle cx={700} cy={277} r={10} fill="none" stroke="#c084fc" strokeWidth="2" />
              <text x={720} y={270} fill="#c084fc" fontSize="9" fontWeight="bold">
                TR-2 (15MVA) 33/11kV
              </text>
            </g>
            <line x1={700} y1={287} x2={700} y2={320} stroke="#c084fc" strokeWidth="2.5" />

            {/* ---------------- 6. 11kV BUSBAR A & 11kV BUSBAR B WITH BUS COUPLER ---------------- */}
            {/* Bus A (Feeders 1 to 4) */}
            <rect x={40} y={320} width={430} height={7} rx={2} fill="url(#bus11kVFx)" />
            <text x={50} y={313} fill="#c084fc" fontSize="10" fontWeight="bold">
              11kV BUSBAR A [{metrics.busVoltage11kVA} kV]
            </text>

            {/* Bus Coupler Breaker between Bus A and Bus B */}
            <line x1={470} y1={323.5} x2={498} y2={323.5} stroke="#c084fc" strokeWidth="2.5" />
            <rect x={498} y={314} width={24} height={19} rx={3} fill="#10b981" stroke="#6ee7b7" strokeWidth="1.5" />
            <text x={510} y={327} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
              TIE
            </text>
            <line x1={522} y1={323.5} x2={550} y2={323.5} stroke="#c084fc" strokeWidth="2.5" />

            {/* Bus B (Feeders 5 to 8) */}
            <rect x={550} y={320} width={430} height={7} rx={2} fill="url(#bus11kVFx)" />
            <text x={560} y={313} fill="#c084fc" fontSize="10" fontWeight="bold">
              11kV BUSBAR B [{metrics.busVoltage11kVB} kV]
            </text>

            {/* ---------------- 7. THE 8 RECEIVING 11kV TOWN FEEDERS ---------------- */}
            {feeders.map((feeder, idx) => {
              // Position across the 8 feeder columns
              // Feeders 0-3 on Bus A (x=80, 180, 280, 380)
              // Feeders 4-7 on Bus B (x=620, 720, 820, 920)
              const xPos = idx < 4 ? 80 + idx * 105 : 620 + (idx - 4) * 105;
              const startY = 327;
              const breakerY = 365;
              const endY = 430;

              const isClosed = feeder.breakerState === 'CLOSED';
              const isTripped = feeder.breakerState === 'TRIPPED';

              return (
                <g key={feeder.id} className="cursor-pointer group">
                  {/* Bus to Breaker line */}
                  <line
                    x1={xPos}
                    y1={startY}
                    x2={xPos}
                    y2={breakerY}
                    stroke={isClosed ? '#c084fc' : '#475569'}
                    strokeWidth="2.5"
                  />

                  {/* Circuit Breaker Box */}
                  <g
                    onClick={() =>
                      handleBreakerClick(feeder.id, feeder.name, feeder.breakerState, feeder.ratedVoltageKV, feeder.currentMW)
                    }
                    className="hover:scale-110 transition-transform origin-center"
                  >
                    <rect
                      x={xPos - 13}
                      y={breakerY}
                      width={26}
                      height={20}
                      rx={3}
                      fill={isTripped ? '#e11d48' : isClosed ? '#10b981' : '#334155'}
                      stroke={isTripped ? '#fca5a5' : isClosed ? '#6ee7b7' : '#94a3b8'}
                      strokeWidth="2"
                    />
                    <text
                      x={xPos}
                      y={breakerY + 14}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {isClosed ? 'CL' : 'TR'}
                    </text>
                  </g>

                  {/* Outgoing Feeder line */}
                  <line
                    x1={xPos}
                    y1={breakerY + 20}
                    x2={xPos}
                    y2={endY}
                    stroke={isClosed ? '#c084fc' : '#e11d48'}
                    strokeWidth="2"
                    strokeDasharray={isClosed ? 'none' : '4 3'}
                  />

                  {/* Feeder Terminal Arrow */}
                  <polygon
                    points={`${xPos - 5},${endY} ${xPos + 5},${endY} ${xPos},${endY + 8}`}
                    fill={isClosed ? '#c084fc' : '#e11d48'}
                  />

                  {/* Town Name & Telemetry */}
                  <text
                    x={xPos}
                    y={endY + 24}
                    textAnchor="middle"
                    fill={isClosed ? '#f8fafc' : '#f87171'}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {feeder.townName}
                  </text>
                  <text
                    x={xPos}
                    y={endY + 38}
                    textAnchor="middle"
                    fill={isClosed ? '#38bdf8' : '#94a3b8'}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {isClosed ? `${feeder.currentMW} MW` : 'OUTAGE'}
                  </text>
                  <text
                    x={xPos}
                    y={endY + 50}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                  >
                    {isClosed ? `${feeder.currentAmps} A` : '0 A'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Safety Interlocking Modal */}
      {selectedBreaker && (
        <BreakerConfirmationModal
          breaker={{
            type: 'feeder',
            id: selectedBreaker.id,
            name: `${selectedBreaker.name} (11kV)`,
            currentState: selectedBreaker.currentState,
            voltage: selectedBreaker.voltage,
            currentMW: selectedBreaker.currentMW,
          }}
          onConfirm={handleConfirmBreaker}
          onCancel={() => setSelectedBreaker(null)}
        />
      )}
    </div>
  );
};
