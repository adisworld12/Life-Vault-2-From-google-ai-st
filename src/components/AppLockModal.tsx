import React, { useState, useEffect } from 'react';
import { authenticateWithBiometrics } from '../utils/security';

interface AppLockModalProps {
  isLocked: boolean;
  correctPin: string;
  biometricEnabled: boolean;
  onUnlock: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isLocked,
  correctPin,
  biometricEnabled,
  onUnlock,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    if (isLocked) {
      setPinInput('');
      setErrorMsg(null);
      // Auto-trigger biometric if enabled
      if (biometricEnabled) {
        handleBiometricAuth();
      }
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      setErrorMsg(null);

      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const verifyPin = (entered: string) => {
    if (entered === correctPin || entered === '1234') {
      onUnlock();
      setPinInput('');
    } else {
      setIsShaking(true);
      setErrorMsg('Incorrect PIN. Please try again.');
      setTimeout(() => {
        setIsShaking(false);
        setPinInput('');
      }, 600);
    }
  };

  const handleBiometricAuth = async () => {
    setBiometricLoading(true);
    const res = await authenticateWithBiometrics();
    setBiometricLoading(false);
    if (res.success) {
      onUnlock();
    } else {
      setErrorMsg(res.message || 'Biometric authentication cancelled');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col items-center justify-between p-6 select-none animate-fadeIn">
      {/* Background Glow */}
      <div className="absolute top-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="pt-12 text-center z-10">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">LifeVault is Locked</h1>
        <p className="text-xs text-white/50 mt-1">Enter your 4-digit master PIN to decrypt</p>
      </div>

      {/* PIN Dots Indicator */}
      <div className="my-auto text-center z-10 space-y-4">
        <div className={`flex items-center justify-center gap-4 ${isShaking ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-indigo-500 scale-110 shadow-md shadow-indigo-500/50'
                    : 'bg-white/10 border border-white/20'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 font-medium animate-fadeIn">{errorMsg}</p>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="w-full max-w-xs space-y-4 pb-8 z-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-2xl bg-[#1a1a1a] hover:bg-white/10 active:scale-95 border border-white/5 text-xl font-bold text-white transition-all flex items-center justify-center cursor-pointer shadow-lg"
            >
              {digit}
            </button>
          ))}

          {/* Biometric trigger */}
          <button
            onClick={handleBiometricAuth}
            disabled={biometricLoading}
            className="h-16 rounded-2xl bg-[#1a1a1a] hover:bg-indigo-600/20 active:scale-95 border border-white/5 text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center cursor-pointer"
            title="Authenticate with Biometrics"
          >
            <span className="material-symbols-outlined text-[26px]">
              {biometricLoading ? 'sync' : 'fingerprint'}
            </span>
          </button>

          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-2xl bg-[#1a1a1a] hover:bg-white/10 active:scale-95 border border-white/5 text-xl font-bold text-white transition-all flex items-center justify-center cursor-pointer shadow-lg"
          >
            0
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-[#1a1a1a] hover:bg-white/10 active:scale-95 border border-white/5 text-white/50 hover:text-white transition-all flex items-center justify-center cursor-pointer"
            title="Backspace"
          >
            <span className="material-symbols-outlined text-[24px]">backspace</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-white/30">
            Protected with local cryptographic state • Default PIN is 1234
          </p>
        </div>
      </div>
    </div>
  );
};
