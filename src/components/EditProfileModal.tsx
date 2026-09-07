import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVATAR_PRESETS } from '../data/mockData';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

const COUNTRIES = [
  'United States',
  'Bangladesh',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'United Arab Emirates',
  'India',
  'Netherlands',
  'Sweden',
  'Switzerland',
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($) — US Dollar' },
  { code: 'BDT', symbol: '৳', label: 'BDT (৳) — Bangladeshi Taka' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) — Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — British Pound' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$) — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) — Australian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) — Japanese Yen' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) — Indian Rupee' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$) — Singapore Dollar' },
  { code: 'AED', symbol: 'AED', label: 'AED (د.إ) — UAE Dirham' },
];

const LANGUAGES = [
  { code: 'English', label: 'English (US & UK)' },
  { code: 'Bengali', label: 'Bengali (বাংলা)' },
  { code: 'Spanish', label: 'Spanish (Español)' },
  { code: 'French', label: 'French (Français)' },
  { code: 'German', label: 'German (Deutsch)' },
  { code: 'Japanese', label: 'Japanese (日本語)' },
  { code: 'Arabic', label: 'Arabic (العربية)' },
];

const TIME_ZONES = [
  'America/New_York (EST / GMT-5)',
  'America/Chicago (CST / GMT-6)',
  'America/Denver (MST / GMT-7)',
  'America/Los_Angeles (PST / GMT-8)',
  'Asia/Dhaka (BST / GMT+6)',
  'Europe/London (GMT / GMT+0)',
  'Europe/Paris (CET / GMT+1)',
  'Europe/Berlin (CET / GMT+1)',
  'Asia/Dubai (GST / GMT+4)',
  'Asia/Kolkata (IST / GMT+5:30)',
  'Asia/Singapore (SGT / GMT+8)',
  'Asia/Tokyo (JST / GMT+9)',
  'Australia/Sydney (AEST / GMT+10)',
  'UTC (Coordinated Universal Time)',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSaveProfile(formData);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn cursor-pointer"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden z-10 animate-slideUp max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 px-6 border-b border-white/5 flex justify-between items-center bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Edit Profile</h2>
              <p className="text-xs text-white/50">Update your vault identity and localization</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Profile Photo Section */}
          <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 space-y-4">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
              Profile Photo
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Preview with Edit Badge */}
              <div className="relative group shrink-0">
                <img
                  src={formData.avatarUrl || AVATAR_PRESETS[0]}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/50 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-[#141414] transition-transform active:scale-95"
                  title="Upload photo"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </label>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Avatar Preset Options */}
              <div className="flex-1 w-full space-y-2">
                <span className="text-xs text-white/60 block">Choose an avatar or upload custom:</span>
                <div className="flex flex-wrap gap-2 items-center">
                  {AVATAR_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: preset })}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        formData.avatarUrl === preset
                          ? 'border-indigo-500 scale-110 shadow-md ring-2 ring-indigo-500/30'
                          : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${index + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">link</span>
                    {showUrlInput ? 'Hide URL' : 'Image URL'}
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex gap-2 pt-2 animate-fadeIn">
                    <input
                      type="url"
                      placeholder="Paste image link https://..."
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customPhotoUrl) {
                          setFormData({ ...formData, avatarUrl: customPhotoUrl });
                          setCustomPhotoUrl('');
                          setShowUrlInput(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arif Ahmed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                  mail
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. arif@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                  call
                </span>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 789-0123"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Date of Birth (Optional) */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                Date of Birth <span className="text-white/30 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                  calendar_today
                </span>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Localization & Preferences Grid */}
          <div className="border-t border-white/5 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Localization & Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                  Country
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                    public
                  </span>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-[#1a1a1a] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-3 text-[18px] text-white/30 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Preferred Currency */}
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                  Preferred Currency
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                    payments
                  </span>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code} className="bg-[#1a1a1a] text-white">
                        {curr.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-3 text-[18px] text-white/30 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                  Language
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                    language
                  </span>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-[#1a1a1a] text-white">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-3 text-[18px] text-white/30 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Time Zone */}
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
                  Time Zone
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-white/30">
                    schedule
                  </span>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                  >
                    {TIME_ZONES.map((tz) => (
                      <option key={tz} value={tz} className="bg-[#1a1a1a] text-white">
                        {tz}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-3 text-[18px] text-white/30 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-white/10 hover:bg-white/5 rounded-full text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-profile-btn"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 border border-indigo-400/20 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
