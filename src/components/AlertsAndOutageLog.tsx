import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Radio,
  Smartphone,
  Monitor,
  Volume2,
  ExternalLink,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { AlertSeverity, DispatchAlert } from '../types/dispatch';
import { smsDispatcher } from '../utils/smsNotifier';

export const AlertsAndOutageLog: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    clearResolvedAlerts,
    notificationPermission,
    requestNotificationPermission,
    sendTestNotification,
  } = useDispatch();

  const [filter, setFilter] = useState<'ALL' | 'UNACK' | 'CRITICAL'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'UNACK') return !a.acknowledged;
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    return true;
  });

  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col font-mono">
      {/* Title & Diagnostic Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Real-Time Push Alerts & Outage Event Stream
          </h2>
          {unackCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold animate-bounce">
              {unackCount} UNACKNOWLEDGED
            </span>
          )}
        </div>

        {/* Global Alert Action Buttons */}
        <div className="flex items-center gap-2">
          {unackCount > 0 && (
            <button
              onClick={acknowledgeAllAlerts}
              className="px-3 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Acknowledge All</span>
            </button>
          )}

          {alerts.some((a) => a.acknowledged) && (
            <button
              onClick={clearResolvedAlerts}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-slate-400" />
              <span>Clear Acked</span>
            </button>
          )}
        </div>
      </div>

      {/* Push Notification Setup & Diagnostic Banner */}
      <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-sky-950/60 border border-sky-800 text-sky-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <span>AUTOMATED PUSH DISPATCH ENGINE</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {notificationPermission === 'granted' ? 'CONNECTED / ARMED' : 'NEEDS PERMISSION'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Receives instant background push alerts & vibration on Android phones and PC browsers for line outages, generator trips, and under-frequency events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition animate-pulse"
            >
              Enable Push Alerts
            </button>
          ) : (
            <button
              onClick={sendTestNotification}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Test Push on This Device</span>
            </button>
          )}
        </div>
      </div>

      {/* Automated SMS Text Message Dispatch to +2348067254663 */}
      <div className="mt-2.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <span>AUTOMATED SMS TEXT ALERT GATEWAY</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Outages, feeder trips, and restoration notices automatically dispatched as SMS to{' '}
              <strong className="text-sky-400">+2348067254663</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              smsDispatcher.sendSMS({
                title: 'TEST DISPATCH SMS',
                body: 'FutureX 132/33kV Substation SMS text message notification link test.',
                type: 'TEST',
              });
              const uri = smsDispatcher.getNativeSmsUri(
                '[FutureX 132/33kV EMS] Test SMS alert successfully received on operator handset.'
              );
              window.open(uri, '_blank');
            }}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5"
            title="Dispatch a test text message to +2348067254663"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test SMS to +2348067254663</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mt-4 pb-2 border-b border-slate-800/80 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded transition ${
            filter === 'ALL'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          All Events ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('UNACK')}
          className={`px-3 py-1 rounded transition ${
            filter === 'UNACK'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          Unacknowledged ({unackCount})
        </button>
        <button
          onClick={() => setFilter('CRITICAL')}
          className={`px-3 py-1 rounded transition ${
            filter === 'CRITICAL'
              ? 'bg-sky-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          Critical Outages ({alerts.filter((a) => a.severity === 'CRITICAL').length})
        </button>
      </div>

      {/* Alerts Stream List */}
      <div className="mt-3 space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">All Systems Nominal</p>
            <p className="text-[11px] text-slate-500 mt-1">
              No active or unacknowledged alarms. Use "Drills & Faults" in the header to simulate an outage.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border text-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCritical
                    ? alert.acknowledged
                      ? 'bg-rose-950/20 border-rose-900/60'
                      : 'bg-rose-950/60 border-rose-600 shadow-md animate-in fade-in duration-200'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-800/60'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {isCritical ? (
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          alert.acknowledged ? 'text-rose-400' : 'text-rose-500 animate-ping'
                        }`}
                      />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                          isCritical
                            ? 'bg-rose-900 text-rose-200 border-rose-700'
                            : 'bg-amber-900 text-amber-200 border-amber-700'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-bold text-slate-100">{alert.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        [{alert.timestamp}]
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                      <strong className="text-slate-200">{alert.equipmentName}:</strong>{' '}
                      {alert.details}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span>ID: {alert.id}</span>
                      <span>•</span>
                      <span>Target: {alert.equipmentId}</span>
                      <span>•</span>
                      <span className={alert.acknowledged ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                        {alert.acknowledged ? 'ACKNOWLEDGED' : 'ACTION REQUIRED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Acknowledge Button */}
                <div className="sm:self-center shrink-0">
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition shadow"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 px-2 py-1 rounded bg-slate-800/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ACK</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
