import React, { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  VaultItem,
  ActiveTab,
  ActiveView,
  SecurityPreferences,
  UserProfile,
} from './types';
import {
  INITIAL_VAULT_ITEMS,
  INITIAL_SECURITY_PREFERENCES,
  INITIAL_USER_PROFILE,
} from './data/mockData';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeDashboard } from './components/HomeDashboard';
import { DocumentDetail } from './components/DocumentDetail';
import { SubscriptionDetail } from './components/SubscriptionDetail';
import { AddToVaultModal } from './components/AddToVaultModal';
import { ScannerView } from './components/ScannerView';
import { SecuritySettings } from './components/SecuritySettings';
import { VaultView } from './components/VaultView';
import { AlertsView } from './components/AlertsView';
import { SearchModal } from './components/SearchModal';
import { AppLockModal } from './components/AppLockModal';
import {
  scheduleItemNotifications,
  cancelItemNotifications,
  syncAllVaultNotifications,
} from './utils/notifications';
import { setStorageItem, getStorageItem, clearAllStorage } from './services/storageService';
import { triggerHaptic, getAutoLockTimeoutMs } from './utils/security';

const STORAGE_KEY_ITEMS = 'lifevault_items_v2';
const STORAGE_KEY_PREFS = 'lifevault_prefs_v2';
const STORAGE_KEY_PROFILE = 'lifevault_profile_v2';

