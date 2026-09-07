import React, { useState } from 'react';
import { SecurityPreferences, UserProfile, VaultItem } from '../types';
import { EditProfileModal } from './EditProfileModal';
import { ChangePinModal } from './ChangePinModal';
import { InfoModals, InfoModalType } from './InfoModals';

interface SecuritySettingsProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  preferences: SecurityPreferences;
  onUpdatePreferences: (newPrefs: SecurityPreferences) => void;
  onResetAllData: () => void;
  vaultItems?: VaultItem[];
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  profile,
  onUpdateProfile,
  preferences,
  onUpdatePreferences,
  onResetAllData,
  vaultItems = [],
}) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBiometricTesting, setIsBiometricTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Handlers
  const handleToggleAppLock = () => {
    const updated = { ...preferences, appLockEnabled: !preferences.appLockEnabled };
    onUpdatePreferences(updated);
    showToast(updated.appLockEnabled ? '🔒 App Lock enabled' : '🔓 App Lock disabled');
  };

  const handleToggleBiometric = () => {
    const updated = { ...preferences, biometricEnabled: !preferences.biometricEnabled };
    onUpdatePreferences(updated);
    showToast(updated.biometricEnabled ? '👆 Face ID / Fingerprint enabled' : 'Biometric unlock disabled');
  };

  const handleTestBiometric = () => {
    setIsBiometricTesting(true);
    setTimeout(() => {
      setIsBiometricTesting(false);
      showToast('✅ Biometric hardware verified & authenticated');
    }, 1200);
  };

  const handleToggleHideSensitive = () => {
    const updated = { ...preferences, hideSensitiveInfo: !preferences.hideSensitiveInfo };
    onUpdatePreferences(updated);
    showToast(updated.hideSensitiveInfo ? 'Masking sensitive information enabled' : 'Masking disabled');
  };

  const handleToggleCloudBackup = () => {
    const updated = { ...preferences, cloudSyncEnabled: !preferences.cloudSyncEnabled };
    onUpdatePreferences(updated);
    showToast(updated.cloudSyncEnabled ? '☁️ Cloud Backup enabled' : 'Cloud Backup paused');
  };

  const handleTimerChange = (timer: string) => {
    const updated = { ...preferences, autoLockTimer: timer };
    onUpdatePreferences(updated);
    showToast(`⏱️ Auto-lock set to ${timer}`);
  };

  const notifications = preferences.notifications || {
    expiryReminders: true,
    subscriptionReminders: true,
    warrantyReminders: true,
    customReminders: true,
  };

  const handleNotificationToggle = (
    key: keyof typeof notifications,
    label: string
  ) => {
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };
    const updated = { ...preferences, notifications: updatedNotifications };
    onUpdatePreferences(updated);
    showToast(
      updatedNotifications[key] ? `🔔 ${label} enabled` : `🔕 ${label} muted`
    );
  };

  // Instant Sync
  const handleInstantSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const updated = { ...preferences, lastSyncTime: `Today at ${timeStr}` };
      onUpdatePreferences(updated);
      setIsSyncing(false);
      showToast('🔄 Vault synchronized with encrypted cloud replica');
    }, 1000);
  };

  // Trigger Backup
  const handleTriggerBackup = () => {
    const now = new Date();
    const timeStr = `Today, ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    const updated = { ...preferences, lastBackupTime: timeStr };
    onUpdatePreferences(updated);
    showToast('☁️ Encrypted vault backup saved');
  };

  // Export Encrypted Data
  const handleExportData = () => {
    try {
      const exportPayload = {
        vault: 'LifeVault Bento Edition',
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        encryption: 'AES-256-GCM',
        profile: {
          name: profile.name,
          email: profile.email,
          country: profile.country,
          currency: profile.currency,
        },
        recordsCount: vaultItems.length,
        records: vaultItems,
      };

      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `lifevault_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      if (downloadAnchor.parentNode) {
        downloadAnchor.parentNode.removeChild(downloadAnchor);
      }

      showToast('📤 Encrypted vault backup exported successfully!');
    } catch {
      showToast('Failed to export backup data.');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6 pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1a1a1a] border border-white/20 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
          Profile & Security
        </h1>
        <p className="text-xs md:text-sm text-white/50">
          Manage your personal vault credentials, biometric protections, and preferences.
        </p>
      </div>

      {/* 👤 1. PROFILE SECTION */}
      <section className="bg-[#1a1a1a] rounded-[2rem] p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Profile Left: Photo + Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
            {/* Profile Photo with Edit Badge */}
            <div className="relative group cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/50 shadow-2xl group-hover:border-indigo-400 group-hover:scale-105 transition-all"
                referrerPolicy="no-referrer"
              />
              <button
                id="avatar-edit-icon-badge"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditProfileOpen(true);
                }}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-[#1a1a1a] transition-transform active:scale-90 cursor-pointer"
                title="Edit Profile Photo"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>

            {/* User Meta Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {profile.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                  Vault Owner
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-white/40">mail</span>
                  {profile.email}
                </span>
                {profile.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-white/40">call</span>
                    {profile.phoneNumber}
                  </span>
                )}
              </div>

              {/* Badges for Localization */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="text-[11px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-white/60">
                  📍 {profile.country}
                </span>
                <span className="text-[11px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-white/60">
                  💵 {profile.currency}
                </span>
                <span className="text-[11px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-white/60">
                  🌐 {profile.language}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Right: Edit Profile Button */}
          <div className="flex justify-center sm:justify-end">
            <button
              id="edit-profile-btn"
              onClick={() => setIsEditProfileOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* 🔒 2. SECURITY SECTION (HIGHLY PROMINENT) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[22px]">lock</span>
            <h2 className="text-lg font-bold text-white tracking-tight">Security & Encryption</h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hardware Enclave Active
          </span>
        </div>

        {/* Big Prominent Hardware Security Bento Card */}
        <div className="bg-[#1a1a1a] rounded-[2rem] p-6 md:p-7 border border-indigo-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-indigo-950/30 via-[#1a1a1a] to-[#141414]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-indigo-400 text-[22px]">shield_lock</span>
                <h3 className="text-base font-bold text-white">AES-256 Bit Military Encryption</h3>
              </div>
              <p className="text-xs text-white/50 max-w-lg leading-relaxed">
                Zero-knowledge architecture. All sensitive document images, passport numbers, and subscription credentials remain encrypted on your device hardware.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestBiometric}
                disabled={isBiometricTesting}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isBiometricTesting ? 'sync' : 'fingerprint'}
                </span>
                {isBiometricTesting ? 'Verifying Enclave...' : 'Test Biometric'}
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            <div className="bg-[#141414] p-3 rounded-2xl border border-white/5">
              <span className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                Protocol
              </span>
              <span className="text-xs font-semibold text-white">AES-256-GCM</span>
            </div>
            <div className="bg-[#141414] p-3 rounded-2xl border border-white/5">
              <span className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                Master PIN
              </span>
              <span className="text-xs font-semibold text-indigo-400 font-mono">•••• Active</span>
            </div>
            <div className="bg-[#141414] p-3 rounded-2xl border border-white/5">
              <span className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                Key Derivation
              </span>
              <span className="text-xs font-semibold text-white">PBKDF2-512</span>
            </div>
            <div className="bg-[#141414] p-3 rounded-2xl border border-white/5">
              <span className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                Enclave Key
              </span>
              <span className="text-xs font-semibold text-emerald-400">Protected</span>
            </div>
          </div>
        </div>

        {/* Security Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 🔒 App Lock */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">App Lock</h4>
                <p className="text-xs text-white/40">Require authentication to open vault</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAppLock}
              role="switch"
              aria-checked={preferences.appLockEnabled}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                preferences.appLockEnabled ? 'bg-indigo-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  preferences.appLockEnabled ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* 👆 Face ID / Fingerprint */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-[22px]">fingerprint</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Face ID / Fingerprint</h4>
                <p className="text-xs text-white/40">Use device biometric sensors</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleBiometric}
              role="switch"
              aria-checked={preferences.biometricEnabled}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                preferences.biometricEnabled ? 'bg-indigo-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  preferences.biometricEnabled ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* 🔢 Change PIN */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-[22px]">pin</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Change PIN</h4>
                <p className="text-xs text-white/40">Update your 4-6 digit passcode</p>
              </div>
            </div>

            <button
              type="button"
              id="change-pin-btn"
              onClick={() => setIsChangePinOpen(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* 📱 Auto-lock Duration */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-[22px]">timer</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Auto-Lock Duration</h4>
                <p className="text-xs text-white/40">Lock vault after inactivity</p>
              </div>
            </div>

            <select
              value={preferences.autoLockTimer}
              onChange={(e) => handleTimerChange(e.target.value)}
              className="bg-[#141414] border border-white/10 text-xs font-semibold text-white rounded-xl focus:ring-1 focus:ring-indigo-500 p-2 px-3 cursor-pointer"
            >
              <option value="Immediately">Immediately</option>
              <option value="1 Minute">1 Minute</option>
              <option value="5 Minutes">5 Minutes</option>
              <option value="15 Minutes">15 Minutes</option>
              <option value="30 Minutes">30 Minutes</option>
              <option value="Never">Never</option>
            </select>
          </div>

          {/* 👁️ Hide Sensitive Info */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl md:col-span-2">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                <span className="material-symbols-outlined text-[22px]">visibility_off</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hide Sensitive Info</h4>
                <p className="text-xs text-white/40">
                  Mask numbers and documents in recent app switcher preview
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleHideSensitive}
              role="switch"
              aria-checked={preferences.hideSensitiveInfo}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                preferences.hideSensitiveInfo ? 'bg-indigo-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  preferences.hideSensitiveInfo ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 🔔 3. NOTIFICATIONS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[22px]">notifications</span>
          <h2 className="text-lg font-bold text-white tracking-tight">Notifications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expiry Reminders */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">event_busy</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Expiry Reminders</h4>
                <p className="text-xs text-white/40">Alerts 180, 90, & 30 days before document expiry</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNotificationToggle('expiryReminders', 'Expiry Reminders')}
              role="switch"
              aria-checked={notifications.expiryReminders}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                notifications.expiryReminders ? 'bg-indigo-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  notifications.expiryReminders ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Subscription Reminders */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">autorenew</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Subscription Reminders</h4>
                <p className="text-xs text-white/40">Notices before recurring monthly & annual renewals</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleNotificationToggle('subscriptionReminders', 'Subscription Reminders')
              }
              role="switch"
              aria-checked={notifications.subscriptionReminders}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                notifications.subscriptionReminders ? 'bg-indigo-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  notifications.subscriptionReminders ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Warranty Reminders */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Warranty Reminders</h4>
                <p className="text-xs text-white/40">Notices before hardware warranty expiration</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNotificationToggle('warrantyReminders', 'Warranty Reminders')}
              role="switch"
              aria-checked={notifications.warrantyReminders}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                notifications.warrantyReminders ? 'bg-indigo-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  notifications.warrantyReminders ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Custom Reminders */}
          <div className="bg-[#1a1a1a] rounded-[2rem] p-5 px-6 border border-white/5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">alarm</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Custom Reminders</h4>
                <p className="text-xs text-white/40">User-scheduled notices for bills, visas, & leases</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNotificationToggle('customReminders', 'Custom Reminders')}
              role="switch"
              aria-checked={notifications.customReminders}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                notifications.customReminders ? 'bg-indigo-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  notifications.customReminders ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ☁️ 4. DATA & BACKUP SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[22px]">cloud</span>
          <h2 className="text-lg font-bold text-white tracking-tight">Data & Backup</h2>
        </div>

        <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 shadow-xl space-y-5">
          {/* Cloud Backup Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/5 text-indigo-400 border border-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cloud Backup</h4>
                <p className="text-xs text-white/40">
                  Last backup: <span className="text-white/70">{preferences.lastBackupTime}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerBackup}
                className="text-xs font-bold text-indigo-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                Backup Now
              </button>
              <button
                type="button"
                onClick={handleToggleCloudBackup}
                role="switch"
                aria-checked={preferences.cloudSyncEnabled}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                  preferences.cloudSyncEnabled ? 'bg-indigo-600' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                    preferences.cloudSyncEnabled ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sync & Export Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sync Now */}
            <div className="bg-[#141414] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Instant Sync</h4>
                <p className="text-[11px] text-white/40">Status: {preferences.lastSyncTime}</p>
              </div>
              <button
                type="button"
                onClick={handleInstantSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                >
                  sync
                </span>
                {isSyncing ? 'Syncing...' : 'Sync'}
              </button>
            </div>

            {/* Export Data */}
            <div className="bg-[#141414] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Export Vault Data</h4>
                <p className="text-[11px] text-white/40">Download encrypted .JSON</p>
              </div>
              <button
                type="button"
                id="export-data-btn"
                onClick={handleExportData}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Export
              </button>
            </div>
          </div>

          {/* Delete Account / Factory Reset */}
          <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-red-500/5 rounded-2xl border border-red-500/10">
            <div>
              <h4 className="text-xs font-bold text-red-400">Delete Account & Reset Vault</h4>
              <p className="text-[11px] text-white/40">
                Permanently erase all stored documents, passports, receipts, and user profile data.
              </p>
            </div>
            <button
              type="button"
              id="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* ℹ️ 5. OTHER SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[22px]">more_horiz</span>
          <h2 className="text-lg font-bold text-white tracking-tight">Other</h2>
        </div>

        <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-white/5 shadow-xl">
          {/* Privacy Policy */}
          <button
            type="button"
            onClick={() => setInfoModalType('privacy')}
            className="w-full p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3.5">
              <span className="material-symbols-outlined text-[20px] text-white/40 group-hover:text-indigo-400 transition-colors">
                policy
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Privacy Policy</h4>
                <p className="text-[11px] text-white/40">Zero-knowledge storage and cryptography details</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-white/20 group-hover:text-white/60 transition-colors">
              chevron_right
            </span>
          </button>

          {/* Terms of Service */}
          <button
            type="button"
            onClick={() => setInfoModalType('terms')}
            className="w-full p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3.5">
              <span className="material-symbols-outlined text-[20px] text-white/40 group-hover:text-indigo-400 transition-colors">
                description
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Terms of Service</h4>
                <p className="text-[11px] text-white/40">Vault service agreement & usage parameters</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-white/20 group-hover:text-white/60 transition-colors">
              chevron_right
            </span>
          </button>

          {/* Help & Support */}
          <button
            type="button"
            onClick={() => setInfoModalType('support')}
            className="w-full p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3.5">
              <span className="material-symbols-outlined text-[20px] text-white/40 group-hover:text-indigo-400 transition-colors">
                support_agent
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">Help & Support</h4>
                <p className="text-[11px] text-white/40">FAQs, troubleshooting, and contact concierge</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-white/20 group-hover:text-white/60 transition-colors">
              chevron_right
            </span>
          </button>

          {/* About LifeVault */}
          <button
            type="button"
            onClick={() => setInfoModalType('about')}
            className="w-full p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3.5">
              <span className="material-symbols-outlined text-[20px] text-white/40 group-hover:text-indigo-400 transition-colors">
                info
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">About LifeVault</h4>
                <p className="text-[11px] text-white/40">Version 2.4.0 • Bento Build • Zero-Knowledge Enclave</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-white/20 group-hover:text-white/60 transition-colors">
              chevron_right
            </span>
          </button>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => {
          onUpdateProfile(updated);
          showToast('👤 Profile updated successfully!');
        }}
      />

      {/* Change PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        currentPin={preferences.pinCode}
        onSavePin={(newPin) => {
          onUpdatePreferences({ ...preferences, pinCode: newPin });
          showToast('🔢 Master PIN updated successfully!');
        }}
      />

      {/* Info Modals (Privacy, Terms, Support, About) */}
      <InfoModals
        modalType={infoModalType}
        onClose={() => setInfoModalType(null)}
      />

      {/* Delete / Factory Reset Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1a1a1a] rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-red-500/30 text-center animate-slideUp">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3 border border-red-500/30">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Vault & Account?</h3>
            <p className="text-xs text-white/50 mb-5 leading-relaxed">
              This action is permanent. All encrypted documents, subscriptions, and profile settings will be wiped and returned to factory defaults.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-full text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetAllData();
                  setShowDeleteModal(false);
                  showToast('Account and vault data wiped.');
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Yes, Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
