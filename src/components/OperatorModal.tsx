import React, { useState } from 'react';
import { User, UserCheck, Plus, X, Shield, Phone, Clock } from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { OperatorProfile } from '../types/dispatch';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorModal: React.FC<OperatorModalProps> = ({ isOpen, onClose }) => {
  const { operators, activeOperator, setActiveOperatorById, addOperator } = useDispatch();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<OperatorProfile['role']>('Duty System Operator');
  const [shift, setShift] = useState<OperatorProfile['shift']>('Morning Shift (06:00 - 14:00)');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    setActiveOperatorById(id);
    onClose();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newOp: OperatorProfile = {
      id: `FX-OP-0${operators.length + 1}`,
      name: name.trim(),
      role,
      shift,
      phone: phone.trim() || undefined,
      avatarColor: 'bg-indigo-600',
    };

    addOperator(newOp);
    setIsCreating(false);
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              FutureX Operator Handover & Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCreating ? (
          <div className="my-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Select Active Duty Operator:</span>
              <button
                onClick={() => setIsCreating(true)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Operator</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {operators.map((op) => {
                const isActive = op.id === activeOperator.id;

                return (
                  <div
                    key={op.id}
                    onClick={() => handleSelect(op.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      isActive
                        ? 'bg-sky-950/60 border-sky-600 ring-1 ring-sky-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${op.avatarColor || 'bg-sky-600'} flex items-center justify-center text-white font-bold text-xs uppercase shadow`}
                      >
                        {op.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-100">{op.name}</span>
                          <span className="text-[10px] text-slate-400">({op.id})</span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-bold uppercase">
                              ON DUTY
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-sky-300">{op.role}</span>
                          <span>•</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {op.shift.split(' ')[0]} Shift
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(op.id);
                      }}
                      className={`px-3 py-1 text-xs rounded uppercase font-semibold transition ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isActive ? 'Active' : 'Switch'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="my-4 space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Operator Full Name</label>
              <input
                type="text"
                placeholder="e.g. S. Mohammed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Designation / Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as OperatorProfile['role'])}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
              >
                <option value="Lead Despatch Engineer">Lead Despatch Engineer</option>
                <option value="Duty System Operator">Duty System Operator</option>
                <option value="Switchyard Tech">Switchyard Tech</option>
                <option value="Protection Engineer">Protection Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Current Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as OperatorProfile['shift'])}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
              >
                <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                <option value="Afternoon Shift (14:00 - 22:00)">Afternoon Shift (14:00 - 22:00)</option>
                <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Control Room Intercom / Phone (Optional)</label>
              <input
                type="text"
                placeholder="e.g. +234 803 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider"
              >
                Register Operator
              </button>
            </div>
          </form>
        )}

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>FutureX 132/33kV Station Directory</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
