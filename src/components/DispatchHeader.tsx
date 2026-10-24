import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Sparkles,
  User,
  Users,
  Phone,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { PWAInstallButton } from './PWAInstallButton';
import { OperatorModal } from './OperatorModal';

interface DispatchHeaderProps {
  onOpenSimulation: () => void;
  onOpenLogModal: () => void;
}

export const DispatchHeader: React.FC<DispatchHeaderProps> = ({
  onOpenSimulation,
}) => {
  const {
    metrics,
    soundMuted,
    toggleSound,
    notificationPermission,
    requestNotificationPermission,
    sendTestNotification,
    acknowledgeAllAlerts,
    activeOperator,
    openStatusModal,
  } = useDispatch();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentUtc, setCurrentUtc] = useState<string>('');
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour12: false }));
      setCurrentUtc(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  const hasUnackCritical = metrics.criticalAlertCount > 0;

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 select-none sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      {/* Critical Alert Bar if active emergency or outages */}
      {metrics.gridStatus === 'EMERGENCY' && (
        <div className="bg-rose-950 border-b border-rose-800 px-3 py-1 flex items-center justify-between text-xs text-rose-200 animate-pulse">
          <div className="flex items-center gap-2 font-mono font-bold tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>CRITICAL OUTAGE DETECTED — 11kV RECEIVING FEEDER TRIP</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openStatusModal}
              className="px-2.5 py-0.5 rounded bg-rose-900 hover:bg-rose-850 border border-rose-700 text-white font-mono text-[11px] font-semibold uppercase tracking-wider transition"
            >
              View Problem Details
            </button>
            <button
              onClick={acknowledgeAllAlerts}
              className="px-2.5 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-white font-mono text-[11px] font-semibold uppercase tracking-wider transition"
            >
              Silence Siren
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Station Callout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-800/80 text-sky-400 shadow-inner">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-slate-100 uppercase">
                FUTURE<span className="text-sky-400">X</span> <span className="text-amber-400">132/33kV</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-slate-800 text-slate-300 rounded border border-slate-700">
                132/33/11kV SUBSTATION
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>8 RECEIVING 11kV TOWN FEEDERS</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE SCADA
              </span>
            </p>
          </div>
        </div>

        {/* Center: Operator Profile Pill (Click to Switch or Add User) */}
        <div
          onClick={() => setIsOperatorModalOpen(true)}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-600 rounded-lg px-3 py-1.5 shadow-sm transition flex items-center gap-2.5"
          title="Click to switch duty operator or register a new operator profile"
        >
          <div
            className={`w-7 h-7 rounded-full ${
              activeOperator.avatarColor || 'bg-sky-600'
            } flex items-center justify-center text-white font-bold text-xs uppercase shadow`}
          >
            {activeOperator.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-100">
              <span>{activeOperator.name}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold uppercase">
                {activeOperator.id}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <span>{activeOperator.role}</span>
              <span className="text-sky-400 underline decoration-dotted ml-1">Switch</span>
            </div>
          </div>
        </div>

        {/* Frequency & Substation Status Quick HUD */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 shadow-sm">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 justify-end">
              <Activity className="w-3 h-3 text-sky-400" />
              <span>GRID FREQ</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-base sm:text-lg font-mono font-bold tracking-tight ${
                  Math.abs(metrics.frequencyHz - 50.0) > 0.3
                    ? 'text-rose-400 animate-pulse'
                    : Math.abs(metrics.frequencyHz - 50.0) > 0.15
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {metrics.frequencyHz.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400">Hz</span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-800" />

          <div>
            <div className="text-[10px] font-mono text-slate-400">11kV LOAD</div>
            <span className="font-mono text-sm font-bold text-slate-100">
              {metrics.totalFeederLoadMW} <span className="text-[10px] text-slate-400 font-normal">MW</span>
            </span>
          </div>

          <div className="h-7 w-[1px] bg-slate-800" />

          <div>
            <div className="text-[10px] font-mono text-slate-400">STATUS</div>
            <button
              onClick={openStatusModal}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border transition cursor-pointer hover:brightness-125 ${
                metrics.gridStatus === 'NORMAL'
                  ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-400'
                  : metrics.gridStatus === 'ALERT'
                  ? 'bg-amber-950/70 border-amber-700/80 text-amber-300'
                  : 'bg-rose-950/80 border-rose-700 text-rose-300 animate-pulse'
              }`}
              title="Click to view detailed problems, tripped lines, and alarms"
            >
              <span>{metrics.gridStatus}</span>
              <span className="text-[9px] underline">Details</span>
            </button>
          </div>
        </div>

        {/* Right: SMS target, Audio siren, Push Alert Diagnostic, Simulation Drills, PWA Install */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* SMS Status to +2348067254663 */}
          <button
            onClick={openStatusModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-sky-600 text-slate-300 hover:text-white text-xs font-mono transition"
            title="Automated SMS Text Alerts routed to +2348067254663 (Click for problems & SMS outbox)"
          >
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] text-slate-400">SMS:</span>
            <span className="text-[11px] font-bold text-sky-400">+2348067254663</span>
          </button>

          {/* Audio siren toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded border text-xs font-mono transition flex items-center gap-1.5 ${
              soundMuted
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                : hasUnackCritical
                ? 'bg-rose-900/80 border-rose-600 text-white animate-bounce'
                : 'bg-slate-900 border-sky-800/60 text-sky-400 hover:bg-slate-800'
            }`}
            title={soundMuted ? 'Alarm Siren Muted (Click to Unmute)' : 'Alarm Siren Active'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden md:inline text-[11px]">{soundMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>

          {/* Push notification setup & test */}
          {notificationPermission !== 'granted' ? (
            <button
              onClick={requestNotificationPermission}
              className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium text-xs flex items-center gap-1.5 shadow-sm transition animate-pulse"
              title="Enable browser & Android push notifications for critical alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enable Push</span>
            </button>
          ) : (
            <button
              onClick={sendTestNotification}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
              title="Send a live test push notification to this device"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline text-[11px] font-mono">Test Push</span>
            </button>
          )}

          {/* Simulation Drills Button */}
          <button
            onClick={onOpenSimulation}
            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
            title="Inject faults and test outage scenarios for 11kV town feeders"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Drills</span>
          </button>

          {/* In-App PWA Install */}
          <PWAInstallButton />

          {/* Clock for PC and Tablets */}
          <div className="hidden xl:flex flex-col text-right pl-2 border-l border-slate-800">
            <span className="font-mono text-xs font-semibold text-slate-200">{currentTime}</span>
            <span className="font-mono text-[10px] text-slate-400">{currentUtc}</span>
          </div>
        </div>
      </div>

      {/* Operator Modal for Profile Switch / Registration */}
      <OperatorModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
      />
    </header>
  );
};
