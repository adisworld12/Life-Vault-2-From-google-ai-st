import React, { useState } from 'react';
import { VaultItem } from '../types';

interface SubscriptionDetailProps {
  item: VaultItem;
  onBack: () => void;
  onUpdateItem: (updatedItem: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export const SubscriptionDetail: React.FC<SubscriptionDetailProps> = ({
  item,
  onBack,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [smartReminder, setSmartReminder] = useState(item.smartReminderEnabled ?? true);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleToggleReminder = () => {
    const next = !smartReminder;
    setSmartReminder(next);
    onUpdateItem({
      ...item,
      smartReminderEnabled: next,
    });
    setShowToast(next ? 'Smart reminders enabled (3 days prior)' : 'Smart reminders disabled');
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleManageExternal = () => {
    window.open('https://account.adobe.com/plans', '_blank');
  };

  const handleConfirmCancelTracking = () => {
    onDeleteItem(item.id);
    onBack();
  };

  return (
    <main className="px-4 md:px-6 pt-4 pb-28 max-w-3xl mx-auto space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#1a1a1a] border border-white/20 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{showToast}</span>
        </div>
      )}

      {/* Header Bento Card */}
      <section className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <span className="material-symbols-outlined text-[42px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            palette
          </span>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            {item.title}
          </h1>
          <p className="text-sm text-white/50">{item.subtitle}</p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Active</span>
          </div>
        </div>

        <div className="w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-t-0 md:border-l md:pl-6 text-center md:text-right">
          <div className="text-3xl md:text-4xl font-bold text-indigo-400">
            ${(item.cost ?? 59.99).toFixed(2)}
          </div>
          <div className="text-xs text-white/40">{item.billingCycle || 'Monthly Subscription'}</div>
        </div>
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Renewal Info Card */}
        <section className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 shadow-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-white/50 mb-3">
            <span className="material-symbols-outlined text-[20px] text-indigo-400">calendar_today</span>
            <h2 className="text-base font-bold text-white">Next Renewal</h2>
          </div>
          <div className="text-2xl font-bold text-white my-1">
            {item.nextRenewalText || 'Tomorrow'}
          </div>
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5 mt-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            Payment due soon
          </div>
        </section>

        {/* Smart Reminder Card */}
        <section className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 shadow-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white/50">
                <span className="material-symbols-outlined text-[20px] text-indigo-400">notifications_active</span>
                <h2 className="text-base font-bold text-white">Smart Reminder</h2>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleReminder}
                role="switch"
                aria-checked={smartReminder}
                className={`w-12 h-6.5 rounded-full relative transition-colors duration-200 focus:outline-none cursor-pointer ${
                  smartReminder ? 'bg-indigo-600' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                    smartReminder ? 'left-6.5' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Notify me 3 days before renewal to ensure sufficient funds or review usage.
            </p>
          </div>
        </section>
      </div>

      {/* Billing History */}
      <section className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 shadow-2xl p-6 overflow-hidden">
        <h2 className="text-base font-bold text-white mb-4">Billing History</h2>
        <div className="divide-y divide-white/5">
          {(item.billingHistory && item.billingHistory.length > 0
            ? item.billingHistory
            : [
                {
                  id: 'b1',
                  dateStr: 'Oct 14, 2023',
                  paymentMethod: 'Visa ending in 4242',
                  amount: 59.99,
                  status: 'Paid',
                },
                {
                  id: 'b2',
                  dateStr: 'Sep 14, 2023',
                  paymentMethod: 'Visa ending in 4242',
                  amount: 59.99,
                  status: 'Paid',
                },
              ]
          ).map((receipt) => (
            <div
              key={receipt.id}
              onClick={() => setShowReceiptsModal(true)}
              className="py-3.5 flex justify-between items-center group cursor-pointer hover:bg-white/5 px-3 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{receipt.dateStr}</div>
                  <div className="text-xs text-white/40">{receipt.paymentMethod}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">${receipt.amount.toFixed(2)}</div>
                  <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Paid
                  </div>
                </div>
                <span className="material-symbols-outlined text-white/30 group-hover:text-indigo-400 transition-colors">
                  chevron_right
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          id="view-all-receipts-btn"
          onClick={() => setShowReceiptsModal(true)}
          className="w-full mt-3 py-2 text-xs font-bold text-indigo-400 hover:text-white rounded-full hover:bg-white/5 transition-colors text-center cursor-pointer"
        >
          View all receipts
        </button>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          id="manage-subscription-btn"
          onClick={handleManageExternal}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-full text-sm font-bold flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-98 border border-indigo-400/20"
        >
          Manage Subscription
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
        </button>
        <button
          id="cancel-tracking-btn"
          onClick={() => setShowCancelConfirm(true)}
          className="w-full bg-[#1a1a1a] border border-white/10 hover:border-red-500/40 text-white/60 hover:text-red-400 py-3.5 rounded-full text-sm font-medium hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          Cancel Tracking
        </button>
      </div>

      {/* Receipts Full Modal */}
      {showReceiptsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white">All Receipts</h3>
              <button onClick={() => setShowReceiptsModal(false)} className="text-white/40 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {[
                { date: 'Oct 14, 2023', id: 'INV-48821', amt: '$59.99' },
                { date: 'Sep 14, 2023', id: 'INV-44109', amt: '$59.99' },
                { date: 'Aug 14, 2023', id: 'INV-39812', amt: '$59.99' },
                { date: 'Jul 14, 2023', id: 'INV-35002', amt: '$59.99' },
                { date: 'Jun 14, 2023', id: 'INV-30114', amt: '$59.99' },
              ].map((r, i) => (
                <div key={i} className="p-3 bg-[#141414] rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-white">{r.date}</div>
                    <div className="text-xs text-white/40">{r.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-400">{r.amt}</div>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Paid</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <button
                onClick={() => setShowReceiptsModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Tracking Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-red-500/30 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3 border border-red-500/20">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Stop Tracking?</h3>
            <p className="text-xs text-white/50 mb-5">
              This will remove {item.title} from your LifeVault and stop reminder notifications.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 border border-white/10 rounded-full text-xs font-bold text-white/60 hover:text-white hover:bg-white/5"
              >
                Keep
              </button>
              <button
                onClick={handleConfirmCancelTracking}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-500 shadow-md shadow-red-600/30"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
