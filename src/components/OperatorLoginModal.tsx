import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { OperatorProfile } from '../types/dispatch';

interface OperatorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorLoginModal: React.FC<OperatorLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    operators,
    activeOperator,
    isLoggedIn,
    loginOperator,
    unlockConsole,
  } = useDispatch();

  const [selectedOpId, setSelectedOpId] = useState<string>(activeOperator.id);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSwitchingUser, setIsSwitchingUser] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedOpId(activeOperator.id);
      setPin('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsSwitchingUser(!isLoggedIn);
    }
  }, [isOpen, activeOperator.id, isLoggedIn]);

  if (!isOpen) return null;

  const currentSelectedOp = operators.find((op) => op.id === selectedOpId) || activeOperator;

  const handleKeypadPress = (val: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + val);
      setErrorMsg('');
    }
  };

  const handleKeypadBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleKeypadClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setErrorMsg('Please enter your 4-digit security PIN.');
      return;
    }

    // Attempt login or unlock
    const result = loginOperator(selectedOpId, pin);
    if (result.success) {
      setSuccessMsg(`Welcome, ${currentSelectedOp.name}. Terminal authorized.`);
      setErrorMsg('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.error || 'Incorrect security PIN. Access denied.');
      setPin('');
    }
  };

  // Quick preset login helper for testing convenience
  const handleQuickPreset = (op: OperatorProfile) => {
    setSelectedOpId(op.id);
    setPin(op.pin);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 font-mono select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Terminal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-100">
                  FUTURE<span className="text-sky-400">X</span> OPERATOR AUTHENTICATION
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-bold uppercase">
                  SCADA PIN GATE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                132/33kV Substation • Control Room Dispatch Security Access
              </p>
            </div>
          </div>

          {/* Close button only available if already logged in */}
          {isLoggedIn && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Status Alert Banner */}
          {!isLoggedIn ? (
            <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-700/80 text-amber-300 text-xs flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <span className="font-bold">CONSOLE LOCKED:</span> Authorization required to operate breakers, shed feeders, or record official logsheets.
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-sky-950/50 border border-sky-800/60 text-sky-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Currently Active: <strong className="text-white">{activeOperator.name}</strong></span>
              </div>
              <span className="text-[10px] text-slate-400">{activeOperator.shift}</span>
            </div>
          )}

          {/* Operator Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Select Duty Operator</span>
              </label>
              <span className="text-[10px] text-slate-400">Unique PIN per operator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {operators.map((op) => {
                const isSelected = selectedOpId === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setSelectedOpId(op.id);
                      setPin('');
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${
                        op.avatarColor || 'bg-sky-600'
                      } flex items-center justify-center text-white font-black text-xs uppercase shadow-xs shrink-0`}
                    >
                      {op.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {op.name}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {op.id}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {op.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input Section */}
          <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Security PIN for {currentSelectedOp.name}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPin ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              {/* PIN Display Field */}
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter 4-digit PIN..."
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-2.5 text-center text-lg sm:text-xl font-mono tracking-widest text-slate-100 placeholder:text-slate-600 transition"
                />
              </div>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Tactile SCADA Keypad */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="py-2.5 bg-slate-950 hover:bg-slate-800 active:bg-sky-900 border border-slate-800 hover:border-slate-600 rounded-lg text-sm sm:text-base font-mono font-bold text-slate-100 transition shadow-xs active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadClear}
                className="py-2.5 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800 rounded-lg text-xs font-mono font-bold text-rose-400 transition"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 active:bg-sky-900 border border-slate-800 hover:border-slate-600 rounded-lg text-sm sm:text-base font-mono font-bold text-slate-100 transition shadow-xs active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-300 transition"
              >
                ⌫ DEL
              </button>
            </div>

            {/* Quick Demo Credentials Assistant */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Operator Default Passcodes:
                </span>
                <span className="text-slate-500">Click to autofill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {operators.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleQuickPreset(op)}
                    className={`px-2 py-1 rounded border text-[10px] font-mono transition flex items-center gap-1 ${
                      selectedOpId === op.id
                        ? 'bg-sky-950 border-sky-700 text-sky-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{op.name.split(' ')[0]}:</span>
                    <span className="font-bold text-amber-300">{op.pin}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 active:scale-98 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Authorize & Sign In</span>
              </button>

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
