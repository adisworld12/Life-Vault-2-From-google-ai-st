import React, { useState, useEffect, useRef } from 'react';
import { VaultItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: VaultItem[];
  onSelectItem: (item: VaultItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.fullNumber && item.fullNumber.toLowerCase().includes(q)) ||
      (item.fullName && item.fullName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden z-10 animate-slideUp">
        {/* Search Input Bar */}
        <div className="p-4 px-6 border-b border-white/5 flex items-center gap-3 bg-[#141414]">
          <span className="material-symbols-outlined text-indigo-400 text-[24px]">search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documents, IDs, subscriptions, policy numbers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-white placeholder-white/40 focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/40 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 divide-y divide-white/5">
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-3.5 hover:bg-white/5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.iconName || 'description'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {item.title}{' '}
                      {item.maskedNumber && (
                        <span className="font-mono text-white/40 text-xs ml-1">
                          {item.maskedNumber}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-white/40">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.urgencyDays !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'attention'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.urgencyDays} days
                    </span>
                  )}
                  <span className="material-symbols-outlined text-white/30 group-hover:text-indigo-400 transition-colors">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-white/40">
              <span className="material-symbols-outlined text-[36px] text-white/20">
                search_off
              </span>
              <p className="mt-2 text-xs">No matches found for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 px-6 bg-[#141414] border-t border-white/5 flex justify-between items-center text-xs text-white/40">
          <span>{results.length} records found</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
