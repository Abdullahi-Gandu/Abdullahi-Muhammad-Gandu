import React, { useState } from 'react';
import {
  User,
  UserCheck,
  Edit2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  ArrowRight,
  ClipboardList,
  Zap,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { OperatorProfile } from '../types/dispatch';

export const OperatorRosterPanel: React.FC = () => {
  const {
    operators,
    activeOperator,
    setActiveOperatorById,
    updateActiveOperator,
    updateOperator,
    deleteOperator,
    addOperator,
    openSmsModal,
    smsRecipient,
  } = useDispatch();

  // Inline editing state for quick change of active operator's name
  const [isEditingActiveName, setIsEditingActiveName] = useState(false);
  const [activeNameInput, setActiveNameInput] = useState(activeOperator.name);

  // Modal / panel states for editing individual operator or adding a new operator
  const [editingOperatorId, setEditingOperatorId] = useState<string | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormRole, setEditFormRole] = useState<OperatorProfile['role']>('Duty System Operator');
  const [editFormShift, setEditFormShift] = useState<OperatorProfile['shift']>('Morning Shift (06:00 - 14:00)');
  const [editFormPhone, setEditFormPhone] = useState('');
  const [editFormPin, setEditFormPin] = useState('1234');

  // Add operator form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<OperatorProfile['role']>('Duty System Operator');
  const [newShift, setNewShift] = useState<OperatorProfile['shift']>('Morning Shift (06:00 - 14:00)');
  const [newPhone, setNewPhone] = useState('');
  const [newPin, setNewPin] = useState('1234');

  // Toast / notification feedback
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3000);
  };

  const handleSaveActiveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNameInput.trim()) return;
    updateActiveOperator({ name: activeNameInput.trim() });
    setIsEditingActiveName(false);
    showToast(`Active Operator name successfully updated to "${activeNameInput.trim()}"`);
  };

  const handleStartEditOperator = (op: OperatorProfile) => {
    setEditingOperatorId(op.id);
    setEditFormName(op.name);
    setEditFormRole(op.role);
    setEditFormShift(op.shift);
    setEditFormPhone(op.phone || '');
    setEditFormPin(op.pin || '1234');
  };

  const handleSaveOperatorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOperatorId || !editFormName.trim()) return;

    updateOperator(editingOperatorId, {
      name: editFormName.trim(),
      role: editFormRole,
      shift: editFormShift,
      phone: editFormPhone.trim() || undefined,
      pin: editFormPin.trim() || '1234',
    });

    if (activeOperator.id === editingOperatorId) {
      setActiveNameInput(editFormName.trim());
    }

    setEditingOperatorId(null);
    showToast(`Operator profile (${editingOperatorId}) updated with PIN.`);
  };

  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newOp: OperatorProfile = {
      id: `FX-OP-0${operators.length + 1}`,
      name: newName.trim(),
      role: newRole,
      shift: newShift,
      phone: newPhone.trim() || undefined,
      avatarColor: 'bg-emerald-600',
      pin: newPin.trim() || '1234',
      badgeNumber: `TCN-FX-${7000 + (operators.length + 1) * 20}`,
      lastLogin: 'Never',
    };

    addOperator(newOp);
    setNewName('');
    setNewPhone('');
    setNewPin('1234');
    setIsAddingNew(false);
    showToast(`New operator "${newOp.name}" registered with unique login PIN.`);
  };

  const handleAssignActive = (op: OperatorProfile) => {
    setActiveOperatorById(op.id);
    setActiveNameInput(op.name);
    showToast(`Operator "${op.name}" assigned as the active Duty Operator.`);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Toast Notification */}
      {bannerNotice && (
        <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{bannerNotice}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-emerald-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Active Operator Banner & Change Place */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-700/70 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sky-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-900/80 border border-sky-600 flex items-center justify-center text-sky-300">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>Active Duty Despatch Operator</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-extrabold uppercase">
                  ON CONSOLE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                FutureX 132/33kV Substation — Primary authority for breaker operations & log recording
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingActiveName ? (
              <button
                onClick={() => {
                  setActiveNameInput(activeOperator.name);
                  setIsEditingActiveName(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Change Operator Name</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingActiveName(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Inline Quick Change Form or Display Card */}
        {isEditingActiveName ? (
          <form
            onSubmit={handleSaveActiveName}
            className="mt-4 p-4 rounded-lg bg-slate-950 border border-sky-600/80 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Edit2 className="w-3.5 h-3.5" />
              <span>Change Active Operator Name Directly:</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={activeNameInput}
                onChange={(e) => setActiveNameInput(e.target.value)}
                placeholder="Enter operator full name (e.g., A. Muhammad Gandu)"
                required
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-lg px-3 py-2 text-sm text-slate-100 font-bold focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Assign Name</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              This will update the duty operator's name across all 8 town feeder switching operations, hourly logsheets, and automated SMS alerts.
            </p>
          </form>
        ) : (
          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-xl ${
                  activeOperator.avatarColor || 'bg-sky-600'
                } flex items-center justify-center text-white font-black text-xl uppercase shadow-lg border border-sky-400/40`}
              >
                {activeOperator.name.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg sm:text-xl font-extrabold text-slate-100">
                    {activeOperator.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold uppercase">
                    ID: {activeOperator.id}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2.5">
                  <span className="text-sky-300 font-semibold">{activeOperator.role}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {activeOperator.shift}
                  </span>
                  {activeOperator.phone && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {activeOperator.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Impact Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Feeder Commands</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hourly Logs</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 col-span-2 sm:col-span-1">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>SMS Notifications</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Operator Roster & Assignment Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Substation Operator Roster ({operators.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Assign any operator to take over console duties or update personnel records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'Close Form' : 'Register Operator'}</span>
            </button>
          </div>
        </div>

        {/* Register New Operator Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateOperator}
            className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sky-400 uppercase tracking-wider">
                Register New Shift Operator
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kabir Bello"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-semibold focus:border-sky-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Designation / Role:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as OperatorProfile['role'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                >
                  <option value="Lead Despatch Engineer">Lead Despatch Engineer</option>
                  <option value="Duty System Operator">Duty System Operator</option>
                  <option value="Switchyard Tech">Switchyard Tech</option>
                  <option value="Protection Engineer">Protection Engineer</option>
                  <option value="Control Room Operator">Control Room Operator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Shift:</label>
                <select
                  value={newShift}
                  onChange={(e) => setNewShift(e.target.value as OperatorProfile['shift'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                >
                  <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                  <option value="Afternoon Shift (14:00 - 22:00)">Afternoon Shift (14:00 - 22:00)</option>
                  <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Phone (Optional):</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-sky-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unique Security PIN (4 Digits):</label>
                <input
                  type="text"
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="1234"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono tracking-widest font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Operators Table / Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {operators.map((op) => {
            const isActive = op.id === activeOperator.id;
            const isEditingThis = editingOperatorId === op.id;

            if (isEditingThis) {
              return (
                <form
                  key={op.id}
                  onSubmit={handleSaveOperatorEdit}
                  className="p-3.5 rounded-xl bg-slate-950 border border-sky-600 space-y-2.5 text-xs col-span-1 md:col-span-2"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="font-bold text-sky-400 uppercase">
                      Edit Operator Record: {op.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingOperatorId(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Operator Name:</label>
                      <input
                        type="text"
                        value={editFormName}
                        onChange={(e) => setEditFormName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-bold focus:border-sky-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Role / Designation:</label>
                      <select
                        value={editFormRole}
                        onChange={(e) => setEditFormRole(e.target.value as OperatorProfile['role'])}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
                      >
                        <option value="Lead Despatch Engineer">Lead Despatch Engineer</option>
                        <option value="Duty System Operator">Duty System Operator</option>
                        <option value="Switchyard Tech">Switchyard Tech</option>
                        <option value="Protection Engineer">Protection Engineer</option>
                        <option value="Control Room Operator">Control Room Operator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Assigned Shift:</label>
                      <select
                        value={editFormShift}
                        onChange={(e) => setEditFormShift(e.target.value as OperatorProfile['shift'])}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
                      >
                        <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                        <option value="Afternoon Shift (14:00 - 22:00)">Afternoon Shift (14:00 - 22:00)</option>
                        <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Security PIN:</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={editFormPin}
                        onChange={(e) => setEditFormPin(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 font-mono tracking-widest font-bold focus:border-amber-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingOperatorId(null)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Update</span>
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={op.id}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-sky-950/40 border-sky-600 ring-1 ring-sky-500/40 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${
                        op.avatarColor || 'bg-slate-700'
                      } flex items-center justify-center text-white font-bold text-sm uppercase shadow`}
                    >
                      {op.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-100 text-sm">{op.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-sky-400 font-semibold">{op.role}</span>
                        <span className="mx-1.5 text-slate-600">•</span>
                        <span>{op.id}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartEditOperator(op)}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Edit operator name and details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{op.shift.split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive ? (
                      <button
                        onClick={() => handleAssignActive(op)}
                        className="px-3 py-1 rounded-md bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1"
                      >
                        <span>Assign Duty</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold text-[10px] uppercase border border-emerald-800/80 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>On Duty</span>
                      </span>
                    )}

                    {operators.length > 1 && !isActive && (
                      <button
                        onClick={() => deleteOperator(op.id)}
                        className="p-1 rounded text-slate-600 hover:text-rose-400 transition"
                        title="Delete operator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Linked Controls & Quick Action to SMS Destination */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-sky-400" />
          <span className="text-slate-300">
            Emergency SMS Dispatch Recipient:{' '}
            <strong className="text-sky-400 font-bold">{smsRecipient}</strong>
          </span>
        </div>
        <button
          onClick={openSmsModal}
          className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-300 font-bold uppercase text-[11px] flex items-center gap-1.5 transition"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit SMS Button / Number</span>
        </button>
      </div>
    </div>
  );
};
