import React, { useState } from 'react';
import { Phone, MessageSquare, Save, X, RotateCcw, Send, CheckCircle2 } from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { smsDispatcher } from '../utils/smsNotifier';

interface EditSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditSmsModal: React.FC<EditSmsModalProps> = ({ isOpen, onClose }) => {
  const { smsRecipient, updateSmsRecipient, activeOperator } = useDispatch();
  const [phoneInput, setPhoneInput] = useState(smsRecipient);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    updateSmsRecipient(phoneInput.trim());
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  const handleResetDefault = () => {
    setPhoneInput('+2348067254663');
    updateSmsRecipient('+2348067254663');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  const handleSendTestSms = () => {
    smsDispatcher.sendSMS({
      title: 'TEST DISPATCH SMS',
      body: `FutureX 132/33kV SMS link test. Dispatch operator: ${activeOperator.name}. System online.`,
      type: 'TEST',
    });
    const uri = smsDispatcher.getNativeSmsUri(
      `[FutureX 132/33kV EMS] Test SMS alert for Operator ${activeOperator.name}. System healthy.`
    );
    window.open(uri, '_blank');
  };

  const history = smsDispatcher.getHistory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Edit SMS Text Alert Recipient
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure destination mobile phone for automated outage notifications
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

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Automated SMS Dispatch Phone Number:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+2348067254663"
                required
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded px-3 py-2 text-sm text-sky-400 font-bold focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="p-2 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SMS Recipient updated to {phoneInput} successfully!</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-slate-400 hover:text-slate-200 underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to default (+2348067254663)</span>
            </button>

            <button
              type="button"
              onClick={handleSendTestSms}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Test SMS Now</span>
            </button>
          </div>
        </form>

        {/* SMS Dispatch History */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Recent Automated SMS Log ({history.length})
            </span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin text-[11px]">
            {history.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No text messages dispatched yet.</p>
            ) : (
              history.slice(0, 10).map((msg) => (
                <div key={msg.id} className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="text-sky-400 font-bold">{msg.recipient}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-200 whitespace-pre-line text-[10px]">{msg.body}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
