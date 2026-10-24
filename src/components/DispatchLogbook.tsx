import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  PhoneCall,
  Clock,
  User,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { DispatchLogEntry } from '../types/dispatch';

export const DispatchLogbook: React.FC = () => {
  const { logs, addLogEntry } = useDispatch();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Form state
  const [actionInput, setActionInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [detailsInput, setDetailsInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<DispatchLogEntry['category']>('DISPATCH');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.equipment.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionInput.trim() || !equipmentInput.trim()) return;

    addLogEntry(categoryInput, actionInput.trim(), equipmentInput.trim(), detailsInput.trim());

    // Reset
    setActionInput('');
    setEquipmentInput('');
    setDetailsInput('');
    setIsAddingEntry(false);
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Operator ID', 'Operator Name', 'Category', 'Action', 'Equipment', 'Details'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.operatorId}"`,
      `"${l.operatorName || ''}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.equipment}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gridpulse_dispatch_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            System Dispatch Official Shift Logbook
          </h2>
          <span className="text-[11px] text-slate-400">
            // OPERATOR: DSP-OP-449
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingEntry(true)}
            className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Log Entry</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
            title="Export shift logs to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search log entries, actions, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
          {['ALL', 'DISPATCH', 'PROTECTION', 'OUTAGE', 'COMMUNICATION', 'ALARM_ACK'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-slate-800 text-sky-400 font-bold border border-sky-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="mt-3 space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No log entries match the selected filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let catColor = 'text-slate-400 bg-slate-800 border-slate-700';
            if (log.category === 'OUTAGE') catColor = 'text-rose-300 bg-rose-950 border-rose-800';
            if (log.category === 'PROTECTION') catColor = 'text-amber-300 bg-amber-950 border-amber-800';
            if (log.category === 'DISPATCH') catColor = 'text-sky-300 bg-sky-950 border-sky-800';
            if (log.category === 'COMMUNICATION') catColor = 'text-emerald-300 bg-emerald-950 border-emerald-800';

            return (
              <div
                key={log.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {log.timestamp}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${catColor}`}>
                      {log.category}
                    </span>
                    <span className="font-bold text-slate-100">{log.action}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>{log.operatorName ? `${log.operatorName} (${log.operatorId})` : log.operatorId}</span>
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                  <span className="text-[11px] text-sky-400 font-semibold">{log.equipment}:</span>
                  <span className="text-[11px] text-slate-300">{log.details}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Log Entry Modal */}
      {isAddingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateEntry}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" /> Record Dispatch Entry
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingEntry(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value as DispatchLogEntry['category'])}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="DISPATCH">DISPATCH (Generation / Tap Change / Sync)</option>
                <option value="PROTECTION">PROTECTION (Relay Trip / Alarm)</option>
                <option value="OUTAGE">OUTAGE (Feeder Shed / Fault)</option>
                <option value="COMMUNICATION">COMMUNICATION (RCC Dispatch Directive)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Action / Order Title</label>
              <input
                type="text"
                placeholder="e.g. RCC Directive: Ramp Unit 3 to 135 MW"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Equipment / Circuit</label>
              <input
                type="text"
                placeholder="e.g. Unit 3 (Combined Steam) / Feeder 1"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Details & Remarks</label>
              <textarea
                rows={3}
                placeholder="Detailed observations, RCC operator name, line clearance code..."
                value={detailsInput}
                onChange={(e) => setDetailsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingEntry(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider"
              >
                Save Log Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
