import React from 'react';
import { VaultItem } from '../types';

interface HomeDashboardProps {
  items: VaultItem[];
  onSelectItem: (item: VaultItem) => void;
  onViewAllUpcoming: () => void;
  onOpenAddModal: () => void;
  userName?: string;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  items,
  onSelectItem,
  onViewAllUpcoming,
  onOpenAddModal,
  userName = 'Arif',
}) => {
  // Compute greeting dynamically based on current time
  const hour = new Date().getHours();
  let greetingTime = 'Good Morning';
  if (hour >= 12 && hour < 17) greetingTime = 'Good Afternoon';
  else if (hour >= 17) greetingTime = 'Good Evening';

  const firstName = userName.trim().split(' ')[0] || 'Arif';

  // Filter Attention Needed items (urgency <= 30 days or status is attention)
  const attentionItems = items.filter(
    (item) => item.status === 'attention' || (item.urgencyDays !== undefined && item.urgencyDays <= 30)
  );

  // Filter Upcoming items
  const upcomingItems = items.filter(
    (item) => item.status !== 'attention' && (item.urgencyDays === undefined || item.urgencyDays > 30)
  );

  const documents = items.filter((i) => i.type === 'document');
  const subscriptions = items.filter((i) => i.type === 'subscription');
  const warranties = items.filter((i) => i.type === 'warranty');

  // Compute subscription totals
  const totalMonthlyCost = subscriptions.reduce((acc, curr) => {
    const cost = curr.cost || 0;
    if (curr.billingCycle === 'Yearly') return acc + cost / 12;
    if (curr.billingCycle === 'Weekly') return acc + cost * 4.33;
    return acc + cost;
  }, 0);

  const totalYearlyCost = totalMonthlyCost * 12;

  return (
    <main className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6 pb-32">
      {/* Bento Grid Header & Metric Showcase */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Bento Hero Card (col-span-2) */}
        <div className="md:col-span-2 bg-[#1a1a1a] rounded-[2rem] p-7 border border-white/5 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/30">
                Encrypted Vault Active
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Local & Cloud Ready
              </span>
            </div>

            <h1 id="home-greeting" className="text-3xl font-bold mt-4 text-white tracking-tight leading-tight">
              {greetingTime}, {firstName}
            </h1>
            <p className="text-white/50 mt-2 text-sm max-w-sm">
              Your identity credentials, warranties, and active subscriptions are guarded with intelligent expiry tracking.
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="text-xs font-medium">
                <span className="text-indigo-400 font-bold">{items.length} Records</span>
                <span className="text-white/40 ml-1.5">in secure vault</span>
              </div>
            </div>

            <button
              onClick={onOpenAddModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Record
            </button>
          </div>

          {/* Ambient Glow */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-600/15 blur-[80px] rounded-full pointer-events-none" />
        </div>

        {/* Bento Stat Card 1: Urgent Alerts */}
        <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 flex flex-col justify-between items-center text-center relative overflow-hidden group shadow-lg">
          <div className="w-full flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Action Needed</span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>

          <div className="my-2">
            <div className="text-4xl font-bold text-red-400 tracking-tight">{attentionItems.length}</div>
            <p className="text-xs text-white/60 font-medium mt-1">Pending Expiries</p>
          </div>

          <div className="w-full flex gap-1 justify-center items-end h-6 pt-2">
            <div className="w-1.5 h-3 bg-red-400/30 rounded-full" />
            <div className="w-1.5 h-5 bg-red-400/60 rounded-full" />
            <div className="w-1.5 h-4 bg-red-400/40 rounded-full" />
            <div className="w-1.5 h-6 bg-red-400 rounded-full" />
          </div>
        </div>

        {/* Bento Stat Card 2: Subscriptions Overview */}
        <div className="bg-[#1a1a1a] rounded-[2rem] p-6 border border-white/5 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-lg">
          <div className="w-full flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Subscriptions</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              ${totalMonthlyCost.toFixed(0)}/mo
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-bold text-indigo-400 tracking-tight">
              ${totalYearlyCost.toFixed(0)}
            </div>
            <p className="text-xs text-white/60 font-medium mt-1">Yearly Projected</p>
          </div>

          <div className="w-full flex justify-between items-center text-[10px] text-white/40 border-t border-white/5 pt-2">
            <span>{subscriptions.length} active plans</span>
            <span>{warranties.length} warranties</span>
          </div>
        </div>
      </section>

      {/* Attention Needed (Bento Red / Urgent Theme) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">Attention Needed</h2>
          </div>
          <span className="text-red-400 text-xs font-bold bg-red-500/15 border border-red-500/20 px-2.5 py-0.5 rounded-full">
            {attentionItems.length} items
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-white/5 rounded-[2rem] p-6 text-center text-white/40 text-xs">
            <span className="material-symbols-outlined text-emerald-400 text-[28px] mb-1 block">
              check_circle
            </span>
            All documents, subscriptions, and warranties are in good standing. No urgent expiries detected.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionItems.map((item) => {
              const days = item.urgencyDays ?? 0;
              const isSub = item.type === 'subscription';

              return (
                <div
                  key={item.id}
                  id={`alert-card-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="bg-[#1a1a1a] border border-red-500/30 hover:border-red-400 p-5 rounded-[2rem] shadow-lg transition-all duration-200 relative overflow-hidden cursor-pointer group hover:bg-[#202020]"
                >
                  {/* Left accent bar */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />

                  <div className="flex justify-between items-start pl-2">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-white/5 rounded-md text-[11px] font-semibold text-white/70">
                          {item.category}
                        </span>
                        {item.expiryDate && (
                          <span className="text-[10px] text-red-400 font-mono">
                            {item.expiryDate}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-red-300 transition-colors">
                        {item.title}{' '}
                        {item.maskedNumber && (
                          <span className="font-normal text-white/40 text-sm ml-1">
                            {item.maskedNumber}
                          </span>
                        )}
                      </h3>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">
                              {isSub ? 'autorenew' : 'timer'}
                            </span>
                            {isSub
                              ? `Renews in ${days === 0 ? 'today' : `${days} day${days > 1 ? 's' : ''}`}${item.cost ? ` — $${item.cost.toFixed(2)}` : ''}`
                              : `Expires in ${days === 0 ? 'today' : `${days} day${days > 1 ? 's' : ''}`}`}
                          </span>
                        </div>
                        {item.expiryDate && (
                          <span className="text-xs text-white/40 pl-1">
                            Exact Date: {item.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-white/60 group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming Lifecycle Events */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[20px]">
              event_upcoming
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Upcoming Lifecycle Events</h2>
          </div>
          <button
            id="view-all-upcoming-btn"
            onClick={onViewAllUpcoming}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer py-1 px-3 rounded-full hover:bg-white/5 transition-colors border border-white/5"
          >
            View Repository
          </button>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden divide-y divide-white/5">
          {upcomingItems.length === 0 ? (
            <div className="p-6 text-center text-white/40 text-xs">
              No upcoming lifecycle events found.
            </div>
          ) : (
            upcomingItems.map((item) => (
              <div
                key={item.id}
                id={`upcoming-item-${item.id}`}
                onClick={() => onSelectItem(item)}
                className="flex items-center justify-between p-4.5 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform group-hover:border-indigo-400/40">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.iconName || 'description'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {item.title}{' '}
                      {item.maskedNumber && (
                        <span className="font-normal text-white/40 text-xs ml-1">
                          {item.maskedNumber}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-white/40">{item.category || item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.urgencyDays !== undefined ? (
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                      {item.urgencyDays} days
                    </span>
                  ) : item.cost ? (
                    <span className="text-sm font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg">
                      ${item.cost.toFixed(2)}/mo
                    </span>
                  ) : (
                    <span className="bg-white/5 text-white/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Vaulted
                    </span>
                  )}
                  <span className="material-symbols-outlined text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all text-[18px]">
                    chevron_right
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Floating Action Button (+ Add New) for mobile */}
      <div className="fixed bottom-24 right-4 md:hidden z-30">
        <button
          id="mobile-fab-add"
          onClick={onOpenAddModal}
          className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-[0_10px_24px_rgba(99,102,241,0.4)] flex items-center justify-center hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer ring-4 ring-[#0f0f0f] border border-indigo-400/30"
          aria-label="Add New Entry"
          title="Add New Entry"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>
    </main>
  );
};
