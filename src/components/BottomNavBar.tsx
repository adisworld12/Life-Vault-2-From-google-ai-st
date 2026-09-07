import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  alertCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  alertCount = 2,
}) => {
  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-3 py-2 bg-[#1a1a1a]/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] md:hidden">
        {/* Home */}
        <button
          id="nav-home-mobile"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center rounded-2xl px-3.5 py-1.5 active:scale-90 transition-all duration-200 cursor-pointer ${
            activeTab === 'home'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
          >
            home
          </span>
          <span className="text-[11px] font-medium mt-0.5">Home</span>
        </button>

        {/* Vault */}
        <button
          id="nav-vault-mobile"
          onClick={() => onSelectTab('vault')}
          className={`flex flex-col items-center justify-center rounded-2xl px-3.5 py-1.5 active:scale-90 transition-all duration-200 cursor-pointer ${
            activeTab === 'vault'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'vault' ? "'FILL' 1" : "'FILL' 0" }}
          >
            folder_managed
          </span>
          <span className="text-[11px] font-medium mt-0.5">Vault</span>
        </button>

        {/* Scanner */}
        <button
          id="nav-scanner-mobile"
          onClick={() => onSelectTab('scanner')}
          className={`flex flex-col items-center justify-center rounded-2xl px-3.5 py-1.5 active:scale-90 transition-all duration-200 cursor-pointer ${
            activeTab === 'scanner'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'scanner' ? "'FILL' 1" : "'FILL' 0" }}
          >
            document_scanner
          </span>
          <span className="text-[11px] font-medium mt-0.5">Scanner</span>
        </button>

        {/* Alerts */}
        <button
          id="nav-alerts-mobile"
          onClick={() => onSelectTab('alerts')}
          className={`flex flex-col items-center justify-center rounded-2xl px-3.5 py-1.5 active:scale-90 transition-all duration-200 cursor-pointer relative ${
            activeTab === 'alerts'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'alerts' ? "'FILL' 1" : "'FILL' 0" }}
          >
            notifications
          </span>
          {alertCount > 0 && activeTab !== 'alerts' && (
            <span className="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1a1a]" />
          )}
          <span className="text-[11px] font-medium mt-0.5">Alerts</span>
        </button>

        {/* Profile / Security */}
        <button
          id="nav-profile-mobile"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center rounded-2xl px-3.5 py-1.5 active:scale-90 transition-all duration-200 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
          >
            person
          </span>
          <span className="text-[11px] font-medium mt-0.5">Profile</span>
        </button>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-[#141414] border-r border-white/10 flex-col py-6 z-30 shadow-2xl">
        <div className="px-6 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            L
          </div>
          <div>
            <div className="text-[18px] font-bold text-white tracking-tight">LifeVault</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Bento Edition</div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <button
            id="desktop-add-record-btn"
            onClick={onOpenAddModal}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold rounded-2xl py-3 px-4 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-indigo-400/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Record
          </button>
        </div>

        <div className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <button
            id="desktop-nav-home"
            onClick={() => onSelectTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#1f1f1f] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${activeTab === 'home' ? 'text-indigo-400' : ''}`}
              style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
            >
              home
            </span>
            <span className="text-[13px]">Home Dashboard</span>
          </button>

          <button
            id="desktop-nav-vault"
            onClick={() => onSelectTab('vault')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-[#1f1f1f] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${activeTab === 'vault' ? 'text-indigo-400' : ''}`}
              style={{ fontVariationSettings: activeTab === 'vault' ? "'FILL' 1" : "'FILL' 0" }}
            >
              folder_managed
            </span>
            <span className="text-[13px]">Vault Repository</span>
          </button>

          <button
            id="desktop-nav-scanner"
            onClick={() => onSelectTab('scanner')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-[#1f1f1f] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${activeTab === 'scanner' ? 'text-indigo-400' : ''}`}
              style={{ fontVariationSettings: activeTab === 'scanner' ? "'FILL' 1" : "'FILL' 0" }}
            >
              document_scanner
            </span>
            <span className="text-[13px]">AI Document Scanner</span>
          </button>

          <button
            id="desktop-nav-alerts"
            onClick={() => onSelectTab('alerts')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#1f1f1f] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[20px] ${activeTab === 'alerts' ? 'text-indigo-400' : ''}`}
                style={{ fontVariationSettings: activeTab === 'alerts' ? "'FILL' 1" : "'FILL' 0" }}
              >
                notifications
              </span>
              <span className="text-[13px]">Alerts & Notices</span>
            </div>
            {alertCount > 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'alerts' ? 'bg-indigo-500 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {alertCount}
              </span>
            )}
          </button>

          <button
            id="desktop-nav-profile"
            onClick={() => onSelectTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#1f1f1f] text-white font-semibold border border-white/10 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${activeTab === 'profile' ? 'text-indigo-400' : ''}`}
              style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
            >
              manage_accounts
            </span>
            <span className="text-[13px]">Profile & Security</span>
          </button>
        </div>

        {/* Security badge at bottom of sidebar */}
        <div className="px-4 pt-4 border-t border-white/10">
          <div className="bg-[#1a1a1a] border border-white/5 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-white">AES-256 Protocol</div>
              <div className="text-[10px] text-white/40">Vault Enclave Secure</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