export default function App() {
  // Vault state
  const [items, setItems] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS) || localStorage.getItem('lifevault_items_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_VAULT_ITEMS;
  });

  // User Profile state
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE) || localStorage.getItem('lifevault_profile_v1');
      if (saved) {
        return {
          ...INITIAL_USER_PROFILE,
          ...JSON.parse(saved),
        };
      }
    } catch {
      // ignore
    }
    return INITIAL_USER_PROFILE;
  });

  // Security preferences
  const [preferences, setPreferences] = useState<SecurityPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS) || localStorage.getItem('lifevault_prefs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SECURITY_PREFERENCES,
          ...parsed,
          notifications: {
            ...INITIAL_SECURITY_PREFERENCES.notifications,
            ...(parsed.notifications || {}),
          },
        };
      }
    } catch {
      // ignore
    }
    return INITIAL_SECURITY_PREFERENCES;
  });

  // App Lock state
  const [isLocked, setIsLocked] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation states
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load preferences and items from Capacitor Storage asynchronously on startup
  useEffect(() => {
    async function loadStoredData() {
      const storedItems = await getStorageItem<VaultItem[] | null>(STORAGE_KEY_ITEMS, null);
      if (storedItems && Array.isArray(storedItems) && storedItems.length > 0) {
        setItems(storedItems);
      }

      const storedProfile = await getStorageItem<UserProfile | null>(STORAGE_KEY_PROFILE, null);
      if (storedProfile) {
        setProfile((prev) => ({ ...prev, ...storedProfile }));
      }

      const storedPrefs = await getStorageItem<SecurityPreferences | null>(STORAGE_KEY_PREFS, null);
      if (storedPrefs) {
        setPreferences((prev) => ({
          ...prev,
          ...storedPrefs,
          notifications: {
            ...prev.notifications,
            ...(storedPrefs.notifications || {}),
          },
        }));
      }
    }
    loadStoredData();
  }, []);

  // Sync to local and Capacitor Preferences
  useEffect(() => {
    setStorageItem(STORAGE_KEY_ITEMS, items);
  }, [items]);

  useEffect(() => {
    setStorageItem(STORAGE_KEY_PREFS, preferences);
  }, [preferences]);

  useEffect(() => {
    setStorageItem(STORAGE_KEY_PROFILE, profile);
  }, [profile]);

  // Sync native OS notifications whenever items or notification preferences change
  useEffect(() => {
    syncAllVaultNotifications(items, preferences.notifications);
  }, [items, preferences.notifications]);

  // Handle Deep Linking from Local Notifications (tapping an alert notification)
  useEffect(() => {
    let notifListenerHandle: { remove: () => Promise<void> | void } | null = null;
    let isMounted = true;

    try {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const extra = notificationAction.notification?.extra;
        if (extra && extra.itemId) {
          const matchedItem = items.find((i) => i.id === extra.itemId);
          if (matchedItem) {
            handleSelectItem(matchedItem);
          } else {
            handleSelectTab('alerts');
          }
        } else {
          handleSelectTab('alerts');
        }
      }).then((handle) => {
        if (isMounted) {
          notifListenerHandle = handle;
        } else if (handle && typeof handle.remove === 'function') {
          handle.remove();
        }
      }).catch(() => {
        // Plugin not available on web
      });
    } catch {
      // not on mobile
    }

    return () => {
      isMounted = false;
      if (notifListenerHandle && typeof notifListenerHandle.remove === 'function') {
        try {
          notifListenerHandle.remove();
        } catch {
          // ignore
        }
      }
    };
  }, [items]);

  // Handle Android Hardware Back Button
  useEffect(() => {
    let backButtonHandle: { remove: () => Promise<void> | void } | null = null;
    let isMounted = true;

    try {
      CapApp.addListener('backButton', () => {
        if (isLocked) {
          return;
        }
        if (isSearchOpen) {
          setIsSearchOpen(false);
          return;
        }
        if (isAddModalOpen) {
          setIsAddModalOpen(false);
          return;
        }
        if (activeView === 'document-detail' || activeView === 'subscription-detail') {
          handleBackToCurrentTab();
          return;
        }
        if (activeView === 'scanner') {
          handleSelectTab('home');
          return;
        }
        if (activeTab !== 'home') {
          handleSelectTab('home');
          return;
        }
        // If on home dashboard with nothing open, exit app on Android
        CapApp.exitApp();
      }).then((handle) => {
        if (isMounted) {
          backButtonHandle = handle;
        } else if (handle && typeof handle.remove === 'function') {
          handle.remove();
        }
      }).catch(() => {
        // Web platform
      });
    } catch {
      // Not on native mobile
    }

    return () => {
      isMounted = false;
      if (backButtonHandle && typeof backButtonHandle.remove === 'function') {
        try {
          backButtonHandle.remove();
        } catch {
          // ignore
        }
      }
    };
  }, [isLocked, isSearchOpen, isAddModalOpen, activeView, activeTab]);

  // Capacitor App State listener (handles auto-lock on app background/foreground)
  useEffect(() => {
    let listenerHandle: { remove: () => Promise<void> | void } | null = null;
    let isMounted = true;

    try {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (!isActive && preferences.appLockEnabled) {
          // App went to background
          const timeout = getAutoLockTimeoutMs(preferences.autoLockTimer || '5 Minutes');
          if (timeout <= 60000) {
            setIsLocked(true);
          }
        }
      }).then((handle) => {
        if (isMounted) {
          listenerHandle = handle;
        } else if (handle && typeof handle.remove === 'function') {
          handle.remove();
        }
      }).catch(() => {
        // Not on mobile capacitor or plugin unavailable
      });
    } catch {
      // not on mobile capacitor
    }

    // Web visibility listener fallback
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && preferences.appLockEnabled) {
        const timeout = getAutoLockTimeoutMs(preferences.autoLockTimer || '5 Minutes');
        if (timeout <= 60000) {
          setIsLocked(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        try {
          listenerHandle.remove();
        } catch {
          // ignore
        }
      }
    };
  }, [preferences.appLockEnabled, preferences.autoLockTimer]);

  // Inactivity auto-lock listener
  useEffect(() => {
    if (!preferences.appLockEnabled || !preferences.autoLockTimer) return;

    const timeoutMs = getAutoLockTimeoutMs(preferences.autoLockTimer);
    if (!isFinite(timeoutMs) || timeoutMs <= 0) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, timeoutMs);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetIdleTimer));

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [preferences.appLockEnabled, preferences.autoLockTimer]);

  // Tab navigation handler
  const handleSelectTab = (tab: ActiveTab) => {
    triggerHaptic('light');
    setActiveTab(tab);
    setActiveView(tab);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Item click handler
  const handleSelectItem = (item: VaultItem) => {
    triggerHaptic('light');
    setSelectedItem(item);
    if (item.type === 'subscription') {
      setActiveView('subscription-detail');
    } else {
      setActiveView('document-detail');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back from detail view
  const handleBackToCurrentTab = () => {
    triggerHaptic('light');
    setActiveView(activeTab);
    setSelectedItem(null);
  };

  // Item update handler
  const handleUpdateItem = async (updatedItem: VaultItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
    await scheduleItemNotifications(updatedItem);
    await triggerHaptic('success');
  };

  // Item deletion handler
  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
      setActiveView(activeTab);
    }
    await cancelItemNotifications(id);
    await triggerHaptic('medium');
  };

  // Add item handler
  const handleAddItem = async (newItem: VaultItem) => {
    setItems((prev) => [newItem, ...prev]);
    await scheduleItemNotifications(newItem);
    handleSelectItem(newItem);
  };

  // Reset all data
  const handleResetAllData = async () => {
    await clearAllStorage();
    setItems(INITIAL_VAULT_ITEMS);
    setPreferences(INITIAL_SECURITY_PREFERENCES);
    setProfile(INITIAL_USER_PROFILE);
    setActiveTab('home');
    setActiveView('home');
    setSelectedItem(null);
    await triggerHaptic('warning');
  };

  // Snooze alert handler
  const handleSnoozeAlert = async (itemToSnooze: VaultItem) => {
    const updated: VaultItem = {
      ...itemToSnooze,
      urgencyDays: (itemToSnooze.urgencyDays ?? 24) + 7,
      urgencyText: `Snoozed (${(itemToSnooze.urgencyDays ?? 24) + 7} days)`,
    };
    await handleUpdateItem(updated);
  };

  // Calculate urgent alert count
  const alertCount = items.filter(
    (i) => i.status === 'attention' || (i.urgencyDays !== undefined && i.urgencyDays <= 30)
  ).length;

  // Compute TopBar title
  let topBarTitle: string | undefined = undefined;
  if (activeView === 'subscription-detail') {
    topBarTitle = 'Subscription Detail';
  } else if (activeView === 'document-detail') {
    topBarTitle = 'LifeVault';
  } else if (activeView === 'vault') {
    topBarTitle = 'LifeVault';
  } else if (activeView === 'alerts') {
    topBarTitle = 'LifeVault';
  } else if (activeView === 'profile') {
    topBarTitle = 'LifeVault';
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white md:pl-64 flex flex-col transition-all selection:bg-indigo-500 selection:text-white">
      {/* App Lock Screen Modal */}
      <AppLockModal
        isLocked={isLocked}
        correctPin={preferences.pinCode || '1234'}
        biometricEnabled={preferences.biometricEnabled}
        onUnlock={() => setIsLocked(false)}
      />

      {/* Top App Bar */}
      <TopAppBar
        activeView={activeView}
        onNavigateTab={handleSelectTab}
        onOpenSearch={() => {
          triggerHaptic('light');
          setIsSearchOpen(true);
        }}
        onBack={handleBackToCurrentTab}
        title={topBarTitle}
        avatarUrl={profile.avatarUrl}
      />

      {/* Main Content Render */}
      <div className="flex-1">
        {activeView === 'home' && (
          <HomeDashboard
            items={items}
            onSelectItem={handleSelectItem}
            onViewAllUpcoming={() => handleSelectTab('vault')}
            onOpenAddModal={() => {
              triggerHaptic('light');
              setIsAddModalOpen(true);
            }}
            userName={profile.name}
          />
        )}

        {activeView === 'vault' && (
          <VaultView
            items={items}
            onSelectItem={handleSelectItem}
            onOpenAddModal={() => {
              triggerHaptic('light');
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeView === 'scanner' && (
          <ScannerView
            onScanComplete={(scannedItem) => {
              handleAddItem(scannedItem);
            }}
            onCancel={() => handleSelectTab('home')}
          />
        )}

        {activeView === 'alerts' && (
          <AlertsView
            items={items}
            onSelectItem={handleSelectItem}
            onSnoozeAlert={handleSnoozeAlert}
          />
        )}

        {activeView === 'profile' && (
          <SecuritySettings
            profile={profile}
            onUpdateProfile={(updatedProfile) => {
              setProfile(updatedProfile);
              triggerHaptic('success');
            }}
            preferences={preferences}
            onUpdatePreferences={(updatedPrefs) => {
              setPreferences(updatedPrefs);
              triggerHaptic('success');
            }}
            onResetAllData={handleResetAllData}
            vaultItems={items}
          />
        )}

        {activeView === 'document-detail' && selectedItem && (
          <DocumentDetail
            item={selectedItem}
            onBack={handleBackToCurrentTab}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeView === 'subscription-detail' && selectedItem && (
          <SubscriptionDetail
            item={selectedItem}
            onBack={handleBackToCurrentTab}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
      </div>

      {/* Bottom Nav Bar (Mobile) & Desktop Sidebar Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAddModal={() => {
          triggerHaptic('light');
          setIsAddModalOpen(true);
        }}
        alertCount={alertCount}
      />

      {/* Add To Vault Modal / Bottom Sheet */}
      <AddToVaultModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        onStartScan={() => {
          setIsAddModalOpen(false);
          handleSelectTab('scanner');
        }}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={items}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}

