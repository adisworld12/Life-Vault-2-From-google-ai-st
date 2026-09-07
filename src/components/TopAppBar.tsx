import React from 'react';
import { USER_AVATAR_URL } from '../data/mockData';
import { ActiveTab, ActiveView } from '../types';

interface TopAppBarProps {
  activeView: ActiveView;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onBack?: () => void;
  title?: string;
  avatarUrl?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  activeView,
  onNavigateTab,
  onOpenSearch,
  onBack,
  title,
  avatarUrl,
}) => {
  const isDetailView = activeView === 'document-detail' || activeView === 'subscription-detail' || activeView === 'item-detail';
  const effectiveAvatar = avatarUrl || USER_AVATAR_URL;

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/10 shadow-xs">
      <div className="flex justify-between items-center px-4 md:px-6 h-16 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          {isDetailView ? (
            <button
              id="back-button"
              onClick={onBack}
              className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95 border border-transparent hover:border-white/10"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          ) : (
            <button
              id="profile-avatar-btn"
              onClick={() => onNavigateTab('profile')}
              className="flex items-center gap-2 cursor-pointer focus:outline-none ring-2 ring-transparent hover:ring-indigo-500/50 rounded-full transition-all"
              title="Security & Profile Settings"
            >
              <img
                src={effectiveAvatar}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-xs"
                referrerPolicy="no-referrer"
              />
            </button>
          )}

          <div
            onClick={() => onNavigateTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="text-[20px] md:text-[22px] font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
              {title || 'LifeVault'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="search-btn"
            onClick={onOpenSearch}
            className="bg-[#1a1a1a] hover:bg-[#252525] text-white/70 hover:text-white border border-white/10 transition-colors rounded-full p-2.5 active:scale-95 duration-150 flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Search"
            title="Search Vault"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          
          {isDetailView && (
            <button
              id="detail-avatar-btn"
              onClick={() => onNavigateTab('profile')}
              className="w-8 h-8 rounded-full overflow-hidden border border-white/20 ml-1 cursor-pointer hover:border-indigo-400 transition-colors"
              title="Profile"
            >
              <img
                src={effectiveAvatar}
                alt="User avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
