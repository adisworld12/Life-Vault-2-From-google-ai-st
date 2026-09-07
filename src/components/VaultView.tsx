import React, { useState } from 'react';
import { VaultItem, VaultItemType } from '../types';

interface VaultViewProps {
  items: VaultItem[];
  onSelectItem: (item: VaultItem) => void;
  onOpenAddModal: () => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  items,
  onSelectItem,
  onOpenAddModal,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.notes && item.notes.toLowerCase().includes(query)) ||
      (item.fullNumber && item.fullNumber.toLowerCase().includes(query));
    return matchesType && matchesQuery;
  });

  const categories: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Items', count: items.length },
    {
      id: 'document',
      label: 'Documents',
      count: items.filter((i) => i.type === 'document').length,
    },
    {
      id: 'subscription',
      label: 'Subscriptions',
      count: items.filter((i) => i.type === 'subscription').length,
    },
    {
      id: 'warranty',
      label: 'Warranties',
      count: items.filter((i) => i.type === 'warranty').length,
    },
    {
      id: 'bill',
      label: 'Bills',
      count: items.filter((i) => i.type === 'bill').length,
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6 pb-28">
      {/* Header with Title and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Vault Repository
          </h1>
          <p className="text-sm text-white/50">
            {items.length} encrypted records under high-security custody
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Entry
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-3 text-white/40 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by title, number, tag or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-white/40 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                filterType === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                  : 'bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterType === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Item List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="bg-[#1a1a1a] border border-white/5 hover:border-white/20 rounded-[2rem] p-5 shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:bg-[#202020] flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform group-hover:border-indigo-400/40">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.iconName || 'description'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/40">{item.subtitle}</p>
                  </div>
                </div>

                {item.status === 'attention' ? (
                  <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Alert
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Vaulted
                  </span>
                )}
              </div>

              {item.notes && (
                <p className="text-xs text-white/60 line-clamp-2 my-2 leading-relaxed">
                  {item.notes}
                </p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
              <div className="text-white/40">
                {item.expiryDate && <span>Expires: {item.expiryDate}</span>}
                {item.cost && <span className="text-white font-medium">Cost: ${item.cost.toFixed(2)}/mo</span>}
              </div>

              <div className="flex items-center gap-1 text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                View
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-[2rem] border border-dashed border-white/10 p-8 shadow-xl">
          <span className="material-symbols-outlined text-[48px] text-white/30">folder_off</span>
          <h3 className="text-base font-bold text-white mt-2">No matching records found</h3>
          <p className="text-xs text-white/40 mt-1 mb-4">
            Try adjusting your search filter or add a new record.
          </p>
          <button
            onClick={onOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-xs font-bold"
          >
            Add New Item
          </button>
        </div>
      )}
    </main>
  );
};
