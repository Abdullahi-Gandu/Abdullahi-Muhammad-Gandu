import React, { useState } from 'react';
import {
  ClipboardList,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Trash2,
  Calendar,
  Clock,
  User,
  Zap,
  Activity,
  Thermometer,
  BatteryCharging,
  Gauge,
  CheckCircle,
  Search,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { ElectricalHourlyLog } from '../types/dispatch';

export const ElectricalLogsheetPanel: React.FC = () => {
  const {
    metrics,
    feeders,
    transformers,
    hourlyLogs,
    activeOperator,
    saveElectricalHourlyLog,
    deleteHourlyLog,
  } = useDispatch();

  const [isRecording, setIsRecording] = useState(false);
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [searchRemarks, setSearchRemarks] = useState('');

  // Form state initialized with live telemetry
  const [v132, setV132] = useState(metrics.incomingVoltage132kV);
  const [v33, setV33] = useState(metrics.busVoltage33kV);
  const [v11A, setV11A] = useState(metrics.busVoltage11kVA);
  const [v11B, setV11B] = useState(metrics.busVoltage11kVB);
  const [freq, setFreq] = useState(metrics.frequencyHz);
  const [ambientTemp, setAmbientTemp] = useState(metrics.ambientTempC);
  const [batteryDC, setBatteryDC] = useState(metrics.stationBatteryVoltDC);
  const [sf6Bar, setSf6Bar] = useState(6.2);
  const [t1Oil, setT1Oil] = useState(transformers[0]?.oilTempC || 58.2);
  const [t1Wdg, setT1Wdg] = useState(transformers[0]?.windingTempC || 66.4);
  const [t2Oil, setT2Oil] = useState(transformers[1]?.oilTempC || 55.6);
  const [t2Wdg, setT2Wdg] = useState(transformers[1]?.windingTempC || 63.8);
  const [remarks, setRemarks] = useState('');

  // Feeder readings state mapping
  const [feederFormReadings, setFeederFormReadings] = useState<{
    [feederName: string]: { currentAmps: number; mw: number; voltageKV: number; status: 'CLOSED' | 'OPEN' | 'TRIPPED' };
  }>(() => {
    const map: { [key: string]: { currentAmps: number; mw: number; voltageKV: number; status: 'CLOSED' | 'OPEN' | 'TRIPPED' } } = {};
    feeders.forEach((f) => {
      map[f.name] = {
        currentAmps: f.currentAmps,
        mw: f.currentMW,
        voltageKV: f.actualVoltageKV,
        status: f.breakerState,
      };
    });
    return map;
  });

  const handleOpenRecorder = () => {
    // Populate with current live telemetry values
    setV132(metrics.incomingVoltage132kV);
    setV33(metrics.busVoltage33kV);
    setV11A(metrics.busVoltage11kVA);
    setV11B(metrics.busVoltage11kVB);
    setFreq(metrics.frequencyHz);
    setAmbientTemp(metrics.ambientTempC);
    setBatteryDC(metrics.stationBatteryVoltDC);
    setSf6Bar(6.2);
    setT1Oil(transformers[0]?.oilTempC || 58.2);
    setT1Wdg(transformers[0]?.windingTempC || 66.4);
    setT2Oil(transformers[1]?.oilTempC || 55.6);
    setT2Wdg(transformers[1]?.windingTempC || 63.8);

    const map: { [key: string]: { currentAmps: number; mw: number; voltageKV: number; status: 'CLOSED' | 'OPEN' | 'TRIPPED' } } = {};
    feeders.forEach((f) => {
      map[f.name] = {
        currentAmps: f.currentAmps,
        mw: f.currentMW,
        voltageKV: f.actualVoltageKV,
        status: f.breakerState,
      };
    });
    setFeederFormReadings(map);
    setIsRecording(true);
  };

  const handleFeederCurrentChange = (name: string, amps: number) => {
    setFeederFormReadings((prev) => {
      const existing = prev[name];
      if (!existing) return prev;
      const calculatedMW = Number(((Math.sqrt(3) * existing.voltageKV * amps * 0.96) / 1000).toFixed(2));
      return {
        ...prev,
        [name]: { ...existing, currentAmps: amps, mw: calculatedMW },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalMW = Object.values(feederFormReadings).reduce((sum, item) => sum + item.mw, 0);
    const totalAmps = Object.values(feederFormReadings).reduce((sum, item) => sum + item.currentAmps, 0);

    saveElectricalHourlyLog({
      operatorId: activeOperator.id,
      operatorName: activeOperator.name,
      shift: activeOperator.shift,
      voltage132kV: Number(v132),
      voltage33kV: Number(v33),
      voltage11kVBusA: Number(v11A),
      voltage11kVBusB: Number(v11B),
      frequencyHz: Number(freq),
      ambientTempC: Number(ambientTemp),
      stationBatteryVoltDC: Number(batteryDC),
      sf6GasPressureBar: Number(sf6Bar),
      t1OilTempC: Number(t1Oil),
      t1WindingTempC: Number(t1Wdg),
      t2OilTempC: Number(t2Oil),
      t2WindingTempC: Number(t2Wdg),
      feederReadings: feederFormReadings,
      totalLoadMW: Number(totalMW.toFixed(2)),
      totalCurrentAmps: totalAmps,
      remarks: remarks.trim() || 'Hourly parameters recorded in accordance with FutureX Grid Code.',
    });

    setIsRecording(false);
    setRemarks('');
  };

  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Date',
      'Time',
      'Operator',
      'Shift',
      '132kV (kV)',
      '33kV (kV)',
      '11kV Bus A (kV)',
      '11kV Bus B (kV)',
      'Freq (Hz)',
      'Amb Temp (°C)',
      'DC Battery (V)',
      'SF6 (bar)',
      'T1 Oil (°C)',
      'T1 Wdg (°C)',
      'T2 Oil (°C)',
      'T2 Wdg (°C)',
      'Total Load (MW)',
      'Total Current (A)',
      'Hadejia (A)',
      'Hadejia (MW)',
      'Kafin Hausa (A)',
      'Kafin Hausa (MW)',
      'Auyo (A)',
      'Auyo (MW)',
      'Malam Madori (A)',
      'Malam Madori (MW)',
      'Guri (A)',
      'Guri (MW)',
      'Kirikasamma (A)',
      'Kirikasamma (MW)',
      'Kaugama (A)',
      'Kaugama (MW)',
      'Birniwa (A)',
      'Birniwa (MW)',
      'Remarks',
    ];

    const rows = hourlyLogs.map((l) => [
      `"${l.id}"`,
      `"${l.date}"`,
      `"${l.timestamp}"`,
      `"${l.operatorName}"`,
      `"${l.shift}"`,
      l.voltage132kV,
      l.voltage33kV,
      l.voltage11kVBusA,
      l.voltage11kVBusB,
      l.frequencyHz,
      l.ambientTempC,
      l.stationBatteryVoltDC,
      l.sf6GasPressureBar,
      l.t1OilTempC,
      l.t1WindingTempC,
      l.t2OilTempC,
      l.t2WindingTempC,
      l.totalLoadMW,
      l.totalCurrentAmps,
      l.feederReadings['Hadejia 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Hadejia 11kV Feeder']?.mw || 0,
      l.feederReadings['Kafin Hausa 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Kafin Hausa 11kV Feeder']?.mw || 0,
      l.feederReadings['Auyo 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Auyo 11kV Feeder']?.mw || 0,
      l.feederReadings['Malam Madori 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Malam Madori 11kV Feeder']?.mw || 0,
      l.feederReadings['Guri 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Guri 11kV Feeder']?.mw || 0,
      l.feederReadings['Kirikasamma 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Kirikasamma 11kV Feeder']?.mw || 0,
      l.feederReadings['Kaugama 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Kaugama 11kV Feeder']?.mw || 0,
      l.feederReadings['Birniwa 11kV Feeder']?.currentAmps || 0,
      l.feederReadings['Birniwa 11kV Feeder']?.mw || 0,
      `"${(l.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `futurex_electrical_logsheet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = hourlyLogs.filter((log) => {
    const matchesOperator = operatorFilter === 'ALL' || log.operatorName === operatorFilter;
    const matchesRemarks = searchRemarks === '' || log.remarks.toLowerCase().includes(searchRemarks.toLowerCase());
    return matchesOperator && matchesRemarks;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col font-mono">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              FutureX Substation Electrical Parameter Logsheet
            </h2>
            <p className="text-[11px] text-slate-400">
              Hourly operator records for Voltage, Current, Frequency, Temperatures & 8 x 11kV Feeders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenRecorder}
            className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Current Parameters</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Logsheet</span>
          </button>
        </div>
      </div>

      {/* Duty Operator Banner */}
      <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-xs uppercase">
            {activeOperator.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">{activeOperator.name}</span>
              <span className="text-[10px] text-slate-400">({activeOperator.id})</span>
              <span className="px-1.5 py-0.2 bg-sky-950 text-sky-300 border border-sky-800 rounded text-[9px] font-bold">
                {activeOperator.role}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{activeOperator.shift}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300 text-[11px]">
          <div>
            132kV Bus: <strong className="text-sky-400">{metrics.incomingVoltage132kV} kV</strong>
          </div>
          <div>•</div>
          <div>
            33kV Bus: <strong className="text-amber-400">{metrics.busVoltage33kV} kV</strong>
          </div>
          <div>•</div>
          <div>
            11kV Bus: <strong className="text-purple-400">{metrics.busVoltage11kVA} kV</strong>
          </div>
          <div>•</div>
          <div>
            Freq: <strong className="text-emerald-400">{metrics.frequencyHz.toFixed(2)} Hz</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search remarks, feeder names, or notes..."
            value={searchRemarks}
            onChange={(e) => setSearchRemarks(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-8 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter by Operator:</span>
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
          >
            <option value="ALL">All Operators</option>
            {Array.from(new Set(hourlyLogs.map((l) => l.operatorName))).map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logsheet Table */}
      <div className="mt-3 overflow-x-auto border border-slate-800 rounded-lg max-h-[500px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950 text-slate-300 sticky top-0 z-10 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800">Time & Date</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800">Operator</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800 text-sky-400">132kV</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800 text-amber-400">33kV</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800 text-purple-400">11kV (A/B)</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800 text-emerald-400">Freq</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800">Temps (°C)</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800">DC / SF6</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800 text-sky-300">Total Load</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800">8 x 11kV Receiving Feeders (Amps / MW)</th>
              <th className="p-2.5 whitespace-nowrap border-r border-slate-800">Remarks</th>
              <th className="p-2.5 whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-[11px]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-8 text-slate-500">
                  No electrical parameter logs found. Click "Record Current Parameters" to log this hour's telemetry.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800">
                    <div className="font-bold text-slate-200">{log.timestamp}</div>
                    <div className="text-[10px] text-slate-400">{log.date}</div>
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800">
                    <div className="font-semibold text-slate-200">{log.operatorName}</div>
                    <div className="text-[10px] text-slate-400">{log.operatorId}</div>
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800 font-bold text-sky-400">
                    {log.voltage132kV} kV
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800 font-bold text-amber-400">
                    {log.voltage33kV} kV
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800 text-purple-300">
                    {log.voltage11kVBusA} / {log.voltage11kVBusB} kV
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800 font-bold text-emerald-400">
                    {log.frequencyHz} Hz
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800 text-slate-300">
                    <div>Amb: {log.ambientTempC}°C</div>
                    <div className="text-[10px] text-slate-400">
                      T1: {log.t1OilTempC}° | T2: {log.t2OilTempC}°
                    </div>
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800 text-slate-300">
                    <div>{log.stationBatteryVoltDC}V DC</div>
                    <div className="text-[10px] text-slate-400">{log.sf6GasPressureBar} bar</div>
                  </td>

                  <td className="p-2.5 whitespace-nowrap border-r border-slate-800">
                    <div className="font-extrabold text-sky-400">{log.totalLoadMW} MW</div>
                    <div className="text-[10px] text-slate-400">{log.totalCurrentAmps} A</div>
                  </td>

                  {/* 8 Feeders Grid breakdown inside cell */}
                  <td className="p-2 border-r border-slate-800 min-w-[340px]">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                      {Object.entries(log.feederReadings).map(([name, val]) => (
                        <div
                          key={name}
                          className={`flex items-center justify-between px-1.5 py-0.5 rounded ${
                            val.status === 'CLOSED' ? 'bg-slate-950/60' : 'bg-rose-950/60 text-rose-300'
                          }`}
                        >
                          <span className="truncate max-w-[90px] font-semibold text-slate-300">
                            {name.split(' ')[0]}:
                          </span>
                          <span className={val.status === 'CLOSED' ? 'text-sky-300' : 'text-rose-400 font-bold'}>
                            {val.status === 'CLOSED' ? `${val.currentAmps}A (${val.mw}MW)` : 'OUTAGE'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="p-2.5 text-slate-300 max-w-xs border-r border-slate-800">
                    <p className="line-clamp-2">{log.remarks}</p>
                  </td>

                  <td className="p-2.5 whitespace-nowrap text-center">
                    <button
                      onClick={() => deleteHourlyLog(log.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Recording New Hourly Parameter Sheet */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 my-8 space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Record FutureX Hourly Electrical Logsheet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecording(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {/* Operator Signature Tag */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px]">LOGGING OPERATOR:</span>
                <div className="font-bold text-slate-200">
                  {activeOperator.name} ({activeOperator.id}) — {activeOperator.shift}
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> LIVE TELEMETRY SYNCED
              </span>
            </div>

            {/* Substation Voltages & Frequency */}
            <div>
              <span className="font-bold text-slate-300 uppercase tracking-wide text-[11px] block mb-2">
                1. System Voltages & Frequency
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">132kV Bus (kV)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={v132}
                    onChange={(e) => setV132(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">33kV Bus (kV)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={v33}
                    onChange={(e) => setV33(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">11kV Bus A (kV)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={v11A}
                    onChange={(e) => setV11A(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">11kV Bus B (kV)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={v11B}
                    onChange={(e) => setV11B(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Frequency (Hz)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={freq}
                    onChange={(e) => setFreq(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Temperatures & Auxiliary Parameters */}
            <div>
              <span className="font-bold text-slate-300 uppercase tracking-wide text-[11px] block mb-2">
                2. Temperatures & Station Auxiliaries
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">T1 Oil / Wdg (°C)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={t1Oil}
                      onChange={(e) => setT1Oil(Number(e.target.value))}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-100"
                      title="Oil Temp"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={t1Wdg}
                      onChange={(e) => setT1Wdg(Number(e.target.value))}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-100"
                      title="Winding Temp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">T2 Oil / Wdg (°C)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={t2Oil}
                      onChange={(e) => setT2Oil(Number(e.target.value))}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-100"
                      title="Oil Temp"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={t2Wdg}
                      onChange={(e) => setT2Wdg(Number(e.target.value))}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-100"
                      title="Winding Temp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">DC Battery Bank (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={batteryDC}
                    onChange={(e) => setBatteryDC(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">SF6 Gas Pressure (bar)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sf6Bar}
                    onChange={(e) => setSf6Bar(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* All 8 Receiving 11kV Feeders */}
            <div>
              <span className="font-bold text-slate-300 uppercase tracking-wide text-[11px] block mb-2">
                3. The 8 Receiving 11kV Feeders (Current in Amps)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                {Object.entries(feederFormReadings).map(([name, data]) => (
                  <div key={name} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <label className="block font-semibold text-slate-200 truncate">{name.replace(' 11kV Feeder', '')}</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        value={data.currentAmps}
                        onChange={(e) => handleFeederCurrentChange(name, Number(e.target.value))}
                        className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                      />
                      <span className="text-[10px] text-slate-400">A</span>
                    </div>
                    <div className="text-[10px] text-sky-400 mt-1">
                      Load: {data.mw} MW
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-slate-400 mb-1">Operator Remarks & Switching Notes</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Log any tap changer movements, feeder switching orders, weather, or RCC directives..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRecording(false)}
                className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider shadow"
              >
                Save & Sign Logsheet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
