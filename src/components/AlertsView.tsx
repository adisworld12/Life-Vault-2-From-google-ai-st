import React, { useState } from 'react';
import { VaultItem } from '../types';
import { sendInstantNotification, requestNotificationPermission } from '../utils/notifications';
import { triggerHaptic } from '../utils/security';

interface AlertsViewProps {
  items: VaultItem[];
  onSelectItem: (item: VaultItem) => void;
  onSnoozeAlert: (item: VaultItem) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  items,
  onSelectItem,
  onSnoozeAlert,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'upcoming'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const urgentItems = items.filter(
    (i) => i.status === 'attention' || (i.urgencyDays !== undefined && i.urgencyDays <= 30)
  );

  const upcomingItems = items.filter(
    (i) => i.status !== 'attention' && i.urgencyDays !== undefined && i.urgencyDays > 30
  );

  const displayItems =
    filter === 'urgent'
      ? urgentItems
      : filter === 'upcoming'
      ? upcomingItems
      : [...urgentItems, ...upcomingItems];

  const handleSnooze = async (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    await triggerHaptic('light');
    onSnoozeAlert(item);
    setToastMessage(`Alert snoozed for 7 days: ${item.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    await triggerHaptic('medium');
    const granted = await requestNotificationPermission();
    if (granted) {
      await sendInstantNotification(
        'LifeVault Security Alert',
        'Your US Passport expires in 28 days. Tap to review your renewal steps.'
      );
      setToastMessage('🔔 Test local notification triggered!');
    } else {
      setToastMessage('⚠️ Notification permission not granted on this device');
    }
    setIsSendingTest(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6 pb-28">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1a1a1a] border border-white/20 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">notifications_active</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Security & Renewal Alerts
          </h1>
          <p className="text-sm text-white/50">
            {urgentItems.length} urgent notices require your review
          </p>
        </div>

        <button
          onClick={handleTestNotification}
          disabled={isSendingTest}
          className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">notifications_active</span>
          {isSendingTest ? 'Sending...' : 'Test Device Notification'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            triggerHaptic('light');
            setFilter('all');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          All ({urgentItems.length + upcomingItems.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setFilter('urgent');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'urgent'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'bg-[#1a1a1a] border border-red-500/30 text-red-400 hover:bg-red-500/10'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">warning</span>
          Attention Needed ({urgentItems.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setFilter('upcoming');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Upcoming ({upcomingItems.length})
        </button>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3.5">
        {displayItems.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-[2rem] p-12 text-center border border-white/5 space-y-3">
            <span className="material-symbols-outlined text-emerald-400 text-[48px]">check_circle</span>
            <h3 className="text-lg font-bold text-white">All Clear</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              You have no active alerts in this category. All your vault documents and subscriptions are up to date!
            </p>
          </div>
        ) : (
          displayItems.map((item) => {
            const isUrgent =
              item.status === 'attention' || (item.urgencyDays !== undefined && item.urgencyDays <= 30);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`bg-[#1a1a1a] rounded-[2rem] p-5 shadow-xl border transition-all cursor-pointer group relative overflow-hidden ${
                  isUrgent ? 'border-red-500/30 hover:border-red-400 bg-[#1f1616]' : 'border-white/5 hover:border-white/20'
                }`}
              >
                {/* Colored Accent Strip */}
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${
                    isUrgent ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-2">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.iconName || 'notifications'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-[10px] text-white/60 font-semibold bg-white/5 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isUrgent
                              ? 'bg-red-500/15 border border-red-500/20 text-red-400'
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isUrgent ? 'timer' : 'event'}
                          </span>
                          {item.urgencyText || (item.expiryDate ? `Expires: ${item.expiryDate}` : 'Upcoming')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => handleSnooze(e, item)}
                      className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-white/70 text-xs font-semibold rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">snooze</span>
                      Snooze
                    </button>
                    <button
                      onClick={() => onSelectItem(item)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Review
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};
