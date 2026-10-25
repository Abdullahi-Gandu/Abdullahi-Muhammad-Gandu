import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Calendar,
  Clock,
  User,
  Shield,
  Zap,
  Activity,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  Phone,
  Copy,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { OperatorProfile, ElectricalHourlyLog, DispatchLogEntry } from '../types/dispatch';

export const IndependentOperatorReport: React.FC = () => {
  const {
    operators,
    activeOperator,
    currentSession,
    hourlyLogs,
    logs,
    feeders,
    transformers,
    metrics,
    smsRecipient,
    saveElectricalHourlyLog,
  } = useDispatch();

  // State: which operator to report on (defaults to active operator)
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(activeOperator.id);
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('TODAY');
  const [handoverNotes, setHandoverNotes] = useState<string>(
    'Normal shift watch. All 8 11kV town receiving feeders monitored. Transformer oil and winding temperatures within permissible thermal limits. Battery float charge nominal. Critical automated SMS dispatch active to ' + smsRecipient + '.'
  );
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  // Target operator profile
  const targetOperator = useMemo(() => {
    return operators.find((op) => op.id === selectedOperatorId) || activeOperator;
  }, [operators, selectedOperatorId, activeOperator]);

  // Filter electrical hourly logs by this operator
  const operatorHourlyLogs = useMemo(() => {
    return hourlyLogs.filter((log) => {
      const matchOp = log.operatorId === targetOperator.id || log.operatorName === targetOperator.name;
      if (!matchOp) return false;
      if (shiftFilter !== 'ALL' && !log.shift.toLowerCase().includes(shiftFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [hourlyLogs, targetOperator, shiftFilter]);

  // Filter dispatch log entries by this operator
  const operatorLogs = useMemo(() => {
    return logs.filter((l) => {
      return l.operatorId === targetOperator.id || l.operatorName === targetOperator.name;
    });
  }, [logs, targetOperator]);

  // Compute metrics for this operator's independent report
  const breakerOperations = useMemo(() => {
    return operatorLogs.filter((l) => l.category === 'PARAM_CHANGE' && (l.action.includes('Breaker') || l.action.includes('Feeder')));
  }, [operatorLogs]);

  const alarmsAcknowledged = useMemo(() => {
    return operatorLogs.filter((l) => l.category === 'ALARM_ACK');
  }, [operatorLogs]);

  const outagesHandled = useMemo(() => {
    return operatorLogs.filter((l) => l.category === 'OUTAGE');
  }, [operatorLogs]);

  // Calculate average frequency and peak MW from operator's recorded logs
  const stats = useMemo(() => {
    if (operatorHourlyLogs.length === 0) {
      return {
        avgFreq: metrics.frequencyHz,
        peakLoad: metrics.totalFeederLoadMW,
        totalLogs: 0,
      };
    }
    const sumFreq = operatorHourlyLogs.reduce((acc, l) => acc + l.frequencyHz, 0);
    const maxLoad = Math.max(...operatorHourlyLogs.map((l) => l.totalLoadMW));
    return {
      avgFreq: Number((sumFreq / operatorHourlyLogs.length).toFixed(2)),
      peakLoad: maxLoad,
      totalLogs: operatorHourlyLogs.length,
    };
  }, [operatorHourlyLogs, metrics]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export CSV function
  const handleExportCSV = () => {
    const reportDate = new Date().toISOString().slice(0, 10);
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Header metadata
    csvContent += `FUTUREX 132/33kV SUBSTATION - INDEPENDENT OPERATOR REPORT\r\n`;
    csvContent += `Operator Name,${targetOperator.name}\r\n`;
    csvContent += `Operator ID,${targetOperator.id}\r\n`;
    csvContent += `Role,${targetOperator.role}\r\n`;
    csvContent += `Shift,${targetOperator.shift}\r\n`;
    csvContent += `Badge Number,${targetOperator.badgeNumber || 'TCN-FX-REG'}\r\n`;
    csvContent += `Report Generated Date,${new Date().toLocaleString()}\r\n`;
    csvContent += `SMS Dispatch Gateway,${smsRecipient}\r\n\r\n`;

    // Hourly Parameter Logs Section
    csvContent += `HOURLY ELECTRICAL PARAMETER LOGS RECORDED BY OPERATOR\r\n`;
    csvContent += `Date,Time,132kV Bus (kV),33kV Bus (kV),11kV Bus A (kV),11kV Bus B (kV),Frequency (Hz),Total Load (MW),Ambient Temp (C),T1 Winding (C),T2 Winding (C),Battery (V DC),SF6 (bar),Remarks\r\n`;

    operatorHourlyLogs.forEach((l) => {
      csvContent += `"${l.date}","${l.timestamp}",${l.voltage132kV},${l.voltage33kV},${l.voltage11kVBusA},${l.voltage11kVBusB},${l.frequencyHz},${l.totalLoadMW},${l.ambientTempC},${l.t1WindingTempC},${l.t2WindingTempC},${l.stationBatteryVoltDC},${l.sf6GasPressureBar},"${l.remarks.replace(/"/g, '""')}"\r\n`;
    });

    csvContent += `\r\n`;
    // Switching & Audit Trail Section
    csvContent += `DISPATCH & SWITCHING ACTIONS AUDIT TRAIL BY OPERATOR\r\n`;
    csvContent += `Timestamp,Category,Equipment,Action,Details\r\n`;

    operatorLogs.forEach((l) => {
      csvContent += `"${l.timestamp}","${l.category}","${l.equipment}","${l.action}","${l.details.replace(/"/g, '""')}"\r\n`;
    });

    csvContent += `\r\n`;
    csvContent += `Handover Remarks,"${handoverNotes.replace(/"/g, '""')}"\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FutureX_Report_${targetOperator.id}_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy plain text summary for dispatch WhatsApp / SMS
  const handleCopySummary = () => {
    const summary = `*FUTUREX 132/33kV SUBSTATION — SHIFT DISPATCH REPORT*
Operator: ${targetOperator.name} (${targetOperator.id})
Role: ${targetOperator.role}
Shift: ${targetOperator.shift}
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

*SYSTEM PARAMETERS:*
• 132kV Grid Tie: ${metrics.incomingVoltage132kV} kV
• 33kV Bus: ${metrics.busVoltage33kV} kV | 11kV Bus: ${metrics.busVoltage11kVA} kV
• System Freq: ${metrics.frequencyHz} Hz
• Total Feeder Load: ${metrics.totalFeederLoadMW} MW
• 11kV Receiving Feeders: 8 Units (Hadejia, Kafin Hausa, Auyo, Malam Madori, Guri, Kirikasamma, Kaugama, Birniwa)
• Active Outages: ${metrics.outageCount} Feeders

*OPERATOR AUDIT:*
• Parameter Logsheets Filed: ${operatorHourlyLogs.length}
• Breaker Operations Executed: ${breakerOperations.length}
• Alarms Handled: ${alarmsAcknowledged.length}

*HANDOVER REMARKS:*
${handoverNotes}`;

    navigator.clipboard.writeText(summary);
    setCopyFeedback('Dispatch summary copied to clipboard!');
    setTimeout(() => setCopyFeedback(''), 3000);
  };

  // Helper to record a new log under this operator immediately if they have none
  const handleRecordSnapshotLog = () => {
    saveElectricalHourlyLog({
      operatorId: targetOperator.id,
      operatorName: targetOperator.name,
      shift: targetOperator.shift,
      voltage132kV: metrics.incomingVoltage132kV,
      voltage33kV: metrics.busVoltage33kV,
      voltage11kVBusA: metrics.busVoltage11kVA,
      voltage11kVBusB: metrics.busVoltage11kVB,
      frequencyHz: metrics.frequencyHz,
      ambientTempC: metrics.ambientTempC,
      stationBatteryVoltDC: metrics.stationBatteryVoltDC,
      sf6GasPressureBar: 6.2,
      t1OilTempC: transformers[0]?.oilTempC || 58.2,
      t1WindingTempC: transformers[0]?.windingTempC || 66.4,
      t2OilTempC: transformers[1]?.oilTempC || 55.6,
      t2WindingTempC: transformers[1]?.windingTempC || 63.8,
      feederReadings: {
        'Hadejia 11kV Feeder': { currentAmps: feeders[0]?.currentAmps || 284, mw: feeders[0]?.currentMW || 5.2, voltageKV: feeders[0]?.actualVoltageKV || 11.15, status: feeders[0]?.breakerState || 'CLOSED' },
        'Kafin Hausa 11kV Feeder': { currentAmps: feeders[1]?.currentAmps || 224, mw: feeders[1]?.currentMW || 4.1, voltageKV: feeders[1]?.actualVoltageKV || 11.10, status: feeders[1]?.breakerState || 'CLOSED' },
        'Auyo 11kV Feeder': { currentAmps: feeders[2]?.currentAmps || 208, mw: feeders[2]?.currentMW || 3.8, voltageKV: feeders[2]?.actualVoltageKV || 11.12, status: feeders[2]?.breakerState || 'CLOSED' },
        'Malam Madori 11kV Feeder': { currentAmps: feeders[3]?.currentAmps || 241, mw: feeders[3]?.currentMW || 4.4, voltageKV: feeders[3]?.actualVoltageKV || 11.08, status: feeders[3]?.breakerState || 'CLOSED' },
        'Guri 11kV Feeder': { currentAmps: feeders[4]?.currentAmps || 148, mw: feeders[4]?.currentMW || 2.7, voltageKV: feeders[4]?.actualVoltageKV || 11.05, status: feeders[4]?.breakerState || 'CLOSED' },
        'Kirikasamma 11kV Feeder': { currentAmps: feeders[5]?.currentAmps || 170, mw: feeders[5]?.currentMW || 3.1, voltageKV: feeders[5]?.actualVoltageKV || 11.10, status: feeders[5]?.breakerState || 'CLOSED' },
        'Kaugama 11kV Feeder': { currentAmps: feeders[6]?.currentAmps || 159, mw: feeders[6]?.currentMW || 2.9, voltageKV: feeders[6]?.actualVoltageKV || 11.14, status: feeders[6]?.breakerState || 'CLOSED' },
        'Birniwa 11kV Feeder': { currentAmps: feeders[7]?.currentAmps || 175, mw: feeders[7]?.currentMW || 3.2, voltageKV: feeders[7]?.actualVoltageKV || 11.06, status: feeders[7]?.breakerState || 'CLOSED' },
      },
      totalLoadMW: metrics.totalFeederLoadMW,
      totalCurrentAmps: feeders.reduce((sum, f) => sum + (f.breakerState === 'CLOSED' ? f.currentAmps : 0), 0),
      remarks: `Shift log recorded by ${targetOperator.name}. System frequency ${metrics.frequencyHz}Hz nominal. All 8 11kV town feeders monitored.`,
    });
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Control & Filter Bar (Hidden when printing) */}
      <div className="print:hidden bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>INDEPENDENT OPERATOR SHIFT REPORT GENERATOR</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold">
                  SCADA AUDIT READY
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Filter and export isolated shift handover reports, electrical parameters, and breaker operations per operator
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold uppercase flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Print official shift handover report (formatted for A4 paper)"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-bold uppercase flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Download CSV file for spreadsheet audit"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold uppercase flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Copy formatted dispatch text summary for WhatsApp / SMS"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy Dispatch Summary</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Operator Selector */}
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">
              Filter by Operator Profile:
            </label>
            <select
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-hidden"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.id} • {op.role}) {op.id === activeOperator.id ? '★ Active Duty' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">
              Shift Window:
            </label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-hidden"
            >
              <option value="ALL">All Shifts Logged</option>
              <option value="Morning">Morning Shift (06:00 - 14:00)</option>
              <option value="Afternoon">Afternoon Shift (14:00 - 22:00)</option>
              <option value="Night">Night Shift (22:00 - 06:00)</option>
            </select>
          </div>

          {/* Quick Snapshot Action */}
          <div className="flex items-end">
            <button
              onClick={handleRecordSnapshotLog}
              className="w-full py-1.5 px-3 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-700 text-sky-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Record current live telemetry snapshot stamped under this operator"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Snapshot Log as {targetOperator.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Copy Toast */}
        {copyFeedback && (
          <div className="p-2 rounded bg-amber-950 border border-amber-700 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{copyFeedback}</span>
          </div>
        )}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 sm:p-7 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 print:border-black pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 print:text-gray-600">
                <span>TRANSMISSION COMPANY OF NIGERIA (TCN)</span>
                <span>•</span>
                <span>JEDC KANO DISCO INTERFACE</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-100 print:text-black uppercase tracking-wider mt-0.5">
                FUTURE<span className="text-sky-400 print:text-black">X</span> 132/33/11kV TRANSMISSION SUBSTATION
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-700">
                Hadejia Transmission Work Centre, Jigawa State • 8 x 11kV Receiving Feeders Distribution Grid
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 print:text-gray-800">
              <div className="font-bold text-slate-200 print:text-black">
                INDEPENDENT SHIFT LOGSHEET & AUDIT
              </div>
              <div className="text-[11px]">
                Report Ref: <strong className="font-mono text-sky-400 print:text-black">REP-{targetOperator.id}-{Date.now().toString().slice(-4)}</strong>
              </div>
              <div className="text-[10px] text-slate-500 print:text-gray-600">
                Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Operator Shift Passport & KPI Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] uppercase text-slate-400 print:text-gray-600 font-bold block">
              DUTY OPERATOR
            </span>
            <div className="text-sm font-extrabold text-slate-100 print:text-black truncate mt-0.5">
              {targetOperator.name}
            </div>
            <div className="text-[10px] font-mono text-sky-400 print:text-gray-700">
              ID: {targetOperator.id} • {targetOperator.badgeNumber || 'TCN-FX-01'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] uppercase text-slate-400 print:text-gray-600 font-bold block">
              ASSIGNED SHIFT
            </span>
            <div className="text-xs font-bold text-slate-100 print:text-black truncate mt-0.5">
              {targetOperator.shift.split('(')[0]}
            </div>
            <div className="text-[10px] font-mono text-slate-400 print:text-gray-600">
              {targetOperator.shift.includes('(') ? `(${targetOperator.shift.split('(')[1]}` : ''}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] uppercase text-slate-400 print:text-gray-600 font-bold block">
              LOGS FILED
            </span>
            <div className="text-lg font-extrabold text-emerald-400 print:text-black">
              {operatorHourlyLogs.length} <span className="text-xs font-normal text-slate-400 print:text-gray-600">Readings</span>
            </div>
            <div className="text-[10px] text-slate-400 print:text-gray-600">
              Avg Freq: {stats.avgFreq} Hz
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] uppercase text-slate-400 print:text-gray-600 font-bold block">
              SWITCHING ACTIONS
            </span>
            <div className="text-lg font-extrabold text-amber-400 print:text-black">
              {breakerOperations.length} <span className="text-xs font-normal text-slate-400 print:text-gray-600">Operations</span>
            </div>
            <div className="text-[10px] text-slate-400 print:text-gray-600">
              Alarms Ack: {alarmsAcknowledged.length}
            </div>
          </div>
        </div>

        {/* Section 1: Hourly Electrical Parameters Logsheet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400 print:text-black" />
              <span>Section 1: Electrical Parameters Recorded by Operator {targetOperator.name}</span>
            </h3>
            <span className="text-[10px] text-slate-400 print:text-gray-600">
              Substation Voltages (132/33/11kV) & Frequency
            </span>
          </div>

          {operatorHourlyLogs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 print:bg-gray-50 border border-slate-800 print:border-gray-300 text-center text-xs text-slate-400 print:text-gray-600">
              No electrical parameter logs recorded yet under this operator's login during this session.
              <div className="mt-2">
                <button
                  onClick={handleRecordSnapshotLog}
                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition print:hidden"
                >
                  Record Live Snapshot Log Now
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 print:border-gray-400 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black border-b border-slate-800 print:border-gray-400 text-[10px] uppercase font-bold">
                    <th className="p-2">Time</th>
                    <th className="p-2">132kV (kV)</th>
                    <th className="p-2">33kV (kV)</th>
                    <th className="p-2">11kV Bus A</th>
                    <th className="p-2">11kV Bus B</th>
                    <th className="p-2">Freq (Hz)</th>
                    <th className="p-2">Load (MW)</th>
                    <th className="p-2">T1 Winding</th>
                    <th className="p-2">T2 Winding</th>
                    <th className="p-2">Station DC</th>
                    <th className="p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-[11px]">
                  {operatorHourlyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                      <td className="p-2 font-bold text-sky-400 print:text-black whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-2 font-mono">{log.voltage132kV}</td>
                      <td className="p-2 font-mono">{log.voltage33kV}</td>
                      <td className="p-2 font-mono">{log.voltage11kVBusA}</td>
                      <td className="p-2 font-mono">{log.voltage11kVBusB}</td>
                      <td className="p-2 font-mono font-bold text-emerald-400 print:text-black">
                        {log.frequencyHz}
                      </td>
                      <td className="p-2 font-mono font-bold">{log.totalLoadMW}</td>
                      <td className="p-2 font-mono">{log.t1WindingTempC}°C</td>
                      <td className="p-2 font-mono">{log.t2WindingTempC}°C</td>
                      <td className="p-2 font-mono">{log.stationBatteryVoltDC}V</td>
                      <td className="p-2 text-slate-400 print:text-gray-700 text-[10px] max-w-xs truncate">
                        {log.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: 8 x 11kV Receiving Feeders Status during Shift */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 print:text-black" />
              <span>Section 2: 8 x 11kV Receiving Town Feeders Status Summary</span>
            </h3>
            <span className="text-[10px] text-slate-400 print:text-gray-600">
              FutureX Substation Feeders (11kV Distribution Ring)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {feeders.map((f) => {
              const isClosed = f.breakerState === 'CLOSED';
              return (
                <div
                  key={f.id}
                  className={`p-2.5 rounded-lg border text-xs ${
                    isClosed
                      ? 'bg-slate-900 print:bg-gray-100 border-slate-800 print:border-gray-300'
                      : 'bg-rose-950/40 print:bg-rose-50 border-rose-800 print:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 print:text-black truncate text-[11px]">
                      {f.townName}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                        isClosed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {f.breakerState}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 print:text-gray-600 mt-1 flex items-center justify-between">
                    <span>{f.currentMW} MW</span>
                    <span>{f.currentAmps} A</span>
                    <span>{f.actualVoltageKV} kV</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Operator Dispatch & Switching Audit Trail */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-sky-400 print:text-black" />
              <span>Section 3: Operator Switching & Event Audit Trail</span>
            </h3>
            <span className="text-[10px] text-slate-400 print:text-gray-600">
              Timestamped logs executed under {targetOperator.name}
            </span>
          </div>

          {operatorLogs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 print:bg-gray-50 border border-slate-800 print:border-gray-300 text-center text-xs text-slate-400 print:text-gray-600">
              No switching operations or event records logged under this operator during this query window.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
              {operatorLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-900 print:bg-gray-50 border border-slate-800 print:border-gray-300 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-sky-400 print:text-black font-bold">
                        {log.timestamp}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 print:bg-gray-200 text-slate-300 print:text-black text-[9px] font-bold uppercase">
                        {log.category}
                      </span>
                      <strong className="text-slate-100 print:text-black text-[11px]">
                        {log.action}
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-400 print:text-gray-700">
                      Equipment: <span className="text-slate-300 print:text-black font-semibold">{log.equipment}</span> — {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Handover Remarks & Formal Signatures */}
        <div className="space-y-3 pt-3 border-t border-slate-800 print:border-black">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black block mb-1">
              Section 4: Shift Handover Remarks & Dispatch Summary
            </label>
            <textarea
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 print:bg-transparent border border-slate-700 print:border-gray-400 rounded-lg p-2.5 text-xs text-slate-200 print:text-black focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Endorsement Blocks (3 Official Signatures) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 print:border-black">
            <div className="border border-slate-800 print:border-gray-400 rounded-lg p-3 bg-slate-900/50 print:bg-white text-xs space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">
                1. OUTGOING DUTY DESPATCH OPERATOR
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-100 print:text-black">
                  {targetOperator.name}
                </div>
                <div className="text-[10px] text-slate-400 print:text-gray-600 font-mono">
                  STAFF ID: {targetOperator.id}
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-slate-700 print:border-gray-400 text-[10px] text-slate-500 print:text-gray-600 flex justify-between">
                <span>Signature: __________________</span>
                <span>Date: __________</span>
              </div>
            </div>

            <div className="border border-slate-800 print:border-gray-400 rounded-lg p-3 bg-slate-900/50 print:bg-white text-xs space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">
                2. INCOMING RELIEVING OPERATOR
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-300 print:text-black">
                  Relief Despatch Engineer
                </div>
                <div className="text-[10px] text-slate-400 print:text-gray-600 font-mono">
                  STAFF ID: _________________
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-slate-700 print:border-gray-400 text-[10px] text-slate-500 print:text-gray-600 flex justify-between">
                <span>Signature: __________________</span>
                <span>Date: __________</span>
              </div>
            </div>

            <div className="border border-slate-800 print:border-gray-400 rounded-lg p-3 bg-slate-900/50 print:bg-white text-xs space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600">
                3. STATION CONTROL & PROTECTION ENG.
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-300 print:text-black">
                  FutureX Technical Manager
                </div>
                <div className="text-[10px] text-slate-400 print:text-gray-600 font-mono">
                  SMS GATEWAY: {smsRecipient}
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-slate-700 print:border-gray-400 text-[10px] text-slate-500 print:text-gray-600 flex justify-between">
                <span>Signature: __________________</span>
                <span>Date: __________</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
