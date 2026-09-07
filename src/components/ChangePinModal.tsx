import React, { useState } from 'react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onSavePin: (newPin: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onSavePin,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentPin && oldPin !== currentPin) {
      setError('Current PIN does not match.');
      return;
    }

    if (newPin.length < 4) {
      setError('New PIN must be at least 4 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }

    onSavePin(newPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn cursor-pointer"
      />

      <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden z-10 animate-slideUp">
        {/* Header */}
        <div className="p-5 px-6 border-b border-white/5 flex justify-between items-center bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">pin</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Change Master PIN</h2>
              <p className="text-xs text-white/50">Update vault unlock passcode</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
              Current PIN
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={oldPin}
              onChange={(e) => {
                setError(null);
                setOldPin(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full bg-[#141414] border border-white/10 rounded-2xl px-4 py-2.5 text-center tracking-[0.5em] text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
              New 4-6 Digit PIN
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={newPin}
              onChange={(e) => {
                setError(null);
                setNewPin(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full bg-[#141414] border border-white/10 rounded-2xl px-4 py-2.5 text-center tracking-[0.5em] text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
              Confirm New PIN
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => {
                setError(null);
                setConfirmPin(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full bg-[#141414] border border-white/10 rounded-2xl px-4 py-2.5 text-center tracking-[0.5em] text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-full text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Update PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
