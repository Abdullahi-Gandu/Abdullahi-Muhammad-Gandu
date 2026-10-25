import React, { useState } from 'react';
import {
  User,
  UserCheck,
  Plus,
  X,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { OperatorProfile } from '../types/dispatch';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorModal: React.FC<OperatorModalProps> = ({ isOpen, onClose }) => {
  const {
    operators,
    activeOperator,
    setActiveOperatorById,
    updateActiveOperator,
    updateOperator,
    deleteOperator,
    addOperator,
  } = useDispatch();

  // Mode: 'LIST' | 'EDIT_ACTIVE' | 'EDIT_MEMBER' | 'CREATE'
  const [mode, setMode] = useState<'LIST' | 'EDIT_ACTIVE' | 'EDIT_MEMBER' | 'CREATE'>('LIST');

  // Form states for active operator or targeted operator
  const [editingId, setEditingId] = useState<string>('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<OperatorProfile['role']>('Lead Despatch Engineer');
  const [shift, setShift] = useState<OperatorProfile['shift']>('Morning Shift (06:00 - 14:00)');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const startEditActive = () => {
    setEditingId(activeOperator.id);
    setName(activeOperator.name);
    setRole(activeOperator.role);
    setShift(activeOperator.shift);
    setPhone(activeOperator.phone || '');
    setPin(activeOperator.pin || '1234');
    setBadgeNumber(activeOperator.badgeNumber || `TCN-${activeOperator.id}`);
    setMode('EDIT_ACTIVE');
  };

  const startEditMember = (op: OperatorProfile) => {
    setEditingId(op.id);
    setName(op.name);
    setRole(op.role);
    setShift(op.shift);
    setPhone(op.phone || '');
    setPin(op.pin || '1234');
    setBadgeNumber(op.badgeNumber || `TCN-${op.id}`);
    setMode('EDIT_MEMBER');
  };

  const startCreate = () => {
    setEditingId('');
    setName('');
    setRole('Duty System Operator');
    setShift('Morning Shift (06:00 - 14:00)');
    setPhone('');
    setPin('1234');
    setBadgeNumber(`TCN-FX-${7000 + (operators.length + 1) * 20}`);
    setMode('CREATE');
  };

  const handleSaveActive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateActiveOperator({
      name: name.trim(),
      role,
      shift,
      phone: phone.trim() || undefined,
      pin: pin.trim() || '1234',
      badgeNumber: badgeNumber.trim() || undefined,
    });

    setSuccessMsg(`Operator assigned as "${name.trim()}" (PIN updated)`);
    setTimeout(() => {
      setSuccessMsg('');
      setMode('LIST');
    }, 1500);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !editingId) return;

    updateOperator(editingId, {
      name: name.trim(),
      role,
      shift,
      phone: phone.trim() || undefined,
      pin: pin.trim() || '1234',
      badgeNumber: badgeNumber.trim() || undefined,
    });

    setSuccessMsg(`Operator "${name.trim()}" updated successfully`);
    setTimeout(() => {
      setSuccessMsg('');
      setMode('LIST');
    }, 1500);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newOp: OperatorProfile = {
      id: `FX-OP-0${operators.length + 1}`,
      name: name.trim(),
      role,
      shift,
      phone: phone.trim() || undefined,
      avatarColor: 'bg-emerald-600',
      pin: pin.trim() || '1234',
      badgeNumber: badgeNumber.trim() || `TCN-FX-${7000 + (operators.length + 1) * 20}`,
      lastLogin: 'Never',
    };

    addOperator(newOp);
    setSuccessMsg(`Operator "${name.trim()}" created with unique login PIN`);
    setTimeout(() => {
      setSuccessMsg('');
      setMode('LIST');
    }, 1500);
  };

  const handleAssign = (id: string) => {
    setActiveOperatorById(id);
    const op = operators.find((o) => o.id === id);
    setSuccessMsg(`Assigned ${op?.name || id} as Duty Operator`);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 font-mono animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Operator Assignment & Name Configuration
              </h3>
              <p className="text-[11px] text-slate-400">
                Assign or change operator names for shift logsheets, breaker operations, and SMS alerts
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

        {/* Feedback message banner */}
        {successMsg && (
          <div className="p-2.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 my-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main View: List with Active Card */}
        {mode === 'LIST' && (
          <div className="my-4 space-y-4 text-xs">
            {/* Active Duty Operator Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/80 via-slate-950 to-slate-950 border border-sky-700/80 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-sky-900/60">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  CURRENT ACTIVE DUTY OPERATOR
                </span>
                <button
                  onClick={startEditActive}
                  className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] uppercase flex items-center gap-1 transition"
                  title="Click to edit the active operator's name directly"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Change / Edit Name</span>
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl ${
                    activeOperator.avatarColor || 'bg-sky-600'
                  } flex items-center justify-center text-white font-black text-base uppercase shadow-lg border border-sky-400/40`}
                >
                  {activeOperator.name.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-100">
                      {activeOperator.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold uppercase">
                      {activeOperator.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                    <span className="text-sky-300 font-semibold">{activeOperator.role}</span>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {activeOperator.shift}
                    </span>
                    {activeOperator.phone && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {activeOperator.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Station Operator Directory & Assignment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Station Operator Roster ({operators.length})
                </span>
                <button
                  onClick={startCreate}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register New Operator</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {operators.map((op) => {
                  const isActive = op.id === activeOperator.id;

                  return (
                    <div
                      key={op.id}
                      className={`p-3 rounded-lg border transition flex items-center justify-between ${
                        isActive
                          ? 'bg-sky-950/40 border-sky-600 ring-1 ring-sky-500/50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg ${
                            op.avatarColor || 'bg-slate-700'
                          } flex items-center justify-center text-white font-bold text-xs uppercase shadow`}
                        >
                          {op.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{op.name}</span>
                            <span className="text-[10px] text-slate-400">({op.id})</span>
                            {isActive && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold uppercase">
                                ON DUTY
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{op.role}</span>
                            <span>•</span>
                            <span>{op.shift.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEditMember(op)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit operator name and details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isActive ? (
                          <button
                            onClick={() => handleAssign(op.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1"
                          >
                            <span>Assign</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold px-2 py-1">
                            ASSIGNED
                          </span>
                        )}

                        {operators.length > 1 && !isActive && (
                          <button
                            onClick={() => deleteOperator(op.id)}
                            className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Remove operator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Edit Active Operator or Member Form */}
        {(mode === 'EDIT_ACTIVE' || mode === 'EDIT_MEMBER' || mode === 'CREATE') && (
          <form
            onSubmit={
              mode === 'EDIT_ACTIVE'
                ? handleSaveActive
                : mode === 'EDIT_MEMBER'
                ? handleSaveMember
                : handleCreateNew
            }
            className="my-4 space-y-3 text-xs"
          >
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sky-400 uppercase tracking-wide">
                {mode === 'EDIT_ACTIVE'
                  ? 'Assign & Change Active Operator Name'
                  : mode === 'EDIT_MEMBER'
                  ? `Edit Operator (${editingId})`
                  : 'Register New Shift Operator'}
              </span>
              <button
                type="button"
                onClick={() => setMode('LIST')}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Back to List
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Operator Full Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. A. Muhammad Gandu"
                required
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded px-3 py-2 text-sm text-slate-100 font-bold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Designation / Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as OperatorProfile['role'])}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
              >
                <option value="Lead Despatch Engineer">Lead Despatch Engineer</option>
                <option value="Duty System Operator">Duty System Operator</option>
                <option value="Switchyard Tech">Switchyard Tech</option>
                <option value="Protection Engineer">Protection Engineer</option>
                <option value="Control Room Operator">Control Room Operator</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Assigned Shift:</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  Unique Login PIN (4 Digits):
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="e.g. 1234"
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-3 py-2 text-slate-100 font-mono tracking-widest font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Staff / Badge ID (Optional):
                </label>
                <input
                  type="text"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  placeholder="e.g. TCN-FX-7041"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Direct Contact Phone (Optional):
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 803 123 4567"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMode('LIST')}
                className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>
                  {mode === 'EDIT_ACTIVE' ? 'Assign & Update Operator' : 'Save Operator Profile'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>FutureX 132/33kV Station Security & Personnel Record</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
